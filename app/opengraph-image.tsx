import { ImageResponse } from "next/og";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "kbvr — keyboard shortcut diagrams and layouts";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 32,
          backgroundColor: "#171717",
        }}
      >
        <div
          style={{
            width: 220,
            height: 220,
            borderRadius: 48,
            backgroundColor: "#14b8a6",
          }}
        />
        <div style={{ color: "#fafafa", fontSize: 96, fontWeight: 600 }}>
          kbvr
        </div>
      </div>
    ),
    { ...size },
  );
}
