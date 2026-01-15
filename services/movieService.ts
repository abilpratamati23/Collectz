import { db } from '../firebaseConfig';
import { collection, addDoc, doc, updateDoc, deleteDoc, onSnapshot, query, orderBy } from 'firebase/firestore';
import { Movie } from '../types/movie';

const MOVIE_COLLECTION = 'movies';

export const addMovie = async (
    title: string,
    details?: { tmdbId?: number, posterPath?: string, overview?: string, releaseDate?: string }
) => {
    try {
        await addDoc(collection(db, MOVIE_COLLECTION), {
            title,
            isWatched: false,
            createdAt: Date.now(),
            ...details
        });
    } catch (e) {
        console.error("Error adding movie: ", e);
        throw e;
    }
};

export const toggleWatched = async (id: string, currentStatus: boolean) => {
    try {
        const movieRef = doc(db, MOVIE_COLLECTION, id);
        await updateDoc(movieRef, {
            isWatched: !currentStatus
        });
    } catch (e) {
        console.error("Error toggling watched: ", e);
        throw e;
    }
};

export const deleteMovie = async (id: string) => {
    try {
        await deleteDoc(doc(db, MOVIE_COLLECTION, id));
    } catch (e) {
        console.error("Error deleting movie: ", e);
        throw e;
    }
};

export const subscribeToMovies = (callback: (movies: Movie[]) => void) => {
    try {
        const q = query(collection(db, MOVIE_COLLECTION), orderBy('createdAt', 'desc'));
        return onSnapshot(q, (snapshot) => {
            const movies = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as Movie[];
            callback(movies);
        }, (error) => {
            console.error("Error fetching movies: ", error);
        });
    } catch (e) {
        console.error("Error setting up subscription: ", e);
        return () => { };
    }
};
