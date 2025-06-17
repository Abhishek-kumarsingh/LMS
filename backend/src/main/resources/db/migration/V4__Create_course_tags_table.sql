CREATE TABLE tags (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_name (name)
);

CREATE TABLE course_tags (
    course_id VARCHAR(36) NOT NULL,
    tag_id VARCHAR(36) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    PRIMARY KEY (course_id, tag_id),
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
    FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
);

-- Insert common tags
INSERT INTO tags (id, name) VALUES
('tag-1', 'JavaScript'),
('tag-2', 'Python'),
('tag-3', 'React'),
('tag-4', 'Node.js'),
('tag-5', 'HTML'),
('tag-6', 'CSS'),
('tag-7', 'SQL'),
('tag-8', 'MongoDB'),
('tag-9', 'AWS'),
('tag-10', 'Docker'),
('tag-11', 'Machine Learning'),
('tag-12', 'Data Analysis'),
('tag-13', 'UI Design'),
('tag-14', 'UX Design'),
('tag-15', 'Photoshop'),
('tag-16', 'Figma'),
('tag-17', 'Marketing'),
('tag-18', 'SEO'),
('tag-19', 'Social Media'),
('tag-20', 'Photography');
