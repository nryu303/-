"use client";

// ============================================================
// ファーストビュー(全画面)
//
// システム名・概要・主な機能を、全画面の映像の上に表示します。
// 「システムに入る」でログイン画面(/login)へ進みます。
//
// 表示の流れ:
//   1. 最初の3秒は背景アニメーション(IntroScene)を表示
//   2. 3秒後、public/intro.mp4 へゆっくり切り替え(クロスフェード)
//   3. 動画が無い / 読み込めない場合は、背景アニメーションのまま
//
// 待ち時間は VIDEO_DELAY_MS で変更できます。
// 動画の差し替え方法は README をご覧ください。
// ============================================================

import { useEffect, useRef, useState } from "react";
import IntroScene from "./intro-scene";

/** 動画を表示し始めるまでの待ち時間(ミリ秒) */
const VIDEO_DELAY_MS = 3000;

/** ファーストビューに表示する主な機能 */
const FEATURES = [
  "データ自動蓄積",
  "銘柄抽出",
  "バックテスト",
  "PDF資料管理",
  "実績記録",
  "外部連携API",
];

export default function IntroScreen({ onEnter }: { onEnter: () => void }) {
  const videoRef = useRef<HTMLVideoElement>(null);

  /** 動画が再生可能な状態か */
  const [videoReady, setVideoReady] = useState(false);
  /** 待ち時間が経過したか */
  const [delayPassed, setDelayPassed] = useState(false);

  const [leaving, setLeaving] = useState(false);
  const [muted, setMuted] = useState(true);

  // 動画を実際に表示するかどうか
  // (読み込み完了 かつ 3秒経過 の両方を満たしたとき)
  const showVideo = videoReady && delayPassed;

  // 開始から3秒後に動画へ切り替える
  useEffect(() => {
    const t = window.setTimeout(() => setDelayPassed(true), VIDEO_DELAY_MS);
    return () => window.clearTimeout(t);
  }, []);

  // 切り替えの瞬間に動画を先頭から再生する
  // (待機中も再生は進んでいるため、途中から始まって見えるのを防ぎます)
  useEffect(() => {
    if (!showVideo) return;
    const v = videoRef.current;
    if (!v) return;
    v.currentTime = 0;
    void v.play().catch(() => {
      /* 自動再生が拒否された場合は背景アニメーションのまま表示します */
    });
  }, [showVideo]);

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
      {/*
        最初の3秒は背景アニメーション(IntroScene)を表示し、
        そのあと動画へゆっくり切り替えます。
        動画が無い / 読み込めない場合は、そのまま背景アニメーションが残ります。
      */}

      {/* 下に敷く背景アニメーション。動画表示後もフェード完了まで残します */}
      <div
        className={`absolute inset-0 transition-opacity duration-[1200ms] ${
          showVideo ? "opacity-0" : "opacity-100"
        }`}
      >
        <IntroScene />
      </div>

      <video
        ref={videoRef}
        autoPlay
        loop
        muted={muted}
        playsInline
        preload="auto"
        onCanPlay={() => setVideoReady(true)}
        onError={() => setVideoReady(false)}
        className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-[1200ms] ${
          showVideo ? "opacity-100" : "opacity-0"
        }`}
      >
        <source src="/intro.mp4" type="video/mp4" />
      </video>

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

          <p className="mx-auto mt-5 max-w-2xl text-[14px] leading-relaxed text-white/80 sm:text-[15.5px]">
            東証全上場銘柄の時系列データを毎営業日自動で蓄積し、
            <br className="hidden sm:block" />
            条件抽出・バックテスト・資料管理・実績記録までを一貫して行うシステムです。
          </p>

          {/* 主な機能 */}
          <ul className="mx-auto mt-8 flex max-w-3xl flex-wrap justify-center gap-x-2.5 gap-y-2">
            {FEATURES.map((f) => (
              <li
                key={f}
                className="rounded-full border border-white/15 bg-white/10 px-3.5 py-1.5 text-[11.5px] text-white/80 backdrop-blur-sm"
              >
                {f}
              </li>
            ))}
          </ul>

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
        {showVideo && (
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

      {/*
        動画未設置のときだけ出る開発者向けメモ。
        待機中の3秒間には出さず、読み込みに失敗した場合のみ表示します。
      */}
      {delayPassed && !videoReady && (
        <p className="absolute bottom-5 left-5 max-w-[280px] text-left text-[10.5px] leading-relaxed text-white/35">
          public/intro.mp4 を配置すると、この背景が動画に切り替わります(README参照)
        </p>
      )}
    </div>
  );
}
