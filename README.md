# KenSapo — 建設業向け 現場スケジュール管理システム

建設会社向けの現場予定・写真・日報管理 Web アプリです。

## 技術スタック

- Next.js 16 (App Router) + TypeScript + Tailwind CSS
- Supabase（Auth / Database / Storage）
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

VAPID鍵は次で生成できます。

```bash
npx web-push generate-vapid-keys
```

本番では同じ値を Vercel の Environment Variables（Production）へ登録します。

### 3. Supabase

**新規環境（推奨）:** SQL Editor で次を1回実行します。

```
supabase/setup.sql
```

またはアプリの `/setup` ページから SQL をコピーして実行します。

`setup.sql` には通知用テーブルも含まれます。

**既存環境へ通知だけ追加する場合:**

```
supabase/RUN_PUSH_NOTIFICATIONS.sql
```

`supabase/RUN_THIS_IN_SUPABASE.sql` は `setup.sql` への案内用ポインタです。

### 4. 起動

```bash
npm run dev
```

## 主な画面

| パス | 内容 |
|------|------|
| `/login` | ログイン・新規登録 |
| `/dashboard` | ホーム |
| `/schedule` | 今日の予定 |
| `/sites` | 現場一覧 |
| `/sites/[id]` | 現場詳細 |
| `/sites/[id]/photos` | 写真 |
| `/sites/[id]/reports` | 日報 |
| `/sites/[id]/progress` | 工事進行 |
| `/workers` | 作業員 |
| `/settings` | 設定・通知 |

## 環境変数

| キー | 用途 |
|------|------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon key |
| `NEXT_PUBLIC_VAPID_PUBLIC_KEY` | Web Push（公開鍵） |
| `VAPID_PRIVATE_KEY` | Web Push（秘密鍵） |
| `VAPID_SUBJECT` | Web Push subject |

## 納品資料

`docs/` に次を用意しています。

- 取扱説明書
- システム仕様書
- 導入手順書
- 納品チェックリスト
- 障害・バックアップ対応手順
- サービス利用申込書ひな形
- 問い合わせ先案内
- 通知・VAPID設定手順
- 納品資料一覧

## ライセンス

Private
