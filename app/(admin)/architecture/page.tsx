// ============================================================
// システム構成図 / フローチャート
//
// クライアントが「どんなシステムか」を1画面で把握できるよう、
// 以下を図解します。
//   1. 全体構成(どこに何が置かれるか)
//   2. 日次データ更新の流れ(フローチャート)
//   3. 分析〜検証〜記録の業務フロー
//   4. データベース構成(ER図)
//   5. 開発の進め方(3段階)
//
// 図はすべて依存ライブラリなしのHTML/CSS/SVGで描画しています。
// ============================================================

import Link from "next/link";
import {
  Badge,
  Card,
  CardBody,
  CardHeader,
  PageHeader,
  cx,
} from "@/components/ui";

/* ============================================================
   1. 全体構成
   ============================================================ */

const LAYERS = [
  {
    title: "外部データ提供元",
    tone: "slate",
    items: [
      { name: "J-Quants Premium API", desc: "株価・財務・決算日程・信用取引・指数" },
      { name: "PDF資料", desc: "決算短信・説明会資料・適時開示(手動アップロード)" },
    ],
  },
  {
    title: "データ取得層(Python)",
    tone: "blue",
    items: [
      { name: "日次バッチ", desc: "asyncio + httpx / GitHub Actions で毎営業日 02:00 実行" },
      { name: "初回一括取得", desc: "過去10年分をチェックポイント付きで登録" },
      { name: "データ検証", desc: "重複・欠損・訂正の検出と補正" },
      { name: "PDF文字抽出", desc: "pdfplumber / OCR(Tesseract)" },
    ],
  },
  {
    title: "データ保管層(Supabase)",
    tone: "emerald",
    items: [
      { name: "PostgreSQL", desc: "時系列データ / パーティショニング + 複合インデックス" },
      { name: "Storage", desc: "PDFファイルの実体を保存" },
      { name: "Auth", desc: "管理画面のログイン認証" },
    ],
  },
  {
    title: "アプリケーション層(FastAPI)",
    tone: "violet",
    items: [
      { name: "銘柄抽出エンジン", desc: "営業日計算 + 動的クエリ生成" },
      { name: "バックテストエンジン", desc: "保有期間別のシミュレーションを非同期実行" },
      { name: "集計・レポート", desc: "月別/年別/条件別の成績算出" },
      { name: "読み取り専用REST API", desc: "外部の分析AI向け / APIキー認証" },
    ],
  },
  {
    title: "利用者インターフェース",
    tone: "amber",
    items: [
      { name: "管理画面(Next.js)", desc: "PC・スマートフォン対応" },
      { name: "外部の分析AI", desc: "REST API 経由でデータを取得" },
      { name: "CSV入出力", desc: "抽出結果・バックテスト結果・実績記録" },
    ],
  },
];

const LAYER_TONE: Record<string, string> = {
  slate: "border-ink-300 bg-ink-100",
  blue: "border-blue-300 bg-blue-50",
  emerald: "border-emerald-300 bg-emerald-50",
  violet: "border-violet-300 bg-violet-50",
  amber: "border-amber-300 bg-amber-50",
};

/* ============================================================
   2. 日次更新フロー
   ============================================================ */

type FlowNode = {
  label: string;
  detail?: string;
  kind: "start" | "process" | "decision" | "store" | "end" | "error";
};

const DAILY_FLOW: FlowNode[] = [
  { label: "毎営業日 02:00 起動", detail: "GitHub Actions のスケジュール実行", kind: "start" },
  { label: "前回の中断地点を確認", detail: "チェックポイントをDBから読み込み", kind: "process" },
  { label: "J-Quants API からデータ取得", detail: "株価・財務・決算日程・信用・指数", kind: "process" },
  { label: "APIエラー？", detail: "429 / 503 などを判定", kind: "decision" },
  { label: "指数バックオフで再試行(最大5回)", detail: "待機時間を2倍ずつ延長", kind: "error" },
  { label: "データ検証", detail: "重複・欠損・訂正の検出", kind: "process" },
  { label: "PostgreSQL へ登録", detail: "訂正データは履歴を残して更新", kind: "store" },
  { label: "実行ログ・エラーログを保存", detail: "管理画面から確認可能", kind: "process" },
  { label: "完了通知", detail: "メール / Slack へ結果を送信", kind: "end" },
];

