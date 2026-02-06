import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, useWindowDimensions, Platform } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { SPACING, FONTS, RADIUS } from '../../constants/collectzTheme';
import { useTheme } from '../../context/ThemeContext';
import { CategoryCard } from '../../components/CategoryCard';
import { FloatingActionButton } from '../../components/FloatingActionButton';
import { AddCollectionModal } from '../../components/AddCollectionModal';
import { ConfirmModal } from '../../components/ConfirmModal';
import { Film, Book, BookOpen, Tv, Coffee, Menu, Search, Folder } from 'lucide-react-native';
import { useSidebar } from '../../components/Sidebar';
import { subscribeToCollections, addCollection, seedDefaultCollections, updateCollectionStatus, CollectionData, updateCollection } from '../../services/collectionService';
import { Alert } from 'react-native';

// Fallback icon helper
const getIcon = (name?: string, color: string = 'white') => {
    // Return default icon if none specified or map string names to icons
    return <Book color={color} size={24} />;
};

export default function Dashboard() {
    const { colors, isDark } = useTheme();
    const styles = createStyles(colors);
    const router = useRouter();
    const params = useLocalSearchParams<{ view?: 'active' | 'archived' | 'trashed' }>();
    const currentView = params.view || 'active';
    const { width } = useWindowDimensions();

    const { openSidebar } = useSidebar();
    const [categories, setCategories] = useState<CollectionData[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchExpanded, setSearchExpanded] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [trashModalVisible, setTrashModalVisible] = useState(false);
    const [selectedCollectionId, setSelectedCollectionId] = useState<string | null>(null);
    const [editingCollection, setEditingCollection] = useState<CollectionData | null>(null);

    useEffect(() => {
        // Check and seed defaults if empty (only for active view)
        if (currentView === 'active') {
            seedDefaultCollections();
        }

        const unsubscribe = subscribeToCollections(currentView, (data) => {
            setCategories(data);
        });
        return () => unsubscribe();
    }, [currentView]);

    const filteredCategories = categories.filter(cat =>
        cat.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        cat.desc.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handlePress = (slug: string) => {
        router.push(`/collection/${slug}`);
    };

    const handleSaveCollection = async (data: { name: string; description: string; image?: any; color: string; category: string }) => {
        try {
            const collectionData = {
                title: data.name,
                desc: data.description || '',
                color: data.color,
                slug: data.name.toLowerCase().replace(/\s+/g, '-'),
                imageUri: data.image ? data.image : undefined,
                category: data.category as any
            };

            if (editingCollection) {
                console.log("UI: Attempting to update collection:", editingCollection.id);
                await updateCollection(editingCollection.id, collectionData);
                console.log("UI: Collection updated successfully");
            } else {
                console.log("UI: Attempting to add collection:", data.name);
                await addCollection(collectionData);
                console.log("UI: Collection added successfully");
            }
            setModalVisible(false);
            setEditingCollection(null);
        } catch (error: any) {
            console.error("Failed to save collection:", error);
            Alert.alert("Gagal Menyimpan", error.message || "Pastikan koneksi internet aktif dan coba lagi.");
        }
    };

    const handleOptimisticUpdate = (id: string) => {
        setCategories(prev => prev.filter(cat => cat.id !== id));
    };

    return (
        <View style={styles.container}>
            <LinearGradient
                colors={[colors.background, colors.surfaceHighlight]}
                style={StyleSheet.absoluteFill}
            />

            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                <View style={styles.header}>
                    <View style={styles.headerTop}>
                        <View style={styles.headerLeftGroup}>
                            <TouchableOpacity onPress={openSidebar} style={styles.menuButton}>
                                <Menu color={colors.text} size={28} />
                            </TouchableOpacity>
                            <View style={styles.headerContent}>
                                <Text style={styles.greeting}>
                                    {currentView === 'active' ? 'Selamat Datang' : currentView === 'archived' ? 'Arsip Koleksi' : 'Sampah'}
                                </Text>
                                <Text style={styles.subtitle}>
                                    {currentView === 'active' ? 'Siap mengoleksi hari ini?' : currentView === 'archived' ? 'Koleksi yang disimpan.' : 'Menunggu penghapusan permanen.'}
                                </Text>
                            </View>
                        </View>
                        {/* Expandable Search */}
                        {searchExpanded ? (
                            <View style={styles.searchContainerExpanded}>
                                <TextInput
                                    style={styles.searchInput}
                                    placeholder="Search..."
                                    placeholderTextColor={colors.textSecondary}
                                    value={searchQuery}
                                    onChangeText={setSearchQuery}
                                    autoFocus
                                />
                                <TouchableOpacity onPress={() => { setSearchExpanded(false); setSearchQuery(''); }} style={styles.searchCloseButton}>
                                    <Search color={colors.text} size={20} />
                                </TouchableOpacity>
                            </View>
                        ) : (
                            <TouchableOpacity onPress={() => setSearchExpanded(true)} style={styles.searchIconButton}>
                                <Search color={colors.text} size={24} />
                            </TouchableOpacity>
                        )}
                    </View>
                </View>

                <View style={styles.grid}>
                    {filteredCategories.length === 0 ? (
                        <View style={styles.emptyState}>
                            <Folder size={64} color={colors.surfaceHighlight} style={{ marginBottom: SPACING.m }} />
                            <Text style={[styles.subtitle, { textAlign: 'center' }]}>
                                {searchQuery ? 'Tidak ada koleksi yang sesuai pencarian.' : 'Belum ada koleksi. Mulai dengan menekan tombol + di bawah!'}
                            </Text>
                        </View>
                    ) : (
                        filteredCategories.map((cat, index) => (
                            <CategoryCard
                                key={cat.id}
                                index={index}
                                title={cat.title}
                                description={cat.desc}
                                color={cat.color}
                                icon={getIcon(cat.iconName)}
                                imageSource={cat.imageUri ? { uri: cat.imageUri } : undefined}
                                onPress={() => handlePress(cat.slug)}
                                onEdit={() => {
                                    setEditingCollection(cat);
                                    setModalVisible(true);
                                }}
                                style={{
                                    width: width > 1024 ? '32%' : (width > 600 ? '48%' : '100%'),
                                }}
                                viewMode={currentView}
                                onArchive={() => {
                                    handleOptimisticUpdate(cat.id);
                                    updateCollectionStatus(cat.id, 'archived');
                                }}
                                onRestore={() => {
                                    handleOptimisticUpdate(cat.id);
                                    updateCollectionStatus(cat.id, 'active');
                                }}
                                onTrash={() => {
                                    setSelectedCollectionId(cat.id);
                                    setTrashModalVisible(true);
                                }}
                            />
                        ))
                    )}
                </View>
            </ScrollView>

            <FloatingActionButton onPress={() => setModalVisible(true)} />

            <AddCollectionModal
                visible={modalVisible}
                onClose={() => {
                    setModalVisible(false);
                    setEditingCollection(null);
                }}
                onSave={handleSaveCollection}
                initialData={editingCollection ? {
                    title: editingCollection.title,
                    desc: editingCollection.desc,
                    imageUri: editingCollection.imageUri,
                    color: editingCollection.color,
                    category: editingCollection.category || 'misc'
                } : undefined}
            />

            <ConfirmModal
                visible={trashModalVisible}
                title="Pindahkan ke Sampah?"
                message="Koleksi akan dihapus permanen setelah 30 hari berada di sampah. Anda yakin?"
                confirmText="Ya, Pindahkan"
                cancelText="Batal"
                isDestructive
                onConfirm={() => {
                    if (selectedCollectionId) {
                        handleOptimisticUpdate(selectedCollectionId);
                        updateCollectionStatus(selectedCollectionId, 'trashed');
                        setTrashModalVisible(false);
                        setSelectedCollectionId(null);
                    }
                }}
                onCancel={() => {
                    setTrashModalVisible(false);
                    setSelectedCollectionId(null);
                }}
            />
        </View>
    );
}

const createStyles = (colors: any) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    content: {
        padding: SPACING.l,
        paddingTop: Platform.OS === 'ios' ? 80 : 60,
        paddingBottom: 100,
    },
    header: {
        marginBottom: SPACING.xl,
    },
    headerTop: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '100%',
    },
    headerLeftGroup: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: SPACING.m,
    },
    menuButton: {
        width: 50,
        height: 50,
        borderRadius: RADIUS.m,
        backgroundColor: colors.surface,
        alignItems: 'center',
        justifyContent: 'center',
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    headerContent: {
        alignItems: 'flex-start',
    },
    greeting: {
        ...FONTS.header,
        color: colors.text,
        fontSize: 24,
        marginBottom: 2,
    },
    subtitle: {
        ...FONTS.body,
        fontSize: 14,
        color: colors.textSecondary,
    },
    searchIconButton: {
        width: 50,
        height: 50,
        borderRadius: RADIUS.m,
        backgroundColor: colors.surface,
        alignItems: 'center',
        justifyContent: 'center',
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    searchContainerExpanded: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.surface,
        borderRadius: RADIUS.m,
        paddingHorizontal: SPACING.m,
        flex: 1,
        marginLeft: SPACING.m,
        borderWidth: 1,
        borderColor: colors.surfaceHighlight,
    },
    searchInput: {
        flex: 1,
        ...FONTS.body,
        color: colors.text,
        paddingVertical: SPACING.s,
    },
    searchCloseButton: {
        padding: SPACING.s,
    },
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'flex-start',
        gap: SPACING.m,
    },
    emptyState: {
        flex: 1,
        width: '100%',
        height: 300,
        justifyContent: 'center',
        alignItems: 'center',
        padding: SPACING.xl,
    }
});
