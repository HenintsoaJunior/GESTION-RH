import * as React from "react";
import { ChevronDown } from "lucide-react";

// Utilitaire pour combiner les classes
const combineClasses = (...classes) => classes.filter(Boolean).join(" ");

const NativeSelect = React.forwardRef(
  ({ className, children, defaultValue, value, onValueChange, placeholder, ...props }, ref) => {
    const [internalValue, setInternalValue] = React.useState(defaultValue || "");

    const handleChange = (event) => {
      const newValue = event.target.value;
      if (value === undefined) {
        setInternalValue(newValue);
      }
      if (onValueChange) {
        onValueChange(newValue);
      }
    };

    const currentValue = value !== undefined ? value : internalValue;

    return (
      <div className={combineClasses("relative w-full", className || "")} ref={ref}>
        <select
          value={currentValue}
          onChange={handleChange}
          className={combineClasses(
            "flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 pr-10 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500",
            currentValue ? "" : "text-gray-500"
          )}
          {...props}
        >
          {placeholder && (
            <option value="" disabled hidden>
              {placeholder}
            </option>
          )}
          {children}
        </select>
        <ChevronDown
          className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none z-10"
        />
      </div>
    );
  }
);
NativeSelect.displayName = "NativeSelect";

const NativeSelectItem = React.forwardRef(({ className, children, value, ...props }, ref) => {
  return (
    <option
      className={combineClasses("text-gray-900", className || "")}
      value={value}
      ref={ref}
      {...props}
    >
      {children}
    </option>
  );
});
NativeSelectItem.displayName = "NativeSelectItem";

export { NativeSelect, NativeSelectItem };