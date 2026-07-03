-- 非公開バケット推奨（会社ID/現場ID でパス分離）
-- 既存の public バケットがある場合は Dashboard で private に変更後、
-- 古いポリシーを削除してから本SQLを実行

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

-- 既存ポリシー削除（再実行用）
DROP POLICY IF EXISTS "site_photos_select" ON storage.objects;
DROP POLICY IF EXISTS "site_photos_insert" ON storage.objects;
DROP POLICY IF EXISTS "site_photos_delete" ON storage.objects;
DROP POLICY IF EXISTS "site_photos_update" ON storage.objects;

-- パス形式: {company_id}/{project_id}/{filename}
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
