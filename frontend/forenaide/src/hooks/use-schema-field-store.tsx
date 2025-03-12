import { create } from "zustand";
import { SchemaField } from "@/types/schema-field";

interface FileStoreState {
  configStrategy: string;
  configDescription: string;
  config: SchemaField[];
  concatIntoConfig: (existingConfig: SchemaField[]) => void;
  setConfig: (createdConfig: SchemaField[] | undefined) => void;
  setConfigDescription: (description: string) => void;
  setConfigStrategy: (strategyId: string) => void;
  reset: () => void;
}

const useSchemaFieldStore = create<FileStoreState>()((set) => ({
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
      configStrategy: "86a1b98b-b3fe-4f92-96e2-0fbe141fe669",
      configDescription: "Extract the relevant fields for this document",
      config: [],
    })),
}));

export { useSchemaFieldStore };
