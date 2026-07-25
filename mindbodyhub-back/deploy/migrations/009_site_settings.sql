-- Site-wide settings (singleton). Support messenger links editable from admin.

CREATE TABLE IF NOT EXISTS site_settings (
  id INT PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  support_telegram_url VARCHAR(2048) NOT NULL DEFAULT 'https://t.me/mbh_support',
  support_vk_url VARCHAR(2048) NOT NULL DEFAULT 'https://vk.com/mindbodyhubpro',
  support_max_url VARCHAR(2048) NOT NULL DEFAULT 'https://max.ru',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO site_settings (id, support_telegram_url, support_vk_url, support_max_url)
VALUES (
  1,
  'https://t.me/mbh_support',
  'https://vk.com/mindbodyhubpro',
  'https://max.ru'
)
ON CONFLICT (id) DO NOTHING;
