import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Users,
  Clock,
  Smartphone,
  Monitor,
  Tablet,
  TrendingUp,
  Activity,
  Eye,
  BarChart3
} from 'lucide-react';
import { StudentEngagementMetrics } from '../../types';
import Card from '../ui/Card';
import Button from '../ui/Button';

interface StudentEngagementChartProps {
  data: StudentEngagementMetrics;
  timeRange: string;
  compact?: boolean;
}

const StudentEngagementChart: React.FC<StudentEngagementChartProps> = ({ 
  data, 
  timeRange, 
  compact = false 
}) => {
  const [activeChart, setActiveChart] = useState<'daily' | 'weekly' | 'sessions' | 'devices'>('daily');

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  const getDeviceIcon = (device: string) => {
    switch (device.toLowerCase()) {
      case 'mobile':
        return Smartphone;
      case 'tablet':
        return Tablet;
      case 'desktop':
      default:
        return Monitor;
    }
  };

  const chartTypes = [
    { id: 'daily', label: 'Daily Active', icon: Users },
    { id: 'weekly', label: 'Weekly Active', icon: Activity },
    { id: 'sessions', label: 'Session Duration', icon: Clock },
    { id: 'devices', label: 'Device Usage', icon: Monitor }
  ];

  const renderChart = () => {
    switch (activeChart) {
      case 'daily':
        return (
          <div className="space-y-4">
            <div className="h-64 bg-gray-50 dark:bg-gray-800 rounded-lg flex items-center justify-center">
              <div className="text-center">
                <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-500 dark:text-gray-400">Daily Active Users Chart</p>
                <p className="text-xs text-gray-400 dark:text-gray-500">
                  Chart implementation with recharts/d3 would go here
                </p>
              </div>
            </div>
            
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {data.dailyActiveUsers.length > 0 
                    ? Math.round(data.dailyActiveUsers.reduce((sum, d) => sum + d.value, 0) / data.dailyActiveUsers.length)
                    : 0
                  }
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">Avg Daily Users</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {Math.round(data.participationRate)}%
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">Participation Rate</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {data.peakActivityHours.length > 0 ? `${data.peakActivityHours[0]}:00` : 'N/A'}
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">Peak Hour</div>
              </div>
            </div>
          </div>
        );

      case 'weekly':
        return (
          <div className="space-y-4">
            <div className="h-64 bg-gray-50 dark:bg-gray-800 rounded-lg flex items-center justify-center">
              <div className="text-center">
                <Activity className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-500 dark:text-gray-400">Weekly Active Users Chart</p>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {data.weeklyActiveUsers.length > 0 
                    ? Math.round(data.weeklyActiveUsers.reduce((sum, d) => sum + d.value, 0) / data.weeklyActiveUsers.length)
                    : 0
                  }
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">Avg Weekly Users</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                  {formatTime(data.averageSessionTime)}
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">Avg Session Time</div>
              </div>
            </div>
          </div>
        );

      case 'sessions':
        return (
          <div className="space-y-4">
            <div className="h-64 bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">
                Session Duration Distribution
              </h4>
              <div className="space-y-3">
                {data.sessionDuration.map((session, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {session.category}
                    </span>
                    <div className="flex items-center space-x-2">
                      <div className="w-32 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full transition-all"
                          style={{ width: `${session.percentage}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium text-gray-900 dark:text-white w-12">
                        {session.percentage}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case 'devices':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {data.deviceUsage.map((device, index) => {
                const Icon = getDeviceIcon(device.device);
                return (
                  <div key={index} className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <Icon className="w-8 h-8 text-gray-600 dark:text-gray-400 mx-auto mb-2" />
                    <div className="text-lg font-semibold text-gray-900 dark:text-white">
                      {device.percentage}%
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                      {device.device}
                    </div>
                    <div className="text-xs text-gray-400 dark:text-gray-500">
                      {device.sessions} sessions
                    </div>
                    <div className="text-xs text-gray-400 dark:text-gray-500">
                      Avg: {formatTime(device.averageTime)}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  if (compact) {
    return (
      <Card>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Student Engagement
          </h3>
          <TrendingUp className="w-5 h-5 text-green-500" />
        </div>
        
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {Math.round(data.participationRate)}%
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">Participation</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
              {formatTime(data.averageSessionTime)}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">Avg Session</div>
          </div>
        </div>

        <div className="h-32 bg-gray-50 dark:bg-gray-800 rounded-lg flex items-center justify-center">
          <div className="text-center">
            <Users className="w-8 h-8 text-gray-400 mx-auto mb-1" />
            <p className="text-xs text-gray-500 dark:text-gray-400">Engagement Overview</p>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          Student Engagement Analytics
        </h2>
        <div className="text-sm text-gray-500 dark:text-gray-400">
          {timeRange === '7d' ? 'Last 7 days' : 
           timeRange === '30d' ? 'Last 30 days' : 
           timeRange === '90d' ? 'Last 3 months' : 'Last year'}
        </div>
      </div>

      {/* Chart Type Selector */}
      <div className="flex space-x-2 overflow-x-auto">
        {chartTypes.map((type) => {
          const Icon = type.icon;
          return (
            <Button
              key={type.id}
              variant={activeChart === type.id ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setActiveChart(type.id as any)}
              icon={<Icon className="w-4 h-4" />}
            >
              {type.label}
            </Button>
          );
        })}
      </div>

      {/* Chart Content */}
      <Card>
        <motion.div
          key={activeChart}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {renderChart()}
        </motion.div>
      </Card>

      {/* Engagement Trends */}
      <Card>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Student Engagement Trends
        </h3>
        
        <div className="space-y-3">
          {data.engagementTrends.slice(0, compact ? 3 : 10).map((trend, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center text-white text-xs font-medium">
                  {trend.student?.firstName?.[0] || 'U'}
                </div>
                <div>
                  <div className="font-medium text-gray-900 dark:text-white">
                    {trend.student?.firstName && trend.student?.lastName 
                      ? `${trend.student.firstName} ${trend.student.lastName}`
                      : trend.student?.email || 'Unknown Student'
                    }
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    Last active: {new Date(trend.lastActive).toLocaleDateString()}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <div className="text-right">
                  <div className="text-sm font-medium text-gray-900 dark:text-white">
                    {Math.round(trend.engagementScore)}/100
                  </div>
                  <div className={`text-xs ${
                    trend.trend === 'increasing' ? 'text-green-600 dark:text-green-400' :
                    trend.trend === 'decreasing' ? 'text-red-600 dark:text-red-400' :
                    'text-gray-500 dark:text-gray-400'
                  }`}>
                    {trend.trend}
                  </div>
                </div>
                
                <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                  trend.riskLevel === 'low' ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400' :
                  trend.riskLevel === 'medium' ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400' :
                  'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400'
                }`}>
                  {trend.riskLevel} risk
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};

export default StudentEngagementChart;
