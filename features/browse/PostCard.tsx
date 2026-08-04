import Link from "next/link";
import { MetadataCard } from "@/features/display/MetadataCard";

type PostCardProps = {
  name: string;
  description?: string;
  ownerDisplayName: string | null;
  isOfficial?: boolean;
  createdAt: string;
  stats: string[];
  actions: React.ReactNode;
};

export function OfficialBadge() {
  return (
    <span className="rounded-full bg-teal-100 px-2 py-0.5 text-[10px] font-medium text-teal-700 dark:bg-teal-950/50 dark:text-teal-300">
      Official
    </span>
  );
}

export function PostCard({
  name,
  description,
  ownerDisplayName,
  isOfficial,
  createdAt,
  stats,
  actions,
}: PostCardProps) {
  return (
    <MetadataCard
      title={
        <span className="flex items-center gap-2">
          {name}
          {isOfficial && <OfficialBadge />}
        </span>
      }
    >
      <div className="flex flex-col gap-2">
        {description && (
          <p className="text-xs text-neutral-600 dark:text-neutral-400">
            {description}
          </p>
        )}
        <div className="flex flex-wrap gap-1.5">
          {stats.map((stat) => (
            <span
              key={stat}
              className="rounded-full bg-neutral-100 px-2 py-0.5 text-[10px] font-medium text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300"
            >
              {stat}
            </span>
          ))}
        </div>
        <p className="text-xs text-neutral-500 dark:text-neutral-400">
          By{" "}
          {ownerDisplayName ? (
            <Link
              href={`/u/${encodeURIComponent(ownerDisplayName)}`}
              className="hover:text-neutral-900 hover:underline dark:hover:text-neutral-100"
            >
              {ownerDisplayName}
            </Link>
          ) : (
            "Unknown"
          )}{" "}
          · {new Date(createdAt).toLocaleDateString()}
        </p>
        <div className="flex gap-2">{actions}</div>
      </div>
    </MetadataCard>
  );
}
