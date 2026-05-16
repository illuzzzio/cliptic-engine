-- Create social media accounts table
CREATE TABLE social_media_accounts (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  platform TEXT NOT NULL, -- 'tiktok', 'instagram', 'youtube', 'twitter'
  account_name TEXT NOT NULL,
  account_handle TEXT,
  connected_at TIMESTAMP DEFAULT NOW() NOT NULL,
  access_token TEXT,
  refresh_token TEXT,
  expires_at TIMESTAMP,
  metadata JSONB,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW() NOT NULL,
  UNIQUE(user_id, platform, account_handle)
);

-- Create scheduled posts table
CREATE TABLE scheduled_posts (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  short_id TEXT NOT NULL REFERENCES generated_shorts(id) ON DELETE CASCADE,
  social_account_id TEXT NOT NULL REFERENCES social_media_accounts(id) ON DELETE CASCADE,
  scheduled_date TIMESTAMP NOT NULL,
  status TEXT NOT NULL DEFAULT 'scheduled', -- 'scheduled', 'posted', 'failed', 'canceled'
  posted_at TIMESTAMP,
  post_url TEXT,
  error_message TEXT,
  metadata JSONB,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Create indexes for better query performance
CREATE INDEX idx_social_accounts_user_id ON social_media_accounts(user_id);
CREATE INDEX idx_social_accounts_platform ON social_media_accounts(platform);
CREATE INDEX idx_scheduled_posts_user_id ON scheduled_posts(user_id);
CREATE INDEX idx_scheduled_posts_date ON scheduled_posts(scheduled_date);
CREATE INDEX idx_scheduled_posts_status ON scheduled_posts(status);
