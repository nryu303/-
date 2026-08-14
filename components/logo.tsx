// ============================================================
// ロゴ表示コンポーネント
//
// 元画像は余白(クリーム色の背景)が広いため、そのまま表示すると
// マークが小さく、背景の四角い縁も見えてしまいます。
//
// そこで以下の処理を行っています。
//   1. 外side の div を最終サイズに固定し、はみ出しを隠す(overflow-hidden)
//   2. 内側の画像を 2倍(200%)に拡大
//   3. 中央を基準に配置し、中央から 80% の範囲だけが見えるようにする
//
// これにより「マークは大きく、外枠は見えず、全体サイズは変わらない」
// という表示になります。
// ============================================================

import Image from "next/image";
import { cx } from "./ui";

export default function Logo({
  size = 36,
  rounded = "rounded-lg",
  className,
  priority,
}: {
  /** 表示する一辺の長さ(px) */
  size?: number;
  rounded?: string;
  className?: string;
  priority?: boolean;
}) {
  return (
    <span
      className={cx(
        "relative block shrink-0 overflow-hidden bg-white",
        rounded,
        className
      )}
      style={{ width: size, height: size }}
    >
      <Image
        src="/分析ロゴ.png"
        alt="日本株分析システム"
        // 2倍に拡大したうえで中央から 80% を表示するため、
        // 実際に読み込むサイズは表示サイズの 2.5 倍を指定します。
        width={size * 2.5}
        height={size * 2.5}
        priority={priority}
        className="absolute left-1/2 top-1/2 max-w-none -translate-x-1/2 -translate-y-1/2"
        style={{
          // 中央から 80% の範囲 = 表示枠に対して 1 / 0.8 = 1.25 倍
          // さらに 2 倍に拡大するため 2.5 倍で描画します。
          width: size * 2.5,
          height: size * 2.5,
        }}
      />
    </span>
  );
}
