import { useEffect, useState } from "react";
import { FaGoogle } from "react-icons/fa";
import { RiAnthropicFill, RiRobot2Fill } from "react-icons/ri";

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useSchemaFieldStore } from "@/hooks/use-schema-field-store";

interface Strategy {
  id: string;
  strategy: string;
  name: string;
  description: string;
}

const defaultStrategies: Strategy[] = [
  {
    id: "86a1b98b-b3fe-4f92-96e2-0fbe141fe669",
    strategy: "gemini:pdf",
    name: "Gemini PDF extraction",
    description:
      "Strategy for extracting structure from pdf using Gemini 1.5 Flash",
  },
  {
    id: "86a1b98b-b3fe-4f92-96e2-0fbe141fe667",
    strategy: "claude:pdf",
    name: "Claude PDF extraction",
    description:
      "Strategy for extracting structure from pdf using Claude 3.5 Sonnet",
  },
];

const modelIconMap: { [key: string]: JSX.Element } = {
  gemini: <FaGoogle />,
  claude: <RiAnthropicFill />,
  // Add more mappings as needed
};

function getIcon(strategy: string): JSX.Element | null {
  for (const key in modelIconMap) {
    if (strategy.includes(key)) {
      return modelIconMap[key];
    }
  }
  return <RiRobot2Fill />;
}

export function ExtractionSelect() {
  const { setConfigStrategy } = useSchemaFieldStore();
  const [strategies, setStrategies] = useState<Strategy[]>(defaultStrategies);
  // TODO: make api call to get strategies
  useEffect(() => {
    setConfigStrategy(strategies[0].id);
  }, []);
  return (
    <Select defaultValue={strategies[0].id} onValueChange={setConfigStrategy}>
      <SelectTrigger className="w-full">
        <SelectValue placeholder="Select an Extraction Strategy" />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          {strategies.map((strategy) => (
            <SelectItem key={strategy.id} value={strategy.id}>
              <div className="flex flex-row gap-2">
                <div className="my-auto">{getIcon(strategy.strategy)} </div>
                {strategy.name}
              </div>
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}
