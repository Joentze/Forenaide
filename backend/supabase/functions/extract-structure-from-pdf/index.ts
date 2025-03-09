// extract structure from pdf

import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { z } from "npm:zod";
// import { createClient, SupabaseClient } from "npm:@supabase/supabase-js@2";
import { google } from "npm:@ai-sdk/google";
import { generateText, tool } from "npm:ai";
import { createClient } from "npm:@supabase/supabase-js";

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_ANON_KEY")!,
);

async function extractStructureFromPdf(
  { pdfUrl, extractionDescription, jsonSchema }: {
    pdfUrl: string;
    extractionDescription: string;
    jsonSchema: Record<string, any>;
  },
) {
  const url = z.string().url().parse(pdfUrl);
  await generateText({
    model: google("gemini-1.5-flash"),
    toolChoice: "required",
    tools: {
      extractionTool: tool({
        description: extractionDescription,
        parameters: z.object({
          instances: z.array(convertJsonSchemaToZod(jsonSchema)),
        }),
        execute: async (instances) => {
          console.log(instances);
          // TODO: write to db from here
        },
      }),
    },
    messages: [
      {
        role: "user",
        content: [
          {
            type: "text",
            text: "Use *Extraction Tool* to extract data from pdf",
          },
          {
            type: "file",
            mimeType: "application/pdf",
            data: url,
          },
        ],
      },
    ],
  });
}

type JSONSchemaType = {
  type?: string;
  properties?: Record<string, JSONSchemaType>;
  items?: JSONSchemaType;
  required?: string[];
  enum?: any[];
  minimum?: number;
  maximum?: number;
  minLength?: number;
  maxLength?: number;
  pattern?: string;
  format?: string;
  title?: string;
  description?: string;
};

function convertJsonSchemaToZod(schema: JSONSchemaType): z.ZodType<any> {
  if (!schema.type && schema.enum) {
    return z.enum(schema.enum as [string, ...string[]]);
  }

  switch (schema.type) {
    case "string":
      let stringSchema = z.string();

      if (schema.minLength !== undefined) {
        stringSchema = stringSchema.min(schema.minLength);
      }
      if (schema.maxLength !== undefined) {
        stringSchema = stringSchema.max(schema.maxLength);
      }
      if (schema.pattern) {
        stringSchema = stringSchema.regex(new RegExp(schema.pattern));
      }
      if (schema.format === "email") {
        stringSchema = stringSchema.email();
      }
      if (schema.format === "uuid") {
        stringSchema = stringSchema.uuid();
      }
      return stringSchema;

    case "number":
    case "integer":
      let numberSchema = schema.type === "integer"
        ? z.number().int()
        : z.number();

      if (schema.minimum !== undefined) {
        numberSchema = numberSchema.min(schema.minimum);
      }
      if (schema.maximum !== undefined) {
        numberSchema = numberSchema.max(schema.maximum);
      }
      return numberSchema;

    case "boolean":
      return z.boolean();

    case "null":
      return z.null();

    case "array":
      if (!schema.items) {
        return z.array(z.any());
      }
      return z.array(convertJsonSchemaToZod(schema.items));

    case "object":
      if (!schema.properties) {
        return z.record(z.any());
      }

      const shape: Record<string, z.ZodType<any>> = {};
      for (const [key, value] of Object.entries(schema.properties)) {
        const isRequired = schema.required?.includes(key);
        const propertySchema = convertJsonSchemaToZod(value);
        shape[key] = isRequired ? propertySchema : propertySchema.optional();
      }
      return z.object(shape);

    default:
      return z.any();
  }
}

Deno.serve(async (req) => {
  const { url, schema, description } = await req.json();

  try {
    EdgeRuntime.waitUntil(extractStructureFromPdf({
      pdfUrl: url,
      jsonSchema: schema,
      extractionDescription: description,
    }));
  } catch (e) {
    console.error(e);
  }
  return new Response(
    JSON.stringify({ "started": true }),
    { headers: { "Content-Type": "application/json" } },
  );
});
