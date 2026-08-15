"use client";

import { HoverTooltip } from "./HoverTooltip";

// Renders each word in its own truncatable inline-block so a single word
// too wide for the key gets its own ellipsis instead of splitting mid-word
// or overflowing past the key's edge uncontrolled.
function TruncatedWords({ text }: { text: string }) {
  return (
    <>
      {text.split(" ").map((word, i) => (
        <span key={i}>
          {i > 0 && " "}
          <span className="inline-block max-w-full overflow-hidden text-ellipsis whitespace-nowrap align-bottom">
            {word}
          </span>
        </span>
      ))}
    </>
  );
}

type KeyProps = {
  label: string;
  width: number;
  unit: number;
  description?: string[];

  candidateCount: number;

  onClick: () => void;
  isPressed: boolean;
  isInspectMode: boolean;
};

export function Key({
  label,
  width,
  unit,
  description,
  candidateCount,
  onClick,
  isPressed,
  isInspectMode,
}: KeyProps) {
  const isHighlighted =
    (!!description && !isInspectMode) || (candidateCount > 0 && isInspectMode);
  const labelFontSize = Math.min(12, Math.max(9, unit * 0.2));
  const descFontSize = Math.min(9.6, Math.max(7, unit * 0.16));

  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "relative flex items-center justify-center group",
        "rounded-md",
        "font-medium",
        "transition-[background-color,border-color] select-none flex-none",
        "outline-none focus-visible:border-teal-500 dark:focus-visible:border-teal-400",
        isPressed
          ? "border bg-teal-500 border-teal-500 text-white dark:bg-teal-600 dark:border-teal-600"
          : isHighlighted
            ? "border-2 bg-white border-teal-500 text-neutral-800 hover:bg-neutral-100 dark:bg-neutral-800 dark:border-teal-400 dark:text-neutral-200 dark:hover:bg-neutral-700"
            : "border bg-white border-neutral-300 text-neutral-800 hover:bg-neutral-100 dark:bg-neutral-800 dark:border-neutral-600 dark:text-neutral-200 dark:hover:bg-neutral-700",
      ].join(" ")}
      style={{
        width: width + "px",
        height: unit + "px",
      }}
    >
      <span
        className="absolute top-1 left-1.5 opacity-75"
        style={{ fontSize: labelFontSize }}
      >
        {label}
      </span>

      {isInspectMode && (
        <span className="absolute bottom-1 right-1 text-xs opacity-80">
          {candidateCount}
        </span>
      )}

      {!isInspectMode && description && (
        <>
          <span
            className="absolute left-1 right-1 top-1/2 origin-top leading-[1.35] text-center px-0.5 font-medium line-clamp-2"
            style={{ fontSize: descFontSize }}
          >
            {description.length > 1 ? (
              <>
                <span className="ml-1 opacity-75">+{description.length}</span>
              </>
            ) : (
              <TruncatedWords text={description[0]} />
            )}
          </span>

          <HoverTooltip>
            <ul className="list-disc list-inside">
              {description.length > 1 ? (
                <>
                  {description.map((item, i) => (
                    <li key={i}>{item}</li>
                  ))}
                </>
              ) : (
                description[0]
              )}
            </ul>
          </HoverTooltip>
        </>
      )}
    </button>
  );
}
