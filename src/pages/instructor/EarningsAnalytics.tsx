import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown,
  Calendar,
  Download,
  Eye,
  Users,
  BookOpen,
  Award,
  CreditCard
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import StatsCard from '../../components/dashboard/StatsCard';

interface EarningsData {
  totalEarnings: number;
  monthlyEarnings: number;
  pendingPayouts: number;
  lastPayout: number;
  monthlyGrowth: number;
  topCourseEarnings: {
    courseId: string;
    title: string;
    earnings: number;
    students: number;
  }[];
  monthlyBreakdown: {
    month: string;
    earnings: number;
    students: number;
    courses: number;
  }[];
  payoutHistory: {
    id: string;
    amount: number;
    date: string;
    status: 'COMPLETED' | 'PENDING' | 'PROCESSING';
    method: string;
  }[];
}

interface StudentAnalytics {
  totalStudents: number;
  newStudents: number;
  activeStudents: number;
  completionRate: number;
  averageProgress: number;
  studentGrowth: number;
  topCountries: {
    country: string;
    students: number;
    percentage: number;
  }[];
}

const EarningsAnalytics: React.FC = () => {
  const { user } = useAuthStore();
  const [earningsData, setEarningsData] = useState<EarningsData | null>(null);
  const [studentAnalytics, setStudentAnalytics] = useState<StudentAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'earnings' | 'students'>('earnings');

  // Mock data - replace with actual API calls
  const mockEarningsData: EarningsData = {
    totalEarnings: 24650.75,
    monthlyEarnings: 3420.50,
    pendingPayouts: 1250.25,
    lastPayout: 2890.00,
    monthlyGrowth: 15.3,
    topCourseEarnings: [
      {
        courseId: '1',
        title: 'Complete React Development Bootcamp',
        earnings: 8920.44,
        students: 456
      },
      {
        courseId: '2',
        title: 'Advanced JavaScript Concepts',
        earnings: 6480.76,
        students: 324
      },
      {
        courseId: '3',
        title: 'UI/UX Design Fundamentals',
        earnings: 5780.30,
        students: 289
      }
    ],
    monthlyBreakdown: [
      { month: 'Jan', earnings: 2890, students: 145, courses: 3 },
      { month: 'Feb', earnings: 3120, students: 167, courses: 3 },
      { month: 'Mar', earnings: 3420, students: 189, courses: 4 },
      { month: 'Apr', earnings: 3650, students: 201, courses: 4 },
      { month: 'May', earnings: 3890, students: 223, courses: 5 },
      { month: 'Jun', earnings: 4120, students: 245, courses: 5 }
    ],
    payoutHistory: [
      {
        id: '1',
        amount: 2890.00,
        date: '2024-01-31T10:00:00Z',
        status: 'COMPLETED',
        method: 'PayPal'
      },
      {
        id: '2',
        amount: 3120.50,
        date: '2024-02-29T10:00:00Z',
        status: 'COMPLETED',
        method: 'Bank Transfer'
      },
      {
        id: '3',
        amount: 1250.25,
        date: '2024-03-31T10:00:00Z',
        status: 'PENDING',
        method: 'PayPal'
      }
    ]
  };

  const mockStudentAnalytics: StudentAnalytics = {
    totalStudents: 1847,
    newStudents: 234,
    activeStudents: 1456,
    completionRate: 78.5,
    averageProgress: 65.2,
    studentGrowth: 12.8,
    topCountries: [
      { country: 'United States', students: 567, percentage: 30.7 },
      { country: 'United Kingdom', students: 234, percentage: 12.7 },
      { country: 'Canada', students: 189, percentage: 10.2 },
      { country: 'Germany', students: 156, percentage: 8.4 },
      { country: 'Australia', students: 134, percentage: 7.3 }
    ]
  };

  useEffect(() => {
    const fetchAnalyticsData = async () => {
      setLoading(true);
      try {
        // Simulate API calls
        await new Promise(resolve => setTimeout(resolve, 1000));
        setEarningsData(mockEarningsData);
        setStudentAnalytics(mockStudentAnalytics);
      } catch (error) {
        console.error('Failed to fetch analytics data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalyticsData();
  }, []);

  const handleDownloadReport = () => {
    console.log('Downloading earnings report...');
    // Implement report download logic
  };

  const handleRequestPayout = () => {
    console.log('Requesting payout...');
    // Implement payout request logic
  };

  const getPayoutStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return 'text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900/20';
      case 'PROCESSING':
        return 'text-blue-600 bg-blue-100 dark:text-blue-400 dark:bg-blue-900/20';
      case 'PENDING':
        return 'text-yellow-600 bg-yellow-100 dark:text-yellow-400 dark:bg-yellow-900/20';
      default:
        return 'text-gray-600 bg-gray-100 dark:text-gray-400 dark:bg-gray-900/20';
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
            Earnings & Analytics
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Track your earnings and student analytics
          </p>
        </div>
        <div className="flex space-x-3 mt-4 sm:mt-0">
          <Button variant="outline" onClick={handleDownloadReport}>
            <Download className="w-4 h-4 mr-2" />
            Download Report
          </Button>
          <Button variant="primary" onClick={handleRequestPayout}>
            <CreditCard className="w-4 h-4 mr-2" />
            Request Payout
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Card className="p-1">
        <div className="flex space-x-1">
          <button
            onClick={() => setActiveTab('earnings')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === 'earnings'
                ? 'bg-primary-600 text-white'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800'
            }`}
          >
            <DollarSign className="w-4 h-4" />
            <span>Earnings</span>
          </button>
          <button
            onClick={() => setActiveTab('students')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === 'students'
                ? 'bg-primary-600 text-white'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Students</span>
          </button>
        </div>
      </Card>

      {/* Tab Content */}
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
      >
        {activeTab === 'earnings' && earningsData && (
          <div className="space-y-6">
            {/* Earnings Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatsCard
                title="Total Earnings"
                value={`$${earningsData.totalEarnings.toLocaleString()}`}
                icon={DollarSign}
                color="success"
                change={{
                  value: earningsData.monthlyGrowth,
                  type: 'increase',
                  period: 'this month'
                }}
              />
              <StatsCard
                title="This Month"
                value={`$${earningsData.monthlyEarnings.toLocaleString()}`}
                icon={Calendar}
                color="primary"
                change={{
                  value: 8.2,
                  type: 'increase',
                  period: 'vs last month'
                }}
              />
              <StatsCard
                title="Pending Payouts"
                value={`$${earningsData.pendingPayouts.toLocaleString()}`}
                icon={TrendingUp}
                color="warning"
              />
              <StatsCard
                title="Last Payout"
                value={`$${earningsData.lastPayout.toLocaleString()}`}
                icon={CreditCard}
                color="secondary"
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Top Earning Courses */}
              <Card className="p-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                  Top Earning Courses
                </h2>
                <div className="space-y-4">
                  {earningsData.topCourseEarnings.map((course, index) => (
                    <div key={course.courseId} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-primary-100 dark:bg-primary-900/20 rounded-full flex items-center justify-center">
                          <span className="text-sm font-bold text-primary-600 dark:text-primary-400">
                            {index + 1}
                          </span>
                        </div>
                        <div>
                          <h3 className="font-medium text-gray-900 dark:text-white">
                            {course.title}
                          </h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {course.students} students
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-green-600 dark:text-green-400">
                          ${course.earnings.toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Payout History */}
              <Card className="p-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                  Payout History
                </h2>
                <div className="space-y-4">
                  {earningsData.payoutHistory.map((payout) => (
                    <div key={payout.id} className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                      <div>
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="font-medium text-gray-900 dark:text-white">
                            ${payout.amount.toLocaleString()}
                          </span>
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getPayoutStatusColor(payout.status)}`}>
                            {payout.status}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {payout.method} • {new Date(payout.date).toLocaleDateString()}
                        </p>
                      </div>
                      <Button variant="ghost" size="sm">
                        <Eye className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </div>
        )}

        {activeTab === 'students' && studentAnalytics && (
          <div className="space-y-6">
            {/* Student Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatsCard
                title="Total Students"
                value={studentAnalytics.totalStudents.toLocaleString()}
                icon={Users}
                color="primary"
                change={{
                  value: studentAnalytics.studentGrowth,
                  type: 'increase',
                  period: 'this month'
                }}
              />
              <StatsCard
                title="New Students"
                value={studentAnalytics.newStudents}
                icon={TrendingUp}
                color="success"
                change={{
                  value: 18.5,
                  type: 'increase',
                  period: 'vs last month'
                }}
              />
              <StatsCard
                title="Active Students"
                value={studentAnalytics.activeStudents.toLocaleString()}
                icon={BookOpen}
                color="secondary"
              />
              <StatsCard
                title="Completion Rate"
                value={`${studentAnalytics.completionRate}%`}
                icon={Award}
                color="warning"
                change={{
                  value: 3.2,
                  type: 'increase',
                  period: 'vs last month'
                }}
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Student Progress */}
              <Card className="p-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                  Student Progress Overview
                </h2>
                <div className="space-y-6">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Average Progress
                      </span>
                      <span className="text-sm font-bold text-primary-600 dark:text-primary-400">
                        {studentAnalytics.averageProgress}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                      <div
                        className="bg-gradient-to-r from-primary-500 to-primary-600 h-3 rounded-full"
                        style={{ width: `${studentAnalytics.averageProgress}%` }}
                      />
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Completion Rate
                      </span>
                      <span className="text-sm font-bold text-green-600 dark:text-green-400">
                        {studentAnalytics.completionRate}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                      <div
                        className="bg-gradient-to-r from-green-500 to-green-600 h-3 rounded-full"
                        style={{ width: `${studentAnalytics.completionRate}%` }}
                      />
                    </div>
                  </div>
                </div>
              </Card>

              {/* Top Countries */}
              <Card className="p-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                  Students by Country
                </h2>
                <div className="space-y-4">
                  {studentAnalytics.topCountries.map((country, index) => (
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
                          {country.students}
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
        )}
      </motion.div>
    </div>
  );
};

export default EarningsAnalytics;
