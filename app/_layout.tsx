import { Tabs } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Clapperboard, CheckCircle, Search as SearchIcon } from 'lucide-react-native';
import { COLORS } from '../constants/theme';
import { View, StyleSheet } from 'react-native';

export default function AppLayout() {
    return (
        <>
            <StatusBar style="light" />
            <Tabs
                screenOptions={{
                    headerShown: false,
                    tabBarStyle: {
                        backgroundColor: COLORS.tabBar,
                        borderTopWidth: 0,
                        height: 65,
                        paddingBottom: 10,
                        paddingTop: 10,
                        elevation: 0,
                        shadowOpacity: 0,
                    },
                    tabBarActiveTintColor: COLORS.primary,
                    tabBarInactiveTintColor: COLORS.textSecondary,
                    tabBarShowLabel: true,
                    tabBarLabelStyle: {
                        fontSize: 12,
                        fontWeight: '600',
                        marginTop: 4,
                    },
                }}
            >
                <Tabs.Screen
                    name="index"
                    options={{
                        title: 'Watch List',
                        tabBarIcon: ({ color, size }) => (
                            <Clapperboard color={color} size={size} />
                        ),
                    }}
                />
                <Tabs.Screen
                    name="search"
                    options={{
                        title: 'Discover',
                        tabBarIcon: ({ color, size }) => (
                            <SearchIcon color={color} size={size} />
                        ),
                    }}
                />
                <Tabs.Screen
                    name="watched"
                    options={{
                        title: 'Watched',
                        tabBarIcon: ({ color, size }) => (
                            <CheckCircle color={color} size={size} />
                        ),
                    }}
                />
            </Tabs>
        </>
    );
}
