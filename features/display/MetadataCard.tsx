import { ReactNode } from "react";

type MetadataCardProps = {
  title: ReactNode;
  children: ReactNode;
};

export function MetadataCard({ title, children }: MetadataCardProps) {
  return (
    <div className="rounded-lg border border-neutral-300 p-5 space-y-2 text-sm transition-colors hover:border-neutral-400 dark:border-neutral-700 dark:hover:border-neutral-600">
      <h3 className="text-base font-semibold text-neutral-900 dark:text-neutral-100">
        {title}
      </h3>
      {children}
    </div>
  );
}
