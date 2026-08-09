import Link from "next/link";

export default function EditorNotFound() {
  return (
    <main className="flex flex-col items-center justify-center gap-4 p-12 text-center">
      <h1 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
        Diagram not found
      </h1>
      <p className="max-w-sm text-sm text-neutral-500 dark:text-neutral-400">
        This diagram doesn&apos;t exist, or may have been made private or
        deleted by its owner.
      </p>
      <div className="flex gap-2">
        <Link
          href="/browse"
          className="rounded-md border border-neutral-300 bg-white px-3 py-1.5 text-xs font-medium hover:bg-neutral-50 transition-colors outline-none focus-visible:border-teal-500 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100 dark:hover:bg-neutral-700 dark:focus-visible:border-teal-400"
        >
          Browse diagrams
        </Link>
        <Link
          href="/editor?new=1"
          className="rounded-md border border-neutral-300 bg-white px-3 py-1.5 text-xs font-medium hover:bg-neutral-50 transition-colors outline-none focus-visible:border-teal-500 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100 dark:hover:bg-neutral-700 dark:focus-visible:border-teal-400"
        >
          Start a new diagram
        </Link>
      </div>
    </main>
  );
}
