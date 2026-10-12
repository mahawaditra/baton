import { describe, it, expect } from "vitest";
import { resolveRequestsView } from "./request-view";

describe("resolveRequestsView", () => {
  it("honours an explicit view param over everything else", () => {
    expect(
      resolveRequestsView({ view: "board", hasFilter: true, savedView: "table" }),
    ).toBe("board");
    expect(
      resolveRequestsView({ view: "table", hasFilter: false, savedView: "board" }),
    ).toBe("table");
  });

  it("falls back to table for an unknown view param", () => {
    expect(
      resolveRequestsView({ view: "grid", hasFilter: false, savedView: "board" }),
    ).toBe("table");
  });

  it("uses table when filters are present and no view param is given", () => {
    expect(
      resolveRequestsView({
        view: undefined,
        hasFilter: true,
        savedView: "board",
      }),
    ).toBe("table");
  });

  it("uses the saved cookie when there is no param and no filter", () => {
    expect(
      resolveRequestsView({
        view: undefined,
        hasFilter: false,
        savedView: "board",
      }),
    ).toBe("board");
  });

  it("defaults to table when nothing is saved", () => {
    expect(
      resolveRequestsView({
        view: undefined,
        hasFilter: false,
        savedView: undefined,
      }),
    ).toBe("table");
  });
});
