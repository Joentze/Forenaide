// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

// Setup type definitions for built-in Supabase Runtime APIs
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import {
  adjust,
  convert,
  filename,
  gotenberg,
  html,
  HtmlRequest,
  markdown,
  MarkdownRequest,
  office,
  OfficeRequest,
  pipe,
  please,
  Request,
  set,
} from "npm:gotenberg-js-client";
import { corsHeaders } from "../_shared/cors.ts";
import { createClient } from "npm:@supabase/supabase-js";
import { Buffer } from "node:buffer";

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_ANON_KEY")!,
);

const mimetypes: Record<string, string[]> = {
  html: [
    "text/html",
  ],
  office: [
    "application/vnd.lotus-1-2-3",
    "application/x-t602",
    "application/x-abiword",
    "text/x-bibtex",
    "image/bmp",
    "application/vnd.corel-draw",
    "image/cgm",
    "image/x-cmx",
    "text/csv",
    "application/x-cwk",
    "application/x-dbf",
    "video/x-dv",
    "application/msword",
    "application/vnd.ms-word.document.macroenabled.12",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/msword",
    "application/vnd.ms-word.template.macroenabled.12",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.template",
    "image/vnd.dxf",
    "application/x-emf",
    "application/postscript",
    "application/epub+zip",
    "application/vnd.oasis.opendocument.graphics-flat-xml",
    "application/vnd.oasis.opendocument.presentation-flat-xml",
    "application/vnd.oasis.opendocument.spreadsheet-flat-xml",
    "application/vnd.oasis.opendocument.text-flat-xml",
    "application/x-font-opendyslexic",
    "image/gif",
    "application/x-hwp",
    "image/jpeg",
    "application/vnd.apple.keynote",
    "application/x-latex",
    "application/vnd.lotus-wordpro",
    "application/vnd.macwriteii",
    "application/x-troff-man",
    "text/mathml",
    "application/vnd.mozilla.xul+xml",
    "application/vnd.apple.numbers",
    "application/x-odd",
    "application/vnd.oasis.opendocument.graphics",
    "application/vnd.oasis.opendocument.text-master",
    "application/vnd.oasis.opendocument.presentation",
    "application/vnd.oasis.opendocument.spreadsheet",
    "application/vnd.oasis.opendocument.text",
    "application/vnd.oasis.opendocument.graphics-template",
    "application/vnd.oasis.opendocument.text-web",
    "application/vnd.oasis.opendocument.presentation-template",
    "application/vnd.oasis.opendocument.spreadsheet-template",
    "application/vnd.oasis.opendocument.text-template",
    "application/vnd.apple.pages",
    "image/x-portable-bitmap",
    "image/x-photo-cd",
    "image/x-pict",
    "image/x-pcx",
    "application/vnd.palm",
    "application/pdf",
    "image/x-portable-graymap",
    "image/png",
    "application/vnd.ms-powerpoint",
    "application/vnd.ms-powerpoint.template.macroenabled.12",
    "application/vnd.openxmlformats-officedocument.presentationml.template",
    "image/x-portable-pixmap",
    "application/vnd.ms-powerpoint",
    "application/vnd.ms-powerpoint",
    "application/vnd.ms-powerpoint.presentation.macroenabled.12",
    "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    "image/vnd.adobe.photoshop",
    "application/x-powersoftreport",
    "application/x-mspublisher",
    "application/x-pwp",
    "application/vnd.ms-pocketword",
    "image/x-cmu-raster",
    "application/rtf",
    "application/vnd.stardivision.draw",
    "application/vnd.stardivision.calc",
    "application/vnd.stardivision.impress",
    "application/vnd.stardivision.impress",
    "application/vnd.stardivision.writer",
    "application/vnd.stardivision.writer",
    "application/vnd.ms-excel",
    "application/vnd.stardivision.math",
    "application/vnd.sun.xml.calc.template",
    "application/vnd.sun.xml.draw.template",
    "application/vnd.sun.xml.impress.template",
    "application/vnd.sun.xml.writer.template",
    "image/svg+xml",
    "application/vnd.stardivision.math",
    "application/x-shockwave-flash",
    "application/vnd.sun.xml.calc",
    "application/vnd.sun.xml.draw",
    "application/vnd.sun.xml.writer.global",
    "application/vnd.sun.xml.impress",
    "application/vnd.sun.xml.math",
    "application/vnd.sun.xml.writer",
    "image/x-tga",
    "image/tiff",
    "image/tiff",
    "text/plain",
    "application/x-uof",
    "application/vnd.oasis.opendocument.presentation",
    "application/vnd.oasis.opendocument.spreadsheet",
    "application/vnd.oasis.opendocument.text",
    "application/vnd.visio",
    "application/vnd.stardivision.writer",
    "application/vnd.visio",
    "application/vnd.ms-visio.drawing.macroenabled.12",
    "application/vnd.visio",
    "application/x-quattropro",
    "application/vnd.lotus-1-2-3",
    "application/vnd.ms-works",
    "application/x-wmf",
    "application/vnd.wordperfect",
    "application/x-wpg",
    "application/vnd.ms-works",
    "image/x-xbitmap",
    "application/xhtml+xml",
    "application/vnd.ms-excel",
    "application/vnd.ms-excel.sheet.binary.macroenabled.12",
    "application/vnd.ms-excel.sheet.macroenabled.12",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "application/vnd.ms-excel",
    "application/vnd.ms-excel.template.macroenabled.12",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.template",
    "application/vnd.ms-excel",
    "application/xml",
    "image/x-xpixmap",
    "application/x-abiword",
  ],
  markdown: ["text/markdown", "text/x-markdown"],
};

