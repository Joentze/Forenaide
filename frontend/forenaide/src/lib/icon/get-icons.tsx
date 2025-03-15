import {
  Binary,
  Box,
  Brackets,
  CaseSensitive,
  ListOrdered,
} from "lucide-react";
import { cn } from "../utils";

const getIconForType = (type: string, className: string): React.ReactNode => {
  switch (type) {
    case "string":
      return <CaseSensitive className={cn("text-blue-400", className)} />;
    case "number":
      return <ListOrdered className={cn("text-yellow-400", className)} />;
    case "boolean":
      return <Binary className={cn("text-red-400", className)} />;
    case "array":
      return <Brackets className={cn("text-green-400", className)} />;
    case "object":
      return <Box className={cn("text-orange-400", className)} />;
    default:
      return null;
  }
};

export { getIconForType };
