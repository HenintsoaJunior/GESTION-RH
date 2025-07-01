import * as React from "react";
import { ChevronDown } from "lucide-react";
const combineClasses = (...classes) => classes.filter(Boolean).join(" ");

const NativeSelect = React.forwardRef(
  ({ className, children, defaultValue, value, onValueChange, placeholder, ...props }, ref) => {
    const [internalValue, setInternalValue] = React.useState(defaultValue || "");
    const [isOpen, setIsOpen] = React.useState(false);

    const handleChange = (event) => {
      const newValue = event.target.value;
      if (value === undefined) {
        setInternalValue(newValue);
      }
      if (onValueChange) {
        onValueChange(newValue);
      }
    };

    const handleFocus = () => setIsOpen(true);
    const handleBlur = () => setIsOpen(false);

    const currentValue = value !== undefined ? value : internalValue;

    return (
      <div className={combineClasses("native-select-wrapper", className || "")} ref={ref}>
        <select
          value={currentValue}
          onChange={handleChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          className="native-select-input"
          {...props}
        >
          {placeholder && (
            <option value="" disabled hidden>
              {placeholder}
            </option>
          )}
          {children}
        </select>
        <div className="native-select-icon-wrapper">
          <ChevronDown
            className={combineClasses(
              "native-select-icon",
              isOpen ? "native-select-icon-open" : ""
            )}
          />
        </div>
      </div>
    );
  }
);
NativeSelect.displayName = "NativeSelect";

const NativeSelectItem = React.forwardRef(({ className, children, value, ...props }, ref) => {
  return (
    <option
      className={combineClasses("native-select-option", className || "")}
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