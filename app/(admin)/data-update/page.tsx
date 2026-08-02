"use client";

// ============================================================
// データ更新画面(要件2: J-Quants Premium API連携)
//
// ・初回一括取得の進捗
// ・毎営業日の自動更新の実行結果
// ・API制限/再試行/途中再開の状態
// ・重複・欠損・訂正データの検出結果
//
// デモのため、再取得ボタンは実際のAPIを呼ばず、
// 画面上で「実行中 → 成功」の遷移のみを再現します。
// ============================================================

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
  Stat,
  Table,
  Td,
  Th,
  cx,
  statusTone,
} from "@/components/ui";
import {
  ERROR_LOGS,
  TODAY,
  UPDATE_JOBS,
  num,
} from "@/lib/mock-data";
import type { JobStatus } from "@/lib/types";

/** 初回一括取得(ヒストリカルデータ)の進捗 */
const INITIAL_LOAD = [
  { dataset: "銘柄マスタ", years: "—", progress: 1, rows: 3982 },
  { dataset: "日次株価", years: "2016-2026", progress: 1, rows: 10_284_531 },
  { dataset: "財務データ", years: "2016-2026", progress: 1, rows: 168_204 },
  { dataset: "決算日程", years: "2016-2026", progress: 1, rows: 142_880 },
  { dataset: "信用取引", years: "2016-2026", progress: 0.82, rows: 1_842_006 },
  { dataset: "指数データ", years: "2016-2026", progress: 1, rows: 24_610 },
];

/** 重複・欠損・訂正データの検出結果 */
const DATA_QUALITY = [
  {
    type: "訂正データ",
    count: 2,
    tone: "info" as const,
    detail: "財務データ2件で訂正を検出。旧値を履歴保存のうえ最新値へ更新しました。",
  },
  {
    type: "欠損データ",
    count: 1,
    tone: "warn" as const,
    detail: "銘柄 4485 の四半期データが未取得。次回更新時に自動で再取得します。",
  },
  {
    type: "重複データ",
    count: 0,
    tone: "success" as const,
    detail: "主キー制約と取得前ハッシュ比較により、重複登録は発生していません。",
  },
];

