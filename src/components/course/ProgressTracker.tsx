import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, Circle, Play, Lock, Clock, Award } from 'lucide-react';
import Card from '../ui/Card';
import Button from '../ui/Button';

interface Lesson {
  id: string;
  title: string;
  duration: number;
  completed: boolean;
  locked: boolean;
  type: 'video' | 'text' | 'quiz' | 'assignment';
}

interface Section {
  id: string;
  title: string;
  lessons: Lesson[];
  completed: boolean;
}

interface ProgressTrackerProps {
  courseTitle: string;
  sections: Section[];
  overallProgress: number;
  totalDuration: number;
  completedDuration: number;
  certificateEligible: boolean;
  onLessonClick: (lessonId: string) => void;
  onGenerateCertificate?: () => void;
}

const ProgressTracker: React.FC<ProgressTrackerProps> = ({
  courseTitle,
  sections,
  overallProgress,
  totalDuration,
  completedDuration,
  certificateEligible,
  onLessonClick,
  onGenerateCertificate
}) => {
  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    
    if (hours > 0 && remainingMinutes > 0) {
      return `${hours}h ${remainingMinutes}m`;
    } else if (hours > 0) {
      return `${hours}h`;
    } else {
      return `${remainingMinutes}m`;
    }
  };

  const getLessonIcon = (lesson: Lesson) => {
    if (lesson.locked) {
      return <Lock className="w-4 h-4 text-gray-400" />;
    }
    
    if (lesson.completed) {
      return <CheckCircle className="w-4 h-4 text-green-500" />;
    }
    
    switch (lesson.type) {
      case 'video':
        return <Play className="w-4 h-4 text-primary-500" />;
      case 'quiz':
        return <Circle className="w-4 h-4 text-blue-500" />;
      case 'assignment':
        return <Circle className="w-4 h-4 text-purple-500" />;
      default:
        return <Circle className="w-4 h-4 text-gray-500" />;
    }
  };

  const getLessonTypeColor = (type: string) => {
    switch (type) {
      case 'video':
        return 'text-primary-600 bg-primary-100 dark:text-primary-400 dark:bg-primary-900/20';
      case 'quiz':
        return 'text-blue-600 bg-blue-100 dark:text-blue-400 dark:bg-blue-900/20';
      case 'assignment':
        return 'text-purple-600 bg-purple-100 dark:text-purple-400 dark:bg-purple-900/20';
      default:
        return 'text-gray-600 bg-gray-100 dark:text-gray-400 dark:bg-gray-900/20';
    }
  };

  return (
    <div className="space-y-6">
      {/* Overall Progress */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Course Progress
          </h2>
          <span className="text-2xl font-bold text-primary-600 dark:text-primary-400">
            {overallProgress}%
          </span>
        </div>
        
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 mb-4">
          <motion.div
            className="bg-gradient-to-r from-primary-500 to-primary-600 h-3 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${overallProgress}%` }}
            transition={{ duration: 1, ease: "easeOut" }}
          />
        </div>
        
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-gray-500 dark:text-gray-400">Completed</p>
            <p className="font-medium text-gray-900 dark:text-white">
              {formatDuration(completedDuration)}
            </p>
          </div>
          <div>
            <p className="text-gray-500 dark:text-gray-400">Total Duration</p>
            <p className="font-medium text-gray-900 dark:text-white">
              {formatDuration(totalDuration)}
            </p>
          </div>
        </div>

        {certificateEligible && overallProgress === 100 && (
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Award className="w-5 h-5 text-yellow-500" />
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  Certificate Available
                </span>
              </div>
              <Button size="sm" onClick={onGenerateCertificate}>
                Generate Certificate
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* Course Sections */}
      <div className="space-y-4">
        {sections.map((section, sectionIndex) => (
          <Card key={section.id} className="overflow-hidden">
            <div className="p-4 bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  {section.title}
                </h3>
                <div className="flex items-center space-x-2">
                  {section.completed && (
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  )}
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {section.lessons.filter(l => l.completed).length}/{section.lessons.length}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="p-4">
              <div className="space-y-3">
                {section.lessons.map((lesson, lessonIndex) => (
                  <motion.div
                    key={lesson.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: (sectionIndex * 0.1) + (lessonIndex * 0.05) }}
                    className={`flex items-center space-x-3 p-3 rounded-lg transition-colors ${
                      lesson.locked
                        ? 'bg-gray-50 dark:bg-gray-800/30 cursor-not-allowed'
                        : lesson.completed
                        ? 'bg-green-50 dark:bg-green-900/20 cursor-pointer hover:bg-green-100 dark:hover:bg-green-900/30'
                        : 'bg-white dark:bg-gray-800 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700'
                    }`}
                    onClick={() => !lesson.locked && onLessonClick(lesson.id)}
                  >
                    <div className="flex-shrink-0">
                      {getLessonIcon(lesson)}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <h4 className={`font-medium ${
                        lesson.locked
                          ? 'text-gray-400 dark:text-gray-500'
                          : lesson.completed
                          ? 'text-green-800 dark:text-green-200'
                          : 'text-gray-900 dark:text-white'
                      }`}>
                        {lesson.title}
                      </h4>
                      <div className="flex items-center space-x-2 mt-1">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getLessonTypeColor(lesson.type)}`}>
                          {lesson.type}
                        </span>
                        <div className="flex items-center space-x-1 text-xs text-gray-500 dark:text-gray-400">
                          <Clock className="w-3 h-3" />
                          <span>{formatDuration(lesson.duration)}</span>
                        </div>
                      </div>
                    </div>
                    
                    {lesson.completed && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="flex-shrink-0"
                      >
                        <CheckCircle className="w-5 h-5 text-green-500" />
                      </motion.div>
                    )}
                  </motion.div>
                ))}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default ProgressTracker;
