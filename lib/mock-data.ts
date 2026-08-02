// ============================================================
// モックデータ / Mock data
//
// 本デモは画面と業務フローの確認を目的としているため、
// データベースには接続せず、このファイルの固定データを表示します。
// 本番実装では、ここが Supabase(PostgreSQL)への
// クエリ結果に置き換わります。
//
// 乱数はシード固定のため、何度読み込んでも同じ値になります
// (サーバー/クライアント間の表示ズレを防ぐため)。
// ============================================================

import type {
  ApiAccessLog,
  ApiKey,
  BacktestResult,
  BacktestTrade,
  BreakdownRow,
  ConditionTemplate,
  ErrorLog,
  MarketType,
  MonthlySummary,
  PdfDocument,
  Stock,
  TradeRecord,
  UpdateJob,
} from "./types";

// ---- シード固定の疑似乱数 (mulberry32) ----
function createRng(seed: number) {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const rand = createRng(20260802);

const pick = <T,>(arr: readonly T[], r: number): T =>
  arr[Math.floor(r * arr.length) % arr.length];

const round = (n: number, digits = 0) => {
  const f = 10 ** digits;
  return Math.round(n * f) / f;
};

// ============================================================
// 基準日
// ============================================================
export const TODAY = "2026-08-02";
export const LAST_BUSINESS_DAY = "2026-07-31";

// ============================================================
// 銘柄マスタ
// ============================================================
const SECTORS = [
  "電気機器",
  "情報・通信業",
  "輸送用機器",
  "化学",
  "銀行業",
  "医薬品",
  "小売業",
  "機械",
  "建設業",
  "食料品",
  "卸売業",
  "サービス業",
] as const;

const MARKETS: readonly MarketType[] = ["プライム", "スタンダード", "グロース"];

/** 実在する代表的な銘柄名を用いた表示用サンプル */
const STOCK_SEEDS: ReadonlyArray<[string, string, MarketType, string]> = [
  ["7203", "トヨタ自動車", "プライム", "輸送用機器"],
  ["6758", "ソニーグループ", "プライム", "電気機器"],
  ["9984", "ソフトバンクグループ", "プライム", "情報・通信業"],
  ["6861", "キーエンス", "プライム", "電気機器"],
  ["8306", "三菱UFJフィナンシャル・グループ", "プライム", "銀行業"],
  ["4568", "第一三共", "プライム", "医薬品"],
  ["9433", "KDDI", "プライム", "情報・通信業"],
  ["6098", "リクルートホールディングス", "プライム", "サービス業"],
  ["8035", "東京エレクトロン", "プライム", "電気機器"],
  ["4063", "信越化学工業", "プライム", "化学"],
  ["7974", "任天堂", "プライム", "その他製品"],
  ["9432", "日本電信電話", "プライム", "情報・通信業"],
  ["6501", "日立製作所", "プライム", "電気機器"],
  ["8058", "三菱商事", "プライム", "卸売業"],
  ["4502", "武田薬品工業", "プライム", "医薬品"],
  ["6902", "デンソー", "プライム", "輸送用機器"],
  ["3382", "セブン&アイ・ホールディングス", "プライム", "小売業"],
  ["6367", "ダイキン工業", "プライム", "機械"],
  ["1925", "大和ハウス工業", "プライム", "建設業"],
  ["2914", "日本たばこ産業", "プライム", "食料品"],
  ["4661", "オリエンタルランド", "プライム", "サービス業"],
  ["6273", "SMC", "プライム", "機械"],
  ["7741", "HOYA", "プライム", "精密機器"],
  ["4519", "中外製薬", "プライム", "医薬品"],
  ["8766", "東京海上ホールディングス", "プライム", "保険業"],
  ["3092", "ZOZO", "プライム", "小売業"],
  ["4385", "メルカリ", "プライム", "情報・通信業"],
  ["4478", "フリー", "グロース", "情報・通信業"],
  ["4485", "JTOWER", "グロース", "情報・通信業"],
  ["7342", "ウェルスナビ", "グロース", "サービス業"],
  ["3697", "SHIFT", "プライム", "情報・通信業"],
  ["2413", "エムスリー", "プライム", "サービス業"],
  ["6920", "レーザーテック", "プライム", "電気機器"],
  ["4307", "野村総合研究所", "プライム", "情報・通信業"],
  ["9613", "NTTデータグループ", "プライム", "情報・通信業"],
  ["7267", "本田技研工業", "プライム", "輸送用機器"],
  ["5108", "ブリヂストン", "プライム", "ゴム製品"],
  ["8031", "三井物産", "プライム", "卸売業"],
  ["9020", "東日本旅客鉄道", "プライム", "陸運業"],
  ["2802", "味の素", "プライム", "食料品"],
  ["6981", "村田製作所", "プライム", "電気機器"],
  ["7751", "キヤノン", "プライム", "電気機器"],
  ["4188", "三菱ケミカルグループ", "プライム", "化学"],
  ["1605", "INPEX", "プライム", "鉱業"],
  ["8411", "みずほフィナンシャルグループ", "プライム", "銀行業"],
  ["3436", "SUMCO", "プライム", "金属製品"],
  ["6857", "アドバンテスト", "プライム", "電気機器"],
  ["2871", "ニチレイ", "プライム", "食料品"],
  ["7532", "パン・パシフィック・インターナショナルHD", "プライム", "小売業"],
  ["3865", "北越コーポレーション", "スタンダード", "パルプ・紙"],
  ["7014", "名村造船所", "スタンダード", "輸送用機器"],
];

/** 決算予定日の候補(基準日近辺の営業日) */
const EARNINGS_DATES = [
  "2026-08-04",
  "2026-08-05",
  "2026-08-06",
  "2026-08-07",
  "2026-08-11",
  "2026-08-12",
  "2026-08-13",
  "2026-08-14",
];

export const STOCKS: Stock[] = STOCK_SEEDS.filter(([, name]) => name !== "").map(
  ([code, name, market, sector], i) => {
    const close = round(400 + rand() * 9000, 1);
    const earningsIdx = i % EARNINGS_DATES.length;
    return {
      code,
      name,
      market,
      sector: sector || pick(SECTORS, rand()),
      marketCap: round(300 + rand() * 40000),
      per: round(6 + rand() * 32, 1),
      pbr: round(0.4 + rand() * 4.2, 2),
      dividendYield: round(rand() * 4.6, 2),
      close,
      changePct: round(-4.5 + rand() * 9, 2),
      volume: Math.round((50 + rand() * 900) * 1000),
      nextEarningsDate: EARNINGS_DATES[earningsIdx],
      businessDaysToEarnings: -(1 + (i % 6)),
    };
  }
);

// ============================================================
// ダッシュボード用サマリー
// ============================================================
export const DASHBOARD_STATS = {
  /** 登録銘柄数 */
  totalStocks: 3982,
  /** 日次株価の総レコード数 */
  totalPriceRows: 10_284_531,
  /** 蓄積年数 */
  yearsOfHistory: 10,
  /** DB使用量 */
  dbSizeGb: 6.8,
  /** 本日の抽出候補数 */
  candidatesToday: 14,
  /** 登録PDF数 */
  totalPdfs: 1247,
  /** 未確認PDF数 */
  unreviewedPdfs: 6,
  /** 実績記録の通算勝率 */
  overallWinRatePct: 61.4,
  /** 通算損益 */
  overallPnl: 2_847_500,
};

// ============================================================
// 日次更新ジョブ
// ============================================================
export const UPDATE_JOBS: UpdateJob[] = [
  {
    id: "job-01",
    dataset: "日次株価",
    endpoint: "/prices/daily_quotes",
    status: "成功",
    records: 3982,
    durationSec: 74,
    startedAt: "2026-08-02 02:00:03",
    message: "全銘柄の取得完了",
  },
  {
    id: "job-02",
    dataset: "銘柄マスタ",
    endpoint: "/listed/info",
    status: "成功",
    records: 3982,
    durationSec: 8,
    startedAt: "2026-08-02 02:01:20",
    message: "新規上場2件、上場廃止1件を反映",
  },
  {
    id: "job-03",
    dataset: "決算日程",
    endpoint: "/fins/announcement",
    status: "成功",
    records: 168,
    durationSec: 5,
    startedAt: "2026-08-02 02:01:32",
    message: "予定日変更 3件を検出し更新",
  },
  {
    id: "job-04",
    dataset: "財務データ",
    endpoint: "/fins/statements",
    status: "成功",
    records: 412,
    durationSec: 39,
    startedAt: "2026-08-02 02:01:41",
    message: "訂正データ 2件を検出し履歴保存のうえ反映",
  },
  {
    id: "job-05",
    dataset: "信用取引",
    endpoint: "/markets/weekly_margin_interest",
    status: "エラー",
    records: 0,
    durationSec: 122,
    startedAt: "2026-08-02 02:02:22",
    message: "429 Too Many Requests — 3回再試行後に中断。再開待ち",
  },
  {
    id: "job-06",
    dataset: "指数データ",
    endpoint: "/indices/topix",
    status: "成功",
    records: 1,
    durationSec: 2,
    startedAt: "2026-08-02 02:04:25",
    message: "TOPIX・日経平均を取得",
  },
  {
    id: "job-07",
    dataset: "空売り比率",
    endpoint: "/markets/short_selling",
    status: "待機中",
    records: 0,
    durationSec: 0,
    startedAt: "—",
    message: "信用取引ジョブの完了待ち",
  },
];

export const ERROR_LOGS: ErrorLog[] = [
  {
    id: "err-01",
    occurredAt: "2026-08-02 02:04:24",
    dataset: "信用取引",
    code: "HTTP 429",
    message: "APIレート制限に到達。指数バックオフで3回再試行後に中断しました。",
    retries: 3,
    resolved: false,
  },
  {
    id: "err-02",
    occurredAt: "2026-07-31 02:03:11",
    dataset: "財務データ",
    code: "DATA_GAP",
    message: "銘柄 4485 の四半期データが欠損。次回更新時に再取得予定。",
    retries: 1,
    resolved: true,
  },
  {
    id: "err-03",
    occurredAt: "2026-07-29 02:00:58",
    dataset: "日次株価",
    code: "HTTP 503",
    message: "J-Quants側の一時的な障害。5分後の自動再試行で復旧しました。",
    retries: 2,
    resolved: true,
  },
];

/** 直近14営業日の更新成否(ダッシュボードのミニ履歴用) */
export const UPDATE_HISTORY: { date: string; status: "成功" | "一部エラー" }[] = [
  { date: "07-15", status: "成功" },
  { date: "07-16", status: "成功" },
  { date: "07-17", status: "成功" },
  { date: "07-21", status: "成功" },
  { date: "07-22", status: "一部エラー" },
  { date: "07-23", status: "成功" },
  { date: "07-24", status: "成功" },
  { date: "07-25", status: "成功" },
  { date: "07-28", status: "成功" },
  { date: "07-29", status: "一部エラー" },
  { date: "07-30", status: "成功" },
  { date: "07-31", status: "成功" },
  { date: "08-01", status: "成功" },
  { date: "08-02", status: "一部エラー" },
];

// ============================================================
// 抽出条件テンプレート
// ============================================================
export const CONDITION_TEMPLATES: ConditionTemplate[] = [
  {
    id: "tpl-01",
    name: "決算3営業日前 × 割安大型株",
    description:
      "決算発表の3営業日前に該当し、時価総額500億円以上・PBR1.5倍以下の銘柄を抽出します。",
    rules: [
      { id: "r1", field: "決算発表までの営業日数", operator: "=", value: "3", unit: "営業日前" },
      { id: "r2", field: "時価総額", operator: "≧", value: "500", unit: "億円" },
      { id: "r3", field: "PBR", operator: "≦", value: "1.5", unit: "倍" },
      { id: "r4", field: "市場区分", operator: "=", value: "プライム" },
    ],
    hitCount: 14,
    updatedAt: "2026-07-28",
  },
  {
    id: "tpl-02",
    name: "決算前 出来高急増",
    description:
      "決算発表5営業日前までに、20日平均出来高の2倍以上に急増した銘柄を抽出します。",
    rules: [
      { id: "r1", field: "決算発表までの営業日数", operator: "≦", value: "5", unit: "営業日前" },
      { id: "r2", field: "出来高 / 20日平均", operator: "≧", value: "2.0", unit: "倍" },
      { id: "r3", field: "終値", operator: "≧", value: "500", unit: "円" },
    ],
    hitCount: 27,
    updatedAt: "2026-07-24",
  },
  {
    id: "tpl-03",
    name: "高配当 × 好財務",
    description: "配当利回り3%以上、自己資本比率50%以上、PER15倍以下の銘柄。",
    rules: [
      { id: "r1", field: "配当利回り", operator: "≧", value: "3.0", unit: "%" },
      { id: "r2", field: "自己資本比率", operator: "≧", value: "50", unit: "%" },
      { id: "r3", field: "PER", operator: "≦", value: "15", unit: "倍" },
    ],
    hitCount: 41,
    updatedAt: "2026-07-19",
  },
];

/** 条件ビルダーで選択できる項目 */
export const CONDITION_FIELDS = [
  "決算発表までの営業日数",
  "市場区分",
  "業種",
  "時価総額",
  "PER",
  "PBR",
  "配当利回り",
  "自己資本比率",
  "売上高成長率",
  "営業利益率",
  "終値",
  "前日比",
  "出来高",
  "出来高 / 20日平均",
  "信用倍率",
  "空売り比率",
] as const;

export const CONDITION_OPERATORS = ["=", "≧", "≦", ">", "<", "≠", "を含む"] as const;

// ============================================================
// バックテスト
// ============================================================
export const BACKTEST_RESULTS: BacktestResult[] = [
  {
    holdingDays: 1,
    trades: 412,
    totalPnl: 684_200,
    avgReturnPct: 0.42,
    winRatePct: 54.1,
    medianReturnPct: 0.28,
    maxLoss: -184_000,
    maxDrawdownPct: -6.8,
    maxConsecutiveLosses: 6,
    requiredCapital: 3_200_000,
    sharpe: 0.94,
  },
  {
    holdingDays: 3,
    trades: 412,
    totalPnl: 1_247_800,
    avgReturnPct: 0.98,
    winRatePct: 58.7,
    medianReturnPct: 0.71,
    maxLoss: -238_500,
    maxDrawdownPct: -9.1,
    maxConsecutiveLosses: 5,
    requiredCapital: 5_800_000,
    sharpe: 1.21,
  },
  {
    holdingDays: 5,
    trades: 412,
    totalPnl: 1_982_400,
    avgReturnPct: 1.54,
    winRatePct: 61.4,
    medianReturnPct: 1.18,
    maxLoss: -312_000,
    maxDrawdownPct: -11.4,
    maxConsecutiveLosses: 4,
    requiredCapital: 8_400_000,
    sharpe: 1.47,
  },
  {
    holdingDays: 10,
    trades: 412,
    totalPnl: 2_104_600,
    avgReturnPct: 1.71,
    winRatePct: 59.2,
    medianReturnPct: 1.02,
    maxLoss: -486_000,
    maxDrawdownPct: -15.8,
    maxConsecutiveLosses: 7,
    requiredCapital: 14_200_000,
    sharpe: 1.12,
  },
  {
    holdingDays: 20,
    trades: 412,
    totalPnl: 1_663_900,
    avgReturnPct: 1.34,
    winRatePct: 55.8,
    medianReturnPct: 0.64,
    maxLoss: -722_000,
    maxDrawdownPct: -22.3,
    maxConsecutiveLosses: 9,
    requiredCapital: 24_800_000,
    sharpe: 0.71,
  },
];

const TRADE_NAMES: ReadonlyArray<[string, string, string]> = [
  ["7203", "トヨタ自動車", "輸送用機器"],
  ["6758", "ソニーグループ", "電気機器"],
  ["8306", "三菱UFJ", "銀行業"],
  ["4568", "第一三共", "医薬品"],
  ["9433", "KDDI", "情報・通信業"],
  ["8035", "東京エレクトロン", "電気機器"],
  ["4063", "信越化学工業", "化学"],
  ["6501", "日立製作所", "電気機器"],
  ["8058", "三菱商事", "卸売業"],
  ["6902", "デンソー", "輸送用機器"],
  ["3382", "セブン&アイ", "小売業"],
  ["6367", "ダイキン工業", "機械"],
  ["2914", "日本たばこ産業", "食料品"],
  ["4661", "オリエンタルランド", "サービス業"],
  ["6981", "村田製作所", "電気機器"],
  ["8031", "三井物産", "卸売業"],
  ["9020", "東日本旅客鉄道", "陸運業"],
  ["4307", "野村総合研究所", "情報・通信業"],
];

const BUY_DATES = [
  "2026-05-07",
  "2026-05-12",
  "2026-05-19",
  "2026-06-02",
  "2026-06-09",
  "2026-06-16",
  "2026-06-23",
  "2026-07-07",
  "2026-07-14",
];
const SELL_DATES = [
  "2026-05-14",
  "2026-05-19",
  "2026-05-26",
  "2026-06-09",
  "2026-06-16",
  "2026-06-23",
  "2026-06-30",
  "2026-07-14",
  "2026-07-21",
];

export const BACKTEST_TRADES: BacktestTrade[] = Array.from({ length: 18 }, (_, i) => {
  const [code, name, sector] = TRADE_NAMES[i % TRADE_NAMES.length];
  const buyPrice = round(800 + rand() * 6000, 1);
  const returnPct = round(-6 + rand() * 15, 2);
  const sellPrice = round(buyPrice * (1 + returnPct / 100), 1);
  const shares = 100 * (1 + Math.floor(rand() * 4));
  return {
    id: `bt-${String(i + 1).padStart(3, "0")}`,
    code,
    name,
    sector,
    buyDate: BUY_DATES[i % BUY_DATES.length],
    buyPrice,
    sellDate: SELL_DATES[i % SELL_DATES.length],
    sellPrice,
    shares,
    pnl: Math.round((sellPrice - buyPrice) * shares),
    returnPct,
  };
});

export const BACKTEST_BY_MARKET: BreakdownRow[] = [
  { label: "プライム", trades: 318, winRatePct: 62.9, avgReturnPct: 1.68, totalPnl: 1_712_400 },
  { label: "スタンダード", trades: 71, winRatePct: 57.7, avgReturnPct: 1.21, totalPnl: 218_600 },
  { label: "グロース", trades: 23, winRatePct: 52.2, avgReturnPct: 0.94, totalPnl: 51_400 },
];

export const BACKTEST_BY_SECTOR: BreakdownRow[] = [
  { label: "電気機器", trades: 84, winRatePct: 67.9, avgReturnPct: 2.14, totalPnl: 612_800 },
  { label: "情報・通信業", trades: 62, winRatePct: 64.5, avgReturnPct: 1.87, totalPnl: 398_200 },
  { label: "輸送用機器", trades: 48, winRatePct: 60.4, avgReturnPct: 1.52, totalPnl: 241_900 },
  { label: "医薬品", trades: 41, winRatePct: 58.5, avgReturnPct: 1.31, totalPnl: 178_400 },
  { label: "銀行業", trades: 37, winRatePct: 59.5, avgReturnPct: 1.18, totalPnl: 142_600 },
  { label: "小売業", trades: 34, winRatePct: 55.9, avgReturnPct: 0.94, totalPnl: 88_300 },
  { label: "化学", trades: 29, winRatePct: 51.7, avgReturnPct: 0.62, totalPnl: 41_200 },
  { label: "機械", trades: 26, winRatePct: 53.8, avgReturnPct: 0.71, totalPnl: 38_900 },
];

export const BACKTEST_BY_PERIOD: BreakdownRow[] = [
  { label: "2026年 Q1", trades: 108, winRatePct: 63.9, avgReturnPct: 1.82, totalPnl: 584_200 },
  { label: "2026年 Q2", trades: 121, winRatePct: 59.5, avgReturnPct: 1.44, totalPnl: 512_800 },
  { label: "2025年 Q3", trades: 96, winRatePct: 62.5, avgReturnPct: 1.61, totalPnl: 468_100 },
  { label: "2025年 Q4", trades: 87, winRatePct: 58.6, avgReturnPct: 1.28, totalPnl: 417_300 },
];

/** 資産推移カーブ(累積損益) */
export const EQUITY_CURVE: { date: string; value: number }[] = (() => {
  const points: { date: string; value: number }[] = [];
  let v = 0;
  const labels = [
    "2025-08", "2025-09", "2025-10", "2025-11", "2025-12",
    "2026-01", "2026-02", "2026-03", "2026-04", "2026-05",
    "2026-06", "2026-07",
  ];
  const deltas = [
    120_000, 185_000, -64_000, 210_000, 96_000,
    248_000, -118_000, 302_000, 174_000, 228_000,
    -82_000, 283_400,
  ];
  labels.forEach((date, i) => {
    v += deltas[i];
    points.push({ date, value: v });
  });
  return points;
})();

// ============================================================
// PDF資料
// ============================================================
export const PDF_DOCUMENTS: PdfDocument[] = [
  {
    id: "doc-01",
    fileName: "7203_2026Q1_決算短信.pdf",
    publishedAt: "2026-08-01",
    code: "7203",
    company: "トヨタ自動車",
    category: "決算短信",
    extractText:
      "2027年3月期 第1四半期決算短信〔日本基準〕(連結) 売上収益 12,483,900百万円(前年同四半期比 +6.2%)、営業利益 1,284,600百万円…",
    confidence: 98,
    status: "確認済",
    uploadedAt: "2026-08-02 09:12",
    linkedEarningsDate: "2026-08-01",
  },
  {
    id: "doc-02",
    fileName: "6758_決算説明会資料.pdf",
    publishedAt: "2026-07-31",
    code: "6758",
    company: "ソニーグループ",
    category: "説明会資料",
    extractText:
      "2026年度 第1四半期 経営方針説明会 ゲーム&ネットワークサービス分野の売上高は前年同期比 +11%…",
    confidence: 94,
    status: "確認済",
    uploadedAt: "2026-08-01 18:44",
    linkedEarningsDate: "2026-07-31",
  },
  {
    id: "doc-03",
    fileName: "8035_適時開示_業績予想修正.pdf",
    publishedAt: "2026-07-30",
    code: "8035",
    company: "東京エレクトロン",
    category: "適時開示",
    extractText:
      "業績予想の修正に関するお知らせ 通期連結業績予想を上方修正いたします。営業利益 前回予想比 +8.4%…",
    confidence: 91,
    status: "確認済",
    uploadedAt: "2026-07-31 08:05",
    linkedEarningsDate: "2026-08-06",
  },
  {
    id: "doc-04",
    fileName: "IR_scan_20260730.pdf",
    publishedAt: "2026-07-30",
    code: "—",
    company: "(自動判定できませんでした)",
    category: "未分類",
    extractText:
      "※スキャン画像のためテキスト層がありません。OCR処理を実行しましたが、確信度が低い結果となりました。管理画面から手動で銘柄コード・会社名をご入力ください。",
    confidence: 34,
    status: "要修正",
    uploadedAt: "2026-07-30 16:20",
    linkedEarningsDate: "—",
  },
  {
    id: "doc-05",
    fileName: "4568_2026Q1_決算短信.pdf",
    publishedAt: "2026-07-29",
    code: "4568",
    company: "第一三共",
    category: "決算短信",
    extractText:
      "2027年3月期 第1四半期決算短信 売上収益 428,100百万円、コア営業利益 62,400百万円…",
    confidence: 97,
    status: "未確認",
    uploadedAt: "2026-07-30 07:58",
    linkedEarningsDate: "2026-07-29",
  },
  {
    id: "doc-06",
    fileName: "9433_株主通信_2026夏.pdf",
    publishedAt: "2026-07-28",
    code: "9433",
    company: "KDDI",
    category: "株主通信",
    extractText:
      "株主のみなさまへ 当期の通信ARPU収入は増加に転じ、金融・エネルギー領域も堅調に推移しました…",
    confidence: 88,
    status: "未確認",
    uploadedAt: "2026-07-29 11:30",
    linkedEarningsDate: "2026-08-04",
  },
];

export const PDF_CATEGORIES = [
  "決算短信",
  "説明会資料",
  "適時開示",
  "有価証券報告書",
  "株主通信",
  "アナリストレポート",
  "未分類",
] as const;

// ============================================================
// 実績記録
// ============================================================
export const TRADE_RECORDS: TradeRecord[] = [
  {
    id: "rec-01",
    code: "8035",
    name: "東京エレクトロン",
    reason: "決算3営業日前・PBR1.4倍・出来高2.3倍。テンプレート「決算3営業日前 × 割安大型株」に合致。",
    predictedReturnPct: 2.4,
    buyDate: "2026-07-21",
    buyPrice: 28_450,
    shares: 100,
    sellDate: "2026-07-28",
    sellPrice: 30_120,
    actualReturnPct: 5.87,
    pnl: 167_000,
    status: "決済済",
  },
  {
    id: "rec-02",
    code: "6758",
    name: "ソニーグループ",
    reason: "決算2営業日前・信用倍率低下・機関投資家の買い越し継続。",
    predictedReturnPct: 1.8,
    buyDate: "2026-07-24",
    buyPrice: 3_680,
    shares: 300,
    sellDate: "2026-07-31",
    sellPrice: 3_742,
    actualReturnPct: 1.68,
    pnl: 18_600,
    status: "決済済",
  },
  {
    id: "rec-03",
    code: "4568",
    name: "第一三共",
    reason: "決算3営業日前・PER割安圏。ただし業種平均を下回る出来高。",
    predictedReturnPct: 2.1,
    buyDate: "2026-07-22",
    buyPrice: 5_240,
    shares: 200,
    sellDate: "2026-07-29",
    sellPrice: 5_012,
    actualReturnPct: -4.35,
    pnl: -45_600,
    status: "決済済",
  },
  {
    id: "rec-04",
    code: "9433",
    name: "KDDI",
    reason: "決算3営業日前・高配当・自己資本比率良好。",
    predictedReturnPct: 1.4,
    buyDate: "2026-07-30",
    buyPrice: 4_985,
    shares: 200,
    sellDate: null,
    sellPrice: null,
    actualReturnPct: null,
    pnl: null,
    status: "保有中",
  },
  {
    id: "rec-05",
    code: "7203",
    name: "トヨタ自動車",
    reason: "決算4営業日前・PBR1.1倍。為替前提の保守的な設定を評価。",
    predictedReturnPct: 1.9,
    buyDate: "2026-07-29",
    buyPrice: 3_124,
    shares: 400,
    sellDate: null,
    sellPrice: null,
    actualReturnPct: null,
    pnl: null,
    status: "保有中",
  },
  {
    id: "rec-06",
    code: "6501",
    name: "日立製作所",
    reason: "決算3営業日前・上方修正の適時開示あり・出来高急増。",
    predictedReturnPct: 2.8,
    buyDate: "2026-07-07",
    buyPrice: 4_218,
    shares: 200,
    sellDate: "2026-07-14",
    sellPrice: 4_506,
    actualReturnPct: 6.83,
    pnl: 57_600,
    status: "決済済",
  },
  {
    id: "rec-07",
    code: "8058",
    name: "三菱商事",
    reason: "決算5営業日前・配当利回り3.2%・自社株買い発表済。",
    predictedReturnPct: 1.6,
    buyDate: "2026-07-08",
    buyPrice: 3_042,
    shares: 300,
    sellDate: "2026-07-15",
    sellPrice: 3_098,
    actualReturnPct: 1.84,
    pnl: 16_800,
    status: "決済済",
  },
  {
    id: "rec-08",
    code: "4385",
    name: "メルカリ",
    reason: "決算2営業日前・グロース市場・出来高3.1倍。ボラティリティ高。",
    predictedReturnPct: 3.2,
    buyDate: "2026-06-23",
    buyPrice: 2_384,
    shares: 300,
    sellDate: "2026-06-30",
    sellPrice: 2_211,
    actualReturnPct: -7.26,
    pnl: -51_900,
    status: "決済済",
  },
];

export const MONTHLY_SUMMARY: MonthlySummary[] = [
  { month: "2026-02", trades: 12, winRatePct: 58.3, pnl: 184_200, predictedAvgPct: 2.1, actualAvgPct: 1.72 },
  { month: "2026-03", trades: 15, winRatePct: 66.7, pnl: 312_400, predictedAvgPct: 2.3, actualAvgPct: 2.48 },
  { month: "2026-04", trades: 11, winRatePct: 54.5, pnl: 96_800, predictedAvgPct: 1.9, actualAvgPct: 1.14 },
  { month: "2026-05", trades: 14, winRatePct: 64.3, pnl: 268_100, predictedAvgPct: 2.2, actualAvgPct: 2.06 },
  { month: "2026-06", trades: 13, winRatePct: 53.8, pnl: -42_600, predictedAvgPct: 2.4, actualAvgPct: -0.38 },
  { month: "2026-07", trades: 16, winRatePct: 68.8, pnl: 421_300, predictedAvgPct: 2.0, actualAvgPct: 2.61 },
];

// ============================================================
// 外部連携API
// ============================================================
export const API_KEYS: ApiKey[] = [
  {
    id: "key-01",
    label: "分析AI本番用",
    maskedKey: "jqa_live_••••••••••••••••3f7a",
    scope: "読み取り専用(全データセット)",
    createdAt: "2026-05-14",
    lastUsedAt: "2026-08-02 07:41",
    requests30d: 18_402,
    active: true,
  },
  {
    id: "key-02",
    label: "分析AI検証用",
    maskedKey: "jqa_test_••••••••••••••••b214",
    scope: "読み取り専用(株価・決算日程のみ)",
    createdAt: "2026-06-02",
    lastUsedAt: "2026-07-30 22:18",
    requests30d: 3_128,
    active: true,
  },
  {
    id: "key-03",
    label: "旧検証キー(無効化済)",
    maskedKey: "jqa_test_••••••••••••••••9c05",
    scope: "読み取り専用(株価のみ)",
    createdAt: "2026-03-08",
    lastUsedAt: "2026-05-30 14:02",
    requests30d: 0,
    active: false,
  },
];

export const API_ACCESS_LOGS: ApiAccessLog[] = [
  { id: "log-01", at: "2026-08-02 07:41:22", keyLabel: "分析AI本番用", endpoint: "GET /api/v1/prices?code=7203&from=2026-07-01", status: 200, ms: 84 },
  { id: "log-02", at: "2026-08-02 07:41:19", keyLabel: "分析AI本番用", endpoint: "GET /api/v1/screening?template=tpl-01", status: 200, ms: 212 },
  { id: "log-03", at: "2026-08-02 07:40:58", keyLabel: "分析AI本番用", endpoint: "GET /api/v1/earnings?from=2026-08-01&to=2026-08-31", status: 200, ms: 61 },
  { id: "log-04", at: "2026-08-02 03:15:04", keyLabel: "分析AI検証用", endpoint: "GET /api/v1/financials?code=6758", status: 200, ms: 96 },
  { id: "log-05", at: "2026-08-01 23:52:41", keyLabel: "分析AI検証用", endpoint: "GET /api/v1/prices?code=9999", status: 404, ms: 18 },
  { id: "log-06", at: "2026-08-01 23:11:07", keyLabel: "分析AI本番用", endpoint: "GET /api/v1/backtest/tpl-01", status: 200, ms: 1_284 },
  { id: "log-07", at: "2026-08-01 19:03:55", keyLabel: "(不明なキー)", endpoint: "GET /api/v1/prices", status: 401, ms: 4 },
];

/** 外部連携APIのエンドポイント一覧(仕様書プレビュー用) */
export const API_ENDPOINTS = [
  {
    method: "GET",
    path: "/api/v1/stocks",
    summary: "銘柄マスタの取得",
    params: "market, sector, code, limit, offset",
  },
  {
    method: "GET",
    path: "/api/v1/prices",
    summary: "日次株価の取得(期間・銘柄指定)",
    params: "code, from, to, limit",
  },
  {
    method: "GET",
    path: "/api/v1/financials",
    summary: "財務データの取得",
    params: "code, fiscal_year, quarter",
  },
  {
    method: "GET",
    path: "/api/v1/earnings",
    summary: "決算発表日程の取得",
    params: "from, to, code",
  },
  {
    method: "GET",
    path: "/api/v1/margin",
    summary: "信用取引残高の取得",
    params: "code, from, to",
  },
  {
    method: "GET",
    path: "/api/v1/screening",
    summary: "保存済み条件による銘柄抽出の実行",
    params: "template, date",
  },
  {
    method: "GET",
    path: "/api/v1/backtest/{id}",
    summary: "バックテスト結果の取得",
    params: "id, holding_days",
  },
  {
    method: "GET",
    path: "/api/v1/documents",
    summary: "PDF資料メタデータの取得",
    params: "code, category, from, to",
  },
] as const;

// ============================================================
// ヘルパー
// ============================================================
export const yen = (n: number) =>
  `${n < 0 ? "-" : ""}¥${Math.abs(n).toLocaleString("ja-JP")}`;

export const pct = (n: number, digits = 2) =>
  `${n > 0 ? "+" : ""}${n.toFixed(digits)}%`;

export const num = (n: number) => n.toLocaleString("ja-JP");
