# ChatGPTで予定画面をレビューする方法

本番の `/schedule` はログイン必須のため、ChatGPTのブラウズではログイン画面に飛ばされます。  
そのため **ログイン不要のプレビュー** を用意しています。

## いちばん確実（ChatGPT向け）

ChatGPTのブラウズは Next.js の `/preview` を開けないことが多いです。  
**静的HTML（1枚に4画面）を渡してください。**

https://kensapo.vercel.app/review/kensapo-schedule.html

## 予備URL（自分のブラウザ用）

| 画面 | URL |
|------|-----|
| 静的レビュー（推奨） | https://kensapo.vercel.app/review/kensapo-schedule.html |
| 目次（Next） | https://kensapo.vercel.app/preview |
| 予定一覧 | https://kensapo.vercel.app/preview/schedule |
| 予定詳細 | https://kensapo.vercel.app/preview/schedule/detail |
| 予定登録 | https://kensapo.vercel.app/preview/schedule/new |
| 予定編集 | https://kensapo.vercel.app/preview/schedule/edit |

## ChatGPTに貼る文

```
あなたは建設業向け現場アプリ「KenSapo」のUIレビュアーです。
対象ユーザーは60代の現場監督・作業員です。文字とボタンは大きめです。

次の静的HTML（ログイン不要・ダミー・スマホ幅想定）を開いてレビューしてください。
https://kensapo.vercel.app/review/kensapo-schedule.html

この1ページに次の4画面があります。
1. 予定一覧（カレンダー＋カード）
2. 予定詳細（開始・終了）
3. 予定登録
4. 予定編集

【レビュー観点】
- 一目で何をする画面か分かるか
- 親指で押しやすいか（ボタンサイズ・余白）
- 作業員名が目立つか
- 開始／終了と登録の迷いポイント
- カレンダーの見やすさ
- 60代でも迷わないか
- 納品前に直すべき優先度（高／中／低）

出力は日本語で、画面ごとに箇条書き。最後に「今すぐ直す3つ」を挙げてください。
```

## 注意

- プレビューは見た目用です。保存・通知・ログインは動きません。
- 検索エンジンには載せない設定（`noindex`）です。
- 本番レビュー後は、必要なら `/preview` を非公開にできます。
