import React, { memo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, Pressable, Platform } from 'react-native';
import Animated, { FadeInDown, Layout, useSharedValue, useAnimatedStyle, withSpring, withTiming, useAnimatedProps, interpolateColor } from 'react-native-reanimated';
import { CheckCircle, Clock, Eye, PauseCircle } from 'lucide-react-native';
import { SPACING, RADIUS, FONTS } from '../constants/collectzTheme';
import { useTheme } from '../context/ThemeContext';

interface CollectionItemProps {
    id: string;
    title: string;
    imageUri?: string;
    subtitle?: string;
    isCompleted: boolean;
    status: 'active' | 'completed' | 'dropped' | 'on_hold';
    onToggle: (id: string, current: boolean) => void;
    onUpdateStatus?: (id: string, newStatus: string) => void;
    onDetail?: (id: string) => void;
    onDelete?: (id: string) => void;
    onSelect?: (id: string) => void;
    isSelected?: boolean;
    isSelectionMode?: boolean;
    index: number;
    category?: string;
    seriesInfo?: string;
}

const AnimatedClock = Animated.createAnimatedComponent(Clock);
const AnimatedCheck = Animated.createAnimatedComponent(CheckCircle);

// StatusPopover removed as per consolidation plan

const StatusIconWithHover = ({ isCompleted, onPress }: { isCompleted: boolean, onPress: () => void }) => {
    const { colors, isDark } = useTheme();
    const scale = useSharedValue(1);
    const progress = useSharedValue(0);

    const animatedStyle = useAnimatedStyle(() => {
        const backgroundColor = interpolateColor(
            progress.value,
            [0, 1],
            ['transparent', isCompleted ? `${colors.success}40` : `${colors.textSecondary}25`]
        );
        return {
            transform: [{ scale: scale.value }],
            backgroundColor,
        };
    });

    const iconProps = useAnimatedProps(() => {
        const color = interpolateColor(
            progress.value,
            [0, 1],
            [isCompleted ? colors.success : colors.textSecondary, isCompleted ? colors.primary : colors.primary]
        );
        return { color };
    });

    const styles = createStyles(colors, isDark);

    return (
        <Pressable
            onPress={(e) => {
                e.stopPropagation();
                onPress();
            }}
            // @ts-ignore
            onHoverIn={() => {
                scale.value = withSpring(1.3, { damping: 10, stiffness: 100 });
                progress.value = withTiming(1, { duration: 200 });
            }}
            // @ts-ignore
            onHoverOut={() => {
                scale.value = withSpring(1, { damping: 10, stiffness: 100 });
                progress.value = withTiming(0, { duration: 200 });
            }}
            style={[styles.iconHoverContainer, animatedStyle, Platform.OS === 'web' && { cursor: 'pointer' } as any]}
        >
            {isCompleted ? (
                <AnimatedCheck animatedProps={iconProps} size={24} />
            ) : (
                <AnimatedClock animatedProps={iconProps} size={24} />
            )}
        </Pressable>
    );
};

