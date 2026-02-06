import * as React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, Pressable, Modal } from 'react-native';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withTiming,
    FadeInDown,
    FadeOut,
    FadeIn,
    withSpring,
    interpolateColor,
    interpolate
} from 'react-native-reanimated';
import { COLORS, SPACING, RADIUS, FONTS } from '../constants/collectzTheme';
import { Home, Settings, LogOut, X, Archive, Trash2, Moon, Sun } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '../context/ThemeContext';

const { width } = Dimensions.get('window');
const SIDEBAR_WIDTH = 280;

interface SidebarContextType {
    isOpen: boolean;
    openSidebar: () => void;
    closeSidebar: () => void;
}

const SidebarContext = React.createContext<SidebarContextType | undefined>(undefined);

export const SidebarProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [isOpen, setIsOpen] = React.useState(false);
    const [showLogoutConfirm, setShowLogoutConfirm] = React.useState(false);
    const router = useRouter();
    const { colors, isDark, toggleTheme } = useTheme();
    const styles = createStyles(colors);

    // Reanimated Shared Values
    const progress = useSharedValue(0); // 0 to 1

    const openSidebar = () => {
        setIsOpen(true);
        progress.value = withTiming(1, { duration: 300 });
    };

    const closeSidebar = () => {
        progress.value = withTiming(0, { duration: 250 }, (finished) => {
            if (finished) {
                // Done
            }
        });
        setTimeout(() => setIsOpen(false), 250);
    };

    const sidebarStyle = useAnimatedStyle(() => {
        const translateX = interpolate(progress.value, [0, 1], [-SIDEBAR_WIDTH, 0]);
        return {
            transform: [{ translateX }],
            backgroundColor: colors.surface,
        };
    });

    const overlayStyle = useAnimatedStyle(() => {
        const opacity = interpolate(progress.value, [0, 1], [0, 1]);
        return {
            opacity,
            backgroundColor: colors.overlay,
        };
    });

    return (
        <SidebarContext.Provider value={{ isOpen, openSidebar, closeSidebar }}>
            {children}

            {isOpen && (
                <>
                    <Pressable
                        style={StyleSheet.absoluteFill}
                        onPress={closeSidebar}
                    >
                        <Animated.View style={[styles.overlay, overlayStyle]} />
                    </Pressable>

                    <Animated.View style={[styles.sidebar, sidebarStyle]}>
                        <View style={styles.header}>
                            <Text style={[styles.logoText, { color: colors.primary }]}>Collectz.</Text>
                            <TouchableOpacity onPress={closeSidebar} style={styles.closeIcon}>
                                <X color={colors.text} size={24} />
                            </TouchableOpacity>
                        </View>

                        <View style={styles.menu}>
                            <SidebarItem
                                icon={<Home color={colors.primary} size={22} />}
                                label="Home"
                                onPress={() => { closeSidebar(); router.push('/dashboard'); }}
                            />
                            <SidebarItem
                                icon={<Archive color={colors.primary} size={22} />}
                                label="Arsip"
                                onPress={() => { closeSidebar(); router.push({ pathname: '/dashboard', params: { view: 'archived' } }); }}
                            />
                            <SidebarItem
                                icon={<Trash2 color={colors.primary} size={22} />}
                                label="Sampah"
                                onPress={() => { closeSidebar(); router.push({ pathname: '/dashboard', params: { view: 'trashed' } }); }}
                            />
                            <View style={[styles.divider, { backgroundColor: colors.surfaceHighlight }]} />
                            <SidebarItem
                                icon={<Settings color={colors.primary} size={22} />}
                                label="Settings"
                                onPress={() => { closeSidebar(); router.push('/settings'); }}
                            />
                            <View style={[styles.divider, { backgroundColor: colors.surfaceHighlight }]} />
                            <SidebarItem
                                icon={<LogOut color={colors.danger} size={22} />}
                                label="Logout"
                                onPress={() => { setShowLogoutConfirm(true); }}
                                color={colors.danger}
                            />
                        </View>

                        <View style={styles.footer}>
                            <Text style={[styles.footerText, { color: colors.textSecondary }]}>v1.0.0</Text>
                        </View>
                    </Animated.View>
                </>
            )}

            <Modal
                visible={showLogoutConfirm}
                transparent
                animationType="none"
                onRequestClose={() => setShowLogoutConfirm(false)}
            >
                <View style={styles.modalOverlay}>
                    <Animated.View
                        entering={FadeInDown.springify()}
                        exiting={FadeOut.duration(200)}
                        style={[styles.modalContent, { backgroundColor: colors.background }]}
                    >
                        <Text style={[styles.modalTitle, { color: colors.text }]}>Konfirmasi Keluar</Text>
                        <Text style={[styles.modalText, { color: colors.textSecondary }]}>Apakah Anda yakin ingin keluar dari halaman koleksi?</Text>

                        <View style={styles.modalButtons}>
                            <TouchableOpacity
                                style={[styles.modalButton, styles.cancelButton, { backgroundColor: colors.surfaceHighlight }]}
                                onPress={() => setShowLogoutConfirm(false)}
                            >
                                <Text style={[styles.cancelButtonText, { color: colors.text }]}>Tidak</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[styles.modalButton, styles.confirmButton, { backgroundColor: colors.danger }]}
                                onPress={() => {
                                    setShowLogoutConfirm(false);
                                    closeSidebar();
                                    router.replace('/');
                                }}
                            >
                                <Text style={styles.confirmButtonText}>Ya, Keluar</Text>
                            </TouchableOpacity>
                        </View>
                    </Animated.View>
                </View>
            </Modal>
        </SidebarContext.Provider>
    );
};

