const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function isValidUuid(value: string): boolean {
  return UUID_RE.test(value);
}

export function clampString(value: unknown, maxLen: number): string {
  if (typeof value !== "string") return "";
  return value.trim().slice(0, maxLen);
}

export function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) && value.length <= 254;
}

export function isStrongEnoughPassword(value: string): boolean {
  return value.length >= 8 && value.length <= 128;
}

export const LIMITS = {
  companyName: 200,
  userName: 100,
  projectName: 200,
  address: 500,
  managerName: 100,
  memo: 5000,
  comment: 2000,
  reportField: 10000,
  photoComment: 2000,
} as const;
