import { connectDB } from "@/lib/db";
import BookingRequest from "@/models/BookingRequest";
import { serialize } from "@/lib/serialize";
import { notFound } from "next/navigation";
import { BookingDetailForm } from "../BookingDetailForm";

type Params = { params: Promise<{ id: string }> };

export default async function AdminBookingDetailPage({ params }: Params) {
  const { id } = await params;
  await connectDB();
  const booking = await BookingRequest.findById(id).lean();
  if (!booking) notFound();
  return <BookingDetailForm initialData={serialize(booking) as unknown as Parameters<typeof BookingDetailForm>[0]["initialData"]} />;
}
