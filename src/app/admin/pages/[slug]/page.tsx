import { connectDB } from "@/lib/db";
import Page from "@/models/Page";
import { serialize } from "@/lib/serialize";
import { notFound } from "next/navigation";
import { PageEditorForm } from "./PageEditorForm";

type Params = { params: Promise<{ slug: string }> };

export default async function PageEditorPage({ params }: Params) {
  const { slug } = await params;
  await connectDB();
  const page = await Page.findOne({ slug }).lean();
  if (!page) notFound();

  return <PageEditorForm slug={slug} initialData={serialize(page) as unknown as Parameters<typeof PageEditorForm>[0]["initialData"]} />;
}
