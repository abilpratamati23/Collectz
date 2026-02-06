import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, Image, Platform, SafeAreaView, ScrollView, Pressable, useWindowDimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
    FadeInLeft,
    FadeInRight,
    FadeInDown,
    FadeInUp,
    useSharedValue,
    useAnimatedStyle,
    withRepeat,
    withTiming,
    Easing,
    withSpring,
    useAnimatedReaction,
    interpolate,
    Extrapolation
} from 'react-native-reanimated';
import { SPACING, RADIUS } from '../constants/collectzTheme';
import { useTheme } from '../context/ThemeContext';
import { ArrowRight, Layers, Smartphone, Zap, Shield, Heart, Globe } from 'lucide-react-native';
import { BlurView } from 'expo-blur';


const HERO_IMAGE = require('../assets/hero_abstract.png');

// --- New Colorful Components ---

const BackgroundBlob = ({ color, size, x, y, opacity = 0.6, delay = 0 }: { color: string, size: number, x: number, y: number, opacity?: number, delay?: number }) => {
    const sv = useSharedValue(0);

    useEffect(() => {
        sv.value = withRepeat(
            withTiming(1, { duration: 5000 + delay, easing: Easing.inOut(Easing.ease) }),
            -1,
            true
        );
    }, []);

    const style = useAnimatedStyle(() => {
        return {
            transform: [
                { translateX: withTiming(x + (sv.value * 50 - 25), { duration: 5000 }) },
                { translateY: withTiming(y + (sv.value * 50 - 25), { duration: 5000 }) },
                { scale: interpolate(sv.value, [0, 1], [0.8, 1.2]) }
            ],
            opacity: interpolate(sv.value, [0, 1], [opacity * 0.8, opacity])
        };
    });

    return (
        <Animated.View
            style={[
                {
                    position: 'absolute',
                    width: size,
                    height: size,
                    borderRadius: size / 2,
                    backgroundColor: color,
                    top: 0,
                    left: 0,
                },
                style
            ]}
        />
    );
};

const BackgroundMesh = () => {
    const { isDark } = useTheme();

    return (
        <View style={StyleSheet.absoluteFill} pointerEvents="none">
            {/* Top Left - Warm */}
            <BackgroundBlob color={isDark ? "#1E231C" : "#E2D4C0"} size={500} x={-100} y={-100} opacity={0.5} />
            {/* Top Right - Green Accent */}
            <BackgroundBlob color={isDark ? "#181D17" : "#D4E2D0"} size={400} x={250} y={-50} opacity={0.6} delay={2000} />
            {/* Mid Left - Subtle Primary */}
            <BackgroundBlob color={isDark ? "#21251F" : "#E8EFE6"} size={600} x={-200} y={400} opacity={0.4} delay={1000} />
            {/* Bottom Right - Warm Accent */}
            <BackgroundBlob color={isDark ? "#2A2F25" : "#F0E6DA"} size={500} x={200} y={600} opacity={0.5} delay={3000} />

            {/* Vibrant Accents for visual pop */}
            <BackgroundBlob color={isDark ? "rgba(163, 201, 148, 0.1)" : "rgba(130, 149, 75, 0.15)"} size={300} x={50} y={200} opacity={0.8} delay={500} />
            <BackgroundBlob color={isDark ? "rgba(212, 163, 115, 0.08)" : "rgba(184, 139, 91, 0.1)"} size={250} x={300} y={500} opacity={0.8} delay={2500} />
        </View>
    );
};

