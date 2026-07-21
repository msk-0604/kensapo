-- ケンサポ初期設定（SupabaseでRun）
-- 空のDBでもOK / 何度実行してもOK

-- =============================================================================
-- Tables: core

CREATE TABLE IF NOT EXISTS companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'member',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  address TEXT,
  manager_name TEXT,
  start_date DATE,
  end_date DATE,
  status TEXT NOT NULL DEFAULT 'not_started'
    CHECK (status IN ('not_started', 'in_progress', 'completed')),
  memo TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS site_photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  comment TEXT,
  taken_at DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS daily_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  report_date DATE NOT NULL,
  weather TEXT,
  workers_count INTEGER,
  work_content TEXT,
  materials TEXT,
  issues TEXT,
  next_plan TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =============================================================================
-- Tables: workers, schedules, progress

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

CREATE TABLE IF NOT EXISTS schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  worker_id UUID REFERENCES workers(id) ON DELETE CASCADE,
  schedule_date DATE NOT NULL,
  work_content TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS push_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  endpoint TEXT NOT NULL,
  p256dh TEXT NOT NULL,
  auth TEXT NOT NULL,
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT push_subscriptions_endpoint_unique UNIQUE (endpoint)
);

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

-- =============================================================================
-- Column additions

ALTER TABLE site_photos
  ADD COLUMN IF NOT EXISTS storage_path TEXT,
  ADD COLUMN IF NOT EXISTS title TEXT,
  ADD COLUMN IF NOT EXISTS uploaded_by UUID REFERENCES profiles(id);

ALTER TABLE daily_reports
  ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES profiles(id),
  ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'submitted';

UPDATE daily_reports SET status = 'submitted' WHERE status IS NULL;

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
UPDATE schedules SET updated_at = COALESCE(updated_at, now());

-- =============================================================================
-- Constraints

ALTER TABLE companies DROP CONSTRAINT IF EXISTS companies_name_len;
ALTER TABLE companies
  ADD CONSTRAINT companies_name_len CHECK (char_length(name) BETWEEN 1 AND 200);

ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_name_len;
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
ALTER TABLE profiles
  ADD CONSTRAINT profiles_name_len CHECK (char_length(name) BETWEEN 1 AND 100),
  ADD CONSTRAINT profiles_role_check CHECK (role IN ('admin', 'member'));

ALTER TABLE projects DROP CONSTRAINT IF EXISTS projects_name_len;
ALTER TABLE projects
  ADD CONSTRAINT projects_name_len CHECK (char_length(name) BETWEEN 1 AND 200);

ALTER TABLE daily_reports DROP CONSTRAINT IF EXISTS daily_reports_status_check;
ALTER TABLE daily_reports
  ADD CONSTRAINT daily_reports_status_check
  CHECK (status IN ('draft', 'submitted'));

ALTER TABLE schedules DROP CONSTRAINT IF EXISTS schedules_status_check;
ALTER TABLE schedules
  ADD CONSTRAINT schedules_status_check
  CHECK (status IN ('scheduled', 'in_progress', 'completed', 'cancelled'));

-- =============================================================================
-- Functions

CREATE OR REPLACE FUNCTION public.get_my_company_id()
RETURNS UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT company_id FROM profiles WHERE id = auth.uid()
$$;

CREATE OR REPLACE FUNCTION public.user_owns_project(project_uuid UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM projects
    WHERE id = project_uuid
      AND company_id = public.get_my_company_id()
  )
$$;

CREATE OR REPLACE FUNCTION public.storage_belongs_to_my_company(object_name TEXT)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT split_part(object_name, '/', 1)::uuid = public.get_my_company_id()
$$;

CREATE OR REPLACE FUNCTION public.register_company(
  company_name TEXT,
  user_name TEXT
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public

AS $$
DECLARE
  new_company_id UUID;
  c_name TEXT;
  u_name TEXT;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;
  IF EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid()) THEN
    RAISE EXCEPTION 'Profile already exists';
  END IF;

  c_name := trim(company_name);
  u_name := trim(user_name);

  IF char_length(c_name) < 1 OR char_length(c_name) > 200 THEN
    RAISE EXCEPTION 'Invalid company name';
  END IF;
  IF char_length(u_name) < 1 OR char_length(u_name) > 100 THEN
    RAISE EXCEPTION 'Invalid user name';
  END IF;

  INSERT INTO companies (name) VALUES (c_name) RETURNING id INTO new_company_id;
  INSERT INTO profiles (id, company_id, name, role)
  VALUES (auth.uid(), new_company_id, u_name, 'admin');
  RETURN new_company_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.register_company(TEXT, TEXT) TO authenticated;

-- =============================================================================
-- Enable RLS

ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE workers ENABLE ROW LEVEL SECURITY;
ALTER TABLE schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_progress_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE push_subscriptions ENABLE ROW LEVEL SECURITY;

-- =============================================================================
-- RLS policies: companies / profiles

DROP POLICY IF EXISTS "companies_select_own" ON companies;
CREATE POLICY "companies_select_own" ON companies
  FOR SELECT USING (id = public.get_my_company_id());

