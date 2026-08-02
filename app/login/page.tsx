import { LoginPageContent } from "@/features/auth/LoginPageContent";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign in",
  robots: { index: false, follow: false },
};

export default function LoginPage() {
  return (
    <main className="mx-auto flex max-w-xl flex-col gap-6 p-4">
      <h1 className="text-lg font-semibold">Sign in</h1>
      <LoginPageContent />
    </main>
  );
}
