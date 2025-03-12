"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "./ui/accordion";

import { useEffect, useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import {
  Binary,
  Box,
  Brackets,
  CaseSensitive,
  EllipsisVertical,
  ListOrdered,
  Plus,
  Save,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Trash2 } from "lucide-react";
import { z } from "zod";
import { Textarea } from "./ui/textarea";
import { Separator } from "./ui/separator";
import { cn } from "../lib/utils";
import React from "react";
import { SchemaField, FieldType } from "@/types/schema-field";
import { useSchemaFieldStore } from "@/hooks/use-schema-field-store";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip";
import { SchemaOptionDropdown } from "./schema-builder-option-dropdown";
import { ExtractionSelect } from "./schema-extraction-strategy-select";
import { SaveTemplateDialog } from "./template/save-template-dialog";
import { Skeleton } from "./ui/skeleton";

export const schemaZodSchema: z.ZodType<SchemaField> = z.lazy(() =>
  z.object({
    name: z.string().min(1),
    type: z.enum(["string", "number", "boolean", "array", "object"]),
    description: z.string().min(1).optional(),
    items: z.lazy(() => schemaZodSchema).optional(),
    properties: z
      .record(
        z.string(),
        z.lazy(() => schemaZodSchema)
      )
      .optional(),
  })
);
const FieldComponent: React.FC<{
  field: SchemaField;
  onUpdate: (updatedField: SchemaField) => void;
  onRemove: () => void;
  path: string;
  isArray?: boolean;
}> = ({ field, onUpdate, onRemove, path, isArray = false }) => {
  const handleChange = (key: string, value: unknown) => {
    onUpdate({ ...field, [key]: value });
  };

  const handleItemsChange = (updatedItems: SchemaField) => {
    onUpdate({ ...field, items: updatedItems });
  };

  const handlePropertyChange = (
    propertyName: string,
    updatedProperty: SchemaField
  ) => {
    onUpdate({
      ...field,
      properties: {
        ...field.properties,
        [propertyName]: updatedProperty,
      },
    });
  };

  const handleAddProperty = () => {
    const newPropertyName = `property${
      Object.keys(field.properties || {}).length + 1
    }`;
    const newProperty: SchemaField = {
      name: newPropertyName,
      type: "string",
    };
    onUpdate({
      ...field,
      properties: {
        ...(field.properties || {}),
        [newPropertyName]: newProperty,
      },
    });
  };

  const handleRemoveProperty = (propertyName: string) => {
    const updatedProperties = { ...field.properties };
    delete updatedProperties[propertyName];
    onUpdate({ ...field, properties: updatedProperties });
  };

  return (
    <div className={cn("p-2 mb-3 rounded-md relative", "border")}>
      <div className="flex gap-2 items-end mb-2">
        <div className="flex-1">
          <Label htmlFor={`${path}-name`} className="text-xs">
            Name
          </Label>
          <Input
            id={`${path}-name`}
            value={field.name}
            disabled={field.name === "items" && isArray}
            onChange={(e) => handleChange("name", e.target.value)}
            className="h-8 text-sm"
          />
        </div>
        <div className="flex-1">
          <Label htmlFor={`${path}-description`} className="text-xs">
            Description
          </Label>
          <Input
            id={`${path}-description`}
            value={field.description || ""}
            onChange={(e) => handleChange("description", e.target.value)}
            className="h-8 text-sm"
          />
        </div>
        <div className="w-48">
          <Label htmlFor={`${path}-type`} className="text-xs">
            Type
          </Label>
          <Select
            value={field.type}
            onValueChange={(value: FieldType) => handleChange("type", value)}
          >
            <SelectTrigger id={`${path}-type`} className="h-8 text-sm w-48">
              <SelectValue placeholder="Select type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="string">
                <div className="flex flex-row gap-2">
                  <CaseSensitive className="text-blue-400" />
                  <p className="my-auto">String</p>
                </div>
              </SelectItem>
              <SelectItem value="number">
                <div className="flex flex-row gap-2">
                  <ListOrdered className="text-yellow-400" />
                  <p className="my-auto">Number</p>
                </div>
              </SelectItem>
              <SelectItem value="boolean">
                <div className="flex flex-row gap-2">
                  <Binary className="text-red-400" />
                  <p className="my-auto">Boolean</p>
                </div>
              </SelectItem>
              <SelectItem value="array">
                <div className="flex flex-row gap-2">
                  <Brackets className="text-green-400" />
                  <p className="my-auto">Array</p>
                </div>
              </SelectItem>
              <SelectItem value="object">
                <div className="flex flex-row gap-2">
                  <Box className="text-orange-400" />
                  <p className="my-auto">Object</p>
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
        {!isArray && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onRemove}
            className="h-8 w-8 p-0"
          >
            <Trash2 className="h-4 w-4 text-red-500" />
            <span className="sr-only">Remove Field</span>
          </Button>
        )}
      </div>
      {field.type === "array" && (
        <div className="ml-4 mt-2">
          <h4 className="text-sm font-semibold mb-1">Array Items</h4>
          <FieldComponent
            isArray={true}
            field={field.items || { name: "items", type: "string" }}
            onUpdate={handleItemsChange}
            onRemove={() => {}}
            path={`${path}.items`}
          />
        </div>
      )}
      {field.type === "object" && (
        <div className="ml-4 mt-2">
          <h4 className="text-sm font-semibold mb-1">Object Properties</h4>
          {Object.entries(field.properties || {}).map(
            ([propName, propField]) => (
              <FieldComponent
                key={propName}
                field={propField}
                onUpdate={(updatedField) =>
                  handlePropertyChange(propName, updatedField)
                }
                onRemove={() => handleRemoveProperty(propName)}
                path={`${path}.${propName}`}
              />
            )
          )}
          <Button
            variant="secondary"
            onClick={handleAddProperty}
            className="mt-2 text-xs h-7"
          >
            <Plus />
            Add Property
          </Button>
        </div>
      )}
    </div>
  );
};

