"use client";

export function ModalShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
      <div className="w-full max-w-sm rounded-lg bg-white p-4 shadow-lg">
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
      <p className="mb-4 text-xs text-gray-600">{message}</p>
      <div className="flex justify-end gap-2">
        <button
          className="text-xs text-gray-600 hover:underline"
          onClick={onCancel}
        >
          Cancel
        </button>
        <button
          className={`text-xs font-medium hover:underline ${
            danger ? "text-red-600" : "text-blue-600"
          }`}
          onClick={onConfirm}
        >
          {confirmLabel}
        </button>
      </div>
    </ModalShell>
  );
}
