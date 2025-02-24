import { FileUploadResponse } from "@/lib/uploads"
import { FileInfo } from "./FileUpload"
import { useEffect, useState } from "react"
import { CircleCheck } from "lucide-react"
import { Link } from "@tanstack/react-router"
import { SchemaItem } from "./TemplateConfig"

export type FilePath = {
  uri?: string
  mimetype: string
  bucket_path: string
  filename: string
}

export type CreatePipelineRequest = {
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
  file_paths: Partial<FilePath>[]
}

export default function Confirmation({
  files,
  configFile,
  templateName="",
  templateFields,
  setPipelineRequest,
  isPipelineCreated
}: {
  files: FileInfo[]
  configFile: File | null
  templateName?: string
  templateFields?: SchemaItem[]
  setPipelineRequest: (request: CreatePipelineRequest) => void
  isPipelineCreated: boolean
}) {

  const [oldFiles, setOldFiles] = useState<FileInfo[]>([])

  useEffect(() => {
    const file_paths: Partial<FilePath>[] = files.map(file => ({
      uri: file.downloadUrl,
      bucket_path: file.storageId + "/" + file.filename,
      mimetype: file.mimetype,
      filename: file.filename,
    }))

    const body: CreatePipelineRequest = {
      name: "Pipeline",
      description: "Pipeline description",
      strategy_id: "86a1b98b-b3fe-4f92-96e2-0fbe141fe669",
      extraction_schema: {
        extraction_config: {
          name: "Extraction Config",
          description: "extract the relevant fields for documents",
          schema: templateFields ?? []
        }
      },
      file_paths
    }
    setPipelineRequest(body)
    if (files.length > 0)
      setOldFiles(files)

  }, [files, configFile, templateFields])

  // async function submitPipeline() {
  //   await fetch("http://localhost:8000/api/pipelines", {
  //     method: "POST",
  //     body: JSON.stringify(body)
  //   })
  // }

  return (
    <>
      {isPipelineCreated &&
        (<div className="w-full flex items-center justify-start mb-4">
          <div className="*:mt-3">
            <p className="text-lg font-bold">Pipeline Created</p>
            <p className="">Your pipeline has been created successfully. <Link to="/" className="underline">Return to dashboard</Link></p>
            <CircleCheck className="text-green-600" size={84} />
          </div>
        </div>)
      }

      <div className={ isPipelineCreated ? "opacity-50": ""}>
        <h3 className="mb-4 text-lg font-bold">Confirmation</h3>
        <p className="mb-4">Review the details below before proceeding:</p>
        <h4 className="font-semibold mb-2">Selected Files:</h4>
        <ul className="space-y-2">
          {oldFiles.map((file, index) => (
            <li key={index} className="bg-gray-100 p-2 rounded">
              {file.fileObj.name} ({(file.fileObj.size / 1024).toFixed(2)} KB)
            </li>
          ))}
        </ul>
        {/* {configFile && (
          <>
            <h4 className="font-semibold mt-4 mb-2">Configuration File:</h4>
            <div className="bg-gray-100 p-2 rounded">
              {configFile.name} ({(configFile.size / 1024).toFixed(2)} KB)
            </div>
          </>
        )} */}

        {templateFields && (
          <div className="mt-4">
            <h4 className="font-semibold mb-2">Extraction Schema:</h4>
            <ul className="space-y-2">
              {templateFields.map((field, index) => (
                <li key={index} className="bg-gray-100 p-2 rounded">
                  <span className="font-semibold">{field.name} </span>
                  ({field.type})
                  <span className="text-sm opacity-50"> {field.description}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </>
  )
}
