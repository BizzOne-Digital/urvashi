import { NextRequest, NextResponse } from "next/server";
import { confirmCustomizePayment } from "@/lib/customize-submission";
import { isMonerisConfigured } from "@/lib/moneris";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const ticket = body.ticket as string | undefined;
    const referenceNumber = body.referenceNumber as string | undefined;

    if (!ticket || !referenceNumber) {
      return NextResponse.json({ error: "Missing payment confirmation details" }, { status: 400 });
    }

    if (!isMonerisConfigured()) {
      return NextResponse.json({ error: "Payment verification unavailable" }, { status: 503 });
    }

    const result = await confirmCustomizePayment(ticket, referenceNumber);
    return NextResponse.json(result);
  } catch (error) {
    console.error("Customize confirm error:", error);
    const message = error instanceof Error ? error.message : "Failed to confirm payment";
    const status = message === "Submission not found" ? 404 : message === "Payment not completed" ? 400 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
