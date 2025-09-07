import { z } from "zod";

export const shortcutSchema = z.object({
	shortcutKey: z
		.string()
		.min(1, "Shortcut key is required")
		.regex(
			/^\/[a-zA-Z0-9_-]+$/,
			"Shortcut key must start with '/' and contain only letters, numbers, hyphens, and underscores",
		),
	content: z
		.string()
		.min(1, "Content is required")
		.max(10000, "Content must be less than 10,000 characters"),
	categoryId: z.string().uuid().optional().nullable(),
});

export const categorySchema = z.object({
	name: z
		.string()
		.min(1, "Category name is required")
		.max(100, "Category name must be less than 100 characters"),
});

export type ShortcutFormData = z.infer<typeof shortcutSchema>;
export type CategoryFormData = z.infer<typeof categorySchema>;
