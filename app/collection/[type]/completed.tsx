import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, TextInput } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Search } from 'lucide-react-native';
import { SPACING, FONTS, RADIUS } from '../../../constants/collectzTheme';
import { useTheme } from '../../../context/ThemeContext';
import { CollectionItem } from '../../../components/CollectionItem';
import { subscribeToItems, toggleItemStatus, CollectionItem as ICollectionItem, getCollectionBySlug, CollectionData } from '../../../services/collectionService';

export default function CompletedCollectionScreen() {
    const { colors, isDark } = useTheme();
    const styles = createStyles(colors);
    const { type } = useLocalSearchParams<{ type: string }>();
    const [items, setItems] = useState<ICollectionItem[]>([]);
    const [collectionData, setCollectionData] = useState<CollectionData | null>(null);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        const fetchMeta = async () => {
            if (type) {
                const col = await getCollectionBySlug(type);
                setCollectionData(col);
            }
        };
        fetchMeta();
    }, [type]);

    useEffect(() => {
        if (!collectionData?.id) return;

        // Safety timeout to prevent infinite loading
        const timeoutId = setTimeout(() => {
            setLoading((prev) => {
                if (prev) {
                    console.warn("Forcing loading to false due to timeout");
                    return false;
                }
                return prev;
            });
        }, 5000); // 5 seconds timeout

        const unsubscribe = subscribeToItems(collectionData.id, (data) => {
            setItems(data);
            setLoading(false);
            clearTimeout(timeoutId);
        }, (error: any) => {
            console.error("Error fetching completed items:", error);
            setLoading(false);
            clearTimeout(timeoutId);
        });

        return () => {
            unsubscribe();
            clearTimeout(timeoutId);
        };
    }, [collectionData?.id]);

    const handleToggle = async (id: string) => {
        try {
            await toggleItemStatus(id, true);
        } catch (error) {
            console.error("Failed to toggle item:", error);
        }
    };

    // Filter by completed status AND search query
    const filteredItems = items
        .filter(item => item.status === 'completed')
        .filter(item =>
            item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.subtitle.toLowerCase().includes(searchQuery.toLowerCase())
        );

    return (
        <View style={styles.container}>
            <LinearGradient
                colors={[colors.background, colors.surfaceHighlight]}
                style={StyleSheet.absoluteFill}
            />

            <View style={styles.headerContainer}>
                <View style={styles.searchContainer}>
                    <Search color={colors.textSecondary} size={20} style={styles.searchIcon} />
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Cari item selesai..."
                        placeholderTextColor={colors.textSecondary}
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                    />
                </View>
            </View>

            {loading ? (
                <ActivityIndicator size="large" color={colors.primary} style={styles.loader} />
            ) : (
                <FlatList
                    data={filteredItems}
                    keyExtractor={item => item.id}
                    contentContainerStyle={styles.listContent}
                    renderItem={({ item, index }) => (
                        <CollectionItem
                            id={item.id}
                            title={item.title}
                            subtitle={item.subtitle}
                            isCompleted={item.status === 'completed'}
                            status={item.status}
                            category={collectionData?.category}
                            index={index}
                            onToggle={handleToggle}
                        />
                    )}
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <View style={styles.emptyContent}>
                                <Text style={styles.emptyEmoji}>🎉</Text>
                                <Text style={styles.emptyTitle}>Belum Ada yang Selesai</Text>
                                <Text style={styles.emptyText}>Selesaikan item untuk melihatnya di sini!</Text>
                            </View>
                        </View>
                    }
                />
            )}
        </View>
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
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.surface,
        borderRadius: RADIUS.m,
        paddingHorizontal: SPACING.m,
        height: 44,
        borderWidth: 1,
        borderColor: colors.surfaceHighlight,
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
    }
});
