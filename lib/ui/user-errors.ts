/** ユーザー向けの短い日本語エラーに寄せる */

export function withTimeout<T>(
  promise: PromiseLike<T>,
  ms: number,
  message = "通信がタイムアウトしました。電波を確認してもう一度お試しください。"
): Promise<T> {
  return Promise.race([
    Promise.resolve(promise),
    new Promise<T>((_, reject) => {
      setTimeout(() => reject(new Error(message)), ms);
    }),
  ]);
}

export function toAuthUserMessage(err: unknown): string {
  const raw =
    err instanceof Error
      ? err.message
      : typeof err === "object" &&
          err !== null &&
          "message" in err &&
          typeof (err as { message: unknown }).message === "string"
        ? (err as { message: string }).message
        : "エラーが発生しました";

  const m = raw.toLowerCase();
  if (m.includes("invalid login credentials")) {
    return "メールアドレスまたはパスワードが違います。もう一度確認してください。";
  }
  if (m.includes("email not confirmed")) {
    return "確認メールのリンクを開いてから、ログインしてください。";
  }
  if (m.includes("user already registered")) {
    return "このメールアドレスはすでに登録済みです。ログインタブからログインしてください。";
  }
  if (m.includes("too many requests") || m.includes("rate limit")) {
    return "しばらく待ってから、もう一度お試しください。";
  }
  if (m.includes("network") || m.includes("fetch")) {
    return "通信に失敗しました。電波を確認してもう一度お試しください。";
  }
  if (m.includes("タイムアウト") || m.includes("timeout")) {
    return raw.includes("タイムアウト")
      ? raw
      : "通信がタイムアウトしました。電波を確認してもう一度お試しください。";
  }
  // すでに日本語の自前メッセージはそのまま
  if (/[ぁ-んァ-ン一-龥]/.test(raw)) return raw;
  return "ログインに失敗しました。入力内容を確認してもう一度お試しください。";
}

export function toSaveUserMessage(err: unknown, fallback = "保存に失敗しました"): string {
  const raw =
    err instanceof Error
      ? err.message
      : typeof err === "object" &&
          err !== null &&
          "message" in err &&
          typeof (err as { message: unknown }).message === "string"
        ? (err as { message: string }).message
        : fallback;

  const m = raw.toLowerCase();
  if (m.includes("タイムアウト") || m.includes("timeout")) {
    return "保存がタイムアウトしました。通信状況を確認して、もう一度お試しください。";
  }
  if (
    m.includes("network") ||
    m.includes("fetch") ||
    m.includes("failed to fetch")
  ) {
    return "通信に失敗しました。電波のよい場所でもう一度お試しください。";
  }
  if (m.includes("row-level security") || m.includes("rls")) {
    return "保存する権限がありません。ログインし直してもう一度お試しください。";
  }
  if (m.includes("duplicate") || m.includes("unique")) {
    return "同じ内容がすでに登録されています。入力を確認してください。";
  }
  if (/[ぁ-んァ-ン一-龥]/.test(raw)) return raw;
  return `${fallback}。通信を確認してもう一度お試しください。`;
}
