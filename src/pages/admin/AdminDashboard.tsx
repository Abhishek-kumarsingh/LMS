import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Users, 
  BookOpen, 
  DollarSign, 
  TrendingUp,
  Award,
  AlertTriangle,
  Activity,
  Globe,
  Calendar,
  Eye,
  UserPlus,
  BookPlus
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import StatsCard from '../../components/dashboard/StatsCard';

interface AdminStats {
  totalUsers: number;
  totalCourses: number;
  totalRevenue: number;
  totalCertificates: number;
  activeUsers: number;
  newUsersToday: number;
  coursesPublishedToday: number;
  revenueToday: number;
  userGrowth: number;
  courseGrowth: number;
  revenueGrowth: number;
}

interface SystemAlert {
  id: string;
  type: 'warning' | 'error' | 'info';
  title: string;
  message: string;
  timestamp: string;
  resolved: boolean;
}

interface RecentActivity {
  id: string;
  type: 'user_registration' | 'course_published' | 'payment' | 'certificate_issued';
  title: string;
  description: string;
  timestamp: string;
  user?: string;
  amount?: number;
}

interface TopMetrics {
  topInstructors: {
    id: string;
    name: string;
    courses: number;
    students: number;
    earnings: number;
  }[];
  topCourses: {
    id: string;
    title: string;
    instructor: string;
    students: number;
    rating: number;
    revenue: number;
  }[];
  usersByCountry: {
    country: string;
    users: number;
    percentage: number;
  }[];
}

