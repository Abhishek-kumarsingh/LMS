-- Assignment and Gradebook System Tables
-- V11__Create_assignment_gradebook_tables.sql

-- Assignments table
CREATE TABLE assignments (
    id VARCHAR(255) PRIMARY KEY,
    title VARCHAR(500) NOT NULL,
    description TEXT,
    instructions TEXT,
    course_id VARCHAR(255) NOT NULL,
    lesson_id VARCHAR(255),
    created_by VARCHAR(255) NOT NULL,
    assignment_type VARCHAR(50) NOT NULL DEFAULT 'ESSAY',
    max_points DECIMAL(8,2) NOT NULL DEFAULT 100.0,
    due_date TIMESTAMP,
    available_from TIMESTAMP,
    available_until TIMESTAMP,
    allow_late_submission BOOLEAN NOT NULL DEFAULT FALSE,
    late_penalty_percentage DECIMAL(5,2) DEFAULT 0.0,
    max_attempts INTEGER DEFAULT 1,
    time_limit_minutes INTEGER,
    submission_format VARCHAR(50) NOT NULL DEFAULT 'TEXT',
    required_files TEXT, -- JSON array of required file types
    max_file_size_mb INTEGER DEFAULT 10,
    auto_grade BOOLEAN NOT NULL DEFAULT FALSE,
    rubric_id VARCHAR(255),
    is_published BOOLEAN NOT NULL DEFAULT FALSE,
    is_group_assignment BOOLEAN NOT NULL DEFAULT FALSE,
    max_group_size INTEGER DEFAULT 1,
    peer_review_enabled BOOLEAN NOT NULL DEFAULT FALSE,
    peer_review_count INTEGER DEFAULT 0,
    show_rubric_to_students BOOLEAN NOT NULL DEFAULT TRUE,
    plagiarism_check_enabled BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
    FOREIGN KEY (lesson_id) REFERENCES lessons(id) ON DELETE SET NULL,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE,
    
    INDEX idx_assignment_course (course_id),
    INDEX idx_assignment_lesson (lesson_id),
    INDEX idx_assignment_creator (created_by),
    INDEX idx_assignment_due_date (due_date),
    INDEX idx_assignment_type (assignment_type),
    INDEX idx_assignment_published (is_published)
);

-- Assignment submissions table
CREATE TABLE assignment_submissions (
    id VARCHAR(255) PRIMARY KEY,
    assignment_id VARCHAR(255) NOT NULL,
    student_id VARCHAR(255) NOT NULL,
    group_id VARCHAR(255),
    submission_text TEXT,
    submission_files TEXT, -- JSON array of file URLs
    submission_metadata TEXT, -- JSON for additional data
    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_late BOOLEAN NOT NULL DEFAULT FALSE,
    attempt_number INTEGER NOT NULL DEFAULT 1,
    status VARCHAR(20) NOT NULL DEFAULT 'SUBMITTED',
    plagiarism_score DECIMAL(5,2),
    plagiarism_report_url VARCHAR(1000),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (assignment_id) REFERENCES assignments(id) ON DELETE CASCADE,
    FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
    
    UNIQUE KEY unique_student_assignment_attempt (assignment_id, student_id, attempt_number),
    INDEX idx_submission_assignment (assignment_id),
    INDEX idx_submission_student (student_id),
    INDEX idx_submission_status (status),
    INDEX idx_submission_date (submitted_at)
);

-- Assignment grades table
CREATE TABLE assignment_grades (
    id VARCHAR(255) PRIMARY KEY,
    submission_id VARCHAR(255) NOT NULL,
    assignment_id VARCHAR(255) NOT NULL,
    student_id VARCHAR(255) NOT NULL,
    grader_id VARCHAR(255) NOT NULL,
    points_earned DECIMAL(8,2) NOT NULL DEFAULT 0.0,
    points_possible DECIMAL(8,2) NOT NULL,
    percentage DECIMAL(5,2) NOT NULL DEFAULT 0.0,
    letter_grade VARCHAR(5),
    feedback TEXT,
    rubric_scores TEXT, -- JSON object with rubric criteria scores
    is_excused BOOLEAN NOT NULL DEFAULT FALSE,
    is_late BOOLEAN NOT NULL DEFAULT FALSE,
    late_penalty_applied DECIMAL(8,2) DEFAULT 0.0,
    graded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    released_at TIMESTAMP,
    is_released BOOLEAN NOT NULL DEFAULT FALSE,
    grade_status VARCHAR(20) NOT NULL DEFAULT 'GRADED',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (submission_id) REFERENCES assignment_submissions(id) ON DELETE CASCADE,
    FOREIGN KEY (assignment_id) REFERENCES assignments(id) ON DELETE CASCADE,
    FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (grader_id) REFERENCES users(id) ON DELETE CASCADE,
    
    UNIQUE KEY unique_submission_grade (submission_id),
    INDEX idx_grade_assignment (assignment_id),
    INDEX idx_grade_student (student_id),
    INDEX idx_grade_grader (grader_id),
    INDEX idx_grade_status (grade_status),
    INDEX idx_grade_percentage (percentage)
);

