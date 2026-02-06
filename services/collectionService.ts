import { db } from '../firebaseConfig';
import { collection, addDoc, doc, updateDoc, deleteDoc, onSnapshot, query, where, orderBy, getDocs } from 'firebase/firestore';
import * as localDb from './localDatabaseService';

let isOfflineMode = false;
export const setOfflineMode = (val: boolean) => {
    isOfflineMode = val;
    console.log("Service: Offline mode set to", val);
};

export interface CollectionData {
    id: string;
    title: string;
    desc: string;
    color: string;
    imageUri?: string;
    slug: string; // unique identifier for routing
    createdAt: number;
    iconName?: string; // storing icon name as string to render dynamically if needed
    status?: 'active' | 'archived' | 'trashed';
    category?: 'reading' | 'watch' | 'todo' | 'misc';
}

export interface CollectionItem {
    id: string;
    collectionId: string;
    title: string;
    subtitle: string;
    imageUri?: string; // Support for item images
    isCompleted: boolean; // Legacy: keeping for backward compat if needed, but primary is 'status'
    status: 'active' | 'completed' | 'dropped' | 'on_hold';
    seriesInfo?: string; // e.g., "Series 1"
    createdAt: number;
}

const COLLECTIONS_REF = 'collections';
const ITEMS_REF = 'collection_items';

// --- COLLECTIONS ---

export const subscribeToCollections = (status: 'active' | 'archived' | 'trashed' = 'active', callback: (cols: CollectionData[]) => void) => {
    if (isOfflineMode) {
        localDb.getLocalCollections(status).then(callback);
        return () => { }; // No real-time for local yet
    }
    const q = query(
        collection(db, COLLECTIONS_REF),
        where('status', '==', status)
    );
    return onSnapshot(q, (snapshot) => {
        const collections = snapshot.docs.map(doc => {
            const data = doc.data();
            return {
                status: 'active', // Default fallback
                ...data,
                id: doc.id,
            };
        }) as CollectionData[];

        // Sort alphabetically by title
        const sortedCollections = collections.sort((a, b) => a.title.localeCompare(b.title));

        callback(sortedCollections);
    });
};

export const updateCollectionStatus = async (id: string, status: 'active' | 'archived' | 'trashed') => {
    try {
        const ref = doc(db, COLLECTIONS_REF, id);
        await updateDoc(ref, { status });
    } catch (e) {
        console.error("Error updating status: ", e);
        throw e;
    }
};



export const getCollectionBySlug = async (slug: string): Promise<CollectionData | null> => {
    try {
        const q = query(collection(db, COLLECTIONS_REF), where('slug', '==', slug));
        const snapshot = await getDocs(q);
        if (snapshot.empty) return null;
        const docSnap = snapshot.docs[0];
        return { id: docSnap.id, ...docSnap.data() } as CollectionData;
    } catch (e) {
        console.error("Error fetching collection by slug:", e);
        return null;
    }
};

export const addCollection = async (data: Omit<CollectionData, 'id' | 'createdAt'>) => {
    const id = Date.now().toString(); // Generate local ID
    const rawData = {
        ...data,
        id,
        status: 'active' as const,
        createdAt: Date.now()
    };

    if (isOfflineMode) {
        console.log("Service: Adding collection locally (Offline Mode)");
        await localDb.saveCollectionLocally({
            ...rawData,
            isSynced: 0,
            syncOperation: 'create'
        } as any);
        return id;
    }

    try {
        // Sanitize: Firestore doesn't like undefined values
        const colData = JSON.parse(JSON.stringify(rawData));

        console.log("Service: Adding sanitized collection to Firestore:", colData);
        const docRef = await addDoc(collection(db, COLLECTIONS_REF), colData);
        console.log("Service: Successfully added collection with ID:", docRef.id);
        return docRef.id;
    } catch (e: any) {
        console.error("Error adding collection: ", e);
        const errorMsg = e.message || String(e);
        throw new Error(`Gagal membuat koleksi: ${errorMsg}`);
    }
};

export const updateCollection = async (id: string, data: Partial<Omit<CollectionData, 'id' | 'createdAt'>>) => {
    try {
        const ref = doc(db, COLLECTIONS_REF, id);

        // Sanitize: Firestore doesn't like undefined values
        const colData = JSON.parse(JSON.stringify(data));

        console.log("Service: Updating collection in Firestore:", id, colData);
        await updateDoc(ref, colData);
        console.log("Service: Successfully updated collection:", id);
    } catch (e: any) {
        console.error("Error updating collection: ", e);
        const errorMsg = e.message || String(e);
        throw new Error(`Gagal memperbarui koleksi: ${errorMsg}`);
    }
};

// --- ITEMS ---

export const subscribeToItems = (collectionId: string, callback: (items: CollectionItem[]) => void, onError?: (error: any) => void) => {
    if (isOfflineMode) {
        localDb.getLocalItems(collectionId).then(callback);
        return () => { };
    }
    console.log("Subscribing to items for collectionId:", collectionId);
    const q = query(
        collection(db, ITEMS_REF),
        where('collectionId', '==', collectionId)
    );
    return onSnapshot(q, (snapshot) => {
        console.log(`Snapshot received for ${collectionId}: ${snapshot.size} docs`);
        const allItems = snapshot.docs.map(doc => {
            const data = doc.data();
            return {
                ...data,
                id: doc.id,
                // Migration fallback: if status missing, use isCompleted
                status: data.status ? data.status : (data.isCompleted ? 'completed' : 'active')
            };
        }) as CollectionItem[];

        // Sort alphabetically by title
        const sortedItems = allItems.sort((a, b) => (a.title || '').localeCompare(b.title || ''));

        callback(sortedItems);
    }, (error) => {
        console.error("Snapshot error:", error);
        if (onError) onError(error);
    });
};

