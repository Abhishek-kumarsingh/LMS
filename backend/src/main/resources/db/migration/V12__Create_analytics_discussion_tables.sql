-- Analytics and Discussion Forum Tables
-- V12__Create_analytics_discussion_tables.sql

-- Learning analytics for tracking student engagement
CREATE TABLE learning_analytics (
    id VARCHAR(255) PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    course_id VARCHAR(255) NOT NULL,
    lesson_id VARCHAR(255),
    activity_type VARCHAR(50) NOT NULL,
    activity_data TEXT, -- JSON object with activity details
    session_id VARCHAR(255),
    time_spent_seconds INTEGER DEFAULT 0,
    completion_percentage DECIMAL(5,2) DEFAULT 0.0,
    interaction_count INTEGER DEFAULT 0,
    device_type VARCHAR(50),
    browser_info VARCHAR(200),
    ip_address VARCHAR(45),
    location_data VARCHAR(200),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
    FOREIGN KEY (lesson_id) REFERENCES lessons(id) ON DELETE CASCADE,
    
    INDEX idx_analytics_user (user_id),
    INDEX idx_analytics_course (course_id),
    INDEX idx_analytics_lesson (lesson_id),
    INDEX idx_analytics_activity_type (activity_type),
    INDEX idx_analytics_session (session_id),
    INDEX idx_analytics_created_at (created_at)
);

-- Course performance metrics
CREATE TABLE course_performance_metrics (
    id VARCHAR(255) PRIMARY KEY,
    course_id VARCHAR(255) NOT NULL,
    metric_date DATE NOT NULL,
    total_enrollments INTEGER DEFAULT 0,
    active_students INTEGER DEFAULT 0,
    completion_rate DECIMAL(5,2) DEFAULT 0.0,
    average_progress DECIMAL(5,2) DEFAULT 0.0,
    average_time_spent INTEGER DEFAULT 0,
    total_revenue DECIMAL(10,2) DEFAULT 0.0,
    student_satisfaction DECIMAL(3,2) DEFAULT 0.0,
    dropout_rate DECIMAL(5,2) DEFAULT 0.0,
    engagement_score DECIMAL(5,2) DEFAULT 0.0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
    
    UNIQUE KEY unique_course_date (course_id, metric_date),
    INDEX idx_performance_course (course_id),
    INDEX idx_performance_date (metric_date)
);

-- User learning progress tracking
CREATE TABLE user_learning_progress (
    id VARCHAR(255) PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    course_id VARCHAR(255) NOT NULL,
    lesson_id VARCHAR(255) NOT NULL,
    progress_percentage DECIMAL(5,2) DEFAULT 0.0,
    time_spent_seconds INTEGER DEFAULT 0,
    last_accessed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_completed BOOLEAN NOT NULL DEFAULT FALSE,
    completed_at TIMESTAMP,
    notes TEXT,
    bookmarks TEXT, -- JSON array of bookmarked timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
    FOREIGN KEY (lesson_id) REFERENCES lessons(id) ON DELETE CASCADE,
    
    UNIQUE KEY unique_user_lesson_progress (user_id, lesson_id),
    INDEX idx_progress_user (user_id),
    INDEX idx_progress_course (course_id),
    INDEX idx_progress_lesson (lesson_id),
    INDEX idx_progress_completed (is_completed)
);

-- Discussion forums for courses
CREATE TABLE discussion_forums (
    id VARCHAR(255) PRIMARY KEY,
    course_id VARCHAR(255) NOT NULL,
    title VARCHAR(500) NOT NULL,
    description TEXT,
    forum_type VARCHAR(50) NOT NULL DEFAULT 'GENERAL',
    is_pinned BOOLEAN NOT NULL DEFAULT FALSE,
    is_locked BOOLEAN NOT NULL DEFAULT FALSE,
    is_moderated BOOLEAN NOT NULL DEFAULT TRUE,
    created_by VARCHAR(255) NOT NULL,
    moderators TEXT, -- JSON array of moderator user IDs
    post_count INTEGER DEFAULT 0,
    last_post_at TIMESTAMP,
    last_post_by VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE,
    
    INDEX idx_forum_course (course_id),
    INDEX idx_forum_creator (created_by),
    INDEX idx_forum_type (forum_type),
    INDEX idx_forum_pinned (is_pinned),
    INDEX idx_forum_last_post (last_post_at)
);

