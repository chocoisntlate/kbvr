import { z } from "zod";

export const KeySchema = z
  .object({
    id: z
      .string()
      .min(1, "Key ID cannot be empty")
      .max(50, "Key ID too long")
      .nullable(),
    label: z.string().max(20, "Key label too long"),
    widthScale: z.number().positive().optional(),
  })
  // Spacer keys (id: null) render no label, so only real keys require one.
  .refine((key) => key.id === null || key.label.length > 0, {
    message: "Key label cannot be empty",
    path: ["label"],
  });

export const RowSchema = z
  .array(KeySchema)
  .min(1, "A row must have at least one key");

export const LayoutSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(2000).optional(),
  rows: z.array(RowSchema).min(1, "Layout must have at least one row"),
});

export type Layout = z.infer<typeof LayoutSchema>;
