import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, ImageBackground, Platform, useWindowDimensions, TouchableOpacity, Modal, Dimensions } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring, interpolate, FadeInDown, withTiming, FadeIn, FadeOut, ZoomOut, LinearTransition } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { SPACING, RADIUS, FONTS } from '../constants/collectzTheme';
import { useTheme } from '../context/ThemeContext';
import { MoreVertical, Edit, Archive, Trash2 } from 'lucide-react-native';

interface Props {
    title: string;
    description: string;
    color: string;
    icon: React.ReactNode;
    onPress: () => void;
    index: number;
    imageSource?: any;
    onArchive?: () => void;
    onTrash?: () => void;
    onRestore?: () => void;
    onEdit?: () => void;
    viewMode?: 'active' | 'archived' | 'trashed';
    style?: any;
}

interface MenuItemProps {
    onPress: (e: any) => void;
    icon: any;
    label: string;
    isDestructive?: boolean;
}

const MenuHoverItem = ({ onPress, icon: Icon, label, isDestructive }: MenuItemProps) => {
    const { colors, isDark } = useTheme();
    const scale = useSharedValue(1);
    const colorValue = useSharedValue(0); // 0: default, 1: hovered

    const animatedStyle = useAnimatedStyle(() => {
        const scaleVal = withTiming(scale.value, { duration: 150 });
        const backgroundColor = withTiming(
            colorValue.value === 1
                ? (isDestructive ? 'rgba(255, 76, 76, 0.15)' : (isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)'))
                : 'transparent',
            { duration: 200 }
        );

        return {
            transform: [{ scale: scaleVal }],
            backgroundColor,
            borderRadius: RADIUS.s,
        };
    });

    // Use current color in state to swap icon color smoothly if R-N-Animations don't support it directly on icons
    const [isHovered, setIsHovered] = useState(false);

    const textColor = useAnimatedStyle(() => {
        const color = withTiming(
            colorValue.value === 1
                ? (isDestructive ? colors.danger : (isDark ? '#FFFFFF' : '#666666'))
                : (isDestructive ? colors.danger : colors.text),
            { duration: 200 }
        );
        return { color };
    });

    const iconColor = isHovered
        ? (isDestructive ? colors.danger : (isDark ? '#FFFFFF' : '#666666'))
        : (isDestructive ? colors.danger : colors.text);

    return (
        <Pressable
            onPress={onPress}
            // @ts-ignore
            onHoverIn={() => {
                scale.value = 1.05;
                colorValue.value = 1;
                setIsHovered(true);
            }}
            onHoverOut={() => {
                scale.value = 1;
                colorValue.value = 0;
                setIsHovered(false);
            }}
            style={({ pressed }) => [
                {
                    flexDirection: 'row',
                    alignItems: 'center',
                    paddingVertical: SPACING.s,
                    paddingHorizontal: SPACING.m,
                    gap: SPACING.s,
                },
                pressed && { opacity: 0.7, transform: [{ scale: 0.98 }] },
                animatedStyle
            ]}
        >
            <Icon size={16} color={iconColor} />
            <Animated.Text style={[{ ...FONTS.body, fontSize: 14, color: colors.text }, textColor]}>{label}</Animated.Text>
        </Pressable>
    );
};

export const CategoryCard = ({ title, description, color, icon, onPress, index, imageSource, onArchive, onTrash, onRestore, onEdit, viewMode = 'active', style }: Props) => {
    const { colors, isDark } = useTheme();
    const { width } = useWindowDimensions();
    const styles = createStyles(colors, isDark, width);
    const isLargeScreen = width > 1024;

    const scale = useSharedValue(1);
    const hoverScale = useSharedValue(1);
    const [menuVisible, setMenuVisible] = useState(false);

    const animatedStyle = useAnimatedStyle(() => {
        return {
            transform: [{ scale: scale.value * hoverScale.value }],
        };
    });

    // Interaction handlers
    const handlePressIn = () => {
        scale.value = withSpring(0.95);
    };

    const handlePressOut = () => {
        scale.value = withSpring(1);
    };

    const handleHoverIn = () => {
        if (Platform.OS === 'web' && !menuVisible) {
            hoverScale.value = withSpring(1.05);
        }
    };

    const handleHoverOut = () => {
        if (Platform.OS === 'web') {
            hoverScale.value = withSpring(1);
        }
    };

    const toggleMenu = (e: any) => {
        e.stopPropagation();
        const nextVisible = !menuVisible;
        setMenuVisible(nextVisible);
        if (nextVisible) {
            hoverScale.value = withSpring(1);
        }
    };

    return (
        <Animated.View
            entering={FadeInDown.delay(index * 100).springify().damping(15)}
            exiting={ZoomOut.duration(300)}
            layout={LinearTransition.springify().damping(15)}
            style={[
                styles.container,
                animatedStyle,
                { width: isLargeScreen ? '32%' : (width > 600 ? '48%' : '100%') },
                style // Override
            ]}
        >
            <Pressable
                onPress={onPress}
                onPressIn={handlePressIn}
                onPressOut={handlePressOut}
                // @ts-ignore - web-only hover props
                onHoverIn={handleHoverIn}
                onHoverOut={handleHoverOut}
                style={styles.pressable}
            >
                <ImageBackground
                    source={imageSource}
                    style={StyleSheet.absoluteFill}
                    imageStyle={styles.backgroundImage}
                >
                    <LinearGradient
                        colors={[`${color}${isDark ? '99' : 'CC'}`, `${color}${isDark ? 'B3' : 'E6'}`, colors.surfaceHighlight]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.gradientOverlay}
                    >
                        <View style={styles.topRow}>
                            <View style={styles.iconContainer}>
                                {icon}
                            </View>
                            <TouchableOpacity onPress={toggleMenu} style={styles.menuButton}>
                                <MoreVertical color="white" size={20} />
                            </TouchableOpacity>
                        </View>

                        <View style={styles.content}>
                            <Text style={styles.title}>{title}</Text>
                            <Text style={styles.description}>{description}</Text>
                        </View>
                    </LinearGradient>
                </ImageBackground>

                {menuVisible && (
                    <Animated.View
                        entering={FadeIn.duration(200)}
                        exiting={FadeOut.duration(150)}
                        style={styles.menuOverlay}
                    >
                        <View style={styles.menuContainer}>
                            {viewMode === 'active' && (
                                <>
                                    <MenuHoverItem
                                        onPress={(e) => { e.stopPropagation(); setMenuVisible(false); if (onEdit) onEdit(); }}
                                        icon={Edit}
                                        label="Edit"
                                    />
                                    <MenuHoverItem
                                        onPress={(e) => { e.stopPropagation(); setMenuVisible(false); if (onArchive) onArchive(); }}
                                        icon={Archive}
                                        label="Arsip"
                                    />
                                    <View style={styles.menuDivider} />
                                    <MenuHoverItem
                                        onPress={(e) => { e.stopPropagation(); setMenuVisible(false); if (onTrash) onTrash(); }}
                                        icon={Trash2}
                                        label="Sampah"
                                        isDestructive
                                    />
                                </>
                            )}
                            {viewMode === 'archived' && (
                                <MenuHoverItem
                                    onPress={(e) => { e.stopPropagation(); setMenuVisible(false); if (onRestore) onRestore(); }}
                                    icon={Archive}
                                    label="Keluarkan dari Arisp"
                                />
                            )}
                            {viewMode === 'trashed' && (
                                <MenuHoverItem
                                    onPress={(e) => { e.stopPropagation(); setMenuVisible(false); if (onRestore) onRestore(); }}
                                    icon={Archive}
                                    label="Keluarkan dari Sampah"
                                />
                            )}
                        </View>
                    </Animated.View>
                )}
            </Pressable>
        </Animated.View>
    );
};

const createStyles = (colors: any, isDark: boolean, width: number) => StyleSheet.create({
    container: {
        aspectRatio: width > 600 ? 1.1 : 1.6,
        borderRadius: RADIUS.l,
        marginBottom: SPACING.m,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: isDark ? 0.5 : 0.3,
        shadowRadius: 8,
        elevation: 10,
    },
    pressable: {
        flex: 1,
        borderRadius: RADIUS.l,
        overflow: 'hidden',
    },
    background: {
        flex: 1,
    },
    backgroundImage: {
        borderRadius: RADIUS.l,
        opacity: isDark ? 0.4 : 0.65,
    },
    gradientOverlay: {
        flex: 1,
        padding: SPACING.m,
        justifyContent: 'space-between',
    },
    topRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
    },
    iconContainer: {
        width: 40,
        height: 40,
        borderRadius: RADIUS.m,
        backgroundColor: 'rgba(255,255,255,0.2)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    menuButton: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: 'rgba(0,0,0,0.2)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    content: {
        gap: 4,
    },
    title: {
        ...FONTS.title,
        color: 'white',
        fontSize: 24,
        fontWeight: '800',
        letterSpacing: 0.5,
        textShadowColor: 'rgba(0,0,0,0.3)',
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 2,
    },
    description: {
        ...FONTS.body,
        fontSize: 14,
        fontWeight: '500',
        color: 'rgba(255,255,255,0.9)',
        marginTop: 2,
    },
    menuOverlay: {
        position: 'absolute',
        top: SPACING.m + 32 + 4,
        right: SPACING.m,
        backgroundColor: colors.surface,
        borderRadius: RADIUS.m,
        padding: SPACING.xs,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 5 },
        shadowOpacity: 0.25,
        shadowRadius: 10,
        elevation: 20,
        zIndex: 100,
        minWidth: 120,
    },
    menuContainer: {
        overflow: 'hidden',
    },
    menuDivider: {
        height: 1,
        backgroundColor: colors.surfaceHighlight,
        marginVertical: SPACING.xs,
        marginHorizontal: SPACING.s,
    },
});

