// index.ts - Supabase Edge Function
import { generateText, tool } from "npm:ai";
import { google } from "npm:@ai-sdk/google";
import { z } from "npm:zod";
import { corsHeaders } from "../_shared/cors.ts";

// Define the types
type FieldType = "string" | "number" | "boolean" | "array" | "object";

type SchemaField = {
  name: string;
  type: FieldType;
  description?: string;
  items?: SchemaField;
  properties?: { [key: string]: SchemaField };
};

// Function to validate the generated schema fields
function validateSchemaField(field: any): field is SchemaField {
  if (!field.name || typeof field.name !== "string") return false;
  const validTypes: FieldType[] = [
    "string",
    "number",
    "boolean",
    "array",
    "object",
  ];
  if (!field.type || !validTypes.includes(field.type)) return false;
  if (field.description && typeof field.description !== "string") return false;
  if (field.type === "array" && field.items) {
    if (!validateSchemaField(field.items)) return false;
  }
  if (field.type === "object" && field.properties) {
    if (typeof field.properties !== "object") return false;
    for (const key in field.properties) {
      if (!validateSchemaField(field.properties[key])) return false;
    }
  }
  return true;
}

const schemaFieldSchema = z.object({
  name: z.string(),
  type: z.enum(["string", "number", "boolean", "array", "object"]),
  description: z.string().optional(),
});

// Main handler function
Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }
  try {
    // Parse the request body
    const { prompt } = await req.json();

    if (!prompt) {
      return new Response(
        JSON.stringify({ error: "Missing prompt parameter" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    type generatedFieldResponse = {
      fields: z.infer<typeof schemaFieldSchema>[];
    };

    let generatedSchemaResponse = undefined;
    // System prompt to guide the AI
    const systemPrompt = `
      You are a schema generator assistant. Your task is to generate JSON schema fields based on the user's prompt.
      
      Each field should follow this structure:
      {
        "name": string,
        "type": "string" | "number" | "boolean" | "array" | "object",
        "description": string (optional),
        "items": SchemaField (required if type is "array"),
        "properties": { [key: string]: SchemaField } (required if type is "object")
      }
      
      Return a valid JSON array of SchemaField objects.
    `;

    // Generate schema fields using AI
    await generateText({
      model: google("gemini-1.5-flash"),
      system: systemPrompt,
      toolChoice: "required",
      tools: {
        schemaGeneratorTool: tool({
          parameters: z.object({
            fields: z.array(schemaFieldSchema),
          }),
          execute: async ({ fields }) => {
            generatedSchemaResponse = fields;
            return;
          },
        }),
      },
      messages: [{ role: "user", content: `PROMPT: ${prompt}` }],
    });

    // Parse and validate the generated schema
    if (!generatedSchemaResponse) {
      const errorMessage = "AI was not able to generate schema";
      console.error(
        `Line ${new Error().stack?.split("\n")[1].trim()}: ${errorMessage}`
      );
      return new Response(JSON.stringify({ error: errorMessage }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (
      !(generatedSchemaResponse as []).every((field) =>
        validateSchemaField(field)
      )
    ) {
      const errorMessage = "AI generated schema was not valid";
      console.error(
        `Line ${new Error().stack?.split("\n")[1].trim()}: ${errorMessage}`
      );
      return new Response(JSON.stringify({ error: errorMessage }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    // Return the generated schema fields
    return new Response(JSON.stringify({ fields: generatedSchemaResponse }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error(`Line ${new Error().stack?.split("\n")[1].trim()}:`, error);
    return new Response(JSON.stringify(error), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
