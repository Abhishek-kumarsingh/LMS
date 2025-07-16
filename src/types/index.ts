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

// Analytics and Reporting Types
export interface AnalyticsDashboard {
  courseId: string;
  course?: Course;
  overview: AnalyticsOverview;
  studentEngagement: StudentEngagementMetrics;
  contentPerformance: ContentPerformanceMetrics;
  assessmentAnalytics: AssessmentAnalyticsMetrics;
  forumActivity: ForumActivityMetrics;
  timeAnalytics: TimeAnalyticsMetrics;
  generatedAt: string;
}

export interface AnalyticsOverview {
  totalStudents: number;
  activeStudents: number;
  completionRate: number;
  averageGrade: number;
  totalContent: number;
  totalAssignments: number;
  totalQuizzes: number;
  totalForumPosts: number;
  engagementScore: number;
  retentionRate: number;
}

export interface StudentEngagementMetrics {
  dailyActiveUsers: TimeSeriesData[];
  weeklyActiveUsers: TimeSeriesData[];
  loginFrequency: DistributionData[];
  sessionDuration: DistributionData[];
  contentInteractions: TimeSeriesData[];
  participationRate: number;
  averageSessionTime: number;
  peakActivityHours: number[];
  deviceUsage: DeviceUsageData[];
  engagementTrends: EngagementTrendData[];
}

export interface ContentPerformanceMetrics {
  contentViews: ContentViewData[];
  completionRates: ContentCompletionData[];
  timeSpent: ContentTimeData[];
  popularContent: PopularContentData[];
  strugglingAreas: StruggleAreaData[];
  contentEffectiveness: ContentEffectivenessData[];
  videoAnalytics: VideoAnalyticsData[];
  downloadStats: DownloadStatsData[];
}

export interface AssessmentAnalyticsMetrics {
  gradeDistribution: GradeDistributionData[];
  averageScores: TimeSeriesData[];
  submissionPatterns: SubmissionPatternData[];
  questionAnalytics: QuestionAnalyticsData[];
  cheatingIndicators: CheatingIndicatorData[];
  improvementTrends: ImprovementTrendData[];
  difficultyAnalysis: DifficultyAnalysisData[];
  retakePatterns: RetakePatternData[];
}

export interface ForumActivityMetrics {
  postActivity: TimeSeriesData[];
  userParticipation: UserParticipationData[];
  topicPopularity: TopicPopularityData[];
  responseTime: ResponseTimeData[];
  sentimentAnalysis: SentimentAnalysisData[];
  moderationStats: ModerationStatsData[];
  knowledgeSharing: KnowledgeSharingData[];
}

export interface TimeAnalyticsMetrics {
  studyPatterns: StudyPatternData[];
  peakUsageHours: PeakUsageData[];
  seasonalTrends: SeasonalTrendData[];
  deadlineImpact: DeadlineImpactData[];
  procrastinationIndicators: ProcrastinationData[];
  optimalStudyTimes: OptimalStudyTimeData[];
}

// Data Structure Types
export interface TimeSeriesData {
  date: string;
  value: number;
  label?: string;
  metadata?: Record<string, any>;
}

export interface DistributionData {
  category: string;
  value: number;
  percentage: number;
  color?: string;
}

export interface DeviceUsageData {
  device: 'Desktop' | 'Mobile' | 'Tablet';
  sessions: number;
  percentage: number;
  averageTime: number;
}

export interface EngagementTrendData {
  studentId: string;
  student?: User;
  engagementScore: number;
  trend: 'increasing' | 'decreasing' | 'stable';
  lastActive: string;
  riskLevel: 'low' | 'medium' | 'high';
}

export interface ContentViewData {
  contentId: string;
  contentTitle: string;
  contentType: string;
  views: number;
  uniqueViews: number;
  averageTime: number;
  completionRate: number;
}

export interface ContentCompletionData {
  contentId: string;
  contentTitle: string;
  totalStudents: number;
  completedStudents: number;
  completionRate: number;
  averageCompletionTime: number;
}

export interface PopularContentData {
  contentId: string;
  title: string;
  type: string;
  score: number;
  views: number;
  engagement: number;
}

export interface GradeDistributionData {
  grade: string;
  count: number;
  percentage: number;
  cumulative: number;
}

export interface SubmissionPatternData {
  timeToDeadline: string;
  submissions: number;
  percentage: number;
  averageGrade: number;
}

export interface QuestionAnalyticsData {
  questionId: string;
  questionText: string;
  correctRate: number;
  averageTime: number;
  difficulty: 'easy' | 'medium' | 'hard';
  discrimination: number;
}

export interface UserParticipationData {
  userId: string;
  user?: User;
  posts: number;
  replies: number;
  votes: number;
  participationScore: number;
}

