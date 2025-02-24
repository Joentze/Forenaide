import { FilePath } from "@/routes/run/-components/Confirmation";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

export function filePathToDownloadUrl(filePath: Partial<FilePath>): string {
  const bucket = "sources"
  const storageUrl = import.meta.env.STORAGE_URL ?? "http://localhost:54321/storage/v1/object/public";
  const fullPath = `${bucket}/${filePath.bucket_path}`;

  return `${storageUrl}/${fullPath}`;
}
