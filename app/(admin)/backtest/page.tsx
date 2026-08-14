"use client";

// ============================================================
// バックテスト画面(要件4)
//
// ・指定日購入 / 指定日売却の損益計算
// ・複数の保有期間を一括比較
// ・総損益・平均損益率・勝率・中央値・最大損失
//   最大ドローダウン・最大連敗・必要資金
// ・同時保有数 / 市場別 / 業種別 / 期間別の成績
// ・手数料・スリッページを設定可能
// ・結果のCSV出力
//
// デモのため、実行ボタンは事前計算済みのサンプル結果を表示します。
// 本番ではバックグラウンドジョブで非同期実行します。
// ============================================================

import { useState } from "react";
import {
  Badge,
  Button,
  Card,
  CardBody,
  CardHeader,
  DemoNote,
  Field,
  MiniBar,
  PageHeader,
  PnlText,
  Stat,
  Table,
  Td,
  Th,
  cx,
  inputClass,
} from "@/components/ui";
import { useToast } from "@/components/toast";
import { downloadCsv } from "@/lib/csv";
import {
  BACKTEST_BY_MARKET,
  BACKTEST_BY_PERIOD,
  BACKTEST_BY_SECTOR,
  BACKTEST_RESULTS,
  BACKTEST_TRADES,
  CONDITION_TEMPLATES,
  EQUITY_CURVE,
  TODAY,
  num,
  pct,
  yen,
} from "@/lib/mock-data";
import type { BreakdownRow } from "@/lib/types";

type Phase = "idle" | "running" | "done";

