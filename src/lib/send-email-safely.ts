import * as Sentry from "@sentry/nextjs";
import { sendEmail } from "@/lib/mail";

export async function sendEmailSafely(
  options: Parameters<typeof sendEmail>[0],
): Promise<boolean> {
  try {
    await sendEmail(options);
    return true;
  } catch (error) {
    Sentry.captureException(error);
    return false;
  }
}
