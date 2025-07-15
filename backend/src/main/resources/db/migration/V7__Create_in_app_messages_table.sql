-- Create in-app messages table for comprehensive messaging system
CREATE TABLE in_app_messages (
    id VARCHAR(255) PRIMARY KEY,
    sender_id VARCHAR(255),
    recipient_id VARCHAR(255) NOT NULL,
    subject VARCHAR(500) NOT NULL,
    content TEXT NOT NULL,
    type VARCHAR(50) NOT NULL,
    priority VARCHAR(20) NOT NULL DEFAULT 'NORMAL',
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    read_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP,
    action_url VARCHAR(500),
    action_text VARCHAR(100),
    related_course_id VARCHAR(255),
    related_enrollment_id VARCHAR(255),
    
    CONSTRAINT fk_in_app_messages_sender 
        FOREIGN KEY (sender_id) REFERENCES users(id) 
        ON DELETE SET NULL,
    CONSTRAINT fk_in_app_messages_recipient 
        FOREIGN KEY (recipient_id) REFERENCES users(id) 
        ON DELETE CASCADE,
    CONSTRAINT fk_in_app_messages_course 
        FOREIGN KEY (related_course_id) REFERENCES courses(id) 
        ON DELETE SET NULL,
    CONSTRAINT fk_in_app_messages_enrollment 
        FOREIGN KEY (related_enrollment_id) REFERENCES enrollments(id) 
        ON DELETE SET NULL
);

-- Create message metadata table for flexible key-value storage
CREATE TABLE message_metadata (
    message_id VARCHAR(255) NOT NULL,
    metadata_key VARCHAR(100) NOT NULL,
    metadata_value VARCHAR(500),
    
    PRIMARY KEY (message_id, metadata_key),
    CONSTRAINT fk_message_metadata_message 
        FOREIGN KEY (message_id) REFERENCES in_app_messages(id) 
        ON DELETE CASCADE
);

-- Create indexes for better performance
CREATE INDEX idx_in_app_messages_recipient ON in_app_messages(recipient_id);
CREATE INDEX idx_in_app_messages_sender ON in_app_messages(sender_id);
CREATE INDEX idx_in_app_messages_type ON in_app_messages(type);
CREATE INDEX idx_in_app_messages_priority ON in_app_messages(priority);
CREATE INDEX idx_in_app_messages_is_read ON in_app_messages(is_read);
CREATE INDEX idx_in_app_messages_created_at ON in_app_messages(created_at);
CREATE INDEX idx_in_app_messages_expires_at ON in_app_messages(expires_at);
CREATE INDEX idx_in_app_messages_recipient_unread ON in_app_messages(recipient_id, is_read, created_at);
CREATE INDEX idx_in_app_messages_recipient_type ON in_app_messages(recipient_id, type, created_at);
CREATE INDEX idx_in_app_messages_course ON in_app_messages(related_course_id);
CREATE INDEX idx_in_app_messages_enrollment ON in_app_messages(related_enrollment_id);

-- Add comments for documentation
COMMENT ON TABLE in_app_messages IS 'Stores in-app messages and notifications for users';
COMMENT ON COLUMN in_app_messages.id IS 'Unique identifier for the message';
COMMENT ON COLUMN in_app_messages.sender_id IS 'User who sent the message (null for system messages)';
COMMENT ON COLUMN in_app_messages.recipient_id IS 'User who receives the message';
COMMENT ON COLUMN in_app_messages.subject IS 'Message subject/title';
COMMENT ON COLUMN in_app_messages.content IS 'Message content/body';
COMMENT ON COLUMN in_app_messages.type IS 'Type of message (SYSTEM_ANNOUNCEMENT, COURSE_UPDATE, etc.)';
COMMENT ON COLUMN in_app_messages.priority IS 'Message priority (LOW, NORMAL, HIGH, URGENT)';
COMMENT ON COLUMN in_app_messages.is_read IS 'Whether the message has been read';
COMMENT ON COLUMN in_app_messages.read_at IS 'When the message was read';
COMMENT ON COLUMN in_app_messages.created_at IS 'When the message was created';
COMMENT ON COLUMN in_app_messages.expires_at IS 'When the message expires (optional)';
COMMENT ON COLUMN in_app_messages.action_url IS 'URL for message action button (optional)';
COMMENT ON COLUMN in_app_messages.action_text IS 'Text for message action button (optional)';
COMMENT ON COLUMN in_app_messages.related_course_id IS 'Related course ID (optional)';
COMMENT ON COLUMN in_app_messages.related_enrollment_id IS 'Related enrollment ID (optional)';

COMMENT ON TABLE message_metadata IS 'Stores additional metadata for messages as key-value pairs';
COMMENT ON COLUMN message_metadata.message_id IS 'Reference to the message';
COMMENT ON COLUMN message_metadata.metadata_key IS 'Metadata key';
COMMENT ON COLUMN message_metadata.metadata_value IS 'Metadata value';
