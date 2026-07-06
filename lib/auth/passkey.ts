export function isPasskeySupported(): boolean {
  return (
    typeof window !== "undefined" &&
    typeof window.PublicKeyCredential !== "undefined"
  );
}

export function getPasskeyErrorMessage(error: unknown): string {
  const message =
    error instanceof Error ? error.message : "顔認証ログインに失敗しました";

  if (message.includes("passkey_disabled")) {
    return "顔認証が有効になっていません。Supabaseの管理画面でPasskeyを有効にしてください。";
  }
  if (message.includes("NotAllowedError") || message.includes("cancelled")) {
    return "顔認証がキャンセルされました。";
  }
  if (message.includes("webauthn_credential_not_found")) {
    return "登録済みの顔認証がありません。先にメールでログインし、設定から登録してください。";
  }
  if (message.includes("experimental")) {
    return "顔認証機能の準備ができていません。アプリを更新してください。";
  }

  return message;
}
