import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, FlatList } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, GRADIENTS } from '../constants/theme';
import { Movie } from '../types/movie';
import { subscribeToMovies, addMovie, deleteMovie, toggleWatched } from '../services/movieService';
import { MovieItem } from '../components/MovieItem';
import { AddMovieModal } from '../components/AddMovieModal';
import { Plus } from 'lucide-react-native';

export default function WatchListScreen() {
    const [movies, setMovies] = useState<Movie[]>([]);
    const [loading, setLoading] = useState(true);
    const [modalVisible, setModalVisible] = useState(false);

    useEffect(() => {
        const unsubscribe = subscribeToMovies((allMovies) => {
            setMovies(allMovies.filter(m => !m.isWatched));
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    const handleAdd = async (title: string) => {
        await addMovie(title);
    };

    return (
        <LinearGradient colors={GRADIENTS.background} style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>My Watch List</Text>
                <Text style={styles.headerSubtitle}>{movies.length} movies to watch</Text>
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
                            <Text style={styles.emptyText}>No movies in your list yet.</Text>
                            <Text style={styles.emptySubtext}>Tap the + button to add one!</Text>
                        </View>
                    }
                />
            )}

            <TouchableOpacity
                style={styles.fab}
                onPress={() => setModalVisible(true)}
                activeOpacity={0.8}
            >
                <LinearGradient
                    colors={GRADIENTS.primary}
                    style={styles.fabGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                >
                    <Plus color="white" size={32} />
                </LinearGradient>
            </TouchableOpacity>

            <AddMovieModal
                visible={modalVisible}
                onClose={() => setModalVisible(false)}
                onSubmit={handleAdd}
            />
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
    emptySubtext: {
        color: COLORS.textSecondary,
        fontSize: 14,
    },
    fab: {
        position: 'absolute',
        bottom: 30,
        right: 30,
        shadowColor: COLORS.primary,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.5,
        shadowRadius: 16,
        elevation: 10,
    },
    fabGradient: {
        width: 64,
        height: 64,
        borderRadius: 32,
        alignItems: 'center',
        justifyContent: 'center',
    }
});
