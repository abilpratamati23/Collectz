import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, SafeAreaView, TouchableOpacity, TextInput, Pressable, Platform } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Search, List, CheckCircle, Clock, PlayCircle, PauseCircle, BookOpen, Trash2 } from 'lucide-react-native';
import Animated, { FadeIn, FadeOut, FadeInDown, FadeOutUp, Layout, useSharedValue, useAnimatedStyle, withSpring, withTiming, interpolateColor } from 'react-native-reanimated';
import { SPACING, FONTS, RADIUS } from '../../../constants/collectzTheme';
import { useTheme } from '../../../context/ThemeContext';
import { CollectionItem } from '../../../components/CollectionItem';
import { subscribeToItems, updateItemStatus, addItem, CollectionItem as ICollectionItem, getCollectionBySlug, CollectionData, deleteCollectionItems, updateItem } from '../../../services/collectionService';
import { FloatingActionButton } from '../../../components/FloatingActionButton';
import { AddItemModal } from '../../../components/AddItemModal';
import { ItemDetailModal } from '../../../components/ItemDetailModal';
import { ConfirmModal } from '../../../components/ConfirmModal';

type TabOption = {
    id: string; // Internal filter ID: 'all', 'active', 'completed', 'dropped', 'on_hold'
    label: string;
    icon: any;
};

// Tab Configurations
const TABS_BY_CATEGORY: Record<string, TabOption[]> = {
    misc: [
        { id: 'all', label: 'List', icon: List }
    ],
    watch: [
        { id: 'active', label: 'Unwatched', icon: PlayCircle }, // Show only active items
        { id: 'on_hold', label: 'Belum dilanjut', icon: PauseCircle }, // Using 'on_hold' for "Belum dilanjut"
        { id: 'completed', label: 'Selesai', icon: CheckCircle }
    ],
    todo: [
        { id: 'active', label: 'Belum dikerjakan', icon: Clock },
        { id: 'completed', label: 'Sudah dikerjakan', icon: CheckCircle }
    ],
    reading: [
        { id: 'active', label: 'On-going', icon: BookOpen },
        { id: 'dropped', label: 'Stop', icon: PauseCircle },
        { id: 'completed', label: 'Finish', icon: CheckCircle }
    ]
};

const TrashIconWithHover = ({ onPress }: { onPress: () => void }) => {
    const { colors, isDark } = useTheme();
    const scale = useSharedValue(1);
    const bgOpacity = useSharedValue(0);

    const animatedStyle = useAnimatedStyle(() => {
        return {
            transform: [{ scale: withSpring(scale.value) }],
            backgroundColor: withTiming(`rgba(255, 76, 76, ${bgOpacity.value})`, { duration: 200 }),
            borderRadius: 20,
        };
    });

    const styles = createStyles(colors);

    return (
        <Pressable
            onPress={onPress}
            // @ts-ignore
            onHoverIn={() => {
                scale.value = 1.1;
                bgOpacity.value = 0.15;
            }}
            onHoverOut={() => {
                scale.value = 1;
                bgOpacity.value = 0;
            }}
            style={[styles.trashIconContainer, animatedStyle]}
        >
            <Trash2 color={colors.danger} size={24} />
        </Pressable>
    );
};

const TabItemWithHover = ({
    tab,
    isActive,
    onPress
}: {
    tab: TabOption,
    isActive: boolean,
    onPress: () => void
}) => {
    const { colors, isDark } = useTheme();
    const scale = useSharedValue(1);
    const progress = useSharedValue(0);
    const Icon = tab.icon;

    const animatedStyle = useAnimatedStyle(() => {
        const backgroundColor = interpolateColor(
            progress.value,
            [0, 1],
            ['transparent', isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.08)']
        );
        return {
            transform: [{ scale: scale.value }],
            backgroundColor,
        };
    });

    const styles = createStyles(colors);

    return (
        <Pressable
            onPress={onPress}
            // @ts-ignore
            onHoverIn={() => {
                if (Platform.OS === 'web') {
                    scale.value = withSpring(1.1, { damping: 15 });
                    progress.value = withTiming(1, { duration: 200 });
                }
            }}
            onHoverOut={() => {
                if (Platform.OS === 'web') {
                    scale.value = withSpring(1, { damping: 15 });
                    progress.value = withTiming(0, { duration: 200 });
                }
            }}
            style={[
                styles.tabItem,
                isActive && styles.tabItemActive,
                animatedStyle,
                Platform.OS === 'web' && { cursor: 'pointer' } as any
            ]}
        >
            <Icon
                size={20}
                color={isActive ? colors.primary : colors.textSecondary}
            />
            <Text style={[styles.tabLabel, isActive && styles.tabLabelActive]}>
                {tab.label}
            </Text>
        </Pressable>
    );
};

