import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Play, 
  Clock, 
  Users, 
  Star, 
  Award,
  BookOpen,
  Heart,
  Share2,
  ChevronDown,
  ChevronUp,
  User,
  Calendar,
  Globe,
  CheckCircle
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { mockCourses } from '../../utils/mockData';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';

interface CourseSection {
  id: string;
  title: string;
  lessons: {
    id: string;
    title: string;
    duration: number;
    type: 'video' | 'text' | 'quiz';
    preview?: boolean;
  }[];
}

interface Review {
  id: string;
  user: {
    name: string;
    avatar?: string;
  };
  rating: number;
  comment: string;
  date: string;
}

const CourseDetailPage: React.FC = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [course, setCourse] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [isEnrolled, setIsEnrolled] = useState(false);

  // Mock course sections
  const mockSections: CourseSection[] = [
    {
      id: '1',
      title: 'Getting Started',
      lessons: [
        { id: '1', title: 'Course Introduction', duration: 5, type: 'video', preview: true },
        { id: '2', title: 'Setting Up Your Environment', duration: 15, type: 'video', preview: true },
        { id: '3', title: 'Course Resources', duration: 3, type: 'text' }
      ]
    },
    {
      id: '2',
      title: 'React Fundamentals',
      lessons: [
        { id: '4', title: 'What is React?', duration: 12, type: 'video' },
        { id: '5', title: 'JSX Syntax', duration: 18, type: 'video' },
        { id: '6', title: 'Components and Props', duration: 25, type: 'video' },
        { id: '7', title: 'Knowledge Check', duration: 10, type: 'quiz' }
      ]
    },
    {
      id: '3',
      title: 'State and Lifecycle',
      lessons: [
        { id: '8', title: 'Understanding State', duration: 20, type: 'video' },
        { id: '9', title: 'Event Handling', duration: 15, type: 'video' },
        { id: '10', title: 'Lifecycle Methods', duration: 22, type: 'video' }
      ]
    }
  ];

  // Mock reviews
  const mockReviews: Review[] = [
    {
      id: '1',
      user: { name: 'Sarah Johnson', avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150' },
      rating: 5,
      comment: 'Excellent course! The instructor explains everything clearly and the projects are very practical.',
      date: '2024-01-20'
    },
    {
      id: '2',
      user: { name: 'Mike Chen' },
      rating: 4,
      comment: 'Great content and well-structured. Would recommend to anyone starting with React.',
      date: '2024-01-18'
    },
    {
      id: '3',
      user: { name: 'Emma Davis', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150' },
      rating: 5,
      comment: 'This course helped me land my first React developer job. Thank you!',
      date: '2024-01-15'
    }
  ];

  useEffect(() => {
    const fetchCourse = async () => {
      setLoading(true);
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        const foundCourse = mockCourses.find(c => c.id === courseId);
        if (foundCourse) {
          setCourse(foundCourse);
          // Check if user is enrolled (mock)
          setIsEnrolled(Math.random() > 0.7);
          setIsWishlisted(Math.random() > 0.5);
        } else {
          navigate('/courses');
        }
      } catch (error) {
        console.error('Failed to fetch course:', error);
        navigate('/courses');
      } finally {
        setLoading(false);
      }
    };

    if (courseId) {
      fetchCourse();
    }
  }, [courseId, navigate]);

  const toggleSection = (sectionId: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(sectionId)) {
      newExpanded.delete(sectionId);
    } else {
      newExpanded.add(sectionId);
    }
    setExpandedSections(newExpanded);
  };

  const handleEnroll = () => {
    if (!user) {
      navigate('/login');
      return;
    }
    // Implement enrollment logic
    setIsEnrolled(true);
    console.log('Enrolling in course:', courseId);
  };

  const handleWishlist = () => {
    if (!user) {
      navigate('/login');
      return;
    }
    setIsWishlisted(!isWishlisted);
    console.log('Toggling wishlist for course:', courseId);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: course?.title,
        text: course?.description,
        url: window.location.href
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      // Show toast notification
    }
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    
    if (hours > 0 && remainingMinutes > 0) {
      return `${hours}h ${remainingMinutes}m`;
    } else if (hours > 0) {
      return `${hours}h`;
    } else {
      return `${remainingMinutes}m`;
    }
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${
          i < Math.floor(rating)
            ? 'text-yellow-400 fill-current'
            : 'text-gray-300 dark:text-gray-600'
        }`}
      />
    ));
  };

  const totalLessons = mockSections.reduce((total, section) => total + section.lessons.length, 0);
  const totalDuration = mockSections.reduce((total, section) => 
    total + section.lessons.reduce((sectionTotal, lesson) => sectionTotal + lesson.duration, 0), 0
  );

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded-xl mb-6"></div>
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-4"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="text-center py-12">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Course not found</h1>
        <Button onClick={() => navigate('/courses')} className="mt-4">
          Back to Courses
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Course Header */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          {/* Course Video/Image */}
          <div className="relative aspect-video bg-gray-900 rounded-xl overflow-hidden mb-6">
            <img
              src={course.thumbnail}
              alt={course.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
              <Button
                variant="primary"
                size="lg"
                className="shadow-lg"
              >
                <Play className="w-6 h-6 mr-2 fill-current" />
                Preview Course
              </Button>
            </div>
          </div>

          {/* Course Info */}
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <span className="px-3 py-1 bg-primary-100 dark:bg-primary-900/20 text-primary-700 dark:text-primary-400 rounded-full text-sm font-medium">
                {course.category}
              </span>
              <span className="px-3 py-1 bg-secondary-100 dark:bg-secondary-900/20 text-secondary-700 dark:text-secondary-400 rounded-full text-sm font-medium">
                {course.level}
              </span>
            </div>

            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              {course.title}
            </h1>

            <p className="text-lg text-gray-600 dark:text-gray-300 mb-6">
              {course.description}
            </p>

            {/* Course Stats */}
            <div className="flex items-center space-x-6 mb-6">
              <div className="flex items-center space-x-2">
                <div className="flex items-center space-x-1">
                  {renderStars(course.rating)}
                </div>
                <span className="font-medium text-gray-900 dark:text-white">
                  {course.rating.toFixed(1)}
                </span>
                <span className="text-gray-600 dark:text-gray-400">
                  ({course.reviewCount} reviews)
                </span>
              </div>
              <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-400">
                <Users className="w-4 h-4" />
                <span>{course.enrolledCount} students</span>
              </div>
              <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-400">
                <Clock className="w-4 h-4" />
                <span>{formatDuration(totalDuration)}</span>
              </div>
            </div>

            {/* Instructor */}
            <div className="flex items-center space-x-4 mb-8">
              <div className="w-12 h-12 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center">
                {course.instructor.avatar ? (
                  <img
                    src={course.instructor.avatar}
                    alt={course.instructor.firstName}
                    className="w-full h-full object-cover rounded-full"
                  />
                ) : (
                  <User className="w-6 h-6 text-gray-600 dark:text-gray-300" />
                )}
              </div>
              <div>
                <p className="font-medium text-gray-900 dark:text-white">
                  {course.instructor.firstName} {course.instructor.lastName}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Course Instructor
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Enrollment Card */}
        <div className="lg:col-span-1">
          <Card className="p-6 sticky top-6">
            <div className="text-center mb-6">
              <div className="text-3xl font-bold text-primary-600 dark:text-primary-400 mb-2">
                {course.price === 0 ? 'Free' : `$${course.price}`}
              </div>
              {course.originalPrice && course.originalPrice > course.price && (
                <div className="text-lg text-gray-500 line-through">
                  ${course.originalPrice}
                </div>
              )}
            </div>

            <div className="space-y-4 mb-6">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">Total lessons</span>
                <span className="font-medium text-gray-900 dark:text-white">{totalLessons}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">Duration</span>
                <span className="font-medium text-gray-900 dark:text-white">{formatDuration(totalDuration)}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">Level</span>
                <span className="font-medium text-gray-900 dark:text-white">{course.level}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">Certificate</span>
                <div className="flex items-center space-x-1">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span className="font-medium text-gray-900 dark:text-white">Yes</span>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              {isEnrolled ? (
                <Button variant="primary" className="w-full" size="lg">
                  Continue Learning
                </Button>
              ) : (
                <Button variant="primary" className="w-full" size="lg" onClick={handleEnroll}>
                  Enroll Now
                </Button>
              )}
              
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={handleWishlist}
                >
                  <Heart className={`w-4 h-4 mr-2 ${isWishlisted ? 'fill-current text-red-500' : ''}`} />
                  {isWishlisted ? 'Wishlisted' : 'Add to Wishlist'}
                </Button>
                <Button variant="outline" onClick={handleShare}>
                  <Share2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Course Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* What You'll Learn */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              What You'll Learn
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {[
                'Build modern React applications from scratch',
                'Master React hooks and state management',
                'Create reusable components and custom hooks',
                'Implement routing with React Router',
                'Handle forms and user input validation',
                'Deploy React applications to production'
              ].map((item, index) => (
                <div key={index} className="flex items-start space-x-2">
                  <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700 dark:text-gray-300">{item}</span>
                </div>
              ))}
            </div>
          </Card>

          {/* Course Content */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Course Content
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {mockSections.length} sections • {totalLessons} lessons • {formatDuration(totalDuration)} total length
            </p>
            
            <div className="space-y-2">
              {mockSections.map((section) => (
                <div key={section.id} className="border border-gray-200 dark:border-gray-700 rounded-lg">
                  <button
                    onClick={() => toggleSection(section.id)}
                    className="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg"
                  >
                    <div>
                      <h3 className="font-medium text-gray-900 dark:text-white">
                        {section.title}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {section.lessons.length} lessons • {formatDuration(
                          section.lessons.reduce((total, lesson) => total + lesson.duration, 0)
                        )}
                      </p>
                    </div>
                    {expandedSections.has(section.id) ? (
                      <ChevronUp className="w-5 h-5 text-gray-400" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-gray-400" />
                    )}
                  </button>
                  
                  {expandedSections.has(section.id) && (
                    <div className="px-4 pb-3">
                      {section.lessons.map((lesson) => (
                        <div key={lesson.id} className="flex items-center justify-between py-2 pl-4">
                          <div className="flex items-center space-x-3">
                            <Play className="w-4 h-4 text-gray-400" />
                            <span className="text-sm text-gray-700 dark:text-gray-300">
                              {lesson.title}
                            </span>
                            {lesson.preview && (
                              <span className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 text-xs rounded">
                                Preview
                              </span>
                            )}
                          </div>
                          <span className="text-sm text-gray-500 dark:text-gray-400">
                            {formatDuration(lesson.duration)}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </Card>

          {/* Reviews */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
              Student Reviews
            </h2>
            
            <div className="space-y-6">
              {mockReviews.map((review) => (
                <div key={review.id} className="flex space-x-4">
                  <div className="w-10 h-10 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center flex-shrink-0">
                    {review.user.avatar ? (
                      <img
                        src={review.user.avatar}
                        alt={review.user.name}
                        className="w-full h-full object-cover rounded-full"
                      />
                    ) : (
                      <User className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <h4 className="font-medium text-gray-900 dark:text-white">
                        {review.user.name}
                      </h4>
                      <div className="flex items-center space-x-1">
                        {renderStars(review.rating)}
                      </div>
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        {new Date(review.date).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-gray-700 dark:text-gray-300">
                      {review.comment}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1">
          {/* Requirements */}
          <Card className="p-6 mb-6">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
              Requirements
            </h3>
            <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
              <li>• Basic understanding of HTML and CSS</li>
              <li>• JavaScript fundamentals</li>
              <li>• A computer with internet connection</li>
              <li>• Willingness to learn and practice</li>
            </ul>
          </Card>

          {/* Tags */}
          <Card className="p-6">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
              Tags
            </h3>
            <div className="flex flex-wrap gap-2">
              {course.tags.map((tag: string) => (
                <span
                  key={tag}
                  className="px-3 py-1 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-full text-sm"
                >
                  {tag}
                </span>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CourseDetailPage;
