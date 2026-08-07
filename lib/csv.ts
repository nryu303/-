// ============================================================
// CSV出力(要件3・4・6: 結果のCSV出力)
//
// デモでもブラウザ上で実際にファイルをダウンロードできます。
// Excelで文字化けしないよう BOM 付き UTF-8 で出力します。
// ============================================================

export function downloadCsv(
  fileName: string,
  headers: string[],
  rows: (string | number | null)[][]
) {
  const esc = (v: string | number | null) => {
    const s = v === null || v === undefined ? "" : String(v);
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };

  const body = [headers, ...rows]
    .map((r) => r.map(esc).join(","))
    .join("\r\n");

  // BOM を付けて Excel での文字化けを防ぐ
  const blob = new Blob([`﻿${body}`], {
    type: "text/csv;charset=utf-8;",
  });

  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
