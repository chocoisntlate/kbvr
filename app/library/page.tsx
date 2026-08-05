import { Suspense } from "react";
import { getServerAuthContext } from "@/utils/supabase/server";
import { getLibraryDataAction } from "@/features/posts/readActions";
import { SignInPrompt } from "@/features/auth/SignInPrompt";
import { LibraryList } from "@/features/library/LibraryList";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Library",
  robots: { index: false, follow: false },
};

export default function LibraryPage() {
  return (
    <main className="mx-auto flex max-w-3xl flex-col gap-6 p-4">
      <h1 className="text-lg font-semibold"> My Library</h1>
      <Suspense
        fallback={
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            Loading…
          </p>
        }
      >
        <LibraryServerContent />
      </Suspense>
    </main>
  );
}

async function LibraryServerContent() {
  const { user } = await getServerAuthContext();

  if (!user) {
    return (
      <SignInPrompt message="Sign in to see your saved diagrams and layouts." />
    );
  }

  const libraryData = await getLibraryDataAction();

  return <LibraryList initialData={libraryData} />;
}
