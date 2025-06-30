import type { ReactNode } from "react";
import * as React from "react";

type SearchFieldProps = {
  icon?: ReactNode;
  placeholder?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  className?: string;
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
  onFocus?: (e: React.FocusEvent<HTMLInputElement>) => void;
};

export function SearchField(
  {
    icon,
    placeholder = "Search...",
    value,
    onChange,
    className = "",
    onBlur,
    onFocus,
  }: SearchFieldProps
) {
  return (
    <div className={ `input-with-icon ${ className }` }>
      { icon && <div className="input-with-icon-icon">{ icon }</div> }
      <input
        type="text"
        placeholder={ placeholder }
        value={ value }
        onBlur={ onBlur }
        onChange={ onChange }
        onFocus={ onFocus }
      />
    </div>
  );
}
