import { describe, it, expect, vi, beforeEach } from "vitest";

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
