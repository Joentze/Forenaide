import { FileInfo, useFileStore } from "./FileUpload";
import { Ref, useEffect, useState } from "react";
import { CircleCheck, File } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { SchemaItem } from "./TemplateConfig";
import { Input } from "@/components/ui/input";
import { useSchemaFieldStore } from "@/hooks/use-schema-field-store";
import { SchemaField } from "@/types/schema-field";
import FieldRenderer from "@/components/field/field-renderer";
import { Label } from "@radix-ui/react-label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

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
  schema: Record<string, unknown>;
  file_paths: Partial<FilePath>[];
};

export function formatSchema(config: SchemaField[]): Record<string, unknown> {
  return config.reduce((acc, field) => {
    const value: any = { type: field.type };
    if (field.description) value.description = field.description;
    if (field.type === "array" && field.items) {
      value.items = formatSchema([field.items])[field.items.name];
    }
    if (field.type === "object" && field.properties) {
      value.properties = formatSchema(Object.values(field.properties));
    }
    acc[field.name] = value;
    return acc;
  }, {} as any);
}

export default function Confirmation({
  files,
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
  } = useSchemaFieldStore();

  const { files: storedFiles } = useFileStore();
  useEffect(() => {
    const file_paths: Partial<FilePath>[] = storedFiles.map((file) => ({
      uri: file.downloadUrl,
      bucket_path: file.filePath,
      mimetype: file.mimetype,
      filename: file.filename,
    }));

    const body: CreatePipelineRequest = {
      name: pipelineName,
      description,
      strategy_id,
      schema: {
        type: "object",
        description,
        properties: formatSchema(config),
      },
      file_paths,
    };
    setPipelineRequest(body);
    // if (files.length > 0) setOldFiles(files);
  }, [pipelineName, files, config, description, strategy_id, templateFields]);

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
          <form ref={formRef}>
            <div className="grid w-full max-w-sm items-center gap-1.5">
              <Label htmlFor="pipelineName" className="font-bold">
                Pipeline Name
              </Label>
              <Input
                id="pipelineName"
                type="text"
                placeholder=""
                name="pipelineName"
                className="w-80 mb-3"
                value={pipelineRequest?.name ?? ""}
                onChange={(e) => setPipelineName(e.target.value)}
                required
              />
            </div>
          </form>
        </section>
        <h4 className="font-semibold mb-2">Selected Files:</h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {storedFiles.map((file, index) => (
            <div className="border rounded-md p-2 flex flex-row gap-2">
              <File className="my-auto text-gray-500 min-w-8" />
              <div className="flex flex-col w-full max-w-72">
                <p className="font-mono truncate ">{file.filename}</p>
              </div>
            </div>
          ))}
        </div>
        {/* {configFile && (
          <>
            <h4 className="font-semibold mt-4 mb-2">Template File:</h4>
            <div className="bg-gray-100 p-2 rounded">
              {configFile.name} ({(configFile.size / 1024).toFixed(2)} KB)
            </div>
          </>
        )} */}

        <div className="mt-8">
          <p className="font-bold mb-2">Defined Schema</p>
          {config && (
            <div className="border p-4 rounded-md">
              {config.map((field, index) => (
                <FieldRenderer key={index} field={field} />
              ))}
            </div>
            // <div className="mt-4">
            //   <h4 className="font-semibold mb-2">Extraction Schema:</h4>
            //   <ul className="space-y-2">
            //     {config.map((field, index) => (
            //       <li key={index} className="bg-gray-100 p-2 rounded">
            //         <span className="font-semibold">{field.name} </span>(
            //         {field.type})
            //         <span className="text-sm opacity-50">
            //           {" "}
            //           {field.description}
            //         </span>
            //       </li>
            //     ))}
            //   </ul>
            // </div>
          )}
        </div>
      </div>
    </>
  );
}
