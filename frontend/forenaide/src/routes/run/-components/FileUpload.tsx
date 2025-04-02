import { Button } from "@/components/ui/button";
import { useDropzone } from "react-dropzone";
import {
  X,
  File as FileIcon,
  FileStack,
  LoaderCircle,
  FileXIcon,
  FileWarning,
  FileUp,
} from "lucide-react";
import { create, StoreApi, UseBoundStore } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { produce, enableMapSet } from "immer";
import { cn, filePathToDownloadUrl, filePathToFileInfo } from "@/lib/utils";
import {
  FileUploadResponse,
  jsonStorage,
  uploadFile,
} from "../../../lib/uploads";
import { useToast } from "@/hooks/use-toast";
import { FilePath } from "./Confirmation";

export interface FileStore {
  files: FileInfo[];
  validFiles: FileInfo[];
  setFiles: (files: FileInfo[]) => void;
  addFiles: (files: [string, File][]) => void;
  failed: (fileId: string, message: string) => void;
  uploaded: (fileId: string, uploadResponse: FileUploadResponse) => void;
  removeFile: (fileId: string, toast?: Function) => void;
  clearFiles: () => void;
  fromFilePaths: (files: FilePath[]) => void;
}

export enum FileStatus {
  UPLOADING = "Uploading...",
  FAILED = "Failed",
  REMOVING = "Removing",
  UPLOADED = "Uploaded",
}

export type FileInfo = {
  id: string;
  // Id of the file in storage bucket
  storageId?: string;
  status: FileStatus;
  message?: string;
  fileObj?: File;
  downloadUrl?: string;
  // Path of the file in storage bucket
  filePath?: string;
  mimetype?: string;
  // stem of the file
  filename?: string;
  uploaded_at?: string;
};

class SourcesPipelineError extends Error {
  constructor(
    message: string,
    public readonly response: Response
  ) {
    super(message);
  }
}

export const useFileStore = create(
  persist<FileStore>(
    (set, get) => ({
      files: [],
      validFiles: [],
      setFiles: (files: FileInfo[]) => set((state) => ({ files })),
      addFiles: (files) => {
        set(
          produce((state: FileStore) => {
            for (const [id, file] of files) {
              state.files.push({
                id,
                status: FileStatus.UPLOADING,
                fileObj: file,
              });
            }
          })
        );
      },
      failed: (fileId, msg) => {
        set(
          produce((state: FileStore) => {
            const file = state.files.find((f) => f.id === fileId);
            if (file) {
              file.status = FileStatus.FAILED;
              file.message = msg;
            }
          })
        );
      },
      uploaded: (fileId, uploadResponse) => {
        set(
          produce((state: FileStore) => {
            const file = state.files.find((f) => f.id === fileId);
            if (file) {
              file.status = FileStatus.UPLOADED;
              file.filePath = uploadResponse.path;
              file.downloadUrl = uploadResponse.url;
              file.storageId = uploadResponse.id;
              file.mimetype = uploadResponse.mimetype;
              file.uploaded_at = uploadResponse.uploaded_at;
              file.filename = uploadResponse.filename;
            }
          })
        );
      },
      removeFile: async (fileId, toast) => {
        const index = get().files.findIndex((f) => f.id === fileId);
        const file = get().files[index];

        if (file?.status === FileStatus.UPLOADED) {
          set(
            produce((state) => {
              state.files[index].status = FileStatus.REMOVING;
            })
          );
          try {
            await deleteFile(file);
          } catch (e) {
            let description = (e as Error).message;
            let variant = "destructive";
            let title = "Failed to delete file";

            if (e instanceof SourcesPipelineError) {
              variant = "warning";
              title = "File excluded from pipeline";
            }

            toast &&
              toast({
                title,
                description,
                variant,
              });
          }
        }

        set(
          produce((state: FileStore) => {
            const index = state.files.findIndex((f) => f.id === fileId);
            if (index !== -1) {
              state.files.splice(index, 1);
            }
          })
        );
      },
      clearFiles: () => {
        set(
          produce((state: FileStore) => {
            state.files = [];
          })
        );
      },
      fromFilePaths: (files: FilePath[]) => {
        set(
          produce((state: FileStore) => {
            state.files = files.map(filePathToFileInfo);
          })
        );
      },
    }),
    { name: "fileStore", storage: jsonStorage }
  )
);

