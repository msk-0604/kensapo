export function getOpenAIKey(): string | null {
  const value = process.env.OPENAI_API_KEY?.trim();
  return value || null;
}

export function requireOpenAIKey(): string {
  const key = getOpenAIKey();
  if (!key) {
    throw new Error(
      "OPENAI_API_KEY が未設定です。ローカルでは .env.local に、Vercel では Environment Variables に設定してください。"
    );
  }
  return key;
}
