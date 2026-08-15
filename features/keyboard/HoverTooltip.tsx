"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

const MARGIN = 8;
const OFFSET = 8;

// Portalled to the body and position:fixed on purpose: an absolutely positioned
// tooltip stays inside the keyboard's overflow-x-auto scroll container and
// widens its scrollable area even while invisible, which produced a stray
// horizontal scrollbar for keys near the right edge.
export function HoverTooltip({ children }: { children: React.ReactNode }) {
  const anchorRef = useRef<HTMLSpanElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const trigger = anchorRef.current?.parentElement;
    if (!trigger) return;

    const open = () => setIsOpen(true);
    const close = () => setIsOpen(false);

    trigger.addEventListener("mouseenter", open);
    trigger.addEventListener("mouseleave", close);
    trigger.addEventListener("focusin", open);
    trigger.addEventListener("focusout", close);
    return () => {
      trigger.removeEventListener("mouseenter", open);
      trigger.removeEventListener("mouseleave", close);
      trigger.removeEventListener("focusin", open);
      trigger.removeEventListener("focusout", close);
    };
  }, []);

  // written straight to the node rather than held in state: the tooltip has to
  // be laid out before it can be measured, so a state round-trip would render
  // it once at the wrong spot
  useEffect(() => {
    const trigger = anchorRef.current?.parentElement;
    const tooltip = tooltipRef.current;
    if (!isOpen || !trigger || !tooltip) return;

    const triggerRect = trigger.getBoundingClientRect();
    const { width, height } = tooltip.getBoundingClientRect();

    const left = Math.min(
      Math.max(MARGIN, triggerRect.left + (triggerRect.width - width) / 2),
      window.innerWidth - width - MARGIN,
    );
    const above = triggerRect.top - height - OFFSET;
    const top = above < MARGIN ? triggerRect.bottom + OFFSET : above;

    tooltip.style.left = `${left}px`;
    tooltip.style.top = `${top}px`;
    tooltip.style.visibility = "visible";
  }, [isOpen, children]);

  return (
    <>
      <span ref={anchorRef} className="hidden" aria-hidden />
      {isOpen &&
        createPortal(
          <div
            ref={tooltipRef}
            role="tooltip"
            className="fixed z-50 w-max max-w-64 rounded bg-neutral-900 px-2 py-1 text-xs text-white pointer-events-none dark:bg-neutral-700"
            style={{ top: 0, left: 0, visibility: "hidden" }}
          >
            {children}
          </div>,
          document.body,
        )}
    </>
  );
}
