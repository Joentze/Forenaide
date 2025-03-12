import * as React from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useDropzone } from "react-dropzone";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Download, Edit, Plus, Trash2, Eye } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import * as XLSX from "xlsx";
import { SaveTemplateModal } from "./run/-components/SaveTemplateModal";
import { TemplateDetails } from "@/components/TemplateDetails";

export const Route = createFileRoute("/templates")({
  component: TemplatesComponent,
});

// Schema interfaces
export interface SchemaItem {
  name: string;
  type: string;
  description: string;
}

export interface Template {
  id: string;
  name: string;
  description: string;
  schema: {
    fields: SchemaItem[];
  };
  created_at: string;
  updated_at?: string; // Add updated_at field which might be optional
}

function TemplatesComponent() {
  const { toast } = useToast();
  const [configFile, setConfigFile] = React.useState<File | null>(null);
  const [previousConfigs, setPreviousConfigs] = React.useState([
    { name: "default.csv", size: 1024 },
    { name: "default2.xlsx", size: 2048 },
  ]);
  const [showSuccess, setShowSuccess] = React.useState(false);

  // Template management state
  const [templates, setTemplates] = React.useState<Template[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [selectedTemplate, setSelectedTemplate] =
    React.useState<Template | null>(null);
  const [templateFields, setTemplateFields] = React.useState<SchemaItem[]>([
    { name: "", type: "string", description: "" },
  ]);
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [isEditing, setIsEditing] = React.useState(false);
  const [isSaving, setIsSaving] = React.useState(false);
  const [viewingTemplate, setViewingTemplate] = React.useState<Template | null>(
    null
  );
  const [isDetailsModalOpen, setIsDetailsModalOpen] = React.useState(false);
  const formRef = React.useRef<HTMLFormElement>(null);
  const [originalTemplateFields, setOriginalTemplateFields] = React.useState<
    SchemaItem[]
  >([]);

  // Fetch templates on component mount
  React.useEffect(() => {
    retrieveExistingTemplates();
  }, []);

  // Template functions
  const retrieveExistingTemplates = async () => {
    setIsLoading(true);
    const get_template_url = "http://127.0.0.1:8000/templates";

    try {
      const response = await fetch(get_template_url);
      if (!response.ok) {
        throw new Error(`Error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      setTemplates(data);
    } catch (error) {
      console.error("Error retrieving templates:", error);
      toast({
        title: "Error",
        description: "Failed to retrieve templates",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const saveTemplate = async (name: string, description: string) => {
    if (isSaving) return null;

    const url = "http://127.0.0.1:8000/templates";
    const method = isEditing && selectedTemplate ? "PUT" : "POST";
    const endpoint =
      isEditing && selectedTemplate ? `${url}/${selectedTemplate.id}` : url;

    try {
      setIsSaving(true);
      const response = await fetch(endpoint, {
        method: method,
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
        description: `Template ${name} is ${isEditing ? "updated" : "saved"}!`,
      });

      // Refresh templates list
      await retrieveExistingTemplates();
      setIsModalOpen(false);
      resetForm();
      setShowSuccess(false);
      setConfigFile(null);

      return data;
    } catch (error) {
      console.error("Error creating template:", error);
      toast({
        title: "Error",
        description: `Failed to ${isEditing ? "update" : "save"} template`,
        variant: "destructive",
      });
      return null;
    } finally {
      setIsSaving(false);
    }
  };

  const deleteTemplate = async (templateId: string) => {
    try {
      const response = await fetch(
        `http://127.0.0.1:8000/templates/${templateId}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        throw new Error(`Error: ${response.status} ${response.statusText}`);
      }

      toast({
        title: "Success",
        description: "Template deleted successfully",
      });

      await retrieveExistingTemplates();
    } catch (error) {
      console.error("Error deleting template:", error);
      toast({
        title: "Error",
        description: "Failed to delete template",
        variant: "destructive",
      });
    }
  };

  // File handling
  const onDrop = (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    setConfigFile(file);
    extractExcelData(file);
    setShowSuccess(true);
  };

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: {
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [], // Accept only xlsx files
    },
    maxFiles: 1, // Restrict to only one file
  });

  const extractExcelData = (file: File) => {
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
        if (!row || !row[0]) continue;
        extractedFields.push({
          name: row[0] || "",
          type: row[1] || "string",
          description: row[2] || "",
        });
      }

      if (extractedFields.length > 0) {
        setTemplateFields(extractedFields);
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
  };

  const downloadTemplate = () => {
    fetch("src/assets/template.xlsx")
      .then((response) => response.blob())
      .then((blob) => {
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = "template.xlsx";
        link.click();
        URL.revokeObjectURL(url);
      });
  };

  const updateTemplateField = (
    index: number,
    key: "name" | "type" | "description",
    value: string
  ) => {
    const newFields = [...templateFields];
    newFields[index][key] = value;
    setTemplateFields(newFields);
  };

  const addNewField = () => {
    setTemplateFields((prev) => [
      ...prev,
      { name: "", type: "string", description: "" },
    ]);
  };

  const removeField = (index: number) => {
    setTemplateFields((prev) => prev.filter((_, i) => i !== index));
  };

  const resetForm = () => {
    setSelectedTemplate(null);
    setTemplateFields([{ name: "", type: "string", description: "" }]);
    setIsEditing(false);
  };

  const handleEditTemplate = (template: Template) => {
    setOriginalTemplateFields(
      JSON.parse(JSON.stringify(template.schema.fields))
    );
    setSelectedTemplate(template);
    setTemplateFields(JSON.parse(JSON.stringify(template.schema.fields)));
    setIsEditing(true);
  };

  const cancelEditing = () => {
    setTemplateFields([{ name: "", type: "string", description: "" }]);
    setIsEditing(false);
    setSelectedTemplate(null);
  };

  const handleViewTemplate = (template: Template) => {
    setViewingTemplate(template);
    setIsDetailsModalOpen(true);
  };

  const handleCreateTemplate = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const deleteConfig = (index: number) => {
    setPreviousConfigs((prev) => prev.filter((_, i) => i !== index));
  };

  const downloadConfig = (configName: string) => {
    // To do
    alert(`Downloading ${configName}...`);
  };

  return (
    <div className="p-8 space-y-8">
      <div className="flex justify-between mb-8">
        <Button className="btn-primary" size="lg" onClick={downloadTemplate}>
          <Download className="mr-2" />
          Download Template File
        </Button>
      </div>

      {!isEditing && (
        <Card className="card">
          <CardHeader className="card-header">
            <CardTitle className="card-title">
              {configFile ? "Selected Template File" : "Upload Template File"}
            </CardTitle>
          </CardHeader>
          <CardContent className="card-content">
            {!configFile ? (
              <div
                {...getRootProps()}
                className="border-2 border-dashed p-6 rounded cursor-pointer bg-gray-50 hover:bg-gray-100 text-center"
              >
                <input {...getInputProps()} />
                <p className="text-gray-500">
                  Drag & drop template file here, or click to select file
                </p>
              </div>
            ) : (
              <div className="bg-gray-100 p-4 rounded flex justify-between items-center">
                <span>
                  {configFile.name} ({(configFile.size / 1024).toFixed(2)} KB)
                </span>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => {
                    setConfigFile(null);
                    setTemplateFields([
                      { name: "", type: "string", description: "" },
                    ]);
                    setShowSuccess(false);
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <Card className="card mt-6" id="template-fields-card">
        <CardHeader>
          <CardTitle className="text-lg">
            {isEditing && selectedTemplate
              ? `Edit Template: ${selectedTemplate.name}`
              : configFile
                ? "Template Fields"
                : "Define Template Fields"}
          </CardTitle>
          <p className="text-sm text-gray-500">
            {isEditing
              ? "Update the template fields below and click 'Update Template' when done."
              : configFile
                ? "These fields were extracted from your template file. You can modify them below."
                : "Define your template fields manually by filling out the form below."}
          </p>
        </CardHeader>
        <CardContent>
          {showSuccess && configFile && (
            <div className="mb-4 p-4 bg-green-100 text-green-700 rounded">
              Template file uploaded successfully!
            </div>
          )}
          {isEditing && selectedTemplate && (
            <div className="mb-4 p-4 bg-blue-100 text-blue-700 rounded flex justify-between items-center">
              <div>
                <span className="font-semibold">Currently editing: </span>
                {selectedTemplate.name}
              </div>
              <Button size="sm" variant="outline" onClick={cancelEditing}>
                Cancel Editing
              </Button>
            </div>
          )}

          {configFile && !isEditing && (
            <div className="mb-4 p-4 bg-amber-50 text-amber-700 rounded">
              <p>
                You are currently working with an uploaded template file. Edit
                the fields below and save when ready.
              </p>
            </div>
          )}

          {/* Form content remains the same */}
          <form ref={formRef} onSubmit={(e) => e.preventDefault()}>
            <div className="space-y-4">
              {templateFields.map((field, index) => (
                <div key={index} className="flex gap-4 items-end">
                  <div className="flex-1">
                    <label className="block mb-1">Field Name:</label>
                    <input
                      type="text"
                      className="w-full border rounded p-2"
                      value={field.name}
                      onChange={(e) =>
                        updateTemplateField(index, "name", e.target.value)
                      }
                      required
                    />
                  </div>
                  <div className="flex-1">
                    <label className="block mb-1">Field Type:</label>
                    <select
                      className="w-full border rounded p-2"
                      value={field.type}
                      onChange={(e) =>
                        updateTemplateField(index, "type", e.target.value)
                      }
                      required
                    >
                      <option value="string">String</option>
                      <option value="integer">Integer</option>
                      <option value="boolean">Boolean</option>
                    </select>
                  </div>
                  <div className="flex-1">
                    <label className="block mb-1">Field Description:</label>
                    <input
                      type="text"
                      className="w-full border rounded p-2"
                      value={field.description}
                      onChange={(e) =>
                        updateTemplateField(
                          index,
                          "description",
                          e.target.value
                        )
                      }
                      required
                    />
                  </div>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => removeField(index)}
                    disabled={templateFields.length <= 1}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              <div className="flex justify-between">
                <Button type="button" variant="outline" onClick={addNewField}>
                  Add Field
                </Button>
                <Button
                  className={isEditing ? "btn-secondary" : "btn-primary"}
                  onClick={() => {
                    if (!formRef.current?.checkValidity()) {
                      formRef.current?.reportValidity();
                      return;
                    }
                    if (isEditing && selectedTemplate) {
                      saveTemplate(
                        selectedTemplate.name,
                        selectedTemplate.description
                      );
                    } else {
                      setIsModalOpen(true);
                    }
                  }}
                >
                  {isEditing ? "Update Template" : "Save as Template"}
                </Button>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card className="card">
        <CardHeader className="card-header">
          <CardTitle className="card-title">Saved Templates</CardTitle>
        </CardHeader>
        <CardContent className="card-content">
          {isLoading ? (
            <div className="text-center py-4">Loading templates...</div>
          ) : templates.length === 0 ? (
            <div className="text-center py-4 text-gray-500">
              No templates found
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Fields</TableHead>
                  <TableHead>Created At</TableHead>
                  <TableHead>Edited At</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {templates.map((template) => (
                  <TableRow key={template.id}>
                    <TableCell>{template.name}</TableCell>
                    <TableCell>{template.description}</TableCell>
                    <TableCell>
                      {template.schema.fields.length} fields
                    </TableCell>
                    <TableCell>
                      {new Date(template.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      {template.updated_at
                        ? new Date(template.updated_at).toLocaleDateString()
                        : "-"}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleViewTemplate(template)}
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          View
                        </Button>
                        <Button
                          className="btn-primary"
                          size="sm"
                          onClick={() => handleEditTemplate(template)}
                          // Disable Edit button when a template file is uploaded
                          disabled={configFile !== null}
                          title={
                            configFile
                              ? "Finish working with uploaded template first"
                              : ""
                          }
                        >
                          <Edit className="w-4 h-4 mr-1" />
                          Edit
                        </Button>
                        <Button
                          className="btn-secondary"
                          size="sm"
                          variant="destructive"
                          onClick={() => deleteTemplate(template.id)}
                        >
                          <Trash2 className="w-4 h-4 mr-1" />
                          Delete
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}

          {configFile && (
            <div className="mt-4 p-4 bg-amber-50 text-amber-700 rounded">
              <p>
                You cannot edit saved templates while working with an uploaded
                template file.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <SaveTemplateModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={saveTemplate}
        isSaving={isSaving}
      />

      {viewingTemplate && (
        <TemplateDetails
          isOpen={isDetailsModalOpen}
          onClose={() => setIsDetailsModalOpen(false)}
          name={viewingTemplate.name}
          fields={viewingTemplate.schema.fields}
        />
      )}
    </div>
  );
}
