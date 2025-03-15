import { z } from "zod";

const templateResponseSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  description: z.string(),
  schema: z.object({ fields: z.array(z.record(z.any())) }),
  created_at: z.string().datetime(),
  last_updated_at: z.string().datetime().optional(),
});

const updateTemplateSchema = z.object({
  name: z.string(),
  description: z.string(),
  schema: z.object({ fields: z.array(z.record(z.any())) }),
  last_updated_at: z.string().datetime(),
});

type TemplateResponseType = z.infer<typeof templateResponseSchema>;

export { updateTemplateSchema, templateResponseSchema, TemplateResponseType };
