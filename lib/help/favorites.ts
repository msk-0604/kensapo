const FAVORITES_KEY = "kensapo-help-favorites-v1";

export function loadHelpFavorites(): string[] {
  try {
    const raw = window.localStorage.getItem(FAVORITES_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((x): x is string => typeof x === "string");
  } catch {
    return [];
  }
}

export function saveHelpFavorites(ids: string[]): void {
  try {
    window.localStorage.setItem(FAVORITES_KEY, JSON.stringify(ids));
  } catch {
    // ignore
  }
}

export function toggleHelpFavorite(id: string): string[] {
  const current = loadHelpFavorites();
  const next = current.includes(id)
    ? current.filter((x) => x !== id)
    : [...current, id];
  saveHelpFavorites(next);
  return next;
}

export function isHelpFavorite(id: string): boolean {
  return loadHelpFavorites().includes(id);
}
