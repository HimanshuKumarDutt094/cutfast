import { z } from "zod";

// Schema for shortcut data
export const ShortcutSchema = z.object({
	id: z.string().uuid(),
	user_id: z.string(),
	category_id: z.string().uuid().optional(),
	shortcut_key: z
		.string()
		.min(1, "Shortcut key is required")
		.max(50, "Shortcut key too long"),
	content: z
		.string()
		.min(1, "Content is required")
		.max(10000, "Content too long"),
	last_modified_at: z.string(),
	is_synced: z.boolean().default(false),
	created_at: z.string(),
	updated_at: z.string(),
});

// Schema for category data
export const CategorySchema = z.object({
	id: z.string().uuid(),
	user_id: z.string(),
	name: z
		.string()
		.min(1, "Category name is required")
		.max(100, "Category name too long"),
	created_at: z.string(),
	updated_at: z.string(),
});

// Schema for user data
export const UserSchema = z.object({
	id: z.string().uuid(),
	email: z.string().email("Invalid email address"),
	name: z.string().optional(),
	created_at: z.string(),
	updated_at: z.string(),
});

// Schema for creating a new shortcut
export const CreateShortcutSchema = z.object({
	shortcut_key: z
		.string()
		.min(1, "Shortcut key is required")
		.max(50, "Shortcut key too long"),
	content: z
		.string()
		.min(1, "Content is required")
		.max(10000, "Content too long"),
	category_id: z.string().uuid().optional(),
});

// Schema for updating a shortcut
export const UpdateShortcutSchema = z.object({
	shortcut_key: z.string().min(1).max(50).optional(),
	content: z.string().min(1).max(10000).optional(),
	category_id: z.string().uuid().optional(),
});

// Schema for creating a new category
export const CreateCategorySchema = z.object({
	name: z
		.string()
		.min(1, "Category name is required")
		.max(100, "Category name too long"),
});

// Schema for updating a category
export const UpdateCategorySchema = z.object({
	name: z.string().min(1).max(100).optional(),
});

// Schema for authentication tokens
export const AuthTokensSchema = z.object({
	accessToken: z.string().min(1, "Access token is required"),
	refreshToken: z.string().min(1, "Refresh token is required"),
});

// Schema for API responses
export const ApiResponseSchema = z.object({
	success: z.boolean(),
	data: z.any().optional(),
	error: z.string().optional(),
});

// Type exports
export type Shortcut = z.infer<typeof ShortcutSchema>;
export type Category = z.infer<typeof CategorySchema>;
export type User = z.infer<typeof UserSchema>;
export type CreateShortcut = z.infer<typeof CreateShortcutSchema>;
export type UpdateShortcut = z.infer<typeof UpdateShortcutSchema>;
export type CreateCategory = z.infer<typeof CreateCategorySchema>;
export type UpdateCategory = z.infer<typeof UpdateCategorySchema>;
export type AuthTokens = z.infer<typeof AuthTokensSchema>;
export type ApiResponse = z.infer<typeof ApiResponseSchema>;

// Validation helper functions
export function validateShortcut(data: unknown): Shortcut {
	return ShortcutSchema.parse(data);
}

export function validateCategory(data: unknown): Category {
	return CategorySchema.parse(data);
}

export function validateCreateShortcut(data: unknown): CreateShortcut {
	return CreateShortcutSchema.parse(data);
}

export function validateUpdateShortcut(data: unknown): UpdateShortcut {
	return UpdateShortcutSchema.parse(data);
}

export function validateCreateCategory(data: unknown): CreateCategory {
	return CreateCategorySchema.parse(data);
}

export function validateUpdateCategory(data: unknown): UpdateCategory {
	return UpdateCategorySchema.parse(data);
}

export function validateAuthTokens(data: unknown): AuthTokens {
	return AuthTokensSchema.parse(data);
}

// Safe validation functions that return null on error
export function safeValidateShortcut(data: unknown): Shortcut | null {
	try {
		return ShortcutSchema.parse(data);
	} catch {
		return null;
	}
}

export function safeValidateCategory(data: unknown): Category | null {
	try {
		return CategorySchema.parse(data);
	} catch {
		return null;
	}
}

export function safeValidateCreateShortcut(
	data: unknown,
): CreateShortcut | null {
	try {
		return CreateShortcutSchema.parse(data);
	} catch {
		return null;
	}
}

export function safeValidateUpdateShortcut(
	data: unknown,
): UpdateShortcut | null {
	try {
		return UpdateShortcutSchema.parse(data);
	} catch {
		return null;
	}
}
