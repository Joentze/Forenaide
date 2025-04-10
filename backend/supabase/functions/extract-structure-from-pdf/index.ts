// extract structure from pdf

import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { z } from "npm:zod";
import { LLMProviderMap } from "../_shared/extraction.ts";
import { convertToString } from "./convert.ts";
import { generateText, LanguageModel, tool } from "npm:ai";
import { createClient } from "npm:@supabase/supabase-js";

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_ANON_KEY")!
);

const strategyOptions = z.enum(["claude:pdf", "gemini:pdf", "openai:pdf"]);

type StrategyOptionType = z.infer<typeof strategyOptions>;

const strategySchema = z.object({
  id: z.string(),
  strategy: strategyOptions,
  name: z.string(),
  description: z.string(),
});

type StrategyType = z.infer<typeof strategySchema>;

async function getStrategy(strategyId: string): Promise<StrategyType> {
  const { data, error } = await supabase
    .from("strategies")
    .select()
    .eq("id", strategyId)
    .single();
  if (error) {
    throw new Error(`Error message: ${JSON.stringify(error)}`);
  }
  return strategySchema.parse(data);
}

async function doesRunIdExist(runId: string): Promise<void> {
  const { data, error } = await supabase
    .from("pipeline_runs")
    .select("id")
    .eq("id", runId);

  if (!error && data.length === 0) {
    throw new Error("error: pipeline run does not exists");
  }
}

async function updatePipelineRunStatus(
  runId: string,
  status: "processing" | "failed" | "completed",
  errorMessage?: string
) {
  let otherProperties = {};
  switch (status) {
    case "failed":
      otherProperties = { ...otherProperties, error_message: errorMessage };
      break;
    case "completed":
      otherProperties = {
        ...otherProperties,
        completed_at: new Date().toISOString(),
      };
      break;
  }
  const { error } = await supabase
    .from("pipeline_runs")
    .update({
      status,
      ...otherProperties,
    })
    .eq("id", runId);
  if (error) {
    throw new Error(`Error updating pipeline run: ${JSON.stringify(error)}`);
  }
}

