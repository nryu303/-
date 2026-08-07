"use client";

// ============================================================
// フルスクリーン イントロ画面
//
// public/intro.mp4 が存在すればその動画を全画面で再生し、
// 無い場合はコードで描画した背景(IntroScene)を表示します。
// どちらの場合も操作方法は同じです。
//
// 動画の差し替え方法は README をご覧ください。
// ============================================================

import { useEffect, useRef, useState } from "react";
import IntroScene from "./intro-scene";

export default function IntroScreen({ onEnter }: { onEnter: () => void }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [hasVideo, setHasVideo] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const [muted, setMuted] = useState(true);

  // 画面遷移(フェードアウトしてから次へ)
  const enter = () => {
    if (leaving) return;
    setLeaving(true);
    window.setTimeout(onEnter, 620);
  };

  // Enter / Space / クリックで進む
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Enter" || e.key === " " || e.key === "Escape") {
        e.preventDefault();
        enter();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [leaving]);

  return (
    <div
      className={`fixed inset-0 z-50 overflow-hidden bg-[#0a0e17] transition-opacity duration-[600ms] ${
        leaving ? "opacity-0" : "opacity-100"
      }`}
    >
      {/* ---------- 背景 ---------- */}
      <video
        ref={videoRef}
        autoPlay
        loop
        muted={muted}
        playsInline
        preload="auto"
        onCanPlay={() => setHasVideo(true)}
        onError={() => setHasVideo(false)}
        className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ${
          hasVideo ? "opacity-100" : "opacity-0"
        }`}
      >
        <source src="/intro.mp4" type="video/mp4" />
      </video>

      {/* 動画が無い / 読み込めない場合の背景 */}
      {!hasVideo && <IntroScene />}

      {/* 可読性のための暗幕 */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/55 via-black/35 to-black/80" />

      {/* ---------- 前景 ---------- */}
      <div className="relative flex h-full flex-col items-center justify-center px-6 text-center">
        <div
          className={`transition-all duration-700 ${
            leaving ? "translate-y-3 opacity-0" : "translate-y-0 opacity-100"
          }`}
        >
          <p className="mb-4 text-[11px] font-semibold uppercase tracking-[0.42em] text-white/55">
            J-Quants Premium 連携
          </p>

          <h1 className="text-[34px] font-bold leading-[1.18] tracking-tight text-white drop-shadow-lg sm:text-[52px] lg:text-[62px]">
            日本株分析システム
          </h1>

          <p className="mx-auto mt-5 max-w-xl text-[14px] leading-relaxed text-white/75 sm:text-[15.5px]">
            東証全上場銘柄の時系列データを毎営業日自動で蓄積し、
            <br className="hidden sm:block" />
            条件抽出・バックテスト・資料管理・実績記録までを一貫して行います。
          </p>

          <button
            type="button"
            onClick={enter}
            className="group mt-10 inline-flex items-center gap-2.5 rounded-full bg-white/95 px-8 py-3.5 text-[14px] font-semibold text-ink-900 shadow-2xl transition hover:bg-white hover:shadow-white/20 focus:outline-none focus:ring-4 focus:ring-white/30"
          >
            システムに入る
            <span className="transition-transform group-hover:translate-x-1" aria-hidden>
              →
            </span>
          </button>

          <p className="mt-5 text-[11.5px] text-white/45">
            Enter キーでも進めます
          </p>
        </div>
      </div>

      {/* ---------- 右下の操作 ---------- */}
      <div className="absolute bottom-5 right-5 flex items-center gap-2">
        {hasVideo && (
          <button
            type="button"
            onClick={() => {
              const v = videoRef.current;
              if (!v) return;
              v.muted = !v.muted;
              setMuted(v.muted);
            }}
            className="rounded-full bg-black/40 px-3 py-1.5 text-[11.5px] text-white/70 backdrop-blur-sm transition hover:bg-black/60 hover:text-white"
          >
            {muted ? "🔇 音声オフ" : "🔊 音声オン"}
          </button>
        )}
        <button
          type="button"
          onClick={enter}
          className="rounded-full bg-black/40 px-3 py-1.5 text-[11.5px] text-white/70 backdrop-blur-sm transition hover:bg-black/60 hover:text-white"
        >
          スキップ →
        </button>
      </div>

      {/* 動画未設置のときだけ出る開発者向けメモ */}
      {!hasVideo && (
        <p className="absolute bottom-5 left-5 max-w-[280px] text-left text-[10.5px] leading-relaxed text-white/35">
          public/intro.mp4 を配置すると、この背景が動画に切り替わります(README参照)
        </p>
      )}
    </div>
  );
}
