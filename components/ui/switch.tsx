'use client';

import * as React from 'react';

type SwitchProps = {
  id?: string;
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  disabled?: boolean;
  className?: string;
};

export const Switch = React.forwardRef<HTMLInputElement, SwitchProps>(
  ({ id, checked, onCheckedChange, disabled, className }, ref) => {
    return (
      <label htmlFor={id} className={className}>
        <input
          id={id}
          ref={ref}
          type="checkbox"
          role="switch"
          checked={checked}
          onChange={e => onCheckedChange?.(e.target.checked)}
          disabled={disabled}
          className="peer sr-only"
        />
        <div className="peer-focus:ring-ring peer peer-checked:bg-primary peer-checked:border-primary relative inline-flex h-6 w-11 items-center rounded-full border-2 border-gray-300 bg-gray-400 ring-offset-2 transition-colors outline-none">
          <span className="h-5 w-5 translate-x-1 rounded-full bg-white transition-transform duration-200 ease-in-out peer-checked:translate-x-5" />
        </div>
      </label>
    );
  }
);

Switch.displayName = 'Switch';
