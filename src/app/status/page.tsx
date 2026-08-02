import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

export default async function StatusSearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;

  let notFound = false;

  if (q) {
    const request = await prisma.borrowingRequest.findUnique({
      where: { ticketId: q },
      select: { ticketId: true },
    });

    if (request) {
      redirect(`/status/${request.ticketId}`);
    }
    notFound = true;
  }

  return (
    <div>
      <h1>Check Your Status</h1>

      <form>
        <input
          name="q"
          type="text"
          placeholder="Ticket ID"
          defaultValue={q ?? ""}
          required
        />
        <button type="submit">Search</button>
      </form>

      {notFound && <p>No request found with that Ticket ID.</p>}
    </div>
  );
}
