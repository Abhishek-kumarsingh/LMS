import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Target,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Users,
  Clock,
  Award,
  BookOpen,
  MessageSquare,
  Eye,
  CheckCircle,
  XCircle,
  Lightbulb,
  Filter
} from 'lucide-react';
import { AnalyticsDashboard } from '../../types';
import Card from '../ui/Card';
import Button from '../ui/Button';

interface StudentInsightsProps {
  analytics: AnalyticsDashboard;
  timeRange: string;
}

const StudentInsights: React.FC<StudentInsightsProps> = ({ analytics, timeRange }) => {
  const [selectedRiskLevel, setSelectedRiskLevel] = useState<'all' | 'high' | 'medium' | 'low'>('all');
  const [selectedMetric, setSelectedMetric] = useState<'engagement' | 'performance' | 'participation'>('engagement');

  const generateInsights = () => {
    const insights = [];

    // Engagement insights
    if (analytics.studentEngagement.participationRate < 60) {
      insights.push({
        type: 'warning',
        category: 'Engagement',
        title: 'Low Participation Rate',
        description: `Only ${Math.round(analytics.studentEngagement.participationRate)}% of students are actively participating. Consider implementing engagement strategies.`,
        recommendation: 'Add interactive elements, discussion prompts, or gamification features.',
        priority: 'high',
        affectedStudents: Math.round(analytics.overview.totalStudents * (1 - analytics.studentEngagement.participationRate / 100))
      });
    }

    // Content insights
    const lowCompletionContent = analytics.contentPerformance.completionRates.filter(c => c.completionRate < 50);
    if (lowCompletionContent.length > 0) {
      insights.push({
        type: 'warning',
        category: 'Content',
        title: 'Content with Low Completion Rates',
        description: `${lowCompletionContent.length} content items have completion rates below 50%.`,
        recommendation: 'Review content difficulty, length, or add more engaging elements.',
        priority: 'medium',
        affectedStudents: Math.round(analytics.overview.totalStudents * 0.6)
      });
    }

    // Assessment insights
    const averageGrade = analytics.overview.averageGrade;
    if (averageGrade < 70) {
      insights.push({
        type: 'error',
        category: 'Performance',
        title: 'Below Average Performance',
        description: `Class average of ${Math.round(averageGrade)}% indicates students may be struggling.`,
        recommendation: 'Consider additional support materials, tutoring sessions, or review sessions.',
        priority: 'high',
        affectedStudents: Math.round(analytics.overview.totalStudents * 0.7)
      });
    }

    // Forum insights
    const forumPosts = analytics.overview.totalForumPosts;
    const expectedPosts = analytics.overview.totalStudents * 2; // Expected 2 posts per student
    if (forumPosts < expectedPosts) {
      insights.push({
        type: 'info',
        category: 'Discussion',
        title: 'Low Forum Activity',
        description: `Forum activity is below expected levels. Only ${forumPosts} posts from ${analytics.overview.totalStudents} students.`,
        recommendation: 'Create discussion prompts, require forum participation, or add forum-based assignments.',
        priority: 'medium',
        affectedStudents: Math.round(analytics.overview.totalStudents * 0.8)
      });
    }

    // Positive insights
    if (analytics.overview.completionRate > 85) {
      insights.push({
        type: 'success',
        category: 'Achievement',
        title: 'Excellent Completion Rate',
        description: `${Math.round(analytics.overview.completionRate)}% completion rate shows strong student commitment.`,
        recommendation: 'Continue current strategies and consider sharing best practices with other courses.',
        priority: 'low',
        affectedStudents: Math.round(analytics.overview.totalStudents * analytics.overview.completionRate / 100)
      });
    }

    return insights;
  };

  const getAtRiskStudents = () => {
    return analytics.studentEngagement.engagementTrends.filter(student => {
      if (selectedRiskLevel === 'all') return true;
      return student.riskLevel === selectedRiskLevel;
    });
  };

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'success':
        return CheckCircle;
      case 'warning':
        return AlertTriangle;
      case 'error':
        return XCircle;
      case 'info':
      default:
        return Lightbulb;
    }
  };

  const getInsightColor = (type: string) => {
    switch (type) {
      case 'success':
        return 'text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/30';
      case 'warning':
        return 'text-yellow-600 dark:text-yellow-400 bg-yellow-100 dark:bg-yellow-900/30';
      case 'error':
        return 'text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/30';
      case 'info':
      default:
        return 'text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/30';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200';
      case 'medium':
        return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200';
      case 'low':
        return 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200';
      default:
        return 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200';
    }
  };

  const insights = generateInsights();
  const atRiskStudents = getAtRiskStudents();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          Student Insights & Recommendations
        </h2>
        <div className="text-sm text-gray-500 dark:text-gray-400">
          AI-powered analysis for {timeRange === '7d' ? 'last 7 days' : 
           timeRange === '30d' ? 'last 30 days' : 
           timeRange === '90d' ? 'last 3 months' : 'last year'}
        </div>
      </div>

      {/* Key Insights */}
      <Card>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Key Insights & Recommendations
        </h3>
        
        <div className="space-y-4">
          {insights.map((insight, index) => {
            const Icon = getInsightIcon(insight.type);
            
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg"
              >
                <div className="flex items-start space-x-4">
                  <div className={`p-2 rounded-lg ${getInsightColor(insight.type)}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold text-gray-900 dark:text-white">
                        {insight.title}
                      </h4>
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(insight.priority)}`}>
                          {insight.priority} priority
                        </span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {insight.category}
                        </span>
                      </div>
                    </div>
                    
                    <p className="text-gray-600 dark:text-gray-400 mb-2">
                      {insight.description}
                    </p>
                    
                    <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                      <div className="text-sm font-medium text-gray-900 dark:text-white mb-1">
                        💡 Recommendation:
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        {insight.recommendation}
                      </div>
                    </div>
                    
                    <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                      Affects approximately {insight.affectedStudents} students
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </Card>

      {/* At-Risk Students */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Students Requiring Attention
          </h3>
          
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-gray-500 dark:text-gray-400" />
            <select
              value={selectedRiskLevel}
              onChange={(e) => setSelectedRiskLevel(e.target.value as any)}
              className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-1 text-sm"
            >
              <option value="all">All Risk Levels</option>
              <option value="high">High Risk</option>
              <option value="medium">Medium Risk</option>
              <option value="low">Low Risk</option>
            </select>
          </div>
        </div>
        
        <div className="space-y-3">
          {atRiskStudents.slice(0, 10).map((student, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg"
            >
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center text-white font-medium">
                  {student.student?.firstName?.[0] || 'U'}
                </div>
                
                <div>
                  <div className="font-medium text-gray-900 dark:text-white">
                    {student.student?.firstName && student.student?.lastName 
                      ? `${student.student.firstName} ${student.student.lastName}`
                      : student.student?.email || 'Unknown Student'
                    }
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    Last active: {new Date(student.lastActive).toLocaleDateString()}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                <div className="text-right">
                  <div className="text-sm font-medium text-gray-900 dark:text-white">
                    Engagement: {Math.round(student.engagementScore)}/100
                  </div>
                  <div className={`text-xs flex items-center space-x-1 ${
                    student.trend === 'increasing' ? 'text-green-600 dark:text-green-400' :
                    student.trend === 'decreasing' ? 'text-red-600 dark:text-red-400' :
                    'text-gray-500 dark:text-gray-400'
                  }`}>
                    {student.trend === 'increasing' ? <TrendingUp className="w-3 h-3" /> :
                     student.trend === 'decreasing' ? <TrendingDown className="w-3 h-3" /> :
                     <div className="w-3 h-3" />}
                    <span>{student.trend}</span>
                  </div>
                </div>
                
                <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                  student.riskLevel === 'high' ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400' :
                  student.riskLevel === 'medium' ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400' :
                  'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400'
                }`}>
                  {student.riskLevel} risk
                </div>
              </div>
            </motion.div>
          ))}
        </div>
        
        {atRiskStudents.length === 0 && (
          <div className="text-center py-8">
            <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
            <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              All Students Engaged
            </h4>
            <p className="text-gray-500 dark:text-gray-400">
              No students currently require immediate attention.
            </p>
          </div>
        )}
      </Card>

      {/* Performance Metrics Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <Users className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {analytics.studentEngagement.engagementTrends.filter(s => s.riskLevel === 'high').length}
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">High Risk Students</div>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <TrendingUp className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {analytics.studentEngagement.engagementTrends.filter(s => s.trend === 'increasing').length}
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">Improving Students</div>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
              <Clock className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {Math.round(analytics.studentEngagement.averageSessionTime / 60)}m
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">Avg Session Time</div>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
              <Target className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {Math.round(analytics.overview.engagementScore)}
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">Engagement Score</div>
            </div>
          </div>
        </Card>
      </div>

      {/* Action Items */}
      <Card>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Recommended Actions
        </h3>
        
        <div className="space-y-3">
          {insights.filter(i => i.priority === 'high').map((insight, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
              <div className="flex items-center space-x-3">
                <AlertTriangle className="w-5 h-5 text-red-500" />
                <div>
                  <div className="font-medium text-gray-900 dark:text-white">
                    {insight.title}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    {insight.recommendation}
                  </div>
                </div>
              </div>
              <Button variant="outline" size="sm">
                Take Action
              </Button>
            </div>
          ))}
          
          {insights.filter(i => i.priority === 'high').length === 0 && (
            <div className="text-center py-4">
              <CheckCircle className="w-8 h-8 text-green-500 mx-auto mb-2" />
              <p className="text-gray-500 dark:text-gray-400">
                No high-priority actions required at this time.
              </p>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

export default StudentInsights;
