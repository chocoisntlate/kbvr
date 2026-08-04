import { Diagram } from "@/features/spec/diagramSchema";
import { Layout } from "@/features/spec/layoutSchema";

export type PostMeta = {
  id: string;
  ownerId: string;
  ownerDisplayName: string | null;
  isPublic: boolean;
  isSavedByMe: boolean;
  isOfficial: boolean;
};

export type DiagramPost = {
  id: string;
  ownerId: string;
  ownerDisplayName: string | null;
  data: Diagram;
  isPublic: boolean;
  isOfficial: boolean;
  forkedFromId: string | null;
  createdAt: string;
  updatedAt: string;
};

export type LayoutPost = {
  id: string;
  ownerId: string;
  ownerDisplayName: string | null;
  data: Layout;
  isPublic: boolean;
  isOfficial: boolean;
  forkedFromId: string | null;
  createdAt: string;
  updatedAt: string;
};

/*
 * Scalar-only counterparts to DiagramPost/LayoutPost, for list views (browse,
 * library) that only ever render name/description/counts and never need the
 * full validated Diagram/Layout `data` blob.
 */
export type DiagramPostSummary = {
  id: string;
  ownerId: string;
  ownerDisplayName: string | null;
  name: string;
  description: string | null;
  shortcutCount: number;
  saveCount: number;
  isPublic: boolean;
  isOfficial: boolean;
  forkedFromId: string | null;
  createdAt: string;
  updatedAt: string;
};

export type LayoutPostSummary = {
  id: string;
  ownerId: string;
  ownerDisplayName: string | null;
  name: string;
  description: string | null;
  rowCount: number;
  keyCount: number;
  saveCount: number;
  isPublic: boolean;
  isOfficial: boolean;
  forkedFromId: string | null;
  createdAt: string;
  updatedAt: string;
};
