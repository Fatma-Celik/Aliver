/* ═══════════════════════════════════════════════════════
   ALIVER – Supabase Veritabanı Şeması
   ═══════════════════════════════════════════════════════
   Bu dosyayı Supabase Dashboard > SQL Editor'de çalıştırın.
   ═══════════════════════════════════════════════════════ */

-- ── 1. Aile tablosu ──
CREATE TABLE IF NOT EXISTS families (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL,
  invite_code TEXT UNIQUE NOT NULL,
  created_by  UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at  TIMESTAMPTZ DEFAULT now(),
  updated_at  TIMESTAMPTZ DEFAULT now()
);

-- ── 2. Aile üyeleri ──
CREATE TABLE IF NOT EXISTS family_members (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id  UUID NOT NULL REFERENCES families(id) ON DELETE CASCADE,
  user_id    UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role       TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('admin', 'member')),
  joined_at  TIMESTAMPTZ DEFAULT now(),
  UNIQUE(family_id, user_id)
);

-- ── 3. Alışveriş listeleri ──
CREATE TABLE IF NOT EXISTS shopping_lists (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL,
  family_id   UUID NOT NULL REFERENCES families(id) ON DELETE CASCADE,
  created_by  UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at  TIMESTAMPTZ DEFAULT now(),
  updated_at  TIMESTAMPTZ DEFAULT now()
);

-- ── 4. Liste ürünleri ──
CREATE TABLE IF NOT EXISTS list_items (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  list_id     UUID NOT NULL REFERENCES shopping_lists(id) ON DELETE CASCADE,
  name        TEXT NOT NULL,
  quantity    INTEGER DEFAULT 1,
  unit        TEXT DEFAULT 'adet',
  completed   BOOLEAN DEFAULT false,
  added_by    UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at  TIMESTAMPTZ DEFAULT now()
);

-- ── 5. Row Level Security (RLS) ──
ALTER TABLE families ENABLE ROW LEVEL SECURITY;
ALTER TABLE family_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE shopping_lists ENABLE ROW LEVEL SECURITY;
ALTER TABLE list_items ENABLE ROW LEVEL SECURITY;

-- Aile üyeleri kendi ailelerini görebilir
CREATE POLICY "Users can read own families"
  ON families FOR SELECT
  USING (auth.uid() IN (
    SELECT user_id FROM family_members WHERE family_id = families.id
  ));

-- Giriş yapmış kullanıcılar aile oluşturabilir
CREATE POLICY "Authenticated users can create families"
  ON families FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Members can read family_members"
  ON family_members FOR SELECT
  USING (auth.uid() IN (
    SELECT user_id FROM family_members WHERE family_id = family_members.family_id
  ));

CREATE POLICY "Authenticated users can join families"
  ON family_members FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Family members can read lists"
  ON shopping_lists FOR SELECT
  USING (auth.uid() IN (
    SELECT user_id FROM family_members WHERE family_id = shopping_lists.family_id
  ));

CREATE POLICY "Family members can create lists"
  ON shopping_lists FOR INSERT
  WITH CHECK (auth.uid() IN (
    SELECT user_id FROM family_members WHERE family_id = shopping_lists.family_id
  ));

CREATE POLICY "Family members can read items"
  ON list_items FOR SELECT
  USING (auth.uid() IN (
    SELECT user_id FROM family_members fm
    JOIN shopping_lists sl ON sl.family_id = fm.family_id
    WHERE sl.id = list_items.list_id
  ));

CREATE POLICY "Family members can manage items"
  ON list_items FOR ALL
  USING (auth.uid() IN (
    SELECT user_id FROM family_members fm
    JOIN shopping_lists sl ON sl.family_id = fm.family_id
    WHERE sl.id = list_items.list_id
  ));

-- ── 6. Invite code otomatik oluşturma ──
CREATE OR REPLACE FUNCTION generate_invite_code()
RETURNS TEXT AS $$
DECLARE
  code TEXT;
BEGIN
  LOOP
    code := UPPER(SUBSTRING(MD5(RANDOM()::TEXT) FROM 1 FOR 4))
       || '-' || UPPER(SUBSTRING(MD5(RANDOM()::TEXT) FROM 1 FOR 4));
    EXIT WHEN NOT EXISTS (SELECT 1 FROM families WHERE invite_code = code);
  END LOOP;
  RETURN code;
END;
$$ LANGUAGE plpgsql;

-- ── 7. Updated_at trigger ──
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER families_updated_at BEFORE UPDATE ON families
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER shopping_lists_updated_at BEFORE UPDATE ON shopping_lists
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
