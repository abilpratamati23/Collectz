export interface Movie {
    id: string;
    title: string;
    isWatched: boolean;
    createdAt: number;
    tmdbId?: number;
    posterPath?: string;
    overview?: string;
    releaseDate?: string;
}
