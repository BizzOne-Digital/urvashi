import { connectDB } from "@/lib/db";
import Page from "@/models/Page";
import Link from "next/link";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { FileText } from "lucide-react";

export default async function AdminPagesListPage() {
  await connectDB();
  const pages = await Page.find().sort({ slug: 1 }).lean();

  return (
    <div>
      <p className="mb-6 text-sm text-chrome-mid">
        Edit page sections and content for each public page on the site.
      </p>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {pages.length === 0 ? (
          <p className="col-span-full rounded-lg border border-chrome-light/20 bg-white p-8 text-center text-chrome-mid">
            No pages found. Run the seed script to populate pages.
          </p>
        ) : (
          pages.map((page) => (
            <Link
              key={page._id.toString()}
              href={`/admin/pages/${page.slug}`}
              className="group rounded-lg border border-chrome-light/20 bg-white p-5 shadow-sm transition-all hover:border-royal-blue/30 hover:shadow-md"
            >
              <div className="mb-3 flex items-center gap-3">
                <div className="rounded-md bg-royal-blue/10 p-2">
                  <FileText className="h-5 w-5 text-royal-blue" />
                </div>
                <div>
                  <h3 className="font-semibold text-ink-black group-hover:text-royal-blue">
                    {page.title}
                  </h3>
                  <p className="text-xs text-chrome-mid">/{page.slug === "home" ? "" : page.slug}</p>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <StatusBadge status={page.status} />
                <span className="text-xs text-chrome-mid">{page.sections?.length || 0} sections</span>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
