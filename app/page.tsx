"use client";

// ============================================================
// エントリー画面
//
//   1. フルスクリーンのイントロ(動画 or コード描画背景)
//   2. 「システムに入る」でログイン画面へ
//   3. ログイン成功でダッシュボードへ
//
// デモのため認証は行わず、入力があればログインできます。
// 本番実装では Supabase Auth に置き換わります。
// ============================================================

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import IntroScreen from "@/components/intro-screen";
import { inputClass } from "@/components/ui";
import { session } from "@/lib/session";

const HIGHLIGHTS = [
  { spec: "要件1・2", label: "データ基盤", text: "J-Quants Premium から毎営業日自動でデータを蓄積" },
  { spec: "要件3", label: "銘柄抽出", text: "決算発表日を基準にした営業日計算＋複合条件で絞り込み" },
  { spec: "要件4", label: "バックテスト", text: "保有期間別に損益・勝率・ドローダウンを一括比較" },
  { spec: "要件5・6", label: "資料と実績", text: "PDFの自動文字抽出と、予測 vs 実績の比較集計" },
  { spec: "要件8", label: "外部連携", text: "分析AI向けの読み取り専用REST API" },
];

export default function EntryPage() {
  const router = useRouter();

  // イントロ表示の判定はマウント後に行う(SSRとの不一致を防ぐため)
  const [ready, setReady] = useState(false);
  const [showIntro, setShowIntro] = useState(true);

  const [email, setEmail] = useState("admin@example.com");
  const [password, setPassword] = useState("demopassword");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setShowIntro(!session.introSeen());
    setReady(true);
  }, []);

  const finishIntro = () => {
    session.markIntroSeen();
    setShowIntro(false);
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setError("メールアドレスとパスワードを入力してください。");
      return;
    }
    setError("");
    setLoading(true);
    // 認証処理の待ち時間を再現
    window.setTimeout(() => {
      session.login(email.trim());
      router.push("/dashboard");
    }, 700);
  };

  if (!ready) {
    return <div className="min-h-screen bg-[#0a0e17]" />;
  }

  if (showIntro) {
    return <IntroScreen onEnter={finishIntro} />;
  }

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      {/* ---------- 左: 説明パネル ---------- */}
      <div className="relative flex flex-col justify-center overflow-hidden bg-ink-950 px-8 py-12 text-white sm:px-12 lg:px-16">
        <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-accent/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-32 -left-16 h-80 w-80 rounded-full bg-rose-500/10 blur-3xl" />

        <div className="relative mx-auto w-full max-w-lg">
          <div className="mb-8 flex items-center gap-3">
            <Image
              src="/logo.jpg"
              alt="日本株分析システム"
              width={44}
              height={44}
              priority
              className="h-11 w-11 shrink-0 rounded-xl object-cover object-top"
            />
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

          <button
            type="button"
            onClick={() => setShowIntro(true)}
            className="mt-8 text-[12px] text-ink-400 underline-offset-4 transition hover:text-white hover:underline"
          >
            ← イントロをもう一度見る
          </button>
        </div>
      </div>

      {/* ---------- 右: ログインフォーム ---------- */}
      <div className="flex flex-col justify-center bg-white px-8 py-12 sm:px-12 lg:px-16">
        <form onSubmit={submit} className="mx-auto w-full max-w-sm">
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
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="username"
                className={inputClass}
              />
            </label>

            <label className="block">
              <span className="mb-1.5 block text-[12px] font-medium text-ink-600">
                パスワード
              </span>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                className={inputClass}
              />
            </label>

            <label className="flex items-center gap-2 pt-1">
              <input
                type="checkbox"
                defaultChecked
                className="h-3.5 w-3.5 rounded border-ink-300 text-accent"
              />
              <span className="text-[12.5px] text-ink-600">
                2要素認証を使用する
              </span>
            </label>

            {error && (
              <p className="rounded-lg border border-red-200 bg-red-50 px-3.5 py-2.5 text-[12.5px] text-red-700">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="mt-2 flex w-full items-center justify-center gap-2 rounded-lg bg-accent px-4 py-2.5 text-[13.5px] font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:opacity-60"
            >
              {loading && (
                <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
              )}
              {loading ? "認証しています…" : "ログイン"}
            </button>
          </div>

          <div className="mt-7 rounded-lg border border-ink-200 bg-ink-50 px-4 py-3">
            <p className="text-[12px] leading-relaxed text-ink-500">
              <span className="font-semibold text-ink-700">デモ版について</span>
              <br />
              画面と操作の流れをご確認いただくためのデモです。認証は行わず、入力があればそのまま管理画面へ進みます。表示されるデータはすべてサンプルです。
            </p>
          </div>

          <p className="mt-5 text-center text-[12px] text-ink-400">
            システム全体の構成は{" "}
            <Link href="/architecture" className="font-medium text-accent hover:underline">
              構成図ページ
            </Link>{" "}
            でご覧いただけます。
          </p>
        </form>
      </div>
    </div>
  );
}
