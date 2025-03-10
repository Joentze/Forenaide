import { create } from "zustand";
import { SchemaField } from "@/types/schema-field";

interface FileStoreState {
  configStrategy: string;
  configDescription: string;
  config: SchemaField[];
  setConfig: (createdConfig: SchemaField[] | undefined) => void;
  setConfigDescription: (description: string) => void;
  setConfigStrategy: (strategyId: string) => void;
  reset: () => void;
}

const useSchemaFieldStore = create<FileStoreState>()((set) => ({
  configStrategy: "",
  configDescription: "Extract the relevant fields for this document",
  config: [],
  setConfig: (createdConfig) => set(() => ({ config: createdConfig })),
  setConfigStrategy: (strategyId) =>
    set(() => ({ configStrategy: strategyId })),
  setConfigDescription: (configDescription) =>
    set(() => ({
      configDescription,
    })),
  reset: () =>
    set(() => ({
      configStrategy: "",
      configDescription: "Extract the relevant fields for this document",
      config: [],
    })),
}));

export { useSchemaFieldStore };
