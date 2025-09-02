export interface Category {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
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
  createdAt: string;
  updatedAt: string;
}

export interface User {
  id: string;
  name?: string;
  email: string;
}
