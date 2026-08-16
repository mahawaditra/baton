"use client";

import { useState } from "react";
import { previewAnnualReport, saveAnnualReport } from "./actions";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronRight } from "lucide-react";

type SummaryRow = { Metric: string; Value: number };
type PreviewResult = Awaited<ReturnType<typeof previewAnnualReport>>;

type RecentReport = {
  id: string;
  year: number;
  periodEnd: Date;
  summary: unknown;
  createdAt: Date;
  creator: { name: string };
};

function SummaryTable({ rows }: { rows: SummaryRow[] }) {
  return (
    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
      {rows.map((row, i) => (
        <div
          key={i}
          className="flex items-center justify-between gap-3 rounded-md border border-border bg-muted/40 px-4 py-2.5"
        >
          <span className="text-sm text-muted-foreground">
            {row.Metric.trim()}
          </span>
          <span className="tabular text-sm font-semibold">{row.Value}</span>
        </div>
      ))}
    </div>
  );
}

export function AnnualReportPanel({
  recentReports,
}: {
  recentReports: RecentReport[];
}) {
  const [preview, setPreview] = useState<PreviewResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  async function handleGenerate() {
    setLoading(true);
    setError(null);
    try {
      const res = await previewAnnualReport();
      setPreview(res);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to generate report.",
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleSave() {
    setSaving(true);
    setError(null);
    try {
      await saveAnnualReport();
      setPreview(null);
      setDialogOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save report.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Laporan Tahunan</CardTitle>
      </CardHeader>
      <CardContent className="gap-4">
        <p className="text-sm text-muted-foreground">
          Ringkasan dari 1 Januari tahun ini sampai sekarang. Klik Generate buat
          lihat sekilas — belum tersimpan sampai kamu klik Save.
        </p>

        <div className="flex items-center gap-2">
          <Button onClick={handleGenerate} disabled={loading} variant="outline">
            {loading ? "Membuat laporan..." : "Generate Laporan"}
          </Button>

          {preview && (
            <AlertDialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <AlertDialogTrigger render={<Button disabled={saving} />}>
                {saving ? "Menyimpan..." : "Save to History"}
              </AlertDialogTrigger>
              <AlertDialogContent className="sm:max-w-[480px]">
                <AlertDialogHeader>
                  <AlertDialogTitle>
                    Simpan laporan ini ke riwayat?
                  </AlertDialogTitle>
                  <AlertDialogDescription>
                    Ini akan membuat laporan baru dari 1 Januari {preview.year}{" "}
                    sampai hari ini ke riwayat. Aksi ini gak bisa dibatalkan.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleSave} disabled={saving}>
                    {saving ? "Menyimpan..." : "Create Report"}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>

        {error && (
          <p className="text-sm text-destructive" aria-live="polite">
            {error}
          </p>
        )}

        {preview && <SummaryTable rows={preview.summaryRows} />}

        {recentReports.length > 0 && (
          <div className="flex flex-col gap-2 border-t border-border pt-4">
            <div className="text-sm font-semibold">Recent Reports</div>
            <div className="flex flex-col gap-1.5">
              {recentReports.map((r) => {
                const isExpanded = expandedId === r.id;
                return (
                  <div key={r.id}>
                    <button
                      type="button"
                      onClick={() => setExpandedId(isExpanded ? null : r.id)}
                      className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm text-muted-foreground hover:bg-muted"
                    >
                      {isExpanded ? (
                        <ChevronDown
                          className="h-3.5 w-3.5 shrink-0"
                          strokeWidth={1.75}
                        />
                      ) : (
                        <ChevronRight
                          className="h-3.5 w-3.5 shrink-0"
                          strokeWidth={1.75}
                        />
                      )}
                      <span>
                        Laporan {r.year} (s.d.{" "}
                        {new Date(r.periodEnd).toLocaleDateString("id-ID")}) —
                        oleh {r.creator.name} —{" "}
                        {r.createdAt.toLocaleDateString("id-ID")}
                      </span>
                    </button>
                    {isExpanded && (
                      <div className="mt-1.5 mb-1">
                        <SummaryTable rows={r.summary as SummaryRow[]} />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
