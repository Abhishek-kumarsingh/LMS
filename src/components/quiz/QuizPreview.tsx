import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Play,
  Clock,
  Users,
  BarChart3,
  CheckCircle,
  Circle,
  AlertCircle,
  Eye,
  EyeOff
} from 'lucide-react';
import { Quiz, Question } from '../../types';
import Card from '../ui/Card';
import Button from '../ui/Button';

interface QuizPreviewProps {
  quiz: Quiz;
}

const QuizPreview: React.FC<QuizPreviewProps> = ({ quiz }) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string[]>>({});
  const [showAnswers, setShowAnswers] = useState(false);

  const currentQuestion = quiz.questions[currentQuestionIndex];

  const handleAnswerSelect = (questionId: string, optionId: string, isMultiSelect = false) => {
    setSelectedAnswers(prev => {
      if (isMultiSelect) {
        const current = prev[questionId] || [];
        const updated = current.includes(optionId)
          ? current.filter(id => id !== optionId)
          : [...current, optionId];
        return { ...prev, [questionId]: updated };
      } else {
        return { ...prev, [questionId]: [optionId] };
      }
    });
  };

  const renderQuestionPreview = (question: Question) => {
    const userAnswers = selectedAnswers[question.id] || [];

    switch (question.questionType) {
      case 'MULTIPLE_CHOICE':
        return (
          <div className="space-y-3">
            {question.options.map((option) => {
              const isSelected = userAnswers.includes(option.id);
              const isCorrect = option.isCorrect;
              const showCorrect = showAnswers && isCorrect;
              const showIncorrect = showAnswers && isSelected && !isCorrect;

              return (
                <label
                  key={option.id}
                  className={`flex items-center space-x-3 p-4 rounded-lg border-2 cursor-pointer transition-all ${
                    showCorrect
                      ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                      : showIncorrect
                      ? 'border-red-500 bg-red-50 dark:bg-red-900/20'
                      : isSelected
                      ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                  }`}
                  onClick={() => handleAnswerSelect(question.id, option.id)}
                >
                  <div className="flex-shrink-0">
                    {showCorrect ? (
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    ) : showIncorrect ? (
                      <Circle className="w-5 h-5 text-red-600" />
                    ) : isSelected ? (
                      <CheckCircle className="w-5 h-5 text-primary-600" />
                    ) : (
                      <Circle className="w-5 h-5 text-gray-400" />
                    )}
                  </div>
                  <span className="text-gray-900 dark:text-white">
                    {option.optionText}
                  </span>
                </label>
              );
            })}
          </div>
        );

      case 'MULTIPLE_SELECT':
        return (
          <div className="space-y-3">
            {question.options.map((option) => {
              const isSelected = userAnswers.includes(option.id);
              const isCorrect = option.isCorrect;
              const showCorrect = showAnswers && isCorrect;
              const showIncorrect = showAnswers && isSelected && !isCorrect;

              return (
                <label
                  key={option.id}
                  className={`flex items-center space-x-3 p-4 rounded-lg border-2 cursor-pointer transition-all ${
                    showCorrect
                      ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                      : showIncorrect
                      ? 'border-red-500 bg-red-50 dark:bg-red-900/20'
                      : isSelected
                      ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                  }`}
                  onClick={() => handleAnswerSelect(question.id, option.id, true)}
                >
                  <div className="flex-shrink-0">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => {}}
                      className="w-4 h-4 text-primary-600 focus:ring-primary-500 rounded"
                    />
                  </div>
                  <span className="text-gray-900 dark:text-white">
                    {option.optionText}
                  </span>
                  {showCorrect && (
                    <CheckCircle className="w-4 h-4 text-green-600 ml-auto" />
                  )}
                </label>
              );
            })}
          </div>
        );

      case 'TRUE_FALSE':
        return (
          <div className="space-y-3">
            {['true', 'false'].map((value) => {
              const isSelected = userAnswers.includes(value);
              const isCorrect = question.correctAnswers.includes(value);
              const showCorrect = showAnswers && isCorrect;
              const showIncorrect = showAnswers && isSelected && !isCorrect;

              return (
                <label
                  key={value}
                  className={`flex items-center space-x-3 p-4 rounded-lg border-2 cursor-pointer transition-all ${
                    showCorrect
                      ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                      : showIncorrect
                      ? 'border-red-500 bg-red-50 dark:bg-red-900/20'
                      : isSelected
                      ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                  }`}
                  onClick={() => handleAnswerSelect(question.id, value)}
                >
                  <div className="flex-shrink-0">
                    {showCorrect ? (
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    ) : showIncorrect ? (
                      <Circle className="w-5 h-5 text-red-600" />
                    ) : isSelected ? (
                      <CheckCircle className="w-5 h-5 text-primary-600" />
                    ) : (
                      <Circle className="w-5 h-5 text-gray-400" />
                    )}
                  </div>
                  <span className="text-gray-900 dark:text-white capitalize">
                    {value}
                  </span>
                </label>
              );
            })}
          </div>
        );

      case 'SHORT_ANSWER':
      case 'ESSAY':
        return (
          <div className="space-y-3">
            <textarea
              placeholder={`Enter your ${question.questionType === 'ESSAY' ? 'essay' : 'answer'}...`}
              rows={question.questionType === 'ESSAY' ? 6 : 3}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
            />
            {showAnswers && question.correctAnswers[0] && (
              <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <div className="text-sm font-medium text-green-800 dark:text-green-200 mb-1">
                  Sample Answer:
                </div>
                <div className="text-sm text-green-700 dark:text-green-300">
                  {question.correctAnswers[0]}
                </div>
              </div>
            )}
          </div>
        );

      case 'NUMERICAL':
        return (
          <div className="space-y-3">
            <input
              type="number"
              placeholder="Enter your answer..."
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
            />
            {showAnswers && question.correctAnswers[0] && (
              <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <div className="text-sm font-medium text-green-800 dark:text-green-200">
                  Correct Answer: {question.correctAnswers[0]}
                </div>
              </div>
            )}
          </div>
        );

      default:
        return (
          <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Preview not available for {question.questionType} questions
            </p>
          </div>
        );
    }
  };

  if (quiz.questions.length === 0) {
    return (
      <Card className="text-center py-12">
        <div className="text-gray-400 dark:text-gray-500 mb-4">
          <AlertCircle className="w-12 h-12 mx-auto" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
          No questions to preview
        </h3>
        <p className="text-gray-500 dark:text-gray-400">
          Add some questions to see how your quiz will look to students.
        </p>
      </Card>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Quiz Header */}
      <Card variant="gradient">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            {quiz.title || 'Untitled Quiz'}
          </h1>
          {quiz.description && (
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              {quiz.description}
            </p>
          )}
          
          <div className="flex items-center justify-center space-x-6 text-sm text-gray-500 dark:text-gray-400">
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
          </div>

          {quiz.instructions && (
            <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <h3 className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-2">
                Instructions:
              </h3>
              <p className="text-sm text-blue-700 dark:text-blue-300">
                {quiz.instructions}
              </p>
            </div>
          )}
        </div>
      </Card>

      {/* Controls */}
      <Card>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowAnswers(!showAnswers)}
              icon={showAnswers ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            >
              {showAnswers ? 'Hide Answers' : 'Show Answers'}
            </Button>
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Question {currentQuestionIndex + 1} of {quiz.questions.length}
            </span>
            <div className="flex space-x-1">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentQuestionIndex(Math.max(0, currentQuestionIndex - 1))}
                disabled={currentQuestionIndex === 0}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentQuestionIndex(Math.min(quiz.questions.length - 1, currentQuestionIndex + 1))}
                disabled={currentQuestionIndex === quiz.questions.length - 1}
              >
                Next
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* Question */}
      {currentQuestion && (
        <motion.div
          key={currentQuestion.id}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
        >
          <Card>
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
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
              </div>

              <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                {currentQuestion.questionText || 'Question text not set'}
              </h2>

              {renderQuestionPreview(currentQuestion)}

              {showAnswers && currentQuestion.explanation && (
                <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <div className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-1">
                    Explanation:
                  </div>
                  <div className="text-sm text-blue-700 dark:text-blue-300">
                    {currentQuestion.explanation}
                  </div>
                </div>
              )}
            </div>
          </Card>
        </motion.div>
      )}

      {/* Question Navigation */}
      <Card>
        <div className="grid grid-cols-5 sm:grid-cols-10 gap-2">
          {quiz.questions.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentQuestionIndex(index)}
              className={`w-10 h-10 rounded-lg text-sm font-medium transition-colors ${
                index === currentQuestionIndex
                  ? 'bg-primary-600 text-white'
                  : selectedAnswers[quiz.questions[index].id]
                  ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              {index + 1}
            </button>
          ))}
        </div>
      </Card>

      {/* Preview Notice */}
      <Card variant="bordered" className="border-yellow-200 dark:border-yellow-800 bg-yellow-50 dark:bg-yellow-900/20">
        <div className="flex items-center space-x-3">
          <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
          <div>
            <h3 className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
              Preview Mode
            </h3>
            <p className="text-sm text-yellow-700 dark:text-yellow-300">
              This is how your quiz will appear to students. Answers are not saved in preview mode.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default QuizPreview;
