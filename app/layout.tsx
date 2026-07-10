import type { Metadata, Viewport } from "next";
import { Geist } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "KenSapo",
  description: "建設現場の日報・写真整理・AI報告書作成を一元化",
  appleWebApp: {
    capable: true,
    title: "KenSapo",
    statusBarStyle: "default",
  },
};

export const viewport: Viewport = {
  themeColor: "#0144BC",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja" className={`${geistSans.variable} h-full`}>
      <body className="min-h-full antialiased">{children}</body>
    </html>
  );
}