export const addItem = async (data: Omit<CollectionItem, 'id' | 'createdAt' | 'isCompleted' | 'status'>) => {
    const id = Date.now().toString();
    const rawData = {
        ...data,
        id,
        isCompleted: false,
        status: 'active' as const,
        createdAt: Date.now()
    };

    if (isOfflineMode) {
        console.log("Service: Adding item locally (Offline Mode)");
        await localDb.saveItemLocally({
            ...rawData,
            isSynced: 0,
            syncOperation: 'create'
        } as any);
        return id;
    }

    try {
        // Sanitize: Firestore doesn't like undefined values
        const itemData = JSON.parse(JSON.stringify(rawData)); // Quick way to remove undefineds
        delete itemData.id; // Allow Firestore to generate the ID or use the docRef ID, but don't save our local ID

        console.log("Service: Adding sanitized item to Firestore:", itemData);
        const docRef = await addDoc(collection(db, ITEMS_REF), itemData);
        console.log("Service: Successfully added item with ID:", docRef.id);
        return docRef.id;
    } catch (e: any) {
        console.error("Error adding item: ", e);
        // Pass more info if available
        const errorMsg = e.message || String(e);
        throw new Error(`Gagal menyimpan ke database: ${errorMsg}`);
    }
};

export const updateItem = async (id: string, data: Partial<Omit<CollectionItem, 'id' | 'createdAt'>>) => {
    try {
        const itemRef = doc(db, ITEMS_REF, id);
        // Sanitize: Firestore doesn't like undefined values
        const updateData = JSON.parse(JSON.stringify(data));
        await updateDoc(itemRef, updateData);
    } catch (e) {
        console.error("Error updating item: ", e);
        throw e;
    }
};

export const updateItemStatus = async (id: string, status: 'active' | 'completed' | 'dropped' | 'on_hold') => {
    try {
        const itemRef = doc(db, ITEMS_REF, id);
        await updateDoc(itemRef, {
            status,
            isCompleted: status === 'completed', // Maintain sync
            isWatched: status === 'completed'
        });
    } catch (e) {
        console.error("Error updating item status: ", e);
        throw e;
    }
};

export const toggleItemStatus = async (id: string, currentStatus: boolean) => {
    // Legacy wrapper
    await updateItemStatus(id, !currentStatus ? 'completed' : 'active');
};

export const deleteItem = async (id: string) => {
    try {
        await deleteDoc(doc(db, ITEMS_REF, id));
    } catch (e) {
        console.error("Error deleting item: ", e);
        throw e;
    }
};

export const deleteCollectionItems = async (ids: string[]) => {
    try {
        console.log("Service: Batch deleting items:", ids);
        const promises = ids.map(id => deleteDoc(doc(db, ITEMS_REF, id)));
        await Promise.all(promises);
        console.log("Service: Batch delete successful");
    } catch (e: any) {
        console.error("Error in batch delete: ", e);
        const errorMsg = e.message || String(e);
        throw new Error(`Gagal menghapus beberapa item: ${errorMsg}`);
    }
};
// --- SEEDING ---

const DEFAULT_COLLECTIONS = [
    { title: 'Manhwa', desc: 'Korean Comics', color: '#FF754C', iconName: 'BookOpen', slug: 'manhwa', category: 'reading' },
    { title: 'Manga', desc: 'Japanese Comics', color: '#6C5DD3', iconName: 'Book', slug: 'manga', category: 'reading' },
    { title: 'Movies', desc: 'Feature Films', color: '#3F8CFF', iconName: 'Film', slug: 'movies', category: 'watch' },
    { title: 'Series', desc: 'TV Shows', color: '#FFB800', iconName: 'Tv', slug: 'series', category: 'watch' },
    { title: 'Novels', desc: 'Light Novels', color: '#00D1FF', iconName: 'Book', slug: 'novels', category: 'reading' },
    { title: 'Food', desc: 'Culinary List', color: '#4ADE80', iconName: 'Coffee', slug: 'food', category: 'misc' },
];

export const seedDefaultCollections = async () => {
    try {
        const q = query(collection(db, COLLECTIONS_REF));
        const snapshot = await getDocs(q);

        if (snapshot.empty) {
            console.log("Seeding default collections...");
            const promises = DEFAULT_COLLECTIONS.map(col =>
                addDoc(collection(db, COLLECTIONS_REF), {
                    ...col,
                    status: 'active',
                    createdAt: Date.now()
                })
            );
            await Promise.all(promises);
            console.log("Seeding complete.");
        } else {
            // Migration: Check for docs with missing status
            const migrationPromises: Promise<void>[] = [];
            snapshot.forEach(docSnap => {
                const data = docSnap.data();
                const updates: any = {};

                // Migrate status
                if (!data.status) {
                    updates.status = 'active';
                }

                // Migrate category (Assign based on slug or default to misc if new custom one)
                if (!data.category) {
                    const defaultMatch = DEFAULT_COLLECTIONS.find(def => def.slug === data.slug);
                    updates.category = defaultMatch ? defaultMatch.category : 'misc';
                }

                if (Object.keys(updates).length > 0) {
                    migrationPromises.push(
                        updateDoc(doc(db, COLLECTIONS_REF, docSnap.id), updates)
                    );
                }
            });

            if (migrationPromises.length > 0) {
                console.log(`Migrating ${migrationPromises.length} collections to active status...`);
                await Promise.all(migrationPromises);
                console.log("Migration complete.");
            }
        }
    } catch (e) {
        console.error("Error seeding defaults: ", e);
    }
};
