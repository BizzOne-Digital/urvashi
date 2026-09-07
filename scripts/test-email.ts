import { loadEnvFile } from "./load-env";
import { sendEmail, isSmtpConfigured } from "../src/lib/email";

loadEnvFile();

async function main() {
  const to = process.env.ORDER_NOTIFICATION_EMAIL || process.env.SMTP_USER;
  if (!to) {
    console.error("Set ORDER_NOTIFICATION_EMAIL or SMTP_USER in .env");
    process.exit(1);
  }

  if (!isSmtpConfigured()) {
    console.error("SMTP is not fully configured in .env");
    process.exit(1);
  }

  const result = await sendEmail({
    to,
    subject: "DPM SMTP test — customize notifications",
    text: [
      "This is a test email from the DPM Custom Prints website.",
      "",
      "If you received this, SMTP is working and paid customize requests will notify the owner correctly.",
      `Sent at: ${new Date().toISOString()}`,
    ].join("\n"),
  });

  console.log(result);
  process.exit(result.sent ? 0 : 1);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