const NODE_STYLE: Record<FlowNode["kind"], string> = {
  start: "border-ink-800 bg-ink-900 text-white",
  process: "border-blue-200 bg-white text-ink-800",
  decision: "border-amber-300 bg-amber-50 text-amber-900",
  store: "border-emerald-300 bg-emerald-50 text-emerald-900",
  error: "border-red-200 bg-red-50 text-red-800",
  end: "border-emerald-600 bg-emerald-600 text-white",
};

/* ============================================================
   3. 業務フロー
   ============================================================ */

const WORK_FLOW = [
  {
    step: "01",
    actor: "システム",
    title: "データが自動で蓄積される",
    body: "毎営業日の深夜、当日分の株価・決算日程・財務・信用データが自動で追加されます。処理結果は翌朝ダッシュボードで確認できます。",
    screen: "/dashboard",
    screenName: "ダッシュボード",
  },
  {
    step: "02",
    actor: "利用者",
    title: "条件で銘柄を抽出する",
    body: "「決算3営業日前・時価総額500億以上・PBR1.5倍以下」のような条件を指定して候補銘柄を絞り込みます。条件はテンプレートとして保存できます。",
    screen: "/screening",
    screenName: "銘柄抽出",
  },
  {
    step: "03",
    actor: "利用者",
    title: "その条件が過去に通用したか検証する",
    body: "抽出条件をそのままバックテストに渡し、保有期間ごとの損益・勝率・ドローダウンを一括比較します。手数料と価格差も加味されます。",
    screen: "/backtest",
    screenName: "バックテスト",
  },
  {
    step: "04",
    actor: "利用者",
    title: "関連資料を確認する",
    body: "対象銘柄の決算短信やIR資料をPDFで登録しておくと、銘柄・決算日・その後の株価推移と紐付けて参照できます。",
    screen: "/documents",
    screenName: "PDF資料管理",
  },
  {
    step: "05",
    actor: "利用者",
    title: "実際の売買を記録する",
    body: "購入・売却の内容と判定理由を登録します。予測と実績の差が自動で集計され、条件の見直しに使えます。",
    screen: "/records",
    screenName: "実績記録",
  },
  {
    step: "06",
    actor: "外部AI",
    title: "APIでデータを取得する",
    body: "分析用AIが読み取り専用のREST API経由で、期間・銘柄・条件を指定してデータを取得します。アクセスはすべて記録されます。",
    screen: "/api-access",
    screenName: "外部連携API",
  },
];

/* ============================================================
   4. ER図
   ============================================================ */

const TABLES = [
  {
    name: "stocks",
    label: "銘柄マスタ",
    pk: "code",
    cols: ["code", "name", "market", "sector17", "sector33", "listed_date", "is_active"],
    rows: "約 4,000",
  },
  {
    name: "daily_prices",
    label: "日次株価",
    pk: "code + date",
    cols: ["code", "date", "open", "high", "low", "close", "volume", "adj_factor"],
    rows: "約 1,000万",
    hot: true,
  },
  {
    name: "financials",
    label: "財務データ",
    pk: "code + period",
    cols: ["code", "fiscal_year", "quarter", "net_sales", "operating_income", "equity_ratio"],
    rows: "約 17万",
  },
  {
    name: "earnings_schedule",
    label: "決算日程",
    pk: "code + date",
    cols: ["code", "scheduled_date", "actual_date", "quarter", "changed_from"],
    rows: "約 14万",
  },
  {
    name: "margin_trading",
    label: "信用取引",
    pk: "code + date",
    cols: ["code", "date", "long_balance", "short_balance", "ratio"],
    rows: "約 180万",
  },
  {
    name: "indices",
    label: "指数データ",
    pk: "index_code + date",
    cols: ["index_code", "date", "open", "high", "low", "close"],
    rows: "約 2.5万",
  },
  {
    name: "analysis_conditions",
    label: "抽出条件",
    pk: "id",
    cols: ["id", "name", "rules_json", "created_at", "updated_at"],
    rows: "数十",
  },
  {
    name: "backtest_results",
    label: "バックテスト結果",
    pk: "id",
    cols: ["id", "condition_id", "holding_days", "total_pnl", "win_rate", "max_drawdown"],
    rows: "数千",
  },
  {
    name: "documents",
    label: "PDF資料",
    pk: "id",
    cols: ["id", "code", "published_at", "category", "storage_path", "extracted_text"],
    rows: "約 1,200",
  },
  {
    name: "trade_records",
    label: "実績記録",
    pk: "id",
    cols: ["id", "code", "reason", "buy_date", "buy_price", "sell_date", "pnl"],
    rows: "数百",
  },
  {
    name: "update_logs",
    label: "更新履歴",
    pk: "id",
    cols: ["id", "dataset", "status", "records", "started_at", "finished_at"],
    rows: "数万",
  },
  {
    name: "error_logs",
    label: "エラー履歴",
    pk: "id",
    cols: ["id", "dataset", "code", "message", "retries", "resolved"],
    rows: "数百",
  },
];

