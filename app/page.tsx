"use client";

// ============================================================
// ファーストビュー(/)
//
// 全画面の動画(または背景アニメーション)の上に、
// システム名と概要を表示します。
// 「システムに入る」でログイン画面(/login)へ進みます。
// ============================================================

import { useRouter } from "next/navigation";
import IntroScreen from "@/components/intro-screen";

export default function FirstViewPage() {
  const router = useRouter();

  return <IntroScreen onEnter={() => router.push("/login")} />;
}
