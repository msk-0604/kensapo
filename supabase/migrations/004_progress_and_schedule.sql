-- 工事進行チェックシート + 行動予定表の拡張
-- 001 / 002 / 003 適用済みの環境で実行

-- 工事進行チェック項目
CREATE TABLE IF NOT EXISTS project_progress_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  category TEXT NOT NULL,
  section TEXT,
  item_name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'completed')),
  checked BOOLEAN NOT NULL DEFAULT false,
  checked_at TIMESTAMPTZ,
  checked_by UUID REFERENCES profiles(id),
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- schedules 拡張（行動予定表）
ALTER TABLE schedules ALTER COLUMN worker_id DROP NOT NULL;

ALTER TABLE schedules
  ADD COLUMN IF NOT EXISTS client_company_name TEXT,
  ADD COLUMN IF NOT EXISTS location TEXT,
  ADD COLUMN IF NOT EXISTS title TEXT,
  ADD COLUMN IF NOT EXISTS scheduled_start_time TIME,
  ADD COLUMN IF NOT EXISTS scheduled_end_time TIME,
  ADD COLUMN IF NOT EXISTS actual_start_time TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS actual_end_time TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS memo TEXT,
  ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'scheduled',
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();

UPDATE schedules SET status = 'scheduled' WHERE status IS NULL;
UPDATE schedules SET updated_at = now() WHERE updated_at IS NULL;

ALTER TABLE schedules
  DROP CONSTRAINT IF EXISTS schedules_status_check;

ALTER TABLE schedules
  ADD CONSTRAINT schedules_status_check
  CHECK (status IN ('scheduled', 'in_progress', 'completed', 'cancelled'));

-- RLS: project_progress_items
ALTER TABLE project_progress_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "progress_items_select" ON project_progress_items
  FOR SELECT USING (company_id = public.get_my_company_id());

CREATE POLICY "progress_items_insert" ON project_progress_items
  FOR INSERT WITH CHECK (company_id = public.get_my_company_id());

CREATE POLICY "progress_items_update" ON project_progress_items
  FOR UPDATE USING (company_id = public.get_my_company_id());

CREATE POLICY "progress_items_delete" ON project_progress_items
  FOR DELETE USING (company_id = public.get_my_company_id());

CREATE INDEX IF NOT EXISTS idx_progress_items_project_id
  ON project_progress_items(project_id);

CREATE INDEX IF NOT EXISTS idx_progress_items_company_id
  ON project_progress_items(company_id);

CREATE INDEX IF NOT EXISTS idx_schedules_status ON schedules(status);