// Calendar and Event Types
export interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  eventType: EventType;
  courseId?: string;
  course?: Course;
  assignmentId?: string;
  assignment?: Assignment;
  quizId?: string;
  quiz?: Quiz;
  createdBy: string;
  creator?: User;
  startTime: string;
  endTime?: string;
  isAllDay: boolean;
  location?: string;
  meetingUrl?: string;
  attendees: string[]; // Array of user IDs
  attendeeUsers?: User[];
  reminderMinutes: number;
  isRecurring: boolean;
  recurrencePattern?: RecurrencePattern;
  isCancelled: boolean;
  color?: string;
  priority: EventPriority;
  visibility: EventVisibility;
  attachments: string[]; // Array of file URLs
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export type EventType =
  | 'ASSIGNMENT'
  | 'QUIZ'
  | 'LESSON'
  | 'LECTURE'
  | 'MEETING'
  | 'OFFICE_HOURS'
  | 'EXAM'
  | 'DEADLINE'
  | 'HOLIDAY'
  | 'PERSONAL'
  | 'STUDY_SESSION'
  | 'GROUP_WORK';

export type EventPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
export type EventVisibility = 'PUBLIC' | 'COURSE' | 'PRIVATE';

export interface RecurrencePattern {
  frequency: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY';
  interval: number; // Every N days/weeks/months/years
  daysOfWeek?: number[]; // 0-6 (Sunday-Saturday)
  dayOfMonth?: number; // 1-31
  weekOfMonth?: number; // 1-4
  monthOfYear?: number; // 1-12
  endDate?: string;
  occurrences?: number;
}

export interface CalendarView {
  id: string;
  name: string;
  userId: string;
  viewType: CalendarViewType;
  filters: CalendarFilters;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

export type CalendarViewType = 'MONTH' | 'WEEK' | 'DAY' | 'AGENDA' | 'YEAR';

export interface CalendarFilters {
  eventTypes: EventType[];
  courseIds: string[];
  priorities: EventPriority[];
  showCompleted: boolean;
  showCancelled: boolean;
  dateRange?: {
    start: string;
    end: string;
  };
}

export interface EventReminder {
  id: string;
  eventId: string;
  userId: string;
  reminderTime: string;
  reminderType: ReminderType;
  isDelivered: boolean;
  deliveredAt?: string;
  createdAt: string;
}

export type ReminderType = 'EMAIL' | 'PUSH' | 'SMS' | 'IN_APP';

export interface CalendarIntegration {
  id: string;
  userId: string;
  provider: CalendarProvider;
  externalCalendarId: string;
  accessToken: string;
  refreshToken?: string;
  syncEnabled: boolean;
  lastSyncAt?: string;
  syncDirection: SyncDirection;
  createdAt: string;
  updatedAt: string;
}

export type CalendarProvider = 'GOOGLE' | 'OUTLOOK' | 'APPLE' | 'ICAL';
export type SyncDirection = 'IMPORT' | 'EXPORT' | 'BIDIRECTIONAL';

export interface EventConflict {
  id: string;
  userId: string;
  event1Id: string;
  event2Id: string;
  conflictType: ConflictType;
  severity: ConflictSeverity;
  isResolved: boolean;
  resolvedAt?: string;
  resolution?: string;
  createdAt: string;
}

export type ConflictType = 'TIME_OVERLAP' | 'LOCATION_CONFLICT' | 'RESOURCE_CONFLICT';
export type ConflictSeverity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface StudySchedule {
  id: string;
  userId: string;
  courseId?: string;
  title: string;
  description?: string;
  studyGoals: StudyGoal[];
  schedule: StudySession[];
  isActive: boolean;
  startDate: string;
  endDate: string;
  createdAt: string;
  updatedAt: string;
}

export interface StudyGoal {
  id: string;
  title: string;
  description?: string;
  targetHours: number;
  completedHours: number;
  deadline?: string;
  priority: EventPriority;
  isCompleted: boolean;
}

export interface StudySession {
  id: string;
  scheduleId: string;
  title: string;
  startTime: string;
  endTime: string;
  courseId?: string;
  topicIds: string[];
  isCompleted: boolean;
  actualStartTime?: string;
  actualEndTime?: string;
  notes?: string;
  effectiveness?: number; // 1-5 rating
}

// Content Authoring Types
export interface ContentTemplate {
  id: string;
  name: string;
  description: string;
  category: TemplateCategory;
  thumbnail: string;
  structure: ContentBlock[];
  metadata: TemplateMetadata;
  isPublic: boolean;
  createdBy: string;
  creator?: User;
  usageCount: number;
  rating: number;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export type TemplateCategory =
  | 'LESSON'
  | 'ASSIGNMENT'
  | 'QUIZ'
  | 'PRESENTATION'
  | 'INTERACTIVE'
  | 'ASSESSMENT'
  | 'MULTIMEDIA'
  | 'DOCUMENT';

export interface TemplateMetadata {
  estimatedDuration: number; // minutes
  difficulty: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
  learningObjectives: string[];
  prerequisites: string[];
  targetAudience: string[];
  language: string;
  accessibility: AccessibilityFeatures;
}

export interface AccessibilityFeatures {
  hasAltText: boolean;
  hasClosedCaptions: boolean;
  hasTranscripts: boolean;
  hasKeyboardNavigation: boolean;
  hasScreenReaderSupport: boolean;
  colorContrastCompliant: boolean;
}

export interface ContentBlock {
  id: string;
  type: BlockType;
  position: number;
  content: BlockContent;
  settings: BlockSettings;
  interactions: BlockInteraction[];
  analytics: BlockAnalytics;
  createdAt: string;
  updatedAt: string;
}

export type BlockType =
  | 'TEXT'
  | 'IMAGE'
  | 'VIDEO'
  | 'AUDIO'
  | 'QUIZ'
  | 'INTERACTIVE'
  | 'CODE'
  | 'MATH'
  | 'EMBED'
  | 'FILE'
  | 'DIVIDER'
  | 'CALLOUT'
  | 'TABS'
  | 'ACCORDION'
  | 'TIMELINE'
  | 'CHART'
  | 'MAP'
  | 'FORM';

export interface BlockContent {
  // Text content
  text?: RichTextContent;

