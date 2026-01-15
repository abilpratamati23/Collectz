import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, FlatList, ActivityIndicator, TouchableOpacity, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, GRADIENTS } from '../constants/theme';
import { Search as SearchIcon, X } from 'lucide-react-native';
import { searchMovies } from '../services/tmdb';
import { MovieItem } from '../components/MovieItem';
import { addMovie } from '../services/movieService';

export default function SearchScreen() {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    const handleSearch = async () => {
        if (!query.trim()) return;

        setLoading(true);
        const movies = await searchMovies(query);
        setResults(movies);
        setLoading(false);
    };

    const clearSearch = () => {
        setQuery('');
        setResults([]);
    }

    const handleAddMovie = async (tmdbMovie: any) => {
        try {
            await addMovie(
                tmdbMovie.title,
                {
                    tmdbId: tmdbMovie.id,
                    posterPath: tmdbMovie.poster_path,
                    overview: tmdbMovie.overview,
                    releaseDate: tmdbMovie.release_date
                }
            );
            Alert.alert('Success', `Added "${tmdbMovie.title}" to Watch List`);
        } catch (error) {
            Alert.alert('Error', 'Failed to add movie');
        }
    };

    return (
        <LinearGradient colors={GRADIENTS.background} style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Discover</Text>
                <Text style={styles.headerSubtitle}>Find movies to watch</Text>
            </View>

            <View style={styles.searchContainer}>
                <View style={styles.inputWrapper}>
                    <SearchIcon color={COLORS.textSecondary} size={20} style={styles.searchIcon} />
                    <TextInput
                        style={styles.input}
                        placeholder="Search movies..."
                        placeholderTextColor={COLORS.textSecondary}
                        value={query}
                        onChangeText={setQuery}
                        onSubmitEditing={handleSearch}
                        returnKeyType="search"
                    />
                    {query.length > 0 && (
                        <TouchableOpacity onPress={clearSearch}>
                            <X color={COLORS.textSecondary} size={20} />
                        </TouchableOpacity>
                    )}
                </View>
            </View>

            {loading ? (
                <ActivityIndicator size="large" color={COLORS.primary} style={{ marginTop: 50 }} />
            ) : (
                <FlatList
                    data={results}
                    keyExtractor={(item) => item.id.toString()}
                    contentContainerStyle={styles.listContent}
                    renderItem={({ item, index }) => (
                        <MovieItem
                            movie={{
                                id: item.id.toString(),
                                title: item.title,
                                isWatched: false,
                                createdAt: 0,
                                posterPath: item.poster_path,
                                releaseDate: item.release_date,
                                overview: item.overview
                            }}
                            index={index}
                            isSearchMode={true}
                            onAdd={() => handleAddMovie(item)}
                        />
                    )}
                    ListEmptyComponent={
                        query.trim() && !loading ? (
                            <View style={styles.emptyContainer}>
                                <Text style={styles.emptyText}>No movies found</Text>
                            </View>
                        ) : null
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
    searchContainer: {
        paddingHorizontal: 20,
        marginBottom: 20,
    },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#2A2A2A',
        borderRadius: 12,
        paddingHorizontal: 12,
        height: 50,
        borderWidth: 1,
        borderColor: '#333',
    },
    searchIcon: {
        marginRight: 10,
    },
    input: {
        flex: 1,
        color: COLORS.text,
        fontSize: 16,
        height: '100%',
    },
    listContent: {
        paddingHorizontal: 20,
        paddingBottom: 100,
    },
    emptyContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 50,
    },
    emptyText: {
        color: COLORS.textSecondary,
        fontSize: 16,
    }
});
