import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sparkles } from "lucide-react";
import { ApplyTemplateDialogContent } from "./template/apply-template-dialog-content";
import { Dialog, DialogTrigger } from "./ui/dialog";

import { useState } from "react";
import { GenerateTemplateDialogContent } from "./template/generate-template-dialog-content";
import { XlsxTemplateDialogContent } from "./template/xlsx-template-dialog-content";

export function SchemaOptionDropdown({
  children,
}: {
  children: React.ReactNode | React.ReactNode[];
}) {
  const [dialogContentSelect, setDialogContentSelect] = useState<
    "ai" | "xlsx" | "saved"
  >();
  return (
    <>
      <Dialog>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>{children}</DropdownMenuTrigger>
          <DropdownMenuContent className="w-full">
            <DropdownMenuGroup>
              <DialogTrigger className="w-full">
                <DropdownMenuItem onClick={() => setDialogContentSelect("ai")}>
                  <Sparkles />
                  Generate Schema
                </DropdownMenuItem>
              </DialogTrigger>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuSub>
                <DropdownMenuSubTrigger>
                  Use Existing Template
                </DropdownMenuSubTrigger>
                <DropdownMenuPortal>
                  <DropdownMenuSubContent className="flex flex-col">
                    <DialogTrigger>
                      <DropdownMenuItem
                        onClick={() => setDialogContentSelect("xlsx")}
                      >
                        Import from
                        <code className="relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-xs font-semibold">
                          .xlsx
                        </code>
                      </DropdownMenuItem>
                    </DialogTrigger>
                    <DialogTrigger>
                      <DropdownMenuItem
                        onClick={() => setDialogContentSelect("saved")}
                      >
                        Use Saved Template
                      </DropdownMenuItem>
                    </DialogTrigger>
                  </DropdownMenuSubContent>
                </DropdownMenuPortal>
              </DropdownMenuSub>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
        {dialogContentSelect === "ai" && <GenerateTemplateDialogContent />}
        {dialogContentSelect === "saved" && <ApplyTemplateDialogContent />}
        {dialogContentSelect === "xlsx" && <XlsxTemplateDialogContent />}
      </Dialog>
    </>
  );
}
