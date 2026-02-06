import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ScrollView, Switch, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft, Moon, Sun, Bell, Shield, CircleHelp as HelpCircle, Info, Wifi, WifiOff, RefreshCw } from 'lucide-react-native';
import { useTheme } from '../../context/ThemeContext';
import { useOffline } from '../../context/OfflineContext';
import { SPACING, RADIUS, FONTS } from '../../constants/collectzTheme';
import Animated, { FadeInDown } from 'react-native-reanimated';

export default function SettingsScreen() {
    const router = useRouter();
    const { colors, isDark, toggleTheme } = useTheme();
    const { isOffline, setIsOffline, syncing } = useOffline();
    const styles = createStyles(colors);

    const SettingItem = ({ icon: Icon, label, value, onValueChange, type = 'toggle', onPress }: any) => (
        <TouchableOpacity
            style={styles.settingItem}
            onPress={onPress}
            activeOpacity={type === 'link' ? 0.7 : 1}
        >
            <View style={styles.settingItemLeft}>
                <View style={[styles.iconContainer, { backgroundColor: colors.surfaceHighlight }]}>
                    <Icon color={colors.primary} size={22} />
                </View>
                <Text style={styles.settingLabel}>{label}</Text>
            </View>
            {type === 'toggle' ? (
                <Switch
                    value={value}
                    onValueChange={onValueChange}
                    trackColor={{ false: colors.surfaceHighlight, true: colors.primary + '80' }}
                    thumbColor={value ? colors.primary : '#f4f3f4'}
                    ios_backgroundColor="#3e3e3e"
                />
            ) : null}
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <ArrowLeft color={colors.text} size={24} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Pengaturan</Text>
                <View style={{ width: 44 }} /> {/* Spacer */}
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent}>
                <Animated.View entering={FadeInDown.delay(100).duration(400)}>
                    <Text style={styles.sectionTitle}>Tampilan</Text>
                    <View style={styles.sectionCard}>
                        <SettingItem
                            icon={isDark ? Moon : Sun}
                            label="Dark Mode"
                            value={isDark}
                            onValueChange={toggleTheme}
                        />
                    </View>
                </Animated.View>

                <Animated.View entering={FadeInDown.delay(200).duration(400)}>
                    <Text style={styles.sectionTitle}>Koneksi</Text>
                    <View style={styles.sectionCard}>
                        <SettingItem
                            icon={isOffline ? WifiOff : Wifi}
                            label="Mode Offline"
                            value={isOffline}
                            onValueChange={setIsOffline}
                        />
                        {syncing && (
                            <View style={styles.syncStatus}>
                                <Animated.View entering={FadeInDown} style={{ marginRight: 8 }}>
                                    <RefreshCw size={14} color={colors.primary} />
                                </Animated.View>
                                <Text style={styles.syncText}>Menyinkronkan data...</Text>
                            </View>
                        )}
                    </View>
                </Animated.View>

                <Animated.View entering={FadeInDown.delay(300).duration(400)}>
                    <Text style={styles.sectionTitle}>Notifikasi</Text>
                    <View style={styles.sectionCard}>
                        <SettingItem
                            icon={Bell}
                            label="Aktifkan Notifikasi"
                            value={false}
                            onValueChange={() => { }}
                        />
                    </View>
                </Animated.View>

                <Animated.View entering={FadeInDown.delay(300).duration(400)}>
                    <Text style={styles.sectionTitle}>Lainnya</Text>
                    <View style={styles.sectionCard}>
                        <SettingItem icon={Shield} label="Privasi" type="link" onPress={() => { }} />
                        <View style={styles.divider} />
                        <SettingItem icon={HelpCircle} label="Bantuan" type="link" onPress={() => { }} />
                        <View style={styles.divider} />
                        <SettingItem icon={Info} label="Tentang Aplikasi" type="link" onPress={() => { }} />
                    </View>
                </Animated.View>

                <View style={styles.footer}>
                    <Text style={styles.versionText}>Collectz v1.0.0</Text>
                    <Text style={styles.footerText}>Dibuat dengan ❤️ untuk kolektor</Text>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const createStyles = (colors: any) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: SPACING.m,
        paddingTop: Platform.OS === 'android' ? 40 : 10,
        paddingBottom: SPACING.m,
    },
    backButton: {
        width: 44,
        height: 44,
        borderRadius: RADIUS.m,
        backgroundColor: colors.surface,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: colors.surfaceHighlight,
    },
    headerTitle: {
        ...FONTS.title,
        fontSize: 20,
        color: colors.text,
        fontWeight: 'bold',
    },
    scrollContent: {
        padding: SPACING.l,
    },
    sectionTitle: {
        ...FONTS.body,
        fontSize: 14,
        fontWeight: 'bold',
        color: colors.primary,
        marginBottom: SPACING.s,
        marginTop: SPACING.l,
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    sectionCard: {
        backgroundColor: colors.surface,
        borderRadius: RADIUS.l,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: colors.surfaceHighlight,
    },
    settingItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: SPACING.m,
    },
    settingItemLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    iconContainer: {
        width: 40,
        height: 40,
        borderRadius: RADIUS.m,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: SPACING.m,
    },
    settingLabel: {
        ...FONTS.body,
        fontSize: 16,
        color: colors.text,
        fontWeight: '600',
    },
    divider: {
        height: 1,
        backgroundColor: colors.surfaceHighlight,
        marginHorizontal: SPACING.m,
    },
    footer: {
        marginTop: SPACING.xxl,
        alignItems: 'center',
        marginBottom: SPACING.xl,
    },
    versionText: {
        ...FONTS.body,
        fontSize: 12,
        color: colors.textSecondary,
        fontWeight: 'bold',
    },
    footerText: {
        ...FONTS.body,
        fontSize: 12,
        color: colors.textSecondary,
        marginTop: 4,
    },
    syncStatus: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: SPACING.m,
        paddingBottom: SPACING.m,
        marginTop: -SPACING.s,
    },
    syncText: {
        ...FONTS.body,
        fontSize: 12,
        color: colors.primary,
        fontStyle: 'italic',
    },
});
