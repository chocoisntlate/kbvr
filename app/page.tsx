import type { Metadata } from "next";
import { LandingPage } from "@/features/landing/LandingPage";

export const metadata: Metadata = {
  title: "kbvr",
};

// Featured diagrams are public and identical for every visitor, and
// getDiagramSummariesByIds uses the cookie-free public client, so this page
// renders statically and revalidates hourly. Mutations already call
// revalidatePath("/") (features/posts/actions.ts), so it stays current.
export const revalidate = 3600;

export default function Page() {
  return <LandingPage />;
}