-- Rubrics table for assignment grading
CREATE TABLE rubrics (
    id VARCHAR(255) PRIMARY KEY,
    title VARCHAR(500) NOT NULL,
    description TEXT,
    course_id VARCHAR(255) NOT NULL,
    created_by VARCHAR(255) NOT NULL,
    total_points DECIMAL(8,2) NOT NULL DEFAULT 100.0,
    criteria TEXT NOT NULL, -- JSON array of rubric criteria
    is_published BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE,
    
    INDEX idx_rubric_course (course_id),
    INDEX idx_rubric_creator (created_by),
    INDEX idx_rubric_published (is_published)
);

-- Gradebook categories for organizing grades
CREATE TABLE gradebook_categories (
    id VARCHAR(255) PRIMARY KEY,
    course_id VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    weight_percentage DECIMAL(5,2) NOT NULL DEFAULT 0.0,
    drop_lowest INTEGER DEFAULT 0,
    category_order INTEGER NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,

    INDEX idx_gradebook_category_course (course_id),
    INDEX idx_gradebook_category_order (category_order)
);

-- Link assignments to gradebook categories
ALTER TABLE assignments ADD COLUMN gradebook_category_id VARCHAR(255);
ALTER TABLE assignments ADD FOREIGN KEY (gradebook_category_id) REFERENCES gradebook_categories(id) ON DELETE SET NULL;
ALTER TABLE assignments ADD INDEX idx_assignment_category (gradebook_category_id);

-- Student overall grades for courses
CREATE TABLE course_grades (
    id VARCHAR(255) PRIMARY KEY,
    course_id VARCHAR(255) NOT NULL,
    student_id VARCHAR(255) NOT NULL,
    current_grade DECIMAL(5,2) DEFAULT 0.0,
    final_grade DECIMAL(5,2),
    letter_grade VARCHAR(5),
    grade_points DECIMAL(3,2),
    is_passing BOOLEAN NOT NULL DEFAULT FALSE,
    is_complete BOOLEAN NOT NULL DEFAULT FALSE,
    completion_date TIMESTAMP,
    grade_locked BOOLEAN NOT NULL DEFAULT FALSE,
    override_grade DECIMAL(5,2),
    override_reason TEXT,
    last_calculated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
    FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,

    UNIQUE KEY unique_student_course_grade (course_id, student_id),
    INDEX idx_course_grade_course (course_id),
    INDEX idx_course_grade_student (student_id),
    INDEX idx_course_grade_current (current_grade),
    INDEX idx_course_grade_final (final_grade)
);

-- Add check constraints
ALTER TABLE assignments ADD CONSTRAINT chk_assignment_type
    CHECK (assignment_type IN ('ESSAY', 'MULTIPLE_CHOICE', 'FILE_UPLOAD', 'PRESENTATION', 'PROJECT', 'DISCUSSION', 'PEER_REVIEW'));

ALTER TABLE assignments ADD CONSTRAINT chk_submission_format
    CHECK (submission_format IN ('TEXT', 'FILE', 'URL', 'MEDIA', 'CODE'));

ALTER TABLE assignment_submissions ADD CONSTRAINT chk_submission_status
    CHECK (status IN ('DRAFT', 'SUBMITTED', 'GRADED', 'RETURNED', 'RESUBMITTED'));

ALTER TABLE assignment_grades ADD CONSTRAINT chk_grade_status
    CHECK (grade_status IN ('PENDING', 'GRADED', 'NEEDS_REVIEW', 'RELEASED', 'EXCUSED'));

-- Add comments for documentation
COMMENT ON TABLE assignments IS 'Stores assignment definitions with settings, due dates, and grading criteria';
COMMENT ON TABLE assignment_submissions IS 'Tracks student submissions for assignments with files and metadata';
COMMENT ON TABLE assignment_grades IS 'Stores grades and feedback for assignment submissions';
COMMENT ON TABLE rubrics IS 'Defines grading rubrics with criteria and point values';
COMMENT ON TABLE gradebook_categories IS 'Organizes assignments into weighted categories for grade calculation';
COMMENT ON TABLE course_grades IS 'Tracks overall student grades and progress in courses';
