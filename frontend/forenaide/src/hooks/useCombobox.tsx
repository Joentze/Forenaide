import { useState } from "react";

export function useCombobox(defaultValue = "", onChange?: (value: string) => void) {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState(defaultValue);

  const toggleOpen = () => setOpen((prev) => !prev);
  const close = () => setOpen(false);
  const selectValue = (newValue: string) => {
    setValue(newValue);
    close();
    if (onChange) {
      onChange(newValue); // Notify the parent about the change
    }
  };

  const reset = () => {
    setValue("");
    if (onChange) {
      onChange(""); // Notify the parent that the selection was cleared
    }
  };

  return { open, value, toggleOpen, close, selectValue, setOpen, reset };
}
