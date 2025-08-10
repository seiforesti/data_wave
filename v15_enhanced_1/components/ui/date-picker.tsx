/**
 * Date Picker Component
 * ====================
 * 
 * Basic date picker component for form inputs.
 */

'use client';

import React from 'react';
import { Input } from './input';

export interface DatePickerProps {
  value?: string;
  onChange?: (date: string) => void;
  placeholder?: string;
  className?: string;
}

export const DatePicker: React.FC<DatePickerProps> = ({
  value,
  onChange,
  placeholder = "Select date...",
  className
}) => {
  return (
    <Input
      type="date"
      value={value}
      onChange={(e) => onChange?.(e.target.value)}
      placeholder={placeholder}
      className={className}
    />
  );
};

export default DatePicker;