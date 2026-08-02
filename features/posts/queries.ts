import { cache } from "react";
import { getServerAuthContext } from "@/utils/supabase/server";
import { isSupabaseConfigured } from "@/utils/supabase/config";
import { Diagram } from "@/features/spec/diagramSchema";
import { Layout } from "@/features/spec/layoutSchema";
import { DiagramPost, LayoutPost } from "./types";

type PostRow = {
  id: string;
  owner_id: string;
  owner_display_name: string | null;
  data: unknown;
  is_public: boolean;
  forked_from_id: string | null;
  created_at: string;
  updated_at: string;
};

function mapRow<T>(row: PostRow): {
  id: string;
  ownerId: string;
  ownerDisplayName: string | null;
  data: T;
  isPublic: boolean;
  forkedFromId: string | null;
  createdAt: string;
  updatedAt: string;
} {
  return {
    id: row.id,
    ownerId: row.owner_id,
    ownerDisplayName: row.owner_display_name,
    data: row.data as T,
    isPublic: row.is_public,
    forkedFromId: row.forked_from_id,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

async function getServerContext() {
  // safely() below only calls run() when isSupabaseConfigured() is true, so
  // supabase is guaranteed non-null here.
  const { supabase, user } = await getServerAuthContext();
  return { supabase: supabase!, user };
}

/* Sanitize a search term for use inside a PostgREST `.or()` filter string. */
function sanitizeSearchTerm(query: string): string {
  return query.replace(/[,()%]/g, " ").trim();
}

/*
 * The posts schema (supabase/migrations/0001_posts_schema.sql) may not be
 * applied to every environment yet. Fail open — like the rest of the
 * Supabase integration in this app — rather than 500ing pages that don't
 * strictly need this data.
 */
async function safely<T>(fallback: T, run: () => Promise<T>): Promise<T> {
  if (!isSupabaseConfigured()) return fallback;
  try {
    return await run();
  } catch (err) {
    console.warn("Posts query failed, continuing without it:", err);
    return fallback;
  }
}

export const PAGE_SIZE = 20;

export type SearchPostsResult = {
  posts: (DiagramPost | LayoutPost)[];
  hasMore: boolean;
};

/*
 * Offset-based pagination: rows inserted between page fetches can shift
 * later pages (classic offset-under-concurrent-writes tradeoff), acceptable
 * given how infrequently new public posts appear relative to browsing.
 */
export async function searchPosts(
  type: "diagram" | "layout",
  query: string,
  page: number = 0,
): Promise<SearchPostsResult> {
  return safely({ posts: [], hasMore: false }, async () => {
    const { supabase } = await getServerContext();
    const table = type === "diagram" ? "diagrams" : "layouts";

    let builder = supabase
      .from(table)
      .select("*")
      .eq("is_public", true)
      .order("created_at", { ascending: false });

    const term = sanitizeSearchTerm(query);
    if (term) {
      builder = builder.or(`name.ilike.%${term}%,description.ilike.%${term}%`);
    }

    const from = page * PAGE_SIZE;
    const to = from + PAGE_SIZE; // inclusive range: fetch PAGE_SIZE + 1 rows to derive hasMore
    const { data, error } = await builder.range(from, to);
    if (error) throw error;

    const rows = data as PostRow[];
    const hasMore = rows.length > PAGE_SIZE;
    const posts = (hasMore ? rows.slice(0, PAGE_SIZE) : rows).map((row) =>
      mapRow<Diagram | Layout>(row),
    ) as (DiagramPost | LayoutPost)[];
    return { posts, hasMore };
  });
}

// Memoized per request: generateMetadata and the page component both call
// this for the same ?diagram= id, so share one Supabase round-trip.
export const getDiagramById = cache(async function getDiagramById(
  id: string,
): Promise<{ post: DiagramPost; isSavedByMe: boolean } | null> {
  return safely(null, async () => {
    const { supabase, user } = await getServerContext();

    const { data, error } = await supabase
      .from("diagrams")
      .select("*")
      .eq("id", id)
      .maybeSingle();
    if (error) throw error;
    if (!data) return null;

    let isSavedByMe = false;
    if (user) {
      const { data: saved } = await supabase
        .from("saved_diagrams")
        .select("diagram_id")
        .eq("user_id", user.id)
        .eq("diagram_id", id)
        .maybeSingle();
      isSavedByMe = !!saved;
    }

    return { post: mapRow<Diagram>(data as PostRow), isSavedByMe };
  });
});

export async function getLayoutById(
  id: string,
): Promise<{ post: LayoutPost; isSavedByMe: boolean } | null> {
  return safely(null, async () => {
    const { supabase, user } = await getServerContext();

    const { data, error } = await supabase
      .from("layouts")
      .select("*")
      .eq("id", id)
      .maybeSingle();
    if (error) throw error;
    if (!data) return null;

    let isSavedByMe = false;
    if (user) {
      const { data: saved } = await supabase
        .from("saved_layouts")
        .select("layout_id")
        .eq("user_id", user.id)
        .eq("layout_id", id)
        .maybeSingle();
      isSavedByMe = !!saved;
    }

    return { post: mapRow<Layout>(data as PostRow), isSavedByMe };
  });
}

export async function getDefaultLayout(): Promise<LayoutPost | null> {
  return safely(null, async () => {
    const { supabase, user } = await getServerContext();
    if (!user) return null;

    const { data: profile } = await supabase
      .from("profiles")
      .select("default_layout_id")
      .eq("id", user.id)
      .maybeSingle();
    if (!profile?.default_layout_id) return null;

    const { data, error } = await supabase
      .from("layouts")
      .select("*")
      .eq("id", profile.default_layout_id)
      .maybeSingle();
    if (error) throw error;
    return data ? mapRow<Layout>(data as PostRow) : null;
  });
}

export async function getUserOwnedDiagrams(): Promise<DiagramPost[]> {
  return safely([], async () => {
    const { supabase, user } = await getServerContext();
    if (!user) return [];

    const { data, error } = await supabase
      .from("diagrams")
      .select("*")
      .eq("owner_id", user.id)
      .order("updated_at", { ascending: false });
    if (error) throw error;
    return (data as PostRow[]).map((row) => mapRow<Diagram>(row));
  });
}

export async function getUserOwnedLayouts(): Promise<LayoutPost[]> {
  return safely([], async () => {
    const { supabase, user } = await getServerContext();
    if (!user) return [];

    const { data, error } = await supabase
      .from("layouts")
      .select("*")
      .eq("owner_id", user.id)
      .order("updated_at", { ascending: false });
    if (error) throw error;
    return (data as PostRow[]).map((row) => mapRow<Layout>(row));
  });
}

export async function getUserSavedDiagrams(): Promise<DiagramPost[]> {
  return safely([], async () => {
    const { supabase, user } = await getServerContext();
    if (!user) return [];

    const { data, error } = await supabase
      .from("saved_diagrams")
      .select("diagrams(*)")
      .eq("user_id", user.id);
    if (error) throw error;
    return (data as unknown as { diagrams: PostRow }[])
      .filter((row) => row.diagrams)
      .map((row) => mapRow<Diagram>(row.diagrams));
  });
}

export async function getUserSavedLayouts(): Promise<LayoutPost[]> {
  return safely([], async () => {
    const { supabase, user } = await getServerContext();
    if (!user) return [];

    const { data, error } = await supabase
      .from("saved_layouts")
      .select("layouts(*)")
      .eq("user_id", user.id);
    if (error) throw error;
    return (data as unknown as { layouts: PostRow }[])
      .filter((row) => row.layouts)
      .map((row) => mapRow<Layout>(row.layouts));
  });
}

export async function getPublicPostsByDisplayName(
  displayName: string,
): Promise<{
  diagrams: DiagramPost[];
  layouts: LayoutPost[];
} | null> {
  return safely(null, async () => {
    const { supabase } = await getServerContext();

    const { data: profile } = await supabase
      .from("profiles")
      .select("id")
      .ilike("display_name", displayName)
      .maybeSingle();

    const diagramsQuery = supabase
      .from("diagrams")
      .select("*")
      .eq("is_public", true)
      .order("created_at", { ascending: false });
    const layoutsQuery = supabase
      .from("layouts")
      .select("*")
      .eq("is_public", true)
      .order("created_at", { ascending: false });

    // Most accounts are found via `profiles`, but the seed account created by
    // scripts/seedDefaults.ts never gets a profile row — fall back to the
    // denormalized owner_display_name so its posts still resolve here too.
    const [
      { data: diagrams, error: diagramsError },
      { data: layouts, error: layoutsError },
    ] = profile
      ? await Promise.all([
          diagramsQuery.eq("owner_id", profile.id),
          layoutsQuery.eq("owner_id", profile.id),
        ])
      : await Promise.all([
          diagramsQuery.ilike("owner_display_name", displayName),
          layoutsQuery.ilike("owner_display_name", displayName),
        ]);
    if (diagramsError) throw diagramsError;
    if (layoutsError) throw layoutsError;

    if (!profile && diagrams.length === 0 && layouts.length === 0) return null;

    return {
      diagrams: (diagrams as PostRow[]).map((row) => mapRow<Diagram>(row)),
      layouts: (layouts as PostRow[]).map((row) => mapRow<Layout>(row)),
    };
  });
}

export async function getPublicDisplayNames(): Promise<string[]> {
  return safely([], async () => {
    const { supabase } = await getServerContext();

    const [
      { data: diagramNames, error: diagramsError },
      { data: layoutNames, error: layoutsError },
    ] = await Promise.all([
      supabase
        .from("diagrams")
        .select("owner_display_name")
        .eq("is_public", true)
        .not("owner_display_name", "is", null),
      supabase
        .from("layouts")
        .select("owner_display_name")
        .eq("is_public", true)
        .not("owner_display_name", "is", null),
    ]);
    if (diagramsError) throw diagramsError;
    if (layoutsError) throw layoutsError;

    const names = new Set<string>();
    for (const row of diagramNames as { owner_display_name: string }[]) {
      names.add(row.owner_display_name);
    }
    for (const row of layoutNames as { owner_display_name: string }[]) {
      names.add(row.owner_display_name);
    }
    return [...names];
  });
}

export async function getUserDefaultLayoutId(): Promise<string | null> {
  return safely(null, async () => {
    const { supabase, user } = await getServerContext();
    if (!user) return null;

    const { data } = await supabase
      .from("profiles")
      .select("default_layout_id")
      .eq("id", user.id)
      .maybeSingle();
    return data?.default_layout_id ?? null;
  });
}
