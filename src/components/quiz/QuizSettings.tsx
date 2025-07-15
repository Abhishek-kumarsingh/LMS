import React from 'react';
import { motion } from 'framer-motion';
import {
  Clock,
  Users,
  Eye,
  Shuffle,
  CheckCircle,
  Calendar,
  BarChart3,
  Settings,
  AlertTriangle
} from 'lucide-react';
import { Quiz } from '../../types';
import Card from '../ui/Card';
import Input from '../ui/Input';

interface QuizSettingsProps {
  quiz: Quiz;
  onUpdateQuiz: (quiz: Quiz) => void;
}

const QuizSettings: React.FC<QuizSettingsProps> = ({ quiz, onUpdateQuiz }) => {
  const updateQuiz = (updates: Partial<Quiz>) => {
    onUpdateQuiz({ ...quiz, ...updates });
  };

  const formatDateTime = (dateString?: string) => {
    if (!dateString) return '';
    return new Date(dateString).toISOString().slice(0, 16);
  };

  const parseDateTime = (dateString: string) => {
    return dateString ? new Date(dateString).toISOString() : undefined;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto space-y-8"
    >
      {/* Basic Settings */}
      <Card>
        <div className="flex items-center space-x-3 mb-6">
          <Settings className="w-5 h-5 text-primary-600 dark:text-primary-400" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Basic Settings
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Quiz Type
            </label>
            <select
              value={quiz.quizType}
              onChange={(e) => updateQuiz({ quizType: e.target.value as any })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
            >
              <option value="PRACTICE">Practice Quiz</option>
              <option value="GRADED">Graded Quiz</option>
              <option value="SURVEY">Survey</option>
              <option value="EXAM">Exam</option>
            </select>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {quiz.quizType === 'PRACTICE' && 'For practice only, doesn\'t count toward grade'}
              {quiz.quizType === 'GRADED' && 'Counts toward the final course grade'}
              {quiz.quizType === 'SURVEY' && 'For feedback collection, no correct answers'}
              {quiz.quizType === 'EXAM' && 'High-stakes assessment with stricter controls'}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Grading Method
            </label>
            <select
              value={quiz.gradingMethod}
              onChange={(e) => updateQuiz({ gradingMethod: e.target.value as any })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
            >
              <option value="HIGHEST_SCORE">Highest Score</option>
              <option value="LATEST_SCORE">Latest Score</option>
              <option value="AVERAGE_SCORE">Average Score</option>
              <option value="FIRST_SCORE">First Score</option>
            </select>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              How to calculate the final score when multiple attempts are allowed
            </p>
          </div>
        </div>

        <div className="mt-6">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Instructions
          </label>
          <textarea
            value={quiz.instructions || ''}
            onChange={(e) => updateQuiz({ instructions: e.target.value })}
            placeholder="Enter instructions for students taking this quiz..."
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
          />
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            These instructions will be shown to students before they start the quiz
          </p>
        </div>
      </Card>

      {/* Timing & Attempts */}
      <Card>
        <div className="flex items-center space-x-3 mb-6">
          <Clock className="w-5 h-5 text-primary-600 dark:text-primary-400" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Timing & Attempts
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Time Limit (minutes)
            </label>
            <input
              type="number"
              min="1"
              value={quiz.timeLimitMinutes || ''}
              onChange={(e) => updateQuiz({ 
                timeLimitMinutes: e.target.value ? parseInt(e.target.value) : undefined 
              })}
              placeholder="No time limit"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Leave empty for no time limit
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Maximum Attempts
            </label>
            <input
              type="number"
              min="1"
              max="10"
              value={quiz.maxAttempts}
              onChange={(e) => updateQuiz({ maxAttempts: parseInt(e.target.value) || 1 })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Number of times students can take this quiz
            </p>
          </div>
        </div>

        <div className="mt-6">
          <Input
            label="Passing Score (%)"
            type="number"
            min="0"
            max="100"
            value={quiz.passingScore || ''}
            onChange={(e) => updateQuiz({ 
              passingScore: e.target.value ? parseFloat(e.target.value) : undefined 
            })}
            placeholder="No passing score required"
            helperText="Minimum score required to pass (leave empty if not applicable)"
          />
        </div>
      </Card>

      {/* Availability */}
      <Card>
        <div className="flex items-center space-x-3 mb-6">
          <Calendar className="w-5 h-5 text-primary-600 dark:text-primary-400" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Availability
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Available From
            </label>
            <input
              type="datetime-local"
              value={formatDateTime(quiz.availableFrom)}
              onChange={(e) => updateQuiz({ availableFrom: parseDateTime(e.target.value) })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              When students can start taking the quiz
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Available Until
            </label>
            <input
              type="datetime-local"
              value={formatDateTime(quiz.availableUntil)}
              onChange={(e) => updateQuiz({ availableUntil: parseDateTime(e.target.value) })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              When the quiz becomes unavailable
            </p>
          </div>
        </div>
      </Card>

      {/* Display Options */}
      <Card>
        <div className="flex items-center space-x-3 mb-6">
          <Eye className="w-5 h-5 text-primary-600 dark:text-primary-400" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Display Options
          </h2>
        </div>

        <div className="space-y-4">
          <label className="flex items-center space-x-3 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg cursor-pointer">
            <input
              type="checkbox"
              checked={quiz.isRandomized}
              onChange={(e) => updateQuiz({ isRandomized: e.target.checked })}
              className="w-4 h-4 text-primary-600 focus:ring-primary-500 rounded"
            />
            <div className="flex-1">
              <div className="flex items-center space-x-2">
                <Shuffle className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  Randomize Question Order
                </span>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Questions will appear in random order for each student
              </p>
            </div>
          </label>

          <label className="flex items-center space-x-3 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg cursor-pointer">
            <input
              type="checkbox"
              checked={quiz.showResultsImmediately}
              onChange={(e) => updateQuiz({ showResultsImmediately: e.target.checked })}
              className="w-4 h-4 text-primary-600 focus:ring-primary-500 rounded"
            />
            <div className="flex-1">
              <div className="flex items-center space-x-2">
                <BarChart3 className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  Show Results Immediately
                </span>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Students see their score immediately after submission
              </p>
            </div>
          </label>

          <label className="flex items-center space-x-3 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg cursor-pointer">
            <input
              type="checkbox"
              checked={quiz.showCorrectAnswers}
              onChange={(e) => updateQuiz({ showCorrectAnswers: e.target.checked })}
              className="w-4 h-4 text-primary-600 focus:ring-primary-500 rounded"
            />
            <div className="flex-1">
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  Show Correct Answers
                </span>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Students can see correct answers after submission
              </p>
            </div>
          </label>

          <label className="flex items-center space-x-3 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg cursor-pointer">
            <input
              type="checkbox"
              checked={quiz.allowReview}
              onChange={(e) => updateQuiz({ allowReview: e.target.checked })}
              className="w-4 h-4 text-primary-600 focus:ring-primary-500 rounded"
            />
            <div className="flex-1">
              <div className="flex items-center space-x-2">
                <Eye className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  Allow Review
                </span>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Students can review their answers before submitting
              </p>
            </div>
          </label>
        </div>
      </Card>

      {/* Security Settings (for Exams) */}
      {quiz.quizType === 'EXAM' && (
        <Card>
          <div className="flex items-center space-x-3 mb-6">
            <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Security Settings
            </h2>
          </div>

          <div className="space-y-4">
            <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
              <p className="text-sm text-red-800 dark:text-red-200">
                <strong>Exam Mode:</strong> Additional security features are automatically enabled for exams, including:
              </p>
              <ul className="text-sm text-red-700 dark:text-red-300 mt-2 space-y-1 list-disc list-inside">
                <li>Browser lockdown (prevents switching tabs)</li>
                <li>Webcam monitoring (if enabled by institution)</li>
                <li>Screen recording detection</li>
                <li>Copy/paste restrictions</li>
                <li>Right-click disabled</li>
              </ul>
            </div>
          </div>
        </Card>
      )}

      {/* Summary */}
      <Card variant="gradient">
        <div className="flex items-center space-x-3 mb-4">
          <BarChart3 className="w-5 h-5 text-primary-600 dark:text-primary-400" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Quiz Summary
          </h2>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-primary-600 dark:text-primary-400">
              {quiz.questions.length}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Questions</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-primary-600 dark:text-primary-400">
              {quiz.totalPoints}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Total Points</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-primary-600 dark:text-primary-400">
              {quiz.timeLimitMinutes || '∞'}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              {quiz.timeLimitMinutes ? 'Minutes' : 'No Limit'}
            </div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-primary-600 dark:text-primary-400">
              {quiz.maxAttempts}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Max Attempts</div>
          </div>
        </div>
      </Card>
    </motion.div>
  );
};

export default QuizSettings;