/* ============================================================
   5. 開発の進め方
   ============================================================ */

const PHASES = [
  {
    phase: "第1段階",
    name: "MVP段階",
    weeks: "3〜4週間",
    tone: "border-blue-300 bg-blue-50",
    items: [
      "DB設計・構築(銘柄マスタ・日次株価・決算日程)",
      "J-Quants API連携(初回一括取得＋日次更新)",
      "シンプルな管理画面(ログイン・更新実行・銘柄検索)",
      "API制限対応・エラーハンドリングの基本実装",
    ],
    goal: "「日々データが自動で蓄積される仕組み」が稼働した状態",
  },
  {
    phase: "第2段階",
    name: "本段階",
    weeks: "4〜5週間",
    tone: "border-violet-300 bg-violet-50",
    items: [
      "財務・信用取引・指数データの追加",
      "重複・欠損・訂正データの検出と修正",
      "銘柄抽出・分析機能(条件保存・動的クエリ)",
      "バックテスト機能(一括比較・指標算出・CSV出力)",
      "実績記録機能(予測と実績の比較)",
      "管理画面の本格構築",
    ],
    goal: "日々の投資判断に実用できる状態",
  },
  {
    phase: "第3段階",
    name: "拡張段階",
    weeks: "2〜3週間",
    tone: "border-emerald-300 bg-emerald-50",
    items: [
      "PDF資料管理(自動文字抽出・銘柄紐付け)",
      "外部連携API(読み取り専用・APIキー管理)",
      "スマートフォン対応の最終調整",
      "バックアップ・復旧手順の整備",
      "各種ドキュメント・テスト結果の完成",
      "オンラインでの操作説明・引き継ぎ",
    ],
    goal: "長期運用と第三者への保守引き継ぎが可能な状態",
  },
];

