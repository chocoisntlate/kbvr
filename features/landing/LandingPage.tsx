import { Suspense } from "react";
import Link from "next/link";
import { FeaturedDiagrams } from "@/features/landing/FeaturedDiagrams";

const primaryButtonClasses =
  "inline-block rounded-md border border-teal-300 bg-teal-50 px-5 py-2.5 text-sm font-medium text-teal-700 transition-colors hover:bg-teal-100 dark:border-teal-800 dark:bg-teal-950/40 dark:text-teal-300 dark:hover:bg-teal-950/60";

const secondaryButtonClasses =
  "inline-block rounded-md border border-neutral-300 bg-white px-5 py-2.5 text-sm font-medium text-neutral-700 transition-colors hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-200 dark:hover:bg-neutral-700";

export function LandingPage() {
  return (
    <>
      <section className="bg-teal-50 dark:bg-teal-950/40">
        <div className="mx-auto flex max-w-3xl flex-col items-center gap-4 px-4 py-16 text-center">
          <h1 className="text-3xl font-semibold text-neutral-900 dark:text-neutral-100">
            An Interactive{" "}
            <span className="text-teal-600 dark:text-teal-400">K</span>ey
            <span className="text-teal-600 dark:text-teal-400">b</span>ind{" "}
            <span className="text-teal-600 dark:text-teal-400">V</span>iewe
            <span className="text-teal-600 dark:text-teal-400">r</span>
          </h1>
          <p className="max-w-xl text-sm text-neutral-600 dark:text-neutral-400">
            View and build a visual reference for your keybinds.
          </p>
          <div className="mt-2 flex flex-wrap items-center justify-center gap-3">
            <Link href="/editor" className={primaryButtonClasses}>
              Intro Diagram
            </Link>
            <Link href="/editor?new=1" className={primaryButtonClasses}>
              Empty Diagram
            </Link>
            <Link href="/browse" className={secondaryButtonClasses}>
              Browse
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-4 my-10">
        <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
          Terminology
        </h2>
        <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400">
          <b>Diagrams</b> define a collection of keyboard shortcuts. It is
          simply a JSON file that can be imported and exported.
        </p>
        <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400">
          <b>Layouts</b> define a physical structure of the keyboard as keys
          arranged in rows. Also just a JSON file.
        </p>
      </section>

      <section className="mx-auto max-w-3xl px-4 my-10">
        <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
          Why?
        </h2>
        <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400">
          The main reason is that I wanted a cooler reference for shortcuts that
          I could refer to, something I could fully customise and change however
          I wanted. Another reason is that when I want to change default
          shortcuts for an application, I want some kind of visual to see which
          keys are taken, how most keys are used, etc. It gives me a good idea
          and helps me decide.
        </p>
      </section>

      <section className="mx-auto max-w-3xl px-4 my-10">
        <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
          Featured Diagrams
        </h2>
        <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
          Diagrams from the community
        </p>
        <Suspense
          fallback={
            <p className="mt-4 text-sm text-neutral-500 dark:text-neutral-400">
              Loading…
            </p>
          }
        >
          <FeaturedDiagrams />
        </Suspense>
      </section>
    </>
  );
}
