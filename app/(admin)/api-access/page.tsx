"use client";

// ============================================================
// 外部連携API画面(要件8)
//
// ・分析用AIから必要なデータを取得できるREST API
// ・読み取り専用権限
// ・期間/銘柄/条件を指定して取得
// ・APIキー、認証情報の安全な管理
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
  PageHeader,
  Stat,
  Table,
  Td,
  Th,
  cx,
  inputClass,
} from "@/components/ui";
import { API_ACCESS_LOGS, API_ENDPOINTS, API_KEYS, num } from "@/lib/mock-data";

/** エンドポイントごとのサンプルレスポンス */
const SAMPLE_RESPONSES: Record<string, string> = {
  "/api/v1/prices": `{
  "count": 21,
  "period": { "from": "2026-07-01", "to": "2026-07-31" },
  "data": [
    {
      "code": "7203",
      "date": "2026-07-31",
      "open": 3118.0,
      "high": 3142.5,
      "low": 3102.0,
      "close": 3124.0,
      "volume": 18420600,
      "adjustment_factor": 1.0
    },
    {
      "code": "7203",
      "date": "2026-07-30",
      "open": 3096.5,
      "high": 3128.0,
      "low": 3090.0,
      "close": 3118.0,
      "volume": 16284100,
      "adjustment_factor": 1.0
    }
  ]
}`,
  "/api/v1/screening": `{
  "template": "決算3営業日前 × 割安大型株",
  "executed_at": "2026-08-02T07:41:19+09:00",
  "count": 14,
  "data": [
    {
      "code": "8035",
      "name": "東京エレクトロン",
      "market": "プライム",
      "sector": "電気機器",
      "market_cap": 142800,
      "per": 24.8,
      "pbr": 1.42,
      "close": 30120,
      "next_earnings_date": "2026-08-06",
      "business_days_to_earnings": -3
    }
  ]
}`,
  "/api/v1/earnings": `{
  "count": 168,
  "data": [
    {
      "code": "9433",
      "name": "KDDI",
      "scheduled_date": "2026-08-04",
      "fiscal_year": 2027,
      "quarter": 1,
      "is_confirmed": true,
      "changed_from": null
    }
  ]
}`,
};