DROP POLICY IF EXISTS "profiles_select_company" ON profiles;
CREATE POLICY "profiles_select_company" ON profiles
  FOR SELECT USING (company_id = public.get_my_company_id());

DROP POLICY IF EXISTS "profiles_insert_own" ON profiles;

DROP POLICY IF EXISTS "profiles_update_own" ON profiles;
CREATE POLICY "profiles_update_own" ON profiles
  FOR UPDATE
  USING (id = auth.uid())
  WITH CHECK (
    id = auth.uid()
    AND company_id = public.get_my_company_id()
  );

-- =============================================================================
-- RLS policies: projects

DROP POLICY IF EXISTS "projects_select" ON projects;
CREATE POLICY "projects_select" ON projects
  FOR SELECT USING (company_id = public.get_my_company_id());

DROP POLICY IF EXISTS "projects_insert" ON projects;
CREATE POLICY "projects_insert" ON projects
  FOR INSERT
  WITH CHECK (
    company_id = public.get_my_company_id()
    AND company_id IS NOT NULL
  );

DROP POLICY IF EXISTS "projects_update" ON projects;
CREATE POLICY "projects_update" ON projects
  FOR UPDATE USING (company_id = public.get_my_company_id());

DROP POLICY IF EXISTS "projects_delete" ON projects;
CREATE POLICY "projects_delete" ON projects
  FOR DELETE USING (company_id = public.get_my_company_id());

-- =============================================================================
-- RLS policies: site_photos

DROP POLICY IF EXISTS "photos_select" ON site_photos;
CREATE POLICY "photos_select" ON site_photos
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM projects p
      WHERE p.id = site_photos.project_id
        AND p.company_id = public.get_my_company_id()
    )
  );

DROP POLICY IF EXISTS "photos_insert" ON site_photos;
CREATE POLICY "photos_insert" ON site_photos
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM projects p
      WHERE p.id = site_photos.project_id
        AND p.company_id = public.get_my_company_id()
    )
  );

DROP POLICY IF EXISTS "photos_update" ON site_photos;
CREATE POLICY "photos_update" ON site_photos
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM projects p
      WHERE p.id = site_photos.project_id
        AND p.company_id = public.get_my_company_id()
    )
  );

DROP POLICY IF EXISTS "photos_delete" ON site_photos;
CREATE POLICY "photos_delete" ON site_photos
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM projects p
      WHERE p.id = site_photos.project_id
        AND p.company_id = public.get_my_company_id()
    )
  );

-- =============================================================================
-- RLS policies: daily_reports

DROP POLICY IF EXISTS "reports_select" ON daily_reports;
CREATE POLICY "reports_select" ON daily_reports
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM projects p
      WHERE p.id = daily_reports.project_id
        AND p.company_id = public.get_my_company_id()
    )
  );

DROP POLICY IF EXISTS "reports_insert" ON daily_reports;
CREATE POLICY "reports_insert" ON daily_reports
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM projects p
      WHERE p.id = daily_reports.project_id
        AND p.company_id = public.get_my_company_id()
    )
  );

DROP POLICY IF EXISTS "reports_update" ON daily_reports;
CREATE POLICY "reports_update" ON daily_reports
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM projects p
      WHERE p.id = daily_reports.project_id
        AND p.company_id = public.get_my_company_id()
    )
  );

DROP POLICY IF EXISTS "reports_delete" ON daily_reports;
CREATE POLICY "reports_delete" ON daily_reports
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM projects p
      WHERE p.id = daily_reports.project_id
        AND p.company_id = public.get_my_company_id()
    )
  );

-- =============================================================================
-- RLS policies: workers / schedules / progress

DROP POLICY IF EXISTS "workers_select" ON workers;
CREATE POLICY "workers_select" ON workers
  FOR SELECT USING (company_id = public.get_my_company_id());

DROP POLICY IF EXISTS "workers_insert" ON workers;
CREATE POLICY "workers_insert" ON workers
  FOR INSERT WITH CHECK (company_id = public.get_my_company_id());

DROP POLICY IF EXISTS "workers_update" ON workers;
CREATE POLICY "workers_update" ON workers
  FOR UPDATE USING (company_id = public.get_my_company_id());

DROP POLICY IF EXISTS "workers_delete" ON workers;
CREATE POLICY "workers_delete" ON workers
  FOR DELETE USING (company_id = public.get_my_company_id());

DROP POLICY IF EXISTS "schedules_select" ON schedules;
CREATE POLICY "schedules_select" ON schedules
  FOR SELECT USING (company_id = public.get_my_company_id());

DROP POLICY IF EXISTS "schedules_insert" ON schedules;
CREATE POLICY "schedules_insert" ON schedules
  FOR INSERT WITH CHECK (company_id = public.get_my_company_id());

DROP POLICY IF EXISTS "schedules_update" ON schedules;
CREATE POLICY "schedules_update" ON schedules
  FOR UPDATE USING (company_id = public.get_my_company_id());

DROP POLICY IF EXISTS "schedules_delete" ON schedules;
CREATE POLICY "schedules_delete" ON schedules
  FOR DELETE USING (company_id = public.get_my_company_id());

