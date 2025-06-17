-- Create default admin user
-- Password: admin123 (hashed with BCrypt)
INSERT INTO users (id, email, password, first_name, last_name, role, is_approved, is_enabled, email_verified) 
VALUES (
    'admin-001', 
    'admin@modernlms.com', 
    '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2uheWG/igi.', -- admin123
    'System', 
    'Administrator', 
    'ADMIN', 
    true, 
    true, 
    true
);

-- Create sample instructor user
-- Password: instructor123
INSERT INTO users (id, email, password, first_name, last_name, role, is_approved, is_enabled, email_verified) 
VALUES (
    'instructor-001', 
    'instructor@modernlms.com', 
    '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2uheWG/igi.', -- instructor123
    'John', 
    'Instructor', 
    'INSTRUCTOR', 
    true, 
    true, 
    true
);

-- Create sample student user
-- Password: student123
INSERT INTO users (id, email, password, first_name, last_name, role, is_approved, is_enabled, email_verified) 
VALUES (
    'student-001', 
    'student@modernlms.com', 
    '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2uheWG/igi.', -- student123
    'Jane', 
    'Student', 
    'STUDENT', 
    true, 
    true, 
    true
);
