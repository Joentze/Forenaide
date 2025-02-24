import { SchemaItem } from "@/routes/run/-components/TemplateConfig";
import { HoverCard, HoverCardTrigger, HoverCardContent } from "./ui/hover-card"
import { Separator } from "./ui/separator";
import { FilePath } from "@/routes/run/-components/Confirmation";
import { filePathToDownloadUrl } from "@/lib/utils";
import { File } from "lucide-react";

interface SchemaPreviewProps {
  schema: SchemaItem[];
  trigger: React.ReactNode;
}

export function SchemaPreview({ schema, trigger }: SchemaPreviewProps) {
  return (
    <HoverCard openDelay={100} closeDelay={100}>
      <HoverCardTrigger asChild>
        {trigger}
      </HoverCardTrigger>
      <HoverCardContent className="w-80" side="left">
        <p className="">Extraction Schema</p>
        <Separator className="my-2"/>
        <div className="flex flex-col items-center gap-4 w-full">
        {
          schema.map((item, index) => (
            <div key={index} className="flex items-center content-between gap-4 w-full">
              <div className="flex-1">
                <div className="font-bold">{item.name}</div>
                <div className="text-gray-500">{item.description}</div>
              </div>
              <div className="flex items-center gap-2 text-gray-500">
                <div>{item.type}</div>
              </div>
            </div>
          ))
        }
        </div>
      </HoverCardContent>
    </HoverCard>
  )
}

export function FileListPreview({ files }: { files: Partial <FilePath>[] }) {
  // A button which preview some of the filenames
  return (
    <section className="flex flex-row items-center gap-2 truncate max-w-[500px]">
      <File/>
      <div className="flex gap-2 truncate">
        {files.slice(0, 2).map(f => (
          <span key={f.filename} className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 max-w-[10rem] truncate">
            {f.filename}
          </span>
        ))}
        { files.length > 2 &&
          <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 max-w-[10rem] truncate">
              + {files.length - 2} more
          </span>
        }
      </div>
    </section>
  )
}

export function FilePreview({ files, trigger }: { files: Partial<FilePath>[], trigger: React.ReactNode }) {
  return (
    <HoverCard openDelay={100} closeDelay={100}>
      <HoverCardTrigger asChild>
        {trigger}
      </HoverCardTrigger>
      <HoverCardContent className="w-80" side="bottom">
        <p className="">File Preview</p>
        <Separator className="my-2"/>
        <div className="flex flex-col items-center gap-4 w-full">
          {files.map((file, index) => (
            <div key={index} className="flex items-center content-between gap-4 w-full">
              <div className="flex-1">
                <a href={filePathToDownloadUrl(file)} target="_blank" className="hover:underline">
                <div className="font-medium">{file.filename}</div>
                </a>
              </div>
            </div>
          ))}
        </div>
      </HoverCardContent>
    </HoverCard>
  )
}
