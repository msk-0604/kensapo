export default function SetupPage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-lg flex-col justify-center px-4 py-12">
      <h1 className="text-2xl font-bold text-navy-950">
        {"\u74b0\u5883\u5909\u6570\u306e\u8a2d\u5b9a"}
      </h1>
      <p className="mt-3 text-sm leading-relaxed text-gray-600">
        {"Supabase \u306e\u63a5\u7d9a\u60c5\u5831\u304c\u307e\u3060\u8a2d\u5b9a\u3055\u308c\u3066\u3044\u307e\u305b\u3093\u3002"}
        <code className="mx-1 rounded bg-gray-100 px-1">.env.local</code>
        {"\u306b\u30ad\u30fc\u3092\u8a18\u5165\u3057\u3066\u304f\u3060\u3055\u3044\u3002"}
      </p>

      <ol className="mt-6 list-decimal space-y-3 pl-5 text-sm text-gray-700">
        <li>
          <a
            href="https://supabase.com/dashboard"
            className="text-navy-900 underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            Supabase Dashboard
          </a>
          {" \u3092\u958b\u304f"}
        </li>
        <li>
          Project Settings → API
          <ul className="mt-1 list-disc pl-5 text-gray-600">
            <li>
              <strong>Project URL</strong> → NEXT_PUBLIC_SUPABASE_URL
            </li>
            <li>
              <strong>anon public</strong> → NEXT_PUBLIC_SUPABASE_ANON_KEY
            </li>
          </ul>
        </li>
        <li>
          <code>c:\dev\kensapo\.env.local</code>
          {" \u3092\u7de8\u96c6"}
        </li>
        <li>
          {"\u958b\u767a\u30b5\u30fc\u30d0\u30fc\u3092\u505c\u6b62\u3057\u3066 "}
          <code>npm run dev</code>
          {" \u3092\u518d\u8d77\u52d5"}
        </li>
        <li>
          {"SQL Editor \u3067 001 / 002 / storage.sql \u3092\u5b9f\u884c"}
        </li>
      </ol>

      <p className="mt-8 text-xs text-gray-400">
        {"\u8a2d\u5b9a\u5f8c\u306f "}
        <a href="/login" className="text-navy-900 underline">
          /login
        </a>
        {" \u304b\u3089\u30a2\u30af\u30bb\u30b9\u3067\u304d\u307e\u3059\u3002"}
      </p>
    </main>
  );
}
