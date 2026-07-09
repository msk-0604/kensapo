# Kensapo — 現場管理AI SaaS（MVP）

建設会社向けの現場写真・日報・AI報告書作成 Web アプリです。

## 技術スタック

- Next.js 16 (App Router) + TypeScript + Tailwind CSS
- Supabase（Auth / Database / Storage）
- OpenAI API（報告書生成）
- Vercel デプロイ想定

## セットアップ

### 1. 依存関係

```bash
npm install
```

### 2. 環境変数

`.env.example` を `.env.local` にコピーして値を設定します。

```bash
cp .env.example .env.local
```

### 3. Supabase

**新規・未設定の場合（推奨）：** SQL Editor で次の **1ファイルだけ** 実行

```
supabase/RUN_THIS_IN_SUPABASE.sql
```

またはアプリの **/setup** ページから SQL をコピーして実行。

**ゼロから全部入れる場合**は順に実行：

1. `supabase/migrations/001_initial_schema.sql`
2. `supabase/migrations/002_security_hardening.sql`
3. `supabase/RUN_THIS_IN_SUPABASE.sql`（003+004 まとめ）
4. `supabase/storage.sql`（写真アップロード用）

### 4. 起動

```bash
npm run dev
```

http://localhost:3000 でアクセス。新規登録で会社＋プロフィールが自動作成されます。

## 画面構成

| パス | 画面 |
|------|------|
| `/login` | ログイン・新規登録 |
| `/dashboard` | ホーム（今日のサマリー・4大ボタン） |
| `/sites` | 現場一覧 |
| `/sites/new` | 現場登録 |
| `/sites/[id]` | 現場詳細 |
| `/sites/[id]/photos` | 写真アップロード |
| `/sites/[id]/reports` | 日報一覧 |
| `/sites/[id]/reports/new` | 日報作成 |
| `/sites/[id]/reports/[id]/generate` | AI報告書生成・編集 |
| `/sites/[id]/reports/[id]/pdf` | 印刷・PDF |
| `/workers` | 作業員一覧 |
| `/workers/new` | 作業員登録 |
| `/schedule` | 今日の行動予定（開始・終了ボタン） |
| `/schedule/new` | 予定追加 |
| `/sites/[id]/progress` | 工事進行チェックリスト |
| `/ai-reports` | AI報告書一覧 |
| `/settings` | 設定 |

旧 `/projects` は `/sites` へ自動リダイレクトされます。詳細は `docs/STARKWORKS_DESIGN.md` を参照。

## API

`POST /api/generate-report` — 認証必須。`{ projectId, reportId }` のみ受け取り、DB から日報を取得して生成（クライアント送信データは信頼しない）

## セキュリティ

| 層 | 対策 |
|----|------|
| DB | RLS による会社単位の完全分離 |
| Storage | 非公開バケット + パス `{company_id}/{project_id}/...` + RLS |
| API | 認証必須・レート制限（10回/分）・サーバー側データ取得 |
| アプリ | 入力長制限・ファイル形式/サイズ検証・セキュリティヘッダー |
| AI | プロンプトサニタイズ・トークン上限 |

本番運用時の追加推奨:

- Supabase で MFA・パスワードポリシー強化
- Vercel / Cloudflare で WAF・DDoS 対策
- 監査ログ（Supabase Audit / 外部 SIEM）
- `OPENAI_API_KEY` はサーバーのみ（クライアントに露出しない）

## Vercel デプロイ（最初から）

### 1. GitHub に push

```bash
git push origin main
```

### 2. Vercel で新規プロジェクト作成

1. [vercel.com/new](https://vercel.com/new) を開く
2. **Import Git Repository** → `msk-0604/kensapo` を選択
3. Framework Preset: **Next.js**（自動検出）
4. **Deploy はまだ押さない** → 先に環境変数を設定

### 3. 環境変数を設定（必須）

**Settings → Environment Variables** で以下を追加。  
**Production / Preview / Development すべて**にチェック。

| 名前 | 値 |
|------|-----|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase → Project Settings → API → Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase → anon public キー |
| `OPENAI_API_KEY` | OpenAI API キー |

### 4. デプロイ

**Deploy** を押す。ビルドが **Ready** になれば完了。

### 5. Supabase 側の設定

Supabase → Authentication → URL Configuration に Vercel の URL を追加:

- Site URL: `https://あなたのプロジェクト.vercel.app`
- Redirect URLs: `https://あなたのプロジェクト.vercel.app/auth/callback`

### トラブルシューティング

| 症状 | 対処 |
|------|------|
| `DEPLOYMENT_NOT_FOUND` | 古い URL を開いている。Vercel の Deployments から最新 URL を確認 |
| 環境変数エラー | Vercel に3つすべて設定し、**Redeploy** |
| ビルド失敗 | Vercel の Build Logs を確認 |

## ライセンス

Private / Demo MVP
