import { connectDB } from "@/lib/db";
import GalleryCategory from "@/models/GalleryCategory";
import Link from "next/link";
import { PageActions } from "@/components/admin/PageActions";
import { StatusBadge } from "@/components/admin/StatusBadge";
import MediaAsset from "@/models/MediaAsset";

export default async function AdminGalleryPage() {
  await connectDB();
  const categories = await GalleryCategory.find().sort({ order: 1 }).lean();

  const counts = await Promise.all(
    categories.map(async (cat) => ({
      id: cat._id.toString(),
      count: await MediaAsset.countDocuments({ galleryCategoryId: cat._id }),
    }))
  );
  const countMap = Object.fromEntries(counts.map((c) => [c.id, c.count]));

  return (
    <div>
      <PageActions createHref="/admin/gallery/new" createLabel="Add Category" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {categories.length === 0 ? (
          <p className="col-span-full rounded-lg border border-chrome-light/20 bg-white p-8 text-center text-chrome-mid">
            No gallery categories yet.
          </p>
        ) : (
          categories.map((cat) => (
            <Link
              key={cat._id.toString()}
              href={`/admin/gallery/${cat._id.toString()}`}
              className="group overflow-hidden rounded-lg border border-chrome-light/20 bg-white shadow-sm transition-all hover:border-royal-blue/30 hover:shadow-md"
            >
              {cat.coverImage && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={cat.coverImage} alt="" className="h-40 w-full object-cover" />
              )}
              <div className="p-4">
                <h3 className="font-semibold text-ink-black group-hover:text-royal-blue">{cat.name}</h3>
                <p className="text-xs text-chrome-mid">{cat.slug}</p>
                <div className="mt-2 flex items-center justify-between">
                  <StatusBadge status={cat.status} />
                  <span className="text-xs text-chrome-mid">
                    {countMap[cat._id.toString()] || 0} images
                  </span>
                </div>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
