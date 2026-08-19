import { connectDB } from "@/lib/db";
import Order from "@/models/Order";
import { serialize } from "@/lib/serialize";
import { notFound } from "next/navigation";
import { OrderDetailForm } from "../OrderDetailForm";

type Params = { params: Promise<{ id: string }> };

export default async function AdminOrderDetailPage({ params }: Params) {
  const { id } = await params;
  await connectDB();
  const order = await Order.findById(id).lean();
  if (!order) notFound();
  return <OrderDetailForm initialData={serialize(order) as unknown as Parameters<typeof OrderDetailForm>[0]["initialData"]} />;
}
