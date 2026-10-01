import { NextRequest, NextResponse } from "next/server";
import { requireAdmin, unauthorizedResponse } from "@/lib/auth-helpers";
import { connectDB } from "@/lib/db";
import Testimonial from "@/models/Testimonial";
import { serializeDocs, serialize } from "@/lib/serialize";
import { revalidateTestimonials } from "@/lib/revalidation";

export async function GET() {
  try {
    await requireAdmin();
  } catch {
    return unauthorizedResponse();
  }

  await connectDB();
  const testimonials = await Testimonial.find().sort({ order: 1, updatedAt: -1 }).lean();
  return NextResponse.json(serializeDocs(testimonials));
}

export async function POST(request: NextRequest) {
  try {
    await requireAdmin();
  } catch {
    return unauthorizedResponse();
  }

  try {
    await connectDB();
    const body = await request.json();
    if (!body.customerName || !body.testimonial) {
      return NextResponse.json({ error: "Customer name and testimonial are required" }, { status: 400 });
    }

    const testimonial = await Testimonial.create({
      customerName: body.customerName,
      title: body.title,
      location: body.location,
      testimonial: body.testimonial,
      rating: body.rating,
      productId: body.productId,
      serviceId: body.serviceId,
      image: body.image,
      order: body.order ?? 0,
      featured: body.featured ?? false,
      isDemo: body.isDemo ?? false,
      status: body.status || "draft",
    });

    revalidateTestimonials();
    return NextResponse.json(serialize(testimonial.toObject()), { status: 201 });
  } catch (error) {
    console.error("Testimonial create error:", error);
    return NextResponse.json({ error: "Failed to create testimonial" }, { status: 500 });
  }
}
