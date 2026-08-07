"use client";

// ============================================================
// 実績記録画面(要件6)
//
// ・候補銘柄、分析結果、判定理由を保存
// ・購入日/購入価格/株数/売却日/売却価格/損益を登録
// ・予測結果と実績を比較
// ・月別/年別/条件別の集計
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
  statusTone,
} from "@/components/ui";
import { useToast } from "@/components/toast";
import { downloadCsv } from "@/lib/csv";
import {
  CONDITION_TEMPLATES,
  MONTHLY_SUMMARY,
  STOCKS,
  TODAY,
  TRADE_RECORDS,
  num,
  pct,
  yen,
} from "@/lib/mock-data";

/** 条件テンプレート別の成績(要件6: 条件別の集計) */
const BY_CONDITION = [
  {
    name: "決算3営業日前 × 割安大型株",
    trades: 34,
    winRatePct: 67.6,
    avgPct: 2.31,
    pnl: 684_200,
  },
  {
    name: "決算前 出来高急増",
    trades: 28,
    winRatePct: 57.1,
    avgPct: 1.42,
    pnl: 312_800,
  },
  {
    name: "高配当 × 好財務",
    trades: 19,
    winRatePct: 63.2,
    avgPct: 1.18,
    pnl: 188_400,
  },
];

