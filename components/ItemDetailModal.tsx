import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, Pressable, ScrollView, Image, Dimensions } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring, withTiming } from 'react-native-reanimated';
import { X, Info, Edit3, Check, RotateCcw } from 'lucide-react-native';
import { SPACING, RADIUS, FONTS } from '../constants/collectzTheme';
import { useTheme } from '../context/ThemeContext';
import { TextInput } from 'react-native';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

interface ItemDetailModalProps {
    visible: boolean;
    onClose: () => void;
    title: string;
    description: string;
    imageUri?: string;
    category?: string;
    status?: string;
    seriesInfo?: string;
    onSave?: (newTitle: string, newDescription: string, newSeries?: string) => void;
    onUpdateStatus?: (newStatus: string) => void;
}

export const ItemDetailModal = ({
    visible, onClose, title, description, imageUri, category, status, seriesInfo, onSave, onUpdateStatus
}: ItemDetailModalProps) => {
    const { colors, isDark } = useTheme();
    const styles = createStyles(colors);
    const scale = useSharedValue(0.9);
    const opacity = useSharedValue(0);
    const [isEditing, setIsEditing] = React.useState(false);
    const [editTitle, setEditTitle] = React.useState(title);
    const [editDesc, setEditDesc] = React.useState(description);
    const [editSeries, setEditSeries] = React.useState(seriesInfo || '');

    const isSpecialCategory = category === 'reading' || category === 'watch';
    const hasChanges = editTitle !== title || editDesc !== description ||
        (category === 'watch' && (editSeries !== (seriesInfo || '')));

    useEffect(() => {
        if (visible) {
            scale.value = withSpring(1, { damping: 15 });
            opacity.value = withTiming(1, { duration: 300 });
            setEditTitle(title);
            setEditDesc(description);
            setEditSeries(seriesInfo || '');
            // Default to editing for special categories
            setIsEditing(isSpecialCategory);
        } else {
            scale.value = withTiming(0.9, { duration: 200 });
            opacity.value = withTiming(0, { duration: 200 });
        }
    }, [visible, title, description, seriesInfo, isSpecialCategory]);

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }],
        opacity: opacity.value,
    }));

    const handleSave = () => {
        onSave?.(editTitle, editDesc, editSeries);
        // If it's a special category, we stay in "edit" mode but the Selesai button will disappear because hasChanges becomes false
        if (!isSpecialCategory) {
            setIsEditing(false);
        }
    };

    if (!visible && opacity.value === 0) return null;

    return (
        <Modal
            visible={visible}
            transparent
            animationType="none"
            onRequestClose={onClose}
        >
            <Pressable style={styles.container} onPress={onClose}>
                <Animated.View style={[styles.backdrop, { opacity: opacity.value }]} />

                <Pressable onPress={(e) => e.stopPropagation()} style={styles.cardContainer}>
                    <Animated.View style={[styles.card, animatedStyle]}>
                        <View style={styles.header}>
                            <View style={styles.headerLeft}>
                                <View style={styles.iconCircle}>
                                    <Info color={colors.primary} size={24} />
                                </View>
                                <Text style={styles.headerLabel}>
                                    {isEditing ? 'Edit Information' : 'Detail Information'}
                                </Text>
                            </View>
                            <View style={styles.headerRight}>
                                {hasChanges ? (
                                    <TouchableOpacity
                                        onPress={handleSave}
                                        style={[styles.closeButton, { marginRight: SPACING.s, backgroundColor: colors.success, paddingHorizontal: 15 }]}
                                    >
                                        <Text style={{ color: 'white', fontWeight: 'bold' }}>Selesai</Text>
                                    </TouchableOpacity>
                                ) : (
                                    (isSpecialCategory || !isEditing) && (
                                        <View style={[styles.closeButton, { marginRight: SPACING.s, opacity: 0.5 }]}>
                                            <Edit3 color={colors.primary} size={20} />
                                        </View>
                                    )
                                )}
                                <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                                    <X color={colors.textSecondary} size={24} />
                                </TouchableOpacity>
                            </View>
                        </View>

                        <ScrollView
                            style={styles.scrollContent}
                            showsVerticalScrollIndicator={false}
                            contentContainerStyle={styles.scrollInnerContent}
                        >
                            {imageUri && (
                                <Image
                                    source={{ uri: imageUri }}
                                    style={styles.image}
                                    resizeMode="cover"
                                />
                            )}

                            {isEditing ? (
                                <TextInput
                                    style={styles.titleInput}
                                    value={editTitle}
                                    onChangeText={setEditTitle}
                                    placeholder="Judul item..."
                                    placeholderTextColor={colors.textSecondary}
                                />
                            ) : (
                                <View style={styles.titleRow}>
                                    <Text style={styles.title}>{title}</Text>
                                    <View style={styles.infoRow}>
                                        {seriesInfo ? (
                                            <View style={styles.seriesBadge}>
                                                <Text style={styles.infoText}>{seriesInfo}</Text>
                                            </View>
                                        ) : null}
                                    </View>
                                </View>
                            )}

                            {isEditing && category === 'watch' && (
                                <View style={styles.editWatchContainer}>
                                    <View style={styles.editWatchField}>
                                        <Text style={styles.editWatchLabel}>Series ke</Text>
                                        <TextInput
                                            style={styles.smallInput}
                                            value={editSeries}
                                            onChangeText={setEditSeries}
                                            placeholder="Contoh: Season 1..."
                                            placeholderTextColor={colors.textSecondary}
                                        />
                                    </View>
                                </View>
                            )}

                            <View style={styles.divider} />

                            {isEditing ? (
                                <TextInput
                                    style={styles.descriptionInput}
                                    value={editDesc}
                                    onChangeText={setEditDesc}
                                    placeholder={category === 'watch' ? "Masukkan tahun rilis..." : "Masukkan deskripsi..."}
                                    placeholderTextColor={colors.textSecondary}
                                    multiline
                                    textAlignVertical="top"
                                />
                            ) : (
                                <Text style={styles.description}>
                                    {description || 'Tidak ada deskripsi tersedia untuk item ini.'}
                                </Text>
                            )}
                        </ScrollView>

                        <View style={styles.footer}>
                            {isEditing && !isSpecialCategory ? (
                                <View style={styles.footerActions}>
                                    <TouchableOpacity
                                        style={[styles.actionButton, styles.cancelButton]}
                                        onPress={() => setIsEditing(false)}
                                    >
                                        <RotateCcw color={colors.textSecondary} size={18} style={{ marginRight: 8 }} />
                                        <Text style={[styles.actionButtonText, { color: colors.textSecondary }]}>Batal</Text>
                                    </TouchableOpacity>

                                    <TouchableOpacity
                                        style={[styles.actionButton, styles.saveButton]}
                                        onPress={handleSave}
                                    >
                                        <Check color="white" size={18} style={{ marginRight: 8 }} />
                                        <Text style={styles.actionButtonText}>Simpan</Text>
                                    </TouchableOpacity>
                                </View>
                            ) : (
                                (category === 'reading' || category === 'watch') ? (
                                    <View style={styles.footerActions}>
                                        {status === 'active' ? (
                                            <>
                                                <TouchableOpacity
                                                    style={[styles.actionButton, styles.statusSecondaryButton]}
                                                    onPress={() => onUpdateStatus?.(category === 'reading' ? 'dropped' : 'on_hold')}
                                                >
                                                    <Text style={[styles.actionButtonText, { color: category === 'reading' ? colors.danger : '#FFB800' }]}>
                                                        {category === 'reading' ? 'Berhenti' : 'Tunda'}
                                                    </Text>
                                                </TouchableOpacity>

                                                <TouchableOpacity
                                                    style={[styles.actionButton, styles.statusSuccessButton]}
                                                    onPress={() => onUpdateStatus?.('completed')}
                                                >
                                                    <Text style={styles.actionButtonText}>
                                                        {category === 'reading' ? 'Selesai Baca' : 'Selesai Nonton'}
                                                    </Text>
                                                </TouchableOpacity>
                                            </>
                                        ) : (
                                            <>
                                                <TouchableOpacity
                                                    style={[styles.actionButton, styles.statusPrimaryButton]}
                                                    onPress={() => onUpdateStatus?.('active')}
                                                >
                                                    <Text style={styles.actionButtonText}>Lanjutkan</Text>
                                                </TouchableOpacity>

                                                <TouchableOpacity
                                                    style={[styles.actionButton, styles.cancelButton]}
                                                    onPress={onClose}
                                                >
                                                    <Text style={[styles.actionButtonText, { color: colors.textSecondary }]}>Tutup</Text>
                                                </TouchableOpacity>
                                            </>
                                        )}
                                    </View>
                                ) : (
                                    <TouchableOpacity style={styles.actionButton} onPress={onClose}>
                                        <Text style={styles.actionButtonText}>Tutup Detail</Text>
                                    </TouchableOpacity>
                                )
                            )}
                        </View>
                    </Animated.View>
                </Pressable>
            </Pressable>
        </Modal>
    );
};