export const CollectionItem = memo(({
    id, title, imageUri, subtitle, isCompleted, status, onToggle, onUpdateStatus, onDetail, onSelect,
    isSelected, isSelectionMode, index, category, seriesInfo
}: CollectionItemProps) => {
    const { colors, isDark } = useTheme();
    const styles = createStyles(colors, isDark);

    const handlePress = () => {
        if (isSelectionMode) {
            onSelect?.(id);
            return;
        }

        if (category === 'misc' || category === 'todo') {
            onDetail?.(id);
        } else {
            // Reading/Film: clicking body still opens detail
            onDetail?.(id);
        }
    };

    return (
        <Animated.View
            entering={FadeInDown.delay(index * 100).springify()}
            layout={Layout.springify()}
            style={styles.container}
        >
            <View style={[styles.contentContainer, isSelected && styles.selectedContainer]}>
                {isSelectionMode ? (
                    <Pressable
                        style={styles.selectionBody}
                        onPress={() => onSelect?.(id)}
                    >
                        <View style={styles.checkboxContainer}>
                            <View style={[styles.checkbox, isSelected && styles.checkboxActive]}>
                                {isSelected && <CheckCircle color="white" size={20} />}
                            </View>
                        </View>

                        <View style={styles.imageContainer}>
                            {imageUri ? (
                                <Image source={{ uri: imageUri }} style={styles.image} resizeMode="cover" />
                            ) : (
                                <View style={[styles.image, styles.placeholder]} />
                            )}
                        </View>

                        <View style={styles.textContainer}>
                            <Text style={[styles.title, (isCompleted && category !== 'misc') && styles.completedTitle]} numberOfLines={1}>
                                {title}{seriesInfo ? ` (${seriesInfo})` : ''}
                            </Text>
                        </View>
                    </Pressable>
                ) : (
                    <View style={styles.itemWrapper}>
                        {category === 'todo' && (
                            <View style={styles.todoCheckboxContainer}>
                                <StatusIconWithHover
                                    isCompleted={isCompleted}
                                    onPress={() => onToggle(id, isCompleted)}
                                />
                            </View>
                        )}

                        <Pressable
                            style={styles.bodyPressable}
                            onPress={handlePress}
                        >
                            <View style={styles.imageContainer}>
                                {imageUri ? (
                                    <Image source={{ uri: imageUri }} style={styles.image} resizeMode="cover" />
                                ) : (
                                    <View style={[styles.image, styles.placeholder]} />
                                )}
                            </View>

                            <View style={styles.textContainer}>
                                <Text style={[styles.title, (isCompleted && category !== 'misc') && styles.completedTitle]} numberOfLines={1}>
                                    {title}{seriesInfo ? ` (${seriesInfo})` : ''}
                                </Text>
                                {subtitle && category !== 'misc' && category !== 'todo' && (
                                    <Text style={styles.subtitle} numberOfLines={1}>{subtitle}</Text>
                                )}
                            </View>
                        </Pressable>

                        {category !== 'todo' && (
                            <View style={styles.action}>
                                {category === 'misc' ? (
                                    <Eye color={colors.textSecondary} size={24} />
                                ) : (category === 'reading' || category === 'watch') ? (
                                    <View style={styles.multiActionContainer}>
                                        <TouchableOpacity
                                            style={styles.editInfoBox}
                                            onPress={() => onDetail?.(id)}
                                        >
                                            <Text style={styles.editBtnText}>Edit</Text>
                                        </TouchableOpacity>
                                    </View>
                                ) : (
                                    <StatusIconWithHover
                                        isCompleted={isCompleted}
                                        onPress={() => onToggle(id, isCompleted)}
                                    />
                                )}
                            </View>
                        )}
                    </View>
                )}
            </View>
        </Animated.View>
    );
});

const createStyles = (colors: any, isDark: boolean) => StyleSheet.create({
    container: {
        marginBottom: SPACING.m,
        borderRadius: RADIUS.m,
        backgroundColor: colors.surface,
        borderWidth: 1,
        borderColor: colors.surfaceHighlight,
        overflow: 'hidden',
    },
    contentContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    itemWrapper: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        paddingRight: SPACING.s,
    },
    todoCheckboxContainer: {
        paddingLeft: SPACING.m,
        justifyContent: 'center',
        alignItems: 'center',
    },
    selectionBody: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        padding: SPACING.m,
    },
    bodyPressable: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        padding: SPACING.m,
    },
    selectedContainer: {
        backgroundColor: colors.surfaceHighlight,
    },
    checkboxContainer: {
        marginRight: SPACING.m,
    },
    checkbox: {
        width: 24,
        height: 24,
        borderRadius: 12,
        borderWidth: 2,
        borderColor: colors.surfaceHighlight,
        alignItems: 'center',
        justifyContent: 'center',
    },
    checkboxActive: {
        backgroundColor: colors.primary,
        borderColor: colors.primary,
    },
    imageContainer: {
        marginRight: SPACING.m,
    },
    image: {
        width: 50,
        height: 50,
        borderRadius: RADIUS.s,
        backgroundColor: colors.surfaceHighlight,
    },
    placeholder: {
        backgroundColor: colors.surfaceHighlight,
    },
    textContainer: {
        flex: 1,
        justifyContent: 'center',
    },
    title: {
        ...FONTS.title,
        color: colors.text,
        fontSize: 16,
    },
    completedTitle: {
        color: colors.textSecondary,
        textDecorationLine: 'line-through',
    },
    subtitle: {
        ...FONTS.body,
        fontSize: 12,
        color: colors.textSecondary,
        marginTop: 2,
    },
    action: {
        marginLeft: SPACING.s,
        marginRight: SPACING.m,
    },
    multiActionContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: SPACING.s,
    },
    editInfoBox: {
        backgroundColor: isDark ? 'rgba(63, 140, 255, 0.2)' : 'rgba(63, 140, 255, 0.1)',
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 6,
        borderWidth: 1,
        borderColor: isDark ? 'rgba(63, 140, 255, 0.4)' : 'rgba(63, 140, 255, 0.2)',
    },
    statusBubbleBtn: {
        backgroundColor: colors.surfaceHighlight,
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 6,
        borderWidth: 1,
        borderColor: colors.surfaceHighlight,
    },
    editBtnText: {
        fontSize: 12,
        fontWeight: '600',
        color: colors.primary,
    },
    statusBtnText: {
        fontSize: 12,
        fontWeight: '600',
        color: colors.textSecondary,
    },
    iconHoverContainer: {
        width: 44,
        height: 44,
        borderRadius: 22,
        alignItems: 'center',
        justifyContent: 'center',
    }
});
