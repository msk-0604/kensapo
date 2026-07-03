/** プロンプトインジェクション緩和（完全防御ではない） */
export function sanitizeForPrompt(text: string, maxLen = 10000): string {
  return text
    .trim()
    .slice(0, maxLen)
    .replace(/[\x00-\x08\x0b\x0c\x0e-\x1f]/g, "")
    .replace(/```/g, "'''");
}

export function sanitizeFileName(name: string): string {
  return name.replace(/[^a-zA-Z0-9._-]/g, "_").slice(0, 120);
}
