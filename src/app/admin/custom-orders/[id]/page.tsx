import { connectDB } from "@/lib/db";
import CustomOrderRequest from "@/models/CustomOrderRequest";
import { serialize } from "@/lib/serialize";
import { notFound } from "next/navigation";
import { CustomOrderDetailForm } from "../CustomOrderDetailForm";

type Params = { params: Promise<{ id: string }> };

export default async function AdminCustomOrderDetailPage({ params }: Params) {
  const { id } = await params;
  await connectDB();
  const request = await CustomOrderRequest.findById(id).lean();
  if (!request) notFound();
  return <CustomOrderDetailForm initialData={serialize(request) as unknown as Parameters<typeof CustomOrderDetailForm>[0]["initialData"]} />;
}
