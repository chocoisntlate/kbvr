import { cookies } from "next/headers";
import { createClient } from "@/utils/supabase/server";
import { isSupabaseConfigured } from "@/utils/supabase/config";
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

export default async function AccountPage() {
  let email: string | null = null;
  let displayName: string | null = null;

  if (isSupabaseConfigured()) {
    try {
      const supabase = createClient(await cookies());
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        email = user.email ?? null;
        const { data: profile } = await supabase
          .from("profiles")
          .select("display_name")
          .eq("id", user.id)
          .maybeSingle();
        displayName = profile?.display_name ?? null;
      }
    } catch (err) {
      console.warn("Supabase unavailable, continuing signed out:", err);
    }
  }

  if (!email) {
    return (
      <main className="mx-auto flex max-w-xl flex-col gap-4 p-4">
        <h1 className="text-lg font-semibold">Account</h1>
        <SignInPrompt message="Sign in to manage your account." />
      </main>
    );
  }

  if (!displayName) {
    return (
      <main className="mx-auto flex max-w-xl flex-col gap-4 p-4">
        <h1 className="text-lg font-semibold">Account</h1>
        <p className="text-sm text-gray-500">Setting up your account…</p>
      </main>
    );
  }

  const [ownedDiagrams, ownedLayouts, savedDiagrams, savedLayouts] =
    await Promise.all([
      getUserOwnedDiagrams(),
      getUserOwnedLayouts(),
      getUserSavedDiagrams(),
      getUserSavedLayouts(),
    ]);

  return (
    <main className="mx-auto flex max-w-xl flex-col gap-6 p-4">
      <h1 className="text-lg font-semibold">Account</h1>

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
            <dd className="font-medium text-gray-900">
              {ownedLayouts.length}
            </dd>
          </div>
          <div>
            <dt className="text-xs text-gray-500">Diagrams saved</dt>
            <dd className="font-medium text-gray-900">
              {savedDiagrams.length}
            </dd>
          </div>
          <div>
            <dt className="text-xs text-gray-500">Layouts saved</dt>
            <dd className="font-medium text-gray-900">
              {savedLayouts.length}
            </dd>
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
    </main>
  );
}
