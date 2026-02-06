import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ThemeProvider, useTheme } from '../context/ThemeContext';
import { SidebarProvider } from '../components/Sidebar';

import { OfflineProvider } from '../context/OfflineContext';

function InnerLayout() {
    const { colors, isDark } = useTheme();

    return (
        <>
            <StatusBar style={isDark ? "light" : "dark"} backgroundColor={colors.background} />
            <Stack
                screenOptions={{
                    headerShown: false,
                    contentStyle: { backgroundColor: colors.background },
                    animation: 'fade',
                }}
            >
                <Stack.Screen name="index" />
                <Stack.Screen name="auth/login" options={{ animation: 'slide_from_right' }} />
                <Stack.Screen name="dashboard/index" options={{ animation: 'fade' }} />
                <Stack.Screen name="collection/[type]" options={{ headerShown: false, animation: 'slide_from_right' }} />
                <Stack.Screen name="settings/index" options={{ animation: 'slide_from_bottom' }} />
            </Stack>
        </>
    );
}

export default function AppLayout() {
    return (
        <ThemeProvider>
            <OfflineProvider>
                <SidebarProvider>
                    <InnerLayout />
                </SidebarProvider>
            </OfflineProvider>
        </ThemeProvider>
    );
}