export default function ApiAccessPage() {
  const [endpoint, setEndpoint] = useState("/api/v1/prices");
  const [copied, setCopied] = useState(false);

  const sample = SAMPLE_RESPONSES[endpoint] ?? SAMPLE_RESPONSES["/api/v1/prices"];
  const active = API_KEYS.filter((k) => k.active);
  const totalReq = API_KEYS.reduce((s, k) => s + k.requests30d, 0);

  const curl = `curl -X GET "https://api.example.com${endpoint}?code=7203&from=2026-07-01&to=2026-07-31" \\
  -H "Authorization: Bearer jqa_live_xxxxxxxxxxxxxxxx"`;

  const copy = () => {
    navigator.clipboard?.writeText(curl);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1500);
  };

  return (
    <>
      <PageHeader
        eyebrow="要件8 — 外部連携API"
        title="外部連携API"
        description="分析用AIから蓄積データを取得するための読み取り専用REST APIです。APIキーごとに参照できるデータ範囲を制限でき、アクセス状況はすべて記録されます。"
        action={<Button>＋ 新しいAPIキーを発行</Button>}
      />

      <DemoNote>
        このデモではAPIは実際には稼働していません。エンドポイントを選択すると、本番で返却されるJSONの形式をサンプル表示します。
      </DemoNote>

      <div className="mb-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat label="有効なAPIキー" value={`${active.length} 件`} sub={`全 ${API_KEYS.length} 件中`} />
        <Stat label="直近30日のリクエスト" value={num(totalReq)} sub="全キー合計" />
        <Stat label="平均応答時間" value="94 ms" sub="直近24時間" />
        <Stat label="認証エラー" value="1 件" sub="直近24時間 / 401" />
      </div>

      {/* ---------- APIキー ---------- */}
      <Card className="mb-5">
        <CardHeader
          title="APIキーの管理"
          description="キーは発行時に一度だけ表示され、データベースにはハッシュ化して保存します。平文では保持しません。"
        />
        <Table>
          <thead>
            <tr>
              <Th>名称</Th>
              <Th>キー</Th>
              <Th>権限範囲</Th>
              <Th>発行日</Th>
              <Th>最終利用</Th>
              <Th align="right">30日間の利用</Th>
              <Th>状態</Th>
              <Th align="center">操作</Th>
            </tr>
          </thead>
          <tbody>
            {API_KEYS.map((k) => (
              <tr key={k.id} className="hover:bg-ink-50/60">
                <Td className="whitespace-nowrap font-medium text-ink-900">
                  {k.label}
                </Td>
                <Td>
                  <code className="whitespace-nowrap rounded bg-ink-100 px-2 py-0.5 text-[11.5px] text-ink-600">
                    {k.maskedKey}
                  </code>
                </Td>
                <Td className="whitespace-nowrap text-[12px]">
                  <Badge tone="info">{k.scope}</Badge>
                </Td>
                <Td className="tnum text-[12px]">{k.createdAt}</Td>
                <Td className="tnum whitespace-nowrap text-[12px]">{k.lastUsedAt}</Td>
                <Td align="right">{num(k.requests30d)}</Td>
                <Td>
                  <Badge tone={k.active ? "success" : "neutral"}>
                    {k.active ? "有効" : "無効"}
                  </Badge>
                </Td>
                <Td align="center">
                  {k.active ? (
                    <button className="rounded px-2 py-1 text-[12px] text-red-600 hover:bg-red-50">
                      無効化
                    </button>
                  ) : (
                    <span className="text-[12px] text-ink-300">—</span>
                  )}
                </Td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Card>

      <div className="grid gap-5 lg:grid-cols-2">
        {/* ---------- エンドポイント一覧 ---------- */}
        <Card>
          <CardHeader
            title="提供エンドポイント"
            description="すべて GET のみ。データの更新・削除はできません。"
          />
          <CardBody className="space-y-2">
            {API_ENDPOINTS.map((e) => (
              <button
                key={e.path}
                type="button"
                onClick={() => setEndpoint(e.path)}
                className={cx(
                  "w-full rounded-lg border px-3.5 py-2.5 text-left transition",
                  endpoint === e.path
                    ? "border-accent bg-accent/5 ring-1 ring-accent"
                    : "border-ink-100 hover:border-ink-300 hover:bg-ink-50"
                )}
              >
                <div className="flex items-center gap-2">
                  <span className="rounded bg-emerald-100 px-1.5 py-0.5 text-[10px] font-bold text-emerald-700">
                    {e.method}
                  </span>
                  <code className="text-[12.5px] font-medium text-ink-900">
                    {e.path}
                  </code>
                </div>
                <p className="mt-1 text-[12px] text-ink-500">{e.summary}</p>
                <p className="mt-0.5 text-[11px] text-ink-400">
                  パラメータ: {e.params}
                </p>
              </button>
            ))}
          </CardBody>
        </Card>

        {/* ---------- レスポンス例 ---------- */}
        <div className="space-y-5">
          <Card>
            <CardHeader
              title="リクエスト例"
              description="Bearer方式でAPIキーを付与します。"
              action={
                <Button
                  variant="secondary"
                  onClick={copy}
                  className="px-2.5 py-1.5 text-[12px]"
                >
                  {copied ? "コピーしました" : "コピー"}
                </Button>
              }
            />
            <CardBody>
              <pre className="scroll-x rounded-lg bg-ink-950 px-4 py-3.5 text-[11.5px] leading-relaxed text-ink-100">
                <code>{curl}</code>
              </pre>
            </CardBody>
          </Card>

          <Card>
            <CardHeader
              title="レスポンス例"
              description={`${endpoint} が返すJSONの形式です。`}
            />
            <CardBody>
              <pre className="scroll-x max-h-[360px] overflow-y-auto rounded-lg bg-ink-950 px-4 py-3.5 text-[11.5px] leading-relaxed text-ink-100">
                <code>{sample}</code>
              </pre>
            </CardBody>
          </Card>
        </div>

        {/* ---------- 権限設定 ---------- */}
        <Card>
          <CardHeader
            title="新しいAPIキーの発行"
            description="用途ごとにキーを分け、参照範囲を最小限に絞ることを推奨します。"
          />
          <CardBody className="space-y-4">
            <Field label="名称" hint="用途が分かる名前を付けます">
              <input className={inputClass} placeholder="例: 分析AI本番用" />
            </Field>
            <Field label="参照できるデータ">
              <div className="space-y-2 rounded-lg border border-ink-200 px-3.5 py-3">
                {[
                  "銘柄マスタ",
                  "日次株価",
                  "財務データ",
                  "決算日程",
                  "信用取引",
                  "抽出結果",
                  "バックテスト結果",
                  "PDF資料メタデータ",
                ].map((d, i) => (
                  <label key={d} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      defaultChecked={i < 4}
                      className="h-3.5 w-3.5 rounded border-ink-300 text-accent"
                    />
                    <span className="text-[12.5px] text-ink-600">{d}</span>
                  </label>
                ))}
              </div>
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="レート制限" hint="1分あたり">
                <input className={inputClass} defaultValue="60 リクエスト" />
              </Field>
              <Field label="有効期限">
                <select className={inputClass}>
                  <option>無期限</option>
                  <option>90日</option>
                  <option>180日</option>
                  <option>1年</option>
                </select>
              </Field>
            </div>
            <div className="rounded-lg border border-amber-200 bg-amber-50 px-3.5 py-2.5 text-[11.5px] leading-relaxed text-amber-900">
              発行されたキーは<strong>この画面に一度だけ表示されます</strong>。
              閉じると再表示できないため、必ず安全な場所に保管してください。
            </div>
            <Button className="w-full">キーを発行する</Button>
          </CardBody>
        </Card>

        {/* ---------- アクセスログ ---------- */}
        <Card>
          <CardHeader
            title="アクセスログ"
            description="どのキーがいつどのデータを取得したかを記録します。"
          />
          <Table>
            <thead>
              <tr>
                <Th>日時</Th>
                <Th>キー</Th>
                <Th>エンドポイント</Th>
                <Th align="center">応答</Th>
                <Th align="right">時間</Th>
              </tr>
            </thead>
            <tbody>
              {API_ACCESS_LOGS.map((l) => (
                <tr key={l.id} className="hover:bg-ink-50/60">
                  <Td className="tnum whitespace-nowrap text-[11.5px]">{l.at}</Td>
                  <Td className="whitespace-nowrap text-[12px]">{l.keyLabel}</Td>
                  <Td className="max-w-[240px]">
                    <code className="block truncate text-[11px] text-ink-500">
                      {l.endpoint}
                    </code>
                  </Td>
                  <Td align="center">
                    <Badge
                      tone={
                        l.status === 200
                          ? "success"
                          : l.status === 404
                            ? "warn"
                            : "danger"
                      }
                    >
                      {l.status}
                    </Badge>
                  </Td>
                  <Td align="right">{l.ms} ms</Td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Card>
      </div>
    </>
  );
}
