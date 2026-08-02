"use server";

import {
  searchPosts,
  getUserOwnedDiagrams,
  getUserOwnedLayouts,
  getUserSavedDiagrams,
  getUserSavedLayouts,
  getUserDefaultLayoutId,
  getSeedDefaultLayoutId,
  type SearchPostsResult,
} from "./queries";
import { DiagramPost, LayoutPost } from "./types";

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
  const [savedLayouts, defaultLayoutId] = await Promise.all([
    getUserSavedLayouts(),
    getUserDefaultLayoutId(),
  ]);
  return { savedLayoutIds: savedLayouts.map((l) => l.id), defaultLayoutId };
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
  diagrams: { post: DiagramPost; isOwned: boolean }[];
  layouts: { post: LayoutPost; isOwned: boolean }[];
  defaultLayoutId: string | null;
  seedDefaultLayoutId: string | null;
};

export async function getLibraryDataAction(): Promise<LibraryData> {
  const [
    ownedDiagrams,
    ownedLayouts,
    savedDiagrams,
    savedLayouts,
    defaultLayoutId,
    seedDefaultLayoutId,
  ] = await Promise.all([
    getUserOwnedDiagrams(),
    getUserOwnedLayouts(),
    getUserSavedDiagrams(),
    getUserSavedLayouts(),
    getUserDefaultLayoutId(),
    getSeedDefaultLayoutId(),
  ]);
  return {
    diagrams: dedupeById(ownedDiagrams, savedDiagrams),
    layouts: dedupeById(ownedLayouts, savedLayouts),
    defaultLayoutId,
    seedDefaultLayoutId,
  };
}
