import * as z from "zod";

export const ShortcutSchema = z.object({
  keys: z.array(z.string().min(1).max(50)).min(1).max(5),
  description: z.array(z.string().min(1).max(150)).min(1).max(10), // For conflicting keybinds

  tags: z.array(z.string().max(100).optional()).optional(),
  mode: z.string().optional(),
});

export const DiagramSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  createdBy: z.string().max(100).optional(),

  shortcuts: z.array(ShortcutSchema).min(1),
});

export type Diagram = z.infer<typeof DiagramSchema>;
export type Shortcut = Diagram["shortcuts"][number];
