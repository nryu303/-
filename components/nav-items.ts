// 管理画面のナビゲーション定義
// 要件定義書の「7. 管理画面」の項目に対応
//
// phase: 開発段階(1=MVP段階 / 2=本段階 / 3=拡張段階)
// お見積り時にご提案した3段階の進め方と対応しています。

export interface NavItem {
  href: string;
  label: string;
  /** 要件番号(クライアント確認用) */
  spec: string;
  /** 開発段階 */
  phase: 1 | 2 | 3;
  icon: string;
  description: string;
}

export const NAV_GROUPS: { group: string; items: NavItem[] }[] = [
  {
    group: "運用",
    items: [
      {
        href: "/dashboard",
        label: "ダッシュボード",
        spec: "要件7",
        phase: 1,
        icon: "◧",
        description: "日次更新の成否・エラー・データ蓄積状況を一目で確認",
      },
      {
        href: "/data-update",
        label: "データ更新",
        spec: "要件2",
        phase: 1,
        icon: "⟳",
        description: "J-Quants API連携の実行状況・再取得・履歴",
      },
    ],
  },
  {
    group: "分析",
    items: [
      {
        href: "/screening",
        label: "銘柄抽出",
        spec: "要件3",
        phase: 1,
        icon: "⌕",
        description: "決算日基準の営業日計算＋複合条件で銘柄を絞り込み",
      },
      {
        href: "/backtest",
        label: "バックテスト",
        spec: "要件4",
        phase: 2,
        icon: "◨",
        description: "保有期間別の損益・勝率・ドローダウンを一括比較",
      },
    ],
  },
  {
    group: "記録",
    items: [
      {
        href: "/documents",
        label: "PDF資料管理",
        spec: "要件5",
        phase: 3,
        icon: "▤",
        description: "PDFのアップロード・自動文字抽出・銘柄紐付け",
      },
      {
        href: "/records",
        label: "実績記録",
        spec: "要件6",
        phase: 2,
        icon: "◐",
        description: "売買実績の登録と、予測 vs 実績の比較集計",
      },
    ],
  },
  {
    group: "設定",
    items: [
      {
        href: "/api-access",
        label: "外部連携API",
        spec: "要件8",
        phase: 3,
        icon: "⚿",
        description: "分析AI向け読み取り専用APIのキー発行とアクセスログ",
      },
      {
        href: "/architecture",
        label: "システム構成図",
        spec: "全体",
        phase: 1,
        icon: "◈",
        description: "データの流れ・DB設計・処理フローの図解",
      },
    ],
  },
];

export const ALL_NAV_ITEMS: NavItem[] = NAV_GROUPS.flatMap((g) => g.items);

export const PHASE_LABEL: Record<1 | 2 | 3, string> = {
  1: "第1段階 MVP",
  2: "第2段階 本実装",
  3: "第3段階 拡張",
};
