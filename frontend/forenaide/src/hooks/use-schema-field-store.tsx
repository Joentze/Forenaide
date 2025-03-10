import { create } from "zustand";
import { SchemaField } from "@/types/schema-field";

interface FileStoreState {
  configDescription: string;
  config: SchemaField[];
  setConfig: (createdConfig: SchemaField[] | undefined) => void;
  setConfigDescription: (description: string) => void;
}

const useSchemaFieldStore = create<FileStoreState>()((set) => ({
  configDescription: "Extract the relevant fields for this document",
  config: [],
  setConfig: (createdConfig) => set(() => ({ config: createdConfig })),
  setConfigDescription: (configDescription) =>
    set(() => ({
      configDescription,
    })),
}));

export { useSchemaFieldStore };
