-- Reading progress per user (sync across devices)

CREATE TABLE IF NOT EXISTS user_reading_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  material_id UUID NOT NULL REFERENCES materials(id) ON DELETE CASCADE,
  scroll_ratio DOUBLE PRECISION NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_user_reading_progress_user_material UNIQUE (user_id, material_id),
  CONSTRAINT chk_user_reading_progress_ratio
    CHECK (scroll_ratio >= 0 AND scroll_ratio <= 1)
);

CREATE INDEX IF NOT EXISTS idx_user_reading_progress_user_updated
  ON user_reading_progress (user_id, updated_at DESC);