  // Media content
  mediaUrl?: string;
  mediaType?: 'IMAGE' | 'VIDEO' | 'AUDIO' | 'DOCUMENT';
  mediaThumbnail?: string;
  mediaMetadata?: MediaMetadata;

  // Interactive content
  quizData?: QuizBlockData;
  interactiveData?: InteractiveBlockData;
  codeData?: CodeBlockData;
  mathData?: MathBlockData;
  embedData?: EmbedBlockData;

  // Layout content
  tabsData?: TabsBlockData;
  accordionData?: AccordionBlockData;
  timelineData?: TimelineBlockData;
  chartData?: ChartBlockData;

  // Form content
  formData?: FormBlockData;
}

export interface RichTextContent {
  html: string;
  markdown?: string;
  plainText: string;
  wordCount: number;
  readingTime: number; // minutes
  links: LinkData[];
  mentions: MentionData[];
}

export interface LinkData {
  url: string;
  text: string;
  isExternal: boolean;
  position: number;
}

export interface MentionData {
  userId: string;
  username: string;
  displayName: string;
  position: number;
}

export interface MediaMetadata {
  filename: string;
  fileSize: number;
  mimeType: string;
  duration?: number; // for video/audio
  dimensions?: { width: number; height: number };
  altText?: string;
  caption?: string;
  transcript?: string;
  chapters?: MediaChapter[];
  quality?: MediaQuality[];
}

export interface MediaChapter {
  id: string;
  title: string;
  startTime: number;
  endTime: number;
  description?: string;
  thumbnail?: string;
}

export interface MediaQuality {
  resolution: string;
  bitrate: number;
  fileSize: number;
  url: string;
}

export interface QuizBlockData {
  questions: QuizQuestion[];
  settings: QuizSettings;
  results?: QuizResults;
}

export interface QuizQuestion {
  id: string;
  type: QuestionType;
  question: string;
  options?: QuestionOption[];
  correctAnswer: string | string[];
  explanation?: string;
  points: number;
  timeLimit?: number;
  hints?: string[];
  media?: MediaMetadata;
}

export interface QuestionOption {
  id: string;
  text: string;
  isCorrect: boolean;
  feedback?: string;
  media?: MediaMetadata;
}

export interface QuizSettings {
  allowMultipleAttempts: boolean;
  maxAttempts?: number;
  timeLimit?: number;
  showCorrectAnswers: boolean;
  showExplanations: boolean;
  randomizeQuestions: boolean;
  randomizeOptions: boolean;
  passingScore?: number;
}

export interface QuizResults {
  totalQuestions: number;
  correctAnswers: number;
  score: number;
  timeSpent: number;
  attempts: number;
  completedAt: string;
}

export interface InteractiveBlockData {
  type: InteractiveType;
  config: InteractiveConfig;
  assets: InteractiveAsset[];
}

export type InteractiveType =
  | 'DRAG_DROP'
  | 'HOTSPOT'
  | 'SIMULATION'
  | 'GAME'
  | 'VIRTUAL_LAB'
  | 'AR_VR'
  | 'INTERACTIVE_VIDEO'
  | 'BRANCHING_SCENARIO';

export interface InteractiveConfig {
  width: number;
  height: number;
  backgroundColor?: string;
  instructions?: string;
  feedback?: InteractiveFeedback;
  scoring?: InteractiveScoring;
  accessibility?: AccessibilityFeatures;
}

export interface InteractiveFeedback {
  correct: string;
  incorrect: string;
  partial?: string;
  hint?: string;
}

export interface InteractiveScoring {
  maxPoints: number;
  passingScore: number;
  attempts: number;
  timeBonus?: boolean;
}

export interface InteractiveAsset {
  id: string;
  type: 'IMAGE' | 'AUDIO' | 'VIDEO' | 'MODEL_3D';
  url: string;
  metadata: MediaMetadata;
  position?: { x: number; y: number; z?: number };
  properties?: Record<string, any>;
}