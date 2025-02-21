import { FileUploadResponse } from "@/lib/uploads"
import { FileInfo } from "./FileUpload"

type CreatePipelineRequest = {
  name: string
  description: string
  strategy_id: string
  extraction_schema: {
    extraction_config: {
      name: string
      description: string
      schema: {
        name: string
        description: string
        type: string
        }[]
      }
    }
  file_paths: Partial<FileUploadResponse>[]
}

export default function Confirmation({
  files,
  configFile,
  template
}: {
  files: FileInfo[]
  configFile: File | null
  template?: any[]
}) {

  const file_paths: Partial<FileUploadResponse>[] = files.map(file => ({
    id: file.storageId,
    path: file.filePath,
    url: file.downloadUrl,
    mimetype: file.mimetype,
    filename: file.filename,
    uploaded_at: file.uploaded_at
  }))

  const body: CreatePipelineRequest = {
    name: "Pipeline",
    description: "Pipeline description",
    strategy_id: "1",
    extraction_schema: {
      extraction_config: {
        name: "Extraction Config",
        description: "Extraction Config description",
        schema: template ?? []
      }
    },
    file_paths
  }

  async function submitPipeline() {
    await fetch("http://localhost:8000/api/pipelines", {
      method: "POST",
      body: JSON.stringify(body)
    })
  }

  return (
    <div>
      <h3 className="mb-4 text-lg font-bold">Confirmation</h3>
      <p className="mb-4">Review the details below before proceeding:</p>
      <h4 className="font-semibold mb-2">Selected Files:</h4>
      <ul className="space-y-2">
        {files.map((file, index) => (
          <li key={index} className="bg-gray-100 p-2 rounded">
            {file.fileObj.name} ({(file.fileObj.size / 1024).toFixed(2)} KB)
          </li>
        ))}
      </ul>
      {configFile && (
        <>
          <h4 className="font-semibold mt-4 mb-2">Configuration File:</h4>
          <div className="bg-gray-100 p-2 rounded">
            {configFile.name} ({(configFile.size / 1024).toFixed(2)} KB)
          </div>
        </>
      )}
    </div>
  )
}