async function deleteFile(file: FileInfo): Promise<void | FileUploadResponse> {
  if (!file.filePath) throw new Error("Invalid file path");

  if (!file?.storageId) throw new Error("Invalid object ID");

  const res = await fetch(
    "http://localhost:8000/api/data_sources/" + file?.storageId,
    {
      method: "DELETE",
    }
  );

  // ignore response body as 204 No Content is expected
  const resBody = await res.json().catch(() => {});

  if (res.status == 400) {
    throw new SourcesPipelineError(
      resBody?.detail ?? "Failed to delete file",
      resBody?.detail
    );
  }

  if (!res.ok) throw new Error(`${res.status} ${resBody?.detail ?? ""}`);
}

export default function FileUpload({
  useFileStore,
}: {
  useFileStore: UseBoundStore<StoreApi<FileStore>>;
}) {
  const files = useFileStore((state) => state.files);
  const addFiles = useFileStore((state) => state.addFiles);
  const failed = useFileStore((state) => state.failed);
  const uploaded = useFileStore((state) => state.uploaded);
  const removeFile = useFileStore((state) => state.removeFile);

  const onDrop = async (acceptedFiles: File[]) => {
    const filesToUpload = acceptedFiles.map(
      (file) => [crypto.randomUUID(), file] as [string, File]
    );
    addFiles(filesToUpload);

    const fileUploading = filesToUpload.map(([id, file]) => {
      return [id, uploadFile(file)] as const;
    });

    fileUploading.forEach(([id, filePromise]) => {
      filePromise
        .then((result) => {
          uploaded(id, result);
        })
        .catch((reason) => {
          failed(id, reason);
        });
    });
  };

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: {
      "image/*": [], // Accept images
      "application/pdf": [], // Accept PDFs
    },
  });

  const { toast } = useToast();

  return (
    <div>
      <h3 className="mb-4 text-lg font-bold">
        Upload your files by dragging and dropping or clicking below:
      </h3>

      <div
        {...getRootProps()}
        className="border-2 border-dashed p-6 rounded cursor-pointer bg-gray-50 hover:bg-gray-100 text-center transition-all duration-200"
      >
        <input {...getInputProps()} />
        <p className="text-gray-500">
          Drag & drop files here, or click to select files
        </p>
      </div>
      {files.length > 0 && (
        <div className="mt-4">
          <h4 className="font-semibold mb-2">Selected Files:</h4>
          <div className="grid grid-cols-3 gap-2">
            {files.map((file) => (
              <main
                key={file.id}
                className={cn(
                  "flex justify-between items-center border p-4 rounded transition-all",
                  file.status == FileStatus.FAILED && "bg-red-100",
                  file.status == FileStatus.REMOVING && "opacity-15"
                )}
              >
                <div className="flex justify-between items-center gap-3">
                  <a
                    href={filePathToDownloadUrl(file.filePath)}
                    target="_blank"
                  >
                    <figure
                      className={cn(
                        "h-14 aspect-square border border-black border-opacity-15 rounded-md p-2 flex items-center justify-center"
                      )}
                    >
                      {(file.status == FileStatus.UPLOADING && (
                        <LoaderCircle
                          className="animate-spin text-xl"
                          size={30}
                        />
                      )) ||
                        (file.status == FileStatus.UPLOADED && (
                          <FileIcon
                            className="text-secondary-foreground"
                            size={30}
                          />
                        )) ||
                        (file.status == FileStatus.FAILED && (
                          <FileWarning size={30} />
                        ))}
                    </figure>
                  </a>
                  <section className="flex flex-col">
                    {file?.fileObj?.name ?? "Unknown file"}
                    <p
                      className={cn(
                        "mt-0.5 opacity-60 text-sm",
                        file.status == FileStatus.FAILED && "text-destructive",
                        file.status == FileStatus.UPLOADED && "text-green-600"
                        // , [FileStatus.FAILED, FileStatus.UPLOADED].includes(file.status) && "font-semibold"
                      )}
                    >
                      {`${file.status}${file.message ? ": " + file.message : ""} (${((file?.fileObj?.size ?? 0) / 1024).toFixed(2)} KB)`}
                    </p>
                  </section>
                </div>
                <button
                  className="relative hover:bg-transparent hover:text-destructive p-0 max-h-24 flex items-center justify-center"
                  onClick={() => removeFile(file.id, toast)}
                >
                  <X />
                </button>
                {/* <span>{file.status}</span> */}
              </main>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
