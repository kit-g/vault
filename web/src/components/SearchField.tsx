import type { ReactNode } from "react";
import * as React from "react";

type SearchFieldProps = {
  icon?: ReactNode;
  placeholder?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  className?: string;
};

export function SearchField(
  {
    icon,
    placeholder = "Search...",
    value,
    onChange,
    className = "",
  }: SearchFieldProps
) {
  return (
    <div className={ `input-with-icon ${ className }` }>
      { icon && <div className="input-with-icon-icon">{ icon }</div> }
      <input
        type="text"
        placeholder={ placeholder }
        value={ value }
        onChange={ onChange }
      />
    </div>
  );
}
