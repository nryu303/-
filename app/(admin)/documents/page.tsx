"use client";

// ============================================================
// PDF資料管理画面(要件5)
//
// ・PDFを日々アップロードして保存
// ・公開日/銘柄コード/会社名/記載内容/分類を登録
// ・PDFと銘柄・決算日・株価結果を紐付け
// ・文字抽出は可能な範囲で自動化
// ・抽出結果を管理画面から修正可能
//
// 「自動抽出はあくまで下書き。人が確認して確定する」という
// 運用の流れが伝わる構成にしています。
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
import {
  PDF_CATEGORIES,
  PDF_DOCUMENTS,
  num,
  pct,
} from "@/lib/mock-data";

export default function DocumentsPage() {
  const [selectedId, setSelectedId] = useState(PDF_DOCUMENTS[3].id); // 要修正の資料を初期選択
  const [filter, setFilter] = useState<string>("すべて");

  const doc = PDF_DOCUMENTS.find((d) => d.id === selectedId)!;
  const list =
    filter === "すべて"
      ? PDF_DOCUMENTS
      : PDF_DOCUMENTS.filter((d) => d.status === filter);

  const unreviewed = PDF_DOCUMENTS.filter((d) => d.status !== "確認済").length;

  return (
    <>
      <PageHeader
        eyebrow="要件5 — 外部PDF資料の管理"
        title="PDF資料管理"
        description="決算資料やIR資料のPDFをアップロードすると、銘柄コード・会社名・公開日・本文を自動で抽出して下書き登録します。抽出結果はこの画面から修正でき、修正履歴も保存されます。"
        action={<Button>PDFをアップロード</Button>}
      />

      <DemoNote>
        アップロード機能は本デモでは動作しません。実際の運用では、ドラッグ＆ドロップでPDFを登録すると
        pdfplumber によるテキスト抽出(テキスト層がない場合はOCR)が自動実行され、下の「抽出結果」に下書きが入ります。
      </DemoNote>

      <div className="mb-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat label="登録PDF総数" value={`${num(1247)} 件`} sub="Supabase Storage に保存" />
        <Stat label="未確認 / 要修正" value={`${unreviewed} 件`} sub="人による確認待ち" />
        <Stat label="自動抽出の成功率" value="92.4%" sub="銘柄コードの自動判定精度" />
        <Stat label="今月のアップロード" value="38 件" sub="2026年8月" />
      </div>

      {/* ---------- アップロード領域 ---------- */}
      <Card className="mb-5">
        <CardHeader
          title="アップロード"
          description="複数ファイルをまとめて登録できます。ファイル名からも銘柄コードを推定します。"
        />
        <CardBody>
          <div className="rounded-xl border-2 border-dashed border-ink-200 bg-ink-50/50 px-6 py-10 text-center">
            <p className="text-[28px] leading-none text-ink-300" aria-hidden>
              ▤
            </p>
            <p className="mt-3 text-[13.5px] font-medium text-ink-700">
              ここにPDFをドラッグ＆ドロップ
            </p>
            <p className="mt-1 text-[12px] text-ink-400">
              または
              <button className="mx-1 font-medium text-accent hover:underline">
                ファイルを選択
              </button>
              （PDF / 最大50MB / 複数可）
            </p>
          </div>
        </CardBody>
      </Card>

      <div className="grid gap-5 lg:grid-cols-5">
        {/* ---------- 一覧 ---------- */}
        <Card className="lg:col-span-3">
          <CardHeader
            title="登録済み資料"
            description="行をクリックすると右側に抽出結果が表示されます。"
            action={
              <select
                className={cx(inputClass, "w-auto py-1.5 text-[12px]")}
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
              >
                {["すべて", "未確認", "要修正", "確認済"].map((f) => (
                  <option key={f}>{f}</option>
                ))}
              </select>
            }
          />
          <Table>
            <thead>
              <tr>
                <Th>公開日</Th>
                <Th>ファイル名</Th>
                <Th>銘柄</Th>
                <Th>分類</Th>
                <Th align="right">確信度</Th>
                <Th>状態</Th>
              </tr>
            </thead>
            <tbody>
              {list.map((d) => (
                <tr
                  key={d.id}
                  onClick={() => setSelectedId(d.id)}
                  className={cx(
                    "cursor-pointer transition",
                    d.id === selectedId ? "bg-accent/5" : "hover:bg-ink-50/60"
                  )}
                >
                  <Td className="tnum whitespace-nowrap text-[12px]">
                    {d.publishedAt}
                  </Td>
                  <Td className="max-w-[220px]">
                    <span className="block truncate text-[12.5px] font-medium text-ink-900">
                      {d.fileName}
                    </span>
                  </Td>
                  <Td className="whitespace-nowrap">
                    <span className="tnum text-[12px] font-medium text-ink-900">
                      {d.code}
                    </span>
                    <span className="block max-w-[130px] truncate text-[11px] text-ink-400">
                      {d.company}
                    </span>
                  </Td>
                  <Td>
                    <Badge tone={d.category === "未分類" ? "warn" : "neutral"}>
                      {d.category}
                    </Badge>
                  </Td>
                  <Td align="right">
                    <span
                      className={cx(
                        "tnum font-medium",
                        d.confidence >= 90
                          ? "text-emerald-600"
                          : d.confidence >= 60
                            ? "text-amber-600"
                            : "text-red-600"
                      )}
                    >
                      {d.confidence}%
                    </span>
                  </Td>
                  <Td>
                    <Badge tone={statusTone(d.status)}>{d.status}</Badge>
                  </Td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Card>

        {/* ---------- 抽出結果の確認・修正 ---------- */}
        <Card className="lg:col-span-2">
          <CardHeader
            title="抽出結果の確認・修正"
            description="自動抽出はあくまで下書きです。内容を確認し、必要に応じて修正して確定します。"
          />
          <CardBody className="space-y-4">
            <div className="rounded-lg border border-ink-200 bg-ink-50 px-3.5 py-3">
              <p className="truncate text-[12.5px] font-medium text-ink-900">
                {doc.fileName}
              </p>
              <p className="mt-0.5 text-[11px] text-ink-400">
                アップロード日時 {doc.uploadedAt}
              </p>
              <div className="mt-2.5">
                <div className="mb-1 flex items-center justify-between text-[11px]">
                  <span className="text-ink-500">自動抽出の確信度</span>
                  <span className="tnum font-semibold text-ink-700">
                    {doc.confidence}%
                  </span>
                </div>
                <MiniBar
                  ratio={doc.confidence / 100}
                  tone={
                    doc.confidence >= 90
                      ? "gain"
                      : doc.confidence >= 60
                        ? "accent"
                        : "loss"
                  }
                />
              </div>
            </div>

            {doc.confidence < 60 && (
              <div className="rounded-lg border border-amber-200 bg-amber-50 px-3.5 py-2.5 text-[11.5px] leading-relaxed text-amber-900">
                自動判定の確信度が低いため、<strong>手動での確認が必要</strong>です。銘柄コードと会社名をご入力ください。
              </div>
            )}

            <Field label="公開日">
              <input type="date" className={inputClass} defaultValue={
                doc.publishedAt.includes("-") ? doc.publishedAt : ""
              } key={`${doc.id}-date`} />
            </Field>

            <div className="grid grid-cols-2 gap-3">
              <Field label="銘柄コード">
                <input
                  className={inputClass}
                  defaultValue={doc.code === "—" ? "" : doc.code}
                  placeholder="例: 7203"
                  key={`${doc.id}-code`}
                />
              </Field>
              <Field label="分類">
                <select className={inputClass} defaultValue={doc.category} key={`${doc.id}-cat`}>
                  {PDF_CATEGORIES.map((c) => (
                    <option key={c}>{c}</option>
                  ))}
                </select>
              </Field>
            </div>

            <Field label="会社名">
              <input
                className={inputClass}
                defaultValue={
                  doc.company.startsWith("(") ? "" : doc.company
                }
                placeholder="銘柄マスタから自動補完されます"
                key={`${doc.id}-company`}
              />
            </Field>

            <Field
              label="抽出テキスト"
              hint="pdfplumber による抽出結果。修正すると履歴が保存されます。"
            >
              <textarea
                className={cx(inputClass, "h-32 resize-none leading-relaxed")}
                defaultValue={doc.extractText}
                key={`${doc.id}-text`}
              />
            </Field>

            <Field label="紐づく決算発表日" hint="銘柄コードから自動で候補を表示します">
              <input
                className={inputClass}
                defaultValue={doc.linkedEarningsDate}
                key={`${doc.id}-earn`}
              />
            </Field>

            <div className="flex gap-2 pt-1">
              <Button className="flex-1">確定して保存</Button>
              <Button variant="secondary">PDFを表示</Button>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* ---------- 紐付け結果 ---------- */}
      <Card className="mt-5">
        <CardHeader
          title="資料と株価結果の紐付け"
          description="登録した資料は、銘柄・決算発表日・その後の株価推移と自動で関連付けられます。「この資料が出た後、株価はどう動いたか」を後から検証できます。"
        />
        <Table>
          <thead>
            <tr>
              <Th>公開日</Th>
              <Th>資料</Th>
              <Th>銘柄</Th>
              <Th>決算発表日</Th>
              <Th align="right">公開翌日</Th>
              <Th align="right">3営業日後</Th>
              <Th align="right">5営業日後</Th>
              <Th align="right">10営業日後</Th>
            </tr>
          </thead>
          <tbody>
            {[
              { d: PDF_DOCUMENTS[0], r: [1.24, 2.81, 3.42, 2.16] },
              { d: PDF_DOCUMENTS[1], r: [-0.82, 0.64, 1.88, 4.02] },
              { d: PDF_DOCUMENTS[2], r: [3.61, 5.24, 4.88, 6.14] },
              { d: PDF_DOCUMENTS[4], r: [-1.44, -2.08, -0.92, 1.24] },
              { d: PDF_DOCUMENTS[5], r: [0.38, 0.92, 1.14, 0.76] },
            ].map(({ d, r }) => (
              <tr key={d.id} className="hover:bg-ink-50/60">
                <Td className="tnum whitespace-nowrap text-[12px]">{d.publishedAt}</Td>
                <Td>
                  <Badge tone="neutral">{d.category}</Badge>
                </Td>
                <Td className="whitespace-nowrap">
                  <span className="tnum text-[12px] font-medium text-ink-900">
                    {d.code}
                  </span>
                  <span className="ml-1.5 text-[11.5px] text-ink-500">
                    {d.company}
                  </span>
                </Td>
                <Td className="tnum whitespace-nowrap text-[12px]">
                  {d.linkedEarningsDate}
                </Td>
                {r.map((v, i) => (
                  <Td key={i} align="right">
                    <PnlText value={v} format={(n) => pct(n)} />
                  </Td>
                ))}
              </tr>
            ))}
          </tbody>
        </Table>
      </Card>
    </>
  );
}
