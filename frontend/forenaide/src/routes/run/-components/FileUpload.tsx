import { Button } from "@/components/ui/button"
import { useDropzone } from "react-dropzone"
import { X, File as FileIcon, FileStack, LoaderCircle, FileXIcon, FileWarning } from "lucide-react"
import { create, StoreApi, UseBoundStore } from "zustand"
import { persist, createJSONStorage } from "zustand/middleware"
import { produce, enableMapSet } from "immer"
import { cn } from "@/lib/utils"


interface FileStore {
  files: FileInfo[]
  validFiles: FileInfo[]
  addFiles: (files: [string, File][]) => void
  failed: (fileId: string, message: string) => void
  uploaded: (fileId: string, url: string) => void
  removeFile: (fileId: string) => void
}

enum FileStatus {
  UPLOADING = "Uploading...",
  FAILED = "Failed",
  INVALID = "Invalid",
  UPLOADED = "Uploaded",
}

export type FileInfo = {
  id: string,
  status: FileStatus,
  message?: string,
  url?: string,
  filePath?: string,
  fileObj: File
}

export const useFileStore = create<FileStore>(
  // create(persist<FileStore>((set) => ({
  (set) => ({
    files: [],
    validFiles: [],
    addFiles: (files) => {
      set(
        produce((state: FileStore) => {
          for (const [id, file] of files) {
            state.files.push({ id, status: FileStatus.UPLOADING, fileObj: file })
          }
        })
      )
    },
    failed: (fileId, msg) => {
      set(
        produce((state: FileStore) => {
          const file = state.files.find(f => f.id === fileId)
          if (file) {
            file.status = FileStatus.FAILED
            file.message = msg
          }
        })
      )
    },
    uploaded: (fileId, url) => {
      set(
        produce((state: FileStore) => {
          const file = state.files.find(f => f.id === fileId)
          if (file) {
            file.status = FileStatus.UPLOADED
            file.url = url
          }
        })
      )
    },
    removeFile: (fileId) => {
      set(
        produce((state: FileStore) => {
          const index = state.files.findIndex(f => f.id === fileId)
          if (index !== -1) {
            state.files.splice(index, 1)
          }
        })
      )
    }
  }))

// , { name: "fileStorage" }))

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
    const filesToUpload = acceptedFiles.map(file => [crypto.randomUUID(), file] as [string, File])
    console.log(filesToUpload)
    addFiles(filesToUpload);

    const fileUploading = filesToUpload.map(([id, file]) => {
      return [id, randomPromise()] as const
    })

    fileUploading.forEach(([id, filePromise]) => {
      filePromise
        .then((result) => {
          uploaded(id, result)
        })
        .catch((reason) => {
          failed(id, reason)
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
            {files.map((file) => (
              <main
                key={file.id}
                className={cn("flex justify-between items-center border p-4 rounded", file.status == FileStatus.FAILED && "bg-red-100")}
              >
                <div className="flex justify-between items-center gap-3">
                  <figure className={cn("h-14 aspect-square border border-black border-opacity-15 rounded-md p-2 flex items-center justify-center")}>
                    {(file.status == FileStatus.UPLOADING && <LoaderCircle className="animate-spin text-xl" size={30} />)
                      || (file.status == FileStatus.UPLOADED && <FileIcon className="text-secondary-foreground" size={30} />)
                      || (file.status == FileStatus.FAILED) && <FileWarning size={30} />
                    }
                  </figure>
                  <section className="flex flex-col">
                    {file.fileObj.name}
                    <p className={cn("mt-0.5 opacity-60 text-sm"
                      , file.status == FileStatus.FAILED && "text-destructive"
                      , file.status == FileStatus.UPLOADED && "text-green-600"
                      // , [FileStatus.FAILED, FileStatus.UPLOADED].includes(file.status) && "font-semibold"
                    )}>
                      {`${file.status}${file.message ? ": " + file.message : ""} (${(file.fileObj.size / 1024).toFixed(2)} KB)`}
                    </p>
                  </section>
                </div>
                <button
                  className="relative hover:bg-transparent hover:text-destructive p-0 max-h-24 flex items-center justify-center"
                  onClick={() => removeFile(file.id)}
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
  )
}
