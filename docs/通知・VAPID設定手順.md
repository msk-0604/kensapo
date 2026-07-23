# KenSapo 通知・VAPID設定手順

提供者向けの作業手順です。

## 1. VAPID鍵を作る

```bash
npx web-push generate-vapid-keys
```

出力された Public Key と Private Key を控えます。

## 2. ローカルへ設定する

`.env.local` に次を入れます。

```env
NEXT_PUBLIC_VAPID_PUBLIC_KEY=公開鍵
VAPID_PRIVATE_KEY=秘密鍵
VAPID_SUBJECT=mailto:あなたのメールアドレス
```

## 3. Vercelへ設定する

Vercel Project Settings → Environment Variables に次を追加します。

- `NEXT_PUBLIC_VAPID_PUBLIC_KEY`（Production / Preview）
- `VAPID_PRIVATE_KEY`（Production / Preview）
- `VAPID_SUBJECT`（Production / Preview）

設定後は再デプロイします。

## 4. データベース

- 新規環境: `supabase/setup.sql` を実行
- 既存環境で通知テーブルだけ無い場合: `supabase/RUN_PUSH_NOTIFICATIONS.sql` を実行

## 5. 動作確認

1. `/api/push/subscribe` が `configured: true` を返すこと
2. `/sw.js` が開けること
3. 設定画面で「通知をオンにする」ができること
4. 別アカウント操作でロック画面へ通知が届くこと
