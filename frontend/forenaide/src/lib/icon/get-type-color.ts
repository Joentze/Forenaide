const getTextColorForType = (type: string): string => {
  switch (type) {
    case "string":
      return "text-blue-500";
    case "number":
      return "text-yellow-500";
    case "boolean":
      return "text-red-500";
    case "array":
      return "text-green-500";
    case "object":
      return "text-orange-500";
    default:
      return "text-gray-500"; // Default color for unknown types
  }
};

export { getTextColorForType };