export default function ArchitecturePage() {
  return (
    <>
      <PageHeader
        eyebrow="全体像"
        title="システム構成図"
        description="このシステムがどのような部品で構成され、データがどう流れるかを図解します。各画面との対応関係もあわせてご確認いただけます。"
      />

      {/* ============ 1. 全体構成 ============ */}
      <Card className="mb-6">
        <CardHeader
          title="1. 全体構成"
          description="上から下へデータが流れます。外部から取得したデータをSupabaseに蓄積し、FastAPIで加工して管理画面・外部AIへ提供します。"
        />
        <CardBody className="space-y-3">
          {LAYERS.map((layer, li) => (
            <div key={layer.title}>
              <div
                className={cx(
                  "rounded-xl border-2 px-4 py-3.5",
                  LAYER_TONE[layer.tone]
                )}
              >
                <p className="mb-2.5 text-[12px] font-bold text-ink-700">
                  {layer.title}
                </p>
                <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
                  {layer.items.map((it) => (
                    <div
                      key={it.name}
                      className="rounded-lg border border-white bg-white/80 px-3 py-2.5 shadow-sm"
                    >
                      <p className="text-[12.5px] font-semibold text-ink-900">
                        {it.name}
                      </p>
                      <p className="mt-0.5 text-[11px] leading-relaxed text-ink-500">
                        {it.desc}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
              {li < LAYERS.length - 1 && (
                <div className="flex justify-center py-1.5">
                  <span className="text-[16px] leading-none text-ink-300" aria-hidden>
                    ▼
                  </span>
                </div>
              )}
            </div>
          ))}
        </CardBody>
      </Card>

      {/* ============ 2. 日次更新フロー ============ */}
      <Card className="mb-6">
        <CardHeader
          title="2. 日次データ更新の流れ(フローチャート)"
          description="毎営業日の深夜に自動実行される処理です。エラーが起きても自動で再試行し、中断しても翌回に続きから再開します。"
        />
        <CardBody>
          <div className="mx-auto max-w-2xl">
            {DAILY_FLOW.map((n, i) => {
              const isDecision = n.kind === "decision";
              const isRetry = n.kind === "error";
              return (
                <div key={n.label}>
                  <div
                    className={cx(
                      "relative rounded-lg border-2 px-4 py-3 shadow-sm",
                      NODE_STYLE[n.kind],
                      isDecision && "mx-auto max-w-md text-center",
                      isRetry && "ml-8 sm:ml-16"
                    )}
                  >
                    {isRetry && (
                      <span className="absolute -left-6 top-1/2 hidden -translate-y-1/2 text-[11px] font-semibold text-red-500 sm:block">
                        はい ↓
                      </span>
                    )}
                    <p
                      className={cx(
                        "text-[13px] font-semibold",
                        n.kind === "start" || n.kind === "end"
                          ? "text-white"
                          : ""
                      )}
                    >
                      {isDecision && "◇ "}
                      {n.label}
                    </p>
                    {n.detail && (
                      <p
                        className={cx(
                          "mt-0.5 text-[11.5px] leading-relaxed",
                          n.kind === "start" || n.kind === "end"
                            ? "text-white/70"
                            : "text-ink-500"
                        )}
                      >
                        {n.detail}
                      </p>
                    )}
                  </div>
                  {i < DAILY_FLOW.length - 1 && (
                    <div className="flex items-center justify-center gap-2 py-1.5">
                      <span className="text-[14px] leading-none text-ink-300" aria-hidden>
                        ▼
                      </span>
                      {isDecision && (
                        <span className="text-[11px] text-ink-400">
                          いいえ → 次の処理へ
                        </span>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <p className="mx-auto mt-5 max-w-2xl rounded-lg bg-ink-50 px-4 py-3 text-[11.5px] leading-relaxed text-ink-500">
            <span className="font-medium text-ink-700">再開の仕組み:</span>{" "}
            処理した銘柄コードと日付を逐次DBに記録するため、途中で停止しても未処理分だけを次回に取得します。同じデータを二重に登録しないよう、主キー制約とハッシュ比較の二重で防いでいます。
          </p>
        </CardBody>
      </Card>

      {/* ============ 3. 業務フロー ============ */}
      <Card className="mb-6">
        <CardHeader
          title="3. 分析から記録までの業務フロー"
          description="実際にこのシステムをどう使うかの流れです。各ステップから対応する画面へ移動できます。"
        />
        <CardBody>
          <div className="space-y-3">
            {WORK_FLOW.map((w, i) => (
              <div key={w.step}>
                <div className="flex gap-4 rounded-xl border border-ink-200 bg-white px-4 py-4">
                  <div className="shrink-0">
                    <span className="grid h-10 w-10 place-items-center rounded-lg bg-ink-900 text-[13px] font-bold text-white">
                      {w.step}
                    </span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="mb-1 flex flex-wrap items-center gap-2">
                      <Badge
                        tone={
                          w.actor === "システム"
                            ? "info"
                            : w.actor === "外部AI"
                              ? "warn"
                              : "neutral"
                        }
                      >
                        {w.actor}
                      </Badge>
                      <span className="text-[14px] font-semibold text-ink-900">
                        {w.title}
                      </span>
                    </div>
                    <p className="text-[12.5px] leading-relaxed text-ink-500">
                      {w.body}
                    </p>
                    <Link
                      href={w.screen}
                      className="mt-2 inline-block text-[12px] font-medium text-accent hover:underline"
                    >
                      → {w.screenName}画面を開く
                    </Link>
                  </div>
                </div>
                {i < WORK_FLOW.length - 1 && (
                  <div className="flex justify-center py-1">
                    <span className="text-[14px] leading-none text-ink-300" aria-hidden>
                      ▼
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardBody>
      </Card>

      {/* ============ 4. ER図 ============ */}
      <Card className="mb-6">
        <CardHeader
          title="4. データベース構成(主要テーブル)"
          description="銘柄マスタ(stocks)を中心に、各テーブルが銘柄コードで関連します。行数の多い日次株価は日付でパーティション分割し、検索速度を確保します。"
        />
        <CardBody>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {TABLES.map((t) => (
              <div
                key={t.name}
                className={cx(
                  "rounded-lg border-2 bg-white",
                  t.hot ? "border-accent" : "border-ink-200"
                )}
              >
                <div
                  className={cx(
                    "flex items-center justify-between gap-2 rounded-t-md px-3 py-2",
                    t.hot ? "bg-accent text-white" : "bg-ink-100"
                  )}
                >
                  <div className="min-w-0">
                    <code
                      className={cx(
                        "block truncate text-[12px] font-bold",
                        t.hot ? "text-white" : "text-ink-900"
                      )}
                    >
                      {t.name}
                    </code>
                    <span
                      className={cx(
                        "block text-[10.5px]",
                        t.hot ? "text-white/75" : "text-ink-500"
                      )}
                    >
                      {t.label}
                    </span>
                  </div>
                  <span
                    className={cx(
                      "shrink-0 rounded px-1.5 py-0.5 text-[9.5px] font-semibold",
                      t.hot ? "bg-white/20 text-white" : "bg-white text-ink-500"
                    )}
                  >
                    {t.rows} 行
                  </span>
                </div>
                <div className="px-3 py-2.5">
                  <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wide text-ink-400">
                    PK: {t.pk}
                  </p>
                  <ul className="space-y-0.5">
                    {t.cols.map((c) => (
                      <li
                        key={c}
                        className="truncate font-mono text-[10.5px] text-ink-600"
                      >
                        {c}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            <Note title="インデックス設計">
              (銘柄コード, 日付)の複合インデックスを基本とし、市場・業種には部分インデックスを追加します。
            </Note>
            <Note title="パーティショニング">
              日次株価は年単位でパーティション分割し、期間指定の検索で不要な範囲を読み飛ばします。
            </Note>
            <Note title="訂正データの扱い">
              上書きせず旧値を履歴テーブルに退避し、いつ何が訂正されたかを追跡できるようにします。
            </Note>
          </div>
        </CardBody>
      </Card>

      {/* ============ 5. 開発の進め方 ============ */}
      <Card>
        <CardHeader
          title="5. 開発の進め方(3段階)"
          description="一度にすべてを作るのではなく、確実に動くものから積み上げます。各段階の完了時にレビューをいただき、方向性を確認してから次へ進みます。"
        />
        <CardBody>
          <div className="grid gap-4 lg:grid-cols-3">
            {PHASES.map((p, i) => (
              <div
                key={p.phase}
                className={cx("rounded-xl border-2 px-4 py-4", p.tone)}
              >
                <div className="mb-3 flex items-baseline justify-between">
                  <div>
                    <p className="text-[11px] font-semibold text-ink-500">
                      {p.phase}
                    </p>
                    <p className="text-[15px] font-bold text-ink-900">{p.name}</p>
                  </div>
                  <Badge tone="neutral">{p.weeks}</Badge>
                </div>
                <ul className="space-y-1.5">
                  {p.items.map((it) => (
                    <li key={it} className="flex gap-2 text-[12px] leading-relaxed text-ink-600">
                      <span aria-hidden className="mt-1 shrink-0 text-[8px] text-ink-400">
                        ●
                      </span>
                      <span>{it}</span>
                    </li>
                  ))}
                </ul>
                <p className="mt-3 rounded-lg bg-white/70 px-3 py-2 text-[11.5px] leading-relaxed text-ink-600">
                  <span className="font-semibold text-ink-800">到達点:</span>{" "}
                  {p.goal}
                </p>
                {i < PHASES.length - 1 && (
                  <p className="mt-2 text-center text-[11px] text-ink-400 lg:hidden">
                    ▼
                  </p>
                )}
              </div>
            ))}
          </div>
        </CardBody>
      </Card>
    </>
  );
}

function Note({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-ink-200 bg-ink-50 px-3.5 py-3">
      <p className="mb-1 text-[12px] font-semibold text-ink-800">{title}</p>
      <p className="text-[11.5px] leading-relaxed text-ink-500">{children}</p>
    </div>
  );
}
