import React from 'react';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { TouchableOpacity } from 'react-native';
import { ArrowLeft } from 'lucide-react-native';
import { FONTS } from '../../../constants/collectzTheme';
import { useTheme } from '../../../context/ThemeContext';

export default function CollectionLayout() {
    const { colors, isDark } = useTheme();
    const { type } = useLocalSearchParams<{ type: string }>();
    const router = useRouter();

    // Capitalize first letter
    const title = type ? type.charAt(0).toUpperCase() + type.slice(1).replace('-', ' ') : 'Collection';

    return (
        <Stack
            screenOptions={{
                headerStyle: {
                    backgroundColor: colors.background,
                },
                headerShadowVisible: true,
                headerTitleStyle: {
                    ...FONTS.title,
                    color: colors.text,
                    fontSize: 20,
                },
                headerTitleAlign: 'center',
                headerTintColor: colors.text,
                headerLeft: () => (
                    <TouchableOpacity
                        onPress={() => {
                            if (router.canGoBack()) {
                                router.back();
                            } else {
                                router.push('/dashboard');
                            }
                        }}
                        style={{ marginLeft: 10, padding: 8 }}
                    >
                        <ArrowLeft color={colors.text} size={24} />
                    </TouchableOpacity>
                ),
                headerTitle: title,
            }}
        >
            <Stack.Screen name="index" />
        </Stack>
    );
}
