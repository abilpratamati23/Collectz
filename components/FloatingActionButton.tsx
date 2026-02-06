import React from 'react';
import { TouchableOpacity, StyleSheet, Platform } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring, withRepeat, withSequence } from 'react-native-reanimated';
import { Plus } from 'lucide-react-native';
import { RADIUS } from '../constants/collectzTheme';
import { useTheme } from '../context/ThemeContext';

interface FloatingActionButtonProps {
    onPress: () => void;
    style?: any;
}

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

export const FloatingActionButton = ({ onPress, style }: FloatingActionButtonProps) => {
    const { colors, isDark } = useTheme();
    const styles = createStyles(colors);
    const scale = useSharedValue(1);
    const pulseScale = useSharedValue(1);

    React.useEffect(() => {
        // Subtle pulse animation
        pulseScale.value = withRepeat(
            withSequence(
                withSpring(1.05, { damping: 2 }),
                withSpring(1, { damping: 2 })
            ),
            -1,
            true
        );
    }, []);

    const animatedStyle = useAnimatedStyle(() => {
        return {
            transform: [{ scale: scale.value * pulseScale.value }],
        };
    });

    const handlePressIn = () => {
        scale.value = withSpring(0.9);
    };

    const handlePressOut = () => {
        scale.value = withSpring(1);
    };

    return (
        <AnimatedTouchable
            onPress={onPress}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            style={[styles.fab, style, animatedStyle]}
        >
            <Plus color="white" size={28} strokeWidth={3} />
        </AnimatedTouchable>
    );
};

const createStyles = (colors: any) => StyleSheet.create({
    fab: {
        position: 'absolute',
        bottom: 40,
        right: 40,
        width: 72,
        height: 72,
        borderRadius: 36,
        backgroundColor: colors.primary,
        alignItems: 'center',
        justifyContent: 'center',
        elevation: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        ...Platform.select({
            web: {
                cursor: 'pointer',
            },
        }),
    },
});
