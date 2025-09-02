import { PGlite } from '@electric-sql/pglite';
import { electrify } from 'electric-sql/pglite';

// Database schema for CutFast shortcuts
export const databaseSchema = `
  -- Users table (for local reference)
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    name TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP
  );

  -- Categories table
  CREATE TABLE IF NOT EXISTS categories (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    name TEXT NOT NULL,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  );

  -- Shortcuts table
  CREATE TABLE IF NOT EXISTS shortcuts (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    category_id TEXT,
    shortcut_key TEXT NOT NULL,
    content TEXT NOT NULL,
    last_modified_at TEXT DEFAULT CURRENT_TIMESTAMP,
    is_synced BOOLEAN DEFAULT FALSE,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL,
    UNIQUE(user_id, shortcut_key)
  );

  -- Create indexes for better performance
  CREATE INDEX IF NOT EXISTS idx_categories_user_id ON categories(user_id);
  CREATE INDEX IF NOT EXISTS idx_shortcuts_user_id ON shortcuts(user_id);
  CREATE INDEX IF NOT EXISTS idx_shortcuts_category_id ON shortcuts(category_id);
  CREATE INDEX IF NOT EXISTS idx_shortcuts_key ON shortcuts(shortcut_key);
`;

export class CutFastDatabase {
  private db: PGlite | null = null;
  private electric: any = null;
  private isInitialized = false;

  async initialize() {
    if (this.isInitialized) return;

    try {
      console.log('Initializing CutFast database...');

      // Initialize PGlite with IndexedDB storage
      this.db = new PGlite('idb://cutfast-db', {
        relaxedDurability: true, // Improve responsiveness
      });

      // Execute schema
      await this.db.exec(databaseSchema);

      // Initialize ElectricSQL client
      this.electric = await electrify(this.db, {
        url: 'http://localhost:3000/v1/shape', // Authorizing proxy URL
      });

      this.isInitialized = true;
      console.log('CutFast database initialized successfully');
    } catch (error) {
      console.error('Failed to initialize database:', error);
      throw error;
    }
  }

  async getShortcut(key: string): Promise<any | null> {
    if (!this.db) throw new Error('Database not initialized');

    try {
      const result = await this.db.query(
        'SELECT * FROM shortcuts WHERE shortcut_key = $1 LIMIT 1',
        [key]
      );

      return result.rows[0] || null;
    } catch (error) {
      console.error('Failed to get shortcut:', error);
      return null;
    }
  }

  async getAllShortcuts(): Promise<any[]> {
    if (!this.db) throw new Error('Database not initialized');

    try {
      const result = await this.db.query(
        'SELECT s.*, c.name as category_name FROM shortcuts s LEFT JOIN categories c ON s.category_id = c.id ORDER BY s.last_modified_at DESC'
      );

      return result.rows;
    } catch (error) {
      console.error('Failed to get shortcuts:', error);
      return [];
    }
  }

  async getCategories(): Promise<any[]> {
    if (!this.db) throw new Error('Database not initialized');

    try {
      const result = await this.db.query(
        'SELECT * FROM categories ORDER BY name'
      );

      return result.rows;
    } catch (error) {
      console.error('Failed to get categories:', error);
      return [];
    }
  }

  async createShortcut(data: { shortcut_key: string; content: string; category_id?: string }): Promise<any> {
    if (!this.db) throw new Error('Database not initialized');

    try {
      const result = await this.db.query(
        'INSERT INTO shortcuts (id, user_id, shortcut_key, content, category_id) VALUES (gen_random_uuid(), $1, $2, $3, $4) RETURNING *',
        ['user-1', data.shortcut_key, data.content, data.category_id || null]
      );

      return result.rows[0];
    } catch (error) {
      console.error('Failed to create shortcut:', error);
      throw error;
    }
  }

  async updateShortcut(id: string, data: Partial<{ shortcut_key: string; content: string; category_id?: string }>): Promise<any> {
    if (!this.db) throw new Error('Database not initialized');

    try {
      const setParts = [];
      const values = [];
      let paramIndex = 1;

      if (data.shortcut_key !== undefined) {
        setParts.push(`shortcut_key = $${paramIndex++}`);
        values.push(data.shortcut_key);
      }
      if (data.content !== undefined) {
        setParts.push(`content = $${paramIndex++}`);
        values.push(data.content);
      }
      if (data.category_id !== undefined) {
        setParts.push(`category_id = $${paramIndex++}`);
        values.push(data.category_id);
      }

      setParts.push(`last_modified_at = CURRENT_TIMESTAMP`);
      values.push(id);

      const result = await this.db.query(
        `UPDATE shortcuts SET ${setParts.join(', ')} WHERE id = $${paramIndex} RETURNING *`,
        values
      );

      return result.rows[0];
    } catch (error) {
      console.error('Failed to update shortcut:', error);
      throw error;
    }
  }

  async deleteShortcut(id: string): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    try {
      await this.db.query('DELETE FROM shortcuts WHERE id = $1', [id]);
    } catch (error) {
      console.error('Failed to delete shortcut:', error);
      throw error;
    }
  }

  async close() {
    if (this.db) {
      await this.db.close();
      this.db = null;
      this.electric = null;
      this.isInitialized = false;
      console.log('Database closed');
    }
  }

  get isReady(): boolean {
    return this.isInitialized && !!this.db;
  }

  get electricClient() {
    return this.electric;
  }
}

// Export singleton instance
export const cutfastDb = new CutFastDatabase();
