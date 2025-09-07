export interface Category {
	id: string;
	name: string;
	createdAt: Date;
	updatedAt: Date;
	_count?: {
		shortcuts: number;
	};
}

export interface Shortcut {
	id: string;
	shortcutKey: string;
	content: string;
	categoryId: string | null;
	category?: Category;
	createdAt: Date;
	updatedAt: Date;
}

export interface User {
	id: string;
	name?: string;
	email: string;
}