export default function CollectionScreen() {
    const { colors, isDark } = useTheme();
    const styles = createStyles(colors);
    const { type } = useLocalSearchParams<{ type: string }>();
    const [collectionData, setCollectionData] = useState<CollectionData | null>(null);
    const [items, setItems] = useState<ICollectionItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<string>('all'); // Default to 'all' or first appropriate tab
    const [modalVisible, setModalVisible] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedItemForDetail, setSelectedItemForDetail] = useState<ICollectionItem | null>(null);
    const [isDeleteMode, setIsDeleteMode] = useState(false);
    const [selectedItems, setSelectedItems] = useState<string[]>([]);
    const [deleteConfirmVisible, setDeleteConfirmVisible] = useState(false);

    useEffect(() => {
        const fetchMeta = async () => {
            if (type) {
                const col = await getCollectionBySlug(type);
                setCollectionData(col);

                // Set default tab based on category
                if (col?.category) {
                    const tabs = TABS_BY_CATEGORY[col.category] || TABS_BY_CATEGORY['misc'];
                    setActiveTab(tabs[0].id);
                }
            }
        };
        fetchMeta();
    }, [type]);

    const handleAddItem = async (data: { title: string, subtitle: string, imageUri?: string, seriesInfo?: string }) => {
        if (!collectionData) return;

        try {
            await addItem({
                collectionId: collectionData.id,
                title: data.title,
                subtitle: data.subtitle,
                imageUri: data.imageUri,
                seriesInfo: data.seriesInfo,
            });
            setModalVisible(false);
        } catch (error) {
            console.error('Error adding item:', error);
            alert((error as Error).message || "Gagal menambahkan item. Periksa koneksi internet atau coba lagi.");
        }
    };

    const confirmDeleteItems = async () => {
        if (!collectionData || selectedItems.length === 0) return;

        try {
            await deleteCollectionItems(selectedItems); // Service only takes ids
            setSelectedItems([]);
            setIsDeleteMode(false);
            setDeleteConfirmVisible(false);
        } catch (error) {
            console.error('Error deleting items:', error);
            alert("Gagal menghapus item.");
        }
    };

    const toggleItemSelection = (itemId: string) => {
        setSelectedItems(prev =>
            prev.includes(itemId)
                ? prev.filter(id => id !== itemId)
                : [...prev, itemId]
        );
    };

    useEffect(() => {
        if (!collectionData) return;

        const unsubscribe = subscribeToItems(collectionData.id, (newItems) => {
            setItems(newItems);
            setLoading(false);
        }, (error) => {
            console.error('Error fetching items:', error);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [collectionData?.id]);

    const handleToggleStatus = async (itemId: string, currentStatus: boolean) => {
        if (!collectionData) return;
        try {
            await updateItemStatus(itemId, !currentStatus ? 'completed' : 'active');
        } catch (error) {
            console.error('Error updating status:', error);
        }
    };

    const handleUpdateStatus = async (itemId: string, newStatus: string) => {
        try {
            await updateItemStatus(itemId, newStatus as any);
        } catch (error) {
            console.error('Error updating status:', error);
        }
    };

    const handleUpdateItem = async (newTitle: string, newDesc: string, newSeries?: string) => {
        if (!selectedItemForDetail) return;
        try {
            await updateItem(selectedItemForDetail.id, {
                title: newTitle,
                subtitle: newDesc,
                seriesInfo: newSeries,
            });
            setSelectedItemForDetail(null);
        } catch (error) {
            console.error('Error updating item:', error);
            alert("Gagal memperbarui item.");
        }
    };

    const filteredItems = items.filter(item => {
        const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (item.subtitle || '').toLowerCase().includes(searchQuery.toLowerCase());

        if (!matchesSearch) return false;

        if (activeTab === 'all') return true;
        return item.status === activeTab;
    });

    const currentTabs = collectionData ? (TABS_BY_CATEGORY[collectionData.category || 'misc'] || TABS_BY_CATEGORY['misc']) : [];

    if (loading) {
        return (
            <SafeAreaView style={styles.container}>
                <ActivityIndicator size="large" color={colors.primary} style={styles.loader} />
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <LinearGradient
                colors={[colors.background, colors.surfaceHighlight]}
                style={StyleSheet.absoluteFill}
                pointerEvents="none"
            />

            <View style={styles.headerContainer}>
                <View style={styles.searchRow}>
                    <View style={styles.searchContainer}>
                        <Search size={20} color={colors.textSecondary} style={styles.searchIcon} />
                        <TextInput
                            style={styles.searchInput}
                            placeholder="Cari item..."
                            placeholderTextColor={colors.textSecondary}
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                        />
                    </View>
                    {!isDeleteMode && <TrashIconWithHover onPress={() => setIsDeleteMode(true)} />}
                </View>

                {isDeleteMode && (
                    <Animated.View
                        entering={FadeInDown.duration(300)}
                        exiting={FadeOutUp.duration(200)}
                        style={styles.deleteHeaderActions}
                    >
                        <TouchableOpacity
                            style={styles.cancelDeleteButton}
                            onPress={() => {
                                setIsDeleteMode(false);
                                setSelectedItems([]);
                            }}
                        >
                            <Text style={styles.cancelDeleteText}>Batal</Text>
                        </TouchableOpacity>

                        <Text style={styles.selectionCountText}>
                            {selectedItems.length} Terpilih
                        </Text>

                        <TouchableOpacity
                            style={[styles.confirmDeleteButton, selectedItems.length === 0 && styles.disabledDeleteButton]}
                            onPress={() => setDeleteConfirmVisible(true)}
                            disabled={selectedItems.length === 0}
                        >
                            <Text style={styles.confirmDeleteText}>Hapus</Text>
                        </TouchableOpacity>
                    </Animated.View>
                )}
            </View>

            {filteredItems.length === 0 ? (
                <View style={styles.emptyContainer}>
                    <View style={styles.emptyContent}>
                        <Text style={styles.emptyEmoji}>📦</Text>
                        <Text style={[styles.tabLabel, { fontSize: 18, color: colors.text }]}>Belum ada item</Text>
                        <Text style={[styles.tabLabel, { textAlign: 'center', marginTop: 8 }]}>
                            {searchQuery ? 'Tidak ada item yang cocok dengan pencarian' : 'Tambahkan item pertama Anda ke koleksi ini!'}
                        </Text>
                    </View>
                </View>
            ) : (
                <FlatList
                    data={filteredItems}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item, index }) => (
                        <CollectionItem
                            id={item.id}
                            title={item.title}
                            imageUri={item.imageUri}
                            subtitle={item.subtitle}
                            status={item.status}
                            seriesInfo={item.seriesInfo}
                            isCompleted={item.status === 'completed'}
                            category={collectionData?.category}
                            index={index}
                            onToggle={handleToggleStatus}
                            onUpdateStatus={handleUpdateStatus}
                            onDetail={() => setSelectedItemForDetail(item)}
                            isSelectionMode={isDeleteMode}
                            isSelected={selectedItems.includes(item.id)}
                            onSelect={toggleItemSelection}
                        />
                    )}
                    contentContainerStyle={[styles.listContent, { paddingBottom: 100 }]}
                    ListHeaderComponent={
                        <View style={{ marginBottom: SPACING.m }}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                                <Text style={[styles.tabLabel, { fontSize: 14, fontWeight: 'bold', color: colors.primary }]}>
                                    {collectionData?.title}
                                </Text>
                                {filteredItems.length > 0 && (
                                    <Text style={[styles.tabLabel, { fontSize: 12 }]}>
                                        {filteredItems.length} Items
                                    </Text>
                                )}
                            </View>
                        </View>
                    }
                />
            )}

            {!isDeleteMode && (
                <FloatingActionButton
                    onPress={() => setModalVisible(true)}
                    style={{ bottom: 110 }}
                />
            )}

            <AddItemModal
                visible={modalVisible}
                onClose={() => setModalVisible(false)}
                onSave={handleAddItem}
                collectionName={collectionData?.title || 'Collection'}
                category={collectionData?.category}
            />

            <ConfirmModal
                visible={deleteConfirmVisible}
                title="Hapus Item"
                message={`Anda yakin ingin menghapus ${selectedItems.length} item yang dipilih? Tindakan ini tidak dapat dibatalkan.`}
                confirmText="Hapus"
                cancelText="Batal"
                onConfirm={confirmDeleteItems}
                onCancel={() => setDeleteConfirmVisible(false)}
                isDestructive
            />

            <ItemDetailModal
                visible={!!selectedItemForDetail}
                onClose={() => setSelectedItemForDetail(null)}
                title={selectedItemForDetail?.title || ''}
                description={selectedItemForDetail?.subtitle || ''}
                imageUri={selectedItemForDetail?.imageUri}
                category={collectionData?.category}
                status={selectedItemForDetail?.status}
                seriesInfo={selectedItemForDetail?.seriesInfo}
                onSave={handleUpdateItem}
                onUpdateStatus={async (newStatus) => {
                    if (selectedItemForDetail) {
                        await handleUpdateStatus(selectedItemForDetail.id, newStatus);
                        setSelectedItemForDetail(null);
                    }
                }}
            />

            {/* Custom Bottom Tab Bar */}
            {currentTabs.length > 0 && (
                <View style={styles.tabBar}>
                    {currentTabs.map((tab) => (
                        <TabItemWithHover
                            key={tab.id}
                            tab={tab}
                            isActive={activeTab === tab.id}
                            onPress={() => setActiveTab(tab.id)}
                        />
                    ))}
                </View>
            )}
        </SafeAreaView>
    );
}

