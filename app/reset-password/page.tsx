import { ResetPasswordForm } from "@/features/auth/ResetPasswordForm";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Reset password",
  robots: { index: false, follow: false },
};

export default function ResetPasswordPage() {
  return (
    <main className="mx-auto flex max-w-sm flex-col gap-6 p-4">
      <h1 className="text-lg font-semibold">Reset your password</h1>
      <ResetPasswordForm />
    </main>
  );
}
