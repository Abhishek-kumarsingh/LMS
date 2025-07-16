import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  MessageSquare,
  Users,
  Clock,
  TrendingUp,
  Heart,
  Shield,
  BookOpen,
  BarChart3,
  ThumbsUp,
  MessageCircle
} from 'lucide-react';
import { ForumActivityMetrics } from '../../types';
import Card from '../ui/Card';
import Button from '../ui/Button';

interface ForumActivityChartProps {
  data: ForumActivityMetrics;
  timeRange: string;
  compact?: boolean;
}

const ForumActivityChart: React.FC<ForumActivityChartProps> = ({ 
  data, 
  timeRange, 
  compact = false 
}) => {
  const [activeChart, setActiveChart] = useState<'activity' | 'participation' | 'topics' | 'sentiment'>('activity');

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment.toLowerCase()) {
      case 'positive':
        return 'text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/30';
      case 'negative':
        return 'text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/30';
      case 'neutral':
        return 'text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-700';
      default:
        return 'text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-700';
    }
  };

  const chartTypes = [
    { id: 'activity', label: 'Post Activity', icon: MessageSquare },
    { id: 'participation', label: 'User Participation', icon: Users },
    { id: 'topics', label: 'Popular Topics', icon: TrendingUp },
    { id: 'sentiment', label: 'Sentiment Analysis', icon: Heart }
  ];

  const renderChart = () => {
    switch (activeChart) {
      case 'activity':
        return (
          <div className="space-y-4">
            <div className="h-64 bg-gray-50 dark:bg-gray-800 rounded-lg flex items-center justify-center">
              <div className="text-center">
                <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-500 dark:text-gray-400">Forum Activity Timeline</p>
                <p className="text-xs text-gray-400 dark:text-gray-500">
                  Posts and replies over time
                </p>
              </div>
            </div>
            
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {data.postActivity.reduce((sum, p) => sum + p.value, 0)}
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">Total Posts</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {Math.round(data.postActivity.reduce((sum, p) => sum + p.value, 0) / data.postActivity.length)}
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">Daily Average</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                  {formatTime(data.responseTime.reduce((sum, r) => sum + r.averageTime, 0) / data.responseTime.length)}
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">Avg Response Time</div>
              </div>
            </div>
          </div>
        );

      case 'participation':
        return (
          <div className="space-y-4">
            <div className="h-64 bg-gray-50 dark:bg-gray-800 rounded-lg p-4 overflow-y-auto">
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">
                Top Contributors
              </h4>
              <div className="space-y-3">
                {data.userParticipation.slice(0, 8).map((user, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-white dark:bg-gray-700 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center text-white text-xs font-medium">
                        {user.user?.firstName?.[0] || 'U'}
                      </div>
                      <div>
                        <div className="font-medium text-gray-900 dark:text-white">
                          {user.user?.firstName && user.user?.lastName 
                            ? `${user.user.firstName} ${user.user.lastName}`
                            : user.user?.email || 'Unknown User'
                          }
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {user.posts} posts • {user.replies} replies • {user.votes} votes
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className="text-lg font-bold text-primary-600 dark:text-primary-400">
                        {Math.round(user.participationScore)}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        score
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case 'topics':
        return (
          <div className="space-y-4">
            <div className="h-64 bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">
                Most Popular Discussion Topics
              </h4>
              <div className="space-y-3">
                {data.topicPopularity.slice(0, 8).map((topic, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <BookOpen className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                      <span className="text-sm font-medium text-gray-900 dark:text-white truncate max-w-xs">
                        {topic.topicTitle}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-24 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full"
                          style={{ width: `${(topic.engagementScore / 100) * 100}%` }}
                        />
                      </div>
                      <span className="text-sm text-gray-600 dark:text-gray-400 w-8">
                        {topic.postCount}
                      </span>
                      <span className="text-sm font-medium text-gray-900 dark:text-white w-12">
                        {Math.round(topic.engagementScore)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case 'sentiment':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              {data.sentimentAnalysis.map((sentiment, index) => (
                <div key={index} className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className={`text-2xl font-bold ${
                    sentiment.sentiment === 'positive' ? 'text-green-600 dark:text-green-400' :
                    sentiment.sentiment === 'negative' ? 'text-red-600 dark:text-red-400' :
                    'text-gray-600 dark:text-gray-400'
                  }`}>
                    {Math.round(sentiment.percentage)}%
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400 capitalize">
                    {sentiment.sentiment}
                  </div>
                  <div className="text-xs text-gray-400 dark:text-gray-500">
                    {sentiment.count} posts
                  </div>
                </div>
              ))}
            </div>
            
            <div className="h-48 bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">
                Sentiment Trends Over Time
              </h4>
              <div className="h-32 flex items-center justify-center">
                <div className="text-center">
                  <Heart className="w-8 h-8 text-gray-400 mx-auto mb-1" />
                  <p className="text-xs text-gray-500 dark:text-gray-400">Sentiment timeline chart</p>
                </div>
              </div>
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
            Forum Activity
          </h3>
          <MessageSquare className="w-5 h-5 text-purple-500" />
        </div>
        
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
              {data.postActivity.reduce((sum, p) => sum + p.value, 0)}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">Total Posts</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {data.userParticipation.length}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">Active Users</div>
          </div>
        </div>

        <div className="h-32 bg-gray-50 dark:bg-gray-800 rounded-lg flex items-center justify-center">
          <div className="text-center">
            <MessageSquare className="w-8 h-8 text-gray-400 mx-auto mb-1" />
            <p className="text-xs text-gray-500 dark:text-gray-400">Forum Overview</p>
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
          Forum Activity Analytics
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

      {/* Response Time Analysis */}
      <Card>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Response Time Analysis
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {data.responseTime.map((response, index) => (
            <div key={index} className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <Clock className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {response.forumType}
                </span>
              </div>
              
              <div className="text-lg font-bold text-gray-900 dark:text-white">
                {formatTime(response.averageTime)}
              </div>
              
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Average response time
              </div>
              
              <div className="mt-2 text-xs text-gray-400 dark:text-gray-500">
                {response.responseCount} responses analyzed
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Moderation Stats */}
      <Card>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Moderation Statistics
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {data.moderationStats.map((stat, index) => (
            <div key={index} className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <Shield className="w-5 h-5 text-blue-500" />
                  <span className="font-medium text-gray-900 dark:text-white">
                    {stat.actionType}
                  </span>
                </div>
                <span className="text-lg font-bold text-gray-900 dark:text-white">
                  {stat.count}
                </span>
              </div>
              
              <div className="text-sm text-gray-500 dark:text-gray-400">
                {stat.description}
              </div>
              
              {stat.trend && (
                <div className={`text-xs mt-1 ${
                  stat.trend > 0 ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'
                }`}>
                  {stat.trend > 0 ? '↑' : '↓'} {Math.abs(stat.trend)}% from last period
                </div>
              )}
            </div>
          ))}
        </div>
      </Card>

      {/* Knowledge Sharing */}
      <Card>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Knowledge Sharing Insights
        </h3>
        
        <div className="space-y-3">
          {data.knowledgeSharing.slice(0, 5).map((insight, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-1">
                  <ThumbsUp className="w-4 h-4 text-green-500" />
                  <MessageCircle className="w-4 h-4 text-blue-500" />
                </div>
                <div>
                  <div className="font-medium text-gray-900 dark:text-white">
                    {insight.topicTitle}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    {insight.helpfulAnswers} helpful answers • {insight.totalInteractions} interactions
                  </div>
                </div>
              </div>
              
              <div className="text-right">
                <div className="text-sm font-medium text-green-600 dark:text-green-400">
                  {Math.round(insight.knowledgeScore)}/100
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  knowledge score
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};

export default ForumActivityChart;
