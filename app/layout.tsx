import Navbar from "@/features/navbar/Navbar";
import Footer from "@/features/footer/Footer";
import { AuthProvider } from "@/features/auth/AuthContext";
import { DisplayNameGate } from "@/features/account/DisplayNameGate";
import { SWRProvider } from "@/features/swr/SWRProvider";
import { ThemeProvider } from "@/features/theme/ThemeProvider";
import { getServerAuthContext } from "@/utils/supabase/server";
import { SITE_URL } from "@/lib/site";
import "./globals.css";
import type { Metadata } from "next";
import type { ReactNode } from "react";

const DESCRIPTION =
  "Design and browse interactive keyboard shortcut diagrams and layouts.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "kbvr",
    template: "%s | kbvr",
  },
  description: DESCRIPTION,
  openGraph: {
    type: "website",
    siteName: "kbvr",
    title: "kbvr",
    description: DESCRIPTION,
  },
  twitter: {
    card: "summary_large_image",
  },
};

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
    <html lang="en" suppressHydrationWarning>
      <body
        suppressHydrationWarning
        className="bg-white text-neutral-900 dark:bg-neutral-950 dark:text-neutral-100"
      >
        <ThemeProvider>
          <AuthProvider initialUser={user} initialDisplayName={displayName}>
            <SWRProvider>
              <div className="flex min-h-screen flex-col">
                <Navbar />
                <DisplayNameGate />
                <div className="flex-1">{children}</div>
                <Footer />
              </div>
            </SWRProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
