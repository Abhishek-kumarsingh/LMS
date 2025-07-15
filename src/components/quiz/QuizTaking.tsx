import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Clock,
  AlertTriangle,
  CheckCircle,
  ArrowLeft,
  ArrowRight,
  Flag,
  Send,
  Eye,
  Save
} from 'lucide-react';
import { Quiz, QuizAttempt, QuestionAnswer } from '../../types';
import { useAuthStore } from '../../store/authStore';
import { useToastStore } from '../../store/toastStore';
import Card from '../ui/Card';
import Button from '../ui/Button';
import QuestionRenderer from './QuestionRenderer';

interface QuizTakingProps {
  quiz: Quiz;
  attempt?: QuizAttempt;
  onSubmit: (answers: QuestionAnswer[]) => void;
  onSave?: (answers: QuestionAnswer[]) => void;
}

const QuizTaking: React.FC<QuizTakingProps> = ({
  quiz,
  attempt,
  onSubmit,
  onSave
}) => {
  const { user } = useAuthStore();
  const { addToast } = useToastStore();
  const navigate = useNavigate();

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, QuestionAnswer>>({});
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirmSubmit, setShowConfirmSubmit] = useState(false);
  const [flaggedQuestions, setFlaggedQuestions] = useState<Set<string>>(new Set());

  const currentQuestion = quiz.questions[currentQuestionIndex];

  // Initialize timer
  useEffect(() => {
    if (quiz.timeLimitMinutes && !attempt?.submittedAt) {
      const startTime = attempt?.startedAt ? new Date(attempt.startedAt).getTime() : Date.now();
      const endTime = startTime + (quiz.timeLimitMinutes * 60 * 1000);
      
      const updateTimer = () => {
        const now = Date.now();
        const remaining = Math.max(0, endTime - now);
        setTimeRemaining(remaining);
        
        if (remaining === 0) {
          handleAutoSubmit();
        }
      };

      updateTimer();
      const interval = setInterval(updateTimer, 1000);
      
      return () => clearInterval(interval);
    }
  }, [quiz.timeLimitMinutes, attempt]);

  // Auto-save answers periodically
  useEffect(() => {
    if (onSave && Object.keys(answers).length > 0) {
      const interval = setInterval(() => {
        onSave(Object.values(answers));
      }, 30000); // Save every 30 seconds

      return () => clearInterval(interval);
    }
  }, [answers, onSave]);

  const handleAutoSubmit = useCallback(() => {
    addToast('Time is up! Quiz submitted automatically.', 'warning');
    handleSubmit();
  }, [answers]);

  const updateAnswer = (questionId: string, answer: Partial<QuestionAnswer>) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: {
        id: prev[questionId]?.id || `temp-${Date.now()}`,
        attemptId: attempt?.id || '',
        questionId,
        selectedOptions: [],
        isGraded: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        ...prev[questionId],
        ...answer
      }
    }));
  };

  const toggleFlag = (questionId: string) => {
    setFlaggedQuestions(prev => {
      const newSet = new Set(prev);
      if (newSet.has(questionId)) {
        newSet.delete(questionId);
      } else {
        newSet.add(questionId);
      }
      return newSet;
    });
  };

  const getQuestionStatus = (questionId: string) => {
    const answer = answers[questionId];
    const isFlagged = flaggedQuestions.has(questionId);
    
    if (!answer || (!answer.answerText && answer.selectedOptions.length === 0)) {
      return isFlagged ? 'flagged' : 'unanswered';
    }
    return isFlagged ? 'answered-flagged' : 'answered';
  };

  const getAnsweredCount = () => {
    return quiz.questions.filter(q => {
      const answer = answers[q.id];
      return answer && (answer.answerText || answer.selectedOptions.length > 0);
    }).length;
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const answersList = quiz.questions.map(question => {
        const answer = answers[question.id];
        return answer || {
          id: `temp-${Date.now()}-${question.id}`,
          attemptId: attempt?.id || '',
          questionId: question.id,
          selectedOptions: [],
          isGraded: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
      });

      await onSubmit(answersList);
      addToast('Quiz submitted successfully!', 'success');
    } catch (error) {
      addToast('Failed to submit quiz. Please try again.', 'error');
    } finally {
      setIsSubmitting(false);
      setShowConfirmSubmit(false);
    }
  };

  const formatTime = (milliseconds: number) => {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const getTimeColor = () => {
    if (!timeRemaining || !quiz.timeLimitMinutes) return 'text-gray-600 dark:text-gray-400';
    const totalTime = quiz.timeLimitMinutes * 60 * 1000;
    const percentage = timeRemaining / totalTime;
    
    if (percentage > 0.5) return 'text-green-600 dark:text-green-400';
    if (percentage > 0.25) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
                {quiz.title}
              </h1>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                Question {currentQuestionIndex + 1} of {quiz.questions.length}
              </span>
            </div>

            <div className="flex items-center space-x-4">
              {timeRemaining !== null && (
                <div className={`flex items-center space-x-2 ${getTimeColor()}`}>
                  <Clock className="w-4 h-4" />
                  <span className="font-mono text-sm">
                    {formatTime(timeRemaining)}
                  </span>
                </div>
              )}

              <div className="text-sm text-gray-500 dark:text-gray-400">
                {getAnsweredCount()} / {quiz.questions.length} answered
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowConfirmSubmit(true)}
                icon={<Send className="w-4 h-4" />}
              >
                Submit Quiz
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Question Navigation */}
          <div className="lg:col-span-1">
            <Card className="sticky top-24">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                Questions
              </h3>
              
              <div className="grid grid-cols-5 lg:grid-cols-4 gap-2">
                {quiz.questions.map((question, index) => {
                  const status = getQuestionStatus(question.id);
                  
                  return (
                    <button
                      key={question.id}
                      onClick={() => setCurrentQuestionIndex(index)}
                      className={`relative w-10 h-10 rounded-lg text-sm font-medium transition-colors ${
                        index === currentQuestionIndex
                          ? 'bg-primary-600 text-white'
                          : status === 'answered'
                          ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200'
                          : status === 'answered-flagged'
                          ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200'
                          : status === 'flagged'
                          ? 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
                      }`}
                    >
                      {index + 1}
                      {flaggedQuestions.has(question.id) && (
                        <Flag className="w-3 h-3 absolute -top-1 -right-1 text-red-500" />
                      )}
                    </button>
                  );
                })}
              </div>

              <div className="mt-4 space-y-2 text-xs">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-green-100 dark:bg-green-900/30 rounded"></div>
                  <span className="text-gray-600 dark:text-gray-400">Answered</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-yellow-100 dark:bg-yellow-900/30 rounded"></div>
                  <span className="text-gray-600 dark:text-gray-400">Flagged</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-gray-100 dark:bg-gray-700 rounded"></div>
                  <span className="text-gray-600 dark:text-gray-400">Not answered</span>
                </div>
              </div>
            </Card>
          </div>

          {/* Question Content */}
          <div className="lg:col-span-3">
            <AnimatePresence mode="wait">
              {currentQuestion && (
                <motion.div
                  key={currentQuestion.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                >
                  <Card>
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center space-x-2">
                        <span className="px-2 py-1 bg-primary-100 dark:bg-primary-900/30 text-primary-800 dark:text-primary-200 text-xs font-medium rounded">
                          {currentQuestion.questionType.replace('_', ' ')}
                        </span>
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          {currentQuestion.points} {currentQuestion.points === 1 ? 'point' : 'points'}
                        </span>
                        {currentQuestion.isRequired && (
                          <span className="text-red-500 text-sm">*</span>
                        )}
                      </div>

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleFlag(currentQuestion.id)}
                        icon={<Flag className={`w-4 h-4 ${flaggedQuestions.has(currentQuestion.id) ? 'text-red-500' : 'text-gray-400'}`} />}
                      >
                        {flaggedQuestions.has(currentQuestion.id) ? 'Unflag' : 'Flag'}
                      </Button>
                    </div>

                    <QuestionRenderer
                      question={currentQuestion}
                      answer={answers[currentQuestion.id]}
                      onAnswerChange={(answer) => updateAnswer(currentQuestion.id, answer)}
                      disabled={isSubmitting}
                    />
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Navigation */}
            <div className="flex items-center justify-between mt-6">
              <Button
                variant="outline"
                onClick={() => setCurrentQuestionIndex(Math.max(0, currentQuestionIndex - 1))}
                disabled={currentQuestionIndex === 0}
                icon={<ArrowLeft className="w-4 h-4" />}
              >
                Previous
              </Button>

              <div className="flex items-center space-x-2">
                {onSave && (
                  <Button
                    variant="ghost"
                    onClick={() => onSave(Object.values(answers))}
                    icon={<Save className="w-4 h-4" />}
                  >
                    Save Progress
                  </Button>
                )}
              </div>

              <Button
                variant="outline"
                onClick={() => setCurrentQuestionIndex(Math.min(quiz.questions.length - 1, currentQuestionIndex + 1))}
                disabled={currentQuestionIndex === quiz.questions.length - 1}
                icon={<ArrowRight className="w-4 h-4" />}
                iconPosition="right"
              >
                Next
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Submit Confirmation Modal */}
      <AnimatePresence>
        {showConfirmSubmit && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowConfirmSubmit(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-md w-full"
            >
              <div className="flex items-center space-x-3 mb-4">
                <AlertTriangle className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Submit Quiz?
                </h3>
              </div>

              <div className="space-y-3 mb-6">
                <p className="text-gray-600 dark:text-gray-400">
                  Are you sure you want to submit your quiz? This action cannot be undone.
                </p>
                
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                  <div className="text-sm space-y-1">
                    <div className="flex justify-between">
                      <span>Questions answered:</span>
                      <span className="font-medium">{getAnsweredCount()} / {quiz.questions.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Questions flagged:</span>
                      <span className="font-medium">{flaggedQuestions.size}</span>
                    </div>
                    {timeRemaining !== null && (
                      <div className="flex justify-between">
                        <span>Time remaining:</span>
                        <span className={`font-medium ${getTimeColor()}`}>
                          {formatTime(timeRemaining)}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex space-x-3">
                <Button
                  variant="outline"
                  onClick={() => setShowConfirmSubmit(false)}
                  className="flex-1"
                >
                  Continue Quiz
                </Button>
                <Button
                  variant="primary"
                  onClick={handleSubmit}
                  loading={isSubmitting}
                  className="flex-1"
                >
                  Submit Quiz
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default QuizTaking;
