export const LIGHT_COLORS = {
    background: '#F2F2EB', // Muted Sage/Sand (Not pure white)
    surface: '#EAEAE2', // Slightly darker than background
    surfaceHighlight: '#DFDFD6', // Noticeably darker for depth
    primary: '#4D6248', // Muted Deep Green
    primaryGradient: ['#4D6248', '#667C60'],
    secondary: '#B88B5B', // Muted Oak/Wood
    text: '#2D3436', // Dark Slate for readability
    textSecondary: '#636E72', // Slate Grey
    success: '#82954B', // Natural Green
    danger: '#B25068', // Muted Rose/Red
    overlay: 'rgba(45, 52, 54, 0.4)',
};

export const DARK_COLORS = {
    background: '#141612', // Deep Charcoal with Green undertone
    surface: '#1C1F18', // Slightly lighter elevation
    surfaceHighlight: '#262A21', // Surface for cards
    primary: '#A3C994', // Lighter, vibrant Sage for dark contrast
    primaryGradient: ['#A3C994', '#82954B'],
    secondary: '#D4A373', // Warmer variant of secondary
    text: '#E2E3DC', // Off-white for readability
    textSecondary: '#90928B', // Muted sage grey
    success: '#82954B', // Keep natural green
    danger: '#E57373', // Softer red for dark mode
    overlay: 'rgba(0, 0, 0, 0.6)',
};

export const COLORS = LIGHT_COLORS;

export const SPACING = {
    xs: 4,
    s: 8,
    m: 16,
    l: 24,
    xl: 32,
    xxl: 48,
};

export const RADIUS = {
    s: 8,
    m: 16,
    l: 24,
    xl: 32,
    round: 9999,
};

export const FONTS = {
    header: {
        fontSize: 32,
        fontWeight: '800' as '800',
        letterSpacing: -0.5,
    },
    subHeader: {
        fontSize: 24,
        fontWeight: '700' as '700',
    },
    title: {
        fontSize: 18,
        fontWeight: '600' as '600',
    },
    body: {
        fontSize: 14,
    }
};

export const LAYOUT = {
    screenPadding: 20,
};
