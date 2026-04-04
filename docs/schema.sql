-- NZTech Dashboard Schema
-- Tables: apps, tasks, metrics, notifications

-- Apps table
CREATE TABLE apps (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'active',
  platform TEXT, -- 'ios', 'android', 'web'
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Tasks table
CREATE TABLE tasks (
  id BIGSERIAL PRIMARY KEY,
  app_id BIGINT NOT NULL REFERENCES apps(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'todo', -- 'todo', 'in_progress', 'done'
  priority TEXT DEFAULT 'medium', -- 'low', 'medium', 'high'
  due_date DATE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Metrics table
CREATE TABLE metrics (
  id BIGSERIAL PRIMARY KEY,
  app_id BIGINT NOT NULL REFERENCES apps(id) ON DELETE CASCADE,
  metric_name TEXT NOT NULL,
  value NUMERIC,
  timestamp TIMESTAMP DEFAULT NOW()
);

-- Notifications table
CREATE TABLE notifications (
  id BIGSERIAL PRIMARY KEY,
  app_id BIGINT REFERENCES apps(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT,
  type TEXT DEFAULT 'info', -- 'info', 'warning', 'error', 'success'
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Enable RLS (Row Level Security)
ALTER TABLE apps ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
