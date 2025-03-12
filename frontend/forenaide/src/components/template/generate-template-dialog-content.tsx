import React, { SetStateAction, useEffect, useState } from "react";
import {
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { useToast } from "@/hooks/use-toast";
import { SchemaField } from "@/types/schema-field";
import { useSchemaFieldStore } from "@/hooks/use-schema-field-store";
import { Textarea } from "../ui/textarea";
import { Sparkles } from "lucide-react";

export function GenerateTemplateDialogContent() {
  const { toast } = useToast();
  const { concatIntoConfig, generateFields } = useSchemaFieldStore();
  const [prompt, setPrompt] = useState<string>("");
  const [selectedFields, setSelectedFields] = useState<SchemaField[]>([]);

  const onConfirm = () => {
    concatIntoConfig(selectedFields);
  };
  return (
    <DialogContent className="sm:max-w-[425px]">
      <DialogHeader>
        <DialogTitle className="flex flex-row gap-2">
          <Sparkles className="w-4 h-4 my-auto" />
          Generate Schema Fields
        </DialogTitle>
        <DialogDescription>
          Prompt AI analyst to generate schema fields for you. Provide it the
          context for what you want to extract
        </DialogDescription>
      </DialogHeader>
      <Textarea
        placeholder="Generate schema fields for..."
        onChange={(e) => setPrompt(e.target.value)}
      />

      <DialogFooter>
        <DialogClose>
          <Button
            type="button"
            onClick={async () => await generateFields(prompt)}
          >
            Confirm
          </Button>
        </DialogClose>
      </DialogFooter>
    </DialogContent>
  );
}
