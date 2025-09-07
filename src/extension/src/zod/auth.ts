import { z } from "zod";

// Shared secure password schema
const securePassword = z
	.string()
	.min(8, "Password must be at least 8 characters")
	.max(128, "Password must be at most 128 characters")
	.regex(/[a-z]/, "Password must contain at least one lowercase letter")
	.regex(/[A-Z]/, "Password must contain at least one uppercase letter")
	.regex(/[0-9]/, "Password must contain at least one number")
	.regex(
		/[^A-Za-z0-9]/,
		"Password must contain at least one special character",
	);

export const loginSchema = z.object({
	email: z.email("Please enter a valid email address"),
	password: securePassword,
});

export type LoginFormData = z.infer<typeof loginSchema>;

// Signup schema for creating a new account
export const signupSchema = z.object({
	name: z
		.string()
		.min(1, "Name is required")
		.max(100, "Name must be at most 100 characters"),
	email: z.email("Please enter a valid email address"),
	password: securePassword,
});

export type SignupFormData = z.infer<typeof signupSchema>;
