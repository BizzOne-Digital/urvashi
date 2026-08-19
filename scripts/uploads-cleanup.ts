import { existsSync, readdirSync, statSync, unlinkSync } from "fs";
import path from "path";
import { loadEnvFile } from "./load-env";
import { connectDB } from "../src/lib/db";
import MediaAsset from "../src/models/MediaAsset";
import CustomerArtwork from "../src/models/CustomerArtwork";
import Order from "../src/models/Order";
import CustomOrderRequest from "../src/models/CustomOrderRequest";
import BookingRequest from "../src/models/BookingRequest";

loadEnvFile();

const UPLOAD_DIR = process.env.UPLOAD_DIR || "./uploads";
const dryRun = !process.argv.includes("--execute");

function walkFiles(dir: string, root: string, files: string[] = []): string[] {
  if (!existsSync(dir)) return files;

  for (const entry of readdirSync(dir)) {
    const fullPath = path.join(dir, entry);
    const stat = statSync(fullPath);
    if (stat.isDirectory()) {
      walkFiles(fullPath, root, files);
    } else {
      files.push(path.relative(root, fullPath).replace(/\\/g, "/"));
    }
  }

  return files;
}

async function collectProtectedPrivatePaths(): Promise<Set<string>> {
  const protectedPaths = new Set<string>();

  const artworkIds = new Set<string>();

  const orders = await Order.find({}, { "items.customization.artworkAssetId": 1 }).lean();
  for (const order of orders) {
    for (const item of order.items || []) {
      const artworkId = item.customization?.artworkAssetId;
      if (artworkId) artworkIds.add(artworkId);
    }
  }

  const requests = await CustomOrderRequest.find({}, { artworkAssetIds: 1 }).lean();
  for (const request of requests) {
    for (const id of request.artworkAssetIds || []) {
      if (id) artworkIds.add(id);
    }
  }

  const bookings = await BookingRequest.find({}, { artworkAssetIds: 1 }).lean();
  for (const booking of bookings) {
    for (const id of booking.artworkAssetIds || []) {
      if (id) artworkIds.add(id);
    }
  }

  if (artworkIds.size > 0) {
    const artworks = await CustomerArtwork.find(
      { _id: { $in: [...artworkIds] } },
      { diskPath: 1 }
    ).lean();
    for (const artwork of artworks) {
      if (artwork.diskPath) protectedPaths.add(artwork.diskPath.replace(/\\/g, "/"));
    }
  }

  const allPrivateArtwork = await CustomerArtwork.find({}, { diskPath: 1 }).lean();
  for (const artwork of allPrivateArtwork) {
    if (artwork.diskPath) protectedPaths.add(artwork.diskPath.replace(/\\/g, "/"));
  }

  return protectedPaths;
}

async function main() {
  await connectDB();

  const uploadRoot = path.resolve(process.cwd(), UPLOAD_DIR);
  const publicRoot = path.join(uploadRoot, "public");
  const publicFiles = walkFiles(publicRoot, uploadRoot);
  const assets = await MediaAsset.find({ isPrivate: false }, { diskPath: 1, publicUrl: 1 }).lean();
  const referencedPaths = new Set(
    assets.map((asset) => asset.diskPath.replace(/\\/g, "/")).filter(Boolean)
  );

  const protectedPrivatePaths = await collectProtectedPrivatePaths();
  const orphans = publicFiles.filter(
    (filePath) => !referencedPaths.has(filePath) && !path.basename(filePath).startsWith(".")
  );

  console.log(dryRun ? "Dry run — no files will be deleted." : "Execute mode — deleting orphan public files.");
  console.log(`Upload root: ${uploadRoot}`);
  console.log(`Public files scanned: ${publicFiles.length}`);
  console.log(`Referenced public media records: ${referencedPaths.size}`);
  console.log(`Protected private artwork paths: ${protectedPrivatePaths.size}`);
  console.log(`Orphan public files found: ${orphans.length}`);

  if (orphans.length === 0) {
    console.log("Nothing to clean up.");
    process.exit(0);
  }

  for (const orphan of orphans) {
    const fullPath = path.join(uploadRoot, orphan);
    if (protectedPrivatePaths.has(orphan)) {
      console.log(`SKIP (protected): ${orphan}`);
      continue;
    }

    console.log(`${dryRun ? "WOULD DELETE" : "DELETE"}: ${orphan}`);
    if (!dryRun) {
      unlinkSync(fullPath);
    }
  }

  if (dryRun) {
    console.log("\nRe-run with --execute to delete the files listed above.");
  }

  process.exit(0);
}

main().catch((error) => {
  console.error("Upload cleanup failed:", error);
  process.exit(1);
});
