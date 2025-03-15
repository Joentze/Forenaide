import { useState } from "react";
import { ExtractionSelect } from "./schema-extraction-strategy-select";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "./ui/accordion";
import { Textarea } from "./ui/textarea";
import { useSchemaFieldStore } from "@/hooks/use-schema-field-store";

export default function SchemaAccordian() {
  const { setConfigDescription } = useSchemaFieldStore();
  const [description, setDescription] = useState<string>(
    `Extract the relevant fields for this document`
  );

  return (
    <Accordion type="single" collapsible>
      <AccordionItem value="item-1">
        <AccordionTrigger>Description</AccordionTrigger>
        <AccordionContent>
          <Textarea
            value={description}
            onChange={(event) => {
              setDescription(event.target.value);
              setConfigDescription(event.target.value);
            }}
          ></Textarea>
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-2">
        <AccordionTrigger>Advanced Settings</AccordionTrigger>
        <AccordionContent>
          <ExtractionSelect />
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
