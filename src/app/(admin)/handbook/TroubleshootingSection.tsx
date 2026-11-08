import { TroubleshootingExplorer } from "./TroubleshootingExplorer";

export function TroubleshootingSection() {
  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="hidden text-h1 lg:block">Troubleshooting</h1>
        <p className="mt-1 text-sm text-foreground-2">
          Arsip insiden yang beneran pernah kejadian, plus beberapa operasi
          langka yang butuh akses khusus. Kalau ada insiden support baru yang
          udah keberesin, minta developer nambahin entry baru ke sini.
        </p>
      </div>

      <TroubleshootingExplorer />
    </div>
  );
}
