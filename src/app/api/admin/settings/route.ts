import { NextRequest, NextResponse } from "next/server";
import { requireAdmin, unauthorizedResponse } from "@/lib/auth-helpers";
import { connectDB } from "@/lib/db";
import SiteSettings from "@/models/SiteSettings";
import { getSettings } from "@/lib/settings";
import { serialize } from "@/lib/serialize";
import { revalidateSettings } from "@/lib/revalidation";

export async function GET() {
  try {
    await requireAdmin();
  } catch {
    return unauthorizedResponse();
  }

  const settings = await getSettings();
  return NextResponse.json(serialize(settings));
}

export async function PUT(request: NextRequest) {
  try {
    await requireAdmin();
  } catch {
    return unauthorizedResponse();
  }

  try {
    await connectDB();
    const body = await request.json();
    let settings = await SiteSettings.findOne();

    if (!settings) {
      settings = await SiteSettings.create(body);
    } else {
      Object.keys(body).forEach((key) => {
        const value = body[key];
        if (value && typeof value === "object" && !Array.isArray(value)) {
          settings!.set(key, { ...settings!.get(key), ...value });
        } else {
          settings!.set(key, value);
        }
      });
      await settings.save();
    }

    revalidateSettings();
    return NextResponse.json(serialize(settings.toObject()));
  } catch (error) {
    console.error("Settings update error:", error);
    return NextResponse.json({ error: "Failed to update settings" }, { status: 500 });
  }
}
