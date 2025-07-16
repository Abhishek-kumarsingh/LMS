export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'STUDENT' | 'INSTRUCTOR' | 'ADMIN';
  avatar?: string;
  isApproved: boolean;
  createdAt: string;
}

export interface Course {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  price: number;
  category: string;
  level: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
  duration: number; // in minutes
  rating: number;
  totalRatings: number;
  enrolledCount: number;
  instructor: User;
  lessons: Lesson[];
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Lesson {
  id: string;
  title: string;
  description: string;
  videoUrl: string;
  duration: number; // in minutes
  order: number;
  courseId: string;
  isPreview: boolean;
}

export interface Enrollment {
  id: string;
  userId: string;
  courseId: string;
  progress: number; // 0-100
  completedLessons: string[];
  enrolledAt: string;
  completedAt?: string;
}

export interface Comment {
  id: string;
  content: string;
  rating?: number;
  userId: string;
  user: User;
  courseId: string;
  parentId?: string;
  replies: Comment[];
  createdAt: string;
  updatedAt: string;
}

export interface Wishlist {
  id: string;
  userId: string;
  courseId: string;
  course: Course;
  addedAt: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

// Quiz and Assessment Types
export interface Quiz {
  id: string;
  title: string;
  description?: string;
  instructions?: string;
  courseId: string;
  course?: Course;
  createdBy: string;
  creator?: User;
  timeLimitMinutes?: number;
  maxAttempts: number;
  passingScore?: number;
  totalPoints: number;
  isPublished: boolean;
  isRandomized: boolean;
  showResultsImmediately: boolean;
  showCorrectAnswers: boolean;
  allowReview: boolean;
  availableFrom?: string;
  availableUntil?: string;
  quizType: 'PRACTICE' | 'GRADED' | 'SURVEY' | 'EXAM';
  gradingMethod: 'HIGHEST_SCORE' | 'LATEST_SCORE' | 'AVERAGE_SCORE' | 'FIRST_SCORE';
  questions: Question[];
  attempts: QuizAttempt[];
  createdAt: string;
  updatedAt: string;
}

export interface Question {
  id: string;
  quizId: string;
  questionText: string;
  questionHtml?: string;
  questionType: QuestionType;
  points: number;
  orderIndex: number;
  explanation?: string;
  isRequired: boolean;
  timeLimit?: number;
  options: QuestionOption[];
  correctAnswers: string[];
  metadata?: string; // JSON for additional question data
  createdAt: string;
  updatedAt: string;
}

export type QuestionType =
  | 'MULTIPLE_CHOICE'
  | 'MULTIPLE_SELECT'
  | 'TRUE_FALSE'
  | 'SHORT_ANSWER'
  | 'ESSAY'
  | 'FILL_IN_BLANK'
  | 'MATCHING'
  | 'ORDERING'
  | 'NUMERICAL'
  | 'FILE_UPLOAD'
  | 'DRAG_AND_DROP'
  | 'HOTSPOT';

export interface QuestionOption {
  id: string;
  questionId: string;
  optionText: string;
  optionHtml?: string;
  isCorrect: boolean;
  orderIndex: number;
  explanation?: string;
  createdAt: string;
  updatedAt: string;
}

export interface QuizAttempt {
  id: string;
  quizId: string;
  quiz?: Quiz;
  studentId: string;
  student?: User;
  attemptNumber: number;
  status: 'IN_PROGRESS' | 'SUBMITTED' | 'COMPLETED' | 'ABANDONED' | 'EXPIRED' | 'FLAGGED';
  score?: number;
  percentageScore?: number;
  totalPoints?: number;
  earnedPoints?: number;
  timeSpentMinutes?: number;
  startedAt?: string;
  submittedAt?: string;
  gradedAt?: string;
  gradedBy?: string;
  feedback?: string;
  ipAddress?: string;
  userAgent?: string;
  isLateSubmission: boolean;
  answers: QuestionAnswer[];
  createdAt: string;
  updatedAt: string;
}

export interface QuestionAnswer {
  id: string;
  attemptId: string;
  questionId: string;
  question?: Question;
  answerText?: string;
  answerHtml?: string;
  selectedOptions: string[];
  isCorrect?: boolean;
  isGraded: boolean;
  graderFeedback?: string;
  gradedBy?: string;
  gradedAt?: string;
  timeSpentSeconds?: number;
  answerOrder?: string;
  matchingPairs?: string; // JSON for matching questions
  numericalAnswer?: number;
  fileUploadUrl?: string;
  createdAt: string;
  updatedAt: string;
}

// Discussion Forum Types
export interface DiscussionForum {
  id: string;
  courseId: string;
  course?: Course;
  title: string;
  description?: string;
  forumType: ForumType;
  isPinned: boolean;
  isLocked: boolean;
  isModerated: boolean;
  createdBy: string;
  creator?: User;
  moderators: string[]; // Array of user IDs
  postCount: number;
  lastPostAt?: string;
  lastPostBy?: string;
  lastPostAuthor?: User;
  posts: DiscussionPost[];
  createdAt: string;
  updatedAt: string;
}

export type ForumType =
  | 'GENERAL'
  | 'Q_AND_A'
  | 'ANNOUNCEMENTS'
  | 'ASSIGNMENTS'
  | 'STUDY_GROUP'
  | 'TECHNICAL_SUPPORT';

export interface DiscussionPost {
  id: string;
  forumId: string;
  forum?: DiscussionForum;
  parentPostId?: string;
  parentPost?: DiscussionPost;
  authorId: string;
  author?: User;
  title?: string;
  content: string;
  postType: PostType;
  isPinned: boolean;
  isLocked: boolean;
  isApproved: boolean;
  isAnonymous: boolean;
  upvotes: number;
  downvotes: number;
  replyCount: number;
  viewCount: number;
  lastReplyAt?: string;
  lastReplyBy?: string;
  lastReplyAuthor?: User;
  attachments: string[]; // Array of file URLs
  tags: string[]; // Array of tags
  replies: DiscussionPost[];
  votes: DiscussionPostVote[];
  userVote?: DiscussionPostVote;
  createdAt: string;
  updatedAt: string;
}

export type PostType =
  | 'DISCUSSION'
  | 'QUESTION'
  | 'ANNOUNCEMENT'
  | 'ANSWER'
  | 'COMMENT';

export interface DiscussionPostVote {
  id: string;
  postId: string;
  userId: string;
  user?: User;
  voteType: 'UPVOTE' | 'DOWNVOTE';
  createdAt: string;
}