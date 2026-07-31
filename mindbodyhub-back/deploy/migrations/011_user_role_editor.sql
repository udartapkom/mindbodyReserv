-- Add editor role for limited admin-panel access

ALTER TYPE users_role_enum ADD VALUE IF NOT EXISTS 'editor';
