-- ============================================================
-- ALIVER - Supabase Database Schema
-- Aile Alışveriş Asistanı
-- ============================================================
-- 
-- Bu SQL dosyasını Supabase SQL Editor'de çalıştırın.
-- Supabase Dashboard > SQL Editor > New Query > Yapıştır > Run
-- ============================================================

-- Kullanıcılar tablosu
CREATE TABLE IF NOT EXISTS "User" (
  "id"         TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "name"       TEXT NOT NULL,
  "email"      TEXT NOT NULL UNIQUE,
  "password"   TEXT NOT NULL,
  "avatar"     TEXT,
  "createdAt"  TIMESTAMPTZ NOT NULL DEFAULT now(),
  "updatedAt"  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Aileler tablosu
CREATE TABLE IF NOT EXISTS "Family" (
  "id"         TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "name"       TEXT NOT NULL,
  "inviteCode" TEXT NOT NULL UNIQUE,
  "createdBy"  TEXT NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
  "createdAt"  TIMESTAMPTZ NOT NULL DEFAULT now(),
  "updatedAt"  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Aile üyelikleri tablosu
CREATE TABLE IF NOT EXISTS "FamilyMember" (
  "id"        TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "role"      TEXT NOT NULL DEFAULT 'member' CHECK ("role" IN ('admin', 'member')),
  "joinedAt"  TIMESTAMPTZ NOT NULL DEFAULT now(),
  "userId"    TEXT NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
  "familyId"  TEXT NOT NULL REFERENCES "Family"("id") ON DELETE CASCADE,
  UNIQUE("userId", "familyId")
);

-- Alışveriş listeleri tablosu
CREATE TABLE IF NOT EXISTS "ShoppingList" (
  "id"        TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "name"      TEXT NOT NULL,
  "createdBy" TEXT NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
  "familyId"  TEXT NOT NULL REFERENCES "Family"("id") ON DELETE CASCADE,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Alışveriş ürünleri tablosu
CREATE TABLE IF NOT EXISTS "ShoppingItem" (
  "id"          TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "name"        TEXT NOT NULL,
  "quantity"    INTEGER NOT NULL DEFAULT 1,
  "unit"        TEXT NOT NULL DEFAULT 'adet',
  "completed"   BOOLEAN NOT NULL DEFAULT false,
  "purchasedBy" TEXT REFERENCES "User"("id") ON DELETE SET NULL,
  "purchasedAt" TIMESTAMPTZ,
  "createdAt"   TIMESTAMPTZ NOT NULL DEFAULT now(),
  "updatedAt"   TIMESTAMPTZ NOT NULL DEFAULT now(),
  "listId"      TEXT NOT NULL REFERENCES "ShoppingList"("id") ON DELETE CASCADE,
  "addedBy"     TEXT NOT NULL REFERENCES "User"("id") ON DELETE CASCADE
);


-- ============================================================
-- INDEXLER (Performans için)
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_user_email ON "User"("email");
CREATE INDEX IF NOT EXISTS idx_family_invite_code ON "Family"("inviteCode");
CREATE INDEX IF NOT EXISTS idx_family_member_user ON "FamilyMember"("userId");
CREATE INDEX IF NOT EXISTS idx_family_member_family ON "FamilyMember"("familyId");
CREATE INDEX IF NOT EXISTS idx_shopping_list_family ON "ShoppingList"("familyId");
CREATE INDEX IF NOT EXISTS idx_shopping_item_list ON "ShoppingItem"("listId");
CREATE INDEX IF NOT EXISTS idx_shopping_item_completed ON "ShoppingItem"("listId", "completed");
CREATE INDEX IF NOT EXISTS idx_shopping_item_added_by ON "ShoppingItem"("addedBy");


-- ============================================================
-- UPDATED AT TRIGGER (Otomatik güncelleme)
-- ============================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW."updatedAt" = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_user_updated_at
  BEFORE UPDATE ON "User"
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_family_updated_at
  BEFORE UPDATE ON "Family"
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_shopping_list_updated_at
  BEFORE UPDATE ON "ShoppingList"
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_shopping_item_updated_at
  BEFORE UPDATE ON "ShoppingItem"
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();


-- ============================================================
-- RLS (Row Level Security) - Opsiyonel güvenlik katmanı
-- Supabase Dashboard > Authentication > Policies kısmından
-- daha detaylı policy'ler eklenebilir.
-- ============================================================

ALTER TABLE "User" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Family" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "FamilyMember" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ShoppingList" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ShoppingItem" ENABLE ROW LEVEL SECURITY;

-- Herkes kendi profilini görebilsin
CREATE POLICY "Users can view own profile"
  ON "User" FOR SELECT
  USING (auth.uid()::text = "id");

CREATE POLICY "Users can update own profile"
  ON "User" FOR UPDATE
  USING (auth.uid()::text = "id");

-- Aile üyeleri aile verilerini görebilsin
CREATE POLICY "Family members can view family"
  ON "Family" FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM "FamilyMember"
      WHERE "FamilyMember"."familyId" = "Family"."id"
      AND "FamilyMember"."userId" = auth.uid()::text
    )
  );

-- Aile üyeleri listeleri görebilsin
CREATE POLICY "Family members can view lists"
  ON "ShoppingList" FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM "FamilyMember"
      WHERE "FamilyMember"."familyId" = "ShoppingList"."familyId"
      AND "FamilyMember"."userId" = auth.uid()::text
    )
  );

-- Aile üyeleri ürünlere erişebilsin
CREATE POLICY "Family members can view items"
  ON "ShoppingItem" FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM "ShoppingList" sl
      JOIN "FamilyMember" fm ON fm."familyId" = sl."familyId"
      WHERE sl."id" = "ShoppingItem"."listId"
      AND fm."userId" = auth.uid()::text
    )
  );

CREATE POLICY "Family members can insert items"
  ON "ShoppingItem" FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM "ShoppingList" sl
      JOIN "FamilyMember" fm ON fm."familyId" = sl."familyId"
      WHERE sl."id" = "ShoppingItem"."listId"
      AND fm."userId" = auth.uid()::text
    )
  );

CREATE POLICY "Family members can update items"
  ON "ShoppingItem" FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM "ShoppingList" sl
      JOIN "FamilyMember" fm ON fm."familyId" = sl."familyId"
      WHERE sl."id" = "ShoppingItem"."listId"
      AND fm."userId" = auth.uid()::text
    )
  );

CREATE POLICY "Family members can delete items"
  ON "ShoppingItem" FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM "ShoppingList" sl
      JOIN "FamilyMember" fm ON fm."familyId" = sl."familyId"
      WHERE sl."id" = "ShoppingItem"."listId"
      AND fm."userId" = auth.uid()::text
    )
  );
