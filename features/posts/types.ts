import { Diagram } from "@/features/spec/diagramSchema";
import { Layout } from "@/features/spec/layoutSchema";

export type PostMeta = {
  id: string;
  ownerId: string;
  ownerDisplayName: string | null;
  isPublic: boolean;
  isSavedByMe: boolean;
};

export type DiagramPost = {
  id: string;
  ownerId: string;
  ownerDisplayName: string | null;
  data: Diagram;
  isPublic: boolean;
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
  forkedFromId: string | null;
  createdAt: string;
  updatedAt: string;
};
