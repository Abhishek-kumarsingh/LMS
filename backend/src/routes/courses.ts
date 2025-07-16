import express from 'express';
import { body, query, validationResult } from 'express-validator';
import { PrismaClient } from '@prisma/client';
import { logger } from '../utils/logger';
import { requireRole } from '../middleware/roleCheck';

const router = express.Router();
const prisma = new PrismaClient();

// Get all courses (with filtering and pagination)
router.get('/', [
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('search').optional().isString(),
  query('category').optional().isString(),
  query('level').optional().isString(),
  query('status').optional().isIn(['DRAFT', 'PUBLISHED', 'ARCHIVED'])
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const search = req.query.search as string;
    const category = req.query.category as string;
    const level = req.query.level as string;
    const status = req.query.status as string;

    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {};
    
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { code: { contains: search, mode: 'insensitive' } }
      ];
    }

    if (category) {
      where.category = category;
    }

    if (level) {
      where.level = level;
    }

    if (status) {
      where.status = status;
    } else {
      // Default to published courses for students
      if (req.user.role === 'STUDENT') {
        where.status = 'PUBLISHED';
        where.isPublished = true;
      }
    }

    // Get courses with pagination
    const [courses, total] = await Promise.all([
      prisma.course.findMany({
        where,
        skip,
        take: limit,
        include: {
          instructor: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              avatar: true
            }
          },
          enrollments: {
            where: { userId: req.user.id },
            select: {
              id: true,
              enrolledAt: true,
              progress: true,
              status: true
            }
          },
          _count: {
            select: {
              enrollments: true,
              lessons: true,
              assignments: true
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.course.count({ where })
    ]);

    const totalPages = Math.ceil(total / limit);

    res.json({
      courses: courses.map(course => ({
        ...course,
        isEnrolled: course.enrollments.length > 0,
        enrollment: course.enrollments[0] || null,
        studentCount: course._count.enrollments,
        lessonCount: course._count.lessons,
        assignmentCount: course._count.assignments
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    });
  } catch (error) {
    logger.error('Get courses error:', error);
    res.status(500).json({
      error: 'Internal server error'
    });
  }
});

// Get single course
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const course = await prisma.course.findUnique({
      where: { id },
      include: {
        instructor: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true,
            bio: true
          }
        },
        lessons: {
          orderBy: { order: 'asc' },
          select: {
            id: true,
            title: true,
            description: true,
            order: true,
            duration: true,
            isPublished: true,
            progress: {
              where: { userId: req.user.id },
              select: {
                completed: true,
                timeSpent: true,
                lastAccessed: true
              }
            }
          }
        },
        assignments: {
          orderBy: { dueDate: 'asc' },
          select: {
            id: true,
            title: true,
            description: true,
            dueDate: true,
            maxPoints: true,
            submissions: {
              where: { studentId: req.user.id },
              select: {
                id: true,
                submittedAt: true,
                status: true,
                grade: {
                  select: {
                    points: true,
                    maxPoints: true,
                    feedback: true
                  }
                }
              }
            }
          }
        },
        enrollments: {
          where: { userId: req.user.id },
          select: {
            id: true,
            enrolledAt: true,
            progress: true,
            status: true
          }
        },
        _count: {
          select: {
            enrollments: true,
            lessons: true,
            assignments: true
          }
        }
      }
    });

    if (!course) {
      return res.status(404).json({
        error: 'Course not found'
      });
    }

    // Check access permissions
    const isEnrolled = course.enrollments.length > 0;
    const isInstructor = course.instructorId === req.user.id;
    const isAdmin = req.user.role === 'ADMIN';

    if (!course.isPublished && !isInstructor && !isAdmin) {
      return res.status(403).json({
        error: 'Course not available'
      });
    }

    res.json({
      ...course,
      isEnrolled,
      isInstructor,
      enrollment: course.enrollments[0] || null,
      studentCount: course._count.enrollments,
      lessonCount: course._count.lessons,
      assignmentCount: course._count.assignments
    });
  } catch (error) {
    logger.error('Get course error:', error);
    res.status(500).json({
      error: 'Internal server error'
    });
  }
});

