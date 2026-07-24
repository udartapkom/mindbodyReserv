-- Tariff comparison matrix for /price page

CREATE TABLE IF NOT EXISTS tariff_comparison_rows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  feature VARCHAR(255) NOT NULL,
  included JSONB NOT NULL DEFAULT '{}'::jsonb,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_tariff_comparison_rows_sort
  ON tariff_comparison_rows (sort_order ASC);

-- Seed current static matrix if empty
INSERT INTO tariff_comparison_rows (feature, included, sort_order)
SELECT * FROM (VALUES
  ('Доступ к мыслям и заметкам', '{"trial": true, "popular": true, "vip": true}'::jsonb, 0),
  ('Еженедельные инсайты', '{"trial": true, "popular": true, "vip": true}'::jsonb, 1),
  ('Цитаты', '{"trial": true, "popular": true, "vip": true}'::jsonb, 2),
  ('Отношения и сексуальная психология', '{"trial": false, "popular": true, "vip": false}'::jsonb, 3),
  ('Ментальное здоровье и бизнес', '{"trial": false, "popular": false, "vip": true}'::jsonb, 4),
  ('Личные консультации', '{"trial": false, "popular": false, "vip": true}'::jsonb, 5)
) AS seed(feature, included, sort_order)
WHERE NOT EXISTS (SELECT 1 FROM tariff_comparison_rows LIMIT 1);