export default function BacktestPage() {
  const { push } = useToast();
  const [phase, setPhase] = useState<Phase>("done");
  const [progress, setProgress] = useState(100);
  const [selectedDays, setSelectedDays] = useState(5);

  const run = () => {
    setPhase("running");
    setProgress(0);
    let p = 0;
    const timer = window.setInterval(() => {
      p += 4 + Math.random() * 9;
      if (p >= 100) {
        window.clearInterval(timer);
        setProgress(100);
        setPhase("done");
        push({
          kind: "success",
          title: "バックテストが完了しました",
          body: "412件の取引を5パターンの保有期間で検証しました。",
        });
      } else {
        setProgress(p);
      }
    }, 90);
  };

  /** 保有期間別の比較結果をCSV出力 */
  const exportSummary = () => {
    downloadCsv(
      `バックテスト結果_${TODAY}.csv`,
      [
        "保有期間(営業日)", "取引数", "総損益(円)", "平均損益率(%)", "勝率(%)",
        "中央値(%)", "最大損失(円)", "最大ドローダウン(%)", "最大連敗",
        "必要資金(円)", "シャープレシオ",
      ],
      BACKTEST_RESULTS.map((r) => [
        r.holdingDays, r.trades, r.totalPnl, r.avgReturnPct, r.winRatePct,
        r.medianReturnPct, r.maxLoss, r.maxDrawdownPct, r.maxConsecutiveLosses,
        r.requiredCapital, r.sharpe,
      ])
    );
    push({ kind: "success", title: "CSVを出力しました", body: "保有期間別の比較結果をダウンロードしました。" });
  };

  /** 取引明細をCSV出力 */
  const exportTrades = () => {
    downloadCsv(
      `取引明細_${TODAY}.csv`,
      ["コード", "銘柄名", "業種", "購入日", "購入価格", "売却日", "売却価格", "株数", "損益(円)", "損益率(%)"],
      BACKTEST_TRADES.map((t) => [
        t.code, t.name, t.sector, t.buyDate, t.buyPrice,
        t.sellDate, t.sellPrice, t.shares, t.pnl, t.returnPct,
      ])
    );
    push({
      kind: "success",
      title: "取引明細をCSV出力しました",
      body: "本番では全412件が出力されます(デモは18件)。",
    });
  };

  const best = BACKTEST_RESULTS.reduce((a, b) => (b.sharpe > a.sharpe ? b : a));
  const current =
    BACKTEST_RESULTS.find((r) => r.holdingDays === selectedDays) ?? BACKTEST_RESULTS[2];

  const trades = BACKTEST_TRADES;
  const maxAbsPnl = Math.max(...EQUITY_CURVE.map((p) => Math.abs(p.value)));

  return (
    <>
      <PageHeader
        eyebrow="要件4 — バックテスト機能"
        title="バックテスト"
        description="抽出した銘柄群に対し、指定日に購入・指定日に売却した場合の損益を検証します。複数の保有期間を一括で比較し、最適な条件を探せます。"
        action={
          <Button onClick={run} disabled={phase === "running"}>
            {phase === "running" ? "実行中…" : "バックテストを実行"}
          </Button>
        }
      />

      <DemoNote>
        「バックテストを実行」を押すと処理の進行イメージを再現します(計算は行わず、サンプル結果を表示します)。本番では大量シミュレーションをバックグラウンドで非同期実行し、完了時に通知します。
      </DemoNote>

      {/* ---------- 実行条件 ---------- */}
      <Card className="mb-6">
        <CardHeader
          title="実行条件"
          description="対象銘柄群・売買タイミング・コストを指定します。手数料とスリッページ(価格差)も反映されます。"
        />
        <CardBody>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Field label="対象銘柄群">
              <select className={inputClass} defaultValue={CONDITION_TEMPLATES[0].name}>
                {CONDITION_TEMPLATES.map((t) => (
                  <option key={t.id}>{t.name}</option>
                ))}
              </select>
            </Field>
            <Field label="検証期間(開始)">
              <input type="date" className={inputClass} defaultValue="2025-08-01" />
            </Field>
            <Field label="検証期間(終了)">
              <input type="date" className={inputClass} defaultValue="2026-07-31" />
            </Field>
            <Field label="購入タイミング">
              <select className={inputClass} defaultValue="決算発表3営業日前の始値">
                <option>決算発表3営業日前の始値</option>
                <option>決算発表前営業日の終値</option>
                <option>抽出翌営業日の始値</option>
              </select>
            </Field>
            <Field label="保有期間(複数選択で一括比較)">
              <input
                className={inputClass}
                defaultValue="1, 3, 5, 10, 20 営業日"
                readOnly
              />
            </Field>
            <Field label="1銘柄あたり投資額">
              <input className={inputClass} defaultValue="500,000" />
            </Field>
            <Field label="売買手数料(往復)" hint="約定代金に対する料率">
              <input className={inputClass} defaultValue="0.05 %" />
            </Field>
            <Field label="スリッページ(価格差)" hint="想定より不利な価格で約定する前提">
              <input className={inputClass} defaultValue="0.10 %" />
            </Field>
            <Field label="同時保有数の上限">
              <input className={inputClass} defaultValue="10 銘柄" />
            </Field>
            <Field label="損切りライン">
              <input className={inputClass} defaultValue="-8.0 %" />
            </Field>
            <Field label="利益確定ライン">
              <input className={inputClass} defaultValue="設定なし" />
            </Field>
            <Field label="除外条件">
              <select className={inputClass} defaultValue="ストップ高/安の銘柄を除外">
                <option>ストップ高/安の銘柄を除外</option>
                <option>除外しない</option>
              </select>
            </Field>
          </div>

          {phase === "running" && (
            <div className="mt-5 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3.5">
              <div className="mb-2 flex items-center justify-between text-[12.5px]">
                <span className="font-medium text-blue-900">
                  シミュレーション実行中 — 412件の取引を5パターンで検証しています
                </span>
                <span className="tnum font-semibold text-blue-700">
                  {Math.round(progress)}%
                </span>
              </div>
              <MiniBar ratio={progress / 100} />
            </div>
          )}
        </CardBody>
      </Card>

      {phase !== "running" && (
        <>
          {/* ---------- サマリー ---------- */}
          <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
            <Stat
              label="総損益"
              value={yen(current.totalPnl)}
              sub={`保有期間 ${current.holdingDays}営業日 / ${current.trades}取引`}
              tone={current.totalPnl >= 0 ? "gain" : "loss"}
            />
            <Stat
              label="勝率"
              value={`${current.winRatePct.toFixed(1)}%`}
              sub={`平均損益率 ${pct(current.avgReturnPct)}`}
            />
            <Stat
              label="最大ドローダウン"
              value={`${current.maxDrawdownPct.toFixed(1)}%`}
              sub={`最大連敗 ${current.maxConsecutiveLosses}回`}
              tone="loss"
            />
            <Stat
              label="必要資金"
              value={yen(current.requiredCapital)}
              sub={`同時保有 最大10銘柄 / シャープ ${current.sharpe.toFixed(2)}`}
            />
          </div>

          {/* ---------- 保有期間別の比較 ---------- */}
          <Card className="mb-6">
            <CardHeader
              title="保有期間別の一括比較"
              description="同じ銘柄群・同じ売買条件で、保有期間だけを変えた結果を横並びで比較します。行をクリックすると上部のサマリーが切り替わります。"
              action={
                <Button
                  variant="secondary"
                  onClick={exportSummary}
                  className="px-2.5 py-1.5 text-[12px]"
                >
                  CSV出力
                </Button>
              }
            />
            <Table>
              <thead>
                <tr>
                  <Th>保有期間</Th>
                  <Th align="right">取引数</Th>
                  <Th align="right">総損益</Th>
                  <Th align="right">平均損益率</Th>
                  <Th align="right">勝率</Th>
                  <Th align="right">中央値</Th>
                  <Th align="right">最大損失</Th>
                  <Th align="right">最大DD</Th>
                  <Th align="right">最大連敗</Th>
                  <Th align="right">必要資金</Th>
                  <Th align="right">シャープ</Th>
                </tr>
              </thead>
              <tbody>
                {BACKTEST_RESULTS.map((r) => {
                  const isBest = r.holdingDays === best.holdingDays;
                  const isSelected = r.holdingDays === selectedDays;
                  return (
                    <tr
                      key={r.holdingDays}
                      onClick={() => setSelectedDays(r.holdingDays)}
                      className={cx(
                        "cursor-pointer transition",
                        isSelected ? "bg-accent/5" : "hover:bg-ink-50/60"
                      )}
                    >
                      <Td className="whitespace-nowrap font-medium text-ink-900">
                        {r.holdingDays}営業日
                        {isBest && (
                          <span className="ml-2">
                            <Badge tone="success">最良</Badge>
                          </span>
                        )}
                      </Td>
                      <Td align="right">{r.trades}</Td>
                      <Td align="right">
                        <PnlText value={r.totalPnl} format={yen} />
                      </Td>
                      <Td align="right">
                        <PnlText value={r.avgReturnPct} format={(n) => pct(n)} />
                      </Td>
                      <Td align="right">{r.winRatePct.toFixed(1)}%</Td>
                      <Td align="right">{pct(r.medianReturnPct)}</Td>
                      <Td align="right" className="text-red-600">
                        {yen(r.maxLoss)}
                      </Td>
                      <Td align="right" className="text-red-600">
                        {r.maxDrawdownPct.toFixed(1)}%
                      </Td>
                      <Td align="right">{r.maxConsecutiveLosses}回</Td>
                      <Td align="right">{yen(r.requiredCapital)}</Td>
                      <Td align="right" className="font-medium">
                        {r.sharpe.toFixed(2)}
                      </Td>
                    </tr>
                  );
                })}
              </tbody>
            </Table>
          </Card>

          {/* ---------- 資産推移 ---------- */}
          <Card className="mb-6">
            <CardHeader
              title="累積損益の推移"
              description={`保有期間 ${current.holdingDays}営業日 の場合の月次累積損益です。`}
            />
            <CardBody>
              <EquityChart points={EQUITY_CURVE} maxAbs={maxAbsPnl} />
            </CardBody>
          </Card>

          {/* ---------- 切り口別の成績 ---------- */}
          <div className="mb-6 grid gap-6 lg:grid-cols-3">
            <Breakdown title="市場別の成績" rows={BACKTEST_BY_MARKET} />
            <Breakdown title="期間別の成績" rows={BACKTEST_BY_PERIOD} />
            <Breakdown
              title="業種別の成績"
              rows={BACKTEST_BY_SECTOR.slice(0, 4)}
              note="上位4業種のみ表示"
            />
          </div>

          <Card className="mb-6">
            <CardHeader
              title="業種別の成績(全業種)"
              description="どの業種でこの戦略が機能しているかを確認できます。"
            />
            <Table>
              <thead>
                <tr>
                  <Th>業種</Th>
                  <Th align="right">取引数</Th>
                  <Th align="right">勝率</Th>
                  <Th align="right">平均損益率</Th>
                  <Th align="right">総損益</Th>
                  <Th className="w-[160px]">勝率の分布</Th>
                </tr>
              </thead>
              <tbody>
                {BACKTEST_BY_SECTOR.map((s) => (
                  <tr key={s.label} className="hover:bg-ink-50/60">
                    <Td className="whitespace-nowrap font-medium text-ink-900">
                      {s.label}
                    </Td>
                    <Td align="right">{s.trades}</Td>
                    <Td align="right">{s.winRatePct.toFixed(1)}%</Td>
                    <Td align="right">
                      <PnlText value={s.avgReturnPct} format={(n) => pct(n)} />
                    </Td>
                    <Td align="right">
                      <PnlText value={s.totalPnl} format={yen} />
                    </Td>
                    <Td>
                      <MiniBar
                        ratio={s.winRatePct / 100}
                        tone={s.winRatePct >= 60 ? "gain" : "accent"}
                      />
                    </Td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </Card>

          {/* ---------- 取引明細 ---------- */}
          <Card>
            <CardHeader
              title="取引明細"
              description="1取引ごとの購入日・購入価格・売却日・売却価格・損益です。CSVで全件ダウンロードできます。"
              action={
                <Button
                  variant="secondary"
                  onClick={exportTrades}
                  className="px-2.5 py-1.5 text-[12px]"
                >
                  CSV出力(全412件)
                </Button>
              }
            />
            <Table>
              <thead>
                <tr>
                  <Th>コード</Th>
                  <Th>銘柄名</Th>
                  <Th>業種</Th>
                  <Th>購入日</Th>
                  <Th align="right">購入価格</Th>
                  <Th>売却日</Th>
                  <Th align="right">売却価格</Th>
                  <Th align="right">株数</Th>
                  <Th align="right">損益</Th>
                  <Th align="right">損益率</Th>
                </tr>
              </thead>
              <tbody>
                {trades.map((t) => (
                  <tr key={t.id} className="hover:bg-ink-50/60">
                    <Td className="tnum font-medium text-ink-900">{t.code}</Td>
                    <Td className="whitespace-nowrap">{t.name}</Td>
                    <Td className="whitespace-nowrap text-[12px] text-ink-500">
                      {t.sector}
                    </Td>
                    <Td className="tnum whitespace-nowrap text-[12px]">{t.buyDate}</Td>
                    <Td align="right">{num(t.buyPrice)}</Td>
                    <Td className="tnum whitespace-nowrap text-[12px]">{t.sellDate}</Td>
                    <Td align="right">{num(t.sellPrice)}</Td>
                    <Td align="right">{num(t.shares)}</Td>
                    <Td align="right">
                      <PnlText value={t.pnl} format={yen} />
                    </Td>
                    <Td align="right">
                      <PnlText value={t.returnPct} format={(n) => pct(n)} />
                    </Td>
                  </tr>
                ))}
              </tbody>
            </Table>
            <CardBody className="border-t border-ink-100 text-center">
              <p className="text-[12px] text-ink-400">
                サンプルとして18件を表示しています(全412件)
              </p>
            </CardBody>
          </Card>
        </>
      )}
    </>
  );
}

/* ---------------- 切り口別の集計カード ---------------- */

function Breakdown({
  title,
  rows,
  note,
}: {
  title: string;
  rows: BreakdownRow[];
  note?: string;
}) {
  const max = Math.max(...rows.map((r) => Math.abs(r.totalPnl)));
  return (
    <Card>
      <CardHeader title={title} description={note} />
      <CardBody className="space-y-3.5">
        {rows.map((r) => (
          <div key={r.label}>
            <div className="mb-1.5 flex items-baseline justify-between gap-2">
              <span className="text-[13px] font-medium text-ink-900">{r.label}</span>
              <span className="tnum text-[12px] text-ink-500">
                {r.trades}件 ・ 勝率 {r.winRatePct.toFixed(1)}%
              </span>
            </div>
            <MiniBar ratio={Math.abs(r.totalPnl) / max} tone="gain" />
            <p className="tnum mt-1 text-right text-[12px]">
              <PnlText value={r.totalPnl} format={yen} />
            </p>
          </div>
        ))}
      </CardBody>
    </Card>
  );
}

/* ---------------- 累積損益チャート(依存ライブラリなしのSVG) ---------------- */

function EquityChart({
  points,
  maxAbs,
}: {
  points: { date: string; value: number }[];
  maxAbs: number;
}) {
  const W = 800;
  const H = 220;
  const PAD = { top: 12, right: 12, bottom: 26, left: 58 };
  const innerW = W - PAD.left - PAD.right;
  const innerH = H - PAD.top - PAD.bottom;

  const top = Math.ceil(maxAbs / 500_000) * 500_000;
  const x = (i: number) => PAD.left + (i / (points.length - 1)) * innerW;
  const y = (v: number) => PAD.top + innerH - (v / top) * innerH;

  const line = points.map((p, i) => `${i === 0 ? "M" : "L"}${x(i)},${y(p.value)}`).join(" ");
  const area = `${line} L${x(points.length - 1)},${y(0)} L${x(0)},${y(0)} Z`;

  const ticks = [0, 0.25, 0.5, 0.75, 1].map((f) => Math.round(top * f));

  return (
    <div className="scroll-x">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="h-[220px] w-full min-w-[640px]"
        role="img"
        aria-label="累積損益の推移"
      >
        {ticks.map((t) => (
          <g key={t}>
            <line
              x1={PAD.left}
              x2={W - PAD.right}
              y1={y(t)}
              y2={y(t)}
              stroke="#eceef2"
              strokeWidth={1}
            />
            <text
              x={PAD.left - 8}
              y={y(t) + 4}
              textAnchor="end"
              className="fill-ink-400 text-[10px]"
              style={{ fontVariantNumeric: "tabular-nums" }}
            >
              {(t / 10000).toLocaleString("ja-JP")}万
            </text>
          </g>
        ))}

        <path d={area} fill="#2563eb" fillOpacity={0.08} />
        <path d={line} fill="none" stroke="#2563eb" strokeWidth={2.5} strokeLinejoin="round" />

        {points.map((p, i) => (
          <circle key={p.date} cx={x(i)} cy={y(p.value)} r={3} fill="#2563eb" />
        ))}

        {points.map((p, i) =>
          i % 2 === 0 ? (
            <text
              key={p.date}
              x={x(i)}
              y={H - 8}
              textAnchor="middle"
              className="fill-ink-400 text-[10px]"
            >
              {p.date.slice(2)}
            </text>
          ) : null
        )}
      </svg>
    </div>
  );
}
