"use client";

// ============================================================
// トースト通知
// 「CSV出力しました」「保存しました」など、操作の結果を伝えます。
// ============================================================

import {
  createContext,
  useCallback,
  useContext,
  useState,
  type ReactNode,
} from "react";

type ToastKind = "success" | "info" | "error";

interface Toast {
  id: number;
  kind: ToastKind;
  title: string;
  body?: string;
}

const ToastCtx = createContext<{
  push: (t: Omit<Toast, "id">) => void;
}>({ push: () => {} });

export const useToast = () => useContext(ToastCtx);

const KIND_STYLE: Record<ToastKind, { ring: string; icon: string; dot: string }> = {
  success: { ring: "ring-emerald-200", icon: "✓", dot: "bg-emerald-500" },
  info: { ring: "ring-blue-200", icon: "i", dot: "bg-accent" },
  error: { ring: "ring-red-200", icon: "!", dot: "bg-red-500" },
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<Toast[]>([]);

  const push = useCallback((t: Omit<Toast, "id">) => {
    const id = Date.now() + Math.random();
    setItems((prev) => [...prev, { ...t, id }]);
    window.setTimeout(() => {
      setItems((prev) => prev.filter((x) => x.id !== id));
    }, 3600);
  }, []);

  return (
    <ToastCtx.Provider value={{ push }}>
      {children}
      <div className="pointer-events-none fixed bottom-5 right-5 z-50 flex w-[min(360px,calc(100vw-2.5rem))] flex-col gap-2.5">
        {items.map((t) => {
          const s = KIND_STYLE[t.kind];
          return (
            <div
              key={t.id}
              className={`pointer-events-auto flex items-start gap-3 rounded-xl bg-white px-4 py-3 shadow-lg ring-1 ${s.ring} motion-safe:animate-[toastIn_.25s_ease-out]`}
            >
              <span
                className={`mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full text-[11px] font-bold text-white ${s.dot}`}
                aria-hidden
              >
                {s.icon}
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-[13px] font-semibold text-ink-900">{t.title}</p>
                {t.body && (
                  <p className="mt-0.5 text-[12px] leading-relaxed text-ink-500">
                    {t.body}
                  </p>
                )}
              </div>
              <button
                onClick={() => setItems((p) => p.filter((x) => x.id !== t.id))}
                className="shrink-0 rounded p-0.5 text-ink-300 transition hover:bg-ink-100 hover:text-ink-600"
                aria-label="閉じる"
              >
                ✕
              </button>
            </div>
          );
        })}
      </div>
      <style>{`
        @keyframes toastIn {
          from { transform: translateY(8px); opacity: 0; }
          to   { transform: translateY(0); opacity: 1; }
        }
      `}</style>
    </ToastCtx.Provider>
  );
}
