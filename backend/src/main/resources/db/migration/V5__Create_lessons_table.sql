CREATE TABLE lessons (
    id VARCHAR(36) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    video_url VARCHAR(500),
    video_duration_seconds INT NOT NULL DEFAULT 0,
    course_id VARCHAR(36) NOT NULL,
    section_id VARCHAR(36),
    order_index INT NOT NULL,
    is_preview BOOLEAN NOT NULL DEFAULT FALSE,
    is_published BOOLEAN NOT NULL DEFAULT TRUE,
    resources TEXT, -- JSON array of resource links
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
    
    INDEX idx_course (course_id),
    INDEX idx_section (section_id),
    INDEX idx_order (order_index),
    INDEX idx_preview (is_preview),
    INDEX idx_published (is_published)
);

CREATE TABLE course_sections (
    id VARCHAR(36) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    course_id VARCHAR(36) NOT NULL,
    order_index INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
    
    INDEX idx_course (course_id),
    INDEX idx_order (order_index)
);

-- Add foreign key for lessons to sections
ALTER TABLE lessons 
ADD FOREIGN KEY (section_id) REFERENCES course_sections(id) ON DELETE SET NULL;
