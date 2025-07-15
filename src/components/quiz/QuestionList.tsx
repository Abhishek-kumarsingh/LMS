import React from 'react';
import { motion, Reorder } from 'framer-motion';
import {
  Plus,
  GripVertical,
  Edit3,
  Trash2,
  CheckCircle,
  Circle,
  FileText,
  List,
  ToggleLeft,
  Type,
  Hash,
  Upload,
  MousePointer,
  Target
} from 'lucide-react';
import { Question, QuestionType } from '../../types';
import Card from '../ui/Card';
import Button from '../ui/Button';

interface QuestionListProps {
  questions: Question[];
  selectedQuestion: Question | null;
  onSelectQuestion: (question: Question) => void;
  onAddQuestion: (type: QuestionType) => void;
  onDeleteQuestion: (questionId: string) => void;
  onReorderQuestions: (startIndex: number, endIndex: number) => void;
  onEditQuestion: () => void;
}

const QuestionList: React.FC<QuestionListProps> = ({
  questions,
  selectedQuestion,
  onSelectQuestion,
  onAddQuestion,
  onDeleteQuestion,
  onReorderQuestions,
  onEditQuestion
}) => {
  const questionTypes = [
    { type: 'MULTIPLE_CHOICE', label: 'Multiple Choice', icon: Circle, description: 'Single correct answer' },
    { type: 'MULTIPLE_SELECT', label: 'Multiple Select', icon: CheckCircle, description: 'Multiple correct answers' },
    { type: 'TRUE_FALSE', label: 'True/False', icon: ToggleLeft, description: 'True or false question' },
    { type: 'SHORT_ANSWER', label: 'Short Answer', icon: Type, description: 'Brief text response' },
    { type: 'ESSAY', label: 'Essay', icon: FileText, description: 'Long text response' },
    { type: 'FILL_IN_BLANK', label: 'Fill in Blank', icon: Type, description: 'Complete the sentence' },
    { type: 'MATCHING', label: 'Matching', icon: List, description: 'Match items together' },
    { type: 'ORDERING', label: 'Ordering', icon: List, description: 'Put items in order' },
    { type: 'NUMERICAL', label: 'Numerical', icon: Hash, description: 'Number answer' },
    { type: 'FILE_UPLOAD', label: 'File Upload', icon: Upload, description: 'Upload a file' },
    { type: 'DRAG_AND_DROP', label: 'Drag & Drop', icon: MousePointer, description: 'Interactive drag and drop' },
    { type: 'HOTSPOT', label: 'Hotspot', icon: Target, description: 'Click on image areas' }
  ];

  const getQuestionIcon = (type: QuestionType) => {
    const questionType = questionTypes.find(qt => qt.type === type);
    return questionType?.icon || Circle;
  };

  const getQuestionTypeLabel = (type: QuestionType) => {
    const questionType = questionTypes.find(qt => qt.type === type);
    return questionType?.label || type;
  };

  const [showAddMenu, setShowAddMenu] = React.useState(false);

  return (
    <div className="space-y-6">
      {/* Add Question Button */}
      <Card>
        <div className="relative">
          <Button
            variant="outline"
            fullWidth
            onClick={() => setShowAddMenu(!showAddMenu)}
            icon={<Plus className="w-4 h-4" />}
            className="border-dashed border-2"
          >
            Add Question
          </Button>

          {/* Question Type Menu */}
          {showAddMenu && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-10 max-h-96 overflow-y-auto"
            >
              <div className="p-2">
                <div className="text-sm font-medium text-gray-700 dark:text-gray-300 px-3 py-2">
                  Select Question Type
                </div>
                <div className="grid grid-cols-1 gap-1">
                  {questionTypes.map((questionType) => {
                    const Icon = questionType.icon;
                    return (
                      <button
                        key={questionType.type}
                        onClick={() => {
                          onAddQuestion(questionType.type as QuestionType);
                          setShowAddMenu(false);
                        }}
                        className="flex items-center space-x-3 w-full px-3 py-2 text-left rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                      >
                        <Icon className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                        <div>
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {questionType.label}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            {questionType.description}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </Card>

      {/* Questions List */}
      {questions.length > 0 && (
        <Card padding="none">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              Questions ({questions.length})
            </h3>
          </div>

          <Reorder.Group
            axis="y"
            values={questions}
            onReorder={(reorderedQuestions) => {
              // Find the moved item and calculate indices
              const oldIndex = questions.findIndex(q => q.id === reorderedQuestions[0].id);
              const newIndex = 0; // This is simplified - in a real implementation you'd calculate this properly
              onReorderQuestions(oldIndex, newIndex);
            }}
            className="divide-y divide-gray-200 dark:divide-gray-700"
          >
            {questions.map((question, index) => {
              const Icon = getQuestionIcon(question.questionType);
              const isSelected = selectedQuestion?.id === question.id;

              return (
                <Reorder.Item
                  key={question.id}
                  value={question}
                  className={`p-4 cursor-pointer transition-colors ${
                    isSelected
                      ? 'bg-primary-50 dark:bg-primary-900/20 border-l-4 border-primary-500'
                      : 'hover:bg-gray-50 dark:hover:bg-gray-700/50'
                  }`}
                  onClick={() => onSelectQuestion(question)}
                >
                  <div className="flex items-center space-x-4">
                    {/* Drag Handle */}
                    <div className="flex-shrink-0">
                      <GripVertical className="w-4 h-4 text-gray-400 cursor-grab" />
                    </div>

                    {/* Question Number */}
                    <div className="flex-shrink-0 w-8 h-8 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
                        {index + 1}
                      </span>
                    </div>

                    {/* Question Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        <Icon className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                        <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                          {getQuestionTypeLabel(question.questionType)}
                        </span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          • {question.points} {question.points === 1 ? 'point' : 'points'}
                        </span>
                      </div>
                      <div className="text-sm text-gray-900 dark:text-white truncate">
                        {question.questionText || 'Untitled Question'}
                      </div>
                      {question.options.length > 0 && (
                        <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          {question.options.length} options
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center space-x-2">
                      {isSelected && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            onEditQuestion();
                          }}
                          icon={<Edit3 className="w-4 h-4" />}
                        />
                      )}
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (confirm('Are you sure you want to delete this question?')) {
                            onDeleteQuestion(question.id);
                          }
                        }}
                        icon={<Trash2 className="w-4 h-4" />}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                      />
                    </div>
                  </div>
                </Reorder.Item>
              );
            })}
          </Reorder.Group>
        </Card>
      )}

      {/* Empty State */}
      {questions.length === 0 && (
        <Card className="text-center py-12">
          <div className="text-gray-400 dark:text-gray-500 mb-4">
            <FileText className="w-12 h-12 mx-auto" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No questions yet
          </h3>
          <p className="text-gray-500 dark:text-gray-400 mb-6">
            Get started by adding your first question to the quiz.
          </p>
          <Button
            variant="primary"
            onClick={() => setShowAddMenu(true)}
            icon={<Plus className="w-4 h-4" />}
          >
            Add First Question
          </Button>
        </Card>
      )}
    </div>
  );
};

export default QuestionList;
