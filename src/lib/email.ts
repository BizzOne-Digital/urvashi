export interface EmailPayload {
  to: string;
  subject: string;
  text: string;
  html?: string;
}

export interface EmailResult {
  sent: boolean;
  message: string;
}

export function isSmtpConfigured(): boolean {
  return !!(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASSWORD);
}

export async function sendEmail(payload: EmailPayload): Promise<EmailResult> {
  if (!isSmtpConfigured()) {
    return {
      sent: false,
      message: "Email not configured. Request was saved to the database.",
    };
  }

  // SMTP adapter placeholder — install nodemailer and configure SMTP_* env vars for live delivery.
  // Requests are always persisted to MongoDB regardless of email status.
  console.info("[email] Would send:", payload.to, payload.subject);
  return {
    sent: false,
    message:
      "SMTP credentials are set but the mail transport is not bundled. Request was saved to the database. Configure nodemailer for live delivery.",
  };
}
