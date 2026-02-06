import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, Dimensions, SafeAreaView, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { ArrowLeft, Mail, Lock, Eye, EyeOff } from 'lucide-react-native';
import { SPACING, RADIUS } from '../../constants/collectzTheme';
import { useTheme } from '../../context/ThemeContext';

const { width } = Dimensions.get('window');
const isLargeScreen = width > 768; // Simple check for web/tablet

export default function LoginScreen() {
    const { colors, isDark } = useTheme();
    const styles = createStyles(colors);
    const router = useRouter();
    const [showPassword, setShowPassword] = useState(false);

    const handleLogin = () => {
        router.replace('/dashboard');
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={[StyleSheet.absoluteFill, { backgroundColor: colors.background }]} />

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.keyboardView}
            >
                <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                    <View style={styles.header}>
                        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                            <ArrowLeft color={colors.text} size={24} />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.centerWrapper}>
                        <View style={styles.responsiveBox}>
                            <Animated.View
                                entering={FadeInUp.delay(200).springify()}
                                style={styles.textSection}
                            >
                                <Text style={styles.title}>Masuk</Text>
                                <Text style={styles.subtitle}>Enter your details to access your collection.</Text>
                            </Animated.View>

                            <Animated.View
                                entering={FadeInDown.delay(400).springify()}
                                style={styles.formCard}
                            >
                                <View style={styles.inputWrapper}>
                                    <Text style={styles.label}>Email Address</Text>
                                    <View style={styles.inputContainer}>
                                        <Mail color={colors.primary} size={20} style={styles.icon} />
                                        <TextInput
                                            placeholder="your@email.com"
                                            placeholderTextColor={colors.textSecondary}
                                            style={styles.input}
                                            keyboardType="email-address"
                                            autoCapitalize="none"
                                        />
                                    </View>
                                </View>

                                <View style={styles.inputWrapper}>
                                    <Text style={styles.label}>Password</Text>
                                    <View style={styles.inputContainer}>
                                        <Lock color={colors.primary} size={20} style={styles.icon} />
                                        <TextInput
                                            placeholder="••••••••"
                                            placeholderTextColor={colors.textSecondary}
                                            style={styles.input}
                                            secureTextEntry={!showPassword}
                                        />
                                        <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                                            {showPassword ? (
                                                <EyeOff color={colors.textSecondary} size={20} />
                                            ) : (
                                                <Eye color={colors.textSecondary} size={20} />
                                            )}
                                        </TouchableOpacity>
                                    </View>
                                </View>

                                <TouchableOpacity style={styles.forgotBtn}>
                                    <Text style={styles.forgotText}>Forgot password?</Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={styles.loginButton}
                                    activeOpacity={0.8}
                                    onPress={handleLogin}
                                >
                                    <LinearGradient
                                        colors={colors.primaryGradient as any}
                                        start={{ x: 0, y: 0 }}
                                        end={{ x: 1, y: 0 }}
                                        style={styles.gradientButton}
                                    >
                                        <Text style={styles.loginButtonText}>Masuk</Text>
                                    </LinearGradient>
                                </TouchableOpacity>
                            </Animated.View>

                            <Animated.View
                                entering={FadeInDown.delay(600).springify()}
                                style={styles.footer}
                            >
                                <Text style={styles.footerText}>Don't have an account? </Text>
                                <TouchableOpacity onPress={() => router.push('/auth/signup')}>
                                    <Text style={styles.signupText}>Create one</Text>
                                </TouchableOpacity>
                            </Animated.View>
                        </View>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const createStyles = (colors: any) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    keyboardView: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
    },
    header: {
        paddingHorizontal: SPACING.l,
        paddingTop: SPACING.m,
        position: 'absolute',
        top: 0,
        left: 0,
        zIndex: 10,
    },
    backButton: {
        width: 44,
        height: 44,
        borderRadius: RADIUS.m,
        backgroundColor: colors.surface,
        alignItems: 'center',
        justifyContent: 'center',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    centerWrapper: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: SPACING.l,
    },
    responsiveBox: {
        width: '100%',
        maxWidth: isLargeScreen ? width / 3 : 450, // 1/3 width on web, max 450 on mobile-ish
    },
    textSection: {
        marginBottom: SPACING.xl,
        alignItems: 'center',
    },
    title: {
        fontSize: 32,
        fontWeight: '900',
        color: colors.text,
        letterSpacing: -1,
    },
    subtitle: {
        fontSize: 16,
        color: colors.textSecondary,
        marginTop: 8,
        textAlign: 'center',
    },
    formCard: {
        backgroundColor: colors.surface,
        borderRadius: RADIUS.xl,
        padding: SPACING.l,
        borderWidth: 1,
        borderColor: colors.surfaceHighlight,
        elevation: 5,
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.05,
        shadowRadius: 20,
    },
    inputWrapper: {
        marginBottom: SPACING.m,
    },
    label: {
        fontSize: 14,
        fontWeight: '700',
        color: colors.text,
        marginBottom: 8,
        marginLeft: 4,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.surfaceHighlight,
        borderRadius: RADIUS.m,
        paddingHorizontal: SPACING.m,
        height: 56,
        borderWidth: 1,
        borderColor: 'transparent',
    },
    icon: {
        marginRight: SPACING.s,
    },
    input: {
        flex: 1,
        color: colors.text,
        fontSize: 16,
        fontWeight: '500',
    },
    forgotBtn: {
        alignSelf: 'flex-end',
        marginBottom: SPACING.l,
    },
    forgotText: {
        color: colors.primary,
        fontSize: 14,
        fontWeight: '600',
    },
    loginButton: {
        borderRadius: RADIUS.m,
        overflow: 'hidden',
    },
    gradientButton: {
        paddingVertical: 18,
        alignItems: 'center',
        justifyContent: 'center',
    },
    loginButtonText: {
        color: 'white',
        fontWeight: '800',
        fontSize: 16,
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: SPACING.xl,
        paddingBottom: SPACING.xl,
    },
    footerText: {
        color: colors.textSecondary,
        fontSize: 15,
    },
    signupText: {
        color: colors.primary,
        fontWeight: '700',
        fontSize: 15,
    }
});
