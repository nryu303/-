"use client";

// ============================================================
// 銘柄抽出・分析画面(要件3)
//
// ・決算発表予定日を基準とした営業日計算
// ・市場/業種/時価総額/財務/株価/出来高による絞り込み
// ・条件はテンプレートとして保存し、後から変更・追加できる
//
// このデモでは、下部のフィルタが実際にサンプルデータへ適用され、
// 件数と一覧がリアルタイムに変化します。
// ============================================================

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  Badge,
  Button,
  Card,
  CardBody,
  CardHeader,
  DemoNote,
  EmptyState,
  Field,
  PageHeader,
  PnlText,
  SectionTitle,
  SortTh,
  Table,
  Td,
  Th,
  cx,
  inputClass,
  nextSort,
  type SortDir,
} from "@/components/ui";
import { useToast } from "@/components/toast";
import { downloadCsv } from "@/lib/csv";
import {
  CONDITION_FIELDS,
  CONDITION_OPERATORS,
  CONDITION_TEMPLATES,
  STOCKS,
  TODAY,
  num,
  pct,
} from "@/lib/mock-data";

const MARKETS = ["すべて", "プライム", "スタンダード", "グロース"] as const;

/** 並び替え可能な列 */
type SortKey =
  | "code"
  | "marketCap"
  | "per"
  | "pbr"
  | "dividendYield"
  | "close"
  | "changePct"
  | "volume"
  | "nextEarningsDate";

