-- Web Push 通知用の購読テーブル
-- Supabase SQL Editor で実行してください

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

CREATE INDEX IF NOT EXISTS idx_push_subscriptions_company_id
  ON push_subscriptions(company_id);
CREATE INDEX IF NOT EXISTS idx_push_subscriptions_user_id
  ON push_subscriptions(user_id);
