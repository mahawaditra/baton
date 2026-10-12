export const REQUESTS_VIEW_COOKIE = "requests_view";

export type RequestsView = "table" | "board";

const ONE_YEAR_IN_SECONDS = 60 * 60 * 24 * 365;

export function saveRequestsView(view: RequestsView): void {
  document.cookie = `${REQUESTS_VIEW_COOKIE}=${view}; path=/; max-age=${ONE_YEAR_IN_SECONDS}; samesite=lax`;
}

export function resolveRequestsView(params: {
  view: string | undefined;
  hasFilter: boolean;
  savedView: string | undefined;
}): RequestsView {
  if (params.view) return params.view === "board" ? "board" : "table";
  if (params.hasFilter) return "table";
  return params.savedView === "board" ? "board" : "table";
}