export default function ScreeningPage() {
  const { push } = useToast();

  // ---- 絞り込み条件(実際に効きます) ----
  const [market, setMarket] = useState<string>("すべて");
  const [sector, setSector] = useState<string>("すべて");
  const [minCap, setMinCap] = useState(500);
  const [maxPbr, setMaxPbr] = useState(4.0);
  const [daysBefore, setDaysBefore] = useState(0); // 0 = 指定なし
  const [keyword, setKeyword] = useState("");
  const [activeTemplate, setActiveTemplate] = useState(CONDITION_TEMPLATES[0].id);
  const [sort, setSort] = useState<{ key: SortKey; dir: SortDir }>({
    key: "marketCap",
    dir: "desc",
  });

  const sectors = useMemo(
    () => ["すべて", ...Array.from(new Set(STOCKS.map((s) => s.sector))).sort()],
    []
  );

  const results = useMemo(() => {
    const filtered = STOCKS.filter((s) => {
      if (market !== "すべて" && s.market !== market) return false;
      if (sector !== "すべて" && s.sector !== sector) return false;
      if (s.marketCap < minCap) return false;
      if (s.pbr > maxPbr) return false;
      if (daysBefore !== 0 && Math.abs(s.businessDaysToEarnings) !== daysBefore)
        return false;
      if (keyword && !s.name.includes(keyword) && !s.code.includes(keyword))
        return false;
      return true;
    });

    return filtered.sort((a, b) => {
      const av = a[sort.key];
      const bv = b[sort.key];
      const cmp =
        typeof av === "number" && typeof bv === "number"
          ? av - bv
          : String(av).localeCompare(String(bv), "ja");
      return sort.dir === "asc" ? cmp : -cmp;
    });
  }, [market, sector, minCap, maxPbr, daysBefore, keyword, sort]);

  const template = CONDITION_TEMPLATES.find((t) => t.id === activeTemplate)!;
  const onSort = (key: SortKey) => setSort((c) => nextSort(c, key));

  const resetAll = () => {
    setMarket("すべて");
    setSector("すべて");
    setMinCap(0);
    setMaxPbr(10);
    setDaysBefore(0);
    setKeyword("");
    push({ kind: "info", title: "条件をリセットしました" });
  };

  const saveTemplate = () => {
    push({
      kind: "success",
      title: "抽出条件を保存しました",
      body: "本番環境では analysis_conditions テーブルに保存され、いつでも呼び出せます。",
    });
  };

  /** 実際にCSVファイルをダウンロードします */
  const exportCsv = () => {
    downloadCsv(
      `銘柄抽出_${TODAY}.csv`,
      [
        "コード", "銘柄名", "市場", "業種", "時価総額(億円)",
        "PER", "PBR", "配当利回り(%)", "終値", "前日比(%)",
        "出来高", "決算予定日", "決算までの営業日",
      ],
      results.map((s) => [
        s.code, s.name, s.market, s.sector, s.marketCap,
        s.per, s.pbr, s.dividendYield, s.close, s.changePct,
        s.volume, s.nextEarningsDate, Math.abs(s.businessDaysToEarnings),
      ])
    );
    push({
      kind: "success",
      title: "CSVを出力しました",
      body: `${results.length}件をダウンロードしました。Excelで開けます。`,
    });
  };

  return (
    <>
      <PageHeader
        eyebrow="要件3 — 銘柄抽出・分析機能"
        title="銘柄抽出"
        description="決算発表予定日を基準とした営業日計算と、市場・業種・時価総額・財務・株価・出来高などの複合条件で銘柄を絞り込みます。条件はテンプレートとして保存でき、後から自由に追加・変更できます。"
        action={
          <div className="flex gap-2">
            <Button variant="secondary" onClick={resetAll}>
              条件をリセット
            </Button>
            <Button onClick={saveTemplate}>この条件を保存</Button>
          </div>
        }
      />

      <DemoNote>
        下の絞り込み条件は<strong>実際に動作します</strong>。市場区分やスライダーを変更すると、抽出結果の件数と一覧がその場で変化します(サンプル50銘柄に対して適用)。
      </DemoNote>

      {/* ---------- 保存済みテンプレート ---------- */}
      <Card className="mb-6">
        <CardHeader
          title="保存済みの抽出条件"
          description="よく使う条件はテンプレートとして保存し、ワンクリックで呼び出せます。"
          action={
            <Button variant="secondary" className="px-2.5 py-1.5 text-[12px]">
              ＋ 新規作成
            </Button>
          }
        />
        <CardBody>
          <div className="grid gap-3 md:grid-cols-3">
            {CONDITION_TEMPLATES.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setActiveTemplate(t.id)}
                className={cx(
                  "rounded-lg border px-4 py-3 text-left transition",
                  t.id === activeTemplate
                    ? "border-accent bg-accent/5 ring-1 ring-accent"
                    : "border-ink-200 hover:border-ink-300 hover:bg-ink-50"
                )}
              >
                <div className="mb-1.5 flex items-start justify-between gap-2">
                  <span className="text-[13px] font-semibold text-ink-900">
                    {t.name}
                  </span>
                  <Badge tone={t.id === activeTemplate ? "info" : "neutral"}>
                    {t.hitCount}件
                  </Badge>
                </div>
                <p className="text-[11.5px] leading-relaxed text-ink-500">
                  {t.description}
                </p>
                <p className="mt-2 text-[10.5px] text-ink-400">
                  最終更新 {t.updatedAt}
                </p>
              </button>
            ))}
          </div>
        </CardBody>
      </Card>

      {/* ---------- 条件ビルダー ---------- */}
      <Card className="mb-6">
        <CardHeader
          title={`条件の内訳 — ${template.name}`}
          description="条件は1行ずつ追加・削除できます。項目・演算子・値をあとから変更できる設計です。"
        />
        <CardBody>
          <div className="space-y-2.5">
            {template.rules.map((r, i) => (
              <div
                key={r.id}
                className="flex flex-wrap items-center gap-2 rounded-lg border border-ink-100 bg-ink-50/50 px-3 py-2.5"
              >
                <span className="w-10 shrink-0 text-[11px] font-semibold text-ink-400">
                  {i === 0 ? "条件" : "AND"}
                </span>
                <select
                  className={cx(inputClass, "w-auto min-w-[190px] flex-none py-1.5")}
                  defaultValue={r.field}
                >
                  {CONDITION_FIELDS.map((f) => (
                    <option key={f}>{f}</option>
                  ))}
                </select>
                <select
                  className={cx(inputClass, "w-auto min-w-[76px] flex-none py-1.5")}
                  defaultValue={r.operator}
                >
                  {CONDITION_OPERATORS.map((o) => (
                    <option key={o}>{o}</option>
                  ))}
                </select>
                <input
                  className={cx(inputClass, "w-24 flex-none py-1.5")}
                  defaultValue={r.value}
                />
                {r.unit && (
                  <span className="text-[12px] text-ink-500">{r.unit}</span>
                )}
                <button
                  type="button"
                  className="ml-auto rounded px-2 py-1 text-[12px] text-ink-400 hover:bg-red-50 hover:text-red-600"
                >
                  削除
                </button>
              </div>
            ))}
          </div>
          <Button variant="secondary" className="mt-3">
            ＋ 条件を追加
          </Button>

          <p className="mt-4 rounded-lg bg-ink-50 px-3.5 py-2.5 text-[11.5px] leading-relaxed text-ink-500">
            <span className="font-medium text-ink-700">実装上の設計:</span>{" "}
            条件は JSON 形式で <code className="rounded bg-white px-1">analysis_conditions</code>{" "}
            テーブルに保存し、実行時に動的SQLを生成します。項目を追加してもテーブル定義の変更は不要です。
          </p>
        </CardBody>
      </Card>

      {/* ---------- 絞り込み(実動作) ---------- */}
      <Card className="mb-6">
        <CardHeader
          title="絞り込み"
          description="この画面のフィルタは実際に動作します。値を変えて結果の変化をご確認ください。"
        />
        <CardBody>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <Field label="市場区分">
              <select
                className={inputClass}
                value={market}
                onChange={(e) => setMarket(e.target.value)}
              >
                {MARKETS.map((m) => (
                  <option key={m}>{m}</option>
                ))}
              </select>
            </Field>

            <Field label="業種">
              <select
                className={inputClass}
                value={sector}
                onChange={(e) => setSector(e.target.value)}
              >
                {sectors.map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
            </Field>

            <Field label="銘柄コード / 銘柄名">
              <input
                className={inputClass}
                placeholder="例: 7203 / トヨタ"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
              />
            </Field>

            <Field label={`時価総額 ${num(minCap)} 億円 以上`}>
              <input
                type="range"
                min={0}
                max={20000}
                step={100}
                value={minCap}
                onChange={(e) => setMinCap(Number(e.target.value))}
                className="w-full accent-blue-600"
              />
            </Field>

            <Field label={`PBR ${maxPbr.toFixed(1)} 倍 以下`}>
              <input
                type="range"
                min={0.5}
                max={10}
                step={0.1}
                value={maxPbr}
                onChange={(e) => setMaxPbr(Number(e.target.value))}
                className="w-full accent-blue-600"
              />
            </Field>

            <Field
              label="決算発表までの営業日数"
              hint="日本の祝日・年末年始を考慮した営業日ベースで計算します"
            >
              <select
                className={inputClass}
                value={daysBefore}
                onChange={(e) => setDaysBefore(Number(e.target.value))}
              >
                <option value={0}>指定なし</option>
                {[1, 2, 3, 4, 5, 6].map((d) => (
                  <option key={d} value={d}>
                    {d}営業日前
                  </option>
                ))}
              </select>
            </Field>
          </div>
        </CardBody>
      </Card>

      {/* ---------- 結果 ---------- */}
      <Card>
        <CardHeader
          title={`抽出結果 — ${results.length} 銘柄`}
          description={`基準日 ${TODAY} 時点。この一覧はそのままバックテストの対象銘柄群として渡せます。`}
          action={
            <div className="flex gap-2">
              <Button
                variant="secondary"
                onClick={exportCsv}
                disabled={results.length === 0}
                className="px-2.5 py-1.5 text-[12px]"
              >
                CSV出力
              </Button>
              <Link
                href="/backtest"
                className="inline-flex items-center rounded-lg bg-accent px-2.5 py-1.5 text-[12px] font-medium text-white shadow-sm hover:bg-blue-700"
              >
                この結果でバックテスト →
              </Link>
            </div>
          }
        />
        {results.length === 0 ? (
          <EmptyState
            icon="⌕"
            title="条件に合致する銘柄がありません"
            body="時価総額やPBRの条件を緩めるか、市場区分・業種の絞り込みを解除してください。"
            action={
              <Button variant="secondary" onClick={resetAll}>
                条件をリセット
              </Button>
            }
          />
        ) : (
          <Table>
            <thead>
              <tr>
                <SortTh field="code" sort={sort} onSort={onSort}>
                  コード
                </SortTh>
                <Th>銘柄名</Th>
                <Th>市場</Th>
                <Th>業種</Th>
                <SortTh field="marketCap" sort={sort} onSort={onSort} align="right">
                  時価総額
                </SortTh>
                <SortTh field="per" sort={sort} onSort={onSort} align="right">
                  PER
                </SortTh>
                <SortTh field="pbr" sort={sort} onSort={onSort} align="right">
                  PBR
                </SortTh>
                <SortTh field="dividendYield" sort={sort} onSort={onSort} align="right">
                  配当
                </SortTh>
                <SortTh field="close" sort={sort} onSort={onSort} align="right">
                  終値
                </SortTh>
                <SortTh field="changePct" sort={sort} onSort={onSort} align="right">
                  前日比
                </SortTh>
                <SortTh field="volume" sort={sort} onSort={onSort} align="right">
                  出来高
                </SortTh>
                <SortTh field="nextEarningsDate" sort={sort} onSort={onSort}>
                  決算予定日
                </SortTh>
                <Th align="center">営業日</Th>
              </tr>
            </thead>
            <tbody>
              {results.map((s) => (
                <tr key={s.code} className="hover:bg-ink-50/60">
                  <Td className="tnum font-medium text-ink-900">{s.code}</Td>
                  <Td className="whitespace-nowrap font-medium text-ink-900">
                    {s.name}
                  </Td>
                  <Td>
                    <Badge
                      tone={
                        s.market === "プライム"
                          ? "info"
                          : s.market === "グロース"
                            ? "warn"
                            : "neutral"
                      }
                    >
                      {s.market}
                    </Badge>
                  </Td>
                  <Td className="whitespace-nowrap text-[12px]">{s.sector}</Td>
                  <Td align="right">{num(s.marketCap)}億</Td>
                  <Td align="right">{s.per.toFixed(1)}</Td>
                  <Td align="right">{s.pbr.toFixed(2)}</Td>
                  <Td align="right">{s.dividendYield.toFixed(2)}%</Td>
                  <Td align="right">{num(s.close)}</Td>
                  <Td align="right">
                    <PnlText value={s.changePct} format={(n) => pct(n)} />
                  </Td>
                  <Td align="right">{num(s.volume)}</Td>
                  <Td className="tnum whitespace-nowrap text-[12px]">
                    {s.nextEarningsDate}
                  </Td>
                  <Td align="center">
                    <Badge tone="neutral">
                      {Math.abs(s.businessDaysToEarnings)}日前
                    </Badge>
                  </Td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
      </Card>
    </>
  );
}
