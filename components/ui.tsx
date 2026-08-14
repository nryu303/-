// ============================================================
// 共通UIパーツ / Shared UI primitives
// 全画面でトーンを揃えるための小さな部品群
// ============================================================

import type { ReactNode } from "react";

export function cx(...parts: (string | false | null | undefined)[]) {
  return parts.filter(Boolean).join(" ");
}

/* ---------------- Card ---------------- */

export function Card({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      className={cx(
        "overflow-hidden rounded-xl border border-ink-200/70 bg-white/90 shadow-sm ring-1 ring-black/[0.02] backdrop-blur-sm transition hover:shadow-md",
        className
      )}
    >
      {children}
    </section>
  );
}

export function CardHeader({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <header className="flex flex-wrap items-start justify-between gap-3 border-b border-ink-200/60 bg-ink-50/40 px-5 py-4">
      <div className="min-w-0">
        <h2 className="text-[15px] font-semibold text-ink-900">{title}</h2>
        {description && (
          <p className="mt-1 text-[12.5px] leading-relaxed text-ink-500">
            {description}
          </p>
        )}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </header>
  );
}

export function CardBody({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return <div className={cx("px-5 py-5", className)}>{children}</div>;
}

/* ---------------- Page header ---------------- */

export function PageHeader({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
      <div className="min-w-0">
        {eyebrow && (
          <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wider text-accent">
            {eyebrow}
          </p>
        )}
        <h1 className="text-xl font-bold tracking-tight text-ink-900 sm:text-2xl">
          {title}
        </h1>
        {description && (
          <p className="mt-1.5 max-w-3xl text-[13px] leading-relaxed text-ink-500">
            {description}
          </p>
        )}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}

/* ---------------- Badge ---------------- */

type Tone = "neutral" | "success" | "warn" | "danger" | "info";

const TONE_CLASS: Record<Tone, string> = {
  neutral: "bg-ink-100 text-ink-600 ring-ink-200",
  success: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  warn: "bg-amber-50 text-amber-700 ring-amber-200",
  danger: "bg-red-50 text-red-700 ring-red-200",
  info: "bg-blue-50 text-blue-700 ring-blue-200",
};

export function Badge({
  children,
  tone = "neutral",
}: {
  children: ReactNode;
  tone?: Tone;
}) {
  return (
    <span
      className={cx(
        "inline-flex items-center whitespace-nowrap rounded-full px-2 py-0.5 text-[11px] font-medium ring-1 ring-inset",
        TONE_CLASS[tone]
      )}
    >
      {children}
    </span>
  );
}

/** ジョブ状態 → バッジのトーン */
export function statusTone(status: string): Tone {
  switch (status) {
    case "成功":
    case "確認済":
    case "決済済":
      return "success";
    case "実行中":
      return "info";
    case "エラー":
    case "要修正":
      return "danger";
    case "待機中":
    case "未確認":
    case "一部エラー":
      return "warn";
    default:
      return "neutral";
  }
}

/* ---------------- Stat tile ---------------- */

export function Stat({
  label,
  value,
  sub,
  tone,
  icon,
  trend,
  onClick,
}: {
  label: string;
  value: string;
  sub?: string;
  tone?: "gain" | "loss";
  icon?: string;
  /** 前期比などの増減表示 */
  trend?: { value: string; up: boolean };
  onClick?: () => void;
}) {
  const Wrapper = onClick ? "button" : "div";
  return (
    <Wrapper
      {...(onClick ? { onClick, type: "button" as const } : {})}
      className={cx(
        "rounded-xl border border-ink-200/70 bg-white/90 px-4 py-4 text-left shadow-sm ring-1 ring-black/[0.02] backdrop-blur-sm transition",
        onClick &&
          "hover:-translate-y-0.5 hover:border-accent/30 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-accent/30"
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <p className="text-[12px] font-medium text-ink-500">{label}</p>
        {icon && (
          <span aria-hidden className="text-[13px] leading-none text-ink-300">
            {icon}
          </span>
        )}
      </div>
      <div className="mt-1.5 flex items-baseline gap-2">
        <p
          className={cx(
            "tnum text-xl font-bold tracking-tight sm:text-2xl",
            tone === "gain" && "text-emerald-600",
            tone === "loss" && "text-red-600",
            !tone && "text-ink-900"
          )}
        >
          {value}
        </p>
        {trend && (
          <span
            className={cx(
              "tnum shrink-0 text-[11.5px] font-semibold",
              trend.up ? "text-emerald-600" : "text-red-600"
            )}
          >
            {trend.up ? "▲" : "▼"} {trend.value}
          </span>
        )}
      </div>
      {sub && <p className="mt-1 text-[11.5px] text-ink-400">{sub}</p>}
    </Wrapper>
  );
}

/* ---------------- Table ---------------- */

export function Table({ children }: { children: ReactNode }) {
  return (
    <div className="scroll-x">
      <table className="w-full min-w-[640px] border-collapse text-[13px]">
        {children}
      </table>
    </div>
  );
}

export function Th({
  children,
  align = "left",
  className,
}: {
  children?: ReactNode;
  align?: "left" | "right" | "center";
  className?: string;
}) {
  return (
    <th
      className={cx(
        "whitespace-nowrap border-b border-ink-200 bg-ink-50/70 px-3 py-2.5 text-[11.5px] font-semibold text-ink-500",
        align === "right" && "text-right",
        align === "center" && "text-center",
        align === "left" && "text-left",
        className
      )}
    >
      {children}
    </th>
  );
}

export function Td({
  children,
  align = "left",
  className,
}: {
  children?: ReactNode;
  align?: "left" | "right" | "center";
  className?: string;
}) {
  return (
    <td
      className={cx(
        "border-b border-ink-100 px-3 py-2.5 text-ink-700",
        align === "right" && "tnum text-right",
        align === "center" && "text-center",
        className
      )}
    >
      {children}
    </td>
  );
}

/** 損益の符号で色を出す数値セル */
export function PnlText({
  value,
  format,
}: {
  value: number;
  format: (n: number) => string;
}) {
  return (
    <span
      className={cx(
        "tnum font-medium",
        value > 0 && "text-emerald-600",
        value < 0 && "text-red-600",
        value === 0 && "text-ink-500"
      )}
    >
      {format(value)}
    </span>
  );
}

/* ---------------- Buttons / inputs (表示専用) ---------------- */

export function Button({
  children,
  variant = "primary",
  type = "button",
  onClick,
  disabled,
  className,
}: {
  children: ReactNode;
  variant?: "primary" | "secondary" | "ghost" | "danger";
  type?: "button" | "submit";
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
}) {
  const base =
    "inline-flex items-center justify-center gap-1.5 whitespace-nowrap rounded-lg px-3.5 py-2 text-[13px] font-medium transition disabled:cursor-not-allowed disabled:opacity-50";
  const variants = {
    primary: "bg-accent text-white hover:bg-blue-700 shadow-sm",
    secondary:
      "bg-white text-ink-700 ring-1 ring-inset ring-ink-200 hover:bg-ink-50",
    ghost: "text-ink-500 hover:bg-ink-100 hover:text-ink-700",
    danger: "bg-red-600 text-white hover:bg-red-700 shadow-sm",
  };
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={cx(base, variants[variant], className)}
    >
      {children}
    </button>
  );
}

export function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[12px] font-medium text-ink-600">
        {label}
      </span>
      {children}
      {hint && <span className="mt-1 block text-[11px] text-ink-400">{hint}</span>}
    </label>
  );
}

export const inputClass =
  "w-full rounded-lg border border-ink-200 bg-white px-3 py-2 text-[13px] text-ink-900 shadow-sm outline-none transition placeholder:text-ink-300 focus:border-accent focus:ring-2 focus:ring-accent/20";

/* ---------------- Demo notice ---------------- */

/** この画面がモック表示であることを明示する注記 */
export function DemoNote({ children }: { children: ReactNode }) {
  return (
    <div className="mb-5 flex items-start gap-2.5 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-[12.5px] leading-relaxed text-amber-900">
      <span aria-hidden className="mt-px shrink-0 text-sm">
        ⓘ
      </span>
      <p>{children}</p>
    </div>
  );
}

/* ---------------- Sortable header ---------------- */

export type SortDir = "asc" | "desc";

/** クリックで並び替えできる見出しセル */
export function SortTh<K extends string>({
  children,
  field,
  sort,
  onSort,
  align = "left",
}: {
  children: ReactNode;
  field: K;
  sort: { key: K; dir: SortDir };
  onSort: (key: K) => void;
  align?: "left" | "right" | "center";
}) {
  const active = sort.key === field;
  return (
    <th
      className={cx(
        "whitespace-nowrap border-b border-ink-200 bg-ink-50/70 px-3 py-2.5 text-[11.5px] font-semibold text-ink-500",
        align === "right" && "text-right",
        align === "center" && "text-center"
      )}
    >
      <button
        type="button"
        onClick={() => onSort(field)}
        className={cx(
          "inline-flex items-center gap-1 rounded transition hover:text-ink-900",
          active && "text-accent",
          align === "right" && "flex-row-reverse"
        )}
      >
        {children}
        <span aria-hidden className="text-[9px] leading-none opacity-70">
          {active ? (sort.dir === "asc" ? "▲" : "▼") : "⇅"}
        </span>
      </button>
    </th>
  );
}

/** 並び替え state をまとめて扱うヘルパー */
export function nextSort<K extends string>(
  current: { key: K; dir: SortDir },
  key: K
): { key: K; dir: SortDir } {
  if (current.key === key) {
    return { key, dir: current.dir === "asc" ? "desc" : "asc" };
  }
  return { key, dir: "desc" };
}

/* ---------------- Empty state ---------------- */

export function EmptyState({
  icon = "◌",
  title,
  body,
  action,
}: {
  icon?: string;
  title: string;
  body?: string;
  action?: ReactNode;
}) {
  return (
    <div className="px-6 py-12 text-center">
      <p className="text-[26px] leading-none text-ink-200" aria-hidden>
        {icon}
      </p>
      <p className="mt-3 text-[13.5px] font-semibold text-ink-700">{title}</p>
      {body && (
        <p className="mx-auto mt-1.5 max-w-sm text-[12.5px] leading-relaxed text-ink-400">
          {body}
        </p>
      )}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

/* ---------------- Skeleton ---------------- */

export function SkeletonRows({ rows = 5, cols = 6 }: { rows?: number; cols?: number }) {
  return (
    <div className="space-y-2 px-5 py-4">
      {Array.from({ length: rows }).map((_, r) => (
        <div key={r} className="flex gap-3">
          {Array.from({ length: cols }).map((_, c) => (
            <div
              key={c}
              className="h-4 flex-1 animate-pulse rounded bg-ink-100"
              style={{ animationDelay: `${(r * cols + c) * 40}ms` }}
            />
          ))}
        </div>
      ))}
    </div>
  );
}

/* ---------------- Section label ---------------- */

/** 画面内のグループ見出し */
export function SectionTitle({
  children,
  hint,
}: {
  children: ReactNode;
  hint?: string;
}) {
  return (
    <div className="mb-3 mt-1 flex items-baseline gap-2.5">
      <h2 className="text-[13px] font-bold tracking-tight text-ink-800">
        {children}
      </h2>
      {hint && <span className="text-[11.5px] text-ink-400">{hint}</span>}
      <span className="h-px flex-1 bg-ink-200" />
    </div>
  );
}

/* ---------------- Simple bar (依存ライブラリなしの簡易グラフ) ---------------- */

export function MiniBar({
  ratio,
  tone = "accent",
}: {
  ratio: number;
  tone?: "accent" | "gain" | "loss";
}) {
  const pctWidth = Math.max(2, Math.min(100, ratio * 100));
  const bg =
    tone === "gain"
      ? "bg-emerald-500"
      : tone === "loss"
        ? "bg-red-500"
        : "bg-accent";
  return (
    <div className="h-1.5 w-full overflow-hidden rounded-full bg-ink-100">
      <div className={cx("h-full rounded-full", bg)} style={{ width: `${pctWidth}%` }} />
    </div>
  );
}
