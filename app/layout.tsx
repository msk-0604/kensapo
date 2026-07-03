import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Kensapo | \u73fe\u5834\u7ba1\u7406AI",
  description:
    "\u5efa\u8a2d\u73fe\u5834\u306e\u65e5\u5831\u30fb\u5199\u771f\u6574\u7406\u30fbAI\u5831\u544a\u66f8\u4f5c\u6210\u3092\u4e00\u5143\u5316",
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
