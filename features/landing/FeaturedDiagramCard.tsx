import Link from "next/link";
import { OfficialBadge } from "@/features/browse/PostCard";

export type FeaturedDiagramData = {
  key: string;
  name: string;
  description: string;
  href: string;
  author: string | null;
  isOfficial: boolean;
  stats: string[];
};


const secondaryButtonClasses =
  "inline-block rounded-md border border-neutral-300 bg-white px-5 py-2.5 text-sm font-medium text-neutral-700 transition-colors hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-200 dark:hover:bg-neutral-700";

export function FeaturedDiagramCard({
  diagram,
}: {
  diagram: FeaturedDiagramData;
}) {
  return (
    <Link
      href={diagram.href}
      className="flex h-full flex-col rounded-lg border border-neutral-300 p-4 text-sm hover:bg-neutral-50 dark:hover:bg-neutral-700"
    >
      <h3 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
        {diagram.name}
        {diagram.isOfficial && <OfficialBadge />}
      </h3>
      <p className="mt-1 text-xs text-neutral-600 dark:text-neutral-400">
        {diagram.description}
      </p>
      <div className="mt-2 flex flex-wrap gap-1.5">
        {diagram.stats.map((stat) => (
          <span
            key={stat}
            className="rounded-full bg-neutral-100 px-2 py-0.5 text-[10px] font-medium text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300"
          >
            {stat}
          </span>
        ))}
      </div>
      <p className="mt-auto pt-2 text-xs text-neutral-500 dark:text-neutral-400">
        By {diagram.author ?? "Unknown"}
      </p>
    </Link>
  );
}
