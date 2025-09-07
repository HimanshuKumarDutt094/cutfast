// ElectricSQL schema definition for CutFast
// This defines the database schema that will be used with ElectricSQL

export const schema = {
	shortcuts: {
		id: "text",
		user_id: "text",
		category_id: "text",
		shortcut_key: "text",
		content: "text",
		last_modified_at: "text",
		is_synced: "boolean",
		created_at: "text",
		updated_at: "text",
	},
	categories: {
		id: "text",
		user_id: "text",
		name: "text",
		created_at: "text",
		updated_at: "text",
	},
	users: {
		id: "text",
		email: "text",
		name: "text",
		created_at: "text",
		updated_at: "text",
	},
} as const;

// Type definitions for the schema
export type Shortcut = {
	id: string;
	user_id: string;
	category_id?: string;
	shortcut_key: string;
	content: string;
	last_modified_at: string;
	is_synced: boolean;
	created_at: string;
	updated_at: string;
};

export type Category = {
	id: string;
	user_id: string;
	name: string;
	created_at: string;
	updated_at: string;
};

export type User = {
	id: string;
	email: string;
	name?: string;
	created_at: string;
	updated_at: string;
};
