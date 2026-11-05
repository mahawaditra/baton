import { cookies } from "next/headers";
import { savedTicketCookieName } from "@/lib/loan/saved-ticket-cookie";
import { StatusGate } from "./StatusGate";

export const maxDuration = 60;

export default async function StatusTicketPage({
  params,
}: {
  params: Promise<{ ticket_id: string }>;
}) {
  const { ticket_id } = await params;
  const cookieStore = await cookies();
  return (
    <StatusGate
      ticketId={ticket_id}
      hasSavedCode={cookieStore.has(savedTicketCookieName(ticket_id))}
    />
  );
}
