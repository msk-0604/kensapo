-- Kensapo MVP: 初期スキーマ + RLS
-- Supabase SQL Editor で実行するか、supabase db push で適用

-- companies
CREATE TABLE IF NOT EXISTS companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- profiles (auth.users と 1:1)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'member',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- projects (現場)
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

-- site_photos
CREATE TABLE IF NOT EXISTS site_photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  comment TEXT,
  taken_at DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- daily_reports
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

-- 会社ID取得ヘルパー
CREATE OR REPLACE FUNCTION public.get_my_company_id()
RETURNS UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT company_id FROM profiles WHERE id = auth.uid()
$$;

-- RLS
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_reports ENABLE ROW LEVEL SECURITY;

-- companies: 自社のみ
CREATE POLICY "companies_select_own" ON companies
  FOR SELECT USING (id = public.get_my_company_id());

-- 新規登録用 RPC（Auth 済みユーザーが会社+プロフィールを作成）
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
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;
  IF EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid()) THEN
    RAISE EXCEPTION 'Profile already exists';
  END IF;

  INSERT INTO companies (name) VALUES (company_name) RETURNING id INTO new_company_id;
  INSERT INTO profiles (id, company_id, name, role)
  VALUES (auth.uid(), new_company_id, user_name, 'admin');
  RETURN new_company_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.register_company(TEXT, TEXT) TO authenticated;

-- profiles: 同一会社メンバー
CREATE POLICY "profiles_select_company" ON profiles
  FOR SELECT USING (company_id = public.get_my_company_id());

CREATE POLICY "profiles_insert_own" ON profiles
  FOR INSERT WITH CHECK (id = auth.uid());

CREATE POLICY "profiles_update_own" ON profiles
  FOR UPDATE USING (id = auth.uid());

-- projects
CREATE POLICY "projects_select" ON projects
  FOR SELECT USING (company_id = public.get_my_company_id());

CREATE POLICY "projects_insert" ON projects
  FOR INSERT WITH CHECK (company_id = public.get_my_company_id());

CREATE POLICY "projects_update" ON projects
  FOR UPDATE USING (company_id = public.get_my_company_id());

CREATE POLICY "projects_delete" ON projects
  FOR DELETE USING (company_id = public.get_my_company_id());

-- site_photos (project 経由で会社チェック)
CREATE POLICY "photos_select" ON site_photos
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM projects p
      WHERE p.id = site_photos.project_id
        AND p.company_id = public.get_my_company_id()
    )
  );

CREATE POLICY "photos_insert" ON site_photos
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM projects p
      WHERE p.id = site_photos.project_id
        AND p.company_id = public.get_my_company_id()
    )
  );

CREATE POLICY "photos_update" ON site_photos
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM projects p
      WHERE p.id = site_photos.project_id
        AND p.company_id = public.get_my_company_id()
    )
  );

CREATE POLICY "photos_delete" ON site_photos
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM projects p
      WHERE p.id = site_photos.project_id
        AND p.company_id = public.get_my_company_id()
    )
  );

-- daily_reports
CREATE POLICY "reports_select" ON daily_reports
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM projects p
      WHERE p.id = daily_reports.project_id
        AND p.company_id = public.get_my_company_id()
    )
  );

CREATE POLICY "reports_insert" ON daily_reports
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM projects p
      WHERE p.id = daily_reports.project_id
        AND p.company_id = public.get_my_company_id()
    )
  );

CREATE POLICY "reports_update" ON daily_reports
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM projects p
      WHERE p.id = daily_reports.project_id
        AND p.company_id = public.get_my_company_id()
    )
  );

CREATE POLICY "reports_delete" ON daily_reports
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM projects p
      WHERE p.id = daily_reports.project_id
        AND p.company_id = public.get_my_company_id()
    )
  );

-- Storage: site-photos バケット（Dashboard で public または signed URL）
-- INSERT INTO storage.buckets (id, name, public) VALUES ('site-photos', 'site-photos', true);

-- ストレージポリシー例（バケット作成後に実行）
-- CREATE POLICY "site_photos_upload" ON storage.objects
--   FOR INSERT WITH CHECK (
--     bucket_id = 'site-photos'
--     AND auth.role() = 'authenticated'
--   );
-- CREATE POLICY "site_photos_read" ON storage.objects
--   FOR SELECT USING (bucket_id = 'site-photos');
