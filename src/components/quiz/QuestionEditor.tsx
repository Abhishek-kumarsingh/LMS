import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Save,
  X,
  Plus,
  Trash2,
  CheckCircle,
  Circle,
  GripVertical,
  AlertCircle
} from 'lucide-react';
import { Question, QuestionOption } from '../../types';
import Card from '../ui/Card';
import Button from '../ui/Button';
import Input from '../ui/Input';

interface QuestionEditorProps {
  question: Question;
  isEditing: boolean;
  onSave: (question: Question) => void;
  onCancel: () => void;
}

const QuestionEditor: React.FC<QuestionEditorProps> = ({
  question,
  isEditing,
  onSave,
  onCancel
}) => {
  const [editedQuestion, setEditedQuestion] = useState<Question>(question);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    setEditedQuestion(question);
    setErrors({});
  }, [question]);

  const validateQuestion = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!editedQuestion.questionText.trim()) {
      newErrors.questionText = 'Question text is required';
    }

    if (editedQuestion.points <= 0) {
      newErrors.points = 'Points must be greater than 0';
    }

    // Validate based on question type
    switch (editedQuestion.questionType) {
      case 'MULTIPLE_CHOICE':
      case 'MULTIPLE_SELECT':
        if (editedQuestion.options.length < 2) {
          newErrors.options = 'At least 2 options are required';
        }
        const hasCorrectAnswer = editedQuestion.options.some(opt => opt.isCorrect);
        if (!hasCorrectAnswer) {
          newErrors.correctAnswer = 'At least one correct answer is required';
        }
        break;
      
      case 'TRUE_FALSE':
        if (editedQuestion.correctAnswers.length === 0) {
          newErrors.correctAnswer = 'Please select the correct answer';
        }
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (validateQuestion()) {
      onSave(editedQuestion);
    }
  };

  const addOption = () => {
    const newOption: QuestionOption = {
      id: `temp-option-${Date.now()}`,
      questionId: editedQuestion.id,
      optionText: '',
      isCorrect: false,
      orderIndex: editedQuestion.options.length,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    setEditedQuestion(prev => ({
      ...prev,
      options: [...prev.options, newOption]
    }));
  };

  const updateOption = (optionId: string, updates: Partial<QuestionOption>) => {
    setEditedQuestion(prev => ({
      ...prev,
      options: prev.options.map(opt =>
        opt.id === optionId ? { ...opt, ...updates } : opt
      )
    }));
  };

  const deleteOption = (optionId: string) => {
    setEditedQuestion(prev => ({
      ...prev,
      options: prev.options.filter(opt => opt.id !== optionId)
    }));
  };

  const toggleCorrectAnswer = (optionId: string) => {
    if (editedQuestion.questionType === 'MULTIPLE_CHOICE') {
      // Single correct answer - uncheck others
      setEditedQuestion(prev => ({
        ...prev,
        options: prev.options.map(opt => ({
          ...opt,
          isCorrect: opt.id === optionId
        }))
      }));
    } else {
      // Multiple correct answers allowed
      updateOption(optionId, { 
        isCorrect: !editedQuestion.options.find(opt => opt.id === optionId)?.isCorrect 
      });
    }
  };

  const renderQuestionTypeSpecificFields = () => {
    switch (editedQuestion.questionType) {
      case 'MULTIPLE_CHOICE':
      case 'MULTIPLE_SELECT':
        return (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Answer Options
              </label>
              <Button
                variant="outline"
                size="sm"
                onClick={addOption}
                icon={<Plus className="w-4 h-4" />}
              >
                Add Option
              </Button>
            </div>

            {errors.options && (
              <div className="text-sm text-red-600 dark:text-red-400 flex items-center">
                <AlertCircle className="w-4 h-4 mr-1" />
                {errors.options}
              </div>
            )}

            {errors.correctAnswer && (
              <div className="text-sm text-red-600 dark:text-red-400 flex items-center">
                <AlertCircle className="w-4 h-4 mr-1" />
                {errors.correctAnswer}
              </div>
            )}

            <div className="space-y-2">
              {editedQuestion.options.map((option, index) => (
                <div key={option.id} className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <GripVertical className="w-4 h-4 text-gray-400 cursor-grab" />
                  
                  <button
                    onClick={() => toggleCorrectAnswer(option.id)}
                    className={`flex-shrink-0 ${
                      option.isCorrect
                        ? 'text-green-600 dark:text-green-400'
                        : 'text-gray-400 dark:text-gray-500'
                    }`}
                  >
                    {option.isCorrect ? (
                      <CheckCircle className="w-5 h-5" />
                    ) : (
                      <Circle className="w-5 h-5" />
                    )}
                  </button>

                  <div className="flex-1">
                    <input
                      type="text"
                      value={option.optionText}
                      onChange={(e) => updateOption(option.id, { optionText: e.target.value })}
                      placeholder={`Option ${index + 1}`}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                    />
                  </div>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => deleteOption(option.id)}
                    icon={<Trash2 className="w-4 h-4" />}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                  />
                </div>
              ))}
            </div>

            {editedQuestion.options.length < 6 && (
              <Button
                variant="ghost"
                onClick={addOption}
                icon={<Plus className="w-4 h-4" />}
                className="w-full border-dashed border-2"
              >
                Add Another Option
              </Button>
            )}
          </div>
        );

      case 'TRUE_FALSE':
        return (
          <div className="space-y-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Correct Answer
            </label>
            
            {errors.correctAnswer && (
              <div className="text-sm text-red-600 dark:text-red-400 flex items-center">
                <AlertCircle className="w-4 h-4 mr-1" />
                {errors.correctAnswer}
              </div>
            )}

            <div className="space-y-2">
              {['true', 'false'].map((value) => (
                <label key={value} className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg cursor-pointer">
                  <input
                    type="radio"
                    name="trueFalseAnswer"
                    value={value}
                    checked={editedQuestion.correctAnswers.includes(value)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setEditedQuestion(prev => ({
                          ...prev,
                          correctAnswers: [value]
                        }));
                      }
                    }}
                    className="w-4 h-4 text-primary-600 focus:ring-primary-500"
                  />
                  <span className="text-sm font-medium text-gray-900 dark:text-white capitalize">
                    {value}
                  </span>
                </label>
              ))}
            </div>
          </div>
        );

      case 'SHORT_ANSWER':
      case 'ESSAY':
        return (
          <div className="space-y-4">
            <Input
              label="Sample Answer (Optional)"
              value={editedQuestion.correctAnswers[0] || ''}
              onChange={(e) => setEditedQuestion(prev => ({
                ...prev,
                correctAnswers: [e.target.value]
              }))}
              placeholder="Enter a sample correct answer..."
              helperText="This will help with grading guidance"
            />
          </div>
        );

      case 'NUMERICAL':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Correct Answer"
                type="number"
                value={editedQuestion.correctAnswers[0] || ''}
                onChange={(e) => setEditedQuestion(prev => ({
                  ...prev,
                  correctAnswers: [e.target.value]
                }))}
                placeholder="Enter the correct number..."
              />
              <Input
                label="Tolerance (±)"
                type="number"
                step="0.01"
                placeholder="0.1"
                helperText="Acceptable margin of error"
              />
            </div>
          </div>
        );

      default:
        return (
          <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
            <p className="text-sm text-yellow-800 dark:text-yellow-200">
              Question type "{editedQuestion.questionType}" configuration coming soon.
            </p>
          </div>
        );
    }
  };

  if (!isEditing) {
    return (
      <Card>
        <div className="text-center py-8">
          <div className="text-gray-400 dark:text-gray-500 mb-4">
            <Circle className="w-12 h-12 mx-auto" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            Select a question to edit
          </h3>
          <p className="text-gray-500 dark:text-gray-400">
            Choose a question from the list to view and edit its details.
          </p>
        </div>
      </Card>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
    >
      <Card>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            Edit Question
          </h3>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onCancel}
              icon={<X className="w-4 h-4" />}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleSave}
              icon={<Save className="w-4 h-4" />}
            >
              Save
            </Button>
          </div>
        </div>

        <div className="space-y-6">
          {/* Question Text */}
          <div>
            <Input
              label="Question"
              value={editedQuestion.questionText}
              onChange={(e) => setEditedQuestion(prev => ({ ...prev, questionText: e.target.value }))}
              placeholder="Enter your question..."
              error={errors.questionText}
            />
          </div>

          {/* Points */}
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Points"
              type="number"
              min="0.1"
              step="0.1"
              value={editedQuestion.points}
              onChange={(e) => setEditedQuestion(prev => ({ ...prev, points: parseFloat(e.target.value) || 1 }))}
              error={errors.points}
            />
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Required
              </label>
              <label className="flex items-center space-x-2 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg cursor-pointer">
                <input
                  type="checkbox"
                  checked={editedQuestion.isRequired}
                  onChange={(e) => setEditedQuestion(prev => ({ ...prev, isRequired: e.target.checked }))}
                  className="w-4 h-4 text-primary-600 focus:ring-primary-500 rounded"
                />
                <span className="text-sm text-gray-900 dark:text-white">
                  This question is required
                </span>
              </label>
            </div>
          </div>

          {/* Question Type Specific Fields */}
          {renderQuestionTypeSpecificFields()}

          {/* Explanation */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Explanation (Optional)
            </label>
            <textarea
              value={editedQuestion.explanation || ''}
              onChange={(e) => setEditedQuestion(prev => ({ ...prev, explanation: e.target.value }))}
              placeholder="Explain the correct answer..."
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              This explanation will be shown to students after they submit their answer.
            </p>
          </div>
        </div>
      </Card>
    </motion.div>
  );
};

export default QuestionEditor;
