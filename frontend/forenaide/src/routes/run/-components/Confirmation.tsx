import { FileUploadResponse } from "@/lib/uploads";
import { FileInfo } from "./FileUpload";
import { Ref, useEffect, useState } from "react";
import { CircleCheck } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { SchemaItem } from "./TemplateConfig";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useSchemaFieldStore } from "@/hooks/use-schema-field-store";

export type FilePath = {
  uri?: string;
  mimetype: string;
  bucket_path: string;
  filename: string;
};

export type CreatePipelineRequest = {
  name: string;
  description: string;
  strategy_id: string;
  extraction_schema: {
    extraction_config: {
      name: string;
      description: string;
      schema: {
        name: string;
        description: string;
        type: string;
      }[];
    };
  };
  file_paths: Partial<FilePath>[];
};

export default function Confirmation({
  files,
  configFile,
  templateName = "",
  templateFields,
  pipelineRequest,
  setPipelineRequest,
  isPipelineCreated,
  formRef,
}: {
  files: FileInfo[];
  configFile: File | null;
  templateName?: string;
  templateFields?: SchemaItem[];
  pipelineRequest: CreatePipelineRequest | null;
  setPipelineRequest: (request: CreatePipelineRequest) => void;
  isPipelineCreated: boolean;
  formRef: Ref<HTMLFormElement>;
}) {
  const [pipelineName, setPipelineName] = useState<string>("");
  const {
    config,
    configDescription: description,
    configStrategy: strategy_id,
    reset,
  } = useSchemaFieldStore();
  const [oldFiles, setOldFiles] = useState<FileInfo[]>([]);

  useEffect(() => {
    const file_paths: Partial<FilePath>[] = files.map((file) => ({
      uri: file.downloadUrl,
      bucket_path: file.filePath,
      mimetype: file.mimetype,
      filename: file.filename,
    }));

    const body: CreatePipelineRequest = {
      name: pipelineName,
      description,
      strategy_id,
      extraction_schema: {
        extraction_config: {
          name: "extraction_tool",
          description: "extract the relevant fields for documents",
          schema: templateFields ?? [],
        },
      },
      file_paths,
    };
    setPipelineRequest(body);
    if (files.length > 0) setOldFiles(files);
  }, [pipelineName, files, configFile, templateFields]);

  // async function submitPipeline() {
  //   await fetch("http://localhost:8000/api/pipelines", {
  //     method: "POST",
  //     body: JSON.stringify(body)
  //   })
  // }

  return (
    <>
      {isPipelineCreated && (
        <div className="w-full flex items-center justify-start mb-4">
          <div className="*:mt-3">
            <p className="text-lg font-bold">Pipeline Created</p>
            <p className="">
              Your pipeline has been created successfully.{" "}
              <Link to="/" className="underline">
                Return to dashboard
              </Link>
            </p>
            <CircleCheck className="text-green-600" size={84} />
          </div>
        </div>
      )}

      <div className={isPipelineCreated ? "opacity-50" : ""}>
        {/* <h3 className="mb-4 text-lg font-bold">Confirmation</h3> */}
        <p className="mb-4">Review the details below before proceeding:</p>
        <section className="flex flex-col gap-2 items-start">
          <h4 className="font-semibold mb-2">Name the pipeline:</h4>
          <form ref={formRef}>
            <Input
              type="text"
              placeholder="Pipeline for ..."
              name="pipelineName"
              className="w-80 mb-3"
              value={pipelineRequest?.name ?? ""}
              onChange={(e) =>
                setPipelineRequest({ ...pipelineRequest, name: e.target.value })
              }
              required
            ></Input>
          </form>
        </section>
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

        {config && (
          <div className="mt-4">
            <h4 className="font-semibold mb-2">Extraction Schema:</h4>
            <ul className="space-y-2">
              {config.map((field, index) => (
                <li key={index} className="bg-gray-100 p-2 rounded">
                  <span className="font-semibold">{field.name} </span>(
                  {field.type})
                  <span className="text-sm opacity-50">
                    {" "}
                    {field.description}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </>
  );
}
