"use server";

import {
  searchPosts,
  getUserOwnedDiagrams,
  getUserOwnedLayouts,
  getUserOwnedDiagramSummaries,
  getUserOwnedLayoutSummaries,
  getUserSavedDiagrams,
  getUserSavedLayouts,
  getSavedDiagramIds,
  getSavedLayoutIds,
  getUserDefaultLayoutId,
  type SearchPostsResult,
} from "./queries";
import { DiagramPostSummary, LayoutPostSummary } from "./types";
import type { Diagram } from "@/features/spec/diagramSchema";
import type { Layout } from "@/features/spec/layoutSchema";

export async function searchPostsAction(
  type: "diagram" | "layout",
  query: string,
  page: number,
): Promise<SearchPostsResult> {
  return searchPosts(type, query, page);
}

export async function getBrowseLayoutFlagsAction(): Promise<{
  savedLayoutIds: string[];
  defaultLayoutId: string | null;
}> {
  const [savedLayoutIds, defaultLayoutId] = await Promise.all([
    getSavedLayoutIds(),
    getUserDefaultLayoutId(),
  ]);
  return { savedLayoutIds, defaultLayoutId };
}

export async function getBrowseDiagramFlagsAction(): Promise<{
  savedDiagramIds: string[];
}> {
  return { savedDiagramIds: await getSavedDiagramIds() };
}

function dedupeById<T extends { id: string }>(
  owned: T[],
  saved: T[],
): { post: T; isOwned: boolean }[] {
  const map = new Map<string, { post: T; isOwned: boolean }>();
  for (const post of owned) map.set(post.id, { post, isOwned: true });
  for (const post of saved) {
    if (!map.has(post.id)) map.set(post.id, { post, isOwned: false });
  }
  return Array.from(map.values());
}

export type LibraryData = {
  diagrams: { post: DiagramPostSummary; isOwned: boolean }[];
  layouts: { post: LayoutPostSummary; isOwned: boolean }[];
  defaultLayoutId: string | null;
};

export async function getLibraryDataAction(): Promise<LibraryData> {
  const [
    ownedDiagrams,
    ownedLayouts,
    savedDiagrams,
    savedLayouts,
    defaultLayoutId,
  ] = await Promise.all([
    getUserOwnedDiagramSummaries(),
    getUserOwnedLayoutSummaries(),
    getUserSavedDiagrams(),
    getUserSavedLayouts(),
    getUserDefaultLayoutId(),
  ]);
  return {
    diagrams: dedupeById(ownedDiagrams, savedDiagrams),
    layouts: dedupeById(ownedLayouts, savedLayouts),
    defaultLayoutId,
  };
}

/*
 * The only caller that needs every owned post's full `data` jsonb. Invoked
 * from ExportDataButton on click, so /account doesn't pay for it on render.
 */
export async function getExportBundleAction(): Promise<{
  diagrams: Diagram[];
  layouts: Layout[];
}> {
  const [diagrams, layouts] = await Promise.all([
    getUserOwnedDiagrams(),
    getUserOwnedLayouts(),
  ]);
  return {
    diagrams: diagrams.map((d) => d.data),
    layouts: layouts.map((l) => l.data),
  };
}
