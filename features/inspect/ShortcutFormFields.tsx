import React from "react";

type FieldProps = {
  label: string;
  error?: string;
  children: React.ReactNode;
};

export function Field({ label, error, children }: FieldProps) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-[11px] font-medium text-neutral-600 dark:text-neutral-400">
        {label}
      </span>
      {children}
      {error && (
        <span className="text-[11px] text-red-600 dark:text-red-400">
          {error}
        </span>
      )}
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
      className={`rounded-md border px-2 py-1 text-xs dark:bg-neutral-800 dark:text-neutral-100 ${
        error ? "border-red-500 dark:border-red-500" : "border-neutral-300 dark:border-neutral-700"
      } ${disabled ? "bg-neutral-100 text-neutral-500 dark:bg-neutral-700 dark:text-neutral-400" : ""}`}
      value={value}
      onChange={(e) => onChange?.(e.target.value)}
      disabled={disabled}
    />
  );
}
