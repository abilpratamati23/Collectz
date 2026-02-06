import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Modal, KeyboardAvoidingView, Platform, ScrollView, Image } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring, withTiming, Easing } from 'react-native-reanimated';
import { X, Image as ImageIcon } from 'lucide-react-native';
import { SPACING, RADIUS, FONTS } from '../constants/collectzTheme';
import { useTheme } from '../context/ThemeContext';
import * as ImagePicker from 'expo-image-picker';

interface AddCollectionModalProps {
    visible: boolean;
    onClose: () => void;
    onSave: (data: { name: string; description: string; image?: any; color: string; category: string }) => void;
    initialData?: {
        title: string;
        desc: string;
        imageUri?: string;
        color: string;
        category: string;
    };
}

const CATEGORIES = [
    { id: 'reading', label: 'Bacaan', icon: 'Book' },
    { id: 'watch', label: 'Film', icon: 'Film' },
    { id: 'todo', label: 'Todo', icon: 'CheckSquare' },
    { id: 'misc', label: 'Normal', icon: 'Folder' },
];

const PRESET_COLORS = [
    '#FF754C', '#6C5DD3', '#3F8CFF', '#FFB800',
    '#00D1FF', '#4ADE80', '#F87171', '#A78BFA',
    '#FB923C', '#34D399', '#60A5FA', '#F472B6'
];

export const AddCollectionModal = ({ visible, onClose, onSave, initialData }: AddCollectionModalProps) => {
    const { colors, isDark } = useTheme();
    const styles = createStyles(colors);
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [selectedColor, setSelectedColor] = useState(PRESET_COLORS[0]);
    const [selectedCategory, setSelectedCategory] = useState(CATEGORIES[3].id);
    const [selectedImage, setSelectedImage] = useState<string | null>(null);

    const translateY = useSharedValue(1000);
    const backdropOpacity = useSharedValue(0);

    React.useEffect(() => {
        if (visible) {
            // Populate if editing
            if (initialData) {
                setName(initialData.title);
                setDescription(initialData.desc);
                setSelectedColor(initialData.color);
                setSelectedCategory(initialData.category);
                setSelectedImage(initialData.imageUri || null);
            } else {
                // Clear if adding new
                setName('');
                setDescription('');
                setSelectedColor(PRESET_COLORS[0]);
                setSelectedCategory(CATEGORIES[3].id);
                setSelectedImage(null);
            }
            translateY.value = withSpring(0, { damping: 25, stiffness: 80 });
            backdropOpacity.value = withTiming(1, { duration: 400 });
        } else {
            translateY.value = withTiming(1000, { duration: 400, easing: Easing.in(Easing.ease) });
            backdropOpacity.value = withTiming(0, { duration: 300 });
        }
    }, [visible, initialData]);

    const animatedModalStyle = useAnimatedStyle(() => {
        return {
            transform: [{ translateY: translateY.value }],
        };
    });

    const animatedBackdropStyle = useAnimatedStyle(() => {
        return {
            opacity: backdropOpacity.value,
        };
    });

    const handleSave = () => {
        if (name.trim()) {
            onSave({
                name: name.trim(),
                description: description.trim(),
                image: selectedImage,
                color: selectedColor,
                category: selectedCategory,
            });
            onClose();
        }
    };

    const pickImage = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.8,
        });

        if (!result.canceled) {
            setSelectedImage(result.assets[0].uri);
        }
    };

    return (
        <Modal
            visible={visible}
            transparent
            animationType="none"
            onRequestClose={onClose}
        >
            <View style={styles.container}>
                <Animated.View style={[styles.backdrop, animatedBackdropStyle]}>
                    <TouchableOpacity
                        style={StyleSheet.absoluteFill}
                        activeOpacity={1}
                        onPress={onClose}
                    />
                </Animated.View>

                <Animated.View style={[styles.modal, animatedModalStyle]}>
                    <KeyboardAvoidingView
                        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                        style={styles.keyboardView}
                    >
                        <View style={styles.header}>
                            <Text style={styles.title}>{initialData ? 'Edit Collection' : 'Add New Collection'}</Text>
                            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                                <X color={colors.text} size={24} />
                            </TouchableOpacity>
                        </View>

                        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                            {/* Name Input */}
                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>Name *</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="e.g., Anime, Games, Books..."
                                    placeholderTextColor={colors.textSecondary}
                                    value={name}
                                    onChangeText={setName}
                                />
                            </View>

                            {/* Description Input */}
                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>Description</Text>
                                <TextInput
                                    style={[styles.input, styles.textArea]}
                                    placeholder="Brief description of this collection..."
                                    placeholderTextColor={colors.textSecondary}
                                    value={description}
                                    onChangeText={setDescription}
                                    multiline
                                    numberOfLines={3}
                                />
                            </View>

                            {/* Category Selector */}
                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>Category</Text>
                                <View style={styles.categoryContainer}>
                                    {CATEGORIES.map((cat) => (
                                        <TouchableOpacity
                                            key={cat.id}
                                            style={[
                                                styles.categoryChip,
                                                selectedCategory === cat.id && styles.categoryChipSelected,
                                                { borderColor: selectedColor }
                                            ]}
                                            onPress={() => setSelectedCategory(cat.id)}
                                        >
                                            <Text style={[
                                                styles.categoryText,
                                                selectedCategory === cat.id && { color: selectedColor, fontWeight: 'bold' }
                                            ]}>
                                                {cat.label}
                                            </Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            </View>

                            {/* Image Picker */}
                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>Image</Text>
                                <TouchableOpacity style={styles.imagePicker} onPress={pickImage}>
                                    {selectedImage ? (
                                        <Image source={{ uri: selectedImage }} style={styles.selectedImage} />
                                    ) : (
                                        <>
                                            <ImageIcon color={colors.textSecondary} size={32} />
                                            <Text style={styles.imagePickerText}>Tap to select image</Text>
                                        </>
                                    )}
                                </TouchableOpacity>
                            </View>

                            {/* Color Picker */}
                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>Color</Text>
                                <View style={styles.colorGrid}>
                                    {PRESET_COLORS.map((color) => (
                                        <TouchableOpacity
                                            key={color}
                                            style={[
                                                styles.colorOption,
                                                { backgroundColor: color },
                                                selectedColor === color && styles.colorOptionSelected
                                            ]}
                                            onPress={() => setSelectedColor(color)}
                                        />
                                    ))}
                                </View>
                            </View>
                        </ScrollView>

                        <View style={styles.footer}>
                            <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
                                <Text style={styles.cancelButtonText}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.saveButton, !name.trim() && styles.saveButtonDisabled]}
                                onPress={handleSave}
                                disabled={!name.trim()}
                            >
                                <Text style={styles.saveButtonText}>Save</Text>
                            </TouchableOpacity>
                        </View>
                    </KeyboardAvoidingView>
                </Animated.View>
            </View>
        </Modal>
    );
};

