import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { Bug } from 'lucide-react-native';

interface Props {
    onSimulateError?: () => void;
}

export const DebugControls = ({ onSimulateError }: Props) => {
    const { colors } = useTheme();
    const styles = createStyles(colors);

    const handleSimulateError = () => {
        console.log('[Debug] Simulating error...');
        if (onSimulateError) {
            onSimulateError();
        } else {
            // Default behavior if no handler provided: throw a test error
            // In a real app, this might be caught by an Error Boundary
            try {
                throw new Error("Simulated Debug Error");
            } catch (error) {
                console.error('[Debug] Caught simulated error:', error);
                Alert.alert("Debug Error", "This is a simulated error for debugging purposes.");
            }
        }
    };

    return (
        <View style={styles.container}>
            <TouchableOpacity
                style={styles.button}
                onPress={handleSimulateError}
                activeOpacity={0.7}
            >
                <Bug color="white" size={20} />
                <Text style={styles.text}>Simulate Error</Text>
            </TouchableOpacity>
        </View>
    );
};

const createStyles = (colors: any) => StyleSheet.create({
    container: {
        position: 'absolute',
        top: 50, // Adjust based on safe area
        right: 20,
        zIndex: 100,
    },
    button: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.danger,
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 20,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    text: {
        color: 'white',
        fontWeight: 'bold',
        marginLeft: 6,
        fontSize: 12,
    }
});
