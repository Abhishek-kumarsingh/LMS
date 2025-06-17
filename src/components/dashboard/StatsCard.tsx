import React from 'react';
import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';
import Card from '../ui/Card';

interface StatsCardProps {
  title: string;
  value: string | number;
  change?: {
    value: number;
    type: 'increase' | 'decrease';
    period: string;
  };
  icon: LucideIcon;
  color?: 'primary' | 'secondary' | 'success' | 'warning' | 'error';
  loading?: boolean;
}

const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  change,
  icon: Icon,
  color = 'primary',
  loading = false
}) => {
  const getColorClasses = (color: string) => {
    switch (color) {
      case 'primary':
        return {
          bg: 'bg-primary-100 dark:bg-primary-900/20',
          icon: 'text-primary-600 dark:text-primary-400',
          change: 'text-primary-600 dark:text-primary-400'
        };
      case 'secondary':
        return {
          bg: 'bg-secondary-100 dark:bg-secondary-900/20',
          icon: 'text-secondary-600 dark:text-secondary-400',
          change: 'text-secondary-600 dark:text-secondary-400'
        };
      case 'success':
        return {
          bg: 'bg-green-100 dark:bg-green-900/20',
          icon: 'text-green-600 dark:text-green-400',
          change: 'text-green-600 dark:text-green-400'
        };
      case 'warning':
        return {
          bg: 'bg-yellow-100 dark:bg-yellow-900/20',
          icon: 'text-yellow-600 dark:text-yellow-400',
          change: 'text-yellow-600 dark:text-yellow-400'
        };
      case 'error':
        return {
          bg: 'bg-red-100 dark:bg-red-900/20',
          icon: 'text-red-600 dark:text-red-400',
          change: 'text-red-600 dark:text-red-400'
        };
      default:
        return {
          bg: 'bg-gray-100 dark:bg-gray-900/20',
          icon: 'text-gray-600 dark:text-gray-400',
          change: 'text-gray-600 dark:text-gray-400'
        };
    }
  };

  const colorClasses = getColorClasses(color);

  const formatValue = (val: string | number) => {
    if (typeof val === 'number') {
      if (val >= 1000000) {
        return `${(val / 1000000).toFixed(1)}M`;
      } else if (val >= 1000) {
        return `${(val / 1000).toFixed(1)}K`;
      }
      return val.toLocaleString();
    }
    return val;
  };

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
            {title}
          </p>
          
          {loading ? (
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-20 mb-2"></div>
              {change && (
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
              )}
            </div>
          ) : (
            <>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-2xl font-bold text-gray-900 dark:text-white mb-1"
              >
                {formatValue(value)}
              </motion.p>
              
              {change && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="flex items-center space-x-1"
                >
                  <span className={`text-sm font-medium ${
                    change.type === 'increase' 
                      ? 'text-green-600 dark:text-green-400' 
                      : 'text-red-600 dark:text-red-400'
                  }`}>
                    {change.type === 'increase' ? '+' : '-'}{Math.abs(change.value)}%
                  </span>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    vs {change.period}
                  </span>
                </motion.div>
              )}
            </>
          )}
        </div>
        
        <div className={`p-3 rounded-lg ${colorClasses.bg}`}>
          <Icon className={`w-6 h-6 ${colorClasses.icon}`} />
        </div>
      </div>
    </Card>
  );
};

export default StatsCard;
