-- CompetitorSpy Database Schema

-- Competitors table
CREATE TABLE competitors (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL,
  name VARCHAR(255) NOT NULL,
  website VARCHAR(255) NOT NULL,
  industry VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Scraped Content table
CREATE TABLE scraped_content (
  id SERIAL PRIMARY KEY,
  competitor_id INT REFERENCES competitors(id) ON DELETE CASCADE,
  url VARCHAR(255),
  title VARCHAR(255),
  content TEXT,
  keywords TEXT,
  scraped_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Generated Content table
CREATE TABLE generated_content (
  id SERIAL PRIMARY KEY,
  competitor_id INT REFERENCES competitors(id) ON DELETE CASCADE,
  content_type VARCHAR(50), -- 'blog_post', 'social_media', 'ad_copy', 'landing_page'
  content TEXT,
  platform VARCHAR(50), -- 'instagram', 'facebook', 'linkedin', 'twitter', 'blog'
  generated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  status VARCHAR(20) DEFAULT 'draft' -- 'draft', 'published', 'scheduled'
);

-- Keywords Tracking table
CREATE TABLE keywords_tracking (
  id SERIAL PRIMARY KEY,
  competitor_id INT REFERENCES competitors(id) ON DELETE CASCADE,
  keyword VARCHAR(255),
  search_volume INT,
  difficulty INT,
  position INT,
  tracked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Social Media Posts table
CREATE TABLE social_posts (
  id SERIAL PRIMARY KEY,
  generated_content_id INT REFERENCES generated_content(id),
  platform VARCHAR(50),
  post_id VARCHAR(255),
  scheduled_time TIMESTAMP,
  posted_at TIMESTAMP,
  engagement_count INT DEFAULT 0,
  status VARCHAR(20) DEFAULT 'scheduled'
);

-- Analytics table
CREATE TABLE analytics (
  id SERIAL PRIMARY KEY,
  competitor_id INT REFERENCES competitors(id),
  metric_name VARCHAR(100),
  metric_value INT,
  recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX idx_competitors_user_id ON competitors(user_id);
CREATE INDEX idx_scraped_content_competitor_id ON scraped_content(competitor_id);
CREATE INDEX idx_generated_content_competitor_id ON generated_content(competitor_id);
CREATE INDEX idx_keywords_competitor_id ON keywords_tracking(competitor_id);
