import { prisma } from "@/lib/prisma";
import Link from "next/link";

export default async function ArchivePage({
  searchParams,
}: {
  searchParams: Promise<{
    year?: string;
    borrower?: string;
    instrument?: string;
  }>;
}) {
  const { year, borrower, instrument } = await searchParams;

  const allReturned = await prisma.borrowingRequest.findMany({
    where: { status: "returned" },
    select: { createdAt: true },
  });
  const availableYears = [
    ...new Set(allReturned.map((r) => r.createdAt.getFullYear())),
  ].sort((a, b) => b - a);

  const requests = await prisma.borrowingRequest.findMany({
    where: {
      status: "returned",
      ...(year && {
        createdAt: {
          gte: new Date(`${year}-01-01`),
          lt: new Date(`${Number(year) + 1}-01-01`),
        },
      }),
      ...(borrower && {
        borrowerName: { contains: borrower, mode: "insensitive" },
      }),
      ...(instrument && {
        instrument: {
          OR: [
            { type: { contains: instrument, mode: "insensitive" } },
            { serialNumber: { contains: instrument, mode: "insensitive" } },
          ],
        },
      }),
    },
    include: {
      instrument: true,
      loanPeriods: { orderBy: { sequence: "desc" } },
    },
    orderBy: { updatedAt: "desc" },
  });

  return (
    <div>
      <h1>Archive</h1>

      <nav>
        <Link href="/admin/archive">All Years</Link>
        {availableYears.map((y) => (
          <Link key={y} href={`/admin/archive?year=${y}`}>
            {y}
          </Link>
        ))}
      </nav>

      <form>
        <input
          name="borrower"
          placeholder="Search borrower name"
          defaultValue={borrower}
        />
        <input
          name="instrument"
          placeholder="Search instrument type/serial"
          defaultValue={instrument}
        />
        {year && <input type="hidden" name="year" value={year} />}
        <button type="submit">Search</button>
      </form>

      {requests.length === 0 ? (
        <p>No archived borrowings found.</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Peminjam</th>
              <th>Angkatan</th>
              <th>Instrumen</th>
              <th>Periode</th>
              <th>Deposit Refund</th>
              <th>Lihat →</th>
            </tr>
          </thead>
          <tbody>
            {requests.map((req) => (
              <tr key={req.id}>
                <td>{req.borrowerName}</td>
                <td>{req.borrowerYear}</td>
                <td>
                  {req.instrument?.type} ({req.instrument?.serialNumber})
                </td>
                <td>{req.loanPeriods.length} periode</td>
                <td>
                  {req.depositRefundAmount != null
                    ? `Rp${req.depositRefundAmount.toLocaleString("id-ID")}`
                    : "-"}
                </td>
                <td>
                  <Link href={`/admin/requests/${req.id}`}>Lihat →</Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
