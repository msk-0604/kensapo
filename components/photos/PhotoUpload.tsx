"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";
import { STORAGE_BUCKET } from "@/lib/constants";
import { LIMITS } from "@/lib/security/validation";
import {
  buildStoragePath,
  validatePhotoFile,
} from "@/lib/security/upload";
import { Button } from "@/components/ui/Button";
import { Input, Textarea } from "@/components/ui/Input";
import { EmptyState } from "@/components/ui/EmptyState";
import { LoadingScreen } from "@/components/ui/Loading";
import { todayISO } from "@/lib/utils";
import type { SitePhoto } from "@/types/database";

const SIGNED_URL_TTL = 3600;

type PhotoWithUrl = SitePhoto & { displayUrl: string };

export function PhotoUpload({
  projectId,
  companyId,
}: {
  projectId: string;
  companyId: string;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [photos, setPhotos] = useState<PhotoWithUrl[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [comment, setComment] = useState("");
  const [takenAt, setTakenAt] = useState(todayISO());
  const [error, setError] = useState("");

  const resolveDisplayUrl = useCallback(
    async (photo: SitePhoto): Promise<string> => {
      const supabase = createClient();
      const path = photo.storage_path ?? photo.image_url;
      if (path.startsWith("http")) return path;

      const { data, error: signError } = await supabase.storage
        .from(STORAGE_BUCKET)
        .createSignedUrl(path, SIGNED_URL_TTL);

      if (signError || !data?.signedUrl) return "";
      return data.signedUrl;
    },
    []
  );

  const loadPhotos = useCallback(async () => {
    setLoading(true);
    const supabase = createClient();
    const { data, error: fetchError } = await supabase
      .from("site_photos")
      .select("*")
      .eq("project_id", projectId)
      .order("taken_at", { ascending: false });

    if (fetchError) {
      setError(fetchError.message);
      setPhotos([]);
    } else {
      const withUrls = await Promise.all(
        (data ?? []).map(async (p) => ({
          ...p,
          displayUrl: await resolveDisplayUrl(p),
        }))
      );
      setPhotos(withUrls.filter((p) => p.displayUrl));
    }
    setLoading(false);
  }, [projectId, resolveDisplayUrl]);

  useEffect(() => {
    loadPhotos();
  }, [loadPhotos]);

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const validated = validatePhotoFile(file);
    if (!validated.ok) {
      setError(validated.error);
      e.target.value = "";
      return;
    }

    const safeComment = comment.trim().slice(0, LIMITS.photoComment);

    setUploading(true);
    setError("");
    const supabase = createClient();
    const path = buildStoragePath(companyId, projectId, validated.ext);

    try {
      const { error: uploadError } = await supabase.storage
        .from(STORAGE_BUCKET)
        .upload(path, file, {
          upsert: false,
          contentType: file.type,
        });

      if (uploadError) throw uploadError;

      const { error: insertError } = await supabase.from("site_photos").insert({
        project_id: projectId,
        storage_path: path,
        image_url: path,
        comment: safeComment || null,
        taken_at: takenAt,
      });

      if (insertError) throw insertError;

      setComment("");
      await loadPhotos();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "写真の保存に失敗しました"
      );
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }

  async function handleDelete(photo: PhotoWithUrl) {
    if (!confirm("この写真を削除してもよろしいですか？")) return;
    const supabase = createClient();
    const path = photo.storage_path ?? photo.image_url;
    if (path && !path.startsWith("http")) {
      await supabase.storage.from(STORAGE_BUCKET).remove([path]);
    }
    await supabase.from("site_photos").delete().eq("id", photo.id);
    await loadPhotos();
  }

  if (loading) {
    return <LoadingScreen message="写真を読み込んでいます。少々お待ちください。" />;
  }

  return (
    <section className="space-y-8">
      <section className="rounded-2xl border-2 border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="mb-2 text-xl font-bold text-navy-950">
          新しい写真を追加
        </h2>
        <p className="mb-6 text-lg leading-relaxed text-gray-600">
          撮影日とメモを入力してから、下のボタンで写真を選ぶか撮影してください。
        </p>
        <section className="space-y-5">
          <Input
            label="撮影した日"
            type="date"
            value={takenAt}
            onChange={(e) => setTakenAt(e.target.value)}
          />
          <Textarea
            label="写真のメモ（任意）"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            maxLength={LIMITS.photoComment}
            placeholder="例：外壁のタイル貼りが完了した様子"
            rows={3}
            hint="何を撮影したか、わかりやすく書いておくと後で便利です"
          />
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/heic,image/heif"
            capture="environment"
            className="hidden"
            onChange={handleUpload}
            disabled={uploading}
          />
          <Button
            type="button"
            fullWidth
            loading={uploading}
            onClick={() => fileInputRef.current?.click()}
          >
            {uploading ? "写真を保存しています" : "写真を選ぶ・撮影する"}
          </Button>
        </section>
        {error ? (
          <p className="mt-4 rounded-2xl border-2 border-red-200 bg-red-50 px-4 py-3 text-base text-red-700">
            {error}
          </p>
        ) : null}
      </section>

      <section>
        <h2 className="mb-4 text-lg font-bold text-gray-800">
          登録済みの写真（{photos.length}枚）
        </h2>
        {photos.length === 0 ? (
          <EmptyState
            title="まだ写真がありません"
            description="上の「写真を選ぶ・撮影する」ボタンから、現場の写真を追加してください。"
            steps={[
              "撮影した日を確認する",
              "必要ならメモを書く",
              "「写真を選ぶ・撮影する」ボタンを押す",
            ]}
          />
        ) : (
          <ul className="space-y-5">
            {photos.map((photo) => (
              <li
                key={photo.id}
                className="overflow-hidden rounded-2xl border-2 border-gray-200 bg-white shadow-sm"
              >
                <section className="relative aspect-[4/3] bg-gray-100">
                  <Image
                    src={photo.displayUrl}
                    alt={photo.comment ?? "現場の写真"}
                    fill
                    className="object-cover"
                    sizes="100vw"
                    unoptimized
                  />
                </section>
                <section className="p-5">
                  <p className="text-base font-bold text-gray-600">
                    撮影日：{photo.taken_at}
                  </p>
                  {photo.comment ? (
                    <p className="mt-2 text-lg leading-relaxed text-gray-800">
                      {photo.comment}
                    </p>
                  ) : null}
                  <Button
                    type="button"
                    variant="danger"
                    size="md"
                    fullWidth
                    className="mt-4"
                    onClick={() => handleDelete(photo)}
                  >
                    この写真を削除する
                  </Button>
                </section>
              </li>
            ))}
          </ul>
        )}
      </section>
    </section>
  );
}
