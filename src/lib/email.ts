export interface EmailAttachment {
  filename: string;
  content: Buffer;
  contentType?: string;
}

export interface EmailPayload {
  to: string;
  subject: string;
  text: string;
  html?: string;
  attachments?: EmailAttachment[];
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
    console.info("[email] SMTP not configured. Would send to:", payload.to, payload.subject);
    return {
      sent: false,
      message: "Email not configured. Request was saved to the database.",
    };
  }

  try {
    const nodemailer = await import("nodemailer");
    const port = parseInt(process.env.SMTP_PORT || "587", 10);
    const transport = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port,
      secure: port === 465,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
    });

    const from = process.env.SMTP_FROM || process.env.SMTP_USER || "noreply@dpmcustomprints.com";

    await transport.sendMail({
      from,
      to: payload.to,
      subject: payload.subject,
      text: payload.text,
      html: payload.html || payload.text.replace(/\n/g, "<br>"),
      attachments: payload.attachments?.map((file) => ({
        filename: file.filename,
        content: file.content,
        contentType: file.contentType,
      })),
    });

    return { sent: true, message: "Email sent successfully." };
  } catch (error) {
    console.error("[email] Send failed:", error);
    return {
      sent: false,
      message: "Failed to send email. Request was saved to the database.",
    };
  }
}
