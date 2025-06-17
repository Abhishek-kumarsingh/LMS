import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  BookOpen, 
  Users, 
  DollarSign, 
  TrendingUp, 
  Award,
  Eye,
  Plus,
  Calendar,
  Star,
  Clock
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import StatsCard from '../../components/dashboard/StatsCard';

interface InstructorStats {
  totalCourses: number;
  totalStudents: number;
  totalEarnings: number;
  totalCertificates: number;
  monthlyEarnings: number;
  averageRating: number;
  totalReviews: number;
  completionRate: number;
}

interface RecentActivity {
  id: string;
  type: 'enrollment' | 'completion' | 'review' | 'earning';
  title: string;
  description: string;
  timestamp: string;
  amount?: number;
  rating?: number;
}

interface TopCourse {
  id: string;
  title: string;
  thumbnail: string;
  students: number;
  rating: number;
  earnings: number;
  completionRate: number;
}

const InstructorDashboard: React.FC = () => {
  const { user } = useAuthStore();
  const [stats, setStats] = useState<InstructorStats | null>(null);
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [topCourses, setTopCourses] = useState<TopCourse[]>([]);
  const [loading, setLoading] = useState(true);

  // Mock data - replace with actual API calls
  const mockStats: InstructorStats = {
    totalCourses: 12,
    totalStudents: 1847,
    totalEarnings: 24650,
    totalCertificates: 892,
    monthlyEarnings: 3420,
    averageRating: 4.7,
    totalReviews: 324,
    completionRate: 78
  };

  const mockActivity: RecentActivity[] = [
    {
      id: '1',
      type: 'enrollment',
      title: 'New student enrolled',
      description: 'Sarah Johnson enrolled in "React Development Bootcamp"',
      timestamp: '2 hours ago'
    },
    {
      id: '2',
      type: 'completion',
      title: 'Course completed',
      description: 'Mike Chen completed "Advanced JavaScript Concepts"',
      timestamp: '4 hours ago'
    },
    {
      id: '3',
      type: 'review',
      title: 'New review received',
      description: 'Emma Davis left a 5-star review for "UI/UX Design Fundamentals"',
      timestamp: '6 hours ago',
      rating: 5
    },
    {
      id: '4',
      type: 'earning',
      title: 'Payment received',
      description: 'Monthly earnings payout processed',
      timestamp: '1 day ago',
      amount: 3420
    }
  ];

  const mockTopCourses: TopCourse[] = [
    {
      id: '1',
      title: 'Complete React Development Bootcamp',
      thumbnail: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=300',
      students: 456,
      rating: 4.8,
      earnings: 8920,
      completionRate: 85
    },
    {
      id: '2',
      title: 'Advanced JavaScript Concepts',
      thumbnail: 'https://images.unsplash.com/photo-1627398242454-45a1465c2479?w=300',
      students: 324,
      rating: 4.6,
      earnings: 6480,
      completionRate: 72
    },
    {
      id: '3',
      title: 'UI/UX Design Fundamentals',
      thumbnail: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=300',
      students: 289,
      rating: 4.9,
      earnings: 5780,
      completionRate: 91
    }
  ];

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        // Simulate API calls
        await new Promise(resolve => setTimeout(resolve, 1000));
        setStats(mockStats);
        setRecentActivity(mockActivity);
        setTopCourses(mockTopCourses);
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'enrollment':
        return <Users className="w-4 h-4 text-blue-500" />;
      case 'completion':
        return <Award className="w-4 h-4 text-green-500" />;
      case 'review':
        return <Star className="w-4 h-4 text-yellow-500" />;
      case 'earning':
        return <DollarSign className="w-4 h-4 text-green-600" />;
      default:
        return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-64 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[1, 2, 3, 4].map(i => (
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
            Instructor Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Welcome back, {user?.firstName}! Here's your teaching overview.
          </p>
        </div>
        <Button variant="primary">
          <Plus className="w-4 h-4 mr-2" />
          Create New Course
        </Button>
      </div>

      {/* Stats Grid */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatsCard
            title="Total Courses"
            value={stats.totalCourses}
            icon={BookOpen}
            color="primary"
            change={{
              value: 8.2,
              type: 'increase',
              period: 'last month'
            }}
          />
          <StatsCard
            title="Total Students"
            value={stats.totalStudents}
            icon={Users}
            color="secondary"
            change={{
              value: 12.5,
              type: 'increase',
              period: 'last month'
            }}
          />
          <StatsCard
            title="Total Earnings"
            value={`$${stats.totalEarnings.toLocaleString()}`}
            icon={DollarSign}
            color="success"
            change={{
              value: 15.3,
              type: 'increase',
              period: 'last month'
            }}
          />
          <StatsCard
            title="Certificates Issued"
            value={stats.totalCertificates}
            icon={Award}
            color="warning"
            change={{
              value: 6.8,
              type: 'increase',
              period: 'last month'
            }}
          />
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Performance Overview */}
        <div className="lg:col-span-2">
          <Card className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
              Performance Overview
            </h2>
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-primary-600 dark:text-primary-400 mb-2">
                  {stats?.averageRating.toFixed(1)}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Average Rating
                </div>
                <div className="flex items-center justify-center mt-1">
                  {[1, 2, 3, 4, 5].map(star => (
                    <Star
                      key={star}
                      className={`w-4 h-4 ${
                        star <= Math.floor(stats?.averageRating || 0)
                          ? 'text-yellow-400 fill-current'
                          : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
              </div>
              
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600 dark:text-green-400 mb-2">
                  {stats?.completionRate}%
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Completion Rate
                </div>
              </div>
              
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-2">
                  {stats?.totalReviews}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Total Reviews
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Recent Activity */}
        <div>
          <Card className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
              Recent Activity
            </h2>
            
            <div className="space-y-4">
              {recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-start space-x-3">
                  <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded-lg">
                    {getActivityIcon(activity.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {activity.title}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {activity.description}
                    </p>
                    <div className="flex items-center space-x-2 mt-1">
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {activity.timestamp}
                      </p>
                      {activity.amount && (
                        <span className="text-xs font-medium text-green-600 dark:text-green-400">
                          +${activity.amount}
                        </span>
                      )}
                      {activity.rating && (
                        <div className="flex items-center">
                          <Star className="w-3 h-3 text-yellow-400 fill-current" />
                          <span className="text-xs text-gray-600 dark:text-gray-400 ml-1">
                            {activity.rating}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>

      {/* Top Performing Courses */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Top Performing Courses
          </h2>
          <Button variant="outline" size="sm">
            <Eye className="w-4 h-4 mr-2" />
            View All
          </Button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {topCourses.map((course) => (
            <motion.div
              key={course.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4"
            >
              <div className="flex items-start space-x-4">
                <img
                  src={course.thumbnail}
                  alt={course.title}
                  className="w-16 h-16 rounded-lg object-cover"
                />
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-gray-900 dark:text-white mb-2 line-clamp-2">
                    {course.title}
                  </h3>
                  
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-gray-500 dark:text-gray-400">Students:</span>
                      <span className="font-medium text-gray-900 dark:text-white ml-1">
                        {course.students}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-500 dark:text-gray-400">Rating:</span>
                      <span className="font-medium text-gray-900 dark:text-white ml-1">
                        {course.rating}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-500 dark:text-gray-400">Earnings:</span>
                      <span className="font-medium text-green-600 dark:text-green-400 ml-1">
                        ${course.earnings}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-500 dark:text-gray-400">Completion:</span>
                      <span className="font-medium text-gray-900 dark:text-white ml-1">
                        {course.completionRate}%
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </Card>
    </div>
  );
};

export default InstructorDashboard;
