import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Award,
  BarChart3,
  Clock,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Target,
  RefreshCw,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { AssessmentAnalyticsMetrics } from '../../types';
import Card from '../ui/Card';
import Button from '../ui/Button';

interface AssessmentAnalyticsChartProps {
  data: AssessmentAnalyticsMetrics;
  timeRange: string;
  compact?: boolean;
}

const AssessmentAnalyticsChart: React.FC<AssessmentAnalyticsChartProps> = ({ 
  data, 
  timeRange, 
  compact = false 
}) => {
  const [activeChart, setActiveChart] = useState<'grades' | 'submissions' | 'questions' | 'trends'>('grades');

  const getGradeColor = (grade: string) => {
    switch (grade) {
      case 'A':
      case 'A+':
      case 'A-':
        return 'bg-green-500';
      case 'B':
      case 'B+':
      case 'B-':
        return 'bg-blue-500';
      case 'C':
      case 'C+':
      case 'C-':
        return 'bg-yellow-500';
      case 'D':
      case 'D+':
      case 'D-':
        return 'bg-orange-500';
      case 'F':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy':
        return 'text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/30';
      case 'medium':
        return 'text-yellow-600 dark:text-yellow-400 bg-yellow-100 dark:bg-yellow-900/30';
      case 'hard':
        return 'text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/30';
      default:
        return 'text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-700';
    }
  };

  const chartTypes = [
    { id: 'grades', label: 'Grade Distribution', icon: Award },
    { id: 'submissions', label: 'Submission Patterns', icon: Clock },
    { id: 'questions', label: 'Question Analysis', icon: Target },
    { id: 'trends', label: 'Improvement Trends', icon: TrendingUp }
  ];

  const renderChart = () => {
    switch (activeChart) {
      case 'grades':
        return (
          <div className="space-y-4">
            <div className="h-64 bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">
                Grade Distribution
              </h4>
              <div className="space-y-3">
                {data.gradeDistribution.map((grade, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className={`w-4 h-4 rounded ${getGradeColor(grade.grade)}`} />
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        Grade {grade.grade}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-32 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full ${getGradeColor(grade.grade)}`}
                          style={{ width: `${grade.percentage}%` }}
                        />
                      </div>
                      <span className="text-sm text-gray-600 dark:text-gray-400 w-12">
                        {grade.count}
                      </span>
                      <span className="text-sm font-medium text-gray-900 dark:text-white w-12">
                        {grade.percentage}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {Math.round(data.averageScores.reduce((sum, s) => sum + s.value, 0) / data.averageScores.length)}%
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">Average Score</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {data.gradeDistribution.filter(g => ['A', 'A+', 'A-', 'B', 'B+', 'B-'].includes(g.grade))
                    .reduce((sum, g) => sum + g.percentage, 0)}%
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">Passing Rate</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {data.gradeDistribution.reduce((sum, g) => sum + g.count, 0)}
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">Total Submissions</div>
              </div>
            </div>
          </div>
        );

      case 'submissions':
        return (
          <div className="space-y-4">
            <div className="h-64 bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">
                Submission Timing Patterns
              </h4>
              <div className="space-y-3">
                {data.submissionPatterns.map((pattern, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {pattern.timeToDeadline}
                    </span>
                    <div className="flex items-center space-x-2">
                      <div className="w-24 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full"
                          style={{ width: `${pattern.percentage}%` }}
                        />
                      </div>
                      <span className="text-sm text-gray-600 dark:text-gray-400 w-8">
                        {pattern.submissions}
                      </span>
                      <span className="text-sm font-medium text-gray-900 dark:text-white w-12">
                        {pattern.percentage}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <Clock className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                  <span className="font-medium text-gray-900 dark:text-white">Last Minute Submissions</span>
                </div>
                <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                  {data.submissionPatterns.find(p => p.timeToDeadline.includes('hour'))?.percentage || 0}%
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Within 24 hours of deadline
                </div>
              </div>
              
              <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                  <span className="font-medium text-gray-900 dark:text-white">Early Submissions</span>
                </div>
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {data.submissionPatterns.filter(p => p.timeToDeadline.includes('day') || p.timeToDeadline.includes('week'))
                    .reduce((sum, p) => sum + p.percentage, 0)}%
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  More than 1 day early
                </div>
              </div>
            </div>
          </div>
        );

      case 'questions':
        return (
          <div className="space-y-4">
            <div className="h-64 bg-gray-50 dark:bg-gray-800 rounded-lg p-4 overflow-y-auto">
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">
                Question Performance Analysis
              </h4>
              <div className="space-y-3">
                {data.questionAnalytics.slice(0, 8).map((question, index) => (
                  <div key={index} className="p-3 bg-white dark:bg-gray-700 rounded-lg">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1 pr-4">
                        <div className="text-sm font-medium text-gray-900 dark:text-white line-clamp-2">
                          {question.questionText}
                        </div>
                      </div>
                      <div className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(question.difficulty)}`}>
                        {question.difficulty}
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <div className="text-gray-500 dark:text-gray-400">Correct Rate</div>
                        <div className={`font-semibold ${
                          question.correctRate >= 80 ? 'text-green-600 dark:text-green-400' :
                          question.correctRate >= 60 ? 'text-yellow-600 dark:text-yellow-400' :
                          'text-red-600 dark:text-red-400'
                        }`}>
                          {Math.round(question.correctRate)}%
                        </div>
                      </div>
                      <div>
                        <div className="text-gray-500 dark:text-gray-400">Avg Time</div>
                        <div className="font-semibold text-gray-900 dark:text-white">
                          {Math.round(question.averageTime)}s
                        </div>
                      </div>
                      <div>
                        <div className="text-gray-500 dark:text-gray-400">Discrimination</div>
                        <div className={`font-semibold ${
                          question.discrimination >= 0.3 ? 'text-green-600 dark:text-green-400' :
                          question.discrimination >= 0.2 ? 'text-yellow-600 dark:text-yellow-400' :
                          'text-red-600 dark:text-red-400'
                        }`}>
                          {question.discrimination.toFixed(2)}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case 'trends':
        return (
          <div className="space-y-4">
            <div className="h-64 bg-gray-50 dark:bg-gray-800 rounded-lg flex items-center justify-center">
              <div className="text-center">
                <TrendingUp className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-500 dark:text-gray-400">Improvement Trends Chart</p>
                <p className="text-xs text-gray-400 dark:text-gray-500">
                  Student performance over time
                </p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {data.improvementTrends.slice(0, 6).map((trend, index) => (
                <div key={index} className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-gray-900 dark:text-white">
                      {trend.studentName}
                    </span>
                    <div className="flex items-center space-x-1">
                      {trend.trend === 'improving' ? (
                        <TrendingUp className="w-4 h-4 text-green-500" />
                      ) : trend.trend === 'declining' ? (
                        <TrendingDown className="w-4 h-4 text-red-500" />
                      ) : (
                        <div className="w-4 h-4" />
                      )}
                      <span className={`text-sm font-medium ${
                        trend.trend === 'improving' ? 'text-green-600 dark:text-green-400' :
                        trend.trend === 'declining' ? 'text-red-600 dark:text-red-400' :
                        'text-gray-600 dark:text-gray-400'
                      }`}>
                        {trend.improvementRate > 0 ? '+' : ''}{Math.round(trend.improvementRate)}%
                      </span>
                    </div>
                  </div>
                  
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Current: {Math.round(trend.currentScore)}% • Previous: {Math.round(trend.previousScore)}%
                  </div>
                </div>
              ))}
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
            Assessment Analytics
          </h3>
          <Award className="w-5 h-5 text-yellow-500" />
        </div>
        
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
              {Math.round(data.averageScores.reduce((sum, s) => sum + s.value, 0) / data.averageScores.length)}%
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">Avg Score</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
              {data.gradeDistribution.filter(g => ['A', 'A+', 'A-', 'B', 'B+', 'B-'].includes(g.grade))
                .reduce((sum, g) => sum + g.percentage, 0)}%
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">Passing Rate</div>
          </div>
        </div>

        <div className="h-32 bg-gray-50 dark:bg-gray-800 rounded-lg flex items-center justify-center">
          <div className="text-center">
            <Award className="w-8 h-8 text-gray-400 mx-auto mb-1" />
            <p className="text-xs text-gray-500 dark:text-gray-400">Assessment Overview</p>
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
          Assessment Analytics
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

      {/* Cheating Indicators */}
      {data.cheatingIndicators.length > 0 && (
        <Card>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Academic Integrity Alerts
          </h3>
          
          <div className="space-y-3">
            {data.cheatingIndicators.slice(0, 5).map((indicator, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                <div className="flex items-center space-x-3">
                  <AlertTriangle className="w-5 h-5 text-red-500" />
                  <div>
                    <div className="font-medium text-gray-900 dark:text-white">
                      {indicator.studentName}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {indicator.indicatorType} • {indicator.assessmentTitle}
                    </div>
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="text-sm font-medium text-red-600 dark:text-red-400">
                    Risk: {Math.round(indicator.riskScore * 100)}%
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {new Date(indicator.detectedAt).toLocaleDateString()}
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

export default AssessmentAnalyticsChart;
