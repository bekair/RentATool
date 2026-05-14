import { StyleSheet } from 'react-native';

export default function createStyles(theme) {
    const c = theme.colors;
    const isDark = theme.id === 'dark';

    return StyleSheet.create({
        container: { flex: 1 },
        map: { width: '100%', height: '100%' },

        loadingScreen: {
            flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: c.bg,
        },
        loadingText: { marginTop: 12, color: c.textMuted, fontSize: 14 },

        pillCapture: {
            marginTop: 40,
            flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center',
            paddingHorizontal: 20, gap: 8,
        },

        pendingCaptureStrip: {
            position: 'absolute', bottom: 0, left: 0, right: 0, height: 74,
            flexDirection: 'row', flexWrap: 'wrap', overflow: 'hidden', zIndex: 1,
        },

        pill: {
            backgroundColor: c.surface,
            paddingHorizontal: 14, paddingVertical: 8,
            borderRadius: 22, borderWidth: 1.5, borderColor: c.border,
            margin: 4, alignItems: 'center', justifyContent: 'center',
        },
        pillSelected: { backgroundColor: c.textPrimary, borderColor: c.textPrimary },
        pillText: { fontSize: 14, fontWeight: '700', color: c.textPrimary, letterSpacing: 0.2 },
        pillTextSelected: { color: c.accentContrast },

        searchRow: {
            position: 'absolute', top: 30, left: 0, right: 0, zIndex: 10,
        },
        searchBar: {
            flexDirection: 'row', alignItems: 'center', backgroundColor: c.surface,
            borderRadius: 32, marginHorizontal: 20, paddingHorizontal: 20, height: 56,
            shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.1, shadowRadius: 12, elevation: 8,
            borderWidth: StyleSheet.hairlineWidth, borderColor: c.border,
        },
        searchIcon: { marginRight: 10, color: c.accent },
        searchInput: { flex: 1, fontSize: 14, fontWeight: '500', color: c.textPrimary },
        filterMenuIcon: { padding: 8, borderLeftWidth: 1, borderLeftColor: c.border, marginLeft: 10 },
        filterMenuIconColor: { color: c.textPrimary },
        filterScroll: { marginTop: 12 },
        filterContent: { paddingHorizontal: 20, gap: 8 },
        filterPill: {
            backgroundColor: c.surface, paddingHorizontal: 16, paddingVertical: 8,
            borderRadius: 20, borderWidth: 1, borderColor: c.border, height: 36, justifyContent: 'center',
        },
        filterPillActive: {
            backgroundColor: isDark ? c.accentSurfaceStrong : c.textPrimary,
            borderColor: isDark ? c.accent : c.textPrimary,
        },
        filterPillText: { fontSize: 13, fontWeight: '600', color: c.textPrimary },
        filterPillTextActive: { color: c.accentContrast },

        card: {
            position: 'absolute', bottom: 100, left: 20, right: 20,
            backgroundColor: c.surface, borderRadius: 16, overflow: 'hidden', zIndex: 100,
            shadowColor: '#000', shadowOffset: { width: 0, height: 10 },
            shadowOpacity: 0.15, shadowRadius: 20, elevation: 12,
        },
        cardImageContainer: { height: 180, backgroundColor: c.surfaceAlt },
        cardImagePlaceholder: { flex: 1, justifyContent: 'center', alignItems: 'center' },
        cardPlaceholderIcon: { color: c.borderStrong },
        cardImageTopRow: {
            position: 'absolute', top: 15, left: 15, right: 15,
            flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
        },
        guestFavoriteBadge: {
            backgroundColor: c.surface, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20,
            shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 2,
        },
        guestFavoriteText: { fontSize: 12, fontWeight: '700', color: c.textPrimary },
        heartButton: { shadowColor: '#000', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.5, shadowRadius: 4 },
        cardTopIcon: { color: c.accentContrast },
        carouselDots: {
            position: 'absolute', bottom: 15, width: '100%',
            flexDirection: 'row', justifyContent: 'center', gap: 6,
        },
        dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.6)' },
        dotActive: { backgroundColor: c.accentContrast },
        cardBody: { padding: 16 },
        cardRatingRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
        cardRatingIcon: { color: c.warning },
        cardRatingText: { fontSize: 14, color: c.textPrimary, fontWeight: '500' },
        cardCategoryText: { fontSize: 15, color: c.iconMuted, marginBottom: 4 },
        cardNameText: { fontSize: 16, fontWeight: '600', color: c.textPrimary, marginBottom: 8 },
        cardPriceLine: { fontSize: 16, color: c.textPrimary },
        cardPriceValue: { fontWeight: 'bold' },
        cardPriceUnit: { color: c.iconMuted, fontWeight: '300' },
        cardCloseX: {
            position: 'absolute', top: 10, right: 10,
            backgroundColor: 'rgba(255,255,255,0.9)',
            width: 30, height: 30, borderRadius: 15,
            justifyContent: 'center', alignItems: 'center', zIndex: 20,
            shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 4,
        },
        cardCloseXIcon: { color: c.textPrimary },
    });
}