export default function RecordsPage() {
  const { push } = useToast();
  const [showForm, setShowForm] = useState(false);

  const save = () => {
    setShowForm(false);
    push({
      kind: "success",
      title: "実績を登録しました",
      body: "本番環境では trade_records テーブルに保存され、集計に即時反映されます。",
    });
  };

  const exportCsv = () => {
    downloadCsv(
      `実績記録_${TODAY}.csv`,
      [
        "コード", "銘柄名", "判定理由", "購入日", "購入価格", "株数",
        "売却日", "売却価格", "予測損益率(%)", "実績損益率(%)", "損益(円)", "状態",
      ],
      TRADE_RECORDS.map((r) => [
        r.code, r.name, r.reason, r.buyDate, r.buyPrice, r.shares,
        r.sellDate, r.sellPrice, r.predictedReturnPct, r.actualReturnPct, r.pnl, r.status,
      ])
    );
    push({ kind: "success", title: "CSVを出力しました", body: `${TRADE_RECORDS.length}件の実績をダウンロードしました。` });
  };

  const closed = TRADE_RECORDS.filter((r) => r.status === "決済済");
  const holding = TRADE_RECORDS.filter((r) => r.status === "保有中");
  const totalPnl = closed.reduce((s, r) => s + (r.pnl ?? 0), 0);
  const wins = closed.filter((r) => (r.pnl ?? 0) > 0).length;
  const winRate = closed.length ? (wins / closed.length) * 100 : 0;

  // 予測と実績の平均乖離
  const gap =
    closed.reduce(
      (s, r) => s + ((r.actualReturnPct ?? 0) - r.predictedReturnPct),
      0
    ) / (closed.length || 1);

  return (
    <>
      <PageHeader
        eyebrow="要件6 — 実績記録"
        title="実績記録"
        description="抽出した候補銘柄と判定理由、実際の売買内容を記録します。予測と実績を突き合わせることで、どの条件が機能しているかを検証できます。"
        action={
          <Button onClick={() => setShowForm((v) => !v)}>
            {showForm ? "フォームを閉じる" : "＋ 実績を登録"}
          </Button>
        }
      />

      <DemoNote>
        入力フォームは表示のみで、保存は行いません。本番では入力内容が Supabase に保存され、下の集計へ即時反映されます。
      </DemoNote>

      <div className="mb-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat
          label="通算損益(決済済)"
          value={yen(totalPnl)}
          sub={`${closed.length}件の決済`}
          tone={totalPnl >= 0 ? "gain" : "loss"}
        />
        <Stat label="勝率" value={`${winRate.toFixed(1)}%`} sub={`${wins}勝 ${closed.length - wins}敗`} />
        <Stat label="保有中" value={`${holding.length} 銘柄`} sub="評価損益は日次で更新" />
        <Stat
          label="予測との平均乖離"
          value={pct(gap)}
          sub="実績 − 予測"
          tone={gap >= 0 ? "gain" : "loss"}
        />
      </div>

      {/* ---------- 登録フォーム ---------- */}
      {showForm && (
        <Card className="mb-5">
          <CardHeader
            title="実績の登録"
            description="抽出結果から銘柄を選ぶと、判定理由と予測損益率が自動で引き継がれます。"
          />
          <CardBody>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <Field label="銘柄">
                <select className={inputClass} defaultValue={STOCKS[0].code}>
                  {STOCKS.slice(0, 12).map((s) => (
                    <option key={s.code} value={s.code}>
                      {s.code} {s.name}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="抽出条件">
                <select className={inputClass}>
                  {CONDITION_TEMPLATES.map((t) => (
                    <option key={t.id}>{t.name}</option>
                  ))}
                </select>
              </Field>
              <Field label="購入日">
                <input type="date" className={inputClass} defaultValue="2026-07-30" />
              </Field>
              <Field label="購入価格(円)">
                <input className={inputClass} defaultValue="4,985" />
              </Field>
              <Field label="株数">
                <input className={inputClass} defaultValue="200" />
              </Field>
              <Field label="売却日" hint="未決済の場合は空欄">
                <input type="date" className={inputClass} />
              </Field>
              <Field label="売却価格(円)">
                <input className={inputClass} placeholder="未決済" />
              </Field>
              <Field label="予測損益率(%)" hint="バックテスト結果から自動入力">
                <input className={inputClass} defaultValue="1.4" />
              </Field>
              <div className="sm:col-span-2 lg:col-span-4">
                <Field
                  label="判定理由"
                  hint="なぜこの銘柄を選んだかを残すことで、後から条件の妥当性を検証できます"
                >
                  <textarea
                    className={cx(inputClass, "h-20 resize-none leading-relaxed")}
                    defaultValue="決算3営業日前・高配当・自己資本比率良好。"
                  />
                </Field>
              </div>
            </div>
            <div className="mt-4 flex gap-2">
              <Button onClick={save}>保存</Button>
              <Button variant="secondary" onClick={() => setShowForm(false)}>
                キャンセル
              </Button>
            </div>
          </CardBody>
        </Card>
      )}

      {/* ---------- 実績一覧 ---------- */}
      <Card className="mb-5">
        <CardHeader
          title="売買実績の一覧"
          description="判定理由もあわせて保存されるため、後から「なぜこの銘柄を選んだか」を振り返れます。"
          action={
            <Button
              variant="secondary"
              onClick={exportCsv}
              className="px-2.5 py-1.5 text-[12px]"
            >
              CSV出力
            </Button>
          }
        />
        <Table>
          <thead>
            <tr>
              <Th>銘柄</Th>
              <Th>判定理由</Th>
              <Th>購入日</Th>
              <Th align="right">購入価格</Th>
              <Th align="right">株数</Th>
              <Th>売却日</Th>
              <Th align="right">売却価格</Th>
              <Th align="right">予測</Th>
              <Th align="right">実績</Th>
              <Th align="right">乖離</Th>
              <Th align="right">損益</Th>
              <Th>状態</Th>
            </tr>
          </thead>
          <tbody>
            {TRADE_RECORDS.map((r) => (
              <tr key={r.id} className="hover:bg-ink-50/60">
                <Td className="whitespace-nowrap">
                  <span className="tnum text-[12px] font-medium text-ink-900">
                    {r.code}
                  </span>
                  <span className="block text-[11.5px] text-ink-500">{r.name}</span>
                </Td>
                <Td className="max-w-[280px] text-[11.5px] leading-relaxed text-ink-500">
                  {r.reason}
                </Td>
                <Td className="tnum whitespace-nowrap text-[12px]">{r.buyDate}</Td>
                <Td align="right">{num(r.buyPrice)}</Td>
                <Td align="right">{num(r.shares)}</Td>
                <Td className="tnum whitespace-nowrap text-[12px]">
                  {r.sellDate ?? "—"}
                </Td>
                <Td align="right">{r.sellPrice ? num(r.sellPrice) : "—"}</Td>
                <Td align="right" className="text-ink-500">
                  {pct(r.predictedReturnPct, 1)}
                </Td>
                <Td align="right">
                  {r.actualReturnPct !== null ? (
                    <PnlText value={r.actualReturnPct} format={(n) => pct(n)} />
                  ) : (
                    "—"
                  )}
                </Td>
                <Td align="right">
                  {r.actualReturnPct !== null ? (
                    <PnlText
                      value={r.actualReturnPct - r.predictedReturnPct}
                      format={(n) => pct(n)}
                    />
                  ) : (
                    "—"
                  )}
                </Td>
                <Td align="right">
                  {r.pnl !== null ? <PnlText value={r.pnl} format={yen} /> : "—"}
                </Td>
                <Td>
                  <Badge tone={statusTone(r.status)}>{r.status}</Badge>
                </Td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Card>

      <div className="grid gap-5 lg:grid-cols-2">
        {/* ---------- 月別集計 ---------- */}
        <Card>
          <CardHeader
            title="月別集計"
            description="予測平均と実績平均を並べ、乖離の傾向を確認します。"
          />
          <Table>
            <thead>
              <tr>
                <Th>月</Th>
                <Th align="right">取引数</Th>
                <Th align="right">勝率</Th>
                <Th align="right">予測</Th>
                <Th align="right">実績</Th>
                <Th align="right">損益</Th>
              </tr>
            </thead>
            <tbody>
              {MONTHLY_SUMMARY.map((m) => (
                <tr key={m.month} className="hover:bg-ink-50/60">
                  <Td className="tnum font-medium text-ink-900">{m.month}</Td>
                  <Td align="right">{m.trades}</Td>
                  <Td align="right">{m.winRatePct.toFixed(1)}%</Td>
                  <Td align="right" className="text-ink-500">
                    {pct(m.predictedAvgPct, 1)}
                  </Td>
                  <Td align="right">
                    <PnlText value={m.actualAvgPct} format={(n) => pct(n)} />
                  </Td>
                  <Td align="right">
                    <PnlText value={m.pnl} format={yen} />
                  </Td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Card>

        {/* ---------- 条件別集計 ---------- */}
        <Card>
          <CardHeader
            title="抽出条件別の成績"
            description="どの条件が実際に機能しているかを比較できます。"
          />
          <CardBody className="space-y-4">
            {BY_CONDITION.map((c) => (
              <div key={c.name} className="rounded-lg border border-ink-100 px-4 py-3">
                <div className="mb-2 flex items-start justify-between gap-3">
                  <span className="text-[13px] font-medium text-ink-900">
                    {c.name}
                  </span>
                  <Badge tone={c.winRatePct >= 60 ? "success" : "neutral"}>
                    勝率 {c.winRatePct.toFixed(1)}%
                  </Badge>
                </div>
                <MiniBar
                  ratio={c.winRatePct / 100}
                  tone={c.winRatePct >= 60 ? "gain" : "accent"}
                />
                <div className="mt-2 flex justify-between text-[12px] text-ink-500">
                  <span>{c.trades}件の取引</span>
                  <span className="tnum">
                    平均 {pct(c.avgPct)} ・ 累計{" "}
                    <PnlText value={c.pnl} format={yen} />
                  </span>
                </div>
              </div>
            ))}

            <p className="rounded-lg bg-ink-50 px-3.5 py-2.5 text-[11.5px] leading-relaxed text-ink-500">
              条件ごとの成績を継続的に記録することで、
              <span className="font-medium text-ink-700">
                バックテスト上の想定と実運用の差
              </span>
              を把握し、抽出条件の見直しに活用できます。
            </p>
          </CardBody>
        </Card>
      </div>
    </>
  );
}
