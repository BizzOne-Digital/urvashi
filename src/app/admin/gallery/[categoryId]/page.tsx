import { connectDB } from "@/lib/db";
import GalleryCategory from "@/models/GalleryCategory";
import MediaAsset from "@/models/MediaAsset";
import { serialize, serializeDocs } from "@/lib/serialize";
import { notFound } from "next/navigation";
import { GalleryEditor } from "../GalleryEditor";

type Params = { params: Promise<{ categoryId: string }> };

export default async function AdminGalleryCategoryPage({ params }: Params) {
  const { categoryId } = await params;

  if (categoryId === "new") {
    return (
      <GalleryEditor
        categoryId="new"
        initialCategory={{
          _id: "",
          name: "",
          slug: "",
          description: "",
          order: 0,
          status: "active",
        }}
        initialAssets={[]}
      />
    );
  }

  await connectDB();
  const category = await GalleryCategory.findById(categoryId).lean();
  if (!category) notFound();

  const assets = await MediaAsset.find({ galleryCategoryId: categoryId })
    .sort({ order: 1 })
    .lean();

  return (
    <GalleryEditor
      categoryId={categoryId}
      initialCategory={serialize(category) as unknown as Parameters<typeof GalleryEditor>[0]["initialCategory"]}
      initialAssets={serializeDocs(assets) as unknown as Parameters<typeof GalleryEditor>[0]["initialAssets"]}
    />
  );
}
