import axios from 'axios';

// NOTE: Ideally, store this in an environment variable. 
// For this demo, we'll use a placeholder.
const API_KEY = 'e99026330032cc6297390fd592072186'; // THIS IS A SAMPLE KEY (Use your own for production)
const BASE_URL = 'https://api.themoviedb.org/3';

const tmdbClient = axios.create({
    baseURL: BASE_URL,
    params: {
        api_key: API_KEY,
        language: 'en-US',
    },
});

export const searchMovies = async (query: string) => {
    try {
        const response = await tmdbClient.get('/search/movie', {
            params: { query },
        });
        return response.data.results;
    } catch (error) {
        console.error('Error searching movies:', error);
        return [];
    }
};

export const getPopularMovies = async () => {
    try {
        const response = await tmdbClient.get('/movie/popular');
        return response.data.results;
    } catch (error) {
        console.error('Error fetching popular movies:', error);
        return [];
    }
};

export const getImageUrl = (path: string, size: 'w92' | 'w185' | 'w500' | 'original' = 'w185') => {
    return `https://image.tmdb.org/t/p/${size}${path}`;
};