export default function DataUpdatePage() {
  const [jobs, setJobs] = useState(UPDATE_JOBS);
  const [running, setRunning] = useState<string | null>(null);

  /** 再取得ボタン: 状態遷移のみを再現(実APIは呼びません) */
  const rerun = (id: string) => {
    setRunning(id);
    setJobs((prev) =>
      prev.map((j) =>
        j.id === id
          ? { ...j, status: "実行中" as JobStatus, message: "再取得しています…" }
          : j
      )
    );

    window.setTimeout(() => {
      setJobs((prev) =>
        prev.map((j) =>
          j.id === id
            ? {
                ...j,
                status: "成功" as JobStatus,
                records: 3874,
                durationSec: 41,
                message: "中断地点から再開し、取得を完了しました",
              }
            : j
        )
      );
      setRunning(null);
    }, 1800);
  };

  const runAll = () => {
    const target = jobs.find((j) => j.status === "エラー" || j.status === "待機中");
    if (target) rerun(target.id);
  };

  return (
    <>
      <PageHeader
        eyebrow="要件2 — J-Quants Premium API連携"
        title="データ更新"
        description="過去データの初回一括登録と、毎営業日の追加更新を管理します。API制限・再試行・途中再開に対応し、処理の履歴はすべて保存されます。"
        action={
          <Button onClick={runAll} disabled={running !== null}>
            {running ? "実行中…" : "未完了のジョブを再実行"}
          </Button>
        }
      />

      <DemoNote>
        デモのため、「再取得」ボタンは実際の J-Quants API を呼び出しません。押すと「実行中 →
        成功」の画面遷移のみを再現します。本番では中断地点(チェックポイント)から自動で再開します。
      </DemoNote>

      <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat label="次回自動実行" value="02:00" sub="毎営業日 / GitHub Actions" />
        <Stat label="本日の取得件数" value={num(4563)} sub={`${TODAY} 02:00 実行分`} />
        <Stat label="API呼び出し回数" value={num(1284)} sub="本日 / 上限の 43%" />
        <Stat label="平均処理時間" value="4分12秒" sub="直近30営業日の平均" />
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        {/* ---------- 本日のジョブ ---------- */}
        <Card className="lg:col-span-3">
          <CardHeader
            title="本日の取得ジョブ"
            description="データ種別ごとに J-Quants API のエンドポイントを分けて実行します。失敗したジョブは個別に再実行できます。"
          />
          <Table>
            <thead>
              <tr>
                <Th>データ種別</Th>
                <Th>エンドポイント</Th>
                <Th>状態</Th>
                <Th align="right">取得件数</Th>
                <Th align="right">所要</Th>
                <Th>開始時刻</Th>
                <Th>メッセージ</Th>
                <Th align="center">操作</Th>
              </tr>
            </thead>
            <tbody>
              {jobs.map((j) => (
                <tr key={j.id} className="hover:bg-ink-50/60">
                  <Td className="whitespace-nowrap font-medium text-ink-900">
                    {j.dataset}
                  </Td>
                  <Td>
                    <code className="whitespace-nowrap rounded bg-ink-100 px-1.5 py-0.5 text-[11.5px] text-ink-600">
                      {j.endpoint}
                    </code>
                  </Td>
                  <Td>
                    <Badge tone={statusTone(j.status)}>{j.status}</Badge>
                  </Td>
                  <Td align="right">{j.records ? num(j.records) : "—"}</Td>
                  <Td align="right">{j.durationSec ? `${j.durationSec}秒` : "—"}</Td>
                  <Td className="tnum whitespace-nowrap text-[12px] text-ink-500">
                    {j.startedAt}
                  </Td>
                  <Td className="max-w-[260px] text-[12px] text-ink-500">
                    {j.message}
                  </Td>
                  <Td align="center">
                    {j.status === "エラー" || j.status === "待機中" ? (
                      <Button
                        variant="secondary"
                        onClick={() => rerun(j.id)}
                        disabled={running !== null}
                        className="px-2.5 py-1 text-[12px]"
                      >
                        再取得
                      </Button>
                    ) : (
                      <span className="text-[12px] text-ink-300">—</span>
                    )}
                  </Td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Card>

        {/* ---------- 初回一括取得 ---------- */}
        <Card className="lg:col-span-2">
          <CardHeader
            title="初回一括取得(ヒストリカルデータ)"
            description="契約プランで取得可能な過去10年分を、レート制限に配慮しながら順次登録します。中断しても途中から再開できます。"
          />
          <CardBody className="space-y-4">
            {INITIAL_LOAD.map((d) => (
              <div key={d.dataset}>
                <div className="mb-1.5 flex items-baseline justify-between gap-3">
                  <span className="text-[13px] font-medium text-ink-900">
                    {d.dataset}
                    <span className="ml-2 text-[11.5px] font-normal text-ink-400">
                      {d.years}
                    </span>
                  </span>
                  <span className="tnum shrink-0 text-[12px] text-ink-500">
                    {num(d.rows)} 行 ・{" "}
                    <span
                      className={cx(
                        "font-semibold",
                        d.progress === 1 ? "text-emerald-600" : "text-accent"
                      )}
                    >
                      {Math.round(d.progress * 100)}%
                    </span>
                  </span>
                </div>
                <MiniBar
                  ratio={d.progress}
                  tone={d.progress === 1 ? "gain" : "accent"}
                />
              </div>
            ))}
          </CardBody>
        </Card>

        {/* ---------- データ品質 ---------- */}
        <Card>
          <CardHeader
            title="データ品質チェック"
            description="重複・欠損・訂正を自動検出します。"
          />
          <CardBody className="space-y-3">
            {DATA_QUALITY.map((q) => (
              <div
                key={q.type}
                className="rounded-lg border border-ink-100 px-3.5 py-3"
              >
                <div className="mb-1.5 flex items-center justify-between">
                  <span className="text-[13px] font-medium text-ink-900">
                    {q.type}
                  </span>
                  <Badge tone={q.tone}>{q.count} 件</Badge>
                </div>
                <p className="text-[11.5px] leading-relaxed text-ink-500">
                  {q.detail}
                </p>
              </div>
            ))}
          </CardBody>
        </Card>

        {/* ---------- API制限 ---------- */}
        <Card>
          <CardHeader
            title="API制限への対応"
            description="J-Quants側の制限に合わせた制御を行います。"
          />
          <CardBody className="space-y-3 text-[12.5px] leading-relaxed text-ink-600">
            <Item title="リクエスト間隔の自動調整">
              同時実行数を制限し、一定間隔でリクエストを送信します。
            </Item>
            <Item title="指数バックオフ再試行">
              429/503 応答時は待機時間を 2 倍ずつ延ばしながら最大5回まで再試行します。
            </Item>
            <Item title="チェックポイントによる再開">
              処理済みの銘柄・日付をDBに保存するため、中断しても続きから再開できます。
            </Item>
            <Item title="実行ログの保存">
              すべての実行結果とエラーをDBに保存し、この画面から確認できます。
            </Item>
          </CardBody>
        </Card>

        {/* ---------- エラー履歴 ---------- */}
        <Card className="lg:col-span-2">
          <CardHeader
            title="エラー履歴"
            description="過去に発生したエラーと、その解決状況の一覧です。"
          />
          <Table>
            <thead>
              <tr>
                <Th>発生日時</Th>
                <Th>対象</Th>
                <Th>コード</Th>
                <Th>内容</Th>
                <Th align="center">再試行</Th>
                <Th>状態</Th>
              </tr>
            </thead>
            <tbody>
              {ERROR_LOGS.map((e) => (
                <tr key={e.id} className="hover:bg-ink-50/60">
                  <Td className="tnum whitespace-nowrap text-[12px]">
                    {e.occurredAt}
                  </Td>
                  <Td className="whitespace-nowrap font-medium text-ink-900">
                    {e.dataset}
                  </Td>
                  <Td>
                    <code className="whitespace-nowrap rounded bg-ink-100 px-1.5 py-0.5 text-[11.5px] text-ink-600">
                      {e.code}
                    </code>
                  </Td>
                  <Td className="max-w-[320px] text-[12px] text-ink-500">
                    {e.message}
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
      </div>
    </>
  );
}

function Item({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="flex gap-2.5">
      <span aria-hidden className="mt-1 shrink-0 text-[10px] text-accent">
        ●
      </span>
      <p>
        <span className="font-medium text-ink-800">{title}</span>
        <br />
        {children}
      </p>
    </div>
  );
}
