import React from 'react';
import { Question, QuestionAnswer } from '../../types';
import { Upload, FileText } from 'lucide-react';
import Button from '../ui/Button';

interface QuestionRendererProps {
  question: Question;
  answer?: QuestionAnswer;
  onAnswerChange: (answer: Partial<QuestionAnswer>) => void;
  disabled?: boolean;
  showCorrectAnswers?: boolean;
}

const QuestionRenderer: React.FC<QuestionRendererProps> = ({
  question,
  answer,
  onAnswerChange,
  disabled = false,
  showCorrectAnswers = false
}) => {
  const handleOptionSelect = (optionId: string, isMultiSelect = false) => {
    if (disabled) return;

    const currentSelected = answer?.selectedOptions || [];
    let newSelected: string[];

    if (isMultiSelect) {
      newSelected = currentSelected.includes(optionId)
        ? currentSelected.filter(id => id !== optionId)
        : [...currentSelected, optionId];
    } else {
      newSelected = [optionId];
    }

    onAnswerChange({ selectedOptions: newSelected });
  };

  const handleTextChange = (text: string) => {
    if (disabled) return;
    onAnswerChange({ answerText: text });
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (disabled) return;
    const file = event.target.files?.[0];
    if (file) {
      // In a real implementation, you would upload the file and get a URL
      const fileUrl = URL.createObjectURL(file);
      onAnswerChange({ fileUploadUrl: fileUrl });
    }
  };

  const renderQuestionContent = () => {
    switch (question.questionType) {
      case 'MULTIPLE_CHOICE':
        return (
          <div className="space-y-3">
            {question.options.map((option) => {
              const isSelected = answer?.selectedOptions?.includes(option.id) || false;
              const isCorrect = showCorrectAnswers && option.isCorrect;
              const isIncorrect = showCorrectAnswers && isSelected && !option.isCorrect;

              return (
                <label
                  key={option.id}
                  className={`flex items-center space-x-3 p-4 rounded-lg border-2 cursor-pointer transition-all ${
                    disabled ? 'cursor-not-allowed opacity-60' : ''
                  } ${
                    isCorrect
                      ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                      : isIncorrect
                      ? 'border-red-500 bg-red-50 dark:bg-red-900/20'
                      : isSelected
                      ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                  }`}
                  onClick={() => handleOptionSelect(option.id)}
                >
                  <input
                    type="radio"
                    name={`question-${question.id}`}
                    checked={isSelected}
                    onChange={() => {}}
                    disabled={disabled}
                    className="w-4 h-4 text-primary-600 focus:ring-primary-500"
                  />
                  <span className="text-gray-900 dark:text-white flex-1">
                    {option.optionText}
                  </span>
                  {showCorrectAnswers && option.isCorrect && (
                    <span className="text-green-600 dark:text-green-400 text-sm font-medium">
                      Correct
                    </span>
                  )}
                </label>
              );
            })}
          </div>
        );

      case 'MULTIPLE_SELECT':
        return (
          <div className="space-y-3">
            {question.options.map((option) => {
              const isSelected = answer?.selectedOptions?.includes(option.id) || false;
              const isCorrect = showCorrectAnswers && option.isCorrect;
              const isIncorrect = showCorrectAnswers && isSelected && !option.isCorrect;

              return (
                <label
                  key={option.id}
                  className={`flex items-center space-x-3 p-4 rounded-lg border-2 cursor-pointer transition-all ${
                    disabled ? 'cursor-not-allowed opacity-60' : ''
                  } ${
                    isCorrect
                      ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                      : isIncorrect
                      ? 'border-red-500 bg-red-50 dark:bg-red-900/20'
                      : isSelected
                      ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                  }`}
                  onClick={() => handleOptionSelect(option.id, true)}
                >
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => {}}
                    disabled={disabled}
                    className="w-4 h-4 text-primary-600 focus:ring-primary-500 rounded"
                  />
                  <span className="text-gray-900 dark:text-white flex-1">
                    {option.optionText}
                  </span>
                  {showCorrectAnswers && option.isCorrect && (
                    <span className="text-green-600 dark:text-green-400 text-sm font-medium">
                      Correct
                    </span>
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
              const isSelected = answer?.selectedOptions?.includes(value) || false;
              const isCorrect = showCorrectAnswers && question.correctAnswers.includes(value);
              const isIncorrect = showCorrectAnswers && isSelected && !question.correctAnswers.includes(value);

              return (
                <label
                  key={value}
                  className={`flex items-center space-x-3 p-4 rounded-lg border-2 cursor-pointer transition-all ${
                    disabled ? 'cursor-not-allowed opacity-60' : ''
                  } ${
                    isCorrect
                      ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                      : isIncorrect
                      ? 'border-red-500 bg-red-50 dark:bg-red-900/20'
                      : isSelected
                      ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                  }`}
                  onClick={() => handleOptionSelect(value)}
                >
                  <input
                    type="radio"
                    name={`question-${question.id}`}
                    checked={isSelected}
                    onChange={() => {}}
                    disabled={disabled}
                    className="w-4 h-4 text-primary-600 focus:ring-primary-500"
                  />
                  <span className="text-gray-900 dark:text-white capitalize">
                    {value}
                  </span>
                  {showCorrectAnswers && question.correctAnswers.includes(value) && (
                    <span className="text-green-600 dark:text-green-400 text-sm font-medium">
                      Correct
                    </span>
                  )}
                </label>
              );
            })}
          </div>
        );

      case 'SHORT_ANSWER':
        return (
          <div className="space-y-3">
            <input
              type="text"
              value={answer?.answerText || ''}
              onChange={(e) => handleTextChange(e.target.value)}
              placeholder="Enter your answer..."
              disabled={disabled}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 disabled:opacity-60"
            />
            {showCorrectAnswers && question.correctAnswers[0] && (
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

      case 'ESSAY':
        return (
          <div className="space-y-3">
            <textarea
              value={answer?.answerText || ''}
              onChange={(e) => handleTextChange(e.target.value)}
              placeholder="Enter your essay response..."
              rows={8}
              disabled={disabled}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 disabled:opacity-60"
            />
            <div className="text-sm text-gray-500 dark:text-gray-400">
              {answer?.answerText?.length || 0} characters
            </div>
            {showCorrectAnswers && question.correctAnswers[0] && (
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
              step="any"
              value={answer?.numericalAnswer || ''}
              onChange={(e) => onAnswerChange({ numericalAnswer: parseFloat(e.target.value) || undefined })}
              placeholder="Enter your numerical answer..."
              disabled={disabled}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 disabled:opacity-60"
            />
            {showCorrectAnswers && question.correctAnswers[0] && (
              <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <div className="text-sm font-medium text-green-800 dark:text-green-200">
                  Correct Answer: {question.correctAnswers[0]}
                </div>
              </div>
            )}
          </div>
        );

      case 'FILE_UPLOAD':
        return (
          <div className="space-y-3">
            <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6">
              <div className="text-center">
                <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                  Upload your file here
                </div>
                <input
                  type="file"
                  onChange={handleFileUpload}
                  disabled={disabled}
                  className="hidden"
                  id={`file-upload-${question.id}`}
                />
                <label
                  htmlFor={`file-upload-${question.id}`}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 cursor-pointer disabled:opacity-60"
                >
                  Choose File
                </label>
              </div>
              
              {answer?.fileUploadUrl && (
                <div className="mt-4 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <FileText className="w-4 h-4 text-green-600 dark:text-green-400" />
                    <span className="text-sm text-green-800 dark:text-green-200">
                      File uploaded successfully
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        );

      case 'FILL_IN_BLANK':
        // This would need more complex parsing of the question text to identify blanks
        return (
          <div className="space-y-3">
            <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
              <p className="text-sm text-yellow-800 dark:text-yellow-200">
                Fill-in-the-blank questions require custom implementation based on question format.
              </p>
            </div>
            <textarea
              value={answer?.answerText || ''}
              onChange={(e) => handleTextChange(e.target.value)}
              placeholder="Enter your answers..."
              rows={3}
              disabled={disabled}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 disabled:opacity-60"
            />
          </div>
        );

      default:
        return (
          <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Question type "{question.questionType}" is not yet supported in this interface.
            </p>
          </div>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Question Text */}
      <div>
        <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
          {question.questionText}
        </h2>
        
        {question.questionHtml && (
          <div 
            className="prose dark:prose-invert max-w-none mb-4"
            dangerouslySetInnerHTML={{ __html: question.questionHtml }}
          />
        )}
      </div>

      {/* Question Content */}
      {renderQuestionContent()}

      {/* Explanation (shown after answering if enabled) */}
      {showCorrectAnswers && question.explanation && (
        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <div className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-1">
            Explanation:
          </div>
          <div className="text-sm text-blue-700 dark:text-blue-300">
            {question.explanation}
          </div>
        </div>
      )}
    </div>
  );
};

export default QuestionRenderer;
