-- Create comprehensive quiz and assessment tables

-- Quizzes table
CREATE TABLE quizzes (
    id VARCHAR(255) PRIMARY KEY,
    title VARCHAR(500) NOT NULL,
    description TEXT,
    instructions TEXT,
    course_id VARCHAR(255) NOT NULL,
    created_by VARCHAR(255) NOT NULL,
    time_limit_minutes INTEGER,
    max_attempts INTEGER DEFAULT 1,
    passing_score DECIMAL(5,2),
    total_points DECIMAL(8,2) DEFAULT 0.0,
    is_published BOOLEAN NOT NULL DEFAULT FALSE,
    is_randomized BOOLEAN NOT NULL DEFAULT FALSE,
    show_results_immediately BOOLEAN NOT NULL DEFAULT TRUE,
    show_correct_answers BOOLEAN NOT NULL DEFAULT TRUE,
    allow_review BOOLEAN NOT NULL DEFAULT TRUE,
    available_from TIMESTAMP,
    available_until TIMESTAMP,
    quiz_type VARCHAR(20) NOT NULL DEFAULT 'PRACTICE',
    grading_method VARCHAR(20) NOT NULL DEFAULT 'HIGHEST_SCORE',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_quizzes_course 
        FOREIGN KEY (course_id) REFERENCES courses(id) 
        ON DELETE CASCADE,
    CONSTRAINT fk_quizzes_creator 
        FOREIGN KEY (created_by) REFERENCES users(id) 
        ON DELETE CASCADE
);

-- Questions table
CREATE TABLE questions (
    id VARCHAR(255) PRIMARY KEY,
    quiz_id VARCHAR(255) NOT NULL,
    question_text TEXT NOT NULL,
    question_html TEXT,
    question_type VARCHAR(30) NOT NULL,
    points DECIMAL(6,2) NOT NULL DEFAULT 1.0,
    order_index INTEGER NOT NULL,
    explanation TEXT,
    image_url VARCHAR(1000),
    video_url VARCHAR(1000),
    audio_url VARCHAR(1000),
    is_required BOOLEAN NOT NULL DEFAULT TRUE,
    time_limit_seconds INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_questions_quiz 
        FOREIGN KEY (quiz_id) REFERENCES quizzes(id) 
        ON DELETE CASCADE
);

-- Question options table
CREATE TABLE question_options (
    id VARCHAR(255) PRIMARY KEY,
    question_id VARCHAR(255) NOT NULL,
    option_text TEXT NOT NULL,
    option_html TEXT,
    is_correct BOOLEAN NOT NULL DEFAULT FALSE,
    order_index INTEGER NOT NULL,
    image_url VARCHAR(1000),
    explanation TEXT,
    points_if_selected DECIMAL(6,2),
    
    CONSTRAINT fk_question_options_question 
        FOREIGN KEY (question_id) REFERENCES questions(id) 
        ON DELETE CASCADE
);

-- Quiz attempts table
CREATE TABLE quiz_attempts (
    id VARCHAR(255) PRIMARY KEY,
    quiz_id VARCHAR(255) NOT NULL,
    student_id VARCHAR(255) NOT NULL,
    attempt_number INTEGER NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'IN_PROGRESS',
    score DECIMAL(8,2),
    percentage_score DECIMAL(5,2),
    total_points DECIMAL(8,2),
    earned_points DECIMAL(8,2),
    time_spent_minutes INTEGER,
    started_at TIMESTAMP,
    submitted_at TIMESTAMP,
    graded_at TIMESTAMP,
    graded_by VARCHAR(255),
    feedback TEXT,
    ip_address VARCHAR(45),
    user_agent TEXT,
    is_late_submission BOOLEAN NOT NULL DEFAULT FALSE,
    auto_submitted BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_quiz_attempts_quiz 
        FOREIGN KEY (quiz_id) REFERENCES quizzes(id) 
        ON DELETE CASCADE,
    CONSTRAINT fk_quiz_attempts_student 
        FOREIGN KEY (student_id) REFERENCES users(id) 
        ON DELETE CASCADE,
    CONSTRAINT fk_quiz_attempts_grader 
        FOREIGN KEY (graded_by) REFERENCES users(id) 
        ON DELETE SET NULL,
    CONSTRAINT uk_quiz_attempts_student_attempt 
        UNIQUE (quiz_id, student_id, attempt_number)
);

