const ONE_YEAR_SECONDS = 60 * 60 * 24 * 365;

export function savedTicketCookieName(ticketId: string): string {
  return `baton_ticket_${ticketId}`;
}

function writeCookie(ticketId: string, value: string, maxAge: number) {
  const secure = window.location.protocol === "https:" ? "; Secure" : "";
  document.cookie = `${savedTicketCookieName(ticketId)}=${value}; Path=/status; Max-Age=${maxAge}; SameSite=Lax${secure}`;
}

export function markTicketSaved(ticketId: string) {
  writeCookie(ticketId, "1", ONE_YEAR_SECONDS);
}

export function clearTicketSaved(ticketId: string) {
  writeCookie(ticketId, "", 0);
}
