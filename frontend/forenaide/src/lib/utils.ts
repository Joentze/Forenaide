import { FilePath } from "@/routes/run/-components/Confirmation";
import { FileInfo, FileStatus } from "@/routes/run/-components/FileUpload";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

export function filePathToDownloadUrl(filePath?: string): string {
  if (!filePath) return "";
  const bucket = "sources"
  const storageUrl = import.meta.env.STORAGE_URL ?? "http://localhost:54321/storage/v1/object/public";
  const fullPath = `${bucket}/${filePath}`;

  return `${storageUrl}/${fullPath}`;
}

export function filePathToFileInfo(path: FilePath): FileInfo {
  return {
    id: crypto.randomUUID() as string,
    filePath: path.bucket_path,
    storageId: path.bucket_path.split("/")[0],
    status: FileStatus.UPLOADED,
    downloadUrl: filePathToDownloadUrl(path.bucket_path),
    fileObj: new File([], path.filename, {}),
    mimetype: path.mimetype,
    filename: path.filename,
  }

}