-- Question answers table
CREATE TABLE question_answers (
    id VARCHAR(255) PRIMARY KEY,
    quiz_attempt_id VARCHAR(255) NOT NULL,
    question_id VARCHAR(255) NOT NULL,
    selected_options TEXT,
    text_answer TEXT,
    file_upload_url VARCHAR(1000),
    points_earned DECIMAL(6,2),
    is_correct BOOLEAN,
    is_graded BOOLEAN NOT NULL DEFAULT FALSE,
    grader_feedback TEXT,
    graded_by VARCHAR(255),
    graded_at TIMESTAMP,
    time_spent_seconds INTEGER,
    answer_order TEXT,
    matching_pairs TEXT,
    numerical_answer DECIMAL(15,6),
    is_flagged BOOLEAN NOT NULL DEFAULT FALSE,
    flag_reason VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_question_answers_attempt 
        FOREIGN KEY (quiz_attempt_id) REFERENCES quiz_attempts(id) 
        ON DELETE CASCADE,
    CONSTRAINT fk_question_answers_question 
        FOREIGN KEY (question_id) REFERENCES questions(id) 
        ON DELETE CASCADE,
    CONSTRAINT fk_question_answers_grader 
        FOREIGN KEY (graded_by) REFERENCES users(id) 
        ON DELETE SET NULL,
    CONSTRAINT uk_question_answers_attempt_question 
        UNIQUE (quiz_attempt_id, question_id)
);

-- Create indexes for better performance
CREATE INDEX idx_quizzes_course ON quizzes(course_id);
CREATE INDEX idx_quizzes_creator ON quizzes(created_by);
CREATE INDEX idx_quizzes_published ON quizzes(is_published);
CREATE INDEX idx_quizzes_type ON quizzes(quiz_type);
CREATE INDEX idx_quizzes_available ON quizzes(available_from, available_until);

CREATE INDEX idx_questions_quiz ON questions(quiz_id);
CREATE INDEX idx_questions_type ON questions(question_type);
CREATE INDEX idx_questions_order ON questions(quiz_id, order_index);

CREATE INDEX idx_question_options_question ON question_options(question_id);
CREATE INDEX idx_question_options_correct ON question_options(is_correct);
CREATE INDEX idx_question_options_order ON question_options(question_id, order_index);

CREATE INDEX idx_quiz_attempts_quiz ON quiz_attempts(quiz_id);
CREATE INDEX idx_quiz_attempts_student ON quiz_attempts(student_id);
CREATE INDEX idx_quiz_attempts_status ON quiz_attempts(status);
CREATE INDEX idx_quiz_attempts_submitted ON quiz_attempts(submitted_at);
CREATE INDEX idx_quiz_attempts_graded ON quiz_attempts(graded_at);
CREATE INDEX idx_quiz_attempts_quiz_student ON quiz_attempts(quiz_id, student_id);

CREATE INDEX idx_question_answers_attempt ON question_answers(quiz_attempt_id);
CREATE INDEX idx_question_answers_question ON question_answers(question_id);
CREATE INDEX idx_question_answers_graded ON question_answers(is_graded);
CREATE INDEX idx_question_answers_flagged ON question_answers(is_flagged);

-- Add comments for documentation
COMMENT ON TABLE quizzes IS 'Stores quiz/assessment definitions with settings and metadata';
COMMENT ON TABLE questions IS 'Stores individual questions within quizzes with various question types';
COMMENT ON TABLE question_options IS 'Stores answer options for multiple choice and similar question types';
COMMENT ON TABLE quiz_attempts IS 'Tracks student attempts at quizzes with timing and scoring information';
COMMENT ON TABLE question_answers IS 'Stores student answers to individual questions within quiz attempts';

-- Add check constraints
ALTER TABLE quizzes ADD CONSTRAINT chk_quizzes_quiz_type 
    CHECK (quiz_type IN ('PRACTICE', 'GRADED', 'SURVEY', 'EXAM'));

ALTER TABLE quizzes ADD CONSTRAINT chk_quizzes_grading_method 
    CHECK (grading_method IN ('HIGHEST_SCORE', 'LATEST_SCORE', 'AVERAGE_SCORE', 'FIRST_SCORE'));

ALTER TABLE questions ADD CONSTRAINT chk_questions_question_type 
    CHECK (question_type IN ('MULTIPLE_CHOICE', 'MULTIPLE_SELECT', 'TRUE_FALSE', 'SHORT_ANSWER', 
                             'ESSAY', 'FILL_IN_BLANK', 'MATCHING', 'ORDERING', 'NUMERICAL', 
                             'FILE_UPLOAD', 'DRAG_AND_DROP', 'HOTSPOT'));

ALTER TABLE quiz_attempts ADD CONSTRAINT chk_quiz_attempts_status 
    CHECK (status IN ('IN_PROGRESS', 'SUBMITTED', 'COMPLETED', 'ABANDONED', 'EXPIRED', 'FLAGGED'));

ALTER TABLE quizzes ADD CONSTRAINT chk_quizzes_passing_score 
    CHECK (passing_score IS NULL OR (passing_score >= 0 AND passing_score <= 100));

ALTER TABLE quiz_attempts ADD CONSTRAINT chk_quiz_attempts_percentage_score 
    CHECK (percentage_score IS NULL OR (percentage_score >= 0 AND percentage_score <= 100));
