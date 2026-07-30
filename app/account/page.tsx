import { Suspense } from "react";
import { getServerAuthContext } from "@/utils/supabase/server";
import {
  getUserOwnedDiagrams,
  getUserOwnedLayouts,
  getUserSavedDiagrams,
  getUserSavedLayouts,
} from "@/features/posts/queries";
import { SignInPrompt } from "@/features/auth/SignInPrompt";
import { DisplayNameForm } from "@/features/account/DisplayNameForm";
import { ExportDataButton } from "@/features/account/ExportDataButton";
import { DeleteAccountDialog } from "@/features/account/DeleteAccountDialog";

export default function AccountPage() {
  return (
    <main className="mx-auto flex max-w-xl flex-col gap-6 p-4">
      <h1 className="text-lg font-semibold">Account</h1>
      <Suspense fallback={<p className="text-sm text-gray-500">Loading…</p>}>
        <AccountContent />
      </Suspense>
    </main>
  );
}

async function AccountContent() {
  let email: string | null = null;
  let displayName: string | null = null;

  const { supabase, user } = await getServerAuthContext();
  if (supabase && user) {
    email = user.email ?? null;
    try {
      const { data: profile } = await supabase
        .from("profiles")
        .select("display_name")
        .eq("id", user.id)
        .maybeSingle();
      displayName = profile?.display_name ?? null;
    } catch (err) {
      console.warn("Supabase unavailable, continuing signed out:", err);
    }
  }

  if (!email) {
    return <SignInPrompt message="Sign in to manage your account." />;
  }

  if (!displayName) {
    return <p className="text-sm text-gray-500">Setting up your account…</p>;
  }

  const [ownedDiagrams, ownedLayouts, savedDiagrams, savedLayouts] =
    await Promise.all([
      getUserOwnedDiagrams(),
      getUserOwnedLayouts(),
      getUserSavedDiagrams(),
      getUserSavedLayouts(),
    ]);

  return (
    <>
      <section className="rounded-lg border border-gray-200 bg-white p-4">
        <p className="mb-3 text-xs text-gray-500">
          Signed in as <span className="text-gray-700">{email}</span>
        </p>
        <DisplayNameForm initialName={displayName} />
      </section>

      <section className="rounded-lg border border-gray-200 bg-white p-4">
        <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
          Stats
        </h2>
        <dl className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <dt className="text-xs text-gray-500">Diagrams created</dt>
            <dd className="font-medium text-gray-900">
              {ownedDiagrams.length}
            </dd>
          </div>
          <div>
            <dt className="text-xs text-gray-500">Layouts created</dt>
            <dd className="font-medium text-gray-900">{ownedLayouts.length}</dd>
          </div>
          <div>
            <dt className="text-xs text-gray-500">Diagrams saved</dt>
            <dd className="font-medium text-gray-900">
              {savedDiagrams.length}
            </dd>
          </div>
          <div>
            <dt className="text-xs text-gray-500">Layouts saved</dt>
            <dd className="font-medium text-gray-900">{savedLayouts.length}</dd>
          </div>
        </dl>
      </section>

      <section className="rounded-lg border border-gray-200 bg-white p-4">
        <h2 className="mb-1 text-xs font-semibold uppercase tracking-wide text-gray-500">
          Export
        </h2>
        <p className="mb-3 text-xs text-gray-500">
          Download every diagram and layout you own as a single JSON file.
        </p>
        <ExportDataButton
          diagrams={ownedDiagrams.map((d) => d.data)}
          layouts={ownedLayouts.map((l) => l.data)}
        />
      </section>

      <DeleteAccountDialog displayName={displayName} />
    </>
  );
}
