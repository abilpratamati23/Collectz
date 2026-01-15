import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Modal, StyleSheet, Platform, KeyboardAvoidingView } from 'react-native';
import { COLORS } from '../constants/theme';
import { X } from 'lucide-react-native';

interface Props {
    visible: boolean;
    onClose: () => void;
    onSubmit: (title: string) => void;
}

export const AddMovieModal = ({ visible, onClose, onSubmit }: Props) => {
    const [title, setTitle] = useState('');

    const handleSubmit = () => {
        if (title.trim()) {
            onSubmit(title.trim());
            setTitle('');
            onClose();
        }
    };

    return (
        <Modal
            animationType="slide"
            transparent={true}
            visible={visible}
            onRequestClose={onClose}
        >
            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                style={styles.centeredView}
            >
                <View style={styles.modalView}>
                    <View style={styles.header}>
                        <Text style={styles.modalText}>Add New Movie</Text>
                        <TouchableOpacity onPress={onClose}>
                            <X color={COLORS.textSecondary} size={24} />
                        </TouchableOpacity>
                    </View>

                    <TextInput
                        style={styles.input}
                        placeholder="Movie Title..."
                        placeholderTextColor={COLORS.textSecondary}
                        value={title}
                        onChangeText={setTitle}
                        autoFocus
                    />

                    <TouchableOpacity
                        style={[styles.button, { backgroundColor: title.trim() ? COLORS.primary : COLORS.card }]}
                        onPress={handleSubmit}
                        disabled={!title.trim()}
                    >
                        <Text style={styles.textStyle}>Add to Watch List</Text>
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
        </Modal>
    );
};

const styles = StyleSheet.create({
    centeredView: {
        flex: 1,
        justifyContent: 'flex-end',
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    modalView: {
        backgroundColor: '#1E1E1E',
        borderTopLeftRadius: 30,
        borderTopRightRadius: 30,
        padding: 24,
        width: '100%',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: -2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
        borderTopWidth: 1,
        borderColor: '#333',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    button: {
        borderRadius: 16,
        padding: 16,
        elevation: 2,
        marginTop: 20,
        alignItems: 'center',
    },
    textStyle: {
        color: 'white',
        fontWeight: 'bold',
        textAlign: 'center',
        fontSize: 16,
    },
    modalText: {
        fontSize: 20,
        fontWeight: 'bold',
        color: COLORS.text,
    },
    input: {
        backgroundColor: '#2A2A2A',
        borderRadius: 12,
        padding: 16,
        color: COLORS.text,
        fontSize: 16,
        borderWidth: 1,
        borderColor: '#444',
    }
});