const AdminDashboard: React.FC = () => {
  const { user } = useAuthStore();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [alerts, setAlerts] = useState<SystemAlert[]>([]);
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [topMetrics, setTopMetrics] = useState<TopMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  // Mock data - replace with actual API calls
  const mockStats: AdminStats = {
    totalUsers: 15847,
    totalCourses: 1234,
    totalRevenue: 2456789,
    totalCertificates: 8923,
    activeUsers: 3456,
    newUsersToday: 127,
    coursesPublishedToday: 8,
    revenueToday: 12450,
    userGrowth: 15.3,
    courseGrowth: 8.7,
    revenueGrowth: 23.1
  };

  const mockAlerts: SystemAlert[] = [
    {
      id: '1',
      type: 'warning',
      title: 'High Server Load',
      message: 'Server CPU usage is above 85% for the last 30 minutes',
      timestamp: '2024-01-25T10:30:00Z',
      resolved: false
    },
    {
      id: '2',
      type: 'error',
      title: 'Payment Gateway Issue',
      message: 'Some payment transactions are failing. Investigating...',
      timestamp: '2024-01-25T09:15:00Z',
      resolved: false
    },
    {
      id: '3',
      type: 'info',
      title: 'Scheduled Maintenance',
      message: 'System maintenance scheduled for tonight at 2 AM UTC',
      timestamp: '2024-01-25T08:00:00Z',
      resolved: true
    }
  ];

  const mockActivity: RecentActivity[] = [
    {
      id: '1',
      type: 'user_registration',
      title: 'New user registered',
      description: 'Sarah Johnson joined as a student',
      timestamp: '5 minutes ago',
      user: 'Sarah Johnson'
    },
    {
      id: '2',
      type: 'course_published',
      title: 'Course published',
      description: 'Mike Chen published "Advanced React Patterns"',
      timestamp: '12 minutes ago',
      user: 'Mike Chen'
    },
    {
      id: '3',
      type: 'payment',
      title: 'Payment received',
      description: 'Course enrollment payment processed',
      timestamp: '18 minutes ago',
      amount: 99.99
    },
    {
      id: '4',
      type: 'certificate_issued',
      title: 'Certificate issued',
      description: 'Emma Davis earned a certificate for "JavaScript Fundamentals"',
      timestamp: '25 minutes ago',
      user: 'Emma Davis'
    }
  ];

  const mockTopMetrics: TopMetrics = {
    topInstructors: [
      {
        id: '1',
        name: 'John Smith',
        courses: 12,
        students: 2456,
        earnings: 45678
      },
      {
        id: '2',
        name: 'Sarah Wilson',
        courses: 8,
        students: 1834,
        earnings: 34567
      },
      {
        id: '3',
        name: 'Mike Johnson',
        courses: 15,
        students: 3201,
        earnings: 56789
      }
    ],
    topCourses: [
      {
        id: '1',
        title: 'Complete React Development',
        instructor: 'John Smith',
        students: 1234,
        rating: 4.8,
        revenue: 23456
      },
      {
        id: '2',
        title: 'Advanced JavaScript',
        instructor: 'Sarah Wilson',
        students: 987,
        rating: 4.7,
        revenue: 18765
      },
      {
        id: '3',
        title: 'UI/UX Design Mastery',
        instructor: 'Mike Johnson',
        students: 1456,
        rating: 4.9,
        revenue: 34567
      }
    ],
    usersByCountry: [
      { country: 'United States', users: 4567, percentage: 28.8 },
      { country: 'United Kingdom', users: 2345, percentage: 14.8 },
      { country: 'Canada', users: 1876, percentage: 11.8 },
      { country: 'Germany', users: 1543, percentage: 9.7 },
      { country: 'Australia', users: 1234, percentage: 7.8 }
    ]
  };

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        // Simulate API calls
        await new Promise(resolve => setTimeout(resolve, 1000));
        setStats(mockStats);
        setAlerts(mockAlerts);
        setRecentActivity(mockActivity);
        setTopMetrics(mockTopMetrics);
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'error':
        return <AlertTriangle className="w-4 h-4 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      default:
        return <Activity className="w-4 h-4 text-blue-500" />;
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'user_registration':
        return <UserPlus className="w-4 h-4 text-green-500" />;
      case 'course_published':
        return <BookPlus className="w-4 h-4 text-blue-500" />;
      case 'payment':
        return <DollarSign className="w-4 h-4 text-green-600" />;
      case 'certificate_issued':
        return <Award className="w-4 h-4 text-yellow-500" />;
      default:
        return <Activity className="w-4 h-4 text-gray-500" />;
    }
  };

  const resolveAlert = (alertId: string) => {
    setAlerts(prev => 
      prev.map(alert => 
        alert.id === alertId ? { ...alert, resolved: true } : alert
      )
    );
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
            Admin Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Welcome back, {user?.firstName}! Here's your platform overview.
          </p>
        </div>
        <div className="flex space-x-3 mt-4 sm:mt-0">
          <Button variant="outline">
            <Eye className="w-4 h-4 mr-2" />
            View Reports
          </Button>
          <Button variant="primary">
            <Activity className="w-4 h-4 mr-2" />
            System Health
          </Button>
        </div>
      </div>

      {/* System Alerts */}
      {alerts.filter(alert => !alert.resolved).length > 0 && (
        <Card className="p-4 border-l-4 border-l-red-500 bg-red-50 dark:bg-red-900/10">
          <div className="flex items-start space-x-3">
            <AlertTriangle className="w-5 h-5 text-red-500 mt-0.5" />
            <div className="flex-1">
              <h3 className="font-medium text-red-800 dark:text-red-200">
                System Alerts ({alerts.filter(alert => !alert.resolved).length})
              </h3>
              <div className="mt-2 space-y-2">
                {alerts.filter(alert => !alert.resolved).slice(0, 2).map(alert => (
                  <div key={alert.id} className="flex items-center justify-between">
                    <p className="text-sm text-red-700 dark:text-red-300">
                      {alert.title}: {alert.message}
                    </p>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => resolveAlert(alert.id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      Resolve
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Stats Grid */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatsCard
            title="Total Users"
            value={stats.totalUsers.toLocaleString()}
            icon={Users}
            color="primary"
            change={{
              value: stats.userGrowth,
              type: 'increase',
              period: 'this month'
            }}
          />
          <StatsCard
            title="Total Courses"
            value={stats.totalCourses.toLocaleString()}
            icon={BookOpen}
            color="secondary"
            change={{
              value: stats.courseGrowth,
              type: 'increase',
              period: 'this month'
            }}
          />
          <StatsCard
            title="Total Revenue"
            value={`$${(stats.totalRevenue / 1000000).toFixed(1)}M`}
            icon={DollarSign}
            color="success"
            change={{
              value: stats.revenueGrowth,
              type: 'increase',
              period: 'this month'
            }}
          />
          <StatsCard
            title="Certificates Issued"
            value={stats.totalCertificates.toLocaleString()}
            icon={Award}
            color="warning"
            change={{
              value: 12.5,
              type: 'increase',
              period: 'this month'
            }}
          />
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Today's Metrics */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
            Today's Activity
          </h2>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <div className="flex items-center space-x-3">
                <UserPlus className="w-5 h-5 text-green-600" />
                <span className="font-medium text-gray-900 dark:text-white">New Users</span>
              </div>
              <span className="text-2xl font-bold text-green-600">
                {stats?.newUsersToday}
              </span>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <div className="flex items-center space-x-3">
                <BookPlus className="w-5 h-5 text-blue-600" />
                <span className="font-medium text-gray-900 dark:text-white">Courses Published</span>
              </div>
              <span className="text-2xl font-bold text-blue-600">
                {stats?.coursesPublishedToday}
              </span>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
              <div className="flex items-center space-x-3">
                <DollarSign className="w-5 h-5 text-purple-600" />
                <span className="font-medium text-gray-900 dark:text-white">Revenue</span>
              </div>
              <span className="text-2xl font-bold text-purple-600">
                ${stats?.revenueToday.toLocaleString()}
              </span>
            </div>
          </div>
        </Card>

        {/* Recent Activity */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
            Recent Activity
          </h2>
          
          <div className="space-y-4">
            {recentActivity.slice(0, 5).map((activity) => (
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
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Top Countries */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
            Users by Country
          </h2>
          
          <div className="space-y-4">
            {topMetrics?.usersByCountry.map((country, index) => (
              <div key={country.country} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
                    <span className="text-sm font-bold text-gray-600 dark:text-gray-400">
                      {index + 1}
                    </span>
                  </div>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {country.country}
                  </span>
                </div>
                <div className="text-right">
                  <p className="font-bold text-gray-900 dark:text-white">
                    {country.users.toLocaleString()}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {country.percentage}%
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;
