"use client";

import { useState } from "react";
import { unstable_rethrow } from "next/navigation";
import { Button } from "@/features/ui/Button";
import {
  signUpWithPassword,
  signInWithUsername,
  requestPasswordReset,
} from "@/features/auth/passwordActions";

type Mode = "sign-in" | "sign-up";

export function PasswordAuthForm() {
  const [mode, setMode] = useState<Mode>("sign-in");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const resetMessages = () => {
    setError(null);
    setNotice(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    resetMessages();
    setBusy(true);
    try {
      const result =
        mode === "sign-up"
          ? await signUpWithPassword({
              username,
              password,
              email: email.trim(),
            })
          : await signInWithUsername(username, password);

      // On success the action itself calls redirect("/"), which Next.js
      // handles specially and navigates away — this line never runs then.
      if (!result.ok) {
        setError(result.error);
        setBusy(false);
      }
    } catch (err) {
      // redirect() throws internally; it must be rethrown here so Next.js
      // can handle the navigation instead of this treating it as a failure.
      unstable_rethrow(err);
      setError("Something went wrong. Please try again.");
      setBusy(false);
    }
  };

  const handleForgotPassword = async () => {
    resetMessages();
    if (!username.trim()) {
      setError("Enter your username first.");
      return;
    }
    setBusy(true);
    try {
      await requestPasswordReset(username, window.location.origin);
      setNotice(
        "If that account has an email on file, a password reset link has been sent.",
      );
    } catch {
      setNotice(
        "If that account has an email on file, a password reset link has been sent.",
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-3 rounded-lg border border-neutral-200 bg-white p-6 dark:border-neutral-700 dark:bg-neutral-900"
    >
      <div className="flex gap-2 text-xs">
        <button
          type="button"
          onClick={() => {
            setMode("sign-in");
            resetMessages();
          }}
          className={`rounded-md border px-3 py-1.5 font-medium transition-colors ${
            mode === "sign-in"
              ? "border-teal-500 bg-teal-50 text-teal-700 dark:border-teal-400 dark:bg-teal-950/40 dark:text-teal-300"
              : "border-neutral-300 bg-white text-neutral-700 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-300"
          }`}
        >
          Sign in
        </button>
        <button
          type="button"
          onClick={() => {
            setMode("sign-up");
            resetMessages();
          }}
          className={`rounded-md border px-3 py-1.5 font-medium transition-colors ${
            mode === "sign-up"
              ? "border-teal-500 bg-teal-50 text-teal-700 dark:border-teal-400 dark:bg-teal-950/40 dark:text-teal-300"
              : "border-neutral-300 bg-white text-neutral-700 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-300"
          }`}
        >
          Create account
        </button>
      </div>

      {mode === "sign-up" && (
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          autoComplete="email"
          required
          className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:border-teal-500 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100 dark:focus:border-teal-400"
        />
      )}
      <input
        type="text"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        placeholder={mode === "sign-up" ? "Username" : "Username or email"}
        autoComplete="username"
        maxLength={30}
        className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:border-teal-500 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100 dark:focus:border-teal-400"
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password"
        autoComplete={mode === "sign-up" ? "new-password" : "current-password"}
        className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:border-teal-500 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100 dark:focus:border-teal-400"
      />

      {error && (
        <p className="text-xs text-red-600 dark:text-red-400">{error}</p>
      )}
      {notice && (
        <p className="text-xs text-neutral-600 dark:text-neutral-400">
          {notice}
        </p>
      )}

      <div className="flex items-center justify-between">
        {mode === "sign-in" ? (
          <button
            type="button"
            onClick={handleForgotPassword}
            disabled={busy}
            className="text-xs text-neutral-500 hover:underline dark:text-neutral-400"
          >
            Forgot password?
          </button>
        ) : (
          <span />
        )}
        <Button
          type="submit"
          tone="primary"
          disabled={
            busy ||
            !username.trim() ||
            !password ||
            (mode === "sign-up" && !email.trim())
          }
        >
          {busy
            ? "Please wait…"
            : mode === "sign-up"
              ? "Create account"
              : "Sign in"}
        </Button>
      </div>
    </form>
  );
}