export default function LandingScreen() {
    const { width, height } = useWindowDimensions();
    const isLargeScreen = width > 1024;
    const isTablet = width > 768 && width <= 1024;

    const router = useRouter();
    const { colors, isDark } = useTheme();
    const scrollRef = useRef<ScrollView>(null);
    const featuresRef = useRef<View>(null);
    const moreFeaturesRef = useRef<View>(null);

    const heroScale = useSharedValue(1);
    const ctaScale = useSharedValue(1);
    const secondaryCtaScale = useSharedValue(1);

    const styles = createStyles(colors);

    useEffect(() => {
        heroScale.value = withRepeat(
            withTiming(1.03, { duration: 8000, easing: Easing.inOut(Easing.ease) }),
            -1,
            true
        );
    }, []);

    const animatedHeroStyle = useAnimatedStyle(() => ({
        transform: [{ scale: heroScale.value }],
    }));

    const animatedCtaStyle = useAnimatedStyle(() => ({
        transform: [{ scale: ctaScale.value }],
    }));

    const scrollToFeatures = () => {
        moreFeaturesRef.current?.measure((x, y, width, height, pageX, pageY) => {
            // Use pageY or a calculated offset
            scrollRef.current?.scrollTo({ y: pageY || 1000, animated: true });
        });
    };

    const animatedSecondaryCtaStyle = useAnimatedStyle(() => ({
        transform: [{ scale: secondaryCtaScale.value }],
        opacity: withTiming(secondaryCtaScale.value === 1.05 ? 0.8 : 1),
    }));

    return (
        <View style={styles.container}>
            <BackgroundMesh />



            <LinearGradient
                colors={[`${colors.background}99`, colors.background]}
                style={StyleSheet.absoluteFill}
                pointerEvents="none"
            />
            <ScrollView
                ref={scrollRef}
                style={styles.container}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
                stickyHeaderIndices={[]}
            >
                {/* HERO SECTION */}
                <View style={[styles.mainWrapper, isLargeScreen && styles.rowLayout, { height: isLargeScreen ? height : 'auto' }]}>

                    {/* LEFT SECTION: Visuals/Logo */}
                    <View style={[styles.visualSection, { height: isLargeScreen ? '100%' : 450 }]}>
                        <Animated.View style={[styles.imageContainer, animatedHeroStyle]}>
                            <Image
                                source={HERO_IMAGE}
                                style={styles.heroImage}
                                blurRadius={Platform.OS === 'ios' ? 10 : 2}
                            />
                        </Animated.View>
                        <LinearGradient
                            colors={['transparent', colors.background]}
                            style={styles.bottomFade}
                        />

                        {/* Centered Large Branding */}
                        <Animated.View
                            entering={FadeInDown.delay(600).springify().damping(12)}
                            style={styles.centeredLogoContainer}
                        >
                            <Text style={[styles.giantLogo, { fontSize: isLargeScreen ? 110 : 72 }]}>Collectz</Text>
                        </Animated.View>
                    </View>

                    {/* RIGHT SECTION: Content */}
                    <View style={styles.contentSection}>
                        <Animated.View entering={FadeInRight.delay(400).duration(800)} style={styles.contentInner}>
                            <View style={styles.badge}>
                                <Text style={styles.badgeText}>PREMIUM EARLY ACCESS 2025</Text>
                            </View>

                            <Text style={[styles.heroTitle, { fontSize: isLargeScreen ? 64 : width > 480 ? 48 : 36 }]}>
                                Simpan apa saja,{"\n"}
                                <Text style={styles.highlightText}>di mana saja.</Text>
                            </Text>

                            <Text style={[styles.heroSubtitle, { fontSize: isLargeScreen ? 20 : 16 }]}>
                                Ruang minimalis untuk mengelola koleksi Anda. Melacak film, buku, dan kenangan tidak akan pernah semudah ini.
                            </Text>

                            <View style={[styles.ctaWrapper, { flexDirection: isLargeScreen ? 'row' : 'column', alignItems: isLargeScreen ? 'center' : 'stretch' }]}>
                                <Pressable
                                    onPressIn={() => ctaScale.value = withSpring(0.95)}
                                    onPressOut={() => ctaScale.value = withSpring(1)}
                                    // @ts-ignore - hover is supported on web
                                    onHoverIn={() => { if (Platform.OS === 'web') ctaScale.value = withSpring(1.1); }}
                                    // @ts-ignore
                                    onHoverOut={() => { if (Platform.OS === 'web') ctaScale.value = withSpring(1); }}
                                    onPress={() => router.push('/auth/login')}
                                >
                                    <Animated.View style={[styles.mainCta, animatedCtaStyle]}>
                                        <LinearGradient
                                            colors={colors.primaryGradient as any}
                                            start={{ x: 0, y: 0 }}
                                            end={{ x: 1, y: 0 }}
                                            style={styles.ctaGradient}
                                        >
                                            <Text style={styles.ctaLabel}>Mulai Sekarang</Text>
                                            <ArrowRight color="white" size={20} />
                                        </LinearGradient>
                                    </Animated.View>
                                </Pressable>

                                <Pressable
                                    onPressIn={() => secondaryCtaScale.value = withSpring(0.95)}
                                    onPressOut={() => secondaryCtaScale.value = withSpring(1)}
                                    // @ts-ignore
                                    onHoverIn={() => { if (Platform.OS === 'web') secondaryCtaScale.value = withSpring(1.05); }}
                                    // @ts-ignore
                                    onHoverOut={() => { if (Platform.OS === 'web') secondaryCtaScale.value = withSpring(1); }}
                                    onPress={scrollToFeatures}
                                >
                                    <Animated.View style={[styles.secondaryCta, animatedSecondaryCtaStyle]}>
                                        <Text style={styles.secondaryCtaText}>Pelajari Fitur</Text>
                                    </Animated.View>
                                </Pressable>
                            </View>

                            <View style={styles.socialProof}>
                                <Text style={styles.proofText}>Trusted by 10,000+ collectors worldwide.</Text>
                            </View>
                        </Animated.View>
                    </View>
                </View>

                {/* SPACER SECTION */}
                <View style={[styles.spacerSection, { height: isLargeScreen ? height * 0.4 : 80 }]} />

                {/* FEATURES SECTION (Keunggulan) */}
                <View ref={featuresRef} style={styles.featuresSection}>
                    <Animated.View entering={FadeInDown.duration(800)} style={styles.featuresHeader}>
                        <Text style={[styles.featuresTitle, { fontSize: isLargeScreen ? 42 : 28 }]}>Kenapa Memilih Collectz?</Text>
                        <Text style={styles.featuresSubtitle}>Dirancang untuk kemudahan dan kenyamanan Anda dalam mengelola koleksi kesayangan.</Text>
                    </Animated.View>

                    <View style={[styles.featuresGrid, { gap: isLargeScreen ? SPACING.xl : SPACING.m }]}>
                        <FeatureBox
                            icon={<Zap color="#F59E0B" size={32} />}
                            title="Kecepatan Kilat"
                            description="Akses koleksi Anda dalam hitungan detik dengan performa aplikasi yang dioptimalkan."
                            delay={200}
                            isLargeScreen={isLargeScreen}
                            accentColor="#FFF7ED"
                        />
                        <FeatureBox
                            icon={<Shield color="#10B981" size={32} />}
                            title="Aman & Pribadi"
                            description="Data Anda adalah privasi Anda. Kami menjamin keamanan setiap informasi koleksi yang Anda simpan."
                            delay={400}
                            isLargeScreen={isLargeScreen}
                            accentColor="#ECFDF5"
                        />
                        <FeatureBox
                            icon={<Heart color="#EC4899" size={32} />}
                            title="Desain Menawan"
                            description="Antarmuka yang bersih dan estetis memberikan pengalaman mengoleksi yang tak terlupakan."
                            delay={600}
                            isLargeScreen={isLargeScreen}
                            accentColor="#FDF2F8"
                        />
                        <FeatureBox
                            icon={<Globe color="#3B82F6" size={32} />}
                            title="Sinkronisasi Cloud"
                            description="Akses koleksi Anda dari perangkat apa pun, kapan pun, dan di mana pun Anda berada."
                            delay={800}
                            isLargeScreen={isLargeScreen}
                            accentColor="#EFF6FF"
                        />
                    </View>
                </View>

                {/* ADDITIONAL FEATURES SECTION (Fitur Canggih) */}
                <View ref={moreFeaturesRef} style={styles.moreFeaturesSection}>
                    <LinearGradient
                        colors={[colors.background, colors.surface]}
                        style={styles.featuresGradientBg}
                    />
                    <Animated.View entering={FadeInDown.duration(800)} style={styles.featuresHeader}>
                        <View style={styles.sectionBadge}>
                            <Text style={styles.sectionBadgeText}>FITUR UTAMA</Text>
                        </View>
                        <Text style={[styles.featuresTitle, { fontSize: isLargeScreen ? 42 : 28 }]}>Kelola Koleksi Tanpa Batas</Text>
                        <Text style={styles.featuresSubtitle}>Kami memberikan fitur terbaik untuk kebutuhan koleksi film dan buku Anda.</Text>
                    </Animated.View>

                    <View style={[styles.featureListContainer, { paddingHorizontal: isLargeScreen ? 0 : SPACING.m }]}>
                        <FeatureRow
                            title="Kategori Kustom"
                            description="Buat folder koleksi sesukamu, dari 'Wishlist' hingga 'Legendary Movies'."
                            icon={<Layers color="#8B5CF6" size={24} />}
                            color="#8B5CF6"
                            delay={200}
                        />
                        <FeatureRow
                            title="Analytics"
                            description="Lihat statistik koleksimu dalam grafik yang menarik dan informatif (Coming Soon)."
                            icon={<Smartphone color="#EF4444" size={24} />}
                            color="#EF4444"
                            delay={400}
                        />
                        <FeatureRow
                            title="Desain Responsif"
                            description="Akses koleksimu dari browser HP, tablet, maupun komputer dengan nyaman."
                            icon={<Zap color="#F59E0B" size={24} />}
                            color="#F59E0B"
                            delay={600}
                        />
                    </View>
                </View>

                {/* FOOTER */}
                <View style={[styles.footer, {
                    paddingVertical: isLargeScreen ? 80 : 40,
                    paddingHorizontal: isLargeScreen ? SPACING.xl : SPACING.m,
                }]}>
                    <View style={[styles.footerContent, {
                        flexDirection: isLargeScreen ? 'row' : 'column',
                        gap: isLargeScreen ? SPACING.xxl : SPACING.xl,
                        paddingHorizontal: isLargeScreen ? SPACING.xl : 0,
                        marginBottom: isLargeScreen ? 40 : 20,
                    }]}>
                        <View style={[styles.footerBrand, { marginBottom: isLargeScreen ? 0 : SPACING.s }]}>
                            <Text style={styles.footerLogo}>Collectz</Text>
                            <Text style={styles.footerTagline}>Manage your memories, beautifully.</Text>
                        </View>

                        <View style={styles.footerLinks}>
                            <Text style={styles.footerLinkHeader}>Kontak</Text>
                            <Text style={styles.footerLink}>support@collectz.id</Text>
                            <Text style={styles.footerLink}>Bandung, Indonesia</Text>
                        </View>

                        <View style={styles.footerLinks}>
                            <Text style={styles.footerLinkHeader}>Media Sosial</Text>
                            <Text style={styles.footerLink}>Instagram</Text>
                            <Text style={styles.footerLink}>Twitter</Text>
                        </View>
                    </View>
                    <View style={styles.footerBottom}>
                        <Text style={styles.footerText}>© 2025 Collectz. All rights reserved.</Text>
                    </View>
                </View>
            </ScrollView>
        </View>
    );
}

