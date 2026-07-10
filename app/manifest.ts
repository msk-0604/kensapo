import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "KenSapo",
    short_name: "KenSapo",
    description: "建設現場の日報・写真整理・AI報告書作成を一元化",
    start_url: "/dashboard",
    display: "standalone",
    background_color: "#0144BC",
    theme_color: "#0144BC",
    icons: [
      {
        src: "/icon.png",
        sizes: "512x512",
        type: "image/png",
      },
      {
        src: "/apple-icon.png",
        sizes: "180x180",
        type: "image/png",
        purpose: "any",
      },
    ],
  };
}
