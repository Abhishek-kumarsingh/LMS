CREATE TABLE notifications (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    type ENUM('COURSE_ENROLLMENT', 'COURSE_UPDATE', 'CERTIFICATE_ISSUED', 'COMMENT_REPLY', 'INSTRUCTOR_APPROVED', 'COURSE_PUBLISHED', 'REVIEW_RECEIVED') NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    related_entity_type ENUM('COURSE', 'LESSON', 'COMMENT', 'REVIEW', 'CERTIFICATE') NULL,
    related_entity_id VARCHAR(36) NULL,
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    is_email_sent BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    read_at TIMESTAMP NULL,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    
    INDEX idx_user (user_id),
    INDEX idx_type (type),
    INDEX idx_read (is_read),
    INDEX idx_created_at (created_at),
    INDEX idx_related_entity (related_entity_type, related_entity_id)
);

CREATE TABLE email_templates (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    subject VARCHAR(255) NOT NULL,
    html_content TEXT NOT NULL,
    text_content TEXT,
    variables JSON, -- JSON array of variable names used in template
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_name (name),
    INDEX idx_active (is_active)
);

-- Insert default email templates
INSERT INTO email_templates (id, name, subject, html_content, text_content, variables) VALUES
('tpl-1', 'welcome', 'Welcome to Modern LMS!', 
 '<h1>Welcome {{firstName}}!</h1><p>Thank you for joining Modern LMS. Start your learning journey today!</p>', 
 'Welcome {{firstName}}! Thank you for joining Modern LMS. Start your learning journey today!',
 '["firstName", "email"]'),
 
('tpl-2', 'course_enrollment', 'Course Enrollment Confirmation', 
 '<h1>Enrollment Confirmed!</h1><p>Hi {{firstName}}, you have successfully enrolled in "{{courseTitle}}".</p>', 
 'Hi {{firstName}}, you have successfully enrolled in "{{courseTitle}}".',
 '["firstName", "courseTitle", "instructorName"]'),
 
('tpl-3', 'certificate_issued', 'Certificate Issued!', 
 '<h1>Congratulations {{firstName}}!</h1><p>You have completed "{{courseTitle}}" and earned your certificate!</p>', 
 'Congratulations {{firstName}}! You have completed "{{courseTitle}}" and earned your certificate!',
 '["firstName", "courseTitle", "certificateUrl"]'),
 
('tpl-4', 'instructor_approved', 'Instructor Application Approved', 
 '<h1>Welcome Instructor {{firstName}}!</h1><p>Your instructor application has been approved. You can now create courses!</p>', 
 'Welcome Instructor {{firstName}}! Your instructor application has been approved. You can now create courses!',
 '["firstName"]');
