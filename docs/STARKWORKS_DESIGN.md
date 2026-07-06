# StarkWorks / Kensapo 設計メモ

## プロジェクト構成

```
app/
  login/              # ログイン・新規登録
  register/           # → /login へリダイレクト
  setup/              # Supabase 未設定時
  (app)/
    dashboard/        # ホーム
    sites/            # 現場（DB: projects）
    workers/          # 作業員
    schedule/         # 作業員予定
    settings/         # 設定
  api/generate-report/

components/
  layout/AppShell.tsx
  projects/ProjectForm.tsx
  photos/PhotoUpload.tsx
  reports/DailyReportForm.tsx, GenerateReport.tsx
  workers/WorkerForm.tsx
  schedules/ScheduleForm.tsx
  ui/                 # 共通UI（大きめボタン・戻る）

lib/
  projects.ts, sites.ts, workers.ts, schedules.ts, dashboard.ts
  supabase/, auth.ts, security/

supabase/migrations/
  001_initial_schema.sql
  002_security_hardening.sql
  003_starkworks_features.sql   # ★新規：作業員・予定・拡張カラム
```

## DB 設計（Supabase）

| 仕様名 | 実テーブル | 備考 |
|--------|-----------|------|
| companies | companies | 会社 |
| profiles | profiles | ユーザー（admin/member） |
| sites | **projects** | 現場。RLS で company_id 分離 |
| photos | **site_photos** | title, uploaded_by 追加（003） |
| daily_reports | daily_reports | created_by, status 追加（003） |
| workers | **workers** | 003 で新規 |
| schedules | **schedules** | 003 で新規 |
| ai_reports | daily_reports.**ai_report** | 別テーブルではなく日報に統合 |

## 画面設計

| パス | 目的 |
|------|------|
| /login | ログイン・新規登録 |
| /dashboard | 今日のサマリー + 4大ボタン |
| /sites | 現場一覧 |
| /sites/new | 現場登録 |
| /sites/[id] | 現場詳細・操作入口 |
| /sites/[id]/photos | 写真追加 |
| /sites/[id]/reports | 日報一覧 |
| /sites/[id]/reports/new | 日報作成 |
| /sites/[id]/reports/[id]/generate | AI報告書・編集 |
| /workers | 作業員一覧 |
| /workers/new | 作業員登録 |
| /schedule | 今日の予定 + 予定登録 |

旧 `/projects` は `/sites` へ永久リダイレクト。

## UI 方針

- 下部ナビ: ホーム / 現場 / 予定 / 設定
- ボタンは日本語・大きめ・アイコンのみ禁止
- 戻るボタンを各画面に配置
- 1画面1目的

## セットアップ

Supabase SQL Editor で **003_starkworks_features.sql** を実行してください。

### 顔認証・指紋ログイン（Passkey）

1. Supabase Dashboard → **Authentication → Passkeys** を有効化
2. Relying Party ID に本番ドメイン（例：`kensapo.vercel.app`）を設定
3. ユーザーは初回メールログイン後、**設定**から「この端末で顔認証を登録」
4. 次回からログイン画面の「顔認証・指紋でログイン」が使える（iPhone Face ID / Android 指紋）
