/** 旧環境変数ヘルパー（自動生成機能廃止のため未使用） */
export function getOptionalServerEnv(name: string): string | null {
  const value = process.env[name]?.trim();
  return value || null;
}
