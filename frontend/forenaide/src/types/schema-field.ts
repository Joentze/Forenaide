type FieldType = "string" | "number" | "boolean" | "array" | "object";

type SchemaField = {
  name: string;
  type: FieldType;
  description?: string;
  items?: SchemaField;
  properties?: { [key: string]: SchemaField };
};

export { SchemaField, FieldType };
