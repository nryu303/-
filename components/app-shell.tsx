"use client";

// ============================================================
// 管理画面の共通レイアウト
//
// ・PC: 左サイドバー固定(折りたたみ可)
// ・スマートフォン: ハンバーガー開閉
// ・上部バー: パンくず・検索・通知・アカウント
// ・未ログインの場合はログイン画面へ戻します
// ============================================================

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { ALL_NAV_ITEMS, NAV_GROUPS, PHASE_LABEL } from "./nav-items";
import { ERROR_LOGS, TODAY } from "@/lib/mock-data";
import { session } from "@/lib/session";
import { cx } from "./ui";

export default function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  const [menuOpen, setMenuOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [authed, setAuthed] = useState<boolean | null>(null);

  const current = ALL_NAV_ITEMS.find((i) => i.href === pathname);
  const group = NAV_GROUPS.find((g) => g.items.some((i) => i.href === pathname));
  const unresolved = ERROR_LOGS.filter((e) => !e.resolved);

  // ---- 認証ガード ----
  useEffect(() => {
    const ok = session.isAuthed();
    setAuthed(ok);
    if (!ok) router.replace("/");
  }, [router, pathname]);

  // ---- ⌘K / Ctrl+K で検索 ----
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setPaletteOpen((v) => !v);
      }
      if (e.key === "Escape") {
        setPaletteOpen(false);
        setNotifOpen(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // 画面遷移でメニューを閉じる
  useEffect(() => {
    setMenuOpen(false);
    setPaletteOpen(false);
    setNotifOpen(false);
  }, [pathname]);

  const logout = () => {
    session.logout();
    router.push("/");
  };

  if (authed === null) {
    return <div className="min-h-screen bg-ink-50" />;
  }
  if (!authed) return null;

  const nav = (compact: boolean) => (
    <nav className="flex flex-col gap-5">
      {NAV_GROUPS.map((g) => (
        <div key={g.group}>
          {!compact && (
            <p className="mb-2 px-3 text-[10.5px] font-semibold uppercase tracking-wider text-ink-400">
              {g.group}
            </p>
          )}
          <ul className="space-y-0.5">
            {g.items.map((item) => {
              const active = pathname === item.href;
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    title={compact ? item.label : undefined}
                    className={cx(
                      "group flex items-center gap-2.5 rounded-lg px-3 py-2 text-[13px] transition",
                      compact && "justify-center px-2",
                      active
                        ? "bg-accent text-white shadow-sm"
                        : "text-ink-600 hover:bg-ink-100 hover:text-ink-900"
                    )}
                  >
                    <span
                      aria-hidden
                      className={cx(
                        "w-4 shrink-0 text-center text-[13px]",
                        active ? "text-white" : "text-ink-400"
                      )}
                    >
                      {item.icon}
                    </span>
                    {!compact && (
                      <>
                        <span className="flex-1 font-medium">{item.label}</span>
                        <span
                          className={cx(
                            "rounded px-1.5 py-0.5 text-[9.5px] font-semibold",
                            active
                              ? "bg-white/20 text-white"
                              : item.phase === 1
                                ? "bg-emerald-100 text-emerald-700"
                                : "bg-ink-100 text-ink-400"
                          )}
                        >
                          {item.phase === 1 ? "MVP" : `第${item.phase}段階`}
                        </span>
                      </>
                    )}
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
      <header className="sticky top-0 z-30 flex items-center justify-between border-b border-ink-200 bg-white/95 px-4 py-3 backdrop-blur lg:hidden">
        <Link href="/dashboard" className="flex items-center gap-2">
          <Image
            src="/logo.jpg"
            alt="日本株分析システム"
            width={28}
            height={28}
            priority
            className="h-7 w-7 shrink-0 rounded-md object-cover object-top"
          />
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
          {nav(false)}
          <button
            onClick={logout}
            className="mt-4 w-full rounded-lg border border-ink-200 px-3 py-2 text-[13px] text-ink-600 hover:bg-ink-50"
          >
            ログアウト
          </button>
        </div>
      )}

      <div className="mx-auto flex max-w-[1700px]">
        {/* ---------- PC用サイドバー ---------- */}
        <aside
          className={cx(
            "sticky top-0 hidden h-screen shrink-0 flex-col border-r border-ink-200 bg-white py-5 transition-[width] duration-200 lg:flex",
            collapsed ? "w-[76px] px-3" : "w-[264px] px-4"
          )}
        >
          <Link
            href="/dashboard"
            className={cx(
              "mb-6 flex items-center gap-2.5",
              collapsed ? "justify-center px-0" : "px-2"
            )}
          >
            <Image
              src="/logo.jpg"
              alt="日本株分析システム"
              width={36}
              height={36}
              priority
              className="h-9 w-9 shrink-0 rounded-lg object-cover object-top"
            />
            {!collapsed && (
              <span>
                <span className="block text-[14.5px] font-bold leading-tight tracking-tight text-ink-900">
                  日本株分析システム
                </span>
                <span className="block text-[11px] text-ink-400">
                  J-Quants Premium 連携
                </span>
              </span>
            )}
          </Link>

          {!collapsed && (
            <button
              onClick={() => setPaletteOpen(true)}
              className="mb-5 flex w-full items-center gap-2 rounded-lg border border-ink-200 bg-ink-50 px-3 py-2 text-[12.5px] text-ink-400 transition hover:border-ink-300 hover:bg-white"
            >
              <span aria-hidden>⌕</span>
              <span className="flex-1 text-left">画面を検索…</span>
              <kbd className="rounded border border-ink-200 bg-white px-1.5 py-0.5 text-[10px] text-ink-400">
                ⌘K
              </kbd>
            </button>
          )}

          <div className="flex-1 overflow-y-auto">{nav(collapsed)}</div>

          <div className="mt-4 border-t border-ink-200 pt-4">
            <button
              onClick={() => setCollapsed((v) => !v)}
              className={cx(
                "mb-3 flex w-full items-center gap-2 rounded-lg px-3 py-1.5 text-[12px] text-ink-400 transition hover:bg-ink-100 hover:text-ink-600",
                collapsed && "justify-center px-0"
              )}
            >
              <span aria-hidden>{collapsed ? "»" : "«"}</span>
              {!collapsed && <span>サイドバーを閉じる</span>}
            </button>

            <div
              className={cx(
                "flex items-center gap-2.5",
                collapsed ? "justify-center px-0" : "px-2"
              )}
            >
              <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-ink-100 text-[12px] font-semibold text-ink-500">
                管
              </span>
              {!collapsed && (
                <>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[12.5px] font-medium text-ink-700">
                      管理者
                    </span>
                    <span className="block text-[11px] text-ink-400">{TODAY}</span>
                  </span>
                  <button
                    onClick={logout}
                    className="rounded px-1.5 py-1 text-[11px] text-ink-400 transition hover:bg-ink-100 hover:text-ink-600"
                  >
                    ログアウト
                  </button>
                </>
              )}
            </div>
          </div>
        </aside>

        {/* ---------- メイン ---------- */}
        <div className="min-w-0 flex-1">
          {/* 上部バー(PCのみ) */}
          <div className="sticky top-0 z-20 hidden items-center gap-4 border-b border-ink-200 bg-white/85 px-8 py-3 backdrop-blur lg:flex">
            <nav className="flex min-w-0 items-center gap-1.5 text-[12.5px]">
              <Link href="/dashboard" className="text-ink-400 hover:text-ink-700">
                管理画面
              </Link>
              {group && (
                <>
                  <span className="text-ink-300" aria-hidden>
                    /
                  </span>
                  <span className="text-ink-400">{group.group}</span>
                </>
              )}
              {current && (
                <>
                  <span className="text-ink-300" aria-hidden>
                    /
                  </span>
                  <span className="font-semibold text-ink-800">{current.label}</span>
                  <span className="ml-1.5 rounded bg-ink-100 px-1.5 py-0.5 text-[10px] font-semibold text-ink-500">
                    {current.spec}
                  </span>
                  <span
                    className={cx(
                      "rounded px-1.5 py-0.5 text-[10px] font-semibold",
                      current.phase === 1
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-ink-100 text-ink-500"
                    )}
                  >
                    {PHASE_LABEL[current.phase]}
                  </span>
                </>
              )}
            </nav>

            <div className="ml-auto flex items-center gap-2">
              <button
                onClick={() => setPaletteOpen(true)}
                className="rounded-lg p-2 text-ink-400 transition hover:bg-ink-100 hover:text-ink-700"
                aria-label="検索"
              >
                ⌕
              </button>

              <div className="relative">
                <button
                  onClick={() => setNotifOpen((v) => !v)}
                  className="relative rounded-lg p-2 text-ink-400 transition hover:bg-ink-100 hover:text-ink-700"
                  aria-label="通知"
                >
                  ◔
                  {unresolved.length > 0 && (
                    <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white" />
                  )}
                </button>

                {notifOpen && (
                  <div className="absolute right-0 top-11 w-[320px] overflow-hidden rounded-xl border border-ink-200 bg-white shadow-xl">
                    <p className="border-b border-ink-100 px-4 py-2.5 text-[12px] font-semibold text-ink-700">
                      通知 ({unresolved.length})
                    </p>
                    {unresolved.length === 0 ? (
                      <p className="px-4 py-6 text-center text-[12px] text-ink-400">
                        未解決の通知はありません
                      </p>
                    ) : (
                      unresolved.map((e) => (
                        <Link
                          key={e.id}
                          href="/data-update"
                          className="block border-b border-ink-100 px-4 py-3 transition last:border-0 hover:bg-ink-50"
                        >
                          <p className="text-[12.5px] font-medium text-ink-900">
                            {e.dataset} — {e.code}
                          </p>
                          <p className="mt-0.5 line-clamp-2 text-[11.5px] leading-relaxed text-ink-500">
                            {e.message}
                          </p>
                          <p className="mt-1 text-[10.5px] text-ink-400">
                            {e.occurredAt}
                          </p>
                        </Link>
                      ))
                    )}
                  </div>
                )}
              </div>

              <span className="ml-1 flex items-center gap-2 rounded-lg border border-ink-200 px-2.5 py-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                <span className="text-[11.5px] text-ink-500">デモ環境</span>
              </span>
            </div>
          </div>

          <main className="px-4 py-6 sm:px-6 lg:px-8 lg:py-7">{children}</main>
        </div>
      </div>

      {/* ---------- 検索パレット ---------- */}
      {paletteOpen && (
        <CommandPalette onClose={() => setPaletteOpen(false)} />
      )}

      {/* 通知の外側クリックで閉じる */}
      {notifOpen && (
        <div
          className="fixed inset-0 z-10"
          onClick={() => setNotifOpen(false)}
          aria-hidden
        />
      )}
    </div>
  );
}

/* ---------------- 検索パレット ---------------- */

function CommandPalette({ onClose }: { onClose: () => void }) {
  const [q, setQ] = useState("");
  const router = useRouter();

  const hits = useMemo(() => {
    const s = q.trim();
    if (!s) return ALL_NAV_ITEMS;
    return ALL_NAV_ITEMS.filter(
      (i) =>
        i.label.includes(s) ||
        i.description.includes(s) ||
        i.spec.includes(s)
    );
  }, [q]);

  const go = (href: string) => {
    router.push(href);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center bg-ink-950/40 px-4 pt-[12vh] backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg overflow-hidden rounded-xl bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 border-b border-ink-200 px-4 py-3">
          <span aria-hidden className="text-ink-400">
            ⌕
          </span>
          <input
            autoFocus
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && hits[0]) go(hits[0].href);
            }}
            placeholder="画面名・要件番号で検索(例: バックテスト / 要件4)"
            className="flex-1 bg-transparent text-[13.5px] text-ink-900 outline-none placeholder:text-ink-300"
          />
          <kbd className="rounded border border-ink-200 px-1.5 py-0.5 text-[10px] text-ink-400">
            ESC
          </kbd>
        </div>

        <div className="max-h-[320px] overflow-y-auto py-1.5">
          {hits.length === 0 ? (
            <p className="px-4 py-8 text-center text-[12.5px] text-ink-400">
              該当する画面がありません
            </p>
          ) : (
            hits.map((i) => (
              <button
                key={i.href}
                onClick={() => go(i.href)}
                className="flex w-full items-center gap-3 px-4 py-2.5 text-left transition hover:bg-ink-50"
              >
                <span aria-hidden className="w-4 text-center text-ink-400">
                  {i.icon}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-[13px] font-medium text-ink-900">
                    {i.label}
                  </span>
                  <span className="block truncate text-[11.5px] text-ink-400">
                    {i.description}
                  </span>
                </span>
                <span className="shrink-0 rounded bg-ink-100 px-1.5 py-0.5 text-[10px] font-semibold text-ink-500">
                  {i.spec}
                </span>
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
