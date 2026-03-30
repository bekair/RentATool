import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
    container: { flex: 1 },
    map: { width: '100%', height: '100%' },
    loadingScreen: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' },
    loadingText: { marginTop: 12, color: '#555', fontSize: 14 },

    pill: {
        backgroundColor: '#FFFFFF', paddingHorizontal: 14, paddingVertical: 8,
        borderRadius: 22, borderWidth: 1.5, borderColor: '#DDDDDD',
        alignItems: 'center', justifyContent: 'center',
        shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15, shadowRadius: 4,
    },
    pillSelected: { backgroundColor: '#222222', borderColor: '#222222' },
    pillText: { fontSize: 14, fontWeight: '700', color: '#222222', letterSpacing: 0.2 },
    pillTextSelected: { color: '#FFFFFF' },

    searchRow: { position: 'absolute', top: 50, left: 0, right: 0, zIndex: 10 },
    searchBar: {
        flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff',
        borderRadius: 32, marginHorizontal: 20, paddingHorizontal: 20, height: 56,
        shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1, shadowRadius: 12,
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
        shadowOpacity: 0.15, shadowRadius: 20,
    },
    cardImg: { height: 180, backgroundColor: '#f5f5f5' },
    cardImgPlaceholder: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    cardImgTopRow: {
        position: 'absolute', top: 15, left: 15, right: 15,
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    },
    guestBadge: {
        backgroundColor: '#fff', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20,
        shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4,
    },
    guestBadgeText: { fontSize: 12, fontWeight: '700', color: '#222' },
    dots: { position: 'absolute', bottom: 15, width: '100%', flexDirection: 'row', justifyContent: 'center', gap: 6 },
    dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.6)' },
    dotActive: { backgroundColor: '#fff' },
    cardBody: { padding: 16 },
    ratingRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
    ratingText: { fontSize: 14, color: '#222', fontWeight: '500' },
    categoryText: { fontSize: 15, color: '#717171', marginBottom: 4 },
    nameText: { fontSize: 16, fontWeight: '600', color: '#222', marginBottom: 8 },
    priceLine: { fontSize: 16, color: '#222' },
    priceValue: { fontWeight: 'bold' },
    priceUnit: { color: '#717171', fontWeight: '300' },
    closeBtn: {
        position: 'absolute', top: 10, right: 10,
        backgroundColor: 'rgba(255,255,255,0.9)', width: 30, height: 30,
        borderRadius: 15, justifyContent: 'center', alignItems: 'center', zIndex: 20,
        shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4,
    },
});

export default styles;
