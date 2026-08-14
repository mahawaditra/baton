import { prisma } from "@/lib/prisma";
import { DataTable } from "@/components/DataTable";
import { columns } from "./columns";
import { exportInventorySnapshot } from "./actions";

export default async function InstrumentsPage() {
  const instruments = await prisma.instrument.findMany({
    orderBy: {
      section: "asc",
    },
  });

  const snapshots = await prisma.inventorySnapshot.findMany({
    include: { creator: true },
    orderBy: { createdAt: "desc" },
    take: 10,
  });

  return (
    <div>
      <h1>Instruments</h1>
      <form
        action={async (formData: FormData) => {
          "use server";
          const label = formData.get("label") as string;
          await exportInventorySnapshot(
            label || `Snapshot ${new Date().toLocaleDateString("id-ID")}`,
          );
        }}
      >
        <input name="label" placeholder="Label (misal: Post Calang 2026)" />
        <button type="submit">Export Snapshot</button>
      </form>

      <h2>Recent Snapshots</h2>
      <ul>
        {snapshots.map((s) => (
          <li key={s.id}>
            {s.label} — oleh {s.creator.name} —{" "}
            {s.createdAt.toLocaleDateString("id-ID")} —{" "}
            <a
              href={`https://drive.google.com/file/d/${s.driveFileId}/view`}
              target="_blank"
            >
              Buka di Drive
            </a>
          </li>
        ))}
      </ul>

      <DataTable data={instruments} columns={columns} />
    </div>
  );
}
