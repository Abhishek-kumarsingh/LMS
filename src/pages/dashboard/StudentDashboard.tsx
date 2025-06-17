import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  BookOpen, 
  Clock, 
  Award, 
  TrendingUp,
  Play,
  Heart,
  Star
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useAppStore } from '../../store/appStore';
import { mockCourses, mockEnrollments } from '../../utils/mockData';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import CourseCard from '../../components/course/CourseCard';

const StudentDashboard: React.FC = () => {
  const { user } = useAuthStore();
  const { wishlist } = useAppStore();

  const enrolledCourses = mockCourses.filter(course =>
    mockEnrollments.some(enrollment => 
      enrollment.courseId === course.id && enrollment.userId === user?.id
    )
  );

  const stats = [
    {
      title: 'Enrolled Courses',
      value: enrolledCourses.length,
      icon: BookOpen,
      color: 'text-primary-600',
      bgColor: 'bg-primary-100',
    },
    {
      title: 'Learning Hours',
      value: '47h',
      icon: Clock,
      color: 'text-secondary-600',
      bgColor: 'bg-secondary-100',
    },
    {
      title: 'Certificates',
      value: '2',
      icon: Award,
      color: 'text-accent-600',
      bgColor: 'bg-accent-100',
    },
    {
      title: 'Wishlist',
      value: wishlist.length,
      icon: Heart,
      color: 'text-error-600',
      bgColor: 'bg-error-100',
    },
  ];

  const recentActivity = [
    {
      id: '1',
      type: 'course_progress',
      title: 'Completed lesson: Components and JSX',
      course: 'Complete React Development Bootcamp',
      time: '2 hours ago',
      icon: Play,
    },
    {
      id: '2',
      type: 'course_completed',
      title: 'Course completed: UI/UX Design Fundamentals',
      course: 'UI/UX Design Fundamentals',
      time: '1 day ago',
      icon: Award,
    },
    {
      id: '3',
      type: 'course_enrolled',
      title: 'Enrolled in new course',
      course: 'Complete React Development Bootcamp',
      time: '3 days ago',
      icon: BookOpen,
    },
  ];

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Welcome back, {user?.firstName}! 👋
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Continue your learning journey
          </p>
        </div>
        <Button variant="primary" className="mt-4 sm:mt-0">
          <BookOpen className="w-4 h-4 mr-2" />
          Browse Courses
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                    {stat.title}
                  </p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">
                    {stat.value}
                  </p>
                </div>
                <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                  <stat.icon className={`w-6 h-6 ${stat.color}`} />
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Continue Learning */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Continue Learning
          </h2>
          <Link to="/courses">
            <Button variant="outline" size="sm">
              View All Courses
            </Button>
          </Link>
        </div>

        {enrolledCourses.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {enrolledCourses.slice(0, 3).map((course) => {
              const enrollment = mockEnrollments.find(
                e => e.courseId === course.id && e.userId === user?.id
              );
              
              return (
                <motion.div
                  key={course.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="relative"
                >
                  <Card className="p-6 hover:shadow-lg transition-shadow">
                    <div className="flex items-start space-x-4">
                      <img
                        src={course.thumbnail}
                        alt={course.title}
                        className="w-16 h-16 rounded-lg object-cover"
                      />
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 dark:text-white mb-1 truncate">
                          {course.title}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                          by {course.instructor.firstName} {course.instructor.lastName}
                        </p>
                        
                        {/* Progress Bar */}
                        <div className="mb-3">
                          <div className="flex justify-between text-sm mb-1">
                            <span className="text-gray-600 dark:text-gray-400">Progress</span>
                            <span className="text-primary-600 dark:text-primary-400 font-medium">
                              {enrollment?.progress || 0}%
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                            <div
                              className="bg-gradient-to-r from-primary-500 to-secondary-500 h-2 rounded-full transition-all duration-300"
                              style={{ width: `${enrollment?.progress || 0}%` }}
                            />
                          </div>
                        </div>

                        <Link to={`/courses/${course.id}/learn`}>
                          <Button variant="primary" size="sm" className="w-full">
                            <Play className="w-4 h-4 mr-2" />
                            Continue Learning
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        ) : (
          <Card className="p-12 text-center">
            <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              No courses enrolled yet
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Start your learning journey by enrolling in your first course
            </p>
            <Link to="/courses">
              <Button variant="primary">
                Browse Courses
              </Button>
            </Link>
          </Card>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Activity */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            Recent Activity
          </h2>
          <Card className="p-6">
            <div className="space-y-4">
              {recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-start space-x-3">
                  <div className="p-2 bg-primary-100 dark:bg-primary-900/30 rounded-lg">
                    <activity.icon className="w-4 h-4 text-primary-600 dark:text-primary-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {activity.title}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {activity.course}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {activity.time}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Recommended Courses */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            Recommended for You
          </h2>
          <div className="space-y-4">
            {mockCourses.slice(0, 3).map((course) => (
              <Card key={course.id} className="p-4 hover:shadow-lg transition-shadow">
                <div className="flex items-center space-x-4">
                  <img
                    src={course.thumbnail}
                    alt={course.title}
                    className="w-12 h-12 rounded-lg object-cover"
                  />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-gray-900 dark:text-white truncate">
                      {course.title}
                    </h3>
                    <div className="flex items-center space-x-2 mt-1">
                      <div className="flex items-center">
                        <Star className="w-3 h-3 text-yellow-400 fill-current" />
                        <span className="text-xs text-gray-600 dark:text-gray-400 ml-1">
                          {course.rating}
                        </span>
                      </div>
                      <span className="text-xs text-gray-400">•</span>
                      <span className="text-xs text-primary-600 dark:text-primary-400 font-medium">
                        ${course.price}
                      </span>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">
                    View
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;