const SchemaBuilder: React.FC = () => {
  const { loading, config, setConfig, setConfigDescription } =
    useSchemaFieldStore();

  const [description, setDescription] = useState<string>(
    `Extract the relevant fields for this document`
  );

  const handleAddField = () => {
    setConfig([...config, { name: "", description: "", type: "string" }]);
    // updateExtractionConfig();
  };

  const handleUpdateField = (index: number, updatedField: SchemaField) => {
    const updatedSchema = [...config];
    updatedSchema[index] = updatedField;
    setConfig(updatedSchema);
    // updateExtractionConfig();
  };

  const handleRemoveField = (index: number) => {
    const updatedSchema = config.filter((_, i) => i !== index);
    setConfig(updatedSchema);
    // updateExtractionConfig();
  };
  // const checkSchema = () => {
  //     const fieldNames = schema.map((field) => field.name);
  //     const uniqueFieldNames = new Set(fieldNames);

  //     if (fieldNames.length !== uniqueFieldNames.size) {
  //         throw new Error("Duplicate field names found in the schema.");
  //     }
  //     return true;
  // };
  // const updateExtractionConfig = () => {
  //     //sets the schema as a json
  //     checkSchema();
  //     let newSchema: Record<string, unknown> = {};
  //     for (const thisSchema of schema) {
  //         const { name, ...otherParts } = thisSchema;
  //         newSchema = { ...newSchema, ...{ [name]: otherParts } };
  //     }
  //     setConfig(Object.keys(newSchema).length === 0 ? undefined : newSchema);
  // };

  return (
    <div className="">
      <div className="flex flex-row gap-2 mb-4">
        <p className="text-gray-500 my-auto">
          Click "Add New Field" to start defining extraction schema
        </p>

        <div className="flex-grow" />
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <SaveTemplateDialog>
                <Button className="my-auto" size={"icon"} variant={"outline"}>
                  <Save />
                </Button>
              </SaveTemplateDialog>
            </TooltipTrigger>
            <TooltipContent>
              <p>Save as New Template</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
      {loading && (
        <div className="my-8 space-y-2">
          <Skeleton className="h-4 w-[250px]" />
          <Skeleton className="h-4 w-[200px]" />
        </div>
      )}
      {config.map((field, index) => (
        <FieldComponent
          key={index}
          field={field}
          onUpdate={(updatedField) => handleUpdateField(index, updatedField)}
          onRemove={() => handleRemoveField(index)}
          path={`root[${index}]`}
        />
      ))}

      <div className="flex flex-row mt-4">
        <Button
          onClick={handleAddField}
          className="my-auto text-sm h-8"
          variant="secondary"
        >
          <Plus /> Add New Field
        </Button>
        <SchemaOptionDropdown>
          <Button
            size={"icon"}
            className="ml-1 my-auto w-8 h-8"
            variant={"ghost"}
          >
            <EllipsisVertical />
          </Button>
        </SchemaOptionDropdown>
      </div>
      <Separator className="mt-8" />
      <Accordion type="single" collapsible>
        <AccordionItem value="item-1">
          <AccordionTrigger>Description</AccordionTrigger>
          <AccordionContent>
            <Textarea
              value={description}
              onChange={(event) => {
                setDescription(event.target.value);
                setConfigDescription(event.target.value);
              }}
            ></Textarea>
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="item-2">
          <AccordionTrigger>Advanced Settings</AccordionTrigger>
          <AccordionContent>
            <ExtractionSelect />
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
};

export default SchemaBuilder;
