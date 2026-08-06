-- お客様要望: 元請け先名 / 工事進行の〇△・備考
-- Supabase SQL Editor で1回実行してください

-- 現場: 元請け先名・進行備考
ALTER TABLE projects
  ADD COLUMN IF NOT EXISTS prime_contractor_name TEXT,
  ADD COLUMN IF NOT EXISTS progress_remarks TEXT;

-- 工事進行項目: 〇 / △ / 未入力 + 項目メモ
ALTER TABLE project_progress_items
  ADD COLUMN IF NOT EXISTS mark TEXT NOT NULL DEFAULT 'none',
  ADD COLUMN IF NOT EXISTS remarks TEXT;

ALTER TABLE project_progress_items
  DROP CONSTRAINT IF EXISTS project_progress_items_mark_check;

ALTER TABLE project_progress_items
  ADD CONSTRAINT project_progress_items_mark_check
  CHECK (mark IN ('none', 'ok', 'attention'));

ALTER TABLE project_progress_items
  DROP CONSTRAINT IF EXISTS project_progress_items_status_check;

ALTER TABLE project_progress_items
  ADD CONSTRAINT project_progress_items_status_check
  CHECK (status IN ('pending', 'completed', 'attention'));

-- 既存のチェック済みを〇に揃える
UPDATE project_progress_items
SET mark = 'ok',
    status = 'completed'
WHERE checked = true
  AND (mark IS NULL OR mark = 'none');

-- 空・不正な mark を安全な値に揃える
UPDATE project_progress_items
SET mark = 'none'
WHERE mark IS NULL
   OR mark NOT IN ('none', 'ok', 'attention');

UPDATE project_progress_items
SET status = 'pending'
WHERE status IS NULL
   OR status NOT IN ('pending', 'completed', 'attention');

-- attention は mark 側で持つ想定のため、status に残っていても致命傷にしない
UPDATE project_progress_items
SET status = 'pending'
WHERE status = 'attention' AND (mark IS NULL OR mark = 'none');

-- ---------------------------------------------------------------------------
-- 権限分離（管理者/作業者）
-- 管理者: 現場の登録・編集・削除、作業工程の追加・削除
-- 作業者: 作業工程の進捗更新（〇/△）は可能

DROP POLICY IF EXISTS "projects_insert" ON projects;
CREATE POLICY "projects_insert" ON projects
  FOR INSERT
  WITH CHECK (
    company_id = public.get_my_company_id()
    AND EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid()
        AND p.company_id = projects.company_id
        AND p.role = 'admin'
    )
  );

DROP POLICY IF EXISTS "projects_update" ON projects;
CREATE POLICY "projects_update" ON projects
  FOR UPDATE USING (
    company_id = public.get_my_company_id()
    AND EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid()
        AND p.company_id = projects.company_id
        AND p.role = 'admin'
    )
  );

DROP POLICY IF EXISTS "projects_delete" ON projects;
CREATE POLICY "projects_delete" ON projects
  FOR DELETE USING (
    company_id = public.get_my_company_id()
    AND EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid()
        AND p.company_id = projects.company_id
        AND p.role = 'admin'
    )
  );

DROP POLICY IF EXISTS "progress_items_insert" ON project_progress_items;
CREATE POLICY "progress_items_insert" ON project_progress_items
  FOR INSERT WITH CHECK (
    company_id = public.get_my_company_id()
    AND EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid()
        AND p.company_id = project_progress_items.company_id
        AND p.role = 'admin'
    )
  );

DROP POLICY IF EXISTS "progress_items_delete" ON project_progress_items;
CREATE POLICY "progress_items_delete" ON project_progress_items
  FOR DELETE USING (
    company_id = public.get_my_company_id()
    AND EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid()
        AND p.company_id = project_progress_items.company_id
        AND p.role = 'admin'
    )
  );
