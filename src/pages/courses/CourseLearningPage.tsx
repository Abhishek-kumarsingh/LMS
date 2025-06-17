import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  Circle,
  Play,
  FileText,
  HelpCircle,
  BookOpen,
  Clock,
  Award,
  Menu,
  X
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import VideoPlayer from '../../components/course/VideoPlayer';
import ProgressTracker from '../../components/course/ProgressTracker';

interface Lesson {
  id: string;
  title: string;
  type: 'video' | 'text' | 'quiz';
  duration: number;
  content?: string;
  videoUrl?: string;
  completed: boolean;
  locked: boolean;
}

interface Section {
  id: string;
  title: string;
  lessons: Lesson[];
  completed: boolean;
}

const CourseLearningPage: React.FC = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [course, setCourse] = useState<any>(null);
  const [sections, setSections] = useState<Section[]>([]);
  const [currentLesson, setCurrentLesson] = useState<Lesson | null>(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [lessonProgress, setLessonProgress] = useState<Record<string, number>>({});

  // Mock data
  const mockSections: Section[] = [
    {
      id: '1',
      title: 'Getting Started',
      completed: true,
      lessons: [
        {
          id: '1',
          title: 'Course Introduction',
          type: 'video',
          duration: 5,
          videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
          completed: true,
          locked: false
        },
        {
          id: '2',
          title: 'Setting Up Your Environment',
          type: 'video',
          duration: 15,
          videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
          completed: true,
          locked: false
        },
        {
          id: '3',
          title: 'Course Resources',
          type: 'text',
          duration: 3,
          content: `
            <h2>Welcome to the Course!</h2>
            <p>In this course, you'll learn the fundamentals of React development. Here are some important resources:</p>
            <ul>
              <li><a href="#">Official React Documentation</a></li>
              <li><a href="#">Course GitHub Repository</a></li>
              <li><a href="#">Community Discord Server</a></li>
            </ul>
            <p>Make sure to bookmark these resources as you'll be referring to them throughout the course.</p>
          `,
          completed: false,
          locked: false
        }
      ]
    },
    {
      id: '2',
      title: 'React Fundamentals',
      completed: false,
      lessons: [
        {
          id: '4',
          title: 'What is React?',
          type: 'video',
          duration: 12,
          videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
          completed: false,
          locked: false
        },
        {
          id: '5',
          title: 'JSX Syntax',
          type: 'video',
          duration: 18,
          videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
          completed: false,
          locked: false
        },
        {
          id: '6',
          title: 'Knowledge Check',
          type: 'quiz',
          duration: 10,
          completed: false,
          locked: true
        }
      ]
    }
  ];

  useEffect(() => {
    const fetchCourseData = async () => {
      setLoading(true);
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Mock course data
        setCourse({
          id: courseId,
          title: 'Complete React Development Bootcamp',
          instructor: 'John Smith'
        });
        
        setSections(mockSections);
        
        // Set first incomplete lesson as current
        const firstIncompleteLesson = mockSections
          .flatMap(section => section.lessons)
          .find(lesson => !lesson.completed && !lesson.locked);
        
        if (firstIncompleteLesson) {
          setCurrentLesson(firstIncompleteLesson);
        } else {
          setCurrentLesson(mockSections[0].lessons[0]);
        }
      } catch (error) {
        console.error('Failed to fetch course data:', error);
        navigate('/courses');
      } finally {
        setLoading(false);
      }
    };

    if (courseId) {
      fetchCourseData();
    }
  }, [courseId, navigate]);

  const handleLessonComplete = (lessonId: string) => {
    setSections(prev => 
      prev.map(section => ({
        ...section,
        lessons: section.lessons.map(lesson => 
          lesson.id === lessonId 
            ? { ...lesson, completed: true }
            : lesson
        )
      }))
    );

    // Unlock next lesson
    const allLessons = sections.flatMap(section => section.lessons);
    const currentIndex = allLessons.findIndex(lesson => lesson.id === lessonId);
    if (currentIndex < allLessons.length - 1) {
      setSections(prev => 
        prev.map(section => ({
          ...section,
          lessons: section.lessons.map(lesson => 
            lesson.id === allLessons[currentIndex + 1].id
              ? { ...lesson, locked: false }
              : lesson
          )
        }))
      );
    }
  };

  const handleVideoProgress = (progress: number) => {
    if (currentLesson) {
      setLessonProgress(prev => ({
        ...prev,
        [currentLesson.id]: progress
      }));

      // Mark as complete when 90% watched
      if (progress >= 90 && !currentLesson.completed) {
        handleLessonComplete(currentLesson.id);
      }
    }
  };

  const navigateToLesson = (lesson: Lesson) => {
    if (!lesson.locked) {
      setCurrentLesson(lesson);
    }
  };

  const getNextLesson = () => {
    const allLessons = sections.flatMap(section => section.lessons);
    const currentIndex = allLessons.findIndex(lesson => lesson.id === currentLesson?.id);
    return currentIndex < allLessons.length - 1 ? allLessons[currentIndex + 1] : null;
  };

  const getPreviousLesson = () => {
    const allLessons = sections.flatMap(section => section.lessons);
    const currentIndex = allLessons.findIndex(lesson => lesson.id === currentLesson?.id);
    return currentIndex > 0 ? allLessons[currentIndex - 1] : null;
  };

  const renderLessonContent = () => {
    if (!currentLesson) return null;

    switch (currentLesson.type) {
      case 'video':
        return (
          <VideoPlayer
            src={currentLesson.videoUrl || ''}
            title={currentLesson.title}
            onProgress={handleVideoProgress}
            onComplete={() => handleLessonComplete(currentLesson.id)}
            autoPlay={false}
          />
        );
      
      case 'text':
        return (
          <Card className="p-8">
            <div 
              className="prose dark:prose-invert max-w-none"
              dangerouslySetInnerHTML={{ __html: currentLesson.content || '' }}
            />
            <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
              <Button
                variant="primary"
                onClick={() => handleLessonComplete(currentLesson.id)}
                disabled={currentLesson.completed}
              >
                {currentLesson.completed ? 'Completed' : 'Mark as Complete'}
              </Button>
            </div>
          </Card>
        );
      
      case 'quiz':
        return (
          <Card className="p-8 text-center">
            <HelpCircle className="w-16 h-16 text-primary-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Quiz: {currentLesson.title}
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Test your knowledge with this interactive quiz
            </p>
            <Button variant="primary">
              Start Quiz
            </Button>
          </Card>
        );
      
      default:
        return null;
    }
  };

  const getLessonIcon = (lesson: Lesson) => {
    if (lesson.locked) {
      return <Circle className="w-4 h-4 text-gray-400" />;
    }
    
    if (lesson.completed) {
      return <CheckCircle className="w-4 h-4 text-green-500" />;
    }
    
    switch (lesson.type) {
      case 'video':
        return <Play className="w-4 h-4 text-primary-500" />;
      case 'text':
        return <FileText className="w-4 h-4 text-blue-500" />;
      case 'quiz':
        return <HelpCircle className="w-4 h-4 text-purple-500" />;
      default:
        return <Circle className="w-4 h-4 text-gray-500" />;
    }
  };

  const overallProgress = sections.length > 0 
    ? (sections.flatMap(s => s.lessons).filter(l => l.completed).length / sections.flatMap(s => s.lessons).length) * 100
    : 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'w-80' : 'w-0'} transition-all duration-300 overflow-hidden bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700`}>
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-900 dark:text-white">
              Course Content
            </h2>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          {/* Progress */}
          <div className="mb-4">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-gray-600 dark:text-gray-400">Progress</span>
              <span className="font-medium text-gray-900 dark:text-white">
                {Math.round(overallProgress)}%
              </span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div
                className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${overallProgress}%` }}
              />
            </div>
          </div>
        </div>

        {/* Lesson List */}
        <div className="overflow-y-auto h-full pb-20">
          {sections.map((section) => (
            <div key={section.id} className="border-b border-gray-200 dark:border-gray-700">
              <div className="p-4 bg-gray-50 dark:bg-gray-800/50">
                <h3 className="font-medium text-gray-900 dark:text-white">
                  {section.title}
                </h3>
              </div>
              <div className="p-2">
                {section.lessons.map((lesson) => (
                  <button
                    key={lesson.id}
                    onClick={() => navigateToLesson(lesson)}
                    disabled={lesson.locked}
                    className={`w-full flex items-center space-x-3 p-3 rounded-lg text-left transition-colors ${
                      currentLesson?.id === lesson.id
                        ? 'bg-primary-100 dark:bg-primary-900/20 text-primary-700 dark:text-primary-400'
                        : lesson.locked
                        ? 'text-gray-400 dark:text-gray-500 cursor-not-allowed'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                  >
                    {getLessonIcon(lesson)}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{lesson.title}</p>
                      <div className="flex items-center space-x-2 text-xs">
                        <Clock className="w-3 h-3" />
                        <span>{lesson.duration} min</span>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {!sidebarOpen && (
                <button
                  onClick={() => setSidebarOpen(true)}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  <Menu className="w-5 h-5" />
                </button>
              )}
              <div>
                <h1 className="font-semibold text-gray-900 dark:text-white">
                  {currentLesson?.title}
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {course?.title}
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  const prev = getPreviousLesson();
                  if (prev) navigateToLesson(prev);
                }}
                disabled={!getPreviousLesson()}
              >
                <ChevronLeft className="w-4 h-4 mr-1" />
                Previous
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  const next = getNextLesson();
                  if (next) navigateToLesson(next);
                }}
                disabled={!getNextLesson()}
              >
                Next
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </div>
        </div>

        {/* Lesson Content */}
        <div className="flex-1 p-6 overflow-y-auto">
          {renderLessonContent()}
        </div>
      </div>
    </div>
  );
};

export default CourseLearningPage;
