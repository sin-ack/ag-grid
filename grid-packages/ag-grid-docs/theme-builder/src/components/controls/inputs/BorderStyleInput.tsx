import { BorderStyle, borderStyle } from 'model/values/borderStyle';
import { useEffect, useRef } from 'react';
import { Input } from './Input';
import { InputElement } from './InputElement';

export const BorderStyleInput: Input<'borderStyle'> = ({ value, onValueChange, initialFocus }) => {
  const initialFocusRef = useRef(initialFocus);

  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (initialFocusRef.current) {
      inputRef.current?.focus();
    }
  }, []);

  return (
    <InputElement
      ref={inputRef}
      type="color"
      value={value.lineStyle}
      onChange={(e) => {
        onValueChange(borderStyle(e.target.value as BorderStyle));
      }}
    />
  );
};