const FeatureBox = ({ icon, title, description, delay, isLargeScreen, accentColor }: { icon: React.ReactNode, title: string, description: string, delay: number, isLargeScreen: boolean, accentColor?: string }) => {
    const { colors, isDark } = useTheme();
    const styles = createStyles(colors);
    return (
        <Animated.View
            entering={FadeInUp.delay(delay).springify().damping(15)}
            style={[
                styles.featureCard,
                {
                    width: isLargeScreen ? '45%' : '100%',
                    backgroundColor: isDark ? (accentColor ? `${colors.primary}15` : colors.surfaceHighlight) : (accentColor || 'rgba(255,255,255,0.8)')
                }
            ]}
        >
            <View style={[styles.featureIcon, { backgroundColor: isDark ? colors.surface : 'white' }]}>{icon}</View>
            <Text style={[styles.featureTitle, { color: colors.text }]}>{title}</Text>
            <Text style={[styles.featureDescription, { color: colors.textSecondary }]}>{description}</Text>
        </Animated.View>
    );
};

const FeatureRow = ({ title, description, icon, delay, color }: { title: string, description: string, icon: React.ReactNode, delay: number, color?: string }) => {
    const { colors, isDark } = useTheme();
    const styles = createStyles(colors);
    return (
        <Animated.View
            entering={FadeInLeft.delay(delay).duration(800)}
            style={[styles.featureRow, { borderLeftWidth: 4, borderLeftColor: color || colors.primary }]}
        >
            <View style={[styles.smallIconContainer, { backgroundColor: color ? `${color}20` : colors.surfaceHighlight }]}>{icon}</View>
            <View style={styles.featureRowContent}>
                <Text style={[styles.featureRowTitle, { color: colors.text }]}>{title}</Text>
                <Text style={[styles.featureRowDesc, { color: colors.textSecondary }]}>{description}</Text>
            </View>
        </Animated.View>
    );
};

