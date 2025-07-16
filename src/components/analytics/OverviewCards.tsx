import React from 'react';
import { motion } from 'framer-motion';
import {
  Users,
  UserCheck,
  Award,
  BookOpen,
  MessageSquare,
  TrendingUp,
  TrendingDown,
  Minus,
  Target,
  Clock
} from 'lucide-react';
import { AnalyticsOverview } from '../../types';
import Card from '../ui/Card';

interface OverviewCardsProps {
  overview: AnalyticsOverview;
}

const OverviewCards: React.FC<OverviewCardsProps> = ({ overview }) => {
  const cards = [
    {
      title: 'Total Students',
      value: overview.totalStudents,
      icon: Users,
      color: 'blue',
      trend: null,
      description: 'Enrolled students'
    },
    {
      title: 'Active Students',
      value: overview.activeStudents,
      icon: UserCheck,
      color: 'green',
      trend: overview.activeStudents > 0 ? ((overview.activeStudents / overview.totalStudents) * 100) : 0,
      description: `${Math.round((overview.activeStudents / overview.totalStudents) * 100)}% of total`
    },
    {
      title: 'Completion Rate',
      value: `${Math.round(overview.completionRate)}%`,
      icon: Target,
      color: overview.completionRate >= 80 ? 'green' : overview.completionRate >= 60 ? 'yellow' : 'red',
      trend: overview.completionRate,
      description: 'Course completion'
    },
    {
      title: 'Average Grade',
      value: `${Math.round(overview.averageGrade)}%`,
      icon: Award,
      color: overview.averageGrade >= 85 ? 'green' : overview.averageGrade >= 70 ? 'yellow' : 'red',
      trend: overview.averageGrade,
      description: 'Overall performance'
    },
    {
      title: 'Content Items',
      value: overview.totalContent,
      icon: BookOpen,
      color: 'purple',
      trend: null,
      description: 'Learning materials'
    },
    {
      title: 'Assignments',
      value: overview.totalAssignments,
      icon: BookOpen,
      color: 'orange',
      trend: null,
      description: 'Active assignments'
    },
    {
      title: 'Quizzes',
      value: overview.totalQuizzes,
      icon: Award,
      color: 'indigo',
      trend: null,
      description: 'Assessment quizzes'
    },
    {
      title: 'Forum Posts',
      value: overview.totalForumPosts,
      icon: MessageSquare,
      color: 'pink',
      trend: null,
      description: 'Discussion activity'
    },
    {
      title: 'Engagement Score',
      value: `${Math.round(overview.engagementScore)}/100`,
      icon: TrendingUp,
      color: overview.engagementScore >= 80 ? 'green' : overview.engagementScore >= 60 ? 'yellow' : 'red',
      trend: overview.engagementScore,
      description: 'Student engagement'
    },
    {
      title: 'Retention Rate',
      value: `${Math.round(overview.retentionRate)}%`,
      icon: UserCheck,
      color: overview.retentionRate >= 90 ? 'green' : overview.retentionRate >= 75 ? 'yellow' : 'red',
      trend: overview.retentionRate,
      description: 'Student retention'
    }
  ];

  const getColorClasses = (color: string) => {
    switch (color) {
      case 'blue':
        return 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400';
      case 'green':
        return 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400';
      case 'yellow':
        return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400';
      case 'red':
        return 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400';
      case 'purple':
        return 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400';
      case 'orange':
        return 'bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400';
      case 'indigo':
        return 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400';
      case 'pink':
        return 'bg-pink-100 dark:bg-pink-900/30 text-pink-600 dark:text-pink-400';
      default:
        return 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400';
    }
  };

  const getTrendIcon = (trend: number | null, value: any) => {
    if (trend === null) return null;
    
    // For percentage values, consider good/bad trends
    if (typeof value === 'string' && value.includes('%')) {
      if (trend >= 80) return <TrendingUp className="w-4 h-4 text-green-500" />;
      if (trend >= 60) return <Minus className="w-4 h-4 text-yellow-500" />;
      return <TrendingDown className="w-4 h-4 text-red-500" />;
    }
    
    // For scores, similar logic
    if (trend >= 80) return <TrendingUp className="w-4 h-4 text-green-500" />;
    if (trend >= 60) return <Minus className="w-4 h-4 text-yellow-500" />;
    return <TrendingDown className="w-4 h-4 text-red-500" />;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
      {cards.map((card, index) => {
        const Icon = card.icon;
        
        return (
          <motion.div
            key={card.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <div className={`p-2 rounded-lg ${getColorClasses(card.color)}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    {getTrendIcon(card.trend, card.value)}
                  </div>
                  
                  <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                    {card.value}
                  </div>
                  
                  <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {card.title}
                  </div>
                  
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {card.description}
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        );
      })}
    </div>
  );
};

export default OverviewCards;
