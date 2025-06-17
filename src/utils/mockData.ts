import { User, Course, Enrollment, Comment, Wishlist } from '../types';

// Mock Users
export const mockUsers: User[] = [
  {
    id: '1',
    email: 'john.doe@example.com',
    firstName: 'John',
    lastName: 'Doe',
    role: 'STUDENT',
    avatar: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=150',
    isApproved: true,
    createdAt: '2024-01-15T10:00:00Z',
  },
  {
    id: '2',
    email: 'sarah.wilson@example.com',
    firstName: 'Sarah',
    lastName: 'Wilson',
    role: 'INSTRUCTOR',
    avatar: 'https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg?auto=compress&cs=tinysrgb&w=150',
    isApproved: true,
    createdAt: '2024-01-10T10:00:00Z',
  },
  {
    id: '3',
    email: 'admin@eduflow.com',
    firstName: 'Admin',
    lastName: 'User',
    role: 'ADMIN',
    avatar: 'https://images.pexels.com/photos/697509/pexels-photo-697509.jpeg?auto=compress&cs=tinysrgb&w=150',
    isApproved: true,
    createdAt: '2024-01-01T10:00:00Z',
  },
];

// Mock Courses
export const mockCourses: Course[] = [
  {
    id: '1',
    title: 'Complete React Development Bootcamp',
    description: 'Master React from basics to advanced concepts including hooks, context, and modern patterns. Build real-world projects and learn best practices.',
    thumbnail: 'https://images.pexels.com/photos/11035471/pexels-photo-11035471.jpeg?auto=compress&cs=tinysrgb&w=800',
    price: 89.99,
    category: 'Web Development',
    level: 'INTERMEDIATE',
    duration: 2400, // 40 hours
    rating: 4.8,
    totalRatings: 1247,
    enrolledCount: 5632,
    instructor: mockUsers[1],
    lessons: [
      {
        id: '1-1',
        title: 'Introduction to React',
        description: 'Get started with React fundamentals',
        videoUrl: 'https://example.com/video1',
        duration: 45,
        order: 1,
        courseId: '1',
        isPreview: true,
      },
      {
        id: '1-2',
        title: 'Components and JSX',
        description: 'Learn about React components and JSX syntax',
        videoUrl: 'https://example.com/video2',
        duration: 60,
        order: 2,
        courseId: '1',
        isPreview: false,
      },
    ],
    tags: ['React', 'JavaScript', 'Frontend', 'Web Development'],
    createdAt: '2024-02-01T10:00:00Z',
    updatedAt: '2024-02-15T10:00:00Z',
  },
  {
    id: '2',
    title: 'Advanced Python Programming',
    description: 'Deep dive into Python programming with advanced concepts, design patterns, and real-world applications.',
    thumbnail: 'https://images.pexels.com/photos/1181271/pexels-photo-1181271.jpeg?auto=compress&cs=tinysrgb&w=800',
    price: 79.99,
    category: 'Programming',
    level: 'ADVANCED',
    duration: 1800, // 30 hours
    rating: 4.9,
    totalRatings: 892,
    enrolledCount: 3241,
    instructor: mockUsers[1],
    lessons: [
      {
        id: '2-1',
        title: 'Python Decorators',
        description: 'Master Python decorators and their applications',
        videoUrl: 'https://example.com/video3',
        duration: 50,
        order: 1,
        courseId: '2',
        isPreview: true,
      },
    ],
    tags: ['Python', 'Programming', 'Backend', 'Advanced'],
    createdAt: '2024-01-20T10:00:00Z',
    updatedAt: '2024-02-10T10:00:00Z',
  },
  {
    id: '3',
    title: 'UI/UX Design Fundamentals',
    description: 'Learn the principles of user interface and user experience design. Create beautiful and functional designs.',
    thumbnail: 'https://images.pexels.com/photos/196644/pexels-photo-196644.jpeg?auto=compress&cs=tinysrgb&w=800',
    price: 59.99,
    category: 'Design',
    level: 'BEGINNER',
    duration: 1200, // 20 hours
    rating: 4.7,
    totalRatings: 654,
    enrolledCount: 2187,
    instructor: mockUsers[1],
    lessons: [
      {
        id: '3-1',
        title: 'Design Principles',
        description: 'Learn fundamental design principles',
        videoUrl: 'https://example.com/video4',
        duration: 40,
        order: 1,
        courseId: '3',
        isPreview: true,
      },
    ],
    tags: ['UI/UX', 'Design', 'Figma', 'Creative'],
    createdAt: '2024-01-25T10:00:00Z',
    updatedAt: '2024-02-05T10:00:00Z',
  },
];

// Mock Enrollments
export const mockEnrollments: Enrollment[] = [
  {
    id: '1',
    userId: '1',
    courseId: '1',
    progress: 35,
    completedLessons: ['1-1'],
    enrolledAt: '2024-02-10T10:00:00Z',
  },
  {
    id: '2',
    userId: '1',
    courseId: '3',
    progress: 80,
    completedLessons: ['3-1'],
    enrolledAt: '2024-01-28T10:00:00Z',
  },
];

// Mock Wishlist
export const mockWishlist: Wishlist[] = [
  {
    id: '1',
    userId: '1',
    courseId: '2',
    course: mockCourses[1],
    addedAt: '2024-02-08T10:00:00Z',
  },
];

// Mock Comments
export const mockComments: Comment[] = [
  {
    id: '1',
    content: 'This course is amazing! Really helped me understand React concepts.',
    rating: 5,
    userId: '1',
    user: mockUsers[0],
    courseId: '1',
    replies: [
      {
        id: '2',
        content: 'I agree! The instructor explains everything very clearly.',
        userId: '1',
        user: mockUsers[0],
        courseId: '1',
        parentId: '1',
        replies: [],
        createdAt: '2024-02-12T10:00:00Z',
        updatedAt: '2024-02-12T10:00:00Z',
      },
    ],
    createdAt: '2024-02-11T10:00:00Z',
    updatedAt: '2024-02-11T10:00:00Z',
  },
];