-- Create file uploads table for comprehensive file management
CREATE TABLE file_uploads (
    id VARCHAR(255) PRIMARY KEY,
    original_filename VARCHAR(500) NOT NULL,
    stored_filename VARCHAR(500) NOT NULL,
    file_path VARCHAR(1000) NOT NULL,
    file_url VARCHAR(1000),
    file_size BIGINT NOT NULL,
    mime_type VARCHAR(100) NOT NULL,
    file_type VARCHAR(50) NOT NULL,
    storage_type VARCHAR(50) NOT NULL,
    cloudinary_public_id VARCHAR(500),
    uploaded_by VARCHAR(255) NOT NULL,
    course_id VARCHAR(255),
    description TEXT,
    is_public BOOLEAN NOT NULL DEFAULT FALSE,
    download_count BIGINT NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP,
    is_deleted BOOLEAN NOT NULL DEFAULT FALSE,
    deleted_at TIMESTAMP,
    virus_scan_status VARCHAR(20) DEFAULT 'PENDING',
    virus_scan_result VARCHAR(500),
    access_level VARCHAR(20) NOT NULL DEFAULT 'PRIVATE',
    tags VARCHAR(1000),
    
    CONSTRAINT fk_file_uploads_user 
        FOREIGN KEY (uploaded_by) REFERENCES users(id) 
        ON DELETE CASCADE,
    CONSTRAINT fk_file_uploads_course 
        FOREIGN KEY (course_id) REFERENCES courses(id) 
        ON DELETE SET NULL
);

-- Create indexes for better performance
CREATE INDEX idx_file_uploads_uploaded_by ON file_uploads(uploaded_by);
CREATE INDEX idx_file_uploads_course_id ON file_uploads(course_id);
CREATE INDEX idx_file_uploads_file_type ON file_uploads(file_type);
CREATE INDEX idx_file_uploads_storage_type ON file_uploads(storage_type);
CREATE INDEX idx_file_uploads_is_deleted ON file_uploads(is_deleted);
CREATE INDEX idx_file_uploads_created_at ON file_uploads(created_at);
CREATE INDEX idx_file_uploads_expires_at ON file_uploads(expires_at);
CREATE INDEX idx_file_uploads_access_level ON file_uploads(access_level);
CREATE INDEX idx_file_uploads_virus_scan_status ON file_uploads(virus_scan_status);
CREATE INDEX idx_file_uploads_is_public ON file_uploads(is_public);
CREATE INDEX idx_file_uploads_download_count ON file_uploads(download_count);
CREATE INDEX idx_file_uploads_cloudinary_public_id ON file_uploads(cloudinary_public_id);

-- Composite indexes for common queries
CREATE INDEX idx_file_uploads_user_not_deleted ON file_uploads(uploaded_by, is_deleted, created_at);
CREATE INDEX idx_file_uploads_course_not_deleted ON file_uploads(course_id, is_deleted, created_at);
CREATE INDEX idx_file_uploads_type_not_deleted ON file_uploads(file_type, is_deleted, created_at);
CREATE INDEX idx_file_uploads_public_not_deleted ON file_uploads(is_public, is_deleted, created_at);

-- Full-text search index for filename and description (PostgreSQL specific)
-- CREATE INDEX idx_file_uploads_search ON file_uploads USING gin(to_tsvector('english', original_filename || ' ' || COALESCE(description, '') || ' ' || COALESCE(tags, '')));

-- Add comments for documentation
COMMENT ON TABLE file_uploads IS 'Stores comprehensive file upload information with security and metadata';
COMMENT ON COLUMN file_uploads.id IS 'Unique identifier for the file upload';
COMMENT ON COLUMN file_uploads.original_filename IS 'Original filename as uploaded by user';
COMMENT ON COLUMN file_uploads.stored_filename IS 'Filename as stored in the system (usually UUID-based)';
COMMENT ON COLUMN file_uploads.file_path IS 'Path where the file is stored';
COMMENT ON COLUMN file_uploads.file_url IS 'Public URL for accessing the file (if applicable)';
COMMENT ON COLUMN file_uploads.file_size IS 'File size in bytes';
COMMENT ON COLUMN file_uploads.mime_type IS 'MIME type of the file';
COMMENT ON COLUMN file_uploads.file_type IS 'Categorized file type (IMAGE, VIDEO, DOCUMENT, etc.)';
COMMENT ON COLUMN file_uploads.storage_type IS 'Where the file is stored (CLOUDINARY, LOCAL, AWS_S3, etc.)';
COMMENT ON COLUMN file_uploads.cloudinary_public_id IS 'Cloudinary public ID for files stored in Cloudinary';
COMMENT ON COLUMN file_uploads.uploaded_by IS 'User who uploaded the file';
COMMENT ON COLUMN file_uploads.course_id IS 'Associated course (optional)';
COMMENT ON COLUMN file_uploads.description IS 'User-provided description of the file';
COMMENT ON COLUMN file_uploads.is_public IS 'Whether the file is publicly accessible';
COMMENT ON COLUMN file_uploads.download_count IS 'Number of times the file has been downloaded';
COMMENT ON COLUMN file_uploads.created_at IS 'When the file was uploaded';
COMMENT ON COLUMN file_uploads.expires_at IS 'When the file expires (optional)';
COMMENT ON COLUMN file_uploads.is_deleted IS 'Whether the file has been soft deleted';
COMMENT ON COLUMN file_uploads.deleted_at IS 'When the file was deleted';
COMMENT ON COLUMN file_uploads.virus_scan_status IS 'Status of virus scan (PENDING, SCANNING, CLEAN, INFECTED, FAILED)';
COMMENT ON COLUMN file_uploads.virus_scan_result IS 'Result details from virus scan';
COMMENT ON COLUMN file_uploads.access_level IS 'Access level (PRIVATE, COURSE, INSTRUCTOR, PUBLIC)';
COMMENT ON COLUMN file_uploads.tags IS 'Comma-separated tags for categorization and search';
