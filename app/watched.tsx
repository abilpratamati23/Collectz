import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, FlatList } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, GRADIENTS } from '../constants/theme';
import { Movie } from '../types/movie';
import { subscribeToMovies, deleteMovie, toggleWatched } from '../services/movieService';
import { MovieItem } from '../components/MovieItem';

export default function WatchedListScreen() {
    const [movies, setMovies] = useState<Movie[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = subscribeToMovies((allMovies) => {
            setMovies(allMovies.filter(m => m.isWatched));
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    return (
        <LinearGradient colors={GRADIENTS.background} style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Watched Movies</Text>
                <Text style={styles.headerSubtitle}>{movies.length} movies completed</Text>
            </View>

            {loading ? (
                <ActivityIndicator size="large" color={COLORS.primary} style={{ marginTop: 50 }} />
            ) : (
                <FlatList
                    data={movies}
                    keyExtractor={item => item.id}
                    contentContainerStyle={styles.listContent}
                    renderItem={({ item, index }) => (
                        <MovieItem
                            movie={item}
                            index={index}
                            onDelete={deleteMovie}
                            onToggle={toggleWatched}
                        />
                    )}
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <Text style={styles.emptyText}>You haven't watched any movies yet.</Text>
                        </View>
                    }
                />
            )}
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingTop: 60,
    },
    header: {
        paddingHorizontal: 20,
        marginBottom: 20,
    },
    headerTitle: {
        fontSize: 32,
        fontWeight: '800',
        color: COLORS.text,
        letterSpacing: 0.5,
    },
    headerSubtitle: {
        fontSize: 14,
        color: COLORS.textSecondary,
        marginTop: 4,
    },
    listContent: {
        paddingHorizontal: 20,
        paddingBottom: 100,
    },
    emptyContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 100,
    },
    emptyText: {
        color: COLORS.text,
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 8,
    },
});
