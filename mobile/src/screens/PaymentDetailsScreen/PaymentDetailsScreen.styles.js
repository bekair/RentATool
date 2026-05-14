import { StyleSheet } from 'react-native';

export default function createStyles(theme) {
    const c = theme.colors;
    const isDark = theme.id === 'dark';

    return StyleSheet.create({
        topLoader: {
            paddingVertical: 10,
            alignItems: 'center',
        },
        loadingWrap: {
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
        },
        scrollContent: {
            paddingHorizontal: 20,
            paddingBottom: 24,
            gap: 24,
        },
        sectionWrap: {
            gap: 10,
        },
        sectionWrapSpaced: {
            marginTop: 6,
        },
        sectionTitle: {
            fontSize: 16,
            color: c.textPrimary,
            fontWeight: '700',
        },
        sectionDescription: {
            color: c.iconMuted,
            fontSize: 13,
        },
        listCard: {
            backgroundColor: c.surface,
            borderRadius: 16,
            borderWidth: 1,
            borderColor: c.border,
            padding: 14,
            gap: 12,
        },
        listRow: {
            flexDirection: 'row',
            alignItems: 'center',
            borderWidth: 1,
            borderColor: isDark ? c.borderStrong : c.border,
            borderRadius: 14,
            backgroundColor: isDark ? c.surfaceMuted : c.surface,
            minHeight: 72,
            paddingHorizontal: 12,
            paddingVertical: 12,
            gap: 12,
        },
        listRowSelected: {
            borderColor: c.accent,
            backgroundColor: isDark ? c.accentSurfaceStrong : c.accentSurface,
        },
        cardBrandSlot: {
            width: 56,
            alignItems: 'flex-start',
            justifyContent: 'center',
        },
        rowIconWrap: {
            width: 34,
            height: 34,
            borderRadius: 10,
            borderWidth: 1,
            borderColor: isDark ? c.borderStrong : c.border,
            backgroundColor: isDark ? c.surfaceAlt : c.surface,
            alignItems: 'center',
            justifyContent: 'center',
        },
        rowIcon: {
            color: c.accent,
        },
        rowTextWrap: {
            flex: 1,
        },
        rowRight: {
            alignItems: 'flex-end',
            justifyContent: 'center',
            gap: 6,
        },
        rowTitle: {
            color: c.textPrimary,
            fontSize: 15,
            fontWeight: '600',
        },
        rowSubtitle: {
            color: c.iconMuted,
            fontSize: 12,
            marginTop: 3,
        },
        defaultBadge: {
            height: 24,
            borderRadius: 999,
            paddingHorizontal: 10,
            backgroundColor: isDark ? c.accentSurfaceStrong : c.accent,
            borderWidth: 1,
            borderColor: c.accent,
            alignItems: 'center',
            justifyContent: 'center',
        },
        defaultBadgeText: {
            color: c.accentContrast,
            fontSize: 11,
            fontWeight: '700',
        },
        defaultCheckIcon: {
            color: c.accent,
        },
        statusDot: {
            width: 10,
            height: 10,
            borderRadius: 5,
        },
        loadMoreButton: {
            marginTop: 0,
            backgroundColor: isDark ? c.surfaceAlt : c.surface,
            borderWidth: 1,
            borderColor: isDark ? c.borderStrong : c.border,
        },
        loadMoreButtonText: {
            color: c.textSecondary,
        },
        addCardButton: {
            marginTop: 0,
        },
        primaryActionButton: {
            marginTop: 0,
        },
    });
}
