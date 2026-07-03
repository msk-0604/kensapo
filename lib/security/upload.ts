export const MAX_PHOTO_BYTES = 10 * 1024 * 1024; // 10MB

const ALLOWED_MIME = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/heic",
  "image/heif",
]);

const EXT_BY_MIME: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/heic": "heic",
  "image/heif": "heif",
};

export function validatePhotoFile(file: File): { ok: true; ext: string } | { ok: false; error: string } {
  if (!ALLOWED_MIME.has(file.type)) {
    return { ok: false, error: "\u8a31\u53ef\u3055\u308c\u305f\u753b\u50cf\u5f62\u5f0f\u3067\u306f\u3042\u308a\u307e\u305b\u3093\uFF08JPEG/PNG/WebP\uFF09" };
  }
  if (file.size > MAX_PHOTO_BYTES) {
    return { ok: false, error: "\u30d5\u30a1\u30a4\u30eb\u30b5\u30a4\u30ba\u306f10MB\u4ee5\u4e0b\u306b\u3057\u3066\u304f\u3060\u3055\u3044" };
  }
  if (file.size === 0) {
    return { ok: false, error: "\u7a7a\u306e\u30d5\u30a1\u30a4\u30eb\u306f\u30a2\u30c3\u30d7\u30ed\u30fc\u30c9\u3067\u304d\u307e\u305b\u3093" };
  }
  return { ok: true, ext: EXT_BY_MIME[file.type] ?? "jpg" };
}

export function buildStoragePath(
  companyId: string,
  projectId: string,
  ext: string
): string {
  return `${companyId}/${projectId}/${crypto.randomUUID()}.${ext}`;
}
