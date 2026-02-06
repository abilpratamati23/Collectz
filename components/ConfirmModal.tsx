import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, Pressable } from 'react-native';
import { SPACING, RADIUS, FONTS } from '../constants/collectzTheme';
import { useTheme } from '../context/ThemeContext';
import { BlurView } from 'expo-blur';
import Animated, { FadeIn, FadeOut, ZoomIn, ZoomOut } from 'react-native-reanimated';

interface ConfirmModalProps {
    visible: boolean;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    onConfirm: () => void;
    onCancel: () => void;
    isDestructive?: boolean;
}

export const ConfirmModal = ({
    visible,
    title,
    message,
    confirmText = "Confirm",
    cancelText = "Cancel",
    onConfirm,
    onCancel,
    isDestructive = false
}: ConfirmModalProps) => {
    const { colors, isDark } = useTheme();
    const styles = createStyles(colors);

    if (!visible) return null;

    return (
        <Modal transparent visible={visible} animationType="none" onRequestClose={onCancel}>
            <View style={styles.overlay}>
                {/* Backdrop with Blur */}
                <Pressable style={StyleSheet.absoluteFill} onPress={onCancel}>
                    <Animated.View
                        entering={FadeIn}
                        exiting={FadeOut}
                        style={[styles.backdrop, { backgroundColor: colors.overlay }]}
                    />
                </Pressable>

                {/* Modal Content */}
                <Animated.View
                    entering={ZoomIn.duration(200)}
                    exiting={ZoomOut.duration(200)}
                    style={styles.container}
                >
                    <Text style={styles.title}>{title}</Text>
                    <Text style={styles.message}>{message}</Text>

                    <View style={styles.buttonRow}>
                        <TouchableOpacity style={[styles.button, styles.cancelButton]} onPress={onCancel}>
                            <Text style={styles.cancelText}>{cancelText}</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[
                                styles.button,
                                styles.confirmButton,
                                isDestructive ? { backgroundColor: colors.danger } : { backgroundColor: colors.primary }
                            ]}
                            onPress={onConfirm}
                        >
                            <Text style={styles.confirmText}>{confirmText}</Text>
                        </TouchableOpacity>
                    </View>
                </Animated.View>
            </View>
        </Modal>
    );
};

const createStyles = (colors: any) => StyleSheet.create({
    overlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: SPACING.l,
    },
    backdrop: {
        ...StyleSheet.absoluteFillObject,
    },
    container: {
        width: '100%',
        maxWidth: 400,
        backgroundColor: colors.surface,
        borderRadius: RADIUS.l,
        padding: SPACING.xl,
        borderWidth: 1,
        borderColor: colors.surfaceHighlight,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.3,
        shadowRadius: 20,
        elevation: 10,
    },
    title: {
        ...FONTS.subHeader,
        fontSize: 22,
        color: colors.text,
        marginBottom: SPACING.s,
        textAlign: 'center',
    },
    message: {
        ...FONTS.body,
        fontSize: 16,
        color: colors.textSecondary,
        textAlign: 'center',
        marginBottom: SPACING.l,
        lineHeight: 24,
    },
    buttonRow: {
        flexDirection: 'row',
        gap: SPACING.m,
        justifyContent: 'center',
    },
    button: {
        flex: 1,
        paddingVertical: 14,
        borderRadius: RADIUS.m,
        alignItems: 'center',
        justifyContent: 'center',
    },
    cancelButton: {
        backgroundColor: colors.background,
        borderWidth: 1,
        borderColor: colors.surfaceHighlight,
    },
    confirmButton: {
        backgroundColor: colors.primary,
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
    },
    cancelText: {
        ...FONTS.body,
        fontWeight: '600',
        color: colors.textSecondary,
    },
    confirmText: {
        ...FONTS.body,
        fontWeight: '700',
        color: 'white',
    }
});
