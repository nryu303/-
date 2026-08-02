import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "日本株分析システム | J-Quants Premium 連携 デモ",
  description:
    "J-Quants Premium の日本株データを蓄積し、条件抽出・バックテスト・PDF資料管理・実績記録を行うWebシステムの画面デモです。",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <body>{children}</body>
    </html>
  );
}
