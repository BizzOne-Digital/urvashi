import { NextRequest, NextResponse } from "next/server";
import { requireAdmin, unauthorizedResponse } from "@/lib/auth-helpers";
import { connectDB } from "@/lib/db";
import SiteSettings from "@/models/SiteSettings";
import { getSettings } from "@/lib/settings";
import { resolveHomeViral, type HomeViralConfig } from "@/lib/home-viral";
import { serialize } from "@/lib/serialize";
import { revalidateSettings } from "@/lib/revalidation";

export async function GET() {
  try {
    await requireAdmin();
  } catch {
    return unauthorizedResponse();
  }

  const settings = await getSettings();
  const homeViral = resolveHomeViral(
    settings.homeViral
      ? {
          ...settings.homeViral,
          productSlugs: settings.homeViral.productSlugs,
          items: settings.homeViral.items,
          lastUpdatedAt: settings.homeViral.lastUpdatedAt?.toISOString(),
        }
      : null
  );

  return NextResponse.json(serialize({ homeViral }));
}

export async function PUT(request: NextRequest) {
  try {
    await requireAdmin();
  } catch {
    return unauthorizedResponse();
  }

  try {
    await connectDB();
    const body = (await request.json()) as Partial<HomeViralConfig>;

    const resolved = resolveHomeViral(body);
    const homeViral = {
      enabled: resolved.enabled,
      eyebrow: resolved.eyebrow,
      title: resolved.title,
      description: resolved.description,
      productSlugs: resolved.productSlugs,
      items: resolved.items,
      lastUpdatedAt: new Date(),
    };

    let settings = await SiteSettings.findOne();
    if (!settings) {
      settings = await SiteSettings.create({ homeViral });
    } else {
      settings.set("homeViral", { ...settings.get("homeViral"), ...homeViral });
      await settings.save();
    }

    revalidateSettings();

    const saved = resolveHomeViral({
      ...homeViral,
      lastUpdatedAt: homeViral.lastUpdatedAt.toISOString(),
    });

    return NextResponse.json(serialize({ homeViral: saved }));
  } catch (error) {
    console.error("Home viral update error:", error);
    return NextResponse.json({ error: "Failed to update home viral section" }, { status: 500 });
  }
}