ALTER TABLE push_subscriptions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "push_subscriptions_select" ON push_subscriptions;
CREATE POLICY "push_subscriptions_select" ON push_subscriptions
  FOR SELECT USING (company_id = public.get_my_company_id());

DROP POLICY IF EXISTS "push_subscriptions_insert" ON push_subscriptions;
CREATE POLICY "push_subscriptions_insert" ON push_subscriptions
  FOR INSERT WITH CHECK (
    user_id = auth.uid()
    AND company_id = public.get_my_company_id()
  );

DROP POLICY IF EXISTS "push_subscriptions_update" ON push_subscriptions;
CREATE POLICY "push_subscriptions_update" ON push_subscriptions
  FOR UPDATE USING (user_id = auth.uid());

DROP POLICY IF EXISTS "push_subscriptions_delete" ON push_subscriptions;
CREATE POLICY "push_subscriptions_delete" ON push_subscriptions
  FOR DELETE USING (
    user_id = auth.uid()
    OR company_id = public.get_my_company_id()
  );

DROP POLICY IF EXISTS "progress_items_select" ON project_progress_items;
CREATE POLICY "progress_items_select" ON project_progress_items
  FOR SELECT USING (company_id = public.get_my_company_id());

DROP POLICY IF EXISTS "progress_items_insert" ON project_progress_items;
CREATE POLICY "progress_items_insert" ON project_progress_items
  FOR INSERT WITH CHECK (company_id = public.get_my_company_id());

DROP POLICY IF EXISTS "progress_items_update" ON project_progress_items;
CREATE POLICY "progress_items_update" ON project_progress_items
  FOR UPDATE USING (company_id = public.get_my_company_id());

DROP POLICY IF EXISTS "progress_items_delete" ON project_progress_items;
CREATE POLICY "progress_items_delete" ON project_progress_items
  FOR DELETE USING (company_id = public.get_my_company_id());

-- =============================================================================
-- Indexes

CREATE INDEX IF NOT EXISTS idx_profiles_company_id ON profiles(company_id);
CREATE INDEX IF NOT EXISTS idx_projects_company_id ON projects(company_id);
CREATE INDEX IF NOT EXISTS idx_site_photos_project_id ON site_photos(project_id);
CREATE INDEX IF NOT EXISTS idx_daily_reports_project_id ON daily_reports(project_id);
CREATE INDEX IF NOT EXISTS idx_workers_company_id ON workers(company_id);
CREATE INDEX IF NOT EXISTS idx_schedules_company_id ON schedules(company_id);
CREATE INDEX IF NOT EXISTS idx_schedules_date ON schedules(schedule_date);
CREATE INDEX IF NOT EXISTS idx_schedules_project_id ON schedules(project_id);
CREATE INDEX IF NOT EXISTS idx_schedules_status ON schedules(status);
CREATE INDEX IF NOT EXISTS idx_progress_items_project_id ON project_progress_items(project_id);
CREATE INDEX IF NOT EXISTS idx_progress_items_company_id ON project_progress_items(company_id);
CREATE INDEX IF NOT EXISTS idx_push_subscriptions_company_id ON push_subscriptions(company_id);
CREATE INDEX IF NOT EXISTS idx_push_subscriptions_user_id ON push_subscriptions(user_id);

-- =============================================================================
-- Storage: site-photos bucket + policies

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'site-photos',
  'site-photos',
  false,
  10485760,
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif']
)
ON CONFLICT (id) DO UPDATE SET
  public = false,
  file_size_limit = 10485760,
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif'];

DROP POLICY IF EXISTS "site_photos_select" ON storage.objects;
DROP POLICY IF EXISTS "site_photos_insert" ON storage.objects;
DROP POLICY IF EXISTS "site_photos_delete" ON storage.objects;
DROP POLICY IF EXISTS "site_photos_update" ON storage.objects;

CREATE POLICY "site_photos_select" ON storage.objects
  FOR SELECT
  USING (
    bucket_id = 'site-photos'
    AND auth.role() = 'authenticated'
    AND public.storage_belongs_to_my_company(name)
    AND public.user_owns_project((split_part(name, '/', 2))::uuid)
  );

CREATE POLICY "site_photos_insert" ON storage.objects
  FOR INSERT
  WITH CHECK (
    bucket_id = 'site-photos'
    AND auth.role() = 'authenticated'
    AND public.storage_belongs_to_my_company(name)
    AND public.user_owns_project((split_part(name, '/', 2))::uuid)
  );

CREATE POLICY "site_photos_delete" ON storage.objects
  FOR DELETE
  USING (
    bucket_id = 'site-photos'
    AND auth.role() = 'authenticated'
    AND public.storage_belongs_to_my_company(name)
    AND public.user_owns_project((split_part(name, '/', 2))::uuid)
  );

CREATE POLICY "site_photos_update" ON storage.objects
  FOR UPDATE
  USING (
    bucket_id = 'site-photos'
    AND auth.role() = 'authenticated'
    AND public.storage_belongs_to_my_company(name)
  );

