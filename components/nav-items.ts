// 管理画面のナビゲーション定義
// 要件定義書の「7. 管理画面」の項目に対応

export interface NavItem {
  href: string;
  label: string;
  /** 要件番号(クライアント確認用) */
  spec: string;
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
        icon: "◧",
        description: "日次更新の成否・エラー・データ蓄積状況を一目で確認",
      },
      {
        href: "/data-update",
        label: "データ更新",
        spec: "要件2",
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
        icon: "⌕",
        description: "決算日基準の営業日計算＋複合条件で銘柄を絞り込み",
      },
      {
        href: "/backtest",
        label: "バックテスト",
        spec: "要件4",
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
        icon: "▤",
        description: "PDFのアップロード・自動文字抽出・銘柄紐付け",
      },
      {
        href: "/records",
        label: "実績記録",
        spec: "要件6",
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
        icon: "⚿",
        description: "分析AI向け読み取り専用APIのキー発行とアクセスログ",
      },
      {
        href: "/architecture",
        label: "システム構成図",
        spec: "全体",
        icon: "◈",
        description: "データの流れ・DB設計・処理フローの図解",
      },
    ],
  },
];

export const ALL_NAV_ITEMS: NavItem[] = NAV_GROUPS.flatMap((g) => g.items);
