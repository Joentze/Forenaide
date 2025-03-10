import { Button } from "@/components/ui/button";
import { Combobox } from "@/components/ui/Combobox";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useCombobox } from "@/hooks/useCombobox";
import { Trash2, Loader2 } from "lucide-react";
import React, { useState } from "react";
import { useDropzone } from "react-dropzone";
import * as XLSX from "xlsx";
import { SaveTemplateModal } from "./SaveTemplateModal";
import { current } from "immer";
import SchemaBuilder from "@/components/schema-builder";

export interface SchemaItem {
  name: string;
  type: string;
  description: string;
}

export interface Template {
  id: string;
  name: string;
  description: string;
  extraction_schema: {
    fields: SchemaItem[];
  };
  created_at: string;
}

export default function TemplateConfig({
  configFile,
  setConfigFile,
  previousConfigs,
  templateFields = [{ name: "", type: "string", description: "" }],
  setTemplateFields,
}: {
  configFile: File | null;
  setConfigFile: React.Dispatch<React.SetStateAction<File | null>>;
  previousConfigs: { name: string; size: number }[];
  templateFields: SchemaItem[];
  setTemplateFields: React.Dispatch<React.SetStateAction<SchemaItem[]>>;
}) {
  const onDrop = (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    setConfigFile(file);
    extractExcelData(file);
  };

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: {
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [], // Accept xlsx files
    },
    maxFiles: 1, // Restrict to only one file
  });

  const combobox = useCombobox("", (value: string) => {
    if (value == "") return;
    // setConfigFile(new File(["content"], value));

    const currentTemplate = currentTemplates.find(
      (template) => template.id === value
    );
    if (!currentTemplate) return;

    setTemplateFields(currentTemplate.extraction_schema.fields);
  });

  const { toast } = useToast();

  const [saveTemplateButtonActive, setSaveTemplateButtonActive] =
    React.useState<Boolean>(true);

  const [saveTemplateName, setSaveTemplateName] = React.useState("");
  const formRef = React.useRef<HTMLFormElement>(null);

  const [currentTemplates, setCurrentTemplates] = React.useState<Template[]>(
    []
  );

  React.useEffect(() => {
    // Get existing templates
    retrieveExistingTemplates().then((dbTemplates) => {
      setCurrentTemplates(dbTemplates);
    });
  }, []);

  /**
   * Sends a GET request to templates endpoint to get all templates
   * @returns JSON response of request | null
   */
  const retrieveExistingTemplates = async () => {
    const get_template_url = "http://127.0.0.1:8000/templates";

    let dataToReturn = null;
    try {
      // Fetch
      const response = await fetch(get_template_url);

      if (!response.ok) {
        throw new Error(`Error: ${response.status} ${response.statusText}`);
      }
      // Parse response JSON
      const data = await response.json();

      // Assign data
      dataToReturn = data;
    } catch (error) {
      console.error("Error retrieving templates:", error);
    }

    return dataToReturn;
  };

  /**
   * Sends a POST request to templates endpoint to create a new template
   * @returns JSON response of request | null
   */
  // Add these state variables inside TemplateConfig component
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Modify the saveTemplate function
  const saveTemplate = async (name: string, description: string) => {
    if (!saveTemplateButtonActive) return null;
    const create_template_url = "http://127.0.0.1:8000/templates";

    let dataToReturn = null;
    try {
      setSaveTemplateButtonActive(false);
      const response = await fetch(create_template_url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          description,
          extraction_schema: {
            fields: templateFields,
          },
        }),
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();

      toast({
        title: "Success",
        description: `Template ${name} is saved!`,
      });

      dataToReturn = data;
      setIsModalOpen(false);
    } catch (error) {
      console.error("Error creating template:", error);
      toast({
        title: "Error",
        description: "Failed to save template",
        variant: "destructive",
      });
    }

    setSaveTemplateButtonActive(true);
    return dataToReturn;
  };

  function extractExcelData(file: File) {
    const reader = new FileReader();
    reader.onload = (e) => {
      const data = new Uint8Array(e.target?.result as ArrayBuffer);
      const workbook = XLSX.read(data, { type: "array" });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const rows = XLSX.utils.sheet_to_json<string[]>(worksheet, { header: 1 });

      const extractedFields = [];
      for (let i = 1; i < rows.length; i++) {
        const row = rows[i];
        if (!row[0]) continue;
        extractedFields.push({
          name: row[0] || "",
          type: row[1] || "",
          description: row[2] || "",
        });
      }
      setTemplateFields(extractedFields);
    };
    reader.readAsArrayBuffer(file);
  }

  const updateTemplateField = (
    index: number,
    key: "name" | "type" | "description",
    value: string
  ) => {
    const newFields = [...templateFields];
    newFields[index][key] = value;
    setTemplateFields(newFields);
  };

  const removeField = (index: number) => {
    setTemplateFields((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <div>
      <SchemaBuilder />
      <SaveTemplateModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={saveTemplate}
        isSaving={!saveTemplateButtonActive}
      />
    </div>
  );
}
