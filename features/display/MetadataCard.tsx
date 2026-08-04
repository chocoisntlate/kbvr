import { ReactNode } from "react";

type MetadataCardProps = {
  title: ReactNode;
  children: ReactNode;
};

export function MetadataCard({ title, children }: MetadataCardProps) {
  return (
    <div className="rounded-lg border border-neutral-300 p-4 space-y-3 text-sm dark:border-neutral-700">
      <div className="space-y-1">
        <h1 className="text-xs font-semibold uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
          {title}
        </h1>
        {children}
      </div>
    </div>
  );
}
