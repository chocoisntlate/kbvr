import { Suspense } from "react";
import ButtonsBar from "@/features/display/ButtonsBar";
import { KeyboardPanel } from "@/features/display/InfoDisplay";
import SpecEditor from "@/features/display/SpecEditor";
import { Keyboard } from "@/features/keyboard/Keyboard";
import { KeyboardContextProvider } from "@/features/keyboard/KeyboardContext";
import SearchBar from "@/features/search/SearchBar";
import { getDiagramById, getDefaultLayout } from "@/features/posts/queries";
import { ensureDefaultLayoutSeeded } from "@/features/posts/actions";
import { PostMeta } from "@/features/posts/types";
import { Diagram } from "@/features/spec/diagramSchema";
import { Layout } from "@/features/spec/layoutSchema";

export default function Home({
  searchParams,
}: {
  searchParams: Promise<{ diagram?: string }>;
}) {
  return (
    <main className="overflow-hidden p-2 flex flex-col items-center gap-4 my-4">
      <Suspense fallback={<p className="text-sm text-gray-500">Loading…</p>}>
        <HomeContent searchParams={searchParams} />
      </Suspense>
    </main>
  );
}

async function HomeContent({
  searchParams,
}: {
  searchParams: Promise<{ diagram?: string }>;
}) {
  const { diagram: diagramId } = await searchParams;

  await ensureDefaultLayoutSeeded();

  let initialDiagram: Diagram | undefined;
  let initialDiagramMeta: PostMeta | null | undefined;

  if (diagramId) {
    const result = await getDiagramById(diagramId);
    if (result) {
      initialDiagram = result.post.data;
      initialDiagramMeta = {
        id: result.post.id,
        ownerId: result.post.ownerId,
        ownerDisplayName: result.post.ownerDisplayName,
        isPublic: result.post.isPublic,
        isSavedByMe: result.isSavedByMe,
      };
    }
  }

  let initialLayout: Layout | undefined;
  let initialLayoutMeta: PostMeta | null | undefined;

  const defaultLayout = await getDefaultLayout();
  if (defaultLayout) {
    initialLayout = defaultLayout.data;
    initialLayoutMeta = {
      id: defaultLayout.id,
      ownerId: defaultLayout.ownerId,
      ownerDisplayName: defaultLayout.ownerDisplayName,
      isPublic: defaultLayout.isPublic,
      isSavedByMe: true,
    };
  }

  return (
    <KeyboardContextProvider
      initialDiagram={initialDiagram}
      initialDiagramMeta={initialDiagramMeta}
      initialLayout={initialLayout}
      initialLayoutMeta={initialLayoutMeta}
    >
      <KeyboardPanel />
      <div>
        <ButtonsBar />
        <div className="flex items-stretch gap-4">
          <Keyboard />
          <SearchBar />
        </div>
        <SpecEditor />
      </div>
    </KeyboardContextProvider>
  );
}