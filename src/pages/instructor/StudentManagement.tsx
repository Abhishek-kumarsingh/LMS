import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Users, 
  Search, 
  Filter, 
  Mail, 
  MessageCircle,
  Award,
  BookOpen,
  Calendar,
  TrendingUp,
  Eye,
  Download,
  User
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';

interface Student {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  avatar?: string;
  enrolledCourses: {
    courseId: string;
    courseTitle: string;
    enrolledAt: string;
    progress: number;
    completed: boolean;
    lastAccessed: string;
  }[];
  totalProgress: number;
  completedCourses: number;
  certificatesEarned: number;
  totalTimeSpent: number; // in minutes
  joinedAt: string;
  lastActive: string;
}

const StudentManagement: React.FC = () => {
  const { user } = useAuthStore();
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [courseFilter, setCourseFilter] = useState<string>('all');
  const [progressFilter, setProgressFilter] = useState<'all' | 'active' | 'completed' | 'inactive'>('all');

  // Mock data - replace with actual API calls
  const mockStudents: Student[] = [
    {
      id: '1',
      firstName: 'Sarah',
      lastName: 'Johnson',
      email: 'sarah.johnson@example.com',
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150',
      enrolledCourses: [
        {
          courseId: '1',
          courseTitle: 'Complete React Development Bootcamp',
          enrolledAt: '2024-01-15T10:00:00Z',
          progress: 85,
          completed: false,
          lastAccessed: '2024-01-25T14:30:00Z'
        },
        {
          courseId: '2',
          courseTitle: 'Advanced JavaScript Concepts',
          enrolledAt: '2024-01-10T09:00:00Z',
          progress: 100,
          completed: true,
          lastAccessed: '2024-01-20T16:45:00Z'
        }
      ],
      totalProgress: 92.5,
      completedCourses: 1,
      certificatesEarned: 1,
      totalTimeSpent: 1240,
      joinedAt: '2024-01-05T08:00:00Z',
      lastActive: '2024-01-25T14:30:00Z'
    },
    {
      id: '2',
      firstName: 'Mike',
      lastName: 'Chen',
      email: 'mike.chen@example.com',
      enrolledCourses: [
        {
          courseId: '1',
          courseTitle: 'Complete React Development Bootcamp',
          enrolledAt: '2024-01-20T11:00:00Z',
          progress: 45,
          completed: false,
          lastAccessed: '2024-01-24T10:15:00Z'
        }
      ],
      totalProgress: 45,
      completedCourses: 0,
      certificatesEarned: 0,
      totalTimeSpent: 680,
      joinedAt: '2024-01-18T12:00:00Z',
      lastActive: '2024-01-24T10:15:00Z'
    },
    {
      id: '3',
      firstName: 'Emma',
      lastName: 'Davis',
      email: 'emma.davis@example.com',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150',
      enrolledCourses: [
        {
          courseId: '3',
          courseTitle: 'UI/UX Design Fundamentals',
          enrolledAt: '2024-01-12T14:00:00Z',
          progress: 100,
          completed: true,
          lastAccessed: '2024-01-22T18:20:00Z'
        },
        {
          courseId: '1',
          courseTitle: 'Complete React Development Bootcamp',
          enrolledAt: '2024-01-18T16:00:00Z',
          progress: 30,
          completed: false,
          lastAccessed: '2024-01-23T09:45:00Z'
        }
      ],
      totalProgress: 65,
      completedCourses: 1,
      certificatesEarned: 1,
      totalTimeSpent: 890,
      joinedAt: '2024-01-10T10:00:00Z',
      lastActive: '2024-01-23T09:45:00Z'
    }
  ];

  const mockCourses = [
    { id: '1', title: 'Complete React Development Bootcamp' },
    { id: '2', title: 'Advanced JavaScript Concepts' },
    { id: '3', title: 'UI/UX Design Fundamentals' }
  ];

  useEffect(() => {
    const fetchStudents = async () => {
      setLoading(true);
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        setStudents(mockStudents);
      } catch (error) {
        console.error('Failed to fetch students:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, []);

  const handleSendMessage = (studentId: string) => {
    console.log('Send message to student:', studentId);
    // Implement messaging functionality
  };

  const handleSendEmail = (studentEmail: string) => {
    window.open(`mailto:${studentEmail}`, '_blank');
  };

  const handleViewProgress = (studentId: string) => {
    console.log('View student progress:', studentId);
    // Navigate to detailed progress view
  };

  const filteredStudents = students.filter(student => {
    const matchesSearch = 
      student.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCourse = courseFilter === 'all' || 
      student.enrolledCourses.some(course => course.courseId === courseFilter);
    
    const matchesProgress = progressFilter === 'all' ||
      (progressFilter === 'completed' && student.completedCourses > 0) ||
      (progressFilter === 'active' && student.totalProgress > 0 && student.totalProgress < 100) ||
      (progressFilter === 'inactive' && student.totalProgress === 0);
    
    return matchesSearch && matchesCourse && matchesProgress;
  });

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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getProgressColor = (progress: number) => {
    if (progress >= 80) return 'text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900/20';
    if (progress >= 50) return 'text-yellow-600 bg-yellow-100 dark:text-yellow-400 dark:bg-yellow-900/20';
    if (progress > 0) return 'text-blue-600 bg-blue-100 dark:text-blue-400 dark:bg-blue-900/20';
    return 'text-gray-600 bg-gray-100 dark:text-gray-400 dark:bg-gray-900/20';
  };

  const stats = {
    total: students.length,
    active: students.filter(s => s.totalProgress > 0 && s.totalProgress < 100).length,
    completed: students.filter(s => s.completedCourses > 0).length,
    certificates: students.reduce((sum, s) => sum + s.certificatesEarned, 0)
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-64 mb-6"></div>
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-32 bg-gray-200 dark:bg-gray-700 rounded-xl"></div>
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
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Student Management
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Track and manage your students' progress
          </p>
        </div>
        <Button variant="outline">
          <Download className="w-4 h-4 mr-2" />
          Export Data
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4 text-center">
          <div className="text-2xl font-bold text-primary-600 dark:text-primary-400">
            {stats.total}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Total Students
          </div>
        </Card>
        
        <Card className="p-4 text-center">
          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
            {stats.active}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Active Learners
          </div>
        </Card>
        
        <Card className="p-4 text-center">
          <div className="text-2xl font-bold text-green-600 dark:text-green-400">
            {stats.completed}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Course Completions
          </div>
        </Card>
        
        <Card className="p-4 text-center">
          <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
            {stats.certificates}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Certificates Earned
          </div>
        </Card>
      </div>

      {/* Filters */}
      <Card className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              type="text"
              placeholder="Search students..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <select
            value={courseFilter}
            onChange={(e) => setCourseFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          >
            <option value="all">All Courses</option>
            {mockCourses.map(course => (
              <option key={course.id} value={course.id}>{course.title}</option>
            ))}
          </select>
          
          <select
            value={progressFilter}
            onChange={(e) => setProgressFilter(e.target.value as any)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          >
            <option value="all">All Progress</option>
            <option value="active">Active</option>
            <option value="completed">Completed</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </Card>

      {/* Students List */}
      {filteredStudents.length === 0 ? (
        <Card className="p-12 text-center">
          <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            No students found
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Try adjusting your search or filter criteria
          </p>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredStudents.map((student, index) => (
            <motion.div
              key={student.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4">
                    {/* Avatar */}
                    <div className="w-12 h-12 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full flex items-center justify-center overflow-hidden flex-shrink-0">
                      {student.avatar ? (
                        <img
                          src={student.avatar}
                          alt={`${student.firstName} ${student.lastName}`}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <User className="w-6 h-6 text-white" />
                      )}
                    </div>

                    {/* Student Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="font-semibold text-lg text-gray-900 dark:text-white">
                          {student.firstName} {student.lastName}
                        </h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getProgressColor(student.totalProgress)}`}>
                          {student.totalProgress.toFixed(0)}% Progress
                        </span>
                      </div>
                      
                      <p className="text-gray-600 dark:text-gray-400 mb-3">
                        {student.email}
                      </p>

                      {/* Stats */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div className="flex items-center space-x-2">
                          <BookOpen className="w-4 h-4 text-gray-400" />
                          <span className="text-gray-600 dark:text-gray-300">
                            {student.enrolledCourses.length} courses
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Award className="w-4 h-4 text-gray-400" />
                          <span className="text-gray-600 dark:text-gray-300">
                            {student.certificatesEarned} certificates
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <TrendingUp className="w-4 h-4 text-gray-400" />
                          <span className="text-gray-600 dark:text-gray-300">
                            {formatDuration(student.totalTimeSpent)} spent
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          <span className="text-gray-600 dark:text-gray-300">
                            Joined {formatDate(student.joinedAt)}
                          </span>
                        </div>
                      </div>

                      {/* Enrolled Courses */}
                      <div className="mt-4">
                        <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                          Enrolled Courses:
                        </h4>
                        <div className="space-y-2">
                          {student.enrolledCourses.map((course) => (
                            <div key={course.courseId} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded">
                              <span className="text-sm text-gray-700 dark:text-gray-300">
                                {course.courseTitle}
                              </span>
                              <div className="flex items-center space-x-2">
                                <div className="w-16 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                  <div
                                    className="bg-primary-600 h-2 rounded-full"
                                    style={{ width: `${course.progress}%` }}
                                  />
                                </div>
                                <span className="text-xs text-gray-600 dark:text-gray-400 w-8">
                                  {course.progress}%
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleViewProgress(student.id)}
                      title="View Progress"
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleSendMessage(student.id)}
                      title="Send Message"
                    >
                      <MessageCircle className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleSendEmail(student.email)}
                      title="Send Email"
                    >
                      <Mail className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default StudentManagement;
