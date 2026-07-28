import React from "react";

type FieldProps = {
  label: string;
  error?: string;
  children: React.ReactNode;
};

export function Field({ label, error, children }: FieldProps) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-[11px] font-medium text-gray-600">{label}</span>
      {children}
      {error && <span className="text-[11px] text-red-600">{error}</span>}
    </label>
  );
}

type InputProps = {
  value: string;
  onChange?: (v: string) => void;
  error?: boolean;
  disabled?: boolean;
};

export function Input({ value, onChange, error, disabled }: InputProps) {
  return (
    <input
      className={`rounded-md border px-2 py-1 text-xs ${
        error ? "border-red-500" : "border-gray-300"
      } ${disabled ? "bg-gray-100 text-gray-500" : ""}`}
      value={value}
      onChange={(e) => onChange?.(e.target.value)}
      disabled={disabled}
    />
  );
}
