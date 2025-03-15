import { useState } from "react";
import { Button } from "../ui/button";
import { ChevronDown, ChevronRight } from "lucide-react";
import { getIconForType } from "@/lib/icon/get-icons";
import { cn } from "@/lib/utils";
import { getTextColorForType } from "@/lib/icon/get-type-color";

type FieldRendererProps = {
  field: any;
  level?: number;
};

export default function FieldRenderer({
  field,
  level = 0,
}: FieldRendererProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  const hasChildren =
    (field.type === "object" && field.properties) ||
    (field.type === "array" && field.items);

  const indent = level * 20;

  return (
    <div className="my-1" style={{ marginLeft: `${indent}px` }}>
      <div className="flex items-start">
        {hasChildren ? (
          <Button
            variant="ghost"
            size="sm"
            className="h-5 w-5 p-0 mr-1"
            onClick={toggleExpand}
          >
            {isExpanded ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </Button>
        ) : (
          <span className="w-6"></span>
        )}

        <div className="flex-1">
          <div className="flex">
            <span className="font-bold text-sm">{field.name} :</span>
            <span className="ml-2 flex flex-row gap-1 font-mono ">
              {getIconForType(field.type, "w-4 h-4 my-auto")}{" "}
              <p
                className={cn(
                  "text-xs my-auto",
                  getTextColorForType(field.type)
                )}
              >
                {field.type}
              </p>
            </span>

            {/* {field.description && (
              <span className="text-gray-400 dark:text-gray-500 ml-2">
                // {field.description}
              </span>
            )} */}
          </div>

          {hasChildren && isExpanded && (
            <div className="mt-1">
              {field.type === "object" && field.properties && (
                <div>
                  <div className="text-gray-500 dark:text-gray-400 ml-2 italic text-xs">
                    properties:
                  </div>
                  <div className="ml-4">
                    {Object.entries(field.properties).map(
                      ([key, prop]: [string, any]) => (
                        <FieldRenderer
                          key={key}
                          field={prop}
                          level={level + 1}
                        />
                      )
                    )}
                  </div>
                  <div className="text-gray-500 dark:text-gray-400 ml-2"></div>
                </div>
              )}

              {field.type === "array" && field.items && (
                <div>
                  <div className="text-gray-500 dark:text-gray-400 ml-2">
                    items:
                  </div>
                  <FieldRenderer field={field.items} level={level + 1} />
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
