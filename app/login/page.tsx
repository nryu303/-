"use client";

// ============================================================
// ログイン画面(/login)
//
// 左: 映像(public/intro.mp4 / 無い場合は背景アニメーション)
// 右: ログインフォーム
//
// デモのため認証は行わず、入力があればログインできます。
// 本番実装では Supabase Auth に置き換わります。
// ============================================================

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import IntroScene from "@/components/intro-scene";
import Logo from "@/components/logo";
import { inputClass } from "@/components/ui";
import { session } from "@/lib/session";

export default function LoginPage() {
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement>(null);

  const [videoReady, setVideoReady] = useState(false);
  const [email, setEmail] = useState("admin@example.com");
  const [password, setPassword] = useState("demopassword");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // すでにログイン済みならダッシュボードへ
  useEffect(() => {
    if (session.isAuthed()) router.replace("/dashboard");
  }, [router]);

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

  return (
    <div className="grid min-h-screen lg:grid-cols-[1.1fr_1fr]">
      {/* ---------- 左: 映像のみ ---------- */}
      <div className="relative hidden overflow-hidden bg-[#0a0e17] lg:block">
        <div
          className={`absolute inset-0 transition-opacity duration-700 ${
            videoReady ? "opacity-0" : "opacity-100"
          }`}
        >
          <IntroScene />
        </div>

        <video
          ref={videoRef}
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
          onCanPlay={() => setVideoReady(true)}
          onError={() => setVideoReady(false)}
          className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ${
            videoReady ? "opacity-100" : "opacity-0"
          }`}
        >
          <source src="/intro.mp4" type="video/mp4" />
        </video>

        {/* 右端をなじませる暗幕 */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/30 via-transparent to-black/40" />

        {/* 左上のロゴのみ(文言は置きません) */}
        <Link
          href="/"
          className="absolute left-7 top-7 flex items-center gap-2.5 rounded-full bg-black/30 py-2 pl-2 pr-4 backdrop-blur-sm transition hover:bg-black/50"
        >
          <Logo size={32} rounded="rounded-full" priority />
          <span className="text-[12.5px] font-medium text-white/85">
            ← ファーストビューへ戻る
          </span>
        </Link>
      </div>

      {/* ---------- 右: ログインフォーム ---------- */}
      <div className="flex flex-col justify-center bg-white px-8 py-12 sm:px-12 lg:px-14">
        <form onSubmit={submit} className="mx-auto w-full max-w-sm">
          {/* モバイルではロゴをフォーム上部に表示 */}
          <div className="mb-8 flex items-center gap-3 lg:hidden">
            <Logo size={40} priority />
            <div>
              <p className="text-[15px] font-bold leading-tight text-ink-900">
                日本株分析システム
              </p>
              <p className="text-[12px] text-ink-400">J-Quants Premium 連携</p>
            </div>
          </div>

          <h1 className="text-xl font-bold tracking-tight text-ink-900">
            管理画面にログイン
          </h1>
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
            <Link
              href="/architecture"
              className="font-medium text-accent hover:underline"
            >
              構成図ページ
            </Link>{" "}
            でご覧いただけます。
          </p>
        </form>
      </div>
    </div>
  );
}
