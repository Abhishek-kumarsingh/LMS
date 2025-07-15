-- Create refresh tokens table for enhanced JWT authentication
CREATE TABLE refresh_tokens (
    id VARCHAR(255) PRIMARY KEY,
    token VARCHAR(255) UNIQUE NOT NULL,
    user_id VARCHAR(255) NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    is_revoked BOOLEAN NOT NULL DEFAULT FALSE,
    device_info VARCHAR(500),
    ip_address VARCHAR(45),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_used_at TIMESTAMP,
    
    CONSTRAINT fk_refresh_tokens_user 
        FOREIGN KEY (user_id) REFERENCES users(id) 
        ON DELETE CASCADE
);

-- Create indexes for better performance
CREATE INDEX idx_refresh_tokens_token ON refresh_tokens(token);
CREATE INDEX idx_refresh_tokens_user_id ON refresh_tokens(user_id);
CREATE INDEX idx_refresh_tokens_expires_at ON refresh_tokens(expires_at);
CREATE INDEX idx_refresh_tokens_is_revoked ON refresh_tokens(is_revoked);
CREATE INDEX idx_refresh_tokens_user_active ON refresh_tokens(user_id, is_revoked, expires_at);

-- Add comments for documentation
COMMENT ON TABLE refresh_tokens IS 'Stores refresh tokens for JWT authentication with device tracking';
COMMENT ON COLUMN refresh_tokens.id IS 'Unique identifier for the refresh token record';
COMMENT ON COLUMN refresh_tokens.token IS 'The actual refresh token string';
COMMENT ON COLUMN refresh_tokens.user_id IS 'Reference to the user who owns this token';
COMMENT ON COLUMN refresh_tokens.expires_at IS 'When this refresh token expires';
COMMENT ON COLUMN refresh_tokens.is_revoked IS 'Whether this token has been revoked';
COMMENT ON COLUMN refresh_tokens.device_info IS 'User agent string for device identification';
COMMENT ON COLUMN refresh_tokens.ip_address IS 'IP address where the token was created';
COMMENT ON COLUMN refresh_tokens.created_at IS 'When this token was created';
COMMENT ON COLUMN refresh_tokens.last_used_at IS 'When this token was last used for refresh';
