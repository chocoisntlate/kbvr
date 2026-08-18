import { cache } from "react";
import { getServerAuthContext } from "@/utils/supabase/server";
import { createPublicClient } from "@/utils/supabase/public";
import { isSupabaseConfigured } from "@/utils/supabase/config";
import { Diagram } from "@/features/spec/diagramSchema";
import { Layout } from "@/features/spec/layoutSchema";
import {
  DiagramPost,
  DiagramPostSummary,
  LayoutPost,
  LayoutPostSummary,
} from "./types";

type PostRow = {
  id: string;
  owner_id: string;
  owner_display_name: string | null;
  data: unknown;
  is_public: boolean;
  is_official: boolean;
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
  isOfficial: boolean;
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
    isOfficial: row.is_official,
    forkedFromId: row.forked_from_id,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

/*
 * List views (browse, library) only ever render name/description/counts, so
 * their queries select these generated columns instead of the full `data`
 * jsonb blob (see 0006_post_list_counts.sql).
 */
const LIST_COLUMNS = {
  diagrams:
    "id, owner_id, owner_display_name, name, description, shortcut_count, save_count, is_public, is_official, forked_from_id, created_at, updated_at",
  layouts:
    "id, owner_id, owner_display_name, name, description, row_count, key_count, save_count, is_public, is_official, forked_from_id, created_at, updated_at",
};

type DiagramListRow = {
  id: string;
  owner_id: string;
  owner_display_name: string | null;
  name: string;
  description: string | null;
  shortcut_count: number;
  save_count: number;
  is_public: boolean;
  is_official: boolean;
  forked_from_id: string | null;
  created_at: string;
  updated_at: string;
};

type LayoutListRow = {
  id: string;
  owner_id: string;
  owner_display_name: string | null;
  name: string;
  description: string | null;
  row_count: number;
  key_count: number;
  save_count: number;
  is_public: boolean;
  is_official: boolean;
  forked_from_id: string | null;
  created_at: string;
  updated_at: string;
};

function mapDiagramListRow(row: DiagramListRow): DiagramPostSummary {
  return {
    id: row.id,
    ownerId: row.owner_id,
    ownerDisplayName: row.owner_display_name,
    name: row.name,
    description: row.description,
    shortcutCount: row.shortcut_count,
    saveCount: row.save_count,
    isPublic: row.is_public,
    isOfficial: row.is_official,
    forkedFromId: row.forked_from_id,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function mapLayoutListRow(row: LayoutListRow): LayoutPostSummary {
  return {
    id: row.id,
    ownerId: row.owner_id,
    ownerDisplayName: row.owner_display_name,
    name: row.name,
    description: row.description,
    rowCount: row.row_count,
    keyCount: row.key_count,
    saveCount: row.save_count,
    isPublic: row.is_public,
    isOfficial: row.is_official,
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
  posts: (DiagramPostSummary | LayoutPostSummary)[];
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
      .select(LIST_COLUMNS[table])
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

    const hasMore = data.length > PAGE_SIZE;
    const rows = hasMore ? data.slice(0, PAGE_SIZE) : data;
    const posts = (
      type === "diagram"
        ? (rows as unknown as DiagramListRow[]).map(mapDiagramListRow)
        : (rows as unknown as LayoutListRow[]).map(mapLayoutListRow)
    ) as (DiagramPostSummary | LayoutPostSummary)[];
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

    // The saved-check only depends on `id` and `user.id`, not on the post
    // row, so it runs alongside the post fetch rather than after it.
    const [{ data, error }, saved] = await Promise.all([
      supabase.from("diagrams").select("*").eq("id", id).maybeSingle(),
      user
        ? supabase
            .from("saved_diagrams")
            .select("diagram_id")
            .eq("user_id", user.id)
            .eq("diagram_id", id)
            .maybeSingle()
        : null,
    ]);
    if (error) throw error;
    if (!data) return null;

    return {
      post: mapRow<Diagram>(data as PostRow),
      isSavedByMe: !!saved?.data,
    };
  });
});

export const getLayoutById = cache(async function getLayoutById(
  id: string,
): Promise<{ post: LayoutPost; isSavedByMe: boolean } | null> {
  return safely(null, async () => {
    const { supabase, user } = await getServerContext();

    const [{ data, error }, saved] = await Promise.all([
      supabase.from("layouts").select("*").eq("id", id).maybeSingle(),
      user
        ? supabase
            .from("saved_layouts")
            .select("layout_id")
            .eq("user_id", user.id)
            .eq("layout_id", id)
            .maybeSingle()
        : null,
    ]);
    if (error) throw error;
    if (!data) return null;

    return {
      post: mapRow<Layout>(data as PostRow),
      isSavedByMe: !!saved?.data,
    };
  });
});

export async function getDefaultLayout(): Promise<LayoutPost | null> {
  return safely(null, async () => {
    const { supabase, user } = await getServerContext();
    if (!user) return null;

    // One round trip: PostgREST resolves the embed through the
    // profiles.default_layout_id -> layouts.id foreign key.
    const { data, error } = await supabase
      .from("profiles")
      .select("layouts(*)")
      .eq("id", user.id)
      .maybeSingle();
    if (error) throw error;

    const layout = (data as { layouts: PostRow | null } | null)?.layouts;
    return layout ? mapRow<Layout>(layout) : null;
  });
}

// Full `data` is required here: app/account/page.tsx's export-everything
// feature round-trips these straight into a downloadable JSON file. Use
// getUserOwnedDiagramSummaries/getUserOwnedLayoutSummaries below for list
// views (library) that only render name/description/counts.
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

export async function getUserOwnedDiagramSummaries(): Promise<
  DiagramPostSummary[]
> {
  return safely([], async () => {
    const { supabase, user } = await getServerContext();
    if (!user) return [];

    const { data, error } = await supabase
      .from("diagrams")
      .select(LIST_COLUMNS.diagrams)
      .eq("owner_id", user.id)
      .order("updated_at", { ascending: false });
    if (error) throw error;
    return (data as unknown as DiagramListRow[]).map(mapDiagramListRow);
  });
}

export async function getUserOwnedLayoutSummaries(): Promise<
  LayoutPostSummary[]
> {
  return safely([], async () => {
    const { supabase, user } = await getServerContext();
    if (!user) return [];

    const { data, error } = await supabase
      .from("layouts")
      .select(LIST_COLUMNS.layouts)
      .eq("owner_id", user.id)
      .order("updated_at", { ascending: false });
    if (error) throw error;
    return (data as unknown as LayoutListRow[]).map(mapLayoutListRow);
  });
}

export async function getUserSavedDiagrams(): Promise<DiagramPostSummary[]> {
  return safely([], async () => {
    const { supabase, user } = await getServerContext();
    if (!user) return [];

    const { data, error } = await supabase
      .from("saved_diagrams")
      .select(`diagrams(${LIST_COLUMNS.diagrams})`)
      .eq("user_id", user.id);
    if (error) throw error;
    return (data as unknown as { diagrams: DiagramListRow }[])
      .filter((row) => row.diagrams)
      .map((row) => mapDiagramListRow(row.diagrams));
  });
}

export async function getUserSavedLayouts(): Promise<LayoutPostSummary[]> {
  return safely([], async () => {
    const { supabase, user } = await getServerContext();
    if (!user) return [];

    const { data, error } = await supabase
      .from("saved_layouts")
      .select(`layouts(${LIST_COLUMNS.layouts})`)
      .eq("user_id", user.id);
    if (error) throw error;
    return (data as unknown as { layouts: LayoutListRow }[])
      .filter((row) => row.layouts)
      .map((row) => mapLayoutListRow(row.layouts));
  });
}

/*
 * Callers that only need "which posts has this user saved?" as a set of ids
 * (browse cards, the profile page) use these instead of
 * getUserSavedDiagrams/getUserSavedLayouts, which embed the whole joined post
 * row only to have it thrown away.
 */
export async function getSavedDiagramIds(): Promise<string[]> {
  return safely([], async () => {
    const { supabase, user } = await getServerContext();
    if (!user) return [];

    const { data, error } = await supabase
      .from("saved_diagrams")
      .select("diagram_id")
      .eq("user_id", user.id);
    if (error) throw error;
    return (data as { diagram_id: string }[]).map((row) => row.diagram_id);
  });
}

export async function getSavedLayoutIds(): Promise<string[]> {
  return safely([], async () => {
    const { supabase, user } = await getServerContext();
    if (!user) return [];

    const { data, error } = await supabase
      .from("saved_layouts")
      .select("layout_id")
      .eq("user_id", user.id);
    if (error) throw error;
    return (data as { layout_id: string }[]).map((row) => row.layout_id);
  });
}

export type AccountStats = {
  ownedDiagrams: number;
  ownedLayouts: number;
  savedDiagrams: number;
  savedLayouts: number;
};

/*
 * `head: true` makes PostgREST return the count in a header and no rows at
 * all, so the account page's stats block costs four empty responses rather
 * than every owned post's full `data` jsonb.
 */
export async function getAccountStats(): Promise<AccountStats> {
  const empty: AccountStats = {
    ownedDiagrams: 0,
    ownedLayouts: 0,
    savedDiagrams: 0,
    savedLayouts: 0,
  };
  return safely(empty, async () => {
    const { supabase, user } = await getServerContext();
    if (!user) return empty;

    const countOf = (table: string, column: string) =>
      supabase
        .from(table)
        .select("*", { count: "exact", head: true })
        .eq(column, user.id);

    const [ownedDiagrams, ownedLayouts, savedDiagrams, savedLayouts] =
      await Promise.all([
        countOf("diagrams", "owner_id"),
        countOf("layouts", "owner_id"),
        countOf("saved_diagrams", "user_id"),
        countOf("saved_layouts", "user_id"),
      ]);

    return {
      ownedDiagrams: ownedDiagrams.count ?? 0,
      ownedLayouts: ownedLayouts.count ?? 0,
      savedDiagrams: savedDiagrams.count ?? 0,
      savedLayouts: savedLayouts.count ?? 0,
    };
  });
}

export async function getPublicPostsByDisplayName(
  displayName: string,
): Promise<{
  diagrams: DiagramPostSummary[];
  layouts: LayoutPostSummary[];
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
      .select(LIST_COLUMNS.diagrams)
      .eq("is_public", true)
      .order("created_at", { ascending: false });
    const layoutsQuery = supabase
      .from("layouts")
      .select(LIST_COLUMNS.layouts)
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
      diagrams: (diagrams as unknown as DiagramListRow[]).map(
        mapDiagramListRow,
      ),
      layouts: (layouts as unknown as LayoutListRow[]).map(mapLayoutListRow),
    };
  });
}

