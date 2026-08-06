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
