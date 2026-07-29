"use client";

export function RefreshButton({
  onRefresh,
  isValidating,
}: {
  onRefresh: () => void;
  isValidating: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onRefresh}
      disabled={isValidating}
      title="Refresh"
      className="rounded-md border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium hover:bg-gray-50 transition-colors disabled:cursor-not-allowed disabled:opacity-50"
    >
      {isValidating ? "Refreshing…" : "Refresh"}
    </button>
  );
}
