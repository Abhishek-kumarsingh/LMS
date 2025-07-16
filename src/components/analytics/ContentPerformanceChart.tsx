import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  BookOpen,
  Eye,
  Clock,
  TrendingUp,
  TrendingDown,
  Play,
  Download,
  FileText,
  Video,
  Image,
  BarChart3
} from 'lucide-react';
import { ContentPerformanceMetrics } from '../../types';
import Card from '../ui/Card';
import Button from '../ui/Button';

interface ContentPerformanceChartProps {
  data: ContentPerformanceMetrics;
  timeRange: string;
  compact?: boolean;
}

const ContentPerformanceChart: React.FC<ContentPerformanceChartProps> = ({ 
  data, 
  timeRange, 
  compact = false 
}) => {
  const [activeChart, setActiveChart] = useState<'views' | 'completion' | 'time' | 'popular'>('views');

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  const getContentIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'video':
        return Video;
      case 'document':
      case 'pdf':
        return FileText;
      case 'image':
        return Image;
      case 'lesson':
        return BookOpen;
      default:
        return BookOpen;
    }
  };

  const chartTypes = [
    { id: 'views', label: 'Content Views', icon: Eye },
    { id: 'completion', label: 'Completion Rates', icon: TrendingUp },
    { id: 'time', label: 'Time Spent', icon: Clock },
    { id: 'popular', label: 'Popular Content', icon: BarChart3 }
  ];

  const renderChart = () => {
    switch (activeChart) {
      case 'views':
        return (
          <div className="space-y-4">
            <div className="h-64 bg-gray-50 dark:bg-gray-800 rounded-lg flex items-center justify-center">
              <div className="text-center">
                <Eye className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-500 dark:text-gray-400">Content Views Chart</p>
                <p className="text-xs text-gray-400 dark:text-gray-500">
                  Interactive chart showing content view trends
                </p>
              </div>
            </div>
            
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Top Viewed Content
              </h4>
              {data.contentViews.slice(0, 5).map((content, index) => {
                const Icon = getContentIcon(content.contentType);
                return (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Icon className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                      <div>
                        <div className="font-medium text-gray-900 dark:text-white truncate max-w-xs">
                          {content.contentTitle}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {content.contentType} • {formatTime(content.averageTime)} avg time
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-gray-900 dark:text-white">
                        {content.views}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        views
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );

      case 'completion':
        return (
          <div className="space-y-4">
            <div className="h-64 bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">
                Completion Rate Distribution
              </h4>
              <div className="space-y-3">
                {data.completionRates.slice(0, 8).map((content, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400 truncate max-w-xs">
                      {content.contentTitle}
                    </span>
                    <div className="flex items-center space-x-2">
                      <div className="w-24 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full transition-all ${
                            content.completionRate >= 80 ? 'bg-green-600' :
                            content.completionRate >= 60 ? 'bg-yellow-600' :
                            'bg-red-600'
                          }`}
                          style={{ width: `${content.completionRate}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium text-gray-900 dark:text-white w-12">
                        {Math.round(content.completionRate)}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case 'time':
        return (
          <div className="space-y-4">
            <div className="h-64 bg-gray-50 dark:bg-gray-800 rounded-lg flex items-center justify-center">
              <div className="text-center">
                <Clock className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-500 dark:text-gray-400">Time Spent Analysis</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {data.timeSpent.slice(0, 6).map((content, index) => (
                <div key={index} className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="font-medium text-gray-900 dark:text-white truncate">
                    {content.contentTitle}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    Avg time: {formatTime(content.averageTime)}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    Total: {formatTime(content.totalTime)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 'popular':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {data.popularContent.slice(0, 6).map((content, index) => {
                const Icon = getContentIcon(content.type);
                return (
                  <div key={index} className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="flex items-center space-x-2 mb-2">
                      <Icon className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                      <span className="text-xs text-gray-500 dark:text-gray-400 uppercase">
                        {content.type}
                      </span>
                    </div>
                    <div className="font-medium text-gray-900 dark:text-white mb-2 truncate">
                      {content.title}
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500 dark:text-gray-400">
                        Score: {Math.round(content.score)}
                      </span>
                      <span className="text-gray-500 dark:text-gray-400">
                        {content.views} views
                      </span>
                    </div>
                    <div className="mt-2">
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1">
                        <div 
                          className="bg-blue-600 h-1 rounded-full"
                          style={{ width: `${Math.min(content.engagement, 100)}%` }}
                        />
                      </div>
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
            Content Performance
          </h3>
          <BookOpen className="w-5 h-5 text-blue-500" />
        </div>
        
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {data.contentViews.reduce((sum, c) => sum + c.views, 0)}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">Total Views</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
              {Math.round(data.completionRates.reduce((sum, c) => sum + c.completionRate, 0) / data.completionRates.length)}%
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">Avg Completion</div>
          </div>
        </div>

        <div className="h-32 bg-gray-50 dark:bg-gray-800 rounded-lg flex items-center justify-center">
          <div className="text-center">
            <BookOpen className="w-8 h-8 text-gray-400 mx-auto mb-1" />
            <p className="text-xs text-gray-500 dark:text-gray-400">Content Overview</p>
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
          Content Performance Analytics
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

      {/* Struggling Areas */}
      <Card>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Areas Needing Attention
        </h3>
        
        <div className="space-y-3">
          {data.strugglingAreas.slice(0, 5).map((area, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
              <div className="flex items-center space-x-3">
                <TrendingDown className="w-5 h-5 text-red-500" />
                <div>
                  <div className="font-medium text-gray-900 dark:text-white">
                    {area.contentTitle}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    {area.issueType} • {area.affectedStudents} students affected
                  </div>
                </div>
              </div>
              
              <div className="text-right">
                <div className="text-sm font-medium text-red-600 dark:text-red-400">
                  {Math.round(area.severity * 100)}% severity
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  {area.suggestions.length} suggestions
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Video Analytics */}
      {data.videoAnalytics.length > 0 && (
        <Card>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Video Content Analytics
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {data.videoAnalytics.slice(0, 4).map((video, index) => (
              <div key={index} className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <Play className="w-5 h-5 text-blue-500" />
                  <span className="font-medium text-gray-900 dark:text-white truncate">
                    {video.title}
                  </span>
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <div className="text-gray-500 dark:text-gray-400">Watch Rate</div>
                    <div className="font-semibold text-gray-900 dark:text-white">
                      {Math.round(video.watchRate * 100)}%
                    </div>
                  </div>
                  <div>
                    <div className="text-gray-500 dark:text-gray-400">Avg Watch Time</div>
                    <div className="font-semibold text-gray-900 dark:text-white">
                      {formatTime(video.averageWatchTime)}
                    </div>
                  </div>
                  <div>
                    <div className="text-gray-500 dark:text-gray-400">Drop-off Rate</div>
                    <div className="font-semibold text-gray-900 dark:text-white">
                      {Math.round(video.dropOffRate * 100)}%
                    </div>
                  </div>
                  <div>
                    <div className="text-gray-500 dark:text-gray-400">Replays</div>
                    <div className="font-semibold text-gray-900 dark:text-white">
                      {video.replayCount}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
};

export default ContentPerformanceChart;
