import { StyleSheet } from 'react-native';

const FIELD_HEIGHT = 56;

export default function createStyles(theme) {
    const c = theme.colors;
    return {
        styles: StyleSheet.create({
            scrollContent: { paddingHorizontal: 16, paddingTop: 20, paddingBottom: 50 },

            emptyState: { alignItems: 'center', paddingVertical: 60, paddingHorizontal: 30 },
            emptyTitle: { fontSize: 18, fontWeight: '700', color: c.textDisabled, marginTop: 16, marginBottom: 8 },
            emptySubtitle: { fontSize: 14, color: c.iconSubtle, textAlign: 'center', lineHeight: 20 },

            addButton: {
                flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10,
                marginTop: 12,
                paddingVertical: 16,
                borderRadius: 14,
                borderWidth: 1.5,
                borderColor: `${c.accent}30`,
                backgroundColor: `${c.accent}08`,
                borderStyle: 'dashed',
            },
            addButtonText: { fontSize: 16, color: c.accent, fontWeight: '600' },
        }),

        cardStyles: StyleSheet.create({
            card: {
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: c.surfaceMuted,
                borderRadius: 14,
                borderWidth: 1,
                borderColor: c.border,
                padding: 14,
                marginBottom: 12,
            },
            iconCol: { marginRight: 14 },
            iconBg: {
                width: 44, height: 44, borderRadius: 22,
                backgroundColor: `${c.accent}15`,
                borderWidth: 1, borderColor: `${c.accent}30`,
                justifyContent: 'center', alignItems: 'center',
            },
            info: { flex: 1 },
            titleRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 },
            label: { fontSize: 16, fontWeight: '700', color: c.textPrimary },
            defaultBadge: {
                backgroundColor: `${c.success}20`,
                borderRadius: 6,
                paddingHorizontal: 6,
                paddingVertical: 2,
                borderWidth: 1,
                borderColor: `${c.success}40`,
            },
            defaultBadgeText: { fontSize: 10, color: c.success, fontWeight: '700' },
            detail: { fontSize: 13, color: c.iconMuted, lineHeight: 18 },
            coords: { fontSize: 11, color: c.iconSubtle, marginTop: 2 },
            actions: { gap: 8, marginLeft: 8 },
            actionBtn: { padding: 6 },
        }),

        modal: StyleSheet.create({
            container: {
                flex: 1,
                backgroundColor: c.bg,
            },
            header: {
                flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
                paddingHorizontal: 20, paddingVertical: 14,
                borderBottomWidth: 1, borderBottomColor: c.surfaceAlt,
            },
            cancel: { fontSize: 16, color: c.iconMuted, fontWeight: '500' },
            title: { fontSize: 17, fontWeight: '700', color: c.textPrimary },
            confirm: { fontSize: 16, color: c.accent, fontWeight: '700' },

            tabBar: {
                flexDirection: 'row',
                margin: 16,
                backgroundColor: c.surfaceMuted,
                borderRadius: 12,
                padding: 4,
                borderWidth: 1,
                borderColor: c.border,
            },
            tab: {
                flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
                paddingVertical: 10, borderRadius: 10, gap: 6,
            },
            tabActive: { backgroundColor: c.accent },
            tabText: { fontSize: 14, color: c.iconMuted, fontWeight: '600' },
            tabTextActive: { color: c.accentContrast },

            scrollContent: { padding: 16, paddingBottom: 40 },
            fieldLabel: { fontSize: 16, color: c.textPrimary, marginBottom: 8, fontWeight: '600' },
            input: {
                height: FIELD_HEIGHT,
                backgroundColor: c.fieldReadOnlyBg,
                borderRadius: 10,
                borderWidth: 1,
                borderColor: c.border,
                paddingHorizontal: 16,
                fontSize: 16,
                color: c.textPrimary,
                marginBottom: 16,
            },
            rowFields: { flexDirection: 'row' },

            chipScroll: { marginBottom: 20 },
            chipScrollMap: { paddingVertical: 12, paddingHorizontal: 16 },
            chip: {
                paddingHorizontal: 16, paddingVertical: 8,
                borderRadius: 20, borderWidth: 1,
                borderColor: c.border,
                backgroundColor: c.fieldReadOnlyBg,
            },
            chipActive: { backgroundColor: c.accent, borderColor: c.accent },
            chipText: { fontSize: 14, color: c.iconMuted, fontWeight: '500' },
            chipTextActive: { color: c.textPrimary, fontWeight: '700' },

            mapContainer: { flex: 1, position: 'relative', overflow: 'hidden' },
            mapLoader: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 14 },
            mapLoaderText: { color: c.iconSubtle, fontSize: 14 },

            coordsPill: {
                position: 'absolute', bottom: 16, alignSelf: 'center',
                flexDirection: 'row', alignItems: 'center', gap: 6,
                backgroundColor: `${c.bg}d9`,
                paddingHorizontal: 14, paddingVertical: 8,
                borderRadius: 20, borderWidth: 1, borderColor: c.border,
            },
            coordsText: { fontSize: 12, color: c.textSecondary, fontWeight: '500' },
            mapHint: {
                fontSize: 13, color: c.iconSubtle, textAlign: 'center',
                paddingHorizontal: 20, paddingVertical: 14, lineHeight: 18,
            },
        }),

        cross: StyleSheet.create({
            container: {
                position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                justifyContent: 'center', alignItems: 'center',
            },
            shadow: {
                position: 'absolute', width: 20, height: 6, borderRadius: 10,
                backgroundColor: 'rgba(0,0,0,0.25)', bottom: '50%', marginBottom: -3,
            },
            stem: {
                position: 'absolute', width: 3, height: 22, backgroundColor: c.accent,
                borderRadius: 2, bottom: '50%', marginBottom: 12,
            },
            head: {
                position: 'absolute', width: 32, height: 32, borderRadius: 16,
                backgroundColor: c.accent, bottom: '50%', marginBottom: 30,
                justifyContent: 'center', alignItems: 'center',
                shadowColor: c.accent, shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.5, shadowRadius: 8, elevation: 6,
            },
            inner: { width: 10, height: 10, borderRadius: 5, backgroundColor: c.accentContrast },
        }),

        chipRow: StyleSheet.create({
            scroll: { marginBottom: 16 },
            chip: {
                paddingHorizontal: 16, paddingVertical: 8,
                borderRadius: 20, borderWidth: 1,
                borderColor: c.border, backgroundColor: c.fieldReadOnlyBg,
            },
            chipActive: {
                backgroundColor: c.accent, borderColor: c.accent,
                paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20,
            },
            chipText: { fontSize: 14, color: c.iconMuted, fontWeight: '500' },
            chipTextActive: { fontSize: 14, color: c.accentContrast, fontWeight: '700' },
            addChip: {
                paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20,
                borderWidth: 1.5, borderColor: `${c.accent}50`, backgroundColor: `${c.accent}10`,
                flexDirection: 'row', alignItems: 'center', gap: 4, borderStyle: 'dashed',
            },
            addChipText: { fontSize: 14, color: c.accent, fontWeight: '600' },
            customInputRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 16 },
            customInput: {
                flex: 1, height: 44, backgroundColor: c.fieldReadOnlyBg,
                borderRadius: 10, borderWidth: 1, borderColor: c.accent,
                paddingHorizontal: 14, fontSize: 15, color: c.textPrimary,
            },
            customConfirm: {
                width: 44, height: 44, borderRadius: 10,
                backgroundColor: c.accent, justifyContent: 'center', alignItems: 'center',
            },
            customCancel: {
                width: 44, height: 44, borderRadius: 10,
                backgroundColor: c.border, justifyContent: 'center', alignItems: 'center',
            },
            selectedCustomRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12 },
            selectedHint: { fontSize: 12, color: c.iconSubtle },
        }),
    };
}
