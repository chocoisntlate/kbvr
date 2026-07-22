import { cookies } from "next/headers";
import type { User } from "@supabase/supabase-js";
import Navbar from "@/features/navbar/Navbar";
import { AuthProvider } from "@/features/auth/AuthContext";
import { createClient } from "@/utils/supabase/server";
import { isSupabaseConfigured } from "@/utils/supabase/config";
import "./globals.css";
import type { ReactNode } from "react";

export default async function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  let user: User | null = null;
  if (isSupabaseConfigured()) {
    const cookieStore = await cookies();
    try {
      const supabase = createClient(cookieStore);
      ({
        data: { user },
      } = await supabase.auth.getUser());
    } catch (err) {
      console.warn("Supabase unavailable, continuing signed out:", err);
    }
  }

  return (
    <html lang="en">
      <body suppressHydrationWarning>
        <AuthProvider initialUser={user}>
          <Navbar />
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
