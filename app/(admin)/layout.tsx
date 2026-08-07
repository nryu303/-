// 管理画面配下の共通レイアウト
// ログイン画面(/)以外のすべての画面にサイドバーとトースト通知を適用します。

import AppShell from "@/components/app-shell";
import { ToastProvider } from "@/components/toast";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ToastProvider>
      <AppShell>{children}</AppShell>
    </ToastProvider>
  );
}