const createStyles = (colors: any) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    headerContainer: {
        paddingHorizontal: SPACING.m,
        paddingTop: SPACING.m,
        paddingBottom: SPACING.s,
        backgroundColor: 'transparent',
    },
    searchRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: SPACING.s,
    },
    searchContainer: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.surface,
        borderRadius: RADIUS.m,
        paddingHorizontal: SPACING.m,
        height: 44,
        borderWidth: 1,
        borderColor: colors.surfaceHighlight,
    },
    trashIconContainer: {
        width: 40,
        height: 40,
        alignItems: 'center',
        justifyContent: 'center',
    },
    deleteHeaderActions: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: SPACING.s,
        paddingVertical: SPACING.s,
        paddingHorizontal: SPACING.xs,
        backgroundColor: colors.surfaceHighlight,
        borderRadius: RADIUS.m,
        borderWidth: 1,
        borderColor: colors.surfaceHighlight,
    },
    selectionCountText: {
        ...FONTS.body,
        fontWeight: 'bold',
        color: colors.primary,
    },
    cancelDeleteButton: {
        paddingVertical: 10,
        paddingHorizontal: SPACING.m,
    },
    cancelDeleteText: {
        ...FONTS.body,
        color: colors.textSecondary,
        fontWeight: '600',
    },
    confirmDeleteButton: {
        backgroundColor: colors.danger,
        paddingVertical: 10,
        paddingHorizontal: SPACING.m,
        borderRadius: RADIUS.m,
    },
    confirmDeleteText: {
        ...FONTS.body,
        color: 'white',
        fontWeight: 'bold',
    },
    disabledDeleteButton: {
        opacity: 0.5,
    },
    searchIcon: {
        marginRight: SPACING.s,
    },
    searchInput: {
        flex: 1,
        ...FONTS.body,
        color: colors.text,
        height: '100%',
    },
    listContent: {
        padding: SPACING.m,
    },
    loader: {
        flex: 1,
        justifyContent: 'center',
    },
    emptyContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 80,
    },
    emptyContent: {
        alignItems: 'center',
        padding: SPACING.xl,
    },
    emptyEmoji: {
        fontSize: 64,
        marginBottom: SPACING.m,
    },
    emptyTitle: {
        ...FONTS.header,
        fontSize: 20,
        color: colors.text,
        marginBottom: SPACING.s,
    },
    emptyText: {
        ...FONTS.body,
        fontSize: 16,
        color: colors.textSecondary,
        marginBottom: SPACING.l,
        textAlign: 'center',
    },
    emptyButton: {
        backgroundColor: colors.primary,
        paddingHorizontal: SPACING.l,
        paddingVertical: 12,
        borderRadius: RADIUS.m,
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 6,
    },
    emptyButtonText: {
        ...FONTS.body,
        fontWeight: 'bold',
        color: 'white',
    },
    tabBar: {
        flexDirection: 'row',
        backgroundColor: colors.surface,
        borderTopWidth: 1,
        borderTopColor: colors.surfaceHighlight,
        paddingBottom: Platform.OS === 'ios' ? 30 : 10,
        paddingTop: 10,
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        elevation: 20,
        justifyContent: 'space-around',
    },
    tabItem: {
        alignItems: 'center',
        justifyContent: 'center',
        padding: 8,
        flex: 1,
    },
    tabItemActive: {
        // borderTopWidth: 2,
        // borderTopColor: colors.primary,
    },
    tabLabel: {
        fontSize: 12,
        color: colors.textSecondary,
        marginTop: 4,
        fontWeight: '500',
    },
    tabLabelActive: {
        color: colors.primary,
        fontWeight: 'bold',
    },
});
