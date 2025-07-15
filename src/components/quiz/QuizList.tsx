import React from 'react';
import { motion } from 'framer-motion';
import {
  Play,
  Clock,
  BarChart3,
  Users,
  CheckCircle,
  AlertCircle,
  Calendar,
  Award,
  Eye,
  Edit,
  Copy,
  Trash2,
  Plus
} from 'lucide-react';
import { Quiz } from '../../types';
import { useAuthStore } from '../../store/authStore';
import Card from '../ui/Card';
import Button from '../ui/Button';

interface QuizListProps {
  quizzes: Quiz[];
  onTakeQuiz?: (quiz: Quiz) => void;
  onEditQuiz?: (quiz: Quiz) => void;
  onDuplicateQuiz?: (quiz: Quiz) => void;
  onDeleteQuiz?: (quiz: Quiz) => void;
  onCreateQuiz?: () => void;
  showActions?: boolean;
  loading?: boolean;
}

const QuizList: React.FC<QuizListProps> = ({
  quizzes,
  onTakeQuiz,
  onEditQuiz,
  onDuplicateQuiz,
  onDeleteQuiz,
  onCreateQuiz,
  showActions = false,
  loading = false
}) => {
  const { user } = useAuthStore();

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'No deadline';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getQuizStatus = (quiz: Quiz) => {
    const now = new Date();
    const availableFrom = quiz.availableFrom ? new Date(quiz.availableFrom) : null;
    const availableUntil = quiz.availableUntil ? new Date(quiz.availableUntil) : null;

    if (!quiz.isPublished) {
      return { status: 'draft', label: 'Draft', color: 'gray' };
    }

    if (availableFrom && now < availableFrom) {
      return { status: 'upcoming', label: 'Upcoming', color: 'blue' };
    }

    if (availableUntil && now > availableUntil) {
      return { status: 'closed', label: 'Closed', color: 'red' };
    }

    return { status: 'available', label: 'Available', color: 'green' };
  };

  const getQuizTypeIcon = (type: string) => {
    switch (type) {
      case 'PRACTICE':
        return <Play className="w-4 h-4" />;
      case 'GRADED':
        return <Award className="w-4 h-4" />;
      case 'SURVEY':
        return <BarChart3 className="w-4 h-4" />;
      case 'EXAM':
        return <AlertCircle className="w-4 h-4" />;
      default:
        return <Play className="w-4 h-4" />;
    }
  };

  const getQuizTypeColor = (type: string) => {
    switch (type) {
      case 'PRACTICE':
        return 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200';
      case 'GRADED':
        return 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200';
      case 'SURVEY':
        return 'bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-200';
      case 'EXAM':
        return 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200';
      default:
        return 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200';
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, index) => (
          <Card key={index} className="animate-pulse">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-4"></div>
            <div className="flex space-x-4">
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
            </div>
          </Card>
        ))}
      </div>
    );
  }

  if (quizzes.length === 0) {
    return (
      <Card className="text-center py-12">
        <div className="text-gray-400 dark:text-gray-500 mb-4">
          <BarChart3 className="w-12 h-12 mx-auto" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
          No quizzes available
        </h3>
        <p className="text-gray-500 dark:text-gray-400 mb-6">
          {showActions 
            ? "Get started by creating your first quiz."
            : "Check back later for new quizzes."
          }
        </p>
        {showActions && onCreateQuiz && (
          <Button
            variant="primary"
            onClick={onCreateQuiz}
            icon={<Plus className="w-4 h-4" />}
          >
            Create Quiz
          </Button>
        )}
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {quizzes.map((quiz, index) => {
        const status = getQuizStatus(quiz);
        const canTake = status.status === 'available' && user?.role === 'STUDENT';
        const canEdit = (user?.role === 'INSTRUCTOR' || user?.role === 'ADMIN') && 
                       (quiz.createdBy === user?.id || user?.role === 'ADMIN');

        return (
          <motion.div
            key={quiz.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  {/* Header */}
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {quiz.title}
                    </h3>
                    
                    <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${getQuizTypeColor(quiz.quizType)}`}>
                      {getQuizTypeIcon(quiz.quizType)}
                      <span>{quiz.quizType.replace('_', ' ')}</span>
                    </div>

                    <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                      status.color === 'green' ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200' :
                      status.color === 'blue' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200' :
                      status.color === 'red' ? 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200' :
                      'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
                    }`}>
                      {status.label}
                    </div>
                  </div>

                  {/* Description */}
                  {quiz.description && (
                    <p className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                      {quiz.description}
                    </p>
                  )}

                  {/* Quiz Info */}
                  <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 dark:text-gray-400 mb-4">
                    <div className="flex items-center space-x-1">
                      <BarChart3 className="w-4 h-4" />
                      <span>{quiz.questions.length} questions</span>
                    </div>
                    
                    <div className="flex items-center space-x-1">
                      <Clock className="w-4 h-4" />
                      <span>{quiz.timeLimitMinutes ? `${quiz.timeLimitMinutes} min` : 'No time limit'}</span>
                    </div>
                    
                    <div className="flex items-center space-x-1">
                      <Users className="w-4 h-4" />
                      <span>{quiz.maxAttempts} {quiz.maxAttempts === 1 ? 'attempt' : 'attempts'}</span>
                    </div>

                    {quiz.totalPoints > 0 && (
                      <div className="flex items-center space-x-1">
                        <Award className="w-4 h-4" />
                        <span>{quiz.totalPoints} points</span>
                      </div>
                    )}

                    {quiz.passingScore && (
                      <div className="flex items-center space-x-1">
                        <CheckCircle className="w-4 h-4" />
                        <span>{quiz.passingScore}% to pass</span>
                      </div>
                    )}
                  </div>

                  {/* Availability */}
                  <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                    {quiz.availableFrom && (
                      <div className="flex items-center space-x-1">
                        <Calendar className="w-3 h-3" />
                        <span>Available from {formatDate(quiz.availableFrom)}</span>
                      </div>
                    )}
                    
                    {quiz.availableUntil && (
                      <div className="flex items-center space-x-1">
                        <Calendar className="w-3 h-3" />
                        <span>Due {formatDate(quiz.availableUntil)}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center space-x-2 ml-4">
                  {canTake && onTakeQuiz && (
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => onTakeQuiz(quiz)}
                      icon={<Play className="w-4 h-4" />}
                    >
                      Take Quiz
                    </Button>
                  )}

                  {showActions && (
                    <>
                      <Button
                        variant="ghost"
                        size="sm"
                        icon={<Eye className="w-4 h-4" />}
                        title="Preview"
                      />

                      {canEdit && onEditQuiz && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onEditQuiz(quiz)}
                          icon={<Edit className="w-4 h-4" />}
                          title="Edit"
                        />
                      )}

                      {canEdit && onDuplicateQuiz && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onDuplicateQuiz(quiz)}
                          icon={<Copy className="w-4 h-4" />}
                          title="Duplicate"
                        />
                      )}

                      {canEdit && onDeleteQuiz && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            if (confirm('Are you sure you want to delete this quiz?')) {
                              onDeleteQuiz(quiz);
                            }
                          }}
                          icon={<Trash2 className="w-4 h-4" />}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                          title="Delete"
                        />
                      )}
                    </>
                  )}
                </div>
              </div>

              {/* Progress Bar (for students) */}
              {user?.role === 'STUDENT' && quiz.attempts.length > 0 && (
                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">
                      Best Score: {Math.round(Math.max(...quiz.attempts.map(a => a.percentageScore || 0)))}%
                    </span>
                    <span className="text-gray-600 dark:text-gray-400">
                      Attempts: {quiz.attempts.length}/{quiz.maxAttempts}
                    </span>
                  </div>
                  
                  <div className="mt-2 w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-primary-600 h-2 rounded-full transition-all"
                      style={{
                        width: `${Math.max(...quiz.attempts.map(a => a.percentageScore || 0))}%`
                      }}
                    />
                  </div>
                </div>
              )}
            </Card>
          </motion.div>
        );
      })}
    </div>
  );
};

export default QuizList;
