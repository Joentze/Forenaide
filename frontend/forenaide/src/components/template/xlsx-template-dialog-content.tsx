import { useCallback, useState } from "react";
import {
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { SchemaField } from "@/types/schema-field";
import { useSchemaFieldStore } from "@/hooks/use-schema-field-store";
import { useDropzone } from "react-dropzone";
import * as XLSX from "xlsx";
import { Badge } from "../ui/badge";

export const templateResponseSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  description: z.string(),
  schema: z.object({ fields: z.array(z.record(z.any())) }),
  created_at: z.string().datetime(),
});

export type TemplateResponseType = z.infer<typeof templateResponseSchema>;

export function XlsxTemplateDialogContent() {
  const { toast } = useToast();
  const { concatIntoConfig } = useSchemaFieldStore();
  const [schemaFields, setSchemaFields] = useState<SchemaField[]>([]);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length !== 1) throw new Error("more than one file added");
    const reader = new FileReader();
    const file = acceptedFiles[0];
    reader.onabort = () => console.log("file reading was aborted");
    reader.onerror = () => console.log("file reading has failed");
    reader.onload = (e) => {
      const data = new Uint8Array(e.target?.result as ArrayBuffer);
      const workbook = XLSX.read(data, { type: "array" });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const rows = XLSX.utils.sheet_to_json<string[]>(worksheet, {
        header: 1,
      });

      let extractedFields: SchemaField[] = [];
      for (let i = 1; i < rows.length; i++) {
        const row = rows[i];
        if (!row || !row[0]) continue;
        extractedFields.push({
          name: row[0] || "",
          type: row[1].toLowerCase() || "string",
          description: row[2] || "",
        } as SchemaField);
      }

      console.log("extracted:", extractedFields);
      if (extractedFields.length > 0) {
        setSchemaFields(extractedFields);
      } else {
        toast({
          title: "Warning",
          description:
            "Could not extract fields from the template file. The file might be empty or not in the expected format.",
          variant: "destructive",
        });
      }
    };
    reader.readAsArrayBuffer(file);
  }, []);

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: {
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [
        ".xlsx",
      ],
      "application/vnd.ms-excel": [".xls"],
    },
    multiple: false,
  });
  const onConfirm = () => {
    if (schemaFields.length === 0) {
      toast({
        title: "Success",
        description: "No schema fields added",
        variant: "destructive",
      });
    }
    concatIntoConfig(schemaFields);
    toast({
      title: "Success",
      description: "Schema fields successfully added!",
    });
  };
  return (
    <DialogContent className="sm:max-w-[425px]">
      <DialogHeader>
        <DialogTitle>Upload XLSX Template File</DialogTitle>
        <DialogDescription>
          Use an Excel file with pre-defined schema template
        </DialogDescription>
      </DialogHeader>
      {schemaFields.length === 0 && (
        <div
          {...getRootProps()}
          className="border-2 border-dashed p-6 rounded cursor-pointer bg-gray-50 hover:bg-gray-100 text-center transition-all duration-200"
        >
          <input {...getInputProps()} />
          <p className="text-gray-500">
            Drag & drop template XLSX files here, or click to select files
          </p>
        </div>
      )}
      {schemaFields.length > 0 && (
        <div className="flex flex-col gap-2">
          {schemaFields.map((field) => {
            return (
              <span className="flex flex-row bg-slate-100 p-2 rounded-md">
                <p className="font-mono">{field.name}</p>
                <span className="flex-grow" />
                <Badge>{field.type}</Badge>
              </span>
            );
          })}
        </div>
      )}
      <DialogFooter>
        <DialogClose>
          <Button type="button" onClick={onConfirm}>
            Confirm
          </Button>
        </DialogClose>
      </DialogFooter>
    </DialogContent>
  );
}
