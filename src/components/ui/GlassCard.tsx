import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../utils/cn';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'frosted' | 'subtle' | 'vibrant';
  hover?: boolean;
  blur?: 'sm' | 'md' | 'lg' | 'xl';
  border?: boolean;
  shadow?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  gradient?: boolean;
  onClick?: () => void;
}

const GlassCard: React.FC<GlassCardProps> = ({
  children,
  className,
  variant = 'default',
  hover = true,
  blur = 'md',
  border = true,
  shadow = 'md',
  gradient = false,
  onClick
}) => {
  const baseClasses = 'relative overflow-hidden transition-all duration-300';
  
  const variantClasses = {
    default: 'bg-white/10 dark:bg-gray-900/10',
    frosted: 'bg-white/20 dark:bg-gray-900/20',
    subtle: 'bg-white/5 dark:bg-gray-900/5',
    vibrant: 'bg-white/30 dark:bg-gray-900/30'
  };

  const blurClasses = {
    sm: 'backdrop-blur-sm',
    md: 'backdrop-blur-md',
    lg: 'backdrop-blur-lg',
    xl: 'backdrop-blur-xl'
  };

  const shadowClasses = {
    none: '',
    sm: 'shadow-sm',
    md: 'shadow-md',
    lg: 'shadow-lg',
    xl: 'shadow-xl'
  };

  const borderClasses = border 
    ? 'border border-white/20 dark:border-gray-700/20' 
    : '';

  const hoverClasses = hover 
    ? 'hover:bg-white/15 dark:hover:bg-gray-900/15 hover:border-white/30 dark:hover:border-gray-700/30 hover:shadow-lg hover:scale-[1.02]' 
    : '';

  const Component = onClick ? motion.button : motion.div;

  return (
    <Component
      onClick={onClick}
      className={cn(
        baseClasses,
        variantClasses[variant],
        blurClasses[blur],
        shadowClasses[shadow],
        borderClasses,
        hoverClasses,
        'rounded-xl',
        onClick && 'cursor-pointer',
        className
      )}
      whileHover={hover ? { y: -2 } : undefined}
      whileTap={onClick ? { scale: 0.98 } : undefined}
    >
      {/* Gradient overlay */}
      {gradient && (
        <div className="absolute inset-0 bg-gradient-to-br from-primary-500/10 via-transparent to-secondary-500/10 pointer-events-none" />
      )}
      
      {/* Shimmer effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full animate-shimmer pointer-events-none" />
      
      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
    </Component>
  );
};

export default GlassCard;
