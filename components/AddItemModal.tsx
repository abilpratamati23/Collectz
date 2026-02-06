import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Modal, KeyboardAvoidingView, Platform, Image, ScrollView, Dimensions, Alert } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring, withTiming, Easing } from 'react-native-reanimated';
import { X, Image as ImageIcon } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import { SPACING, RADIUS, FONTS } from '../constants/collectzTheme';
import { useTheme } from '../context/ThemeContext';

interface AddItemModalProps {
    visible: boolean;
    onClose: () => void;
    onSave: (data: { title: string; subtitle: string; imageUri?: string; seriesInfo?: string }) => void;
    collectionName: string;
    category?: string;
}

export const AddItemModal = ({ visible, onClose, onSave, collectionName, category }: AddItemModalProps) => {
    const { colors, isDark } = useTheme();
    const styles = createStyles(colors);
    const [title, setTitle] = useState('');
    const [subtitle, setSubtitle] = useState('');
    const [imageUri, setImageUri] = useState('');
    const [seriesInfo, setSeriesInfo] = useState('');

    const translateY = useSharedValue(1000);
    const backdropOpacity = useSharedValue(0);

    React.useEffect(() => {
        if (visible) {
            translateY.value = withSpring(0, { damping: 25, stiffness: 80 });
            backdropOpacity.value = withTiming(1, { duration: 400 });
        } else {
            translateY.value = withTiming(1000, { duration: 400, easing: Easing.in(Easing.ease) });
            backdropOpacity.value = withTiming(0, { duration: 300 });
        }
    }, [visible]);

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

    const pickImage = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

        if (status !== 'granted') {
            Alert.alert('Izin Ditolak', 'Maaf, kami butuh izin galeri untuk mengunggah gambar.');
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.7,
        });

        if (!result.canceled) {
            setImageUri(result.assets[0].uri);
        }
    };

    const handleSave = () => {
        if (title.trim()) {
            onSave({
                title: title.trim(),
                subtitle: subtitle.trim(),
                imageUri: imageUri || undefined,
                seriesInfo: category === 'watch' ? seriesInfo.trim() : undefined,
            });
            setTitle('');
            setSubtitle('');
            setImageUri('');
            setSeriesInfo('');
            onClose();
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
                            <Text style={styles.title}>Add to {collectionName}</Text>
                            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                                <X color={colors.text} size={24} />
                            </TouchableOpacity>
                        </View>

                        <ScrollView style={styles.contentScroll} showsVerticalScrollIndicator={false}>
                            <View style={styles.content}>
                                <View style={styles.inputGroup}>
                                    <Text style={styles.label}>
                                        {category === 'misc' ? 'Nama' :
                                            (category === 'reading' || category === 'watch') ? 'Judul' : 'Title'} *
                                    </Text>
                                    <TextInput
                                        style={styles.input}
                                        placeholder={
                                            category === 'misc' ? 'Masukkan nama...' :
                                                category === 'reading' ? 'Masukkan judul bacaan...' :
                                                    category === 'watch' ? 'Masukkan judul film...' :
                                                        "e.g., The Hobbit, Avengers, etc."
                                        }
                                        placeholderTextColor={colors.textSecondary}
                                        value={title}
                                        onChangeText={setTitle}
                                    />
                                </View>

                                {category === 'watch' ? (
                                    <>
                                        <View style={styles.inputGroup}>
                                            <Text style={styles.label}>Series ke</Text>
                                            <TextInput
                                                style={styles.input}
                                                placeholder="Contoh: Season 1, Eps 12..."
                                                placeholderTextColor={colors.textSecondary}
                                                value={seriesInfo}
                                                onChangeText={setSeriesInfo}
                                            />
                                        </View>
                                        <View style={styles.inputGroup}>
                                            <Text style={styles.label}>Tahun</Text>
                                            <TextInput
                                                style={styles.input}
                                                placeholder="Contoh: 2024..."
                                                placeholderTextColor={colors.textSecondary}
                                                value={subtitle}
                                                onChangeText={setSubtitle}
                                            />
                                        </View>
                                    </>
                                ) : (
                                    <View style={styles.inputGroup}>
                                        <Text style={styles.label}>
                                            {category === 'reading' ? 'Chapter' :
                                                (category === 'misc' || category === 'todo') ? 'Deskripsi' : 'Subtitle / Note'}
                                        </Text>
                                        <TextInput
                                            style={[styles.input, (category === 'misc' || category === 'todo') && styles.multilineInput]}
                                            placeholder={
                                                category === 'reading' ? 'Masukkan chapter (contoh: Ch. 12)' :
                                                    (category === 'misc' || category === 'todo') ? 'Masukkan deskripsi...' :
                                                        "e.g., Year 2012, Chapter 5..."
                                            }
                                            placeholderTextColor={colors.textSecondary}
                                            value={subtitle}
                                            onChangeText={setSubtitle}
                                            multiline={category === 'misc' || category === 'todo'}
                                        />
                                    </View>
                                )}

                                {(category === 'misc' || category === 'reading' || category === 'watch' || category === 'todo') && (
                                    <View style={styles.inputGroup}>
                                        <Text style={styles.label}>Gambar (Opsional)</Text>
                                        <TouchableOpacity style={styles.imagePicker} onPress={pickImage}>
                                            {imageUri ? (
                                                <View style={styles.previewContainer}>
                                                    <Image source={{ uri: imageUri }} style={styles.previewImage} />
                                                    <TouchableOpacity style={styles.removeImage} onPress={() => setImageUri('')}>
                                                        <X color="white" size={16} />
                                                    </TouchableOpacity>
                                                </View>
                                            ) : (
                                                <View style={styles.pickerPlaceholder}>
                                                    <ImageIcon color={colors.textSecondary} size={32} />
                                                    <Text style={styles.pickerText}>Pilih Foto dari Galeri</Text>
                                                </View>
                                            )}
                                        </TouchableOpacity>
                                    </View>
                                )}

                                <TouchableOpacity
                                    style={[styles.saveButton, !title.trim() && styles.saveButtonDisabled]}
                                    onPress={handleSave}
                                    disabled={!title.trim()}
                                >
                                    <Text style={styles.saveButtonText}>Save Item</Text>
                                </TouchableOpacity>
                            </View>
                        </ScrollView>
                    </KeyboardAvoidingView>
                </Animated.View>
            </View>
        </Modal >
    );
};