const createStyles = (colors: any) => StyleSheet.create({
    container: {
        flex: 1,
    },
    backdrop: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.7)',
    },
    modal: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: '70%',
        backgroundColor: colors.surface,
        borderTopLeftRadius: RADIUS.xl,
        borderTopRightRadius: RADIUS.xl,
        overflow: 'hidden',
    },
    keyboardView: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: SPACING.l,
        borderBottomWidth: 1,
        borderBottomColor: colors.surfaceHighlight,
    },
    title: {
        ...FONTS.title,
        fontSize: 20,
        color: colors.text,
    },
    closeButton: {
        padding: SPACING.s,
    },
    content: {
        flex: 1,
        padding: SPACING.l,
    },
    inputGroup: {
        marginBottom: SPACING.l,
    },
    label: {
        ...FONTS.body,
        fontSize: 14,
        fontWeight: '600',
        color: colors.text,
        marginBottom: SPACING.s,
    },
    input: {
        ...FONTS.body,
        backgroundColor: colors.background,
        borderRadius: RADIUS.m,
        padding: SPACING.m,
        color: colors.text,
        borderWidth: 1,
        borderColor: colors.surfaceHighlight,
    },
    textArea: {
        height: 80,
        textAlignVertical: 'top',
    },
    imagePicker: {
        height: 120,
        backgroundColor: colors.background,
        borderRadius: RADIUS.m,
        borderWidth: 2,
        borderStyle: 'dashed',
        borderColor: colors.surfaceHighlight,
        alignItems: 'center',
        justifyContent: 'center',
    },
    selectedImage: {
        width: '100%',
        height: '100%',
        borderRadius: RADIUS.m,
    },
    imagePickerText: {
        ...FONTS.body,
        color: colors.textSecondary,
        marginTop: SPACING.s,
    },
    colorGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: SPACING.m,
    },
    colorOption: {
        width: 48,
        height: 48,
        borderRadius: 24,
        borderWidth: 3,
        borderColor: 'transparent',
    },
    colorOptionSelected: {
        borderColor: colors.text,
        transform: [{ scale: 1.1 }],
    },
    footer: {
        flexDirection: 'row',
        gap: SPACING.m,
        padding: SPACING.l,
        borderTopWidth: 1,
        borderTopColor: colors.surfaceHighlight,
    },
    cancelButton: {
        flex: 1,
        padding: SPACING.m,
        borderRadius: RADIUS.m,
        backgroundColor: colors.background,
        alignItems: 'center',
    },
    cancelButtonText: {
        ...FONTS.body,
        fontWeight: '600',
        color: colors.text,
    },
    saveButton: {
        flex: 1,
        padding: SPACING.m,
        borderRadius: RADIUS.m,
        backgroundColor: colors.primary,
        alignItems: 'center',
    },
    saveButtonDisabled: {
        opacity: 0.5,
    },
    saveButtonText: {
        ...FONTS.body,
        fontWeight: '600',
        color: 'white',
    },
    categoryContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: SPACING.s,
    },
    categoryChip: {
        paddingHorizontal: SPACING.m,
        paddingVertical: SPACING.s,
        borderRadius: RADIUS.l,
        borderWidth: 1,
        borderColor: colors.surfaceHighlight,
        backgroundColor: colors.surface,
    },
    categoryChipSelected: {
        backgroundColor: colors.surfaceHighlight,
        borderWidth: 2,
    },
    categoryText: {
        ...FONTS.body,
        fontSize: 14,
        color: colors.text,
    },
});
