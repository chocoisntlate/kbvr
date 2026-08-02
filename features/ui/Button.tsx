"use client";

import type { ButtonHTMLAttributes, Ref } from "react";

type ButtonVariant = "outline" | "ghost";
type ButtonTone = "neutral" | "primary" | "danger";
type ButtonSize = "sm" | "md";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  tone?: ButtonTone;
  size?: ButtonSize;
  ref?: Ref<HTMLButtonElement>;
};

const outlineToneClasses: Record<ButtonTone, string> = {
  neutral:
    "text-neutral-700 hover:bg-neutral-50 dark:text-neutral-200 dark:hover:bg-neutral-700",
  primary:
    "text-teal-600 hover:bg-teal-50 dark:text-teal-300 dark:hover:bg-teal-950/40",
  danger:
    "text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/40",
};

const ghostToneClasses: Record<ButtonTone, string> = {
  neutral: "text-neutral-600 hover:underline dark:text-neutral-400",
  primary: "text-teal-600 hover:underline dark:text-teal-300",
  danger: "text-red-600 hover:underline dark:text-red-400",
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: "px-3 py-1.5 text-xs",
  md: "px-3 py-2 text-xs",
};

export function Button({
  variant = "outline",
  tone = "neutral",
  size = "sm",
  type = "button",
  className = "",
  ref,
  ...props
}: ButtonProps) {
  const base =
    "rounded-md border font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50 outline-none focus-visible:border-teal-500 dark:focus-visible:border-teal-400";
  const variantClasses =
    variant === "outline"
      ? `border-neutral-300 bg-white dark:border-neutral-700 dark:bg-neutral-800 ${outlineToneClasses[tone]}`
      : `border-transparent ${ghostToneClasses[tone]}`;

  return (
    <button
      ref={ref}
      type={type}
      className={`${base} ${sizeClasses[size]} ${variantClasses} ${className}`.trim()}
      {...props}
    />
  );
}
