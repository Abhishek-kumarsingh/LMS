import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  BarChart3,
  Users,
  Eye,
  Clock,
  MessageSquare,
  TrendingUp,
  TrendingDown,
  Globe,
  Smartphone,
  Monitor,
  Tablet,
  Download,
  Share2,
  Calendar,
  Play,
  Pause
} from 'lucide-react';
import { VideoStream, StreamAnalytics as StreamAnalyticsType } from '../../types';
import Card from '../ui/Card';
import Button from '../ui/Button';

interface StreamAnalyticsProps {
  streams: VideoStream[];
  courseId?: string;
}

const StreamAnalytics: React.FC<StreamAnalyticsProps> = ({ streams, courseId }) => {
  const [selectedPeriod, setSelectedPeriod] = useState<'7d' | '30d' | '90d' | '1y'>('30d');
  const [selectedMetric, setSelectedMetric] = useState<'views' | 'engagement' | 'retention'>('views');
  const [loading, setLoading] = useState(false);

  const [analyticsData, setAnalyticsData] = useState({
    totalViews: 0,
    uniqueViewers: 0,
    averageWatchTime: 0,
    totalStreams: 0,
    liveStreams: 0,
    peakViewers: 0,
    engagementRate: 0,
    chatMessages: 0,
    trends: {
      views: 12.5,
      viewers: 8.3,
      engagement: -2.1,
      watchTime: 15.7
    }
  });

  const [chartData, setChartData] = useState({
    viewsOverTime: [] as { date: string; views: number; viewers: number }[],
    deviceBreakdown: [
      { device: 'Desktop', percentage: 45, count: 1250 },
      { device: 'Mobile', percentage: 35, count: 970 },
      { device: 'Tablet', percentage: 20, count: 555 }
    ],
    geographicData: [
      { country: 'United States', viewers: 450, percentage: 32.1 },
      { country: 'United Kingdom', viewers: 280, percentage: 20.0 },
      { country: 'Canada', viewers: 190, percentage: 13.6 },
      { country: 'Australia', viewers: 150, percentage: 10.7 },
      { country: 'Germany', viewers: 120, percentage: 8.6 },
      { country: 'Others', viewers: 210, percentage: 15.0 }
    ],
    retentionData: [] as { timestamp: number; percentage: number }[]
  });

  useEffect(() => {
    loadAnalytics();
  }, [selectedPeriod, streams]);

  const loadAnalytics = async () => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Calculate analytics from streams data
      const totalViews = streams.reduce((sum, stream) => sum + stream.totalViews, 0);
      const totalStreams = streams.length;
      const liveStreams = streams.filter(s => s.status === 'LIVE').length;
      const peakViewers = Math.max(...streams.map(s => s.analytics.peakViewers));
      const avgEngagement = streams.reduce((sum, stream) => sum + stream.analytics.engagementRate, 0) / streams.length;
      const totalChatMessages = streams.reduce((sum, stream) => sum + stream.analytics.chatMessages, 0);
      const avgWatchTime = streams.reduce((sum, stream) => sum + stream.analytics.averageWatchTime, 0) / streams.length;

      setAnalyticsData({
        totalViews,
        uniqueViewers: Math.floor(totalViews * 0.7), // Estimate unique viewers
        averageWatchTime: avgWatchTime,
        totalStreams,
        liveStreams,
        peakViewers,
        engagementRate: avgEngagement,
        chatMessages: totalChatMessages,
        trends: {
          views: 12.5,
          viewers: 8.3,
          engagement: -2.1,
          watchTime: 15.7
        }
      });

      // Generate sample chart data
      const dates = Array.from({ length: 30 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - (29 - i));
        return date.toISOString().split('T')[0];
      });

      setChartData(prev => ({
        ...prev,
        viewsOverTime: dates.map(date => ({
          date,
          views: Math.floor(Math.random() * 500) + 100,
          viewers: Math.floor(Math.random() * 200) + 50
        })),
        retentionData: Array.from({ length: 100 }, (_, i) => ({
          timestamp: i,
          percentage: Math.max(0, 100 - (i * 0.8) - Math.random() * 20)
        }))
      }));
    } catch (error) {
      console.error('Failed to load analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  const getTrendIcon = (trend: number) => {
    return trend > 0 ? TrendingUp : TrendingDown;
  };

  const getTrendColor = (trend: number) => {
    return trend > 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400';
  };

  const periods = [
    { value: '7d', label: 'Last 7 days' },
    { value: '30d', label: 'Last 30 days' },
    { value: '90d', label: 'Last 3 months' },
    { value: '1y', label: 'Last year' }
  ];

  const metrics = [
    { value: 'views', label: 'Views & Viewers' },
    { value: 'engagement', label: 'Engagement' },
    { value: 'retention', label: 'Retention' }
  ];

  const deviceIcons = {
    Desktop: Monitor,
    Mobile: Smartphone,
    Tablet: Tablet
  };

  if (loading) {
    return (
      <div className="space-y-6">
        {[...Array(6)].map((_, i) => (
          <Card key={i}>
            <div className="animate-pulse">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-4"></div>
              <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
            </div>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div className="flex items-center space-x-4">
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value as any)}
            className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm"
          >
            {periods.map(period => (
              <option key={period.value} value={period.value}>
                {period.label}
              </option>
            ))}
          </select>

          <select
            value={selectedMetric}
            onChange={(e) => setSelectedMetric(e.target.value as any)}
            className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm"
          >
            {metrics.map(metric => (
              <option key={metric.value} value={metric.value}>
                {metric.label}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            icon={<Download className="w-4 h-4" />}
          >
            Export
          </Button>
          <Button
            variant="outline"
            size="sm"
            icon={<Share2 className="w-4 h-4" />}
          >
            Share
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Views</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {formatNumber(analyticsData.totalViews)}
              </p>
            </div>
            <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-full">
              <Eye className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
          <div className="flex items-center mt-2">
            {React.createElement(getTrendIcon(analyticsData.trends.views), {
              className: `w-4 h-4 ${getTrendColor(analyticsData.trends.views)}`
            })}
            <span className={`text-sm font-medium ml-1 ${getTrendColor(analyticsData.trends.views)}`}>
              {Math.abs(analyticsData.trends.views)}%
            </span>
            <span className="text-sm text-gray-500 dark:text-gray-400 ml-1">vs last period</span>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Unique Viewers</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {formatNumber(analyticsData.uniqueViewers)}
              </p>
            </div>
            <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-full">
              <Users className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
          <div className="flex items-center mt-2">
            {React.createElement(getTrendIcon(analyticsData.trends.viewers), {
              className: `w-4 h-4 ${getTrendColor(analyticsData.trends.viewers)}`
            })}
            <span className={`text-sm font-medium ml-1 ${getTrendColor(analyticsData.trends.viewers)}`}>
              {Math.abs(analyticsData.trends.viewers)}%
            </span>
            <span className="text-sm text-gray-500 dark:text-gray-400 ml-1">vs last period</span>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Avg Watch Time</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {formatDuration(analyticsData.averageWatchTime)}
              </p>
            </div>
            <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-full">
              <Clock className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
          <div className="flex items-center mt-2">
            {React.createElement(getTrendIcon(analyticsData.trends.watchTime), {
              className: `w-4 h-4 ${getTrendColor(analyticsData.trends.watchTime)}`
            })}
            <span className={`text-sm font-medium ml-1 ${getTrendColor(analyticsData.trends.watchTime)}`}>
              {Math.abs(analyticsData.trends.watchTime)}%
            </span>
            <span className="text-sm text-gray-500 dark:text-gray-400 ml-1">vs last period</span>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Engagement Rate</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {analyticsData.engagementRate.toFixed(1)}%
              </p>
            </div>
            <div className="p-3 bg-orange-100 dark:bg-orange-900/30 rounded-full">
              <MessageSquare className="w-6 h-6 text-orange-600 dark:text-orange-400" />
            </div>
          </div>
          <div className="flex items-center mt-2">
            {React.createElement(getTrendIcon(analyticsData.trends.engagement), {
              className: `w-4 h-4 ${getTrendColor(analyticsData.trends.engagement)}`
            })}
            <span className={`text-sm font-medium ml-1 ${getTrendColor(analyticsData.trends.engagement)}`}>
              {Math.abs(analyticsData.trends.engagement)}%
            </span>
            <span className="text-sm text-gray-500 dark:text-gray-400 ml-1">vs last period</span>
          </div>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Views Over Time */}
        <Card>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Views Over Time
          </h3>
          <div className="h-64 flex items-end justify-between space-x-1">
            {chartData.viewsOverTime.slice(-14).map((data, index) => (
              <div key={index} className="flex-1 flex flex-col items-center">
                <div
                  className="w-full bg-primary-500 rounded-t"
                  style={{ height: `${(data.views / 500) * 100}%` }}
                  title={`${data.views} views on ${data.date}`}
                />
                <span className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {new Date(data.date).getDate()}
                </span>
              </div>
            ))}
          </div>
        </Card>

        {/* Device Breakdown */}
        <Card>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Device Breakdown
          </h3>
          <div className="space-y-4">
            {chartData.deviceBreakdown.map((device) => {
              const Icon = deviceIcons[device.device as keyof typeof deviceIcons];
              return (
                <div key={device.device} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Icon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {device.device}
                    </span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-24 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div
                        className="bg-primary-500 h-2 rounded-full"
                        style={{ width: `${device.percentage}%` }}
                      />
                    </div>
                    <span className="text-sm text-gray-600 dark:text-gray-400 w-12 text-right">
                      {device.percentage}%
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      </div>

      {/* Geographic Data */}
      <Card>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Geographic Distribution
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {chartData.geographicData.map((country) => (
            <div key={country.country} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="flex items-center space-x-3">
                <Globe className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {country.country}
                </span>
              </div>
              <div className="text-right">
                <div className="text-sm font-medium text-gray-900 dark:text-white">
                  {country.viewers}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  {country.percentage}%
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Stream Performance */}
      <Card>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Recent Streams Performance
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Stream</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Date</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Views</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Peak Viewers</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Avg Watch Time</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Engagement</th>
              </tr>
            </thead>
            <tbody>
              {streams.slice(0, 5).map((stream) => (
                <tr key={stream.id} className="border-b border-gray-100 dark:border-gray-800">
                  <td className="py-3 px-4">
                    <div className="flex items-center space-x-3">
                      <div className={`w-2 h-2 rounded-full ${
                        stream.status === 'LIVE' ? 'bg-red-500' :
                        stream.status === 'ENDED' ? 'bg-green-500' :
                        'bg-gray-400'
                      }`} />
                      <span className="text-sm font-medium text-gray-900 dark:text-white truncate max-w-xs">
                        {stream.title}
                      </span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400">
                    {stream.actualStartTime ? new Date(stream.actualStartTime).toLocaleDateString() : '-'}
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-900 dark:text-white">
                    {formatNumber(stream.totalViews)}
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-900 dark:text-white">
                    {formatNumber(stream.analytics.peakViewers)}
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-900 dark:text-white">
                    {formatDuration(stream.analytics.averageWatchTime)}
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-900 dark:text-white">
                    {stream.analytics.engagementRate.toFixed(1)}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

export default StreamAnalytics;
