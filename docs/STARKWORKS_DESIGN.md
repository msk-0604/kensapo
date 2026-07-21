# KenSapo 開発者向け設計メモ

## 構成

```text
app/
  login/                 ログイン・新規登録
  setup/                 Supabaseセットアップ
  (app)/
    dashboard/           ホーム
    schedule/            作業予定
    sites/               現場
    workers/             作業員
    settings/            設定
  api/
    health/db/           DB疎通
    push/                通知購読・送信

components/
  layout/                共通レイアウト
  projects/              現場フォーム
  schedules/             予定
  workers/               作業員
  photos/                写真
  reports/               日報
  progress/              工事進行
  settings/              通知設定
  ui/                    共通UI

lib/
  supabase/              Supabaseクライアント
  push/                  Web Push
  security/              認証・入力検証
```

## データ

- `companies`: 会社
- `profiles`: ユーザー
- `projects`: 現場（画面上のsites）
- `workers`: 作業員
- `schedules`: 作業予定・実績
- `site_photos`: 写真メタデータ
- `daily_reports`: 日報
- `project_progress_items`: 工事進行
- `push_subscriptions`: 通知購読

会社単位の分離はSupabase Row Level Securityで行います。

## URL方針

画面上の現場URLは `/sites` を使用します。旧 `/projects` 配下は互換性のため残っている箇所がありますが、新規導線では使用しません。

## UI方針

- 60代の利用者を想定した大きな文字とボタン
- ホーム、予定、現場、設定の下部メニュー
- アイコンだけの操作を避ける
- 具体的な日本語ラベル
- モバイルファースト

## 通知

- `public/sw.js` がService Worker
- `/api/push/subscribe` が購読登録・解除
- `/api/push/notify` が同一会社の別ユーザーへ送信
- VAPID秘密鍵はVercel環境変数で管理
- 購読情報は `push_subscriptions` に保存

## セットアップ

新規DBは `supabase/setup.sql` を実行します。

既存DBへ通知だけ追加する場合は `supabase/RUN_PUSH_NOTIFICATIONS.sql` を実行します。

## 品質確認

```bash
npm run lint
npm run build
```

本番確認:

- `/login`
- `/api/health/db`
- `/sw.js`
- `/api/push/subscribe`
