import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../utils/cn';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  glass?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  variant?: 'default' | 'elevated' | 'bordered' | 'gradient';
  onClick?: () => void;
}

const Card: React.FC<CardProps> = ({
  children,
  className = '',
  hover = false,
  glass = false,
  padding = 'md',
  variant = 'default',
  onClick
}) => {
  const paddingClasses = {
    none: '',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
  };

  const variantClasses = {
    default: 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm',
    elevated: 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-lg',
    bordered: 'bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700',
    gradient: 'bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 border border-gray-200 dark:border-gray-700 shadow-sm'
  };

  const glassClasses = glass
    ? 'bg-white/10 dark:bg-gray-900/10 backdrop-blur-md border border-white/20 dark:border-gray-700/20 shadow-glass'
    : variantClasses[variant];

  const hoverClasses = hover
    ? 'hover:shadow-xl hover:scale-[1.02] hover:-translate-y-1 cursor-pointer'
    : '';

  const Component = onClick ? motion.button : motion.div;

  return (
    <Component
      onClick={onClick}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={hover ? { y: -2 } : undefined}
      whileTap={onClick ? { scale: 0.98 } : undefined}
      className={cn(
        'rounded-xl transition-all duration-200',
        glassClasses,
        paddingClasses[padding],
        hoverClasses,
        className
      )}
    >
      {children}
    </Component>
  );
};

export default Card;