-- Discussion posts within forums
CREATE TABLE discussion_posts (
    id VARCHAR(255) PRIMARY KEY,
    forum_id VARCHAR(255) NOT NULL,
    parent_post_id VARCHAR(255), -- For threaded discussions
    author_id VARCHAR(255) NOT NULL,
    title VARCHAR(500),
    content TEXT NOT NULL,
    post_type VARCHAR(50) NOT NULL DEFAULT 'DISCUSSION',
    is_pinned BOOLEAN NOT NULL DEFAULT FALSE,
    is_locked BOOLEAN NOT NULL DEFAULT FALSE,
    is_approved BOOLEAN NOT NULL DEFAULT TRUE,
    is_anonymous BOOLEAN NOT NULL DEFAULT FALSE,
    upvotes INTEGER DEFAULT 0,
    downvotes INTEGER DEFAULT 0,
    reply_count INTEGER DEFAULT 0,
    view_count INTEGER DEFAULT 0,
    last_reply_at TIMESTAMP,
    last_reply_by VARCHAR(255),
    attachments TEXT, -- JSON array of file attachments
    tags TEXT, -- JSON array of tags
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (forum_id) REFERENCES discussion_forums(id) ON DELETE CASCADE,
    FOREIGN KEY (parent_post_id) REFERENCES discussion_posts(id) ON DELETE CASCADE,
    FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE CASCADE,
    
    INDEX idx_post_forum (forum_id),
    INDEX idx_post_parent (parent_post_id),
    INDEX idx_post_author (author_id),
    INDEX idx_post_type (post_type),
    INDEX idx_post_created_at (created_at),
    INDEX idx_post_last_reply (last_reply_at)
);

-- Post votes for rating system
CREATE TABLE discussion_post_votes (
    id VARCHAR(255) PRIMARY KEY,
    post_id VARCHAR(255) NOT NULL,
    user_id VARCHAR(255) NOT NULL,
    vote_type VARCHAR(10) NOT NULL, -- 'UPVOTE' or 'DOWNVOTE'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (post_id) REFERENCES discussion_posts(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    
    UNIQUE KEY unique_user_post_vote (post_id, user_id),
    INDEX idx_vote_post (post_id),
    INDEX idx_vote_user (user_id),
    INDEX idx_vote_type (vote_type)
);

-- Calendar events for scheduling
CREATE TABLE calendar_events (
    id VARCHAR(255) PRIMARY KEY,
    title VARCHAR(500) NOT NULL,
    description TEXT,
    event_type VARCHAR(50) NOT NULL DEFAULT 'ASSIGNMENT',
    course_id VARCHAR(255),
    assignment_id VARCHAR(255),
    quiz_id VARCHAR(255),
    created_by VARCHAR(255) NOT NULL,
    start_time TIMESTAMP NOT NULL,
    end_time TIMESTAMP,
    is_all_day BOOLEAN NOT NULL DEFAULT FALSE,
    location VARCHAR(500),
    meeting_url VARCHAR(1000),
    attendees TEXT, -- JSON array of user IDs
    reminder_minutes INTEGER DEFAULT 15,
    is_recurring BOOLEAN NOT NULL DEFAULT FALSE,
    recurrence_pattern TEXT, -- JSON object for recurrence rules
    is_cancelled BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
    FOREIGN KEY (assignment_id) REFERENCES assignments(id) ON DELETE CASCADE,
    FOREIGN KEY (quiz_id) REFERENCES quizzes(id) ON DELETE CASCADE,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE,
    
    INDEX idx_event_course (course_id),
    INDEX idx_event_assignment (assignment_id),
    INDEX idx_event_quiz (quiz_id),
    INDEX idx_event_creator (created_by),
    INDEX idx_event_start_time (start_time),
    INDEX idx_event_type (event_type)
);

-- Add check constraints
ALTER TABLE learning_analytics ADD CONSTRAINT chk_analytics_activity_type
    CHECK (activity_type IN ('VIDEO_WATCH', 'LESSON_COMPLETE', 'QUIZ_ATTEMPT', 'ASSIGNMENT_SUBMIT', 'FORUM_POST', 'LOGIN', 'LOGOUT', 'DOWNLOAD', 'SEARCH'));

ALTER TABLE discussion_forums ADD CONSTRAINT chk_forum_type
    CHECK (forum_type IN ('GENERAL', 'Q_AND_A', 'ANNOUNCEMENTS', 'ASSIGNMENTS', 'STUDY_GROUP', 'TECHNICAL_SUPPORT'));

ALTER TABLE discussion_posts ADD CONSTRAINT chk_post_type
    CHECK (post_type IN ('DISCUSSION', 'QUESTION', 'ANNOUNCEMENT', 'ANSWER', 'COMMENT'));

ALTER TABLE discussion_post_votes ADD CONSTRAINT chk_vote_type
    CHECK (vote_type IN ('UPVOTE', 'DOWNVOTE'));

ALTER TABLE calendar_events ADD CONSTRAINT chk_event_type
    CHECK (event_type IN ('ASSIGNMENT', 'QUIZ', 'LESSON', 'LIVE_SESSION', 'OFFICE_HOURS', 'EXAM', 'DEADLINE', 'MEETING', 'HOLIDAY'));

-- Add comments for documentation
COMMENT ON TABLE learning_analytics IS 'Tracks detailed user interactions and learning behavior for analytics';
COMMENT ON TABLE course_performance_metrics IS 'Aggregated daily metrics for course performance and engagement';
COMMENT ON TABLE user_learning_progress IS 'Individual user progress tracking for lessons and courses';
COMMENT ON TABLE discussion_forums IS 'Course discussion forums with moderation and organization features';
COMMENT ON TABLE discussion_posts IS 'Threaded discussion posts within forums with voting and replies';
COMMENT ON TABLE discussion_post_votes IS 'User votes on discussion posts for community-driven quality rating';
COMMENT ON TABLE calendar_events IS 'Calendar system for scheduling assignments, quizzes, and course events';