/*
 * Sitemap only. Uses the cookie-free public client so app/sitemap.ts stays
 * cacheable, and public_display_names() (0009_query_performance.sql) so the
 * dedupe happens in Postgres instead of transferring every public row.
 */
export async function getPublicDisplayNames(): Promise<string[]> {
  return safely([], async () => {
    const supabase = createPublicClient();
    const { data, error } = await supabase.rpc("public_display_names");
    if (error) throw error;
    return (data as string[]) ?? [];
  });
}

/*
 * Landing-page featured cards. One query for all ids, list columns only, on
 * the public client — the previous getDiagramById() per id pulled each post's
 * full `data` jsonb plus a saved-check the cards never read.
 */
export async function getDiagramSummariesByIds(
  ids: string[],
): Promise<DiagramPostSummary[]> {
  return safely([], async () => {
    if (ids.length === 0) return [];
    const supabase = createPublicClient();

    const { data, error } = await supabase
      .from("diagrams")
      .select(LIST_COLUMNS.diagrams)
      .in("id", ids);
    if (error) throw error;

    const byId = new Map(
      (data as unknown as DiagramListRow[]).map((row) => [row.id, row]),
    );
    // Preserve the caller's ordering; `.in()` does not guarantee it.
    return ids
      .map((id) => byId.get(id))
      .filter((row): row is DiagramListRow => !!row)
      .map(mapDiagramListRow);
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
