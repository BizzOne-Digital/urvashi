export const UPLOAD_FOLDERS = ["products", "gallery", "pages", "misc"] as const;
export type UploadFolder = (typeof UPLOAD_FOLDERS)[number];

const FOLDER_ALIASES: Record<string, UploadFolder> = {
  products: "products",
  gallery: "gallery",
  pages: "pages",
  misc: "misc",
  services: "misc",
};

export function resolveUploadFolder(folder: string): UploadFolder | null {
  return FOLDER_ALIASES[folder] ?? null;
}

export function isUploadFolder(folder: string): folder is UploadFolder {
  return UPLOAD_FOLDERS.includes(folder as UploadFolder);
}
