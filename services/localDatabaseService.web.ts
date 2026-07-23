import { CollectionData, CollectionItem } from './collectionService';

// Versi web: expo-sqlite tidak didukung penuh di browser (GitHub Pages tidak
// bisa mengirim header COOP/COEP yang dibutuhkan wa-sqlite). File ini
// menyediakan implementasi kosong/no-op dengan signature yang sama persis
// seperti localDatabaseService.ts, supaya OfflineContext tetap bisa jalan
// tanpa error saat di-build untuk web. Fitur local database offline hanya
// aktif di versi mobile (Android/iOS).

export interface LocalCollectionData extends CollectionData {
    isSynced: number;
    syncOperation?: 'create' | 'update' | 'delete';
}

export interface LocalCollectionItem extends CollectionItem {
    isSynced: number;
    syncOperation?: 'create' | 'update' | 'delete';
}

export const initDatabase = async () => {
    console.log('Local database tidak tersedia di versi web');
    return null;
};

export const getDb = async () => {
    return null;
};

// --- COLLECTIONS ---

export const saveCollectionLocally = async (_collection: LocalCollectionData) => {
    // no-op di web
};

export const getLocalCollections = async (
    _status: string = 'active'
): Promise<LocalCollectionData[]> => {
    return [];
};

export const getUnsyncedCollections = async (): Promise<LocalCollectionData[]> => {
    return [];
};

// --- ITEMS ---

export const saveItemLocally = async (_item: LocalCollectionItem) => {
    // no-op di web
};

export const getLocalItems = async (
    _collectionId: string
): Promise<LocalCollectionItem[]> => {
    return [];
};

export const getUnsyncedItems = async (): Promise<LocalCollectionItem[]> => {
    return [];
};

export const markAsSynced = async (
    _table: 'collections' | 'collection_items',
    _id: string
) => {
    // no-op di web
};

export const clearLocalDatabase = async () => {
    // no-op di web
};
