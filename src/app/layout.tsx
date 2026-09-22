import type { Metadata, Viewport } from "next";
import { M_PLUS_Rounded_1c } from "next/font/google";

import "./globals.css";

const mplusRounded = M_PLUS_Rounded_1c({
  weight: ["400", "500", "700", "800"],
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "家事ルーレット",
  description: "空き時間とコンディションに合わせて、ゲーム感覚で家事を提案するアプリ",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  // ライトモード固定のため、OS設定に関わらず配色を統一する。
  colorScheme: "light",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja" className={mplusRounded.variable}>
      <body className="min-h-dvh font-sans antialiased">{children}</body>
    </html>
  );
}
