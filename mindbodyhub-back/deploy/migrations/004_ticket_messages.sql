-- Ticket message threads for cabinet / admin support chat

DO $$ BEGIN
  CREATE TYPE ticket_messages_author_type_enum AS ENUM ('user', 'admin');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS ticket_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id UUID NOT NULL REFERENCES tickets(id) ON DELETE CASCADE,
  author_type ticket_messages_author_type_enum NOT NULL,
  author_user_id UUID NULL,
  body TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ticket_messages_ticket_id
  ON ticket_messages (ticket_id);

CREATE INDEX IF NOT EXISTS idx_ticket_messages_created_at
  ON ticket_messages (ticket_id, created_at);

-- Seed first message from existing tickets.message when thread is empty
INSERT INTO ticket_messages (ticket_id, author_type, author_user_id, body, created_at)
SELECT t.id, 'user', t.user_id, t.message, t.created_at
FROM tickets t
WHERE NOT EXISTS (
  SELECT 1 FROM ticket_messages m WHERE m.ticket_id = t.id
);
