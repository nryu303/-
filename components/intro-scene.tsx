// ============================================================
// イントロ背景シーン(動画が無い場合のフォールバック)
//
// public/intro.mp4 が存在しない場合に表示される、
// コードで描画した日本の市場をイメージした背景です。
// 画像・動画ファイルを一切使わないため、常に表示できます。
// ============================================================

export default function IntroScene() {
  return (
    <div className="absolute inset-0 overflow-hidden bg-[#0a0e17]">
      {/* 夜明けのグラデーション */}
      <div className="absolute inset-0 bg-[linear-gradient(180deg,#0a0e17_0%,#141b2d_38%,#2b2036_62%,#4a2b3a_82%,#7c3f47_100%)]" />

      {/* 太陽(日の丸をイメージ) */}
      <div className="absolute bottom-[22%] left-1/2 h-[190px] w-[190px] -translate-x-1/2 rounded-full bg-[radial-gradient(circle,#ff6b5a_0%,#e8483a_55%,rgba(232,72,58,0)_72%)] opacity-80 blur-[2px] motion-safe:animate-[sunrise_9s_ease-out_forwards]" />

      {/* 遠景の山 */}
      <svg
        className="absolute bottom-[16%] w-full opacity-30"
        viewBox="0 0 1440 220"
        preserveAspectRatio="none"
        aria-hidden
      >
        <path
          d="M0,220 L180,96 L268,148 L392,54 L520,150 L660,88 L780,160 L900,72 L1040,146 L1180,100 L1300,158 L1440,110 L1440,220 Z"
          fill="#1a2338"
        />
      </svg>

      {/* 都市のシルエット */}
      <Skyline />

      {/* ローソク足チャート */}
      <Candles />

      {/* 舞い散る桜 */}
      <Sakura />

      {/* ティッカー(株価テープ) */}
      <Ticker />

      {/* 画面を落ち着かせる暗幕 */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_25%,rgba(6,9,15,0.82)_100%)]" />

      <style>{`
        @keyframes sunrise {
          from { transform: translate(-50%, 90px) scale(0.82); opacity: 0; }
          to   { transform: translate(-50%, 0) scale(1); opacity: 0.8; }
        }
        @keyframes fall {
          0%   { transform: translateY(-8vh) translateX(0) rotate(0deg); opacity: 0; }
          10%  { opacity: 0.9; }
          90%  { opacity: 0.75; }
          100% { transform: translateY(108vh) translateX(60px) rotate(420deg); opacity: 0; }
        }
        @keyframes marquee {
          from { transform: translateX(0); }
          to   { transform: translateX(-50%); }
        }
        @keyframes grow {
          from { transform: scaleY(0); }
          to   { transform: scaleY(1); }
        }
        @keyframes twinkle {
          0%, 100% { opacity: 0.25; }
          50%      { opacity: 1; }
        }
      `}</style>
    </div>
  );
}

/* ---------------- 都市のシルエット ---------------- */

function Skyline() {
  // 決定的な値(SSRとクライアントで同じ描画になるよう固定)
  const buildings = [
    [0, 150, 74], [70, 196, 58], [126, 118, 66], [188, 232, 52],
    [238, 164, 70], [304, 208, 60], [360, 132, 78], [434, 250, 54],
    [484, 176, 64], [544, 214, 72], [612, 146, 58], [666, 192, 68],
    [730, 258, 56], [782, 160, 74], [852, 206, 62], [910, 138, 70],
    [976, 224, 54], [1026, 178, 66], [1088, 240, 60], [1144, 152, 72],
    [1212, 198, 58], [1266, 166, 68], [1330, 228, 54], [1380, 184, 60],
  ] as const;

  return (
    <svg
      className="absolute bottom-0 w-full"
      viewBox="0 0 1440 280"
      preserveAspectRatio="none"
      aria-hidden
    >
      {buildings.map(([x, h, w], i) => (
        <g key={x}>
          <rect x={x} y={280 - h} width={w} height={h} fill="#080c14" />
          {/* 窓明かり */}
          {Array.from({ length: Math.floor(h / 26) }).map((_, r) =>
            Array.from({ length: Math.floor(w / 20) }).map((_, c) => {
              const lit = (i * 7 + r * 3 + c * 5) % 4 === 0;
              if (!lit) return null;
              return (
                <rect
                  key={`${r}-${c}`}
                  x={x + 7 + c * 20}
                  y={280 - h + 12 + r * 26}
                  width={6}
                  height={9}
                  fill="#ffd28a"
                  opacity={0.55}
                  className="motion-safe:animate-[twinkle_ease-in-out_infinite]"
                  style={{
                    animationDuration: `${3 + ((i + r + c) % 5)}s`,
                    animationDelay: `${((i + r * 2 + c) % 7) * 0.4}s`,
                  }}
                />
              );
            })
          )}
        </g>
      ))}
      {/* 東京タワー風 */}
      <path d="M700,280 L714,120 L728,280 Z" fill="#0d1420" />
      <path d="M711,124 L717,124 L716,86 L712,86 Z" fill="#0d1420" />
      <circle cx="714" cy="82" r="3" fill="#ff6b5a" className="motion-safe:animate-[twinkle_2s_ease-in-out_infinite]" />
    </svg>
  );
}

