# ChatGPTで予定画面をレビューする方法

本番の `/schedule` はログイン必須のため、ChatGPTのブラウズではログイン画面に飛ばされます。  
そのため **ログイン不要のプレビュー** を用意しています。

## 公開URL（デプロイ後）

| 画面 | URL |
|------|-----|
| 目次 | https://kensapo.vercel.app/preview |
| 予定一覧 | https://kensapo.vercel.app/preview/schedule |
| 予定詳細 | https://kensapo.vercel.app/preview/schedule/detail |
| 予定登録 | https://kensapo.vercel.app/preview/schedule/new |
| 予定編集 | https://kensapo.vercel.app/preview/schedule/edit |

ローカル確認: `http://localhost:3000/preview`

## ChatGPTに貼る文

```
あなたは建設業向け現場アプリ「KenSapo」のUIレビュアーです。
対象ユーザーは60代の現場監督・作業員です。文字とボタンは大きめです。

次の公開プレビュー（ログイン不要・ダミーデータ）を開き、デザイン・操作性・現場目線・納品前の修正点を具体的に指摘してください。

【スマホ幅を想定】
ブラウザ幅を約390pxにするか、開発者ツールのモバイル表示で見てください。

【見る画面】
1. 予定一覧: https://kensapo.vercel.app/preview/schedule
2. 予定詳細（開始・終了）: https://kensapo.vercel.app/preview/schedule/detail
3. 予定登録: https://kensapo.vercel.app/preview/schedule/new
4. 予定編集: https://kensapo.vercel.app/preview/schedule/edit
5. 目次: https://kensapo.vercel.app/preview

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
