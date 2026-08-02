"use client";

// ============================================================
// 管理画面の共通レイアウト
// PC: 左サイドバー固定 / スマートフォン: ハンバーガー開閉
// ============================================================

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, type ReactNode } from "react";
import { NAV_GROUPS } from "./nav-items";
import { TODAY } from "@/lib/mock-data";
import { cx } from "./ui";

export default function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  const nav = (
    <nav className="flex flex-col gap-6">
      {NAV_GROUPS.map((group) => (
        <div key={group.group}>
          <p className="mb-2 px-3 text-[10.5px] font-semibold uppercase tracking-wider text-ink-400">
            {group.group}
          </p>
          <ul className="space-y-0.5">
            {group.items.map((item) => {
              const active = pathname === item.href;
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={() => setMenuOpen(false)}
                    className={cx(
                      "group flex items-center gap-2.5 rounded-lg px-3 py-2 text-[13px] transition",
                      active
                        ? "bg-accent text-white shadow-sm"
                        : "text-ink-600 hover:bg-ink-100 hover:text-ink-900"
                    )}
                  >
                    <span
                      aria-hidden
                      className={cx(
                        "w-4 text-center text-[13px]",
                        active ? "text-white" : "text-ink-400"
                      )}
                    >
                      {item.icon}
                    </span>
                    <span className="flex-1 font-medium">{item.label}</span>
                    <span
                      className={cx(
                        "rounded px-1.5 py-0.5 text-[9.5px] font-semibold",
                        active
                          ? "bg-white/20 text-white"
                          : "bg-ink-100 text-ink-400 group-hover:bg-ink-200"
                      )}
                    >
                      {item.spec}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );

  return (
    <div className="min-h-screen bg-ink-50">
      {/* ---------- モバイル用ヘッダー ---------- */}
      <header className="sticky top-0 z-30 flex items-center justify-between border-b border-ink-200 bg-white px-4 py-3 lg:hidden">
        <Link href="/dashboard" className="flex items-center gap-2">
          <span className="grid h-7 w-7 place-items-center rounded-md bg-accent text-[13px] font-bold text-white">
            J
          </span>
          <span className="text-[14px] font-bold tracking-tight text-ink-900">
            日本株分析システム
          </span>
        </Link>
        <button
          type="button"
          onClick={() => setMenuOpen((v) => !v)}
          aria-label="メニュー"
          aria-expanded={menuOpen}
          className="rounded-lg p-2 text-ink-500 hover:bg-ink-100"
        >
          <span className="block text-lg leading-none">{menuOpen ? "✕" : "☰"}</span>
        </button>
      </header>

      {menuOpen && (
        <div className="border-b border-ink-200 bg-white px-4 py-4 lg:hidden">
          {nav}
        </div>
      )}

      <div className="mx-auto flex max-w-[1600px]">
        {/* ---------- PC用サイドバー ---------- */}
        <aside className="sticky top-0 hidden h-screen w-[264px] shrink-0 flex-col border-r border-ink-200 bg-white px-4 py-5 lg:flex">
          <Link href="/dashboard" className="mb-7 flex items-center gap-2.5 px-2">
            <span className="grid h-9 w-9 place-items-center rounded-lg bg-accent text-[15px] font-bold text-white">
              J
            </span>
            <span>
              <span className="block text-[14.5px] font-bold leading-tight tracking-tight text-ink-900">
                日本株分析システム
              </span>
              <span className="block text-[11px] text-ink-400">
                J-Quants Premium 連携
              </span>
            </span>
          </Link>

          <div className="flex-1 overflow-y-auto">{nav}</div>

          <div className="mt-5 border-t border-ink-200 pt-4">
            <div className="flex items-center gap-2.5 px-2">
              <span className="grid h-8 w-8 place-items-center rounded-full bg-ink-100 text-[12px] font-semibold text-ink-500">
                管
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[12.5px] font-medium text-ink-700">
                  管理者
                </span>
                <span className="block text-[11px] text-ink-400">{TODAY}</span>
              </span>
              <Link
                href="/"
                className="rounded px-1.5 py-1 text-[11px] text-ink-400 hover:bg-ink-100 hover:text-ink-600"
              >
                ログアウト
              </Link>
            </div>
          </div>
        </aside>

        {/* ---------- メイン ---------- */}
        <main className="min-w-0 flex-1 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          {children}
        </main>
      </div>
    </div>
  );
}
