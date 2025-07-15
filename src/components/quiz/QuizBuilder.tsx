import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Save,
  Eye,
  Plus,
  Settings,
  Clock,
  Users,
  BarChart3,
  ArrowLeft,
  CheckCircle,
  AlertCircle,
  Trash2
} from 'lucide-react';
import { Quiz, Question, QuestionType } from '../../types';
import { useAuthStore } from '../../store/authStore';
import { useToastStore } from '../../store/toastStore';
import Card from '../ui/Card';
import Button from '../ui/Button';
import Input from '../ui/Input';
import QuizSettings from './QuizSettings';
import QuestionEditor from './QuestionEditor';
import QuestionList from './QuestionList';
import QuizPreview from './QuizPreview';

interface QuizBuilderProps {
  quizId?: string;
  courseId: string;
}

const QuizBuilder: React.FC<QuizBuilderProps> = ({ quizId, courseId }) => {
  const { user } = useAuthStore();
  const { addToast } = useToastStore();
  const navigate = useNavigate();
  
  const [quiz, setQuiz] = useState<Quiz>({
    id: '',
    title: '',
    description: '',
    instructions: '',
    courseId,
    createdBy: user?.id || '',
    timeLimitMinutes: undefined,
    maxAttempts: 1,
    passingScore: undefined,
    totalPoints: 0,
    isPublished: false,
    isRandomized: false,
    showResultsImmediately: true,
    showCorrectAnswers: true,
    allowReview: true,
    availableFrom: undefined,
    availableUntil: undefined,
    quizType: 'PRACTICE',
    gradingMethod: 'HIGHEST_SCORE',
    questions: [],
    attempts: [],
    createdAt: '',
    updatedAt: ''
  });

  const [activeTab, setActiveTab] = useState<'builder' | 'settings' | 'preview'>('builder');
  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setSaving] = useState(false);
  const [isPublishing, setPublishing] = useState(false);

  useEffect(() => {
    if (quizId) {
      loadQuiz(quizId);
    }
  }, [quizId]);

  const loadQuiz = async (id: string) => {
    try {
      // TODO: Replace with actual API call
      const response = await fetch(`/api/quizzes/${id}`);
      if (response.ok) {
        const quizData = await response.json();
        setQuiz(quizData);
      }
    } catch (error) {
      addToast('Failed to load quiz', 'error');
    }
  };

  const saveQuiz = async () => {
    setSaving(true);
    try {
      const url = quiz.id ? `/api/quizzes/${quiz.id}` : '/api/quizzes';
      const method = quiz.id ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(quiz)
      });

      if (response.ok) {
        const savedQuiz = await response.json();
        setQuiz(savedQuiz);
        addToast('Quiz saved successfully', 'success');
      } else {
        throw new Error('Failed to save quiz');
      }
    } catch (error) {
      addToast('Failed to save quiz', 'error');
    } finally {
      setSaving(false);
    }
  };

  const publishQuiz = async () => {
    if (!quiz.id) {
      addToast('Please save the quiz first', 'warning');
      return;
    }

    if (quiz.questions.length === 0) {
      addToast('Please add at least one question before publishing', 'warning');
      return;
    }

    setPublishing(true);
    try {
      const response = await fetch(`/api/quizzes/${quiz.id}/publish`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const publishedQuiz = await response.json();
        setQuiz(publishedQuiz);
        addToast('Quiz published successfully', 'success');
      } else {
        throw new Error('Failed to publish quiz');
      }
    } catch (error) {
      addToast('Failed to publish quiz', 'error');
    } finally {
      setPublishing(false);
    }
  };

  const addQuestion = (type: QuestionType) => {
    const newQuestion: Question = {
      id: `temp-${Date.now()}`,
      quizId: quiz.id,
      questionText: '',
      questionType: type,
      points: 1,
      orderIndex: quiz.questions.length,
      explanation: '',
      isRequired: true,
      options: [],
      correctAnswers: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    setQuiz(prev => ({
      ...prev,
      questions: [...prev.questions, newQuestion],
      totalPoints: prev.totalPoints + 1
    }));

    setSelectedQuestion(newQuestion);
    setIsEditing(true);
  };

  const updateQuestion = (updatedQuestion: Question) => {
    setQuiz(prev => ({
      ...prev,
      questions: prev.questions.map(q => 
        q.id === updatedQuestion.id ? updatedQuestion : q
      ),
      totalPoints: prev.questions.reduce((total, q) => 
        total + (q.id === updatedQuestion.id ? updatedQuestion.points : q.points), 0
      )
    }));
  };

  const deleteQuestion = (questionId: string) => {
    const questionToDelete = quiz.questions.find(q => q.id === questionId);
    if (!questionToDelete) return;

    setQuiz(prev => ({
      ...prev,
      questions: prev.questions.filter(q => q.id !== questionId),
      totalPoints: prev.totalPoints - questionToDelete.points
    }));

    if (selectedQuestion?.id === questionId) {
      setSelectedQuestion(null);
      setIsEditing(false);
    }
  };

  const reorderQuestions = (startIndex: number, endIndex: number) => {
    const result = Array.from(quiz.questions);
    const [removed] = result.splice(startIndex, 1);
    result.splice(endIndex, 0, removed);

    // Update order indices
    const reorderedQuestions = result.map((question, index) => ({
      ...question,
      orderIndex: index
    }));

    setQuiz(prev => ({
      ...prev,
      questions: reorderedQuestions
    }));
  };

  const tabs = [
    { id: 'builder', label: 'Questions', icon: Plus },
    { id: 'settings', label: 'Settings', icon: Settings },
    { id: 'preview', label: 'Preview', icon: Eye }
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate(`/instructor/courses/${courseId}`)}
                icon={<ArrowLeft className="w-4 h-4" />}
              >
                Back to Course
              </Button>
              
              <div>
                <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
                  {quiz.title || 'New Quiz'}
                </h1>
                <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                  <span className="flex items-center">
                    <Clock className="w-4 h-4 mr-1" />
                    {quiz.timeLimitMinutes ? `${quiz.timeLimitMinutes} min` : 'No time limit'}
                  </span>
                  <span className="flex items-center">
                    <BarChart3 className="w-4 h-4 mr-1" />
                    {quiz.totalPoints} points
                  </span>
                  <span className="flex items-center">
                    <Users className="w-4 h-4 mr-1" />
                    {quiz.questions.length} questions
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2">
                {quiz.isPublished ? (
                  <span className="flex items-center text-green-600 dark:text-green-400">
                    <CheckCircle className="w-4 h-4 mr-1" />
                    Published
                  </span>
                ) : (
                  <span className="flex items-center text-yellow-600 dark:text-yellow-400">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    Draft
                  </span>
                )}
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={saveQuiz}
                loading={isSaving}
                icon={<Save className="w-4 h-4" />}
              >
                Save
              </Button>

              <Button
                variant="primary"
                size="sm"
                onClick={publishQuiz}
                loading={isPublishing}
                disabled={quiz.questions.length === 0}
              >
                {quiz.isPublished ? 'Update' : 'Publish'}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                      : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <AnimatePresence mode="wait">
          {activeTab === 'builder' && (
            <motion.div
              key="builder"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="grid grid-cols-1 lg:grid-cols-3 gap-8"
            >
              {/* Quiz Info */}
              <div className="lg:col-span-3">
                <Card className="mb-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                      label="Quiz Title"
                      value={quiz.title}
                      onChange={(e) => setQuiz(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="Enter quiz title..."
                    />
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Quiz Type
                      </label>
                      <select
                        value={quiz.quizType}
                        onChange={(e) => setQuiz(prev => ({ ...prev, quizType: e.target.value as any }))}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                      >
                        <option value="PRACTICE">Practice Quiz</option>
                        <option value="GRADED">Graded Quiz</option>
                        <option value="SURVEY">Survey</option>
                        <option value="EXAM">Exam</option>
                      </select>
                    </div>
                  </div>
                  
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Description
                    </label>
                    <textarea
                      value={quiz.description}
                      onChange={(e) => setQuiz(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Enter quiz description..."
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                    />
                  </div>
                </Card>
              </div>

              {/* Question List */}
              <div className="lg:col-span-2">
                <QuestionList
                  questions={quiz.questions}
                  selectedQuestion={selectedQuestion}
                  onSelectQuestion={setSelectedQuestion}
                  onAddQuestion={addQuestion}
                  onDeleteQuestion={deleteQuestion}
                  onReorderQuestions={reorderQuestions}
                  onEditQuestion={() => setIsEditing(true)}
                />
              </div>

              {/* Question Editor */}
              <div className="lg:col-span-1">
                {selectedQuestion && (
                  <QuestionEditor
                    question={selectedQuestion}
                    isEditing={isEditing}
                    onSave={(question) => {
                      updateQuestion(question);
                      setIsEditing(false);
                    }}
                    onCancel={() => {
                      setIsEditing(false);
                      if (selectedQuestion.id.startsWith('temp-')) {
                        deleteQuestion(selectedQuestion.id);
                        setSelectedQuestion(null);
                      }
                    }}
                  />
                )}
              </div>
            </motion.div>
          )}

          {activeTab === 'settings' && (
            <motion.div
              key="settings"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <QuizSettings
                quiz={quiz}
                onUpdateQuiz={setQuiz}
              />
            </motion.div>
          )}

          {activeTab === 'preview' && (
            <motion.div
              key="preview"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <QuizPreview quiz={quiz} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default QuizBuilder;
