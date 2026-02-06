import * as React from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getUnsyncedCollections, getUnsyncedItems, markAsSynced, initDatabase } from '../services/localDatabaseService';
import { db as firestoreDb } from '../firebaseConfig';
import { collection, addDoc, doc, updateDoc } from 'firebase/firestore';
import { setOfflineMode } from '../services/collectionService';

interface OfflineContextType {
    isOffline: boolean;
    setIsOffline: (value: boolean) => void;
    syncing: boolean;
    syncOfflineData: () => Promise<void>;
}

const OfflineContext = React.createContext<OfflineContextType | undefined>(undefined);

const OFFLINE_STORAGE_KEY = '@collectz_offline_mode';

export const OfflineProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [isOffline, setIsOfflineState] = React.useState(false);
    const [syncing, setSyncing] = React.useState(false);

    React.useEffect(() => {
        const loadOfflineMode = async () => {
            try {
                const savedMode = await AsyncStorage.getItem(OFFLINE_STORAGE_KEY);
                const isOfflineValue = savedMode === 'true';
                setIsOfflineState(isOfflineValue);
                setOfflineMode(isOfflineValue);
                await initDatabase();
            } catch (error) {
                console.error('Failed to load offline mode:', error);
            }
        };
        loadOfflineMode();
    }, []);

    React.useEffect(() => {
        setOfflineMode(isOffline);
    }, [isOffline]);

    const setIsOffline = async (value: boolean) => {
        setIsOfflineState(value);
        try {
            await AsyncStorage.setItem(OFFLINE_STORAGE_KEY, String(value));
            if (!value) {
                // When coming back online, trigger sync
                await syncOfflineData();
            }
        } catch (error) {
            console.error('Failed to save offline mode:', error);
        }
    };

    const syncOfflineData = async () => {
        if (syncing) return;
        setSyncing(true);
        console.log("Starting offline data synchronization...");

        try {
            // 1. Sync Collections
            const unsyncedCols = await getUnsyncedCollections();
            for (const col of unsyncedCols) {
                try {
                    console.log(`Syncing collection: ${col.title}`);
                    const { isSynced, syncOperation, id, ...firestoreData } = col;

                    if (syncOperation === 'create' || !syncOperation) {
                        await addDoc(collection(firestoreDb, 'collections'), firestoreData);
                        await markAsSynced('collections', id);
                    }
                } catch (e) {
                    console.error(`Failed to sync collection ${col.id}:`, e);
                }
            }

            // 2. Sync Items
            const unsyncedItems = await getUnsyncedItems();
            for (const item of unsyncedItems) {
                try {
                    console.log(`Syncing item: ${item.title}`);
                    const { isSynced, syncOperation, id, ...firestoreData } = item;

                    if (syncOperation === 'create' || !syncOperation) {
                        await addDoc(collection(firestoreDb, 'collection_items'), firestoreData);
                        await markAsSynced('collection_items', id);
                    }
                } catch (e) {
                    console.error(`Failed to sync item ${item.id}:`, e);
                }
            }

            console.log("Synchronization complete.");
        } catch (error) {
            console.error("Error during synchronization:", error);
        } finally {
            setSyncing(false);
        }
    };

    return (
        <OfflineContext.Provider value={{ isOffline, setIsOffline, syncing, syncOfflineData }}>
            {children}
        </OfflineContext.Provider>
    );
};

export const useOffline = () => {
    const context = React.useContext(OfflineContext);
    if (context === undefined) {
        throw new Error('useOffline must be used within an OfflineProvider');
    }
    return context;
};
