import Navbar from "@/features/navbar/Navbar";
import { AuthProvider } from "@/features/auth/AuthContext";
import { DisplayNameGate } from "@/features/account/DisplayNameGate";
import { SWRProvider } from "@/features/swr/SWRProvider";
import { getServerAuthContext } from "@/utils/supabase/server";
import "./globals.css";
import type { ReactNode } from "react";

export default async function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  const { supabase, user } = await getServerAuthContext();
  let displayName: string | null = null;
  if (supabase && user) {
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

  return (
    <html lang="en">
      <body suppressHydrationWarning>
        <AuthProvider initialUser={user} initialDisplayName={displayName}>
          <SWRProvider>
            <Navbar />
            <DisplayNameGate />
            {children}
          </SWRProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
