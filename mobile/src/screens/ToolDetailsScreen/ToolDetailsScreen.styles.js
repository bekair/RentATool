import { Dimensions, Platform, StyleSheet } from 'react-native';

const { width } = Dimensions.get('window');

export default function createStyles(theme) {
    const c = theme.colors;
    const isDark = theme.id === 'dark';

    return StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: c.bg,
        },
        loadingContainer: {
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: c.bg,
        },
        errorText: { color: c.textMuted, fontSize: 15 },

        header: {
            position: 'absolute',
            top: Platform.OS === 'ios' ? 52 : 30,
            left: 0,
            right: 0,
            flexDirection: 'row',
            justifyContent: 'space-between',
            paddingHorizontal: 20,
            zIndex: 100,
        },
        headerRight: { flexDirection: 'row', gap: 12 },
        iconBtn: {
            width: 38,
            height: 38,
            borderRadius: 19,
            backgroundColor: isDark ? c.overlay : c.tabBarBorder,
            justifyContent: 'center',
            alignItems: 'center',
            borderWidth: 1,
            borderColor: c.tabBarBorder,
        },
        iconBtnIcon: {
            color: c.textPrimary,
        },
        favoriteIconActive: {
            color: c.accent,
        },

        hero: {
            width,
            height: 320,
            backgroundColor: c.surfaceAlt,
            position: 'relative',
        },
        heroPlaceholder: { flex: 1, justifyContent: 'center', alignItems: 'center' },
        heroPlaceholderIcon: { color: c.iconSubtle },
        heroPlaceholderText: { marginTop: 12, color: c.textMuted, fontSize: 13 },
        heroGradient: {
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: 80,
            backgroundColor: c.overlay,
        },
        photoBadge: {
            position: 'absolute',
            bottom: 16,
            right: 16,
            backgroundColor: isDark ? c.overlay : c.tabBarBorder,
            paddingHorizontal: 12,
            paddingVertical: 4,
            borderRadius: 6,
        },
        photoBadgeText: { color: c.textPrimary, fontSize: 12, fontWeight: '600' },

        scrollContent: { paddingBottom: 130 },
        content: { padding: 24 },

        toolName: {
            fontSize: 26,
            fontWeight: '700',
            color: c.textPrimary,
            marginBottom: 10,
            lineHeight: 32,
        },

        ratingRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
        ratingStar: { color: c.warning },
        ratingScore: { fontSize: 14, fontWeight: '600', color: c.textPrimary },
        reviewsLink: {
            fontSize: 14,
            fontWeight: '600',
            color: c.textPrimary,
            textDecorationLine: 'underline',
        },
        locationText: { fontSize: 14, color: c.textMuted },

        section: { marginBottom: 0 },
        sectionCard: {
            backgroundColor: c.surface,
            borderWidth: 1,
            borderColor: c.border,
            borderRadius: 16,
            padding: 16,
            marginTop: 16,
        },

        hostRow: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
        },
        hostTitle: {
            fontSize: 18,
            fontWeight: '600',
            color: c.textPrimary,
            marginBottom: 4,
        },
        hostTextWrap: {
            flex: 1,
        },
        hostSub: { fontSize: 14, color: c.textMuted },
        avatar: {
            width: 54,
            height: 54,
            borderRadius: 27,
            backgroundColor: c.surfaceMuted,
            justifyContent: 'center',
            alignItems: 'center',
            borderWidth: 2,
            borderColor: c.border,
        },
        avatarText: { color: c.textPrimary, fontSize: 20, fontWeight: '700' },
        verifiedBadge: {
            position: 'absolute',
            bottom: 0,
            right: 0,
            backgroundColor: c.success,
            width: 18,
            height: 18,
            borderRadius: 9,
            borderWidth: 2,
            borderColor: c.bg,
            justifyContent: 'center',
            alignItems: 'center',
        },
        verifiedBadgeIcon: {
            color: c.accentContrast,
        },

        highlightRow: {
            flexDirection: 'row',
            alignItems: 'flex-start',
            marginBottom: 20,
        },
        highlightRowLast: {
            marginBottom: 0,
        },
        highlightIcon: {
            width: 44,
            height: 44,
            borderRadius: 22,
            backgroundColor: c.accentSurface,
            justifyContent: 'center',
            alignItems: 'center',
        },
        highlightIconColor: {
            color: c.accent,
        },
        highlightTitle: {
            fontSize: 15,
            fontWeight: '600',
            color: c.textPrimary,
            marginBottom: 3,
        },
        highlightContent: {
            flex: 1,
            marginLeft: 16,
        },
        highlightSub: { fontSize: 13, color: c.textMuted, lineHeight: 18 },

        sectionTitle: {
            fontSize: 20,
            fontWeight: '700',
            color: c.textPrimary,
            marginBottom: 12,
        },
        description: { fontSize: 15, color: c.textMuted, lineHeight: 22 },
        availabilityHint: {
            fontSize: 13,
            color: c.textMuted,
            lineHeight: 18,
            marginBottom: 10,
        },
        availabilityLoading: {
            paddingVertical: 12,
            alignItems: 'center',
        },
        availabilityLegendRow: {
            marginTop: 10,
            flexDirection: 'row',
            alignItems: 'center',
            gap: 12,
        },
        availabilityLegendItem: {
            flexDirection: 'row',
            alignItems: 'center',
        },
        availabilityLegendDot: {
            width: 10,
            height: 10,
            borderRadius: 5,
            marginRight: 6,
        },
        availabilityLegendBookedDot: {
            backgroundColor: c.danger,
        },
        availabilityLegendBlockedDot: {
            backgroundColor: c.accent,
        },
        availabilityLegendText: {
            color: c.textMuted,
            fontSize: 12,
        },

        specRow: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            paddingVertical: 14,
        },
        specLabel: { fontSize: 15, color: c.textMuted },
        specValue: { fontSize: 15, color: c.textPrimary, fontWeight: '500' },

        locationCard: {
            backgroundColor: c.surfaceMuted,
            borderWidth: 1,
            borderColor: c.border,
            borderRadius: 12,
            padding: 12,
            flexDirection: 'row',
            alignItems: 'flex-start',
        },
        locationIcon: {
            width: 36,
            height: 36,
            borderRadius: 18,
            backgroundColor: c.accentSurface,
            alignItems: 'center',
            justifyContent: 'center',
            marginRight: 12,
        },
        locationPinIcon: { color: c.accent },
        locationInfo: {
            flex: 1,
        },
        locationPrimary: {
            color: c.textPrimary,
            fontSize: 15,
            fontWeight: '700',
        },
        locationSecondary: {
            marginTop: 3,
            color: c.textMuted,
            fontSize: 13,
        },
        locationCoordinates: {
            marginTop: 6,
            color: c.accent,
            fontSize: 12,
            fontWeight: '600',
        },

        footer: {
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            backgroundColor: c.surface,
        },
        footerContent: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingHorizontal: 24,
            paddingTop: 16,
            paddingBottom: 8,
        },
        footerPriceWrap: {
            flex: 1,
            paddingRight: 12,
        },
        footerPrice: { fontSize: 20, fontWeight: '700', color: c.textPrimary },
        footerDay: { fontSize: 15, fontWeight: '400', color: c.textMuted },
        reserveBtn: {
            backgroundColor: c.buttonPrimary,
            paddingHorizontal: 24,
            paddingVertical: 15,
            borderRadius: 12,
            minWidth: 140,
            alignItems: 'center',
            shadowColor: c.accent,
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.45,
            shadowRadius: 14,
            elevation: 8,
        },
        reserveBtnText: {
            color: c.buttonPrimaryText,
            fontSize: 16,
            fontWeight: '700',
            letterSpacing: 0.3,
        },
    });
}
