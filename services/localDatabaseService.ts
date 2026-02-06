import * as SQLite from 'expo-sqlite';
import { CollectionData, CollectionItem } from './collectionService';

const DB_NAME = 'collectz_local.db';

export interface LocalCollectionData extends CollectionData {
    isSynced: number; // 0 for false, 1 for true
    syncOperation?: 'create' | 'update' | 'delete';
}

export interface LocalCollectionItem extends CollectionItem {
    isSynced: number;
    syncOperation?: 'create' | 'update' | 'delete';
}

let db: SQLite.SQLiteDatabase | null = null;

export const initDatabase = async () => {
    if (db) return db;

    db = await SQLite.openDatabaseAsync(DB_NAME);

    // Create Collections table
    await db.execAsync(`
        CREATE TABLE IF NOT EXISTS collections (
            id TEXT PRIMARY KEY NOT NULL,
            title TEXT NOT NULL,
            desc TEXT,
            color TEXT,
            imageUri TEXT,
            slug TEXT UNIQUE,
            createdAt INTEGER,
            iconName TEXT,
            status TEXT DEFAULT 'active',
            category TEXT DEFAULT 'misc',
            isSynced INTEGER DEFAULT 0,
            syncOperation TEXT
        );
    `);

    // Create Items table
    await db.execAsync(`
        CREATE TABLE IF NOT EXISTS collection_items (
            id TEXT PRIMARY KEY NOT NULL,
            collectionId TEXT NOT NULL,
            title TEXT NOT NULL,
            subtitle TEXT,
            imageUri TEXT,
            isCompleted INTEGER DEFAULT 0,
            status TEXT DEFAULT 'active',
            seriesInfo TEXT,
            createdAt INTEGER,
            isSynced INTEGER DEFAULT 0,
            syncOperation TEXT,
            FOREIGN KEY (collectionId) REFERENCES collections (id) ON DELETE CASCADE
        );
    `);

    console.log("Local database initialized");
    return db;
};

export const getDb = async () => {
    if (!db) await initDatabase();
    return db!;
};

// --- COLLECTIONS ---

export const saveCollectionLocally = async (collection: LocalCollectionData) => {
    const database = await getDb();
    await database.runAsync(
        `INSERT OR REPLACE INTO collections 
        (id, title, desc, color, imageUri, slug, createdAt, iconName, status, category, isSynced, syncOperation) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
            collection.id,
            collection.title,
            collection.desc,
            collection.color,
            collection.imageUri || null,
            collection.slug,
            collection.createdAt,
            collection.iconName || null,
            collection.status || 'active',
            collection.category || 'misc',
            collection.isSynced,
            collection.syncOperation || null
        ]
    );
};

export const getLocalCollections = async (status: string = 'active'): Promise<LocalCollectionData[]> => {
    const database = await getDb();
    const rows = await database.getAllAsync<any>(
        'SELECT * FROM collections WHERE status = ? ORDER BY title ASC',
        [status]
    );
    return rows.map(row => ({
        ...row,
        isSynced: row.isSynced === 1
    })) as any;
};

export const getUnsyncedCollections = async (): Promise<LocalCollectionData[]> => {
    const database = await getDb();
    const rows = await database.getAllAsync<any>(
        'SELECT * FROM collections WHERE isSynced = 0'
    );
    return rows;
};

// --- ITEMS ---

export const saveItemLocally = async (item: LocalCollectionItem) => {
    const database = await getDb();
    await database.runAsync(
        `INSERT OR REPLACE INTO collection_items 
        (id, collectionId, title, subtitle, imageUri, isCompleted, status, seriesInfo, createdAt, isSynced, syncOperation) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
            item.id,
            item.collectionId,
            item.title,
            item.subtitle || null,
            item.imageUri || null,
            item.isCompleted ? 1 : 0,
            item.status || 'active',
            item.seriesInfo || null,
            item.createdAt,
            item.isSynced,
            item.syncOperation || null
        ]
    );
};

export const getLocalItems = async (collectionId: string): Promise<LocalCollectionItem[]> => {
    const database = await getDb();
    const rows = await database.getAllAsync<any>(
        'SELECT * FROM collection_items WHERE collectionId = ? ORDER BY title ASC',
        [collectionId]
    );
    return rows.map(row => ({
        ...row,
        isCompleted: row.isCompleted === 1,
        isSynced: row.isSynced === 1
    })) as any;
};

export const getUnsyncedItems = async (): Promise<LocalCollectionItem[]> => {
    const database = await getDb();
    const rows = await database.getAllAsync<any>(
        'SELECT * FROM collection_items WHERE isSynced = 0'
    );
    return rows;
};

export const markAsSynced = async (table: 'collections' | 'collection_items', id: string) => {
    const database = await getDb();
    await database.runAsync(
        `UPDATE ${table} SET isSynced = 1, syncOperation = NULL WHERE id = ?`,
        [id]
    );
};

export const clearLocalDatabase = async () => {
    const database = await getDb();
    await database.execAsync('DELETE FROM collection_items');
    await database.execAsync('DELETE FROM collections');
};
