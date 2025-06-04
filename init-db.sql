-- Not a Label - Enhanced Analytics Platform
-- Database Initialization Script

-- Create database extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(255),
    avatar_url TEXT,
    role VARCHAR(50) DEFAULT 'artist',
    subscription_tier VARCHAR(50) DEFAULT 'free',
    subscription_status VARCHAR(50) DEFAULT 'inactive',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_login TIMESTAMP WITH TIME ZONE,
    email_verified BOOLEAN DEFAULT FALSE,
    onboarding_completed BOOLEAN DEFAULT FALSE
);

-- User profiles
CREATE TABLE IF NOT EXISTS user_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    artist_name VARCHAR(255),
    bio TEXT,
    genres TEXT[],
    location VARCHAR(255),
    website VARCHAR(255),
    social_links JSONB,
    goals TEXT[],
    preferences JSONB,
    artist_stage VARCHAR(50) DEFAULT 'emerging',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tracks table
CREATE TABLE IF NOT EXISTS tracks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    artist VARCHAR(255),
    genre VARCHAR(100),
    duration INTEGER, -- in seconds
    file_url TEXT,
    cover_art_url TEXT,
    release_date DATE,
    is_public BOOLEAN DEFAULT TRUE,
    play_count INTEGER DEFAULT 0,
    like_count INTEGER DEFAULT 0,
    download_count INTEGER DEFAULT 0,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Streams table for analytics
CREATE TABLE IF NOT EXISTS streams (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    track_id UUID NOT NULL REFERENCES tracks(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    duration_played INTEGER, -- in seconds
    platform VARCHAR(100),
    location VARCHAR(255),
    device_type VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enhanced Analytics Tables

-- Daily metrics for aggregated analytics
CREATE TABLE IF NOT EXISTS daily_metrics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    streams INTEGER DEFAULT 0,
    followers INTEGER DEFAULT 0,
    engagement_rate DECIMAL(5,2) DEFAULT 0.0,
    revenue DECIMAL(10,2) DEFAULT 0.0,
    social_mentions INTEGER DEFAULT 0,
    viral_score DECIMAL(5,2) DEFAULT 0.0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, date)
);

-- AI predictions
CREATE TABLE IF NOT EXISTS predictions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    prediction_type VARCHAR(100) NOT NULL,
    time_horizon VARCHAR(50) NOT NULL,
    predictions_data JSONB NOT NULL,
    scenarios JSONB,
    recommendations JSONB,
    confidence DECIMAL(3,2),
    generated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    valid_until TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- AI assistant conversations
CREATE TABLE IF NOT EXISTS ai_conversations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    session_id VARCHAR(255) NOT NULL,
    message_type VARCHAR(50) NOT NULL, -- 'user', 'assistant', 'system'
    content TEXT NOT NULL,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Market trends
