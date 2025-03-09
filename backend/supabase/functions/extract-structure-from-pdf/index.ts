// extract structure from pdf

import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { z } from "npm:zod";
// import { createClient, SupabaseClient } from "npm:@supabase/supabase-js@2";
import { google } from "npm:@ai-sdk/google";
import { Parser } from "npm:@json2csv/plainjs";
import { flatten } from "npm:@json2csv/transforms";
import { generateText, tool } from "npm:ai";
import { createClient } from "npm:@supabase/supabase-js";

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_ANON_KEY")!,
);

async function uploadResultFiles(
  name: string,
  runId: string,
  result: Record<string, object[]>,
) {
  try {
    // Convert instances to JSON string
    const { instances: rows } = result;
    const csvParser = new Parser({
      transforms: [
        flatten(),
      ],
    });

    const newFilename = name.replace(/[^a-zA-Z0-9]/g, "_");
    const csvString = csvParser.parse(rows);

    const jsonString = JSON.stringify(result);

    // Create a Blob from the JSON string
    const jsonBlob = new Blob([jsonString], { type: "application/json" });
    const csvBlob = new Blob([csvString], { type: "text/plain" });
    // Generate a unique ID for the JSON file
    const jsonFileName = `${runId}/${newFilename}.json`;
    const csvFileName = `${runId}/${newFilename}.csv`;

    // Upload the JSON file to the outputs bucket
    const [{ error: jsonError }, { error: csvError }] = await Promise.all([
      supabase.storage.from("outputs").upload(jsonFileName, jsonBlob, {
        contentType: "application/json",
      }),
      supabase.storage.from("outputs").upload(csvFileName, csvBlob, {
        contentType: "text/plain",
      }),
    ]);
    if (jsonError || csvError) {
      throw new Error("Failed to upload result file(s)");
    }
  } catch (error) {
    console.error("Error in uploadJson function:", error);
    throw error;
  }
}

interface FileB64Result {
  filename: string;
  blob: string;
}

async function getPdfFileB64(
  filename: string,
  path: string,
): Promise<FileB64Result> {
  const { data, error } = await supabase.storage.from("sources").download(path);
  if (error) {
    throw new Error(`Error getting file:${JSON.stringify(error)}`);
  }
  const reader = new FileReader();
  const base64Promise = new Promise<string>((resolve, reject) => {
    reader.onloadend = () => {
      if (reader.result) {
        resolve(reader.result.toString().split(",")[1]);
      } else {
        reject(new Error("Failed to convert blob to base64"));
      }
    };
    reader.onerror = () => {
      reject(new Error("Error reading blob as base64"));
    };
  });

  reader.readAsDataURL(data);
  return { filename, blob: await base64Promise };
}

async function extractFromPdf({
  filename,
  blob,
  description,
  schema,
}: {
  filename: string;
  blob: string;
  description: string;
  schema: Record<string, unknown>;
}): Promise<object[]> {
  let instancesList: object[] | undefined = undefined;
  await generateText({
    model: google("gemini-1.5-flash"),
    toolChoice: "required",
    tools: {
      extractionTool: tool({
        description,
        parameters: z.object({
          instances: z.array(convertJsonSchemaToZod(schema)),
        }),
        execute: async ({ instances }) => {
          instancesList = instances;
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
            data: blob,
          },
        ],
      },
    ],
  });
  if (!instancesList) {
    throw new Error("pdf was not extracted");
  }
  return (instancesList as object[]).map((instance) => {
    // added filename for traceability
    return { ...instance, filename };
  });
}

async function extractStructureFromPdfs(
  { paths, description, schema }: {
    paths: FilePathType[];
    description: string;
    schema: Record<string, unknown>;
  },
) {
  const pdfB64s = await Promise.all(
    paths.map(({ filename, bucket_path }) =>
      getPdfFileB64(filename, bucket_path)
    ),
  );

  const extractions = await Promise.all(
    pdfB64s.map(({ filename, blob }) =>
      extractFromPdf({ filename, blob, description, schema })
    ),
  );
  const instances = extractions.flat();
  return { instances };
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

const filePathSchema = z.object({
  uri: z.string().nullable(),
  mimetype: z.string(),
  bucket_path: z.string(),
  filename: z.string(),
});

type FilePathType = z.infer<typeof filePathSchema>;

const extractionMessageSchema = z.object({
  name: z.string(),
  id: z.string(),
  file_paths: z.array(filePathSchema),
  schema: z.record(z.any()),
  description: z.string(),
});

type ExtractionMessageType = z.infer<typeof extractionMessageSchema>;

async function processMessage(message: ExtractionMessageType) {
  const { name, id: runId, file_paths: paths, schema, description } = message;
  const result = await extractStructureFromPdfs({
    paths,
    schema,
    description,
  });
  await uploadResultFiles(name, runId, result);
}

Deno.serve(async (_) => {
  const { data, error } = await supabase.schema("pgmq").rpc("read", {
    queue_name: "extraction",
    vt: 0,
    qty: 5,
  });
  if (error) {
    throw new Error("there was an error with queued message");
  }

  await Promise.all(
    data.map(({ message }: { message: ExtractionMessageType }) =>
      processMessage(message)
    ),
  );
  const msgIds = data.map(({ msg_id }: { msg_id: string }) => {
    return msg_id;
  });
  const { error: deleteMsgsError } = await supabase.schema(
    "pgmq",
  ).rpc("delete", {
    queue_name: "extraction",
    msg_ids: msgIds,
  });

  if (deleteMsgsError) {
    throw new Error("there was an error with queued message");
  }
  return new Response(
    JSON.stringify({ started: true }),
    { headers: { "Content-Type": "application/json" } },
  );
});
