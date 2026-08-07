import { StatusGate } from "./StatusGate";

export const maxDuration = 60;

export default async function StatusTicketPage({
  params,
}: {
  params: Promise<{ ticket_id: string }>;
}) {
  const { ticket_id } = await params;
  return <StatusGate ticketId={ticket_id} />;
}