// Create course (instructors and admins only)
router.post('/', requireRole(['INSTRUCTOR', 'ADMIN']), [
  body('title').trim().isLength({ min: 1 }),
  body('description').trim().isLength({ min: 1 }),
  body('code').trim().isLength({ min: 1 }),
  body('category').trim().isLength({ min: 1 }),
  body('level').trim().isLength({ min: 1 }),
  body('duration').isInt({ min: 1 }),
  body('price').optional().isFloat({ min: 0 }),
  body('maxStudents').optional().isInt({ min: 1 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const {
      title,
      description,
      code,
      category,
      level,
      duration,
      price = 0,
      currency = 'USD',
      thumbnail,
      maxStudents,
      startDate,
      endDate
    } = req.body;

    // Check if code already exists
    const existingCourse = await prisma.course.findUnique({
      where: { code }
    });

    if (existingCourse) {
      return res.status(409).json({
        error: 'Course code already exists'
      });
    }

    const course = await prisma.course.create({
      data: {
        title,
        description,
        code,
        category,
        level,
        duration,
        price,
        currency,
        thumbnail,
        maxStudents,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        instructorId: req.user.id
      },
      include: {
        instructor: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true
          }
        }
      }
    });

    logger.info(`Course created: ${course.title} by ${req.user.email}`);

    res.status(201).json(course);
  } catch (error) {
    logger.error('Create course error:', error);
    res.status(500).json({
      error: 'Internal server error'
    });
  }
});

// Update course
router.put('/:id', requireRole(['INSTRUCTOR', 'ADMIN']), [
  body('title').optional().trim().isLength({ min: 1 }),
  body('description').optional().trim().isLength({ min: 1 }),
  body('category').optional().trim().isLength({ min: 1 }),
  body('level').optional().trim().isLength({ min: 1 }),
  body('duration').optional().isInt({ min: 1 }),
  body('price').optional().isFloat({ min: 0 }),
  body('maxStudents').optional().isInt({ min: 1 })
], async (req, res) => {
  try {
    const { id } = req.params;

    // Check if course exists and user has permission
    const existingCourse = await prisma.course.findUnique({
      where: { id }
    });

    if (!existingCourse) {
      return res.status(404).json({
        error: 'Course not found'
      });
    }

    if (existingCourse.instructorId !== req.user.id && req.user.role !== 'ADMIN') {
      return res.status(403).json({
        error: 'Not authorized to update this course'
      });
    }

    const updateData: any = {};
    const allowedFields = [
      'title', 'description', 'category', 'level', 'duration',
      'price', 'currency', 'thumbnail', 'maxStudents', 'startDate', 'endDate'
    ];

    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        if (field === 'startDate' || field === 'endDate') {
          updateData[field] = req.body[field] ? new Date(req.body[field]) : null;
        } else {
          updateData[field] = req.body[field];
        }
      }
    });

    const course = await prisma.course.update({
      where: { id },
      data: updateData,
      include: {
        instructor: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true
          }
        }
      }
    });

    logger.info(`Course updated: ${course.title} by ${req.user.email}`);

    res.json(course);
  } catch (error) {
    logger.error('Update course error:', error);
    res.status(500).json({
      error: 'Internal server error'
    });
  }
});

