import * as z from "zod";

const RESERVED_DISPLAY_NAMES = new Set(["key-diagram"]);

export const DisplayNameSchema = z
  .string()
  .trim()
  .min(1, "Display name cannot be empty")
  .max(30, "Display name is too long")
  .refine((name) => !RESERVED_DISPLAY_NAMES.has(name.toLowerCase()), {
    message: "That display name is reserved",
  });
