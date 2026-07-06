-- StarkWorks / Kensapo 拡張: 作業員・スケジュール・メタデータ
-- 001 / 002 適用済みの環境で実行

-- 作業員
CREATE TABLE IF NOT EXISTS workers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  phone TEXT,
  trade TEXT,
  status TEXT NOT NULL DEFAULT 'active'
    CHECK (status IN ('active', 'inactive')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT workers_name_len CHECK (char_length(name) BETWEEN 1 AND 100)
);

-- スケジュール（作業員 × 現場 × 日付）
CREATE TABLE IF NOT EXISTS schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  worker_id UUID NOT NULL REFERENCES workers(id) ON DELETE CASCADE,
  schedule_date DATE NOT NULL,
  work_content TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 写真: タイトル・アップロード者
ALTER TABLE site_photos
  ADD COLUMN IF NOT EXISTS title TEXT,
  ADD COLUMN IF NOT EXISTS uploaded_by UUID REFERENCES profiles(id);

-- 日報: 作成者・提出状態
ALTER TABLE daily_reports
  ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES profiles(id),
  ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'submitted';

-- 既存行の status デフォルト
UPDATE daily_reports SET status = 'submitted' WHERE status IS NULL;

ALTER TABLE daily_reports
  DROP CONSTRAINT IF EXISTS daily_reports_status_check;

ALTER TABLE daily_reports
  ADD CONSTRAINT daily_reports_status_check
  CHECK (status IN ('draft', 'submitted'));

-- RLS
ALTER TABLE workers ENABLE ROW LEVEL SECURITY;
ALTER TABLE schedules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "workers_select" ON workers
  FOR SELECT USING (company_id = public.get_my_company_id());

CREATE POLICY "workers_insert" ON workers
  FOR INSERT WITH CHECK (company_id = public.get_my_company_id());

CREATE POLICY "workers_update" ON workers
  FOR UPDATE USING (company_id = public.get_my_company_id());

CREATE POLICY "workers_delete" ON workers
  FOR DELETE USING (company_id = public.get_my_company_id());

CREATE POLICY "schedules_select" ON schedules
  FOR SELECT USING (company_id = public.get_my_company_id());

CREATE POLICY "schedules_insert" ON schedules
  FOR INSERT WITH CHECK (company_id = public.get_my_company_id());

CREATE POLICY "schedules_update" ON schedules
  FOR UPDATE USING (company_id = public.get_my_company_id());

CREATE POLICY "schedules_delete" ON schedules
  FOR DELETE USING (company_id = public.get_my_company_id());

CREATE INDEX IF NOT EXISTS idx_workers_company_id ON workers(company_id);
CREATE INDEX IF NOT EXISTS idx_schedules_company_id ON schedules(company_id);
CREATE INDEX IF NOT EXISTS idx_schedules_date ON schedules(schedule_date);
CREATE INDEX IF NOT EXISTS idx_schedules_project_id ON schedules(project_id);
