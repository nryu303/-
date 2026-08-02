// ============================================================
// 型定義 / Type definitions
// 本デモではモックデータに対して使用。
// 本番実装では Supabase(PostgreSQL)のテーブル定義と 1:1 で対応させる。
// ============================================================

/** 市場区分 */
export type MarketType = "プライム" | "スタンダード" | "グロース";

/** 銘柄マスタ (stocks) */
export interface Stock {
  code: string;
  name: string;
  market: MarketType;
  sector: string;
  /** 時価総額(億円) */
  marketCap: number;
  per: number;
  pbr: number;
  /** 配当利回り(%) */
  dividendYield: number;
  /** 終値(円) */
  close: number;
  /** 前日比(%) */
  changePct: number;
  /** 出来高(株) */
  volume: number;
  /** 次回決算発表予定日 (YYYY-MM-DD) */
  nextEarningsDate: string;
  /** 決算発表日まで/からの営業日数(マイナス=発表前) */
  businessDaysToEarnings: number;
}

/** 日次更新ジョブの状態 */
export type JobStatus = "成功" | "実行中" | "エラー" | "待機中" | "スキップ";

/** データ取得ジョブ (update_logs) */
export interface UpdateJob {
  id: string;
  /** 対象データ種別 */
  dataset: string;
  /** J-Quants APIエンドポイント */
  endpoint: string;
  status: JobStatus;
  /** 取得件数 */
  records: number;
  /** 所要時間(秒) */
  durationSec: number;
  startedAt: string;
  message: string;
}

/** エラー履歴 (error_logs) */
export interface ErrorLog {
  id: string;
  occurredAt: string;
  dataset: string;
  /** HTTPステータス等 */
  code: string;
  message: string;
  /** 再試行回数 */
  retries: number;
  resolved: boolean;
}

/** 抽出条件の1行 (analysis_conditions の JSON 要素) */
export interface ConditionRule {
  id: string;
  field: string;
  operator: string;
  value: string;
  unit?: string;
}

/** 保存済み抽出条件テンプレート */
export interface ConditionTemplate {
  id: string;
  name: string;
  description: string;
  rules: ConditionRule[];
  hitCount: number;
  updatedAt: string;
}

/** バックテスト結果(保有期間ごと) */
export interface BacktestResult {
  /** 保有期間(営業日) */
  holdingDays: number;
  /** 取引回数 */
  trades: number;
  /** 総損益(円) */
  totalPnl: number;
  /** 平均損益率(%) */
  avgReturnPct: number;
  /** 勝率(%) */
  winRatePct: number;
  /** 損益率の中央値(%) */
  medianReturnPct: number;
  /** 最大損失(円) */
  maxLoss: number;
  /** 最大ドローダウン(%) */
  maxDrawdownPct: number;
  /** 最大連敗(回) */
  maxConsecutiveLosses: number;
  /** 必要資金(円) */
  requiredCapital: number;
  /** シャープレシオ */
  sharpe: number;
}

/** バックテストの個別取引明細 */
export interface BacktestTrade {
  id: string;
  code: string;
  name: string;
  sector: string;
  buyDate: string;
  buyPrice: number;
  sellDate: string;
  sellPrice: number;
  shares: number;
  pnl: number;
  returnPct: number;
}

/** 業種別 / 市場別の集計 */
export interface BreakdownRow {
  label: string;
  trades: number;
  winRatePct: number;
  avgReturnPct: number;
  totalPnl: number;
}

/** PDF資料 (documents) */
export type DocStatus = "未確認" | "確認済" | "要修正";

export interface PdfDocument {
  id: string;
  fileName: string;
  /** 公開日 */
  publishedAt: string;
  code: string;
  company: string;
  /** 分類 */
  category: string;
  /** 自動抽出テキストの冒頭 */
  extractText: string;
  /** 自動抽出の確信度(%) */
  confidence: number;
  status: DocStatus;
  uploadedAt: string;
  /** 紐づく決算日 */
  linkedEarningsDate: string;
}

/** 実績記録 (trade_records) */
export interface TradeRecord {
  id: string;
  code: string;
  name: string;
  /** 抽出時の判定理由 */
  reason: string;
  /** 予測損益率(%) */
  predictedReturnPct: number;
  buyDate: string;
  buyPrice: number;
  shares: number;
  sellDate: string | null;
  sellPrice: number | null;
  /** 実績損益率(%) */
  actualReturnPct: number | null;
  pnl: number | null;
  status: "保有中" | "決済済";
}

/** 月別集計 */
export interface MonthlySummary {
  month: string;
  trades: number;
  winRatePct: number;
  pnl: number;
  predictedAvgPct: number;
  actualAvgPct: number;
}

/** 外部連携APIキー */
export interface ApiKey {
  id: string;
  label: string;
  /** 表示用のマスク済みキー */
  maskedKey: string;
  scope: string;
  createdAt: string;
  lastUsedAt: string;
  /** 直近30日のリクエスト数 */
  requests30d: number;
  active: boolean;
}

/** APIアクセスログ */
export interface ApiAccessLog {
  id: string;
  at: string;
  keyLabel: string;
  endpoint: string;
  status: number;
  ms: number;
}