async function uploadResultFiles(
  name: string,
  runId: string,
  result: Record<string, object[]>
) {
  try {
    // Convert instances to JSON string
    const { instances: rows } = result;

    const newFilename = name.replace(/[^a-zA-Z0-9]/g, "_");
    console.log(rows);
    const csvString = convertToString(rows);
    console.log(csvString);

    const jsonString = JSON.stringify(result);

    // Create a Blob from the JSON string
    const jsonBlob = new Blob([jsonString], { type: "application/json" });
    const csvBlob = new Blob([csvString], { type: "text/plain" });
    // Generate a unique ID for the JSON file
    const jsonFileName = `json/${runId}.json`;
    const csvFileName = `csv/${runId}.csv`;

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
  path: string
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
  strategy,
  filename,
  blob,
  description,
  schema,
}: {
  strategy: StrategyOptionType;
  filename: string;
  blob: string;
  description: string;
  schema: Record<string, unknown>;
}): Promise<object[]> {
  let instancesList: object[] | undefined = undefined;
  console.log(166, JSON.stringify(LLMProviderMap[strategy] as LanguageModel));
  await generateText({
    model: LLMProviderMap[strategy] as LanguageModel,
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

async function extractStructureFromPdfs({
  strategy,
  paths,
  description,
  schema,
}: {
  strategy: StrategyOptionType;
  paths: FilePathType[];
  description: string;
  schema: Record<string, unknown>;
}) {
  const pdfB64s = await Promise.all(
    paths.map(({ filename, bucket_path }) =>
      getPdfFileB64(filename, bucket_path)
    )
  );

  const extractions = await Promise.all(
    pdfB64s.map(({ filename, blob }) =>
      extractFromPdf({ strategy, filename, blob, description, schema })
    )
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
    const enumSchema = z.enum(schema.enum as [string, ...string[]]);
    console.log("Converted enum schema:", enumSchema);
    return enumSchema;
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
      if (schema.description) {
        stringSchema = stringSchema.describe(schema.description);
      }
      console.log("Converted string schema:", stringSchema);
      return stringSchema;

    case "number":
    case "integer":
      let numberSchema =
        schema.type === "integer" ? z.number().int() : z.number();

      if (schema.minimum !== undefined) {
        numberSchema = numberSchema.min(schema.minimum);
      }
      if (schema.maximum !== undefined) {
        numberSchema = numberSchema.max(schema.maximum);
      }
      if (schema.description) {
        numberSchema = numberSchema.describe(schema.description);
      }
      console.log("Converted number schema:", numberSchema);
      return numberSchema;

    case "boolean":
      let booleanSchema = z.boolean();
      if (schema.description) {
        booleanSchema = booleanSchema.describe(schema.description);
      }
      console.log("Converted boolean schema:", booleanSchema);
      return booleanSchema;

    case "null":
      let nullSchema = z.null();
      if (schema.description) {
        nullSchema = nullSchema.describe(schema.description);
      }
      console.log("Converted null schema:", nullSchema);
      return nullSchema;

    case "array":
      let arraySchema = schema.items
        ? z.array(convertJsonSchemaToZod(schema.items))
        : z.array(z.any());
      if (schema.description) {
        arraySchema = arraySchema.describe(schema.description);
      }
      console.log("Converted array schema:", arraySchema);
      return arraySchema;

    case "object":
      if (!schema.properties) {
        let recordSchema = z.record(z.any());
        if (schema.description) {
          recordSchema = recordSchema.describe(schema.description);
        }
        console.log("Converted record schema:", recordSchema);
        return recordSchema;
      }

      const shape: Record<string, z.ZodType<any>> = {};
      for (const [key, value] of Object.entries(schema.properties)) {
        const isRequired = schema.required?.includes(key);
        const propertySchema = convertJsonSchemaToZod(value);
        shape[key] = isRequired ? propertySchema : propertySchema.optional();
      }
      let objectSchema = z.object(shape);
      if (schema.description) {
        objectSchema = objectSchema.describe(schema.description);
      }
      console.log("Converted object schema:", objectSchema);
      return objectSchema;

    default:
      let anySchema = z.any();
      if (schema.description) {
        anySchema = anySchema.describe(schema.description);
      }
      console.log("Converted any schema:", anySchema);
      return anySchema;
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
  strategy_id: z.string(),
  id: z.string(),
  file_paths: z.array(filePathSchema),
  schema: z.record(z.any()),
  description: z.string(),
});

type ExtractionMessageType = z.infer<typeof extractionMessageSchema>;

async function processMessage(message: ExtractionMessageType) {
  const {
    name,
    id: runId,
    strategy_id: strategyId,
    file_paths: paths,
    schema,
    description,
  } = message;

  await doesRunIdExist(runId);

  const { strategy } = await getStrategy(strategyId);

  await updatePipelineRunStatus(runId, "processing");
  try {
    const result = await extractStructureFromPdfs({
      strategy,
      paths,
      schema,
      description,
    });
    await uploadResultFiles(name, runId, result);
  } catch (error) {
    await updatePipelineRunStatus(
      runId,
      "failed",
      `Error message: ${JSON.stringify(error)}`
    );
  }
  await updatePipelineRunStatus(runId, "completed");
}

async function processAllMessages(messages: any) {
  await Promise.all(
    messages.map(({ message }: { message: ExtractionMessageType }) =>
      processMessage(message)
    )
  );

  const msgIds = messages.map(({ msg_id }: { msg_id: string }) => {
    return msg_id;
  });
  const { error: deleteMsgsError } = await supabase
    .schema("pgmq")
    .rpc("delete", {
      queue_name: "extraction",
      msg_ids: msgIds,
    });
  if (deleteMsgsError) {
    throw new Error("there was an error with queued message");
  }
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

  // EdgeRuntime.waitUntil(processAllMessages(data));
  await processAllMessages(data);

  return new Response(JSON.stringify({ started: true }), {
    headers: { "Content-Type": "application/json" },
  });
});
