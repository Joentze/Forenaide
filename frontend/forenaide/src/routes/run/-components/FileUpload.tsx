import { Button } from "@/components/ui/button"
import { useCallback } from "react"
import { useDropzone } from "react-dropzone"
import { X, File as FileIcon } from "lucide-react"

interface FileUploadProps {
  files: File[]
  setFiles: React.Dispatch<React.SetStateAction<File[]>>
}

enum DataSourceStatus {
  UPLOADING = "uploading",
  FAILED = "failed",
  INVALID = "invalid"
}

export type DataSource = {
  status: DataSourceStatus,
  fileObj: File
}

export default function FileUpload({ files, setFiles }: FileUploadProps) {
  const onDrop = useCallback((acceptedFiles: File[]) => {
    setFiles((prev) => [...prev, ...acceptedFiles])
  }, [])

  const removeFile = useCallback((index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index))
  }, [])

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
              <div>
                <div
                  key={index}
                  className="flex justify-between items-center bg-secondary p-4 rounded"
                >
                  <div className="flex justify-between items-center gap-2">
                    <figure className="aspect-square border rounded-md p-2">
                      <FileIcon className="text-secondary-foreground" />
                    </figure>
                    <span>
                      {file.name} ({(file.size / 1024).toFixed(2)} KB)
                    </span>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="hover:bg-transparent hover:border-destructive hover:text-destructive p-0"
                    onClick={() => removeFile(index)}
                  >
                    <X />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
