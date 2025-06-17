CREATE TABLE categories (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    icon VARCHAR(100),
    color VARCHAR(7), -- For hex color codes
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_name (name),
    INDEX idx_is_active (is_active)
);

-- Insert default categories
INSERT INTO categories (id, name, description, icon, color) VALUES
('cat-1', 'Programming', 'Software development and programming languages', 'code', '#3B82F6'),
('cat-2', 'Design', 'UI/UX design, graphic design, and creative arts', 'palette', '#8B5CF6'),
('cat-3', 'Business', 'Business strategy, entrepreneurship, and management', 'briefcase', '#10B981'),
('cat-4', 'Marketing', 'Digital marketing, social media, and advertising', 'megaphone', '#F59E0B'),
('cat-5', 'Data Science', 'Data analysis, machine learning, and statistics', 'bar-chart', '#EF4444'),
('cat-6', 'Photography', 'Photography techniques and photo editing', 'camera', '#6366F1'),
('cat-7', 'Music', 'Music production, instruments, and theory', 'music', '#EC4899'),
('cat-8', 'Language', 'Foreign languages and communication skills', 'globe', '#14B8A6');
