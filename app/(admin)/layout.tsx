// 管理画面配下の共通レイアウト
// ログイン画面(/)以外のすべての画面にサイドバーを適用します。

import AppShell from "@/components/app-shell";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AppShell>{children}</AppShell>;
}