// Publish/unpublish course
router.patch('/:id/publish', requireRole(['INSTRUCTOR', 'ADMIN']), async (req, res) => {
  try {
    const { id } = req.params;
    const { isPublished } = req.body;

    const course = await prisma.course.findUnique({
      where: { id }
    });

    if (!course) {
      return res.status(404).json({
        error: 'Course not found'
      });
    }

    if (course.instructorId !== req.user.id && req.user.role !== 'ADMIN') {
      return res.status(403).json({
        error: 'Not authorized to publish this course'
      });
    }

    const updatedCourse = await prisma.course.update({
      where: { id },
      data: {
        isPublished: Boolean(isPublished),
        status: Boolean(isPublished) ? 'PUBLISHED' : 'DRAFT'
      }
    });

    logger.info(`Course ${isPublished ? 'published' : 'unpublished'}: ${course.title}`);

    res.json(updatedCourse);
  } catch (error) {
    logger.error('Publish course error:', error);
    res.status(500).json({
      error: 'Internal server error'
    });
  }
});

// Enroll in course
router.post('/:id/enroll', async (req, res) => {
  try {
    const { id } = req.params;

    const course = await prisma.course.findUnique({
      where: { id },
      include: {
        _count: {
          select: { enrollments: true }
        }
      }
    });

    if (!course) {
      return res.status(404).json({
        error: 'Course not found'
      });
    }

    if (!course.isPublished) {
      return res.status(400).json({
        error: 'Course is not available for enrollment'
      });
    }

    if (course.maxStudents && course._count.enrollments >= course.maxStudents) {
      return res.status(400).json({
        error: 'Course is full'
      });
    }

    // Check if already enrolled
    const existingEnrollment = await prisma.courseEnrollment.findUnique({
      where: {
        userId_courseId: {
          userId: req.user.id,
          courseId: id
        }
      }
    });

    if (existingEnrollment) {
      return res.status(409).json({
        error: 'Already enrolled in this course'
      });
    }

    const enrollment = await prisma.courseEnrollment.create({
      data: {
        userId: req.user.id,
        courseId: id
      },
      include: {
        course: {
          select: {
            title: true,
            instructor: {
              select: {
                firstName: true,
                lastName: true
              }
            }
          }
        }
      }
    });

    logger.info(`User enrolled: ${req.user.email} in ${course.title}`);

    res.status(201).json(enrollment);
  } catch (error) {
    logger.error('Enroll course error:', error);
    res.status(500).json({
      error: 'Internal server error'
    });
  }
});

// Unenroll from course
router.delete('/:id/enroll', async (req, res) => {
  try {
    const { id } = req.params;

    const enrollment = await prisma.courseEnrollment.findUnique({
      where: {
        userId_courseId: {
          userId: req.user.id,
          courseId: id
        }
      }
    });

    if (!enrollment) {
      return res.status(404).json({
        error: 'Not enrolled in this course'
      });
    }

    await prisma.courseEnrollment.delete({
      where: {
        userId_courseId: {
          userId: req.user.id,
          courseId: id
        }
      }
    });

    logger.info(`User unenrolled: ${req.user.email} from course ${id}`);

    res.json({
      message: 'Successfully unenrolled from course'
    });
  } catch (error) {
    logger.error('Unenroll course error:', error);
    res.status(500).json({
      error: 'Internal server error'
    });
  }
});

// Delete course
router.delete('/:id', requireRole(['INSTRUCTOR', 'ADMIN']), async (req, res) => {
  try {
    const { id } = req.params;

    const course = await prisma.course.findUnique({
      where: { id },
      include: {
        _count: {
          select: { enrollments: true }
        }
      }
    });

    if (!course) {
      return res.status(404).json({
        error: 'Course not found'
      });
    }

    if (course.instructorId !== req.user.id && req.user.role !== 'ADMIN') {
      return res.status(403).json({
        error: 'Not authorized to delete this course'
      });
    }

    if (course._count.enrollments > 0) {
      return res.status(400).json({
        error: 'Cannot delete course with enrolled students'
      });
    }

    await prisma.course.delete({
      where: { id }
    });

    logger.info(`Course deleted: ${course.title} by ${req.user.email}`);

    res.json({
      message: 'Course deleted successfully'
    });
  } catch (error) {
    logger.error('Delete course error:', error);
    res.status(500).json({
      error: 'Internal server error'
    });
  }
});

export default router;