const createStyles = (colors: any) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'transparent',
        justifyContent: 'center',
        alignItems: 'center',
        padding: SPACING.l,
    },
    cardContainer: {
        width: '100%',
        maxWidth: 500, // Better for web/tablet
        height: SCREEN_HEIGHT * 0.7, // Increased height for editing
    },
    backdrop: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.85)',
    },
    card: {
        flex: 1,
        backgroundColor: colors.surface,
        borderRadius: RADIUS.xl,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: colors.surfaceHighlight,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 12 },
        shadowOpacity: 0.6,
        shadowRadius: 24,
        elevation: 15,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: SPACING.l,
        borderBottomWidth: 1,
        borderBottomColor: colors.surfaceHighlight,
    },
    headerLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: SPACING.m,
    },
    headerRight: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    headerLabel: {
        ...FONTS.body,
        fontWeight: 'bold',
        color: colors.textSecondary,
        fontSize: 14,
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    iconCircle: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: colors.surfaceHighlight,
        justifyContent: 'center',
        alignItems: 'center',
    },
    closeButton: {
        padding: 8,
        backgroundColor: colors.surfaceHighlight,
        borderRadius: 20,
    },
    scrollContent: {
        flex: 1,
    },
    scrollInnerContent: {
        padding: SPACING.xl,
    },
    image: {
        width: '100%',
        aspectRatio: 1, // Square image
        borderRadius: RADIUS.l,
        marginBottom: SPACING.xl,
        backgroundColor: colors.surfaceHighlight,
    },
    title: {
        ...FONTS.header,
        fontSize: 28,
        color: colors.text,
        marginBottom: SPACING.m,
    },
    titleInput: {
        ...FONTS.header,
        fontSize: 24,
        color: colors.text,
        marginBottom: SPACING.m,
        padding: SPACING.s,
        backgroundColor: colors.surfaceHighlight,
        borderRadius: RADIUS.s,
    },
    divider: {
        height: 3,
        backgroundColor: colors.primary,
        width: 60,
        marginBottom: SPACING.xl,
        borderRadius: 1.5,
    },
    description: {
        ...FONTS.body,
        fontSize: 18,
        color: colors.textSecondary,
        lineHeight: 28,
    },
    titleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        marginBottom: SPACING.m,
        gap: SPACING.s,
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: SPACING.s,
    },
    seriesBadge: {
        backgroundColor: '#FFB800',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 8,
    },
    infoText: {
        ...FONTS.body,
        fontSize: 10,
        fontWeight: 'bold',
        color: 'white',
    },
    descriptionInput: {
        ...FONTS.body,
        fontSize: 16,
        color: colors.text,
        lineHeight: 24,
        minHeight: 150,
        padding: SPACING.m,
        backgroundColor: colors.surfaceHighlight,
        borderRadius: RADIUS.s,
    },
    footer: {
        padding: SPACING.l,
        borderTopWidth: 1,
        borderTopColor: colors.surfaceHighlight,
    },
    footerActions: {
        flexDirection: 'row',
        gap: SPACING.m,
    },
    actionButton: {
        backgroundColor: colors.primary,
        padding: SPACING.m,
        borderRadius: RADIUS.m,
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row',
        flex: 1,
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 5,
    },
    cancelButton: {
        backgroundColor: colors.surfaceHighlight,
        shadowColor: 'transparent',
    },
    saveButton: {
        backgroundColor: colors.success,
        shadowColor: colors.success,
    },
    statusPrimaryButton: {
        backgroundColor: colors.primary,
        shadowColor: colors.primary,
    },
    statusSuccessButton: {
        backgroundColor: colors.success,
        shadowColor: colors.success,
    },
    statusSecondaryButton: {
        backgroundColor: colors.surfaceHighlight,
        shadowColor: 'transparent',
        borderWidth: 1,
        borderColor: colors.surfaceHighlight,
    },
    actionButtonText: {
        ...FONTS.body,
        fontWeight: 'bold',
        color: 'white',
        fontSize: 16,
    },
    editWatchContainer: {
        flexDirection: 'row',
        gap: SPACING.m,
        marginBottom: SPACING.m,
    },
    editWatchField: {
        flex: 1,
        gap: SPACING.xs,
    },
    editWatchLabel: {
        ...FONTS.body,
        fontSize: 12,
        fontWeight: 'bold',
        color: colors.textSecondary,
    },
    smallInput: {
        ...FONTS.body,
        fontSize: 14,
        color: colors.text,
        backgroundColor: colors.surfaceHighlight,
        borderRadius: RADIUS.s,
        paddingHorizontal: SPACING.s,
        paddingVertical: 8,
        borderWidth: 1,
        borderColor: colors.surfaceHighlight,
    },
});

