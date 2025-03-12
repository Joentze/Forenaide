import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { Textarea } from "../ui/textarea";
import { useSchemaFieldStore } from "@/hooks/use-schema-field-store";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";

export function SaveTemplateDialog({
  children,
}: {
  children: React.ReactNode | React.ReactNode[];
}) {
  const { config: fields } = useSchemaFieldStore();
  const { toast } = useToast();
  const [templateName, setTemplateName] = useState("");
  const [templateDescription, setTemplateDescription] = useState("");

  const saveTemplateSchema = z.object({
    name: z.string().min(1, "name must be at least 1 character long"),
    description: z
      .string()
      .min(1, "description must be at least 1 character long"),
    schema: z.object({
      fields: z
        .array(z.record(z.any()))
        .min(1, "must have at least one field in saved schema template"),
    }),
  });

  const handleSave = async () => {
    console.log(fields);
    const savedTemplate = saveTemplateSchema.safeParse({
      name: templateName,
      description: templateDescription,
      schema: { fields },
    });
    // Reset fields after saving
    if (savedTemplate.error) {
      let errors = savedTemplate.error.errors.map((error) => {
        return error.message;
      });
      toast({
        title: "Error Saving Template",
        description: errors.join(", "),
        variant: "destructive",
      });
    }

    if (savedTemplate.success) {
      const url = "http://127.0.0.1:8000/templates";
      try {
        const response = await fetch(url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(savedTemplate.data),
        });

        if (!response.ok) {
          throw new Error(`Error: ${response.status} ${response.statusText}`);
        }

        toast({
          title: "Success",
          description: `Template ${savedTemplate.data.name} is saved!`,
        });
      } catch (error) {
        console.error("Error creating template:", error);
        toast({
          title: "Error",
          description: "Failed to save template",
          variant: "destructive",
        });
      }

      setTemplateName("");
      setTemplateDescription("");
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Save Template</DialogTitle>
          <DialogDescription>
            Enter the name and description for your template. Click save when
            you're done.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid w-full max-w-sm items-center gap-1.5">
            <Label htmlFor="templateName">Name</Label>
            <Input
              id="templateName"
              value={templateName}
              onChange={(e) => setTemplateName(e.target.value)}
            />
          </div>
          <div className="grid w-full max-w-sm items-center gap-1.5">
            <Label htmlFor="templateDescription">Description</Label>
            <Textarea
              id="templateDescription"
              value={templateDescription}
              onChange={(e) => setTemplateDescription(e.target.value)}
            />
          </div>
        </div>
        <DialogFooter>
          <DialogClose>
            <Button type="button" onClick={async () => await handleSave()}>
              Confirm
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
