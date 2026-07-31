import { PageHeader } from "@/components/ui/PageHeader";
import { HelpVideoList } from "@/components/help/HelpVideoList";
import { getVideos } from "@/lib/help/load";
import { getProfile } from "@/lib/auth";
import { filterByRole } from "@/lib/help/search";
import type { HelpRole } from "@/lib/help/types";

export default async function HelpVideosPage() {
  const [data, profile] = await Promise.all([getVideos(), getProfile()]);
  const role: HelpRole = profile?.role === "admin" ? "admin" : "member";
  const videos = filterByRole(data.videos, role);
  const isAdmin = role === "admin";

  return (
    <>
      <PageHeader
        title="動画マニュアル"
        description="YouTube動画で操作を確認できます"
        backHref="/help"
        backLabel="取扱説明書に戻る"
      />
      <HelpVideoList videos={videos} />
      {isAdmin ? (
        <p className="mt-6 rounded-2xl border-2 border-gray-200 bg-white p-5 text-base text-gray-600">
          管理者向け:{" "}
          <code className="rounded bg-gray-100 px-1">
            public/help/data/videos.json
          </code>{" "}
          の <code className="rounded bg-gray-100 px-1">youtubeUrl</code>{" "}
          に動画URLを入れると埋め込み表示されます。
        </p>
      ) : null}
    </>
  );
}
