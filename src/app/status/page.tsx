import { prisma } from "@/lib/prisma";
import { getClientIp, statusSearchLimiter } from "@/lib/rate-limit";
import { redirect } from "next/navigation";

export default async function StatusSearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;

  let notFound = false;
  let rateLimited = false;

  if (q) {
    const ip = await getClientIp();
    const { success } = await statusSearchLimiter.limit(`status-search:${ip}`);
    if (!success) {
      rateLimited = true;
    } else {
      const request = await prisma.borrowingRequest.findUnique({
        where: { ticketId: q },
        select: { ticketId: true },
      });

      if (request) {
        redirect(`/status/${request.ticketId}`);
      }
      notFound = true;
    }
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
      {rateLimited && (
        <p>Too many requests. Please try again in a few minutes.</p>
      )}
    </div>
  );
}
