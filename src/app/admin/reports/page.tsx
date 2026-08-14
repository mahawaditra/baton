"use client";

import { useState } from "react";
import { generateAnnualReport } from "./actions";

type ReportResult = Awaited<ReturnType<typeof generateAnnualReport>>;

export default function ReportsPage() {
  const [result, setResult] = useState<ReportResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleGenerate() {
    setLoading(true);
    setError(null);
    try {
      const res = await generateAnnualReport();
      setResult(res);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to generate report.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <h1>Laporan Tahunan</h1>
      <p>Ringkasan dari 1 Januari tahun ini sampai sekarang.</p>
      <button onClick={handleGenerate} disabled={loading}>
        {loading ? "Membuat laporan..." : "Generate Laporan"}
      </button>
      {error && <p style={{ color: "red" }}>{error}</p>}

      {result && (
        <div>
          <p>
            Laporan berhasil dibuat.{" "}
            <a href={result.driveUrl} target="_blank">
              Buka di Drive
            </a>
          </p>
          <table>
            <tbody>
              {result.summary.map((row, i) => (
                <tr key={i}>
                  <td>{row.Metric}</td>
                  <td>{row.Value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
