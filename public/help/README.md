# KenSapo ヘルプメディア

このフォルダにマニュアル用の画像・GIF・動画を置きます。

例:

- `dashboard.png`
- `project-list.png`
- `worker-add.gif`
- `notify-demo.mp4`

`public/help/data/manual.json` では次のどちらかで指定します。

- `images`: `["/help/dashboard.png"]`（従来どおり）
- `media`: `[{ "src": "/help/demo.mp4", "kind": "video", "caption": "操作例" }]`

対応拡張子: `.png` / `.jpg` / `.webp` / `.gif` / `.mp4` / `.webm`

無い・読み込み失敗のときは「画像準備中」と表示されます。

データファイル:

- `data/manual.json`
- `data/faq.json`
- `data/videos.json`
- `data/contact.json`
- `data/changelog.json`
