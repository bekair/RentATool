import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
    container: { flex: 1 },
    map: { width: '100%', height: '100%' },

    loadingScreen: {
        flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff',
    },
    loadingText: { marginTop: 12, color: '#555', fontSize: 14 },

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
        backgroundColor: '#FFFFFF',
        paddingHorizontal: 14, paddingVertical: 8,
        borderRadius: 22, borderWidth: 1.5, borderColor: '#DDDDDD',
        margin: 4, alignItems: 'center', justifyContent: 'center',
    },
    pillSelected: { backgroundColor: '#222222', borderColor: '#222222' },
    pillText: { fontSize: 14, fontWeight: '700', color: '#222222', letterSpacing: 0.2 },
    pillTextSelected: { color: '#FFFFFF' },

    searchRow: {
        position: 'absolute', top: 30, left: 0, right: 0, zIndex: 10,
    },
    searchBar: {
        flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff',
        borderRadius: 32, marginHorizontal: 20, paddingHorizontal: 20, height: 56,
        shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1, shadowRadius: 12, elevation: 8,
        borderWidth: StyleSheet.hairlineWidth, borderColor: '#ddd',
    },
    searchIcon: { marginRight: 10 },
    searchInput: { flex: 1, fontSize: 14, fontWeight: '500', color: '#222' },
    filterMenuIcon: { padding: 8, borderLeftWidth: 1, borderLeftColor: '#eee', marginLeft: 10 },
    filterScroll: { marginTop: 12 },
    filterContent: { paddingHorizontal: 20, gap: 8 },
    filterPill: {
        backgroundColor: '#fff', paddingHorizontal: 16, paddingVertical: 8,
        borderRadius: 20, borderWidth: 1, borderColor: '#ddd', height: 36, justifyContent: 'center',
    },
    filterPillActive: { backgroundColor: '#222', borderColor: '#222' },
    filterPillText: { fontSize: 13, fontWeight: '600', color: '#222' },
    filterPillTextActive: { color: '#fff' },

    card: {
        position: 'absolute', bottom: 100, left: 20, right: 20,
        backgroundColor: '#fff', borderRadius: 16, overflow: 'hidden', zIndex: 100,
        shadowColor: '#000', shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.15, shadowRadius: 20, elevation: 12,
    },
    cardImageContainer: { height: 180, backgroundColor: '#f5f5f5' },
    cardImagePlaceholder: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    cardImageTopRow: {
        position: 'absolute', top: 15, left: 15, right: 15,
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    },
    guestFavoriteBadge: {
        backgroundColor: '#fff', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20,
        shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 2,
    },
    guestFavoriteText: { fontSize: 12, fontWeight: '700', color: '#222' },
    heartButton: { shadowColor: '#000', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.5, shadowRadius: 4 },
    carouselDots: {
        position: 'absolute', bottom: 15, width: '100%',
        flexDirection: 'row', justifyContent: 'center', gap: 6,
    },
    dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.6)' },
    dotActive: { backgroundColor: '#fff' },
    cardBody: { padding: 16 },
    cardRatingRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
    cardRatingText: { fontSize: 14, color: '#222', fontWeight: '500' },
    cardCategoryText: { fontSize: 15, color: '#717171', marginBottom: 4 },
    cardNameText: { fontSize: 16, fontWeight: '600', color: '#222', marginBottom: 8 },
    cardPriceLine: { fontSize: 16, color: '#222' },
    cardPriceValue: { fontWeight: 'bold' },
    cardPriceUnit: { color: '#717171', fontWeight: '300' },
    cardCloseX: {
        position: 'absolute', top: 10, right: 10,
        backgroundColor: 'rgba(255,255,255,0.9)',
        width: 30, height: 30, borderRadius: 15,
        justifyContent: 'center', alignItems: 'center', zIndex: 20,
        shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 4,
    },
});

export default styles;