const createStyles = (colors: any) => StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'flex-end',
    },
    backdrop: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.7)',
    },
    modal: {
        backgroundColor: colors.surface,
        borderTopLeftRadius: RADIUS.xl,
        borderTopRightRadius: RADIUS.xl,
        maxHeight: Dimensions.get('window').height * 0.8,
    },
    keyboardView: {
        width: '100%',
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
    contentScroll: {
        flex: 1,
    },
    content: {
        padding: SPACING.l,
        gap: SPACING.l,
    },
    inputGroup: {
        gap: SPACING.s,
    },
    label: {
        ...FONTS.body,
        fontSize: 14,
        fontWeight: '600',
        color: colors.text,
    },
    input: {
        ...FONTS.body,
        backgroundColor: colors.background,
        borderRadius: RADIUS.m,
        padding: SPACING.m,
        color: colors.text,
        borderWidth: 1,
        borderColor: colors.surfaceHighlight,
        fontSize: 16,
    },
    imagePicker: {
        width: '100%',
        height: 180,
        backgroundColor: colors.background,
        borderRadius: RADIUS.m,
        borderWidth: 1,
        borderColor: colors.surfaceHighlight,
        borderStyle: 'dashed',
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
    },
    pickerPlaceholder: {
        alignItems: 'center',
        gap: SPACING.s,
    },
    pickerText: {
        ...FONTS.body,
        color: colors.textSecondary,
        fontSize: 14,
    },
    previewContainer: {
        width: '100%',
        height: '100%',
    },
    previewImage: {
        width: '100%',
        height: '100%',
    },
    removeImage: {
        position: 'absolute',
        top: 10,
        right: 10,
        backgroundColor: 'rgba(0,0,0,0.6)',
        padding: 4,
        borderRadius: 12,
    },
    saveButton: {
        backgroundColor: colors.primary,
        padding: SPACING.m,
        borderRadius: RADIUS.m,
        alignItems: 'center',
        marginTop: SPACING.s,
        marginBottom: Platform.OS === 'ios' ? 40 : 20,
    },
    saveButtonDisabled: {
        opacity: 0.5,
    },
    saveButtonText: {
        ...FONTS.body,
        fontWeight: '700',
        color: 'white',
        fontSize: 16,
    },
    multilineInput: {
        minHeight: 120,
        textAlignVertical: 'top',
    },
});
