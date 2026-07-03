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

1. [Supabase](https://supabase.com) でプロジェクト作成
2. SQL Editor で `supabase/migrations/001_initial_schema.sql` を実行
3. `supabase/migrations/002_security_hardening.sql` を実行
4. `supabase/storage.sql` を実行（**非公開バケット** `site-photos`）
5. Authentication → Providers → Email を有効化
6. 開発時は Email confirmations を OFF 推奨（即ログイン可能）
7. Auth → Settings でパスワード最小長 8 文字を推奨

### 4. 起動

```bash
npm run dev
```

http://localhost:3000 でアクセス。新規登録で会社＋プロフィールが自動作成されます。

## 画面構成

| パス | 画面 |
|------|------|
| `/login` | ログイン・新規登録 |
| `/dashboard` | ダッシュボード |
| `/projects` | 現場一覧 |
| `/projects/new` | 現場登録 |
| `/projects/[id]` | 現場詳細 |
| `/projects/[id]/photos` | 写真アップロード |
| `/projects/[id]/reports/new` | 日報作成 |
| `/projects/[id]/reports/[id]/generate` | AI報告書生成 |
| `/projects/[id]/reports/[id]/pdf` | 印刷・PDF |
| `/settings` | 設定 |

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

## Vercel デプロイ

環境変数 3 つを Vercel に設定し、Deploy してください。

## ライセンス

Private / Demo MVP
