import { FileInfo, FileStore } from "@/routes/run/-components/FileUpload";
import { createJSONStorage } from "zustand/middleware";
import { supabaseEdgeFunctionEndpoint } from "./api";

export type FileUploadResponse = {
  id: string;
  path: string;
  url: string;
  mimetype: string;
  filename: string;
  uploaded_at: string;
};

// , { name: "fileStorage" }))
export async function uploadFile(
  file: File
): Promise<never | FileUploadResponse> {
  const res = await fetch(
    `${supabaseEdgeFunctionEndpoint}/upload-file-as-pdf`,
    {
      method: "POST",
      // add file to body
      body: (() => {
        const data = new FormData();
        data.append("file", file);
        return data;
      })(),
    }
  );

  const resBody = await res.json();

  if (!res.ok) throw new Error(`${res.status} ${resBody?.detail ?? ""}`);

  return resBody as FileUploadResponse;
}

type StoredFileInfo = Omit<FileInfo, "fileObj"> & { fileObj: any };

export const jsonStorage = createJSONStorage<FileStore>(() => sessionStorage, {
  replacer: (key, val) => {
    let newValue = val as StoredFileInfo;
    if (newValue && newValue?.fileObj !== undefined) {
      newValue = structuredClone(newValue);
      const fileObj = newValue.fileObj;

      newValue.fileObj = {
        lastModified: fileObj.lastModified,
        lastModifiedDate: fileObj.lastModifiedDate,
        name: fileObj.name,
        size: fileObj.size,
        type: fileObj.type,
      };

      return newValue;
    }
    return val;
  },
});
