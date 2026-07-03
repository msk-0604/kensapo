-- セキュリティ強化（既存DBに追記実行）
-- 001 適用済みの環境で実行してください

-- テキスト長制限
ALTER TABLE companies
  ADD CONSTRAINT companies_name_len CHECK (char_length(name) BETWEEN 1 AND 200);

ALTER TABLE profiles
  ADD CONSTRAINT profiles_name_len CHECK (char_length(name) BETWEEN 1 AND 100),
  ADD CONSTRAINT profiles_role_check CHECK (role IN ('admin', 'member'));

ALTER TABLE projects
  ADD CONSTRAINT projects_name_len CHECK (char_length(name) BETWEEN 1 AND 200);

-- 写真: ストレージパスを保持（非公開バケット + 署名URL用）
ALTER TABLE site_photos
  ADD COLUMN IF NOT EXISTS storage_path TEXT;

-- プロジェクト所有確認
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

-- ストレージパス先頭が自社IDか
CREATE OR REPLACE FUNCTION public.storage_belongs_to_my_company(object_name TEXT)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT split_part(object_name, '/', 1)::uuid = public.get_my_company_id()
$$;

-- register_company 入力検証強化
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

-- プロフィール直挿入を禁止（RPC経由のみ）
DROP POLICY IF EXISTS "profiles_insert_own" ON profiles;

-- プロフィール更新: company_id 改ざん防止
DROP POLICY IF EXISTS "profiles_update_own" ON profiles;
CREATE POLICY "profiles_update_own" ON profiles
  FOR UPDATE
  USING (id = auth.uid())
  WITH CHECK (
    id = auth.uid()
    AND company_id = public.get_my_company_id()
  );

-- projects: INSERT 時 company_id 改ざん防止（再定義）
DROP POLICY IF EXISTS "projects_insert" ON projects;
CREATE POLICY "projects_insert" ON projects
  FOR INSERT
  WITH CHECK (
    company_id = public.get_my_company_id()
    AND company_id IS NOT NULL
  );

-- インデックス（RLS / 検索性能）
CREATE INDEX IF NOT EXISTS idx_profiles_company_id ON profiles(company_id);
CREATE INDEX IF NOT EXISTS idx_projects_company_id ON projects(company_id);
CREATE INDEX IF NOT EXISTS idx_site_photos_project_id ON site_photos(project_id);
CREATE INDEX IF NOT EXISTS idx_daily_reports_project_id ON daily_reports(project_id);
