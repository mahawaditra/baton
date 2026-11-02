import { describe, it, expect } from "vitest";
import { NETWORK_ERROR_MESSAGE, withNetworkFallback } from "./network-fallback";

const initialState = {
  success: false,
  error: null,
  generalError: null,
  fields: {},
};

type State = {
  success: boolean;
  error: string | null;
  generalError: string | null;
  fields: Record<string, string>;
};

describe("withNetworkFallback", () => {
  it("returns the action's own state when the call succeeds", async () => {
    const serverState: State = {
      success: false,
      error: "Nomor KTP harus 16 digit",
      generalError: null,
      fields: { ktpNumber: "123" },
    };
    const action = withNetworkFallback<State>(async () => serverState);

    expect(await action(initialState, new FormData())).toBe(serverState);
  });

  it("turns a rejected call into a general error instead of throwing", async () => {
    const action = withNetworkFallback<State>(async () => {
      throw new TypeError("Failed to fetch");
    });

    const result = await action(
      { ...initialState, error: "Nomor KTP harus 16 digit" },
      new FormData(),
    );

    expect(result.success).toBe(false);
    expect(result.error).toBeNull();
    expect(result.generalError).toBe(NETWORK_ERROR_MESSAGE);
  });

  it("echoes the typed text fields back so the form keeps its input", async () => {
    const formData = new FormData();
    formData.set("ktpNumber", "3171234567890123");
    formData.set("guardianName", "Budi");
    formData.append("photos", new File(["x"], "a.jpg", { type: "image/jpeg" }));

    const action = withNetworkFallback<State>(async () => {
      throw new TypeError("Failed to fetch");
    });

    const result = await action(initialState, formData);

    expect(result.fields).toEqual({
      ktpNumber: "3171234567890123",
      guardianName: "Budi",
    });
  });
});
