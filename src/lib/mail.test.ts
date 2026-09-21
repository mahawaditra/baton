import { afterEach, describe, it, expect, vi, beforeEach } from "vitest";

const findFirstMock = vi.fn();
const sendMailMock = vi.fn().mockResolvedValue(undefined);

vi.mock("@/lib/prisma", () => ({
  prisma: {
    loanSetting: {
      findFirst: (...args: unknown[]) => findFirstMock(...args),
    },
  },
}));

vi.mock("nodemailer", () => ({
  default: {
    createTransport: () => ({
      sendMail: (...args: unknown[]) => sendMailMock(...args),
    }),
  },
}));

describe("sendEmail footer caching", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  beforeEach(() => {
    vi.resetModules();
    findFirstMock.mockReset();
    sendMailMock.mockReset();
    findFirstMock.mockResolvedValue({
      signatoryName: "Test Signatory",
      signatoryPhone: "0812xxxx",
      signatoryLineId: "test.line",
    });
  });

  it("only queries loan settings once across multiple sends", async () => {
    const { sendEmail } = await import("./mail");

    await sendEmail({ to: "a@example.com", subject: "s1", html: "<p>1</p>" });
    await sendEmail({ to: "b@example.com", subject: "s2", html: "<p>2</p>" });
    await sendEmail({ to: "c@example.com", subject: "s3", html: "<p>3</p>" });

    expect(findFirstMock).toHaveBeenCalledTimes(1);
    expect(sendMailMock).toHaveBeenCalledTimes(3);
  });

  it("re-queries loan settings after invalidateFooterCache is called", async () => {
    const { sendEmail, invalidateFooterCache } = await import("./mail");

    await sendEmail({ to: "a@example.com", subject: "s1", html: "<p>1</p>" });
    invalidateFooterCache();
    await sendEmail({ to: "b@example.com", subject: "s2", html: "<p>2</p>" });

    expect(findFirstMock).toHaveBeenCalledTimes(2);
  });

  it("re-queries once the cached footer is a minute old, so other warm instances catch up after a Ketua changes the contact info", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-09-21T10:00:00Z"));
    const { sendEmail } = await import("./mail");

    await sendEmail({ to: "a@example.com", subject: "s1", html: "<p>1</p>" });
    vi.setSystemTime(new Date("2026-09-21T10:00:59Z"));
    await sendEmail({ to: "b@example.com", subject: "s2", html: "<p>2</p>" });
    expect(findFirstMock).toHaveBeenCalledTimes(1);

    vi.setSystemTime(new Date("2026-09-21T10:01:01Z"));
    await sendEmail({ to: "c@example.com", subject: "s3", html: "<p>3</p>" });
    expect(findFirstMock).toHaveBeenCalledTimes(2);
  });

  it("escapes the signatory details before putting them into the HTML footer", async () => {
    findFirstMock.mockResolvedValue({
      signatoryName: "<b>Ketua</b> & Co",
      signatoryPhone: "0812xxxx",
      signatoryLineId: "line-id",
    });
    const { sendEmail } = await import("./mail");

    await sendEmail({ to: "a@example.com", subject: "s1", html: "<p>1</p>" });

    const html = sendMailMock.mock.calls[0][0].html as string;
    expect(html).toContain("&lt;b&gt;Ketua&lt;/b&gt; &amp; Co");
    expect(html).not.toContain("<b>Ketua</b>");
  });

  it("includes the cached signatory contact info in every sent email", async () => {
    const { sendEmail } = await import("./mail");

    await sendEmail({ to: "a@example.com", subject: "s1", html: "<p>1</p>" });
    await sendEmail({ to: "b@example.com", subject: "s2", html: "<p>2</p>" });

    const firstHtml = sendMailMock.mock.calls[0][0].html as string;
    const secondHtml = sendMailMock.mock.calls[1][0].html as string;

    expect(firstHtml).toContain("Test Signatory");
    expect(secondHtml).toContain("Test Signatory");
  });
});