const createStyles = (colors: any) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },

    scrollContent: {
        flexGrow: 1,
    },
    mainWrapper: {
        width: '100%',
    },
    rowLayout: {
        flexDirection: 'row',
    },
    visualSection: {
        flex: 1.2,
        height: 450,
        backgroundColor: colors.surfaceHighlight,
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
    },
    imageContainer: {
        width: '120%',
        height: '120%',
    },
    heroImage: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
        opacity: 0.6,
    },
    bottomFade: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: 200,
    },
    centeredLogoContainer: {
        position: 'absolute',
        width: '100%',
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 10,
    },
    giantLogo: {
        fontSize: 72,
        fontWeight: '900',
        color: colors.text,
        letterSpacing: -5,
        textAlign: 'center',
        textShadowColor: 'rgba(0,0,0,0.1)',
        textShadowOffset: { width: 0, height: 10 },
        textShadowRadius: 20,
    },
    contentSection: {
        flex: 1,
        justifyContent: 'center',
        paddingHorizontal: SPACING.xl,
        paddingVertical: SPACING.xxl,
        backgroundColor: colors.background,
    },
    contentInner: {
        maxWidth: 600,
        alignSelf: 'center',
    },
    badge: {
        alignSelf: 'flex-start',
        backgroundColor: colors.surfaceHighlight,
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: RADIUS.s,
        marginBottom: SPACING.l,
    },
    badgeText: {
        fontSize: 12,
        fontWeight: '800',
        color: colors.primary,
        letterSpacing: 1,
    },
    heroTitle: {
        fontSize: 42,
        fontWeight: '900',
        color: colors.text,
        lineHeight: 48,
        letterSpacing: -2,
        marginBottom: SPACING.l,
    },
    highlightText: {
        color: colors.primary,
    },
    heroSubtitle: {
        fontSize: 18,
        color: colors.textSecondary,
        lineHeight: 28,
        marginBottom: SPACING.xxl,
        maxWidth: 500,
    },
    ctaWrapper: {
        flexDirection: 'column',
        alignItems: 'stretch',
        gap: SPACING.m,
        marginBottom: SPACING.xxl,
    },
    mainCta: {
        minWidth: 220,
        borderRadius: RADIUS.m,
        overflow: 'hidden',
        elevation: 5,
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
    },
    ctaGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 20,
        paddingHorizontal: 24,
    },
    ctaLabel: {
        color: 'white',
        fontSize: 16,
        fontWeight: '700',
    },
    secondaryCta: {
        paddingVertical: 18,
        paddingHorizontal: 24,
        alignItems: 'center',
    },
    secondaryCtaText: {
        color: colors.text,
        fontSize: 16,
        fontWeight: '600',
    },
    socialProof: {
        borderTopWidth: 1,
        borderColor: colors.surfaceHighlight,
        paddingTop: SPACING.l,
    },
    proofText: {
        fontSize: 14,
        color: colors.textSecondary,
        fontStyle: 'italic',
    },

    // NEW FEATURES STYLES
    featuresSection: {
        paddingVertical: 100,
        paddingHorizontal: SPACING.xl,
        backgroundColor: colors.background,
    },
    featuresHeader: {
        alignItems: 'center',
        marginBottom: 60,
    },
    featuresTitle: {
        fontSize: 36,
        fontWeight: '900',
        color: colors.text,
        textAlign: 'center',
        marginBottom: SPACING.m,
    },
    featuresSubtitle: {
        fontSize: 18,
        color: colors.textSecondary,
        textAlign: 'center',
        maxWidth: 600,
        lineHeight: 26,
    },
    featuresGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
        gap: SPACING.l,
        maxWidth: 1200,
        alignSelf: 'center',
    },
    featureCard: {
        backgroundColor: colors.surface,
        padding: SPACING.xl,
        borderRadius: RADIUS.l,
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 5 },
        shadowOpacity: 0.05,
        shadowRadius: 15,
        borderWidth: 1,
        borderColor: colors.surfaceHighlight,
    },
    featureIcon: {
        width: 64,
        height: 64,
        borderRadius: RADIUS.m,
        backgroundColor: colors.surfaceHighlight,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: SPACING.l,
    },
    featureTitle: {
        fontSize: 22,
        fontWeight: '700',
        color: colors.text,
        marginBottom: SPACING.s,
    },
    featureDescription: {
        fontSize: 16,
        color: colors.textSecondary,
        lineHeight: 24,
    },
    footer: {
        paddingVertical: 80,
        alignItems: 'center',
        backgroundColor: colors.surface,
        borderTopWidth: 1,
        borderColor: colors.surfaceHighlight,
    },
    footerLogo: {
        fontSize: 24,
        fontWeight: '900',
        color: colors.primary,
        marginBottom: SPACING.xs,
    },
    footerText: {
        color: colors.textSecondary,
        fontSize: 14,
    },
    // NEW STYLES
    spacerSection: {
        backgroundColor: colors.background,
    },
    moreFeaturesSection: {
        paddingVertical: 120,
        paddingHorizontal: SPACING.xl,
        backgroundColor: 'transparent',
        overflow: 'hidden',
    },
    featuresGradientBg: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: 600,
        opacity: 0.8,
    },
    sectionBadge: {
        backgroundColor: colors.surfaceHighlight,
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: RADIUS.s,
        marginBottom: SPACING.m,
    },
    sectionBadgeText: {
        fontSize: 12,
        fontWeight: '800',
        color: colors.primary,
        letterSpacing: 2,
    },
    featureListContainer: {
        maxWidth: 800,
        alignSelf: 'center',
        width: '100%',
        gap: SPACING.l,
    },
    featureRow: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: SPACING.l,
        backgroundColor: colors.surface,
        borderRadius: RADIUS.m,
        gap: SPACING.l,
    },
    smallIconContainer: {
        width: 48,
        height: 48,
        borderRadius: RADIUS.s,
        backgroundColor: colors.surfaceHighlight,
        justifyContent: 'center',
        alignItems: 'center',
    },
    featureRowContent: {
        flex: 1,
    },
    featureRowTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: colors.text,
        marginBottom: 4,
    },
    featureRowDesc: {
        fontSize: 14,
        color: colors.textSecondary,
        lineHeight: 20,
    },
    footerContent: {
        flexDirection: 'column',
        justifyContent: 'space-between',
        width: '100%',
        maxWidth: 1200,
    },
    footerBrand: {
        flex: 1,
    },
    footerTagline: {
        fontSize: 16,
        color: colors.textSecondary,
        maxWidth: 250,
    },
    footerLinks: {
        flex: 1,
        gap: SPACING.s,
    },
    footerLinkHeader: {
        fontSize: 16,
        fontWeight: '700',
        color: colors.text,
        marginBottom: SPACING.s,
    },
    footerLink: {
        fontSize: 14,
        color: colors.textSecondary,
    },
    footerBottom: {
        width: '100%',
        paddingTop: 40,
        marginTop: 20,
        borderTopWidth: 1,
        borderColor: colors.surfaceHighlight,
        alignItems: 'center',
    },
});
