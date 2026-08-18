import { Suspense } from "react";
import { getServerAuthContext } from "@/utils/supabase/server";
import { getAccountStats } from "@/features/posts/queries";
import { SignInPrompt } from "@/features/auth/SignInPrompt";
import { DisplayNameForm } from "@/features/account/DisplayNameForm";
import { ExportDataButton } from "@/features/account/ExportDataButton";
import { DeleteAccountDialog } from "@/features/account/DeleteAccountDialog";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Account",
  robots: { index: false, follow: false },
};

export default function AccountPage() {
  return (
    <main className="mx-auto flex max-w-xl flex-col gap-6 p-4">
      <h1 className="text-lg font-semibold">Account</h1>
      <Suspense
        fallback={
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            Loading…
          </p>
        }
      >
        <AccountContent />
      </Suspense>
    </main>
  );
}

async function AccountContent() {
  let email: string | null = null;
  let displayName: string | null = null;
  let stats = {
    ownedDiagrams: 0,
    ownedLayouts: 0,
    savedDiagrams: 0,
    savedLayouts: 0,
  };

  const { supabase, user } = await getServerAuthContext();
  if (supabase && user) {
    email = user.email ?? null;
    try {
      // The stats counts don't depend on the profile row, so both resolve in
      // one round trip's worth of latency.
      const [{ data: profile }, accountStats] = await Promise.all([
        supabase
          .from("profiles")
          .select("display_name")
          .eq("id", user.id)
          .maybeSingle(),
        getAccountStats(),
      ]);
      displayName = profile?.display_name ?? null;
      stats = accountStats;
    } catch (err) {
      console.warn("Supabase unavailable, continuing signed out:", err);
    }
  }

  if (!email) {
    return <SignInPrompt message="Sign in to manage your account." />;
  }

  if (!displayName) {
    return (
      <p className="text-sm text-neutral-500 dark:text-neutral-400">
        Setting up your account…
      </p>
    );
  }

  return (
    <>
      <section className="rounded-lg border border-neutral-200 bg-white p-4 dark:border-neutral-700 dark:bg-neutral-900">
        <p className="mb-3 text-xs text-neutral-500 dark:text-neutral-400">
          Signed in as{" "}
          <span className="text-neutral-700 dark:text-neutral-300">
            {email}
          </span>
        </p>
        <DisplayNameForm initialName={displayName} />
      </section>

      <section className="rounded-lg border border-neutral-200 bg-white p-4 dark:border-neutral-700 dark:bg-neutral-900">
        <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
          Stats
        </h2>
        <dl className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <dt className="text-xs text-neutral-500 dark:text-neutral-400">
              Diagrams created
            </dt>
            <dd className="font-medium text-neutral-900 dark:text-neutral-100">
              {stats.ownedDiagrams}
            </dd>
          </div>
          <div>
            <dt className="text-xs text-neutral-500 dark:text-neutral-400">
              Layouts created
            </dt>
            <dd className="font-medium text-neutral-900 dark:text-neutral-100">
              {stats.ownedLayouts}
            </dd>
          </div>
          <div>
            <dt className="text-xs text-neutral-500 dark:text-neutral-400">
              Diagrams saved
            </dt>
            <dd className="font-medium text-neutral-900 dark:text-neutral-100">
              {stats.savedDiagrams}
            </dd>
          </div>
          <div>
            <dt className="text-xs text-neutral-500 dark:text-neutral-400">
              Layouts saved
            </dt>
            <dd className="font-medium text-neutral-900 dark:text-neutral-100">
              {stats.savedLayouts}
            </dd>
          </div>
        </dl>
      </section>

      <section className="rounded-lg border border-neutral-200 bg-white p-4 dark:border-neutral-700 dark:bg-neutral-900">
        <h2 className="mb-1 text-xs font-semibold uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
          Export
        </h2>
        <p className="mb-3 text-xs text-neutral-500 dark:text-neutral-400">
          Download every diagram and layout you own as a single JSON file.
        </p>
        <ExportDataButton />
      </section>

      <DeleteAccountDialog displayName={displayName} />
    </>
  );
}
