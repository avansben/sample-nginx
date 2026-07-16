-- Guestbook table: one row per posted message.
-- Also mounted into postgres initdb.d for first-time database creation.
CREATE TABLE IF NOT EXISTS messages (
  id SERIAL PRIMARY KEY,
  author VARCHAR(255) NOT NULL,
  text TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Speed up listing (newest first) and author-based search/filter queries.
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_author ON messages (author);
