import { create } from "zustand";
import { SchemaField } from "@/types/schema-field";

interface FileStoreState {
  loading: boolean;
  configStrategy: string;
  configDescription: string;
  config: SchemaField[];
  concatIntoConfig: (existingConfig: SchemaField[]) => void;
  setConfig: (createdConfig: SchemaField[] | undefined) => void;
  setConfigDescription: (description: string) => void;
  setConfigStrategy: (strategyId: string) => void;
  reset: () => void;
  generateFields: (prompt: string, fileUrls: string[]) => void;
}

type GeneratedSchemaType = {
  fields: SchemaField[];
};

const useSchemaFieldStore = create<FileStoreState>()((set) => ({
  loading: false,
  configStrategy: "86a1b98b-b3fe-4f92-96e2-0fbe141fe669",
  configDescription: "Extract the relevant fields for this document",
  config: [],
  concatIntoConfig: (existingConfig) =>
    set((state) => ({
      config: [...state.config, ...existingConfig],
    })),
  setConfig: (createdConfig) => set(() => ({ config: createdConfig })),
  setConfigStrategy: (strategyId) =>
    set(() => ({ configStrategy: strategyId })),
  setConfigDescription: (configDescription) =>
    set(() => ({
      configDescription,
    })),
  reset: () =>
    set(() => ({
      loading: false,
      configStrategy: "86a1b98b-b3fe-4f92-96e2-0fbe141fe669",
      configDescription: "Extract the relevant fields for this document",
      config: [],
    })),
  generateFields: async (prompt, fileUrls) => {
    // TODO add in AI prompting to get generated fields
    set(() => ({
      loading: true,
    }));

    const response = await fetch(
      "http://127.0.0.1:54321/functions/v1/generate-schema",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt, fileUrls }),
      }
    );
    if (!response.ok) {
      console.error("Error:", await response.text());
    }
    const json = await response.json();
    const { fields } = json as GeneratedSchemaType;
    const generatedResponseSchema: SchemaField[] = fields;
    set((state) => {
      state.concatIntoConfig(generatedResponseSchema);
      return { loading: false };
    });
  },
}));

export { useSchemaFieldStore };
