import { Button } from "@/components/ui/button"
import { useCallback } from "react"
import { useDropzone } from "react-dropzone"
import { X, File as FileIcon, FileStack } from "lucide-react"
import { create, StoreApi, UseBoundStore } from "zustand"
import { useShallow } from "zustand/react/shallow"
import { produce } from "immer"
import { cn } from "@/lib/utils"

interface FileStore {
  files: FileInfo[]
  validFiles: FileInfo[],
  addFiles: (file: File[]) => void
  failed: (fileIdx: number, message: string) => void
  uploaded: (fileIdx: number, url: string) => void
  removeFile: (fileIdx: number) => void
}

enum FileStatus {
  UPLOADING = "Uploading...",
  FAILED = "Failed",
  INVALID = "Invalid",
  UPLOADED = "Uploaded",
}

export type FileInfo = {
  status: FileStatus,
  message?: string,
  url?: string,
  filePath?: string,
  fileObj: File
}

export const useFileStore = create<FileStore>((set) => ({
  files: [],
  validFiles: [],
  addFiles: (files) => {
    set(
      produce((state: FileStore) => {
        for (const file of files) {
          state.files.push({ status: FileStatus.UPLOADING, fileObj: file })
        }
      })
    )
  },
  failed: (fileIdx, msg) => {
    set(
      produce((state: FileStore) => {
        state.files[fileIdx].status = FileStatus.FAILED
        state.files[fileIdx].message = msg
      })
    )
  },
  uploaded: (fileIdx, url) => {
    set(
      produce((state: FileStore) => {
        state.files[fileIdx].status = FileStatus.UPLOADED
        state.files[fileIdx].url = url
      })
    )
  },
  removeFile: (fileIdx) => {
    set(
      produce((state: FileStore) => {
        state.files.splice(fileIdx, 1)
      })
    )
  }
}))

function randomPromise(): Promise<string> {
  return new Promise((resolve, reject) => {
    const rand = Math.random()
    setTimeout(() => {
      if (rand < 0.5) {
        console.log(rand)
        resolve("uploaded")
      }
      else
        reject("failed")
    }, rand * 3000)
  })
}

export default function FileUpload({ useFileStore }: { useFileStore: UseBoundStore<StoreApi<FileStore>> }) {
  const files = useFileStore(state => state.files)
  const addFiles = useFileStore(state => state.addFiles)
  const failed = useFileStore(state => state.failed)
  const uploaded = useFileStore(state => state.uploaded)
  const removeFile = useFileStore(state => state.removeFile)

  const onDrop = async (acceptedFiles: File[]) => {
    const currentSize = files.length;
    addFiles(acceptedFiles);

    const fileUploading = acceptedFiles.map((file, index) => {
      return randomPromise();
    })

    fileUploading.forEach((filePromise, idx) => {
      const position = currentSize + idx;
      filePromise
        .then((result) => {
          uploaded(position, result)
        })
        .catch((reason) => {
          failed(position, reason)
        })
    })
  }

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: {
      'image/*': [], // Accept images
      'application/pdf': [], // Accept PDFs
    },
  })

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
            {files.map((file, index) => (
              <main
                key={index}
                className={cn("flex justify-between items-center border p-4 rounded", file.status == FileStatus.FAILED && "bg-red-100")}
              >
                <div className="flex justify-between items-center gap-3">
                  <figure className={cn("h-14 aspect-square border border-black border-opacity-15 rounded-md p-2 flex items-center justify-center")}>
                    <FileIcon className="text-secondary-foreground" />
                  </figure>
                  <section className="flex flex-col">
                    {file.fileObj.name}
                    <p className={cn("mt-0.5 opacity-60 text-sm"
                      , file.status == FileStatus.FAILED && "text-red-600"
                      , file.status == FileStatus.UPLOADED && "text-green-600"
                      // , [FileStatus.FAILED, FileStatus.UPLOADED].includes(file.status) && "font-semibold"
                    )}>
                      {`${file.status} (${(file.fileObj.size / 1024).toFixed(2)} KB)`}
                    </p>
                  </section>
                </div>
                <Button
                  size="lg"
                  variant="ghost"
                  className="relative hover:bg-transparent hover:border-destructive hover:text-destructive p-0"
                  onClick={() => removeFile(index)}
                >
                  <X size="64" />
                </Button>
                {/* <span>{file.status}</span> */}
              </main>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
