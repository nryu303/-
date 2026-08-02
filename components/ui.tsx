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
        "rounded-xl border border-ink-200 bg-white shadow-sm",
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
    <header className="flex flex-wrap items-start justify-between gap-3 border-b border-ink-200 px-5 py-4">
      <div className="min-w-0">
        <h2 className="text-[15px] font-semibold text-ink-900">{title}</h2>
        {description && (
          <p className="mt-1 text-[13px] leading-relaxed text-ink-500">
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
  return <div className={cx("px-5 py-4", className)}>{children}</div>;
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
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div className="min-w-0">
        {eyebrow && (
          <p className="mb-1 text-[11px] font-semibold uppercase tracking-wider text-accent">
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
}: {
  label: string;
  value: string;
  sub?: string;
  tone?: "gain" | "loss";
}) {
  return (
    <div className="rounded-xl border border-ink-200 bg-white px-4 py-3.5 shadow-sm">
      <p className="text-[12px] font-medium text-ink-500">{label}</p>
      <p
        className={cx(
          "tnum mt-1.5 text-xl font-bold tracking-tight sm:text-2xl",
          tone === "gain" && "text-emerald-600",
          tone === "loss" && "text-red-600",
          !tone && "text-ink-900"
        )}
      >
        {value}
      </p>
      {sub && <p className="mt-1 text-[11.5px] text-ink-400">{sub}</p>}
    </div>
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
