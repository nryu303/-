// ============================================================
// ログイン画面(要件7: ログイン認証)
// デモのため認証は行わず、ボタンでダッシュボードへ遷移します。
// 本番実装では Supabase Auth(メール認証 + 2要素認証)を使用します。
// ============================================================

import Link from "next/link";
import { inputClass } from "@/components/ui";

const HIGHLIGHTS = [
  { spec: "要件1・2", label: "データ基盤", text: "J-Quants Premium から毎営業日自動でデータを蓄積" },
  { spec: "要件3", label: "銘柄抽出", text: "決算発表日を基準にした営業日計算＋複合条件で絞り込み" },
  { spec: "要件4", label: "バックテスト", text: "保有期間別に損益・勝率・ドローダウンを一括比較" },
  { spec: "要件5・6", label: "資料と実績", text: "PDFの自動文字抽出と、予測 vs 実績の比較集計" },
  { spec: "要件8", label: "外部連携", text: "分析AI向けの読み取り専用REST API" },
];

export default function LoginPage() {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      {/* ---------- 左: 説明パネル ---------- */}
      <div className="flex flex-col justify-center bg-ink-950 px-8 py-12 text-white sm:px-12 lg:px-16">
        <div className="mx-auto w-full max-w-lg">
          <div className="mb-8 flex items-center gap-3">
            <span className="grid h-11 w-11 place-items-center rounded-xl bg-accent text-lg font-bold">
              J
            </span>
            <div>
              <p className="text-[15px] font-bold leading-tight">日本株分析システム</p>
              <p className="text-[12px] text-ink-400">J-Quants Premium 連携</p>
            </div>
          </div>

          <h1 className="text-2xl font-bold leading-snug tracking-tight sm:text-3xl">
            データの蓄積から検証まで、
            <br />
            ひとつの画面で完結します。
          </h1>

          <p className="mt-4 text-[13.5px] leading-relaxed text-ink-300">
            東証全上場銘柄の時系列データを毎営業日自動で蓄積し、条件抽出・バックテスト・資料管理・実績記録までを一貫して行うシステムです。
            本デモでは、実際の操作画面と処理の流れをご確認いただけます。
          </p>

          <ul className="mt-8 space-y-3.5">
            {HIGHLIGHTS.map((h) => (
              <li key={h.spec} className="flex gap-3">
                <span className="mt-0.5 shrink-0 rounded bg-white/10 px-1.5 py-0.5 text-[10px] font-semibold text-ink-300">
                  {h.spec}
                </span>
                <span className="min-w-0">
                  <span className="block text-[13px] font-semibold text-white">
                    {h.label}
                  </span>
                  <span className="block text-[12.5px] leading-relaxed text-ink-400">
                    {h.text}
                  </span>
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* ---------- 右: ログインフォーム ---------- */}
      <div className="flex flex-col justify-center bg-white px-8 py-12 sm:px-12 lg:px-16">
        <div className="mx-auto w-full max-w-sm">
          <h2 className="text-xl font-bold tracking-tight text-ink-900">
            管理画面にログイン
          </h2>
          <p className="mt-1.5 text-[13px] text-ink-500">
            本番環境では Supabase Auth による認証を行います。
          </p>

          <div className="mt-7 space-y-4">
            <label className="block">
              <span className="mb-1.5 block text-[12px] font-medium text-ink-600">
                メールアドレス
              </span>
              <input
                type="email"
                defaultValue="admin@example.com"
                readOnly
                className={inputClass}
              />
            </label>

            <label className="block">
              <span className="mb-1.5 block text-[12px] font-medium text-ink-600">
                パスワード
              </span>
              <input
                type="password"
                defaultValue="demopassword"
                readOnly
                className={inputClass}
              />
            </label>

            <label className="flex items-center gap-2 pt-1">
              <input
                type="checkbox"
                defaultChecked
                readOnly
                className="h-3.5 w-3.5 rounded border-ink-300 text-accent"
              />
              <span className="text-[12.5px] text-ink-600">
                2要素認証を使用する
              </span>
            </label>

            <Link
              href="/dashboard"
              className="mt-2 flex w-full items-center justify-center rounded-lg bg-accent px-4 py-2.5 text-[13.5px] font-semibold text-white shadow-sm transition hover:bg-blue-700"
            >
              ログイン
            </Link>
          </div>

          <div className="mt-7 rounded-lg border border-ink-200 bg-ink-50 px-4 py-3">
            <p className="text-[12px] leading-relaxed text-ink-500">
              <span className="font-semibold text-ink-700">デモ版について</span>
              <br />
              画面と操作の流れをご確認いただくためのデモです。認証は行わず、
              「ログイン」を押すとそのまま管理画面へ進みます。表示されるデータはすべてサンプルです。
            </p>
          </div>

          <p className="mt-5 text-center text-[12px] text-ink-400">
            システム全体の構成は{" "}
            <Link href="/architecture" className="font-medium text-accent hover:underline">
              構成図ページ
            </Link>{" "}
            でご覧いただけます。
          </p>
        </div>
      </div>
    </div>
  );
}
