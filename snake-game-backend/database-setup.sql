-- Snake Game Database Schema

-- Create users table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create scores table
CREATE TABLE IF NOT EXISTS scores (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    value INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_scores_user_id ON scores(user_id);
CREATE INDEX IF NOT EXISTS idx_scores_value ON scores(value DESC);

-- Insert some dummy data for testing
INSERT INTO users (username, password_hash) VALUES 
('testuser1', '$2b$10$example1hash'),
('testuser2', '$2b$10$example2hash'),
('player1', '$2b$10$example3hash')
ON CONFLICT (username) DO NOTHING;

-- Get the user IDs for inserting scores
DO $$
DECLARE
    user1_id INTEGER;
    user2_id INTEGER;
    user3_id INTEGER;
BEGIN
    SELECT id INTO user1_id FROM users WHERE username = 'testuser1';
    SELECT id INTO user2_id FROM users WHERE username = 'testuser2';
    SELECT id INTO user3_id FROM users WHERE username = 'player1';
    
    -- Insert dummy scores
    INSERT INTO scores (user_id, value) VALUES 
    (user1_id, 150),
    (user1_id, 200),
    (user1_id, 75),
    (user2_id, 300),
    (user2_id, 125),
    (user3_id, 450),
    (user3_id, 380),
    (user3_id, 220);
END $$;
