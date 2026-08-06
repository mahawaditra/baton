import "dotenv/config";
import { sendEmail } from "../src/lib/mail";

async function main() {
  await sendEmail({
    to: "zenkalium@gmail.com",
    subject: "Test Email",
    html: "<h1>Hello from BATON</h1><p>This is a test email.</p>",
  });
  console.log("Test email sent successfully!");
}

main().catch((error) => {
  console.error("Error sending test email:", error);
});
