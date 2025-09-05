import Dexie, { type Table } from "dexie";

// Database interfaces
export interface Shortcut {
  id: string;
  userId: string;
  categoryId?: string | null;
  shortcutKey: string;
  content: string;
  lastModifiedAt: Date;
  isSynced: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Category {
  id: string;
  userId: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

export class CutFastDatabase extends Dexie {
  shortcuts!: Table<Shortcut>;
  categories!: Table<Category>;

  constructor() {
    super("CutFastDB");

    this.version(1).stores({
      shortcuts: "&id, userId, categoryId, shortcutKey, lastModifiedAt, isSynced, createdAt, updatedAt",
      categories: "&id, userId, name, createdAt, updatedAt",
    });
  }

  async initialize() {
    try {
      console.log("Initializing CutFast Dexie database...");
      // Dexie opens automatically when first accessed, but we can explicitly open if needed
      if (!this.isOpen()) {
        await this.open();
      }
      console.log("CutFast database initialized successfully");
    } catch (error) {
      console.error("Failed to initialize database:", error);
      throw error;
    }
  }

  // Service worker specific method to ensure database is accessible
  async ensureOpen(): Promise<void> {
    try {
      if (!this.isOpen()) {
        console.log("Service worker: Database not open, reopening...");
        await this.open();
        console.log("Service worker: Database reopened successfully");
      }
    } catch (error) {
      console.error("Service worker: Failed to ensure database is open:", error);
      throw error;
    }
  }

  async getShortcut(key: string): Promise<Shortcut | null> {
    try {
      // In service worker context, we need to ensure database is accessible
      // Service workers can be terminated and restarted, so we need to reopen if needed
      if (!this.isOpen()) {
        console.log("Database not open, reopening...");
        await this.open();
      }

      const shortcut = await this.shortcuts
        .where("shortcutKey")
        .equals(key)
        .first();

      return shortcut || null;
    } catch (error) {
      console.error("Failed to get shortcut:", error);
      // In service worker, database might need to be reinitialized
      throw new Error("Database not initialized");
    }
  }

  async getAllShortcuts(): Promise<{ id: string; shortcut_key: string; content: string; category_name: string }[]> {
    try {
      const shortcuts = await this.shortcuts
        .orderBy("lastModifiedAt")
        .reverse()
        .toArray();

      // Get categories for lookup
      const categories = await this.categories.toArray();
      const categoryMap = new Map(categories.map(c => [c.id, c.name]));

      return shortcuts.map(shortcut => ({
        id: shortcut.id,
        shortcut_key: shortcut.shortcutKey,
        content: shortcut.content,
        category_name: shortcut.categoryId ? categoryMap.get(shortcut.categoryId) || "" : "",
      }));
    } catch (error) {
      console.error("Failed to get shortcuts:", error);
      return [];
    }
  }

  async getCategories(): Promise<Category[]> {
    try {
      return await this.categories.orderBy("name").toArray();
    } catch (error) {
      console.error("Failed to get categories:", error);
      return [];
    }
  }

  async createShortcut(data: {
    shortcut_key: string;
    content: string;
    category_id?: string;
  }): Promise<Shortcut> {
    try {
      const now = new Date();
      const shortcut: Shortcut = {
        id: crypto.randomUUID(),
        userId: "user-1", // TODO: Get from auth context
        categoryId: data.category_id || null,
        shortcutKey: data.shortcut_key,
        content: data.content,
        lastModifiedAt: now,
        isSynced: false,
        createdAt: now,
        updatedAt: now,
      };

      await this.shortcuts.add(shortcut);
      return shortcut;
    } catch (error) {
      console.error("Failed to create shortcut:", error);
      throw error;
    }
  }

  async updateShortcut(
    id: string,
    data: Partial<{
      shortcut_key: string;
      content: string;
      category_id?: string;
    }>
  ): Promise<Shortcut | null> {
    try {
      const updateData: Partial<Shortcut> = {
        updatedAt: new Date(),
        lastModifiedAt: new Date(),
      };

      if (data.shortcut_key !== undefined) {
        updateData.shortcutKey = data.shortcut_key;
      }
      if (data.content !== undefined) {
        updateData.content = data.content;
      }
      if (data.category_id !== undefined) {
        updateData.categoryId = data.category_id;
      }

      await this.shortcuts.update(id, updateData);

      // Return updated shortcut
      return await this.shortcuts.get(id) || null;
    } catch (error) {
      console.error("Failed to update shortcut:", error);
      throw error;
    }
  }

  async deleteShortcut(id: string): Promise<void> {
    try {
      await this.shortcuts.delete(id);
    } catch (error) {
      console.error("Failed to delete shortcut:", error);
      throw error;
    }
  }

  // Bulk upsert shortcuts from backend sync
  async bulkUpsertShortcuts(items: ReadonlyArray<{
    id: string;
    userId: string;
    shortcutKey: string;
    content: string;
    categoryId?: string | null;
  }>): Promise<number> {
    let upserted = 0;

    try {
      await this.transaction('rw', this.shortcuts, async () => {
        for (const item of items) {
          const existing = await this.shortcuts.get(item.id);

          if (existing) {
            // Update existing
            await this.shortcuts.update(item.id, {
              shortcutKey: item.shortcutKey,
              content: item.content,
              categoryId: item.categoryId ?? null,
              isSynced: true,
              updatedAt: new Date(),
              lastModifiedAt: new Date(),
            });
          } else {
            // Create new
            await this.shortcuts.add({
              id: item.id,
              userId: item.userId,
              categoryId: item.categoryId ?? null,
              shortcutKey: item.shortcutKey,
              content: item.content,
              lastModifiedAt: new Date(),
              isSynced: true,
              createdAt: new Date(),
              updatedAt: new Date(),
            });
          }
          upserted++;
        }
      });
    } catch (error) {
      console.error("Failed to bulk upsert shortcuts:", error);
    }

    return upserted;
  }

  async close() {
    this.close();
    console.log("Database closed");
  }

  get isReady(): boolean {
    return this.isOpen();
  }
}

// Export singleton instance
export const cutfastDb = new CutFastDatabase();
