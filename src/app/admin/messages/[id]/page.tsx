import { connectDB } from "@/lib/db";
import ContactMessage from "@/models/ContactMessage";
import { serialize } from "@/lib/serialize";
import { notFound } from "next/navigation";
import { MessageDetailForm } from "../MessageDetailForm";

type Params = { params: Promise<{ id: string }> };

export default async function AdminMessageDetailPage({ params }: Params) {
  const { id } = await params;
  await connectDB();
  const message = await ContactMessage.findById(id).lean();
  if (!message) notFound();
  return <MessageDetailForm initialData={serialize(message) as unknown as Parameters<typeof MessageDetailForm>[0]["initialData"]} />;
}