CREATE TABLE IF NOT EXISTS market_trends (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL,
    trend_score DECIMAL(5,2) NOT NULL,
    momentum VARCHAR(50),
    viral_potential DECIMAL(3,2),
    relevance_score DECIMAL(3,2),
    description TEXT,
    opportunities TEXT[],
    threats TEXT[],
    metadata JSONB,
    detected_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Social media posts for viral tracking
CREATE TABLE IF NOT EXISTS social_media_posts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    track_id UUID REFERENCES tracks(id) ON DELETE CASCADE,
    platform VARCHAR(100) NOT NULL,
    post_id VARCHAR(255),
    engagement_rate DECIMAL(5,2),
    reach INTEGER,
    likes INTEGER,
    shares INTEGER,
    comments INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Collaborations
CREATE TABLE IF NOT EXISTS collaborations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    initiator_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    collaborator_id UUID REFERENCES users(id) ON DELETE SET NULL,
    track_id UUID REFERENCES tracks(id) ON DELETE SET NULL,
    status VARCHAR(50) DEFAULT 'pending',
    type VARCHAR(100), -- 'feature', 'remix', 'production', etc.
    message TEXT,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Follows for social features
CREATE TABLE IF NOT EXISTS follows (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    follower_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    followed_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(follower_id, followed_id)
);

-- Track engagement
CREATE TABLE IF NOT EXISTS track_engagement (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    track_id UUID NOT NULL REFERENCES tracks(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(50) NOT NULL, -- 'like', 'share', 'comment', 'download'
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Revenue events
CREATE TABLE IF NOT EXISTS revenue_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    track_id UUID REFERENCES tracks(id) ON DELETE SET NULL,
    amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    source VARCHAR(100), -- 'streaming', 'download', 'merchandise', etc.
    platform VARCHAR(100),
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_tracks_user_id ON tracks(user_id);
CREATE INDEX IF NOT EXISTS idx_streams_track_id ON streams(track_id);
CREATE INDEX IF NOT EXISTS idx_streams_created_at ON streams(created_at);
CREATE INDEX IF NOT EXISTS idx_daily_metrics_user_date ON daily_metrics(user_id, date);
CREATE INDEX IF NOT EXISTS idx_predictions_user_id ON predictions(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_conversations_session ON ai_conversations(session_id);
CREATE INDEX IF NOT EXISTS idx_market_trends_category ON market_trends(category);
CREATE INDEX IF NOT EXISTS idx_social_posts_track_id ON social_media_posts(track_id);
CREATE INDEX IF NOT EXISTS idx_follows_follower ON follows(follower_id);
CREATE INDEX IF NOT EXISTS idx_follows_followed ON follows(followed_id);
CREATE INDEX IF NOT EXISTS idx_track_engagement_track ON track_engagement(track_id);
CREATE INDEX IF NOT EXISTS idx_revenue_events_user ON revenue_events(user_id);

-- Insert sample data for demo
INSERT INTO users (id, email, password_hash, name, role) VALUES 
(uuid_generate_v4(), 'demo@not-a-label.art', crypt('demo123', gen_salt('bf')), 'Demo Artist', 'artist')
ON CONFLICT (email) DO NOTHING;

-- Insert sample market trends
INSERT INTO market_trends (name, category, trend_score, momentum, viral_potential, relevance_score, description, opportunities, threats) VALUES
('Lo-Fi Hip Hop Revival', 'genre', 89.0, 'rising', 0.73, 0.85, 'Lo-fi hip hop is experiencing a resurgence, particularly among Gen Z listeners for study and relaxation', ARRAY['Create lo-fi remixes', 'Target study playlists', 'Collaborate with lo-fi producers'], ARRAY['Market saturation', 'Trend fatigue']),
('Social Audio Features', 'technology', 76.0, 'rising', 0.68, 0.72, 'Platforms are emphasizing audio-first social features, creating new opportunities for artist engagement', ARRAY['Host live audio sessions', 'Create interactive content', 'Build voice-first community'], ARRAY['Platform dependency', 'Feature changes'])
ON CONFLICT DO NOTHING;

-- Create functions for analytics
CREATE OR REPLACE FUNCTION update_play_count()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE tracks 
    SET play_count = play_count + 1 
    WHERE id = NEW.track_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for play count updates
DROP TRIGGER IF EXISTS update_play_count_trigger ON streams;
CREATE TRIGGER update_play_count_trigger
    AFTER INSERT ON streams
    FOR EACH ROW
    EXECUTE FUNCTION update_play_count();

-- Create function to update updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON user_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_tracks_updated_at BEFORE UPDATE ON tracks FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_collaborations_updated_at BEFORE UPDATE ON collaborations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Grant permissions
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO not_a_label_user;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO not_a_label_user;

-- Success message
DO $$
BEGIN
    RAISE NOTICE 'Not a Label Enhanced Analytics Database initialized successfully!';
    RAISE NOTICE 'Tables created: users, user_profiles, tracks, streams, daily_metrics, predictions, ai_conversations, market_trends, social_media_posts, collaborations, follows, track_engagement, revenue_events';
    RAISE NOTICE 'Indexes and triggers created for optimal performance';
    RAISE NOTICE 'Sample data inserted for demo purposes';
END $$;