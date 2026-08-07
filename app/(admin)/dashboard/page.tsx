"use client";

// ============================================================
// ダッシュボード(要件7) — 第1段階(MVP)
//
// 朝ログインして最初に見る画面。
// 「昨夜の更新は成功したか」「エラーはあるか」を最短で確認できる構成。
// KPIカードはクリックすると該当画面へ移動します。
// ============================================================

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  Badge,
  Button,
  Card,
  CardBody,
  CardHeader,
  DemoNote,
  MiniBar,
  PageHeader,
  PnlText,
  SectionTitle,
  Stat,
  Table,
  Td,
  Th,
  cx,
  statusTone,
} from "@/components/ui";
import { useToast } from "@/components/toast";
import {
  DASHBOARD_STATS as S,
  ERROR_LOGS,
  LAST_BUSINESS_DAY,
  MONTHLY_SUMMARY,
  STOCKS,
  TODAY,
  UPDATE_HISTORY,
  UPDATE_JOBS,
  num,
  pct,
  yen,
} from "@/lib/mock-data";

export default function DashboardPage() {
  const router = useRouter();
  const { push } = useToast();
  const [refreshing, setRefreshing] = useState(false);

  const failed = UPDATE_JOBS.filter((j) => j.status === "エラー");
  const done = UPDATE_JOBS.filter((j) => j.status === "成功").length;
  const unresolved = ERROR_LOGS.filter((e) => !e.resolved);

  const candidates = [...STOCKS]
    .sort((a, b) => b.businessDaysToEarnings - a.businessDaysToEarnings)
    .slice(0, 6);

  const refresh = () => {
    setRefreshing(true);
    window.setTimeout(() => {
      setRefreshing(false);
      push({
        kind: "success",
        title: "最新の状態に更新しました",
        body: `${TODAY} 時点のデータを再読み込みしました。`,
      });
    }, 900);
  };

  return (
    <>
      <PageHeader
        eyebrow="要件7 — 管理画面 ／ 第1段階(MVP)"
        title="ダッシュボード"
        description="毎営業日の自動更新の成否、エラーの有無、データの蓄積状況をこの画面で確認します。朝いちばんに開く画面という想定です。"
        action={
          <div className="flex items-center gap-2">
            <div className="hidden text-right sm:block">
              <p className="text-[11px] text-ink-400">基準日</p>
              <p className="tnum text-[13px] font-semibold text-ink-700">{TODAY}</p>
            </div>
            <Button variant="secondary" onClick={refresh} disabled={refreshing}>
              {refreshing ? "更新中…" : "⟳ 再読み込み"}
            </Button>
          </div>
        }
      />

      <DemoNote>
        表示中の数値はすべてサンプルです。本番環境では Supabase(PostgreSQL)から取得した実データが表示されます。KPIカードはクリックすると該当画面へ移動します。
      </DemoNote>

      {/* ---------- 更新ステータス ---------- */}
      <div
        className={cx(
          "mb-6 flex flex-wrap items-center justify-between gap-4 rounded-xl border px-5 py-4 transition",
          refreshing && "opacity-60",
          failed.length > 0
            ? "border-amber-200 bg-amber-50"
            : "border-emerald-200 bg-emerald-50"
        )}
      >
        <div className="flex items-start gap-3">
          <span
            className={cx(
              "grid h-9 w-9 shrink-0 place-items-center rounded-full text-[15px] text-white",
              failed.length > 0 ? "bg-amber-500" : "bg-emerald-500"
            )}
            aria-hidden
          >
            {failed.length > 0 ? "!" : "✓"}
          </span>
          <div>
            <p className="text-[14px] font-semibold text-ink-900">
              {failed.length > 0
                ? `本日の更新は一部エラーで終了しました（${done}/${UPDATE_JOBS.length} 件成功）`
                : `本日の更新はすべて正常に完了しました（${done}/${UPDATE_JOBS.length} 件）`}
            </p>
            <p className="mt-0.5 text-[12.5px] text-ink-600">
              最終実行 {TODAY} 02:00 — 対象営業日 {LAST_BUSINESS_DAY}
              {failed.length > 0 &&
                ` ／ 未処理: ${failed.map((f) => f.dataset).join("、")}`}
            </p>
          </div>
        </div>
        <Link
          href="/data-update"
          className="rounded-lg bg-white px-3.5 py-2 text-[13px] font-medium text-ink-700 shadow-sm ring-1 ring-inset ring-ink-200 transition hover:bg-ink-50"
        >
          更新画面を開く →
        </Link>
      </div>

      {/* ---------- KPI ---------- */}
      <SectionTitle hint="クリックで詳細画面へ">主要指標</SectionTitle>
      <div className="mb-7 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat
          label="登録銘柄数"
          value={num(S.totalStocks)}
          sub="東証全上場銘柄"
          icon="◧"
          onClick={() => router.push("/screening")}
        />
        <Stat
          label="蓄積レコード数(日次株価)"
          value={num(S.totalPriceRows)}
          sub={`過去${S.yearsOfHistory}年分 / DB使用量 ${S.dbSizeGb}GB`}
          icon="⟳"
          onClick={() => router.push("/data-update")}
        />
        <Stat
          label="本日の抽出候補"
          value={`${S.candidatesToday} 銘柄`}
          sub="決算3営業日前 × 割安大型株"
          icon="⌕"
          trend={{ value: "3", up: true }}
          onClick={() => router.push("/screening")}
        />
        <Stat
          label="通算損益(実績記録)"
          value={yen(S.overallPnl)}
          sub={`勝率 ${S.overallWinRatePct}%`}
          tone="gain"
          icon="◐"
          trend={{ value: "8.4%", up: true }}
          onClick={() => router.push("/records")}
        />
      </div>

      <SectionTitle hint="毎営業日 02:00 に自動実行">本日の処理状況</SectionTitle>
      <div className="grid gap-5 lg:grid-cols-3">
        {/* ---------- 本日のジョブ ---------- */}
        <Card className="lg:col-span-2">
          <CardHeader
            title="本日のデータ取得ジョブ"
            description="データ種別ごとに実行され、失敗したものは個別に再実行できます。"
            action={
              <Link
                href="/data-update"
                className="text-[12.5px] font-medium text-accent hover:underline"
              >
                すべて表示
              </Link>
            }
          />
          <Table>
            <thead>
              <tr>
                <Th>データ種別</Th>
                <Th>状態</Th>
                <Th align="right">件数</Th>
                <Th align="right">所要</Th>
                <Th>備考</Th>
              </tr>
            </thead>
            <tbody>
              {UPDATE_JOBS.map((j) => (
                <tr key={j.id} className="transition hover:bg-ink-50/60">
                  <Td className="font-medium text-ink-900">{j.dataset}</Td>
                  <Td>
                    <Badge tone={statusTone(j.status)}>{j.status}</Badge>
                  </Td>
                  <Td align="right">{j.records ? num(j.records) : "—"}</Td>
                  <Td align="right">{j.durationSec ? `${j.durationSec}秒` : "—"}</Td>
                  <Td className="max-w-[280px] text-[12px] text-ink-500">
                    {j.message}
                  </Td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Card>

        {/* ---------- 更新履歴ミニ ---------- */}
        <Card>
          <CardHeader
            title="直近14営業日の更新"
            description="緑=全件成功 / 橙=一部エラー"
          />
          <CardBody>
            <div className="flex flex-wrap gap-1.5">
              {UPDATE_HISTORY.map((h) => (
                <div
                  key={h.date}
                  title={`${h.date}: ${h.status}`}
                  className={cx(
                    "flex h-11 w-11 cursor-default flex-col items-center justify-center rounded-lg text-[10px] font-medium transition hover:scale-105",
                    h.status === "成功"
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-amber-100 text-amber-700"
                  )}
                >
                  <span className="tnum">{h.date}</span>
                  <span aria-hidden className="text-[11px]">
                    {h.status === "成功" ? "✓" : "!"}
                  </span>
                </div>
              ))}
            </div>

            <div className="mt-5 space-y-3 border-t border-ink-200 pt-4">
              <Row
                label="未解決のエラー"
                value={`${unresolved.length} 件`}
                warn={unresolved.length > 0}
              />
              <Row
                label="未確認のPDF"
                value={`${S.unreviewedPdfs} 件`}
                warn={S.unreviewedPdfs > 0}
              />
              <Row label="登録PDF総数" value={`${num(S.totalPdfs)} 件`} />
              <div>
                <div className="mb-1.5 flex items-center justify-between text-[12px]">
                  <span className="text-ink-500">本日のAPI使用量</span>
                  <span className="tnum font-semibold text-ink-700">43%</span>
                </div>
                <MiniBar ratio={0.43} />
              </div>
            </div>
          </CardBody>
        </Card>

        {/* ---------- エラー履歴 ---------- */}
        <Card className="lg:col-span-2">
          <CardHeader
            title="エラー履歴"
            description="発生したエラーは種別・再試行回数とあわせて保存されます。"
          />
          <Table>
            <thead>
              <tr>
                <Th>発生日時</Th>
                <Th>対象</Th>
                <Th>コード</Th>
                <Th align="center">再試行</Th>
                <Th>状態</Th>
              </tr>
            </thead>
            <tbody>
              {ERROR_LOGS.map((e) => (
                <tr key={e.id} className="transition hover:bg-ink-50/60">
                  <Td className="tnum whitespace-nowrap text-[12px]">
                    {e.occurredAt}
                  </Td>
                  <Td className="font-medium text-ink-900">{e.dataset}</Td>
                  <Td>
                    <code className="rounded bg-ink-100 px-1.5 py-0.5 text-[11.5px] text-ink-600">
                      {e.code}
                    </code>
                  </Td>
                  <Td align="center">{e.retries}</Td>
                  <Td>
                    <Badge tone={e.resolved ? "success" : "danger"}>
                      {e.resolved ? "解決済" : "未解決"}
                    </Badge>
                  </Td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Card>

        {/* ---------- 決算が近い候補 ---------- */}
        <Card>
          <CardHeader
            title="決算発表が近い銘柄"
            description="抽出条件に合致した候補の一部です。"
            action={
              <Link
                href="/screening"
                className="text-[12.5px] font-medium text-accent hover:underline"
              >
                抽出画面
              </Link>
            }
          />
          <CardBody className="space-y-2.5">
            {candidates.map((s) => (
              <Link
                key={s.code}
                href="/screening"
                className="flex items-center justify-between gap-3 rounded-lg border border-ink-100 px-3 py-2.5 transition hover:border-ink-300 hover:bg-ink-50"
              >
                <div className="min-w-0">
                  <p className="truncate text-[13px] font-medium text-ink-900">
                    {s.name}
                  </p>
                  <p className="tnum text-[11.5px] text-ink-400">
                    {s.code} ・ {s.nextEarningsDate}
                  </p>
                </div>
                <div className="shrink-0 text-right">
                  <Badge tone="info">
                    {Math.abs(s.businessDaysToEarnings)}営業日前
                  </Badge>
                  <p className="tnum mt-1 text-[11.5px]">
                    <PnlText value={s.changePct} format={(n) => pct(n)} />
                  </p>
                </div>
              </Link>
            ))}
          </CardBody>
        </Card>
      </div>

      <div className="mt-7">
        <SectionTitle hint="実績記録より集計">月別の成績</SectionTitle>
        <Card>
          <CardHeader
            title="月別の実績サマリー"
            description="実際の売買記録をもとにした集計です。予測との乖離もあわせて確認できます。"
            action={
              <Link
                href="/records"
                className="text-[12.5px] font-medium text-accent hover:underline"
              >
                実績記録を開く
              </Link>
            }
          />
          <Table>
            <thead>
              <tr>
                <Th>月</Th>
                <Th align="right">取引数</Th>
                <Th align="right">勝率</Th>
                <Th align="right">予測平均</Th>
                <Th align="right">実績平均</Th>
                <Th align="right">乖離</Th>
                <Th align="right">損益</Th>
              </tr>
            </thead>
            <tbody>
              {MONTHLY_SUMMARY.map((m) => (
                <tr key={m.month} className="transition hover:bg-ink-50/60">
                  <Td className="tnum font-medium text-ink-900">{m.month}</Td>
                  <Td align="right">{m.trades}</Td>
                  <Td align="right">{m.winRatePct.toFixed(1)}%</Td>
                  <Td align="right" className="text-ink-500">
                    {pct(m.predictedAvgPct, 1)}
                  </Td>
                  <Td align="right">
                    <PnlText value={m.actualAvgPct} format={(n) => pct(n, 2)} />
                  </Td>
                  <Td align="right">
                    <PnlText
                      value={m.actualAvgPct - m.predictedAvgPct}
                      format={(n) => pct(n, 2)}
                    />
                  </Td>
                  <Td align="right">
                    <PnlText value={m.pnl} format={yen} />
                  </Td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Card>
      </div>
    </>
  );
}

function Row({
  label,
  value,
  warn,
}: {
  label: string;
  value: string;
  warn?: boolean;
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-[12.5px] text-ink-500">{label}</span>
      <span
        className={cx(
          "tnum text-[13px] font-semibold",
          warn ? "text-amber-600" : "text-ink-800"
        )}
      >
        {value}
      </span>
    </div>
  );
}
