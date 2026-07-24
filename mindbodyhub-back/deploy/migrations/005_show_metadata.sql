-- Display flags for materials / knowledge articles

ALTER TABLE materials
  ADD COLUMN IF NOT EXISTS show_metadata BOOLEAN NOT NULL DEFAULT TRUE;

ALTER TABLE knowledge_articles
  ADD COLUMN IF NOT EXISTS show_metadata BOOLEAN NOT NULL DEFAULT TRUE;
