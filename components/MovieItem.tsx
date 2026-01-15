import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { Movie } from '../types/movie';
import { CheckCircle, Trash2, Film, RefreshCcw } from 'lucide-react-native';
import { COLORS } from '../constants/theme';
import Animated, { FadeInDown, Layout } from 'react-native-reanimated';
import { getImageUrl } from '../services/tmdb';

interface Props {
    movie: Movie;
    onToggle?: (id: string, current: boolean) => void;
    onDelete?: (id: string) => void;
    onAdd?: (movie: any) => void;
    index: number;
    isSearchMode?: boolean;
}

export const MovieItem = ({ movie, onToggle, onDelete, onAdd, index, isSearchMode = false }: Props) => {
    return (
        <Animated.View
            entering={FadeInDown.delay(index * 100).springify()}
            layout={Layout.springify()}
            style={styles.container}
        >
            <View style={styles.imageContainer}>
                {movie.posterPath ? (
                    <Image
                        source={{ uri: getImageUrl(movie.posterPath) }}
                        style={styles.poster}
                        resizeMode="cover"
                    />
                ) : (
                    <View style={[styles.poster, styles.placeholderPoster]}>
                        <Film color={COLORS.primary} size={24} />
                    </View>
                )}
            </View>

            <View style={styles.content}>
                <Text style={[
                    styles.title,
                    movie.isWatched && styles.watchedTitle
                ]} numberOfLines={2}>
                    {movie.title}
                </Text>
                {movie.releaseDate && (
                    <Text style={styles.date}>{movie.releaseDate.split('-')[0]}</Text>
                )}
            </View>

            <View style={styles.actions}>
                {isSearchMode ? (
                    <TouchableOpacity
                        onPress={() => onAdd?.(movie)}
                        style={[styles.actionButton, styles.addButton]}
                        activeOpacity={0.7}
                    >
                        <Text style={styles.addButtonText}>Add</Text>
                    </TouchableOpacity>
                ) : (
                    <>
                        <TouchableOpacity
                            onPress={() => onToggle?.(movie.id, movie.isWatched)}
                            style={styles.actionButton}
                            activeOpacity={0.7}
                        >
                            {movie.isWatched ? (
                                <RefreshCcw color={COLORS.textSecondary} size={20} />
                            ) : (
                                <CheckCircle color={COLORS.success} size={20} />
                            )}
                        </TouchableOpacity>

                        <TouchableOpacity
                            onPress={() => onDelete?.(movie.id)}
                            style={[styles.actionButton, styles.deleteButton]}
                            activeOpacity={0.7}
                        >
                            <Trash2 color={COLORS.danger} size={20} />
                        </TouchableOpacity>
                    </>
                )}
            </View>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: COLORS.card,
        borderRadius: 16,
        padding: 12,
        marginBottom: 12,
        flexDirection: 'row',
        alignItems: 'center',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 4.65,
        elevation: 8,
        borderWidth: 1,
        borderColor: '#333',
    },
    imageContainer: {
        marginRight: 16,
    },
    poster: {
        width: 60,
        height: 90,
        borderRadius: 8,
        backgroundColor: '#2A2A2A',
    },
    placeholderPoster: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    content: {
        flex: 1,
        justifyContent: 'center',
    },
    title: {
        color: COLORS.text,
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 4,
    },
    watchedTitle: {
        textDecorationLine: 'line-through',
        color: COLORS.textSecondary,
    },
    date: {
        color: COLORS.textSecondary,
        fontSize: 12,
    },
    actions: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    actionButton: {
        padding: 10,
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderRadius: 12,
        marginLeft: 8,
    },
    deleteButton: {
        backgroundColor: 'rgba(255, 69, 0, 0.1)',
    },
    addButton: {
        backgroundColor: COLORS.primary,
        paddingHorizontal: 16,
    },
    addButtonText: {
        color: 'white',
        fontWeight: 'bold',
    }
});
