import Link from "next/link";

const SCREENS = [
  {
    href: "/preview/schedule",
    title: "1. 予定一覧（全画面）",
    note: "月カレンダー＋その日の予定カード",
  },
  {
    href: "/preview/schedule/detail",
    title: "2. 予定の詳細（開始・終了）",
    note: "予定をタップしたあとの画面相当",
  },
  {
    href: "/preview/schedule/new",
    title: "3. 予定の登録",
    note: "新しい予定を追加するフォーム",
  },
  {
    href: "/preview/schedule/edit",
    title: "4. 予定の編集",
    note: "内容を変更するフォーム",
  },
] as const;

const CHATGPT_PROMPT = `あなたは建設業向け現場アプリ「KenSapo」のUIレビュアーです。
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

出力は日本語で、画面ごとに箇条書き。最後に「今すぐ直す3つ」を挙げてください。`;

export default function PreviewIndexPage() {
  return (
    <div className="space-y-8">
      <section>
        <h1 className="text-[1.875rem] font-bold text-navy-950">
          予定画面レビュー用
        </h1>
        <p className="mt-2 text-lg text-gray-600">
          ChatGPTには静的HTMLのURLを渡してください（Nextの /preview
          は開けないことが多いです）。
        </p>
        <a
          href="/review/kensapo-schedule.html"
          className="mt-4 block rounded-2xl border-2 border-amber-500 bg-amber-50 px-5 py-5 text-xl font-bold text-amber-950"
        >
          ChatGPT用：静的レビューHTMLを開く →
        </a>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-bold text-gray-800">自分用の画面プレビュー</h2>
        {SCREENS.map((s) => (
          <Link
            key={s.href}
            href={s.href}
            className="block rounded-2xl border-2 border-navy-900 bg-navy-900 px-5 py-5 text-white"
          >
            <p className="text-xl font-bold">{s.title}</p>
            <p className="mt-1 text-base text-white/85">{s.note}</p>
          </Link>
        ))}
      </section>

      <section className="rounded-2xl border-2 border-gray-300 bg-white p-5">
        <h2 className="text-xl font-bold text-navy-950">
          ChatGPTに貼る文（コピー用）
        </h2>
        <p className="mt-2 text-base text-gray-600">
          デプロイ後は本番URLで開きます。ローカルなら
          <code className="mx-1 rounded bg-gray-100 px-1">localhost:3000</code>
          に読み替えてください。
        </p>
        <pre className="mt-4 max-h-[28rem] overflow-auto whitespace-pre-wrap rounded-xl bg-gray-900 p-4 text-sm leading-relaxed text-gray-100">
          {CHATGPT_PROMPT}
        </pre>
      </section>
    </div>
  );
}
