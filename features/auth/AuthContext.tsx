"use client";

import { createContext, useContext, useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { createClient } from "@/utils/supabase/client";
import { isSupabaseConfigured } from "@/utils/supabase/config";

type AuthContextType = {
  user: User | null;
  loading: boolean;
  displayName: string | null;
  refreshDisplayName: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

async function fetchDisplayName(userId: string): Promise<string | null> {
  try {
    const supabase = createClient();
    const { data } = await supabase
      .from("profiles")
      .select("display_name")
      .eq("id", userId)
      .maybeSingle();
    return data?.display_name ?? null;
  } catch (err) {
    console.warn("Could not fetch display name:", err);
    return null;
  }
}

export function AuthProvider({
  initialUser,
  initialDisplayName,
  children,
}: {
  initialUser: User | null;
  initialDisplayName: string | null;
  children: React.ReactNode;
}) {
  const [user, setUser] = useState<User | null>(initialUser);
  const [prevInitialUser, setPrevInitialUser] = useState(initialUser);
  const [loading, setLoading] = useState(false);
  const [displayName, setDisplayName] = useState<string | null>(
    initialDisplayName,
  );
  const [prevInitialDisplayName, setPrevInitialDisplayName] =
    useState(initialDisplayName);

  // RootLayout re-executes server-side (and sends fresh props) after a
  // Server Action redirect, e.g. sign-in, but this provider stays mounted
  // across that navigation — without this, the initial useState values
  // would never update and the Navbar would wait on the slower client-side
  // onAuthStateChange listener to notice the new session. Adjusting state
  // during render (rather than an effect) is React's documented pattern for
  // this: https://react.dev/learn/you-might-not-need-an-effect
  if (initialUser !== prevInitialUser) {
    setPrevInitialUser(initialUser);
    setUser(initialUser);
  }
  if (initialDisplayName !== prevInitialDisplayName) {
    setPrevInitialDisplayName(initialDisplayName);
    setDisplayName(initialDisplayName);
  }

  const refreshDisplayName = async () => {
    if (!user) {
      setDisplayName(null);
      return;
    }
    setDisplayName(await fetchDisplayName(user.id));
  };

  useEffect(() => {
    if (!isSupabaseConfigured()) return;

    try {
      const supabase = createClient();
      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange((_event, session) => {
        setUser(session?.user ?? null);
        setLoading(false);
        if (session?.user) {
          fetchDisplayName(session.user.id).then(setDisplayName);
        } else {
          setDisplayName(null);
        }
      });

      return () => subscription.unsubscribe();
    } catch (err) {
      console.warn("Supabase unavailable, continuing signed out:", err);
    }
  }, []);

  useEffect(() => {
    // If this page is restored from the browser's back-forward cache (e.g.
    // the user hit Back after starting, then cancelling, the Google OAuth
    // redirect), the frozen JS heap is thawed as-is instead of being
    // re-initialized — leaving the app in a stale, unresponsive state.
    // Force a fresh reload whenever that happens.
    const handlePageShow = (event: PageTransitionEvent) => {
      if (event.persisted) {
        window.location.reload();
      }
    };
    window.addEventListener("pageshow", handlePageShow);
    return () => window.removeEventListener("pageshow", handlePageShow);
  }, []);

  return (
    <AuthContext.Provider
      value={{ user, loading, displayName, refreshDisplayName }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};
