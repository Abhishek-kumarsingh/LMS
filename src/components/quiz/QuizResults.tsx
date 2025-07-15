import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  CheckCircle,
  XCircle,
  Clock,
  BarChart3,
  Award,
  TrendingUp,
  Eye,
  Download,
  RefreshCw,
  ArrowLeft
} from 'lucide-react';
import { Quiz, QuizAttempt, Question } from '../../types';
import Card from '../ui/Card';
import Button from '../ui/Button';
import QuestionRenderer from './QuestionRenderer';

interface QuizResultsProps {
  quiz: Quiz;
  attempt: QuizAttempt;
  onRetakeQuiz?: () => void;
  onBackToCourse?: () => void;
}

const QuizResults: React.FC<QuizResultsProps> = ({
  quiz,
  attempt,
  onRetakeQuiz,
  onBackToCourse
}) => {
  const [showDetailedReview, setShowDetailedReview] = useState(false);
  const [selectedQuestionIndex, setSelectedQuestionIndex] = useState(0);

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  const getGradeColor = (percentage: number) => {
    if (percentage >= 90) return 'text-green-600 dark:text-green-400';
    if (percentage >= 80) return 'text-blue-600 dark:text-blue-400';
    if (percentage >= 70) return 'text-yellow-600 dark:text-yellow-400';
    if (percentage >= 60) return 'text-orange-600 dark:text-orange-400';
    return 'text-red-600 dark:text-red-400';
  };

  const getGradeBadgeColor = (percentage: number) => {
    if (percentage >= 90) return 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200';
    if (percentage >= 80) return 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200';
    if (percentage >= 70) return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200';
    if (percentage >= 60) return 'bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-200';
    return 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200';
  };

  const getLetterGrade = (percentage: number) => {
    if (percentage >= 97) return 'A+';
    if (percentage >= 93) return 'A';
    if (percentage >= 90) return 'A-';
    if (percentage >= 87) return 'B+';
    if (percentage >= 83) return 'B';
    if (percentage >= 80) return 'B-';
    if (percentage >= 77) return 'C+';
    if (percentage >= 73) return 'C';
    if (percentage >= 70) return 'C-';
    if (percentage >= 67) return 'D+';
    if (percentage >= 63) return 'D';
    if (percentage >= 60) return 'D-';
    return 'F';
  };

  const isPassing = quiz.passingScore ? (attempt.percentageScore || 0) >= quiz.passingScore : true;
  const canRetake = quiz.maxAttempts > attempt.attemptNumber;

  const correctAnswers = attempt.answers.filter(answer => answer.isCorrect).length;
  const totalQuestions = quiz.questions.length;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className={`inline-flex items-center justify-center w-16 h-16 rounded-full mb-4 ${
              isPassing ? 'bg-green-100 dark:bg-green-900/30' : 'bg-red-100 dark:bg-red-900/30'
            }`}
          >
            {isPassing ? (
              <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
            ) : (
              <XCircle className="w-8 h-8 text-red-600 dark:text-red-400" />
            )}
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl font-bold text-gray-900 dark:text-white mb-2"
          >
            {isPassing ? 'Quiz Completed!' : 'Quiz Completed'}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-gray-600 dark:text-gray-400"
          >
            {quiz.title}
          </motion.p>
        </div>

        {/* Results Summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card variant="gradient" className="mb-8">
            <div className="text-center">
              <div className={`text-6xl font-bold mb-2 ${getGradeColor(attempt.percentageScore || 0)}`}>
                {Math.round(attempt.percentageScore || 0)}%
              </div>
              <div className={`inline-block px-3 py-1 rounded-full text-sm font-medium mb-4 ${getGradeBadgeColor(attempt.percentageScore || 0)}`}>
                {getLetterGrade(attempt.percentageScore || 0)}
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">
                    {correctAnswers}/{totalQuestions}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Correct</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">
                    {attempt.earnedPoints?.toFixed(1) || 0}/{attempt.totalPoints?.toFixed(1) || 0}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Points</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">
                    {attempt.timeSpentMinutes ? formatTime(attempt.timeSpentMinutes) : 'N/A'}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Time Spent</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">
                    {attempt.attemptNumber}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Attempt</div>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Status Messages */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-8"
        >
          {quiz.passingScore && (
            <Card className={`border-l-4 ${isPassing ? 'border-green-500 bg-green-50 dark:bg-green-900/20' : 'border-red-500 bg-red-50 dark:bg-red-900/20'}`}>
              <div className="flex items-center space-x-3">
                {isPassing ? (
                  <Award className="w-5 h-5 text-green-600 dark:text-green-400" />
                ) : (
                  <XCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
                )}
                <div>
                  <h3 className={`font-medium ${isPassing ? 'text-green-800 dark:text-green-200' : 'text-red-800 dark:text-red-200'}`}>
                    {isPassing ? 'Congratulations! You passed!' : 'You did not meet the passing score'}
                  </h3>
                  <p className={`text-sm ${isPassing ? 'text-green-700 dark:text-green-300' : 'text-red-700 dark:text-red-300'}`}>
                    Passing score: {quiz.passingScore}% | Your score: {Math.round(attempt.percentageScore || 0)}%
                  </p>
                </div>
              </div>
            </Card>
          )}

          {attempt.isLateSubmission && (
            <Card className="border-l-4 border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20 mt-4">
              <div className="flex items-center space-x-3">
                <Clock className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                <div>
                  <h3 className="font-medium text-yellow-800 dark:text-yellow-200">
                    Late Submission
                  </h3>
                  <p className="text-sm text-yellow-700 dark:text-yellow-300">
                    This quiz was submitted after the due date.
                  </p>
                </div>
              </div>
            </Card>
          )}
        </motion.div>

        {/* Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mb-8"
        >
          <Card>
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex flex-wrap gap-3">
                {quiz.allowReview && (
                  <Button
                    variant="outline"
                    onClick={() => setShowDetailedReview(!showDetailedReview)}
                    icon={<Eye className="w-4 h-4" />}
                  >
                    {showDetailedReview ? 'Hide Review' : 'Review Answers'}
                  </Button>
                )}
                
                <Button
                  variant="ghost"
                  icon={<Download className="w-4 h-4" />}
                >
                  Download Results
                </Button>
              </div>

              <div className="flex gap-3">
                {canRetake && onRetakeQuiz && (
                  <Button
                    variant="outline"
                    onClick={onRetakeQuiz}
                    icon={<RefreshCw className="w-4 h-4" />}
                  >
                    Retake Quiz
                  </Button>
                )}
                
                {onBackToCourse && (
                  <Button
                    variant="primary"
                    onClick={onBackToCourse}
                    icon={<ArrowLeft className="w-4 h-4" />}
                  >
                    Back to Course
                  </Button>
                )}
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Detailed Review */}
        {showDetailedReview && quiz.allowReview && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-6"
          >
            {/* Question Navigation */}
            <Card>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                Question Review
              </h3>
              
              <div className="grid grid-cols-5 sm:grid-cols-10 gap-2 mb-4">
                {quiz.questions.map((question, index) => {
                  const answer = attempt.answers.find(a => a.questionId === question.id);
                  const isCorrect = answer?.isCorrect;
                  
                  return (
                    <button
                      key={question.id}
                      onClick={() => setSelectedQuestionIndex(index)}
                      className={`w-10 h-10 rounded-lg text-sm font-medium transition-colors ${
                        index === selectedQuestionIndex
                          ? 'bg-primary-600 text-white'
                          : isCorrect
                          ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200'
                          : isCorrect === false
                          ? 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                      }`}
                    >
                      {index + 1}
                    </button>
                  );
                })}
              </div>

              <div className="flex items-center space-x-4 text-sm">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-green-100 dark:bg-green-900/30 rounded"></div>
                  <span className="text-gray-600 dark:text-gray-400">Correct</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-red-100 dark:bg-red-900/30 rounded"></div>
                  <span className="text-gray-600 dark:text-gray-400">Incorrect</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-gray-100 dark:bg-gray-700 rounded"></div>
                  <span className="text-gray-600 dark:text-gray-400">Not graded</span>
                </div>
              </div>
            </Card>

            {/* Selected Question Review */}
            {quiz.questions[selectedQuestionIndex] && (
              <Card>
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-lg font-medium text-gray-900 dark:text-white">
                      Question {selectedQuestionIndex + 1}
                    </h4>
                    <div className="flex items-center space-x-2">
                      {(() => {
                        const answer = attempt.answers.find(a => a.questionId === quiz.questions[selectedQuestionIndex].id);
                        const isCorrect = answer?.isCorrect;
                        
                        if (isCorrect === true) {
                          return (
                            <span className="flex items-center text-green-600 dark:text-green-400">
                              <CheckCircle className="w-4 h-4 mr-1" />
                              Correct
                            </span>
                          );
                        } else if (isCorrect === false) {
                          return (
                            <span className="flex items-center text-red-600 dark:text-red-400">
                              <XCircle className="w-4 h-4 mr-1" />
                              Incorrect
                            </span>
                          );
                        } else {
                          return (
                            <span className="text-gray-500 dark:text-gray-400">
                              Not graded
                            </span>
                          );
                        }
                      })()}
                    </div>
                  </div>
                </div>

                <QuestionRenderer
                  question={quiz.questions[selectedQuestionIndex]}
                  answer={attempt.answers.find(a => a.questionId === quiz.questions[selectedQuestionIndex].id)}
                  onAnswerChange={() => {}} // Read-only
                  disabled={true}
                  showCorrectAnswers={quiz.showCorrectAnswers}
                />
              </Card>
            )}
          </motion.div>
        )}

        {/* Feedback */}
        {attempt.feedback && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Card>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                Instructor Feedback
              </h3>
              <div className="prose dark:prose-invert max-w-none">
                <p>{attempt.feedback}</p>
              </div>
            </Card>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default QuizResults;
