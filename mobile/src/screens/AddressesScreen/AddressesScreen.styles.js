import { StyleSheet } from 'react-native';

const FIELD_HEIGHT = 56;

export const styles = StyleSheet.create({
    scrollContent: { paddingHorizontal: 16, paddingTop: 20, paddingBottom: 50 },

    emptyState: { alignItems: 'center', paddingVertical: 60, paddingHorizontal: 30 },
    emptyTitle: { fontSize: 18, fontWeight: '700', color: '#444', marginTop: 16, marginBottom: 8 },
    emptySubtitle: { fontSize: 14, color: '#555', textAlign: 'center', lineHeight: 20 },

    addButton: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10,
        marginTop: 12,
        paddingVertical: 16,
        borderRadius: 14,
        borderWidth: 1.5,
        borderColor: '#6366f130',
        backgroundColor: '#6366f108',
        borderStyle: 'dashed',
    },
    addButtonText: { fontSize: 16, color: '#6366f1', fontWeight: '600' },
});

export const cardStyles = StyleSheet.create({
    card: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#1a1a1a',
        borderRadius: 14,
        borderWidth: 1,
        borderColor: '#2a2a2a',
        padding: 14,
        marginBottom: 12,
    },
    iconCol: { marginRight: 14 },
    iconBg: {
        width: 44, height: 44, borderRadius: 22,
        backgroundColor: '#6366f115',
        borderWidth: 1, borderColor: '#6366f130',
        justifyContent: 'center', alignItems: 'center',
    },
    info: { flex: 1 },
    titleRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 },
    label: { fontSize: 16, fontWeight: '700', color: '#fff' },
    defaultBadge: {
        backgroundColor: '#10b98120',
        borderRadius: 6,
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderWidth: 1,
        borderColor: '#10b98140',
    },
    defaultBadgeText: { fontSize: 10, color: '#10b981', fontWeight: '700' },
    detail: { fontSize: 13, color: '#888', lineHeight: 18 },
    coords: { fontSize: 11, color: '#555', marginTop: 2 },
    actions: { gap: 8, marginLeft: 8 },
    actionBtn: { padding: 6 },
});

export const modal = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0a0a0a',
    },
    header: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        paddingHorizontal: 20, paddingVertical: 14,
        borderBottomWidth: 1, borderBottomColor: '#1f1f1f',
    },
    cancel: { fontSize: 16, color: '#888', fontWeight: '500' },
    title: { fontSize: 17, fontWeight: '700', color: '#fff' },
    confirm: { fontSize: 16, color: '#6366f1', fontWeight: '700' },

    tabBar: {
        flexDirection: 'row',
        margin: 16,
        backgroundColor: '#1a1a1a',
        borderRadius: 12,
        padding: 4,
        borderWidth: 1,
        borderColor: '#2a2a2a',
    },
    tab: {
        flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
        paddingVertical: 10, borderRadius: 10, gap: 6,
    },
    tabActive: { backgroundColor: '#6366f1' },
    tabText: { fontSize: 14, color: '#888', fontWeight: '600' },
    tabTextActive: { color: '#fff' },

    scrollContent: { padding: 16, paddingBottom: 40 },
    fieldLabel: { fontSize: 16, color: '#fff', marginBottom: 8, fontWeight: '600' },
    input: {
        height: FIELD_HEIGHT,
        backgroundColor: '#2c2c2e',
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#2e2e2e',
        paddingHorizontal: 16,
        fontSize: 16,
        color: '#fff',
        marginBottom: 16,
    },
    rowFields: { flexDirection: 'row' },

    chipScroll: { marginBottom: 20 },
    chipScrollMap: { paddingVertical: 12 },
    chip: {
        paddingHorizontal: 16, paddingVertical: 8,
        borderRadius: 20, borderWidth: 1,
        borderColor: '#2e2e2e',
        backgroundColor: '#2c2c2e',
    },
    chipActive: { backgroundColor: '#6366f1', borderColor: '#6366f1' },
    chipText: { fontSize: 14, color: '#888', fontWeight: '500' },
    chipTextActive: { color: '#fff', fontWeight: '700' },

    mapContainer: { flex: 1, position: 'relative', overflow: 'hidden' },
    mapLoader: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 14 },
    mapLoaderText: { color: '#666', fontSize: 14 },

    coordsPill: {
        position: 'absolute', bottom: 16, alignSelf: 'center',
        flexDirection: 'row', alignItems: 'center', gap: 6,
        backgroundColor: 'rgba(10,10,10,0.85)',
        paddingHorizontal: 14, paddingVertical: 8,
        borderRadius: 20, borderWidth: 1, borderColor: '#2a2a2a',
    },
    coordsText: { fontSize: 12, color: '#ccc', fontWeight: '500' },
    mapHint: {
        fontSize: 13, color: '#555', textAlign: 'center',
        paddingHorizontal: 20, paddingVertical: 14, lineHeight: 18,
    },
});

export const cross = StyleSheet.create({
    container: {
        position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
        justifyContent: 'center', alignItems: 'center',
    },
    shadow: {
        position: 'absolute', width: 20, height: 6, borderRadius: 10,
        backgroundColor: 'rgba(0,0,0,0.25)', bottom: '50%', marginBottom: -3,
    },
    stem: {
        position: 'absolute', width: 3, height: 22, backgroundColor: '#6366f1',
        borderRadius: 2, bottom: '50%', marginBottom: 12,
    },
    head: {
        position: 'absolute', width: 32, height: 32, borderRadius: 16,
        backgroundColor: '#6366f1', bottom: '50%', marginBottom: 30,
        justifyContent: 'center', alignItems: 'center',
        shadowColor: '#6366f1', shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.5, shadowRadius: 8, elevation: 6,
    },
    inner: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#fff' },
});

export const chipRow = StyleSheet.create({
    scroll: { marginBottom: 16 },
    chip: {
        paddingHorizontal: 16, paddingVertical: 8,
        borderRadius: 20, borderWidth: 1,
        borderColor: '#2e2e2e', backgroundColor: '#2c2c2e',
    },
    chipActive: {
        backgroundColor: '#6366f1', borderColor: '#6366f1',
        paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20,
    },
    chipText: { fontSize: 14, color: '#888', fontWeight: '500' },
    chipTextActive: { fontSize: 14, color: '#fff', fontWeight: '700' },
    addChip: {
        paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20,
        borderWidth: 1.5, borderColor: '#6366f150', backgroundColor: '#6366f110',
        flexDirection: 'row', alignItems: 'center', gap: 4, borderStyle: 'dashed',
    },
    addChipText: { fontSize: 14, color: '#6366f1', fontWeight: '600' },
    customInputRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 16 },
    customInput: {
        flex: 1, height: 44, backgroundColor: '#3a3a3c',
        borderRadius: 10, borderWidth: 1, borderColor: '#6366f1',
        paddingHorizontal: 14, fontSize: 15, color: '#fff',
    },
    customConfirm: {
        width: 44, height: 44, borderRadius: 10,
        backgroundColor: '#6366f1', justifyContent: 'center', alignItems: 'center',
    },
    customCancel: {
        width: 44, height: 44, borderRadius: 10,
        backgroundColor: '#2a2a2a', justifyContent: 'center', alignItems: 'center',
    },
    selectedCustomRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12 },
    selectedHint: { fontSize: 12, color: '#555' },
});
