import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  BarChart3,
  Users,
  BookOpen,
  Award,
  TrendingUp,
  Clock,
  MessageSquare,
  Download,
  Filter,
  Calendar,
  RefreshCw,
  Eye,
  Target,
  AlertTriangle
} from 'lucide-react';
import { AnalyticsDashboard as AnalyticsDashboardType } from '../../types';
import { useAuthStore } from '../../store/authStore';
import { useToastStore } from '../../store/toastStore';
import Card from '../ui/Card';
import Button from '../ui/Button';
import OverviewCards from './OverviewCards';
import StudentEngagementChart from './StudentEngagementChart';
import ContentPerformanceChart from './ContentPerformanceChart';
import AssessmentAnalyticsChart from './AssessmentAnalyticsChart';
import ForumActivityChart from './ForumActivityChart';
import TimeAnalyticsChart from './TimeAnalyticsChart';
import StudentInsights from './StudentInsights';
import ExportModal from './ExportModal';

interface AnalyticsDashboardProps {
  courseId: string;
}

const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({ courseId }) => {
  const { user } = useAuthStore();
  const { addToast } = useToastStore();

  const [analytics, setAnalytics] = useState<AnalyticsDashboardType | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedTimeRange, setSelectedTimeRange] = useState<'7d' | '30d' | '90d' | '1y'>('30d');
  const [activeTab, setActiveTab] = useState<'overview' | 'engagement' | 'content' | 'assessments' | 'forums' | 'insights'>('overview');
  const [showExportModal, setShowExportModal] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadAnalytics();
  }, [courseId, selectedTimeRange]);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/analytics/course/${courseId}?timeRange=${selectedTimeRange}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const analyticsData = await response.json();
        setAnalytics(analyticsData);
      } else {
        throw new Error('Failed to load analytics');
      }
    } catch (error) {
      addToast('Failed to load analytics data', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadAnalytics();
    setRefreshing(false);
    addToast('Analytics data refreshed', 'success');
  };

  const timeRangeOptions = [
    { value: '7d', label: 'Last 7 days' },
    { value: '30d', label: 'Last 30 days' },
    { value: '90d', label: 'Last 3 months' },
    { value: '1y', label: 'Last year' }
  ];

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'engagement', label: 'Engagement', icon: Users },
    { id: 'content', label: 'Content', icon: BookOpen },
    { id: 'assessments', label: 'Assessments', icon: Award },
    { id: 'forums', label: 'Forums', icon: MessageSquare },
    { id: 'insights', label: 'Insights', icon: Target }
  ];

  const canViewAnalytics = user?.role === 'INSTRUCTOR' || user?.role === 'ADMIN';

  if (!canViewAnalytics) {
    return (
      <Card className="text-center py-12">
        <AlertTriangle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
          Access Restricted
        </h3>
        <p className="text-gray-500 dark:text-gray-400">
          You don't have permission to view analytics for this course.
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Course Analytics
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Comprehensive insights into course performance and student engagement
          </p>
        </div>

        <div className="flex items-center space-x-3">
          {/* Time Range Selector */}
          <select
            value={selectedTimeRange}
            onChange={(e) => setSelectedTimeRange(e.target.value as any)}
            className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm"
          >
            {timeRangeOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

          {/* Refresh Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            loading={refreshing}
            icon={<RefreshCw className="w-4 h-4" />}
          >
            Refresh
          </Button>

          {/* Export Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowExportModal(true)}
            icon={<Download className="w-4 h-4" />}
          >
            Export
          </Button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="flex space-x-8">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Content */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(8)].map((_, index) => (
            <Card key={index} className="animate-pulse">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
              <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-4"></div>
              <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded"></div>
            </Card>
          ))}
        </div>
      ) : analytics ? (
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <OverviewCards overview={analytics.overview} />
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <StudentEngagementChart 
                  data={analytics.studentEngagement} 
                  timeRange={selectedTimeRange}
                  compact
                />
                <ContentPerformanceChart 
                  data={analytics.contentPerformance} 
                  timeRange={selectedTimeRange}
                  compact
                />
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <AssessmentAnalyticsChart 
                  data={analytics.assessmentAnalytics} 
                  timeRange={selectedTimeRange}
                  compact
                />
                <ForumActivityChart 
                  data={analytics.forumActivity} 
                  timeRange={selectedTimeRange}
                  compact
                />
              </div>
            </div>
          )}

          {activeTab === 'engagement' && (
            <StudentEngagementChart 
              data={analytics.studentEngagement} 
              timeRange={selectedTimeRange}
            />
          )}

          {activeTab === 'content' && (
            <ContentPerformanceChart 
              data={analytics.contentPerformance} 
              timeRange={selectedTimeRange}
            />
          )}

          {activeTab === 'assessments' && (
            <AssessmentAnalyticsChart 
              data={analytics.assessmentAnalytics} 
              timeRange={selectedTimeRange}
            />
          )}

          {activeTab === 'forums' && (
            <ForumActivityChart 
              data={analytics.forumActivity} 
              timeRange={selectedTimeRange}
            />
          )}

          {activeTab === 'insights' && (
            <StudentInsights 
              analytics={analytics}
              timeRange={selectedTimeRange}
            />
          )}
        </motion.div>
      ) : (
        <Card className="text-center py-12">
          <BarChart3 className="w-12 h-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No Analytics Data
          </h3>
          <p className="text-gray-500 dark:text-gray-400 mb-6">
            Analytics data is not available for this course yet.
          </p>
          <Button
            variant="primary"
            onClick={handleRefresh}
            icon={<RefreshCw className="w-4 h-4" />}
          >
            Try Again
          </Button>
        </Card>
      )}

      {/* Export Modal */}
      <ExportModal
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
        analytics={analytics}
        courseId={courseId}
        timeRange={selectedTimeRange}
      />
    </div>
  );
};

export default AnalyticsDashboard;
