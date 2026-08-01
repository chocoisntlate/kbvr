"use client";

import { Button } from "./Button";

export function ModalShell({
  children,
  size = "sm",
  scroll = false,
}: {
  children: React.ReactNode;
  size?: "sm" | "md";
  scroll?: boolean;
}) {
  const maxWidth = size === "md" ? "max-w-md" : "max-w-sm";
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 dark:bg-black/50">
      <div
        className={`w-full ${maxWidth} rounded-lg bg-white p-4 shadow-lg dark:bg-neutral-900 dark:text-neutral-100 ${
          scroll ? "max-h-[90vh] flex flex-col" : ""
        }`}
      >
        {children}
      </div>
    </div>
  );
}

export function ConfirmDialog({
  title,
  message,
  confirmLabel = "Confirm",
  danger,
  onCancel,
  onConfirm,
}: {
  title: string;
  message: string;
  confirmLabel?: string;
  danger?: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <ModalShell>
      <h3 className="mb-3 text-sm font-semibold">{title}</h3>
      <p className="mb-4 text-xs text-neutral-600 dark:text-neutral-400">
        {message}
      </p>
      <div className="flex justify-end gap-2">
        <Button variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
        <Button
          variant="ghost"
          tone={danger ? "danger" : "primary"}
          onClick={onConfirm}
        >
          {confirmLabel}
        </Button>
      </div>
    </ModalShell>
  );
}
