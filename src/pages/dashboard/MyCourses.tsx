import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Play, Clock, Award, Search, Filter, TrendingUp } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { mockCourses, mockEnrollments } from '../../utils/mockData';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import CourseCard from '../../components/course/CourseCard';
import ProgressTracker from '../../components/course/ProgressTracker';

interface EnrolledCourse {
  id: string;
  course: any;
  enrollment: any;
  progress: number;
  lastAccessed: string;
  timeSpent: number; // in minutes
  completed: boolean;
  certificateEligible: boolean;
}

const MyCourses: React.FC = () => {
  const { user } = useAuthStore();
  const [enrolledCourses, setEnrolledCourses] = useState<EnrolledCourse[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'in-progress' | 'completed'>('all');
  const [selectedCourse, setSelectedCourse] = useState<string | null>(null);

  useEffect(() => {
    // Simulate API call to fetch enrolled courses
    const fetchEnrolledCourses = async () => {
      setLoading(true);
      try {
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const userEnrollments = mockEnrollments.filter(e => e.userId === user?.id);
        const coursesWithProgress = userEnrollments.map(enrollment => {
          const course = mockCourses.find(c => c.id === enrollment.courseId);
          return {
            id: enrollment.id,
            course,
            enrollment,
            progress: enrollment.progress || 0,
            lastAccessed: enrollment.lastAccessed || new Date().toISOString(),
            timeSpent: enrollment.timeSpent || Math.floor(Math.random() * 300) + 60,
            completed: (enrollment.progress || 0) >= 100,
            certificateEligible: (enrollment.progress || 0) >= 100
          };
        }).filter(item => item.course);

        setEnrolledCourses(coursesWithProgress);
      } catch (error) {
        console.error('Failed to fetch enrolled courses:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchEnrolledCourses();
  }, [user?.id]);

  const handleContinueLearning = (courseId: string) => {
    // Navigate to course learning page
    console.log('Continue learning course:', courseId);
  };

  const handleGenerateCertificate = async (courseId: string) => {
    try {
      // Call API to generate certificate
      console.log('Generating certificate for course:', courseId);
      // Update course status
    } catch (error) {
      console.error('Failed to generate certificate:', error);
    }
  };

  const filteredCourses = enrolledCourses.filter(item => {
    const matchesSearch = item.course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.course.instructor.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.course.instructor.lastName.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || 
                         (statusFilter === 'completed' && item.completed) ||
                         (statusFilter === 'in-progress' && !item.completed);
    
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: enrolledCourses.length,
    inProgress: enrolledCourses.filter(c => !c.completed).length,
    completed: enrolledCourses.filter(c => c.completed).length,
    totalTimeSpent: enrolledCourses.reduce((sum, c) => sum + c.timeSpent, 0)
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

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-64 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-80 bg-gray-200 dark:bg-gray-700 rounded-xl"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center">
            <BookOpen className="w-8 h-8 mr-3 text-primary-600" />
            My Courses
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Track your learning progress and continue your journey
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4 text-center">
          <div className="text-2xl font-bold text-primary-600 dark:text-primary-400">
            {stats.total}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Total Enrolled
          </div>
        </Card>
        
        <Card className="p-4 text-center">
          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
            {stats.inProgress}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            In Progress
          </div>
        </Card>
        
        <Card className="p-4 text-center">
          <div className="text-2xl font-bold text-green-600 dark:text-green-400">
            {stats.completed}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Completed
          </div>
        </Card>
        
        <Card className="p-4 text-center">
          <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
            {formatDuration(stats.totalTimeSpent)}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Time Spent
          </div>
        </Card>
      </div>

      {/* Filters */}
      <Card className="p-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                type="text"
                placeholder="Search courses..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          
          <div className="sm:w-48">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            >
              <option value="all">All Courses</option>
              <option value="in-progress">In Progress</option>
              <option value="completed">Completed</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Courses Grid */}
      {filteredCourses.length === 0 ? (
        <Card className="p-12 text-center">
          <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            {searchTerm || statusFilter !== 'all' ? 'No courses found' : 'No enrolled courses yet'}
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            {searchTerm || statusFilter !== 'all' 
              ? 'Try adjusting your search or filter criteria'
              : 'Start your learning journey by enrolling in your first course'
            }
          </p>
          {!searchTerm && statusFilter === 'all' && (
            <Button variant="primary">
              <BookOpen className="w-4 h-4 mr-2" />
              Browse Courses
            </Button>
          )}
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="overflow-hidden">
                {/* Course Thumbnail */}
                <div className="relative h-48">
                  <img
                    src={item.course.thumbnail}
                    alt={item.course.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                    <Button
                      variant="primary"
                      onClick={() => handleContinueLearning(item.course.id)}
                      className="shadow-lg"
                    >
                      <Play className="w-4 h-4 mr-2" />
                      {item.completed ? 'Review' : 'Continue'}
                    </Button>
                  </div>
                  
                  {/* Progress Badge */}
                  <div className="absolute top-4 right-4">
                    <span className="px-2 py-1 bg-white/90 dark:bg-gray-800/90 rounded-full text-xs font-medium text-gray-900 dark:text-white">
                      {item.progress}%
                    </span>
                  </div>
                </div>

                <div className="p-6">
                  <h3 className="font-semibold text-lg text-gray-900 dark:text-white mb-2">
                    {item.course.title}
                  </h3>
                  
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    by {item.course.instructor.firstName} {item.course.instructor.lastName}
                  </p>

                  {/* Progress Bar */}
                  <div className="mb-4">
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-gray-600 dark:text-gray-400">Progress</span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {item.progress}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-primary-500 to-primary-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${item.progress}%` }}
                      />
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                    <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-300">
                      <Clock className="w-4 h-4" />
                      <span>{formatDuration(item.timeSpent)}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-300">
                      <TrendingUp className="w-4 h-4" />
                      <span>{item.completed ? 'Completed' : 'Active'}</span>
                    </div>
                  </div>

                  {/* Certificate Button */}
                  {item.certificateEligible && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleGenerateCertificate(item.course.id)}
                      className="w-full"
                    >
                      <Award className="w-4 h-4 mr-2" />
                      Get Certificate
                    </Button>
                  )}
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyCourses;
