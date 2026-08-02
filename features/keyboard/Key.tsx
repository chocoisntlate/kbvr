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

  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "relative flex items-center justify-center group",
        "rounded-md",
        "text-xs font-medium",
        "shadow-sm",
        "transition-colors select-none flex-none",
        "outline-none focus-visible:border-teal-500 dark:focus-visible:border-teal-400",
        isPressed
          ? "border bg-teal-500 border-teal-500 text-white shadow-inner dark:bg-teal-600 dark:border-teal-600"
          : isHighlighted
            ? "border-2 bg-white border-teal-500 text-neutral-800 hover:bg-neutral-100 dark:bg-neutral-800 dark:border-teal-400 dark:text-neutral-200 dark:hover:bg-neutral-700"
            : "border bg-white border-neutral-300 text-neutral-800 hover:bg-neutral-100 dark:bg-neutral-800 dark:border-neutral-600 dark:text-neutral-200 dark:hover:bg-neutral-700",
      ].join(" ")}
      style={{
        width: width + "px",
        height: unit + "px",
      }}
    >
      <span className="absolute top-1 left-1.5 text-xs opacity-75">
        {label}
      </span>

      {isInspectMode && (
        <span className="absolute bottom-1 right-1 text-xs opacity-80">
          {candidateCount}
        </span>
      )}

      {!isInspectMode && description && (
        <>
          <span className="absolute left-1 right-1 top-1/2 origin-top text-[0.6rem] leading-tight text-center px-0.5 font-medium line-clamp-2">
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
