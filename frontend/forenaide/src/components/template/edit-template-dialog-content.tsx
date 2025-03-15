import { Pencil } from "lucide-react";
import {
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import {
  TemplateResponseType,
  updateTemplateSchema,
} from "@/types/template-field";
import SchemaBuilder from "../schema-builder";
import { useSchemaFieldStore } from "@/hooks/use-schema-field-store";
import { useEffect, useState } from "react";
import { SchemaField } from "@/types/schema-field";
import { Button } from "../ui/button";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { ScrollArea } from "../ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { QueryObserverResult, RefetchOptions } from "@tanstack/react-query";

interface IEditTemplateDialogContent {
  refetchFn: (options?: RefetchOptions) => Promise<QueryObserverResult>;
  template: TemplateResponseType;
}

export default function EditTemplateDialogContent({
  template,
  refetchFn,
}: IEditTemplateDialogContent) {
  const { toast } = useToast();
  const { id, name: templateName, description: templateDescription } = template;
  const [name, setName] = useState<string>(templateName);
  const [description, setDescription] = useState<string>(templateDescription);
  const { setConfig, reset, config: fields } = useSchemaFieldStore();
  useEffect(() => {
    setConfig(template.schema.fields as SchemaField[]);
    return () => {
      reset();
    };
  }, [template]);

  const updateTemplate = async () => {
    try {
      const { success, error, data } = updateTemplateSchema.safeParse({
        name,
        description,
        schema: { fields },
        last_updated_at: new Date().toISOString(),
      });
      if (error) {
        throw new Error(error.message);
      }
      if (success) {
        const response = await fetch(`http://127.0.0.1:8000/templates/${id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        });
        if (!response.ok) {
          throw new Error(response.statusText);
        } else {
          refetchFn();
          toast({
            title: "Success",
            description: "Successfully updated template",
          });
        }
      }
    } catch (e) {
      toast({
        title: "Error",
        description: `Error: ${e}`,
        variant: "destructive",
      });
    }

    return;
  };
  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle className="flex flex-row gap-2">
          Edit Template
          <Pencil className="w-4 h-4 my-auto" />
        </DialogTitle>
        <DialogDescription>Make changes to existing template</DialogDescription>
      </DialogHeader>
      <div className="grid w-full items-center gap-1.5">
        <Label htmlFor="name">Name</Label>
        <Input
          className="h-8"
          value={name}
          id="name"
          onChange={(e) => setName(e.target.value)}
        />
      </div>
      <div className="grid w-full items-center gap-1.5">
        <Label htmlFor="description">Description</Label>
        <Input
          className="h-8"
          value={description}
          id="description"
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>
      <div className="grid w-full items-center gap-1.5 ">
        <Label htmlFor="schema">Schema</Label>
        <ScrollArea className="overflow-y-scroll max-h-72 border p-2 rounded-md">
          <SchemaBuilder description="" hasSaveButton={false} />
        </ScrollArea>
      </div>
      <DialogFooter>
        <DialogClose>
          <Button onClick={async () => updateTemplate()}>Confirm</Button>
        </DialogClose>
      </DialogFooter>
    </DialogContent>
  );
}
