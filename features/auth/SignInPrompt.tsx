import Link from "next/link";

export function SignInPrompt({
  message = "Sign in to continue.",
}: {
  message?: string;
}) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-lg border border-neutral-200 bg-white p-8 text-center dark:border-neutral-700 dark:bg-neutral-900">
      <p className="text-sm text-neutral-600 dark:text-neutral-400">
        {message}
      </p>
      <Link
        href="/login"
        className="rounded-md border border-neutral-300 bg-white px-3 py-2 text-xs font-medium hover:bg-neutral-50 transition-colors outline-none focus-visible:border-teal-500 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100 dark:hover:bg-neutral-700 dark:focus-visible:border-teal-400"
      >
        Sign in
      </Link>
    </div>
  );
}
