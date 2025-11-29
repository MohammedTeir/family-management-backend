-- Migration to create import_sessions table
CREATE TABLE IF NOT EXISTS import_sessions (
    id SERIAL PRIMARY KEY,
    session_id VARCHAR(255) NOT NULL UNIQUE,
    user_id INTEGER NOT NULL REFERENCES users(id),
    total_records INTEGER NOT NULL,
    valid_records INTEGER NOT NULL,
    invalid_records INTEGER NOT NULL,
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    original_filename VARCHAR(500),
    processed INTEGER DEFAULT 0,
    status VARCHAR(50) DEFAULT 'initialized', -- 'initialized', 'in-progress', 'completed', 'failed'
    transformed_data TEXT, -- JSON string of the valid data to import
    invalid_rows TEXT, -- JSON string of validation errors
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for the import_sessions table
CREATE INDEX IF NOT EXISTS import_sessions_session_id_idx ON import_sessions(session_id);
CREATE INDEX IF NOT EXISTS import_sessions_user_id_idx ON import_sessions(user_id);
CREATE INDEX IF NOT EXISTS import_sessions_status_idx ON import_sessions(status);