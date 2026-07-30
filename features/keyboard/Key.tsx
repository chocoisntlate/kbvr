"use client";

import { HoverTooltip } from "./HoverTooltip";

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
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "relative flex items-center justify-center group",
        "rounded-md border",
        "text-xs font-medium",
        "shadow-sm",
        "transition-all select-none flex-none",
        isPressed
          ? "bg-blue-500 border-blue-500 text-white shadow-inner"
          : "border-gray-300 text-gray-800 hover:bg-gray-100",
        description && !isInspectMode ? "ring ring-blue-500" : "",
        candidateCount > 0 && isInspectMode ? "ring ring-blue-500" : "",
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
          <span className="absolute left-1 right-1 top-1/2 origin-top text-[0.6rem] leading-tight text-center px-0.5 font-medium wrap-break-words line-clamp-2">
            {description.length > 1 ? (
              <>
                <span className="ml-1 opacity-75">+{description.length}</span>
              </>
            ) : (
              description[0]
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