export const useSidebar = () => {
    const context = React.useContext(SidebarContext);
    if (!context) throw new Error('useSidebar must be used within SidebarProvider');
    return context;
};

const SidebarItem = ({ icon, label, onPress, color }: { icon: React.ReactNode, label: string, onPress: () => void, color?: string }) => {
    const { colors } = useTheme();
    const styles = createStyles(colors);
    const scale = useSharedValue(1);
    const progress = useSharedValue(0);

    const rStyle = useAnimatedStyle(() => {
        const backgroundColor = interpolateColor(
            progress.value,
            [0, 1],
            ['transparent', colors.surfaceHighlight]
        );
        return {
            transform: [{ scale: scale.value }],
            backgroundColor,
        };
    });

    const handleHoverIn = () => {
        scale.value = withSpring(1.05);
        progress.value = withTiming(1, { duration: 200 });
    };

    const handleHoverOut = () => {
        scale.value = withSpring(1);
        progress.value = withTiming(0, { duration: 200 });
    };

    const handlePressIn = () => {
        scale.value = withSpring(0.95);
        progress.value = withTiming(1, { duration: 100 });
    };

    const handlePressOut = () => {
        scale.value = withSpring(1);
        progress.value = withTiming(0, { duration: 200 });
    };

    return (
        <Pressable
            onPress={onPress}
            onHoverIn={handleHoverIn}
            onHoverOut={handleHoverOut}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
        >
            <Animated.View style={[styles.item, rStyle]}>
                <View style={styles.iconContainer}>{icon}</View>
                <Text style={[styles.label, { color: color || colors.text }]}>{label}</Text>
            </Animated.View>
        </Pressable>
    );
};

const createStyles = (colors: any) => StyleSheet.create({
    overlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: colors.overlay,
    },
    sidebar: {
        position: 'absolute',
        top: 0,
        left: 0,
        bottom: 0,
        width: SIDEBAR_WIDTH,
        backgroundColor: colors.surface,
        paddingTop: 60,
        zIndex: 1000,
        elevation: 20,
        shadowColor: '#000',
        shadowOffset: { width: 10, height: 0 },
        shadowOpacity: 0.1,
        shadowRadius: 20,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: SPACING.l,
        marginBottom: SPACING.xl,
    },
    logoText: {
        fontSize: 24,
        fontWeight: '900',
        color: colors.primary,
        letterSpacing: -1,
    },
    closeIcon: {
        padding: 4,
    },
    menu: {
        paddingHorizontal: SPACING.m,
        gap: SPACING.s,
    },
    item: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: SPACING.m,
        borderRadius: RADIUS.m,
        backgroundColor: 'transparent',
    },
    iconContainer: {
        width: 32,
        alignItems: 'center',
        marginRight: SPACING.m,
    },
    label: {
        fontSize: 16,
        fontWeight: '600',
        color: colors.text,
    },
    divider: {
        height: 1,
        backgroundColor: colors.surfaceHighlight,
        marginVertical: SPACING.m,
        marginHorizontal: SPACING.m,
    },
    footer: {
        position: 'absolute',
        bottom: 40,
        left: 0,
        right: 0,
        alignItems: 'center',
    },
    footerText: {
        color: colors.textSecondary,
        fontSize: 12,
        opacity: 0.5,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: SPACING.l,
    },
    modalContent: {
        width: '90%',
        maxWidth: 400,
        backgroundColor: colors.background,
        borderRadius: RADIUS.l,
        padding: SPACING.xl,
        alignItems: 'center',
        elevation: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.2,
        shadowRadius: 20,
    },
    modalTitle: {
        ...FONTS.header,
        fontSize: 20,
        color: colors.text,
        marginBottom: SPACING.m,
    },
    modalText: {
        ...FONTS.body,
        textAlign: 'center',
        color: colors.textSecondary,
        marginBottom: SPACING.xl,
        lineHeight: 22,
    },
    modalButtons: {
        flexDirection: 'row',
        gap: SPACING.m,
        width: '100%',
    },
    modalButton: {
        flex: 1,
        paddingVertical: 14,
        borderRadius: RADIUS.m,
        alignItems: 'center',
        justifyContent: 'center',
    },
    cancelButton: {
        backgroundColor: colors.surfaceHighlight,
    },
    confirmButton: {
        backgroundColor: colors.danger,
    },
    cancelButtonText: {
        fontWeight: '700',
        color: colors.text,
    },
    confirmButtonText: {
        fontWeight: '700',
        color: 'white',
    }
});
