import type { HelpVideo } from "@/lib/help/types";
import { Card } from "@/components/ui/Card";
import { HelpPrintActions } from "@/components/help/HelpPrintActions";

function toEmbedUrl(url: string): string | null {
  const trimmed = url.trim();
  if (!trimmed) return null;
  try {
    const u = new URL(trimmed);
    if (u.hostname.includes("youtu.be")) {
      const id = u.pathname.replace("/", "");
      return id ? `https://www.youtube.com/embed/${id}` : null;
    }
    if (u.hostname.includes("youtube.com")) {
      const id = u.searchParams.get("v");
      if (id) return `https://www.youtube.com/embed/${id}`;
      const parts = u.pathname.split("/");
      const embedIdx = parts.indexOf("embed");
      if (embedIdx >= 0 && parts[embedIdx + 1]) {
        return `https://www.youtube.com/embed/${parts[embedIdx + 1]}`;
      }
    }
  } catch {
    return null;
  }
  return null;
}

export function HelpVideoList({ videos }: { videos: HelpVideo[] }) {
  return (
    <div className="help-print-area space-y-6">
      <div className="no-print">
        <HelpPrintActions title="動画マニュアル" />
      </div>
      <ul className="space-y-6">
        {videos.map((video) => {
          const embed = toEmbedUrl(video.youtubeUrl);
          return (
            <li key={video.id}>
              <Card>
                <h2 className="text-xl font-bold text-navy-950">{video.title}</h2>
                <p className="mt-2 text-lg text-gray-700">{video.description}</p>
                {embed ? (
                  <div className="mt-4 aspect-video overflow-hidden rounded-2xl border-2 border-gray-200 bg-black">
                    <iframe
                      src={embed}
                      title={video.title}
                      className="h-full w-full"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  </div>
                ) : (
                  <div className="mt-4 flex min-h-[10rem] items-center justify-center rounded-2xl border-2 border-dashed border-gray-300 bg-gray-50 px-4 text-center">
                    <p className="text-lg font-bold text-gray-700">
                      動画準備中
                      <span className="mt-1 block text-base font-normal text-gray-500">
                        管理者が YouTube URL を追加すると表示されます
                      </span>
                    </p>
                  </div>
                )}
              </Card>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