const gotenbergPath: Record<string, string> = {
  office: "/forms/libreoffice/convert",
  markdown: "/forms/chromium/convert/markdown",
  html: "/forms/chromium/convert/html",
};

const gotenbergTypeCast = {
  office: (request: Request) => request as OfficeRequest,
  html: (request: Request) => request as HtmlRequest,
  markdown: (request: Request) => request as MarkdownRequest,
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }
  // Check if request is multipart/form-data
  const contentType = req.headers.get("content-type") || "";
  if (!contentType.includes("multipart/form-data")) {
    return new Response(
      JSON.stringify({ error: "Content type must be multipart/form-data" }),
      {
        status: 400,
        headers: { "content-type": "application/json" },
      },
    );
  }

  try {
    const formData = await req.formData();
    const file = formData.get("file");

    if (!file || !(file instanceof File)) {
      return new Response(JSON.stringify({ error: "No file uploaded" }), {
        status: 400,
        headers: { "content-type": "application/json" },
      });
    }

    // Generate a unique ID for this upload
    const randomId = crypto.randomUUID();
    const fileName = file.name.replace(/\.[^/.]+$/, "") + ".pdf";
    // Create a unique filename to prevent overwriting
    const filePath = `${randomId}/${fileName}`;
    let fileType: "office" | "markdown" | "html" | "pdf" | undefined =
      undefined;
    if (["application/pdf"].includes(file.type)) {
      fileType = "pdf";
    } else if (mimetypes.office.includes(file.type)) {
      fileType = "office";
    } else if (mimetypes.markdown.includes(file.type)) {
      fileType = "markdown";
    } else if (mimetypes.html.includes(file.type)) {
      fileType = "html";
    } else {
      return new Response(
        JSON.stringify({ error: "file type is not supported" }),
        {
          status: 415,
          headers: { "content-type": "application/json" },
        },
      );
    }
    if (fileType === undefined) {
      throw new Error("file type not allowed");
    }
    const path = gotenbergPath[fileType];
    let uploadedFile = file;
    if (fileType !== "pdf") {
      const fileArrBuff = await file.arrayBuffer();
      const gotenbergPipe = pipe(
        gotenberg(""),
        convert,
        (request: Request) =>
          gotenbergTypeCast[fileType](request as OfficeRequest),
        adjust({
          url: `https://demo.gotenberg.dev${path}`,
        }),
        set(filename(fileName)),
        please,
      );
      const buffer = Buffer.from(fileArrBuff);
      const pdfStream = await gotenbergPipe(
        buffer,
      );
      const chunks = [];
      for await (const chunk of pdfStream) {
        chunks.push(chunk);
      }
      const type = { type: "application/pdf" };
      const blob = new Blob(chunks, type);
      uploadedFile = new File([blob], fileName, type);
    }

    // Upload the file to the pdfs bucket
    const { error } = await supabase.storage
      .from("sources")
      .upload(filePath, uploadedFile, {
        contentType: "application/pdf",
      });

    if (error) {
      console.error("Error uploading file:", error);
      return new Response(JSON.stringify({ error: "Failed to upload file" }), {
        status: 500,
        headers: { "content-type": "application/json" },
      });
    }

    // Get the public URL if needed
    const { data: { publicUrl } } = supabase.storage
      .from("sources")
      .getPublicUrl(filePath);

    const { data: fileInsertData, error: fileInsertError } = await supabase
      .from("data_sources").insert(
        { filename: file.name, path: filePath, mimetype: file.type },
      ).select();

    if (fileInsertError) {
      throw new Error(JSON.stringify(fileInsertError));
    }
    return new Response(
      JSON.stringify({
        ...fileInsertData[0],
        url: publicUrl,
      }),
      {
        headers: { ...corsHeaders, "content-type": "application/json" },
      },
    );
  } catch (error) {
    console.error("Error processing upload:", error);
    return new Response(JSON.stringify({ error: "Failed to process upload" }), {
      status: 500,
      headers: { ...corsHeaders, "content-type": "application/json" },
    });
  }
});

/* To invoke locally:

  1. Run `supabase start` (see: https://supabase.com/docs/reference/cli/supabase-start)
  2. Make an HTTP request:

  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/convert-file-to-pdf' \
    --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' \
    --header 'Content-Type: application/json' \
    --data '{"name":"Functions"}'

*/