/* ---------------- ローソク足 ---------------- */

function Candles() {
  // [高値, 安値, 始値, 終値] を 0-100 のスケールで固定指定
  const data = [
    [62, 38, 44, 58], [70, 46, 58, 50], [66, 40, 50, 62], [78, 54, 62, 74],
    [80, 58, 74, 64], [72, 44, 64, 52], [68, 40, 52, 66], [84, 60, 66, 80],
    [90, 68, 80, 72], [82, 58, 72, 78], [94, 70, 78, 90], [98, 76, 90, 84],
  ] as const;

  return (
    <svg
      className="absolute bottom-[19%] left-1/2 w-[min(760px,86vw)] -translate-x-1/2 opacity-[0.55]"
      viewBox="0 0 480 120"
      aria-hidden
    >
      {data.map(([hi, lo, op, cl], i) => {
        const x = 16 + i * 38;
        const up = cl >= op;
        const color = up ? "#34d399" : "#f87171";
        const top = 120 - Math.max(op, cl);
        const bodyH = Math.max(3, Math.abs(cl - op));
        return (
          <g
            key={i}
            className="origin-bottom motion-safe:animate-[grow_ease-out_forwards]"
            style={{
              animationDuration: "0.5s",
              animationDelay: `${0.35 + i * 0.09}s`,
              transform: "scaleY(0)",
            }}
          >
            <line x1={x + 9} x2={x + 9} y1={120 - hi} y2={120 - lo} stroke={color} strokeWidth={1.6} />
            <rect x={x} y={top} width={18} height={bodyH} fill={color} rx={1.5} />
          </g>
        );
      })}
    </svg>
  );
}

/* ---------------- 桜 ---------------- */

function Sakura() {
  const petals = Array.from({ length: 26 }, (_, i) => ({
    left: (i * 37) % 100,
    delay: (i % 13) * 0.9,
    dur: 9 + (i % 6) * 1.6,
    size: 7 + (i % 4) * 3,
    op: 0.4 + (i % 5) * 0.1,
  }));

  return (
    <div className="absolute inset-0" aria-hidden>
      {petals.map((p, i) => (
        <span
          key={i}
          className="absolute top-0 block motion-safe:animate-[fall_linear_infinite]"
          style={{
            left: `${p.left}%`,
            width: p.size,
            height: p.size * 0.85,
            opacity: p.op,
            background: "#ffb7c5",
            borderRadius: "100% 0 100% 0",
            animationDuration: `${p.dur}s`,
            animationDelay: `-${p.delay}s`,
          }}
        />
      ))}
    </div>
  );
}

/* ---------------- ティッカー ---------------- */

const TICKER = [
  ["日経平均", "42,318.60", "+1.24%", true],
  ["TOPIX", "2,984.12", "+0.86%", true],
  ["7203 トヨタ", "3,124", "+1.68%", true],
  ["6758 ソニーG", "3,742", "-0.42%", false],
  ["8035 東エレク", "30,120", "+5.87%", true],
  ["9433 KDDI", "4,985", "+0.31%", true],
  ["4568 第一三共", "5,012", "-4.35%", false],
  ["6501 日立", "4,506", "+2.14%", true],
  ["8306 三菱UFJ", "1,842", "+0.94%", true],
  ["USD/JPY", "148.62", "+0.18%", true],
] as const;

function Ticker() {
  return (
    <div className="absolute inset-x-0 top-0 overflow-hidden border-b border-white/10 bg-black/40 py-2 backdrop-blur-sm">
      <div className="flex w-max motion-safe:animate-[marquee_38s_linear_infinite]">
        {[0, 1].map((dup) => (
          <div key={dup} className="flex shrink-0">
            {TICKER.map(([name, price, chg, up]) => (
              <span
                key={`${dup}-${name}`}
                className="flex items-baseline gap-2 whitespace-nowrap px-5 text-[12px]"
              >
                <span className="font-medium text-white/70">{name}</span>
                <span className="tnum text-white/90">{price}</span>
                <span className={up ? "tnum text-emerald-400" : "tnum text-red-400"}>
                  {chg}
                </span>
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
