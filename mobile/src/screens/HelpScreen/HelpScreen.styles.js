import { StyleSheet } from 'react-native';

export default function createStyles(theme) {
    const c = theme.colors;
    const lightQuickActionBorder = c.accent;

    return StyleSheet.create({
        headerIconButton: {
            width: 34,
            height: 34,
            borderRadius: 10,
            borderWidth: 1,
            borderColor: c.border,
            backgroundColor: c.surfaceMuted,
            alignItems: 'center',
            justifyContent: 'center',
        },
        iconAccent: {
            color: c.accent,
        },
        iconMuted: {
            color: c.iconMuted,
        },
        scrollContent: {
            paddingHorizontal: 20,
            paddingBottom: 28,
            gap: 18,
        },
        heroCard: {
            borderRadius: 18,
            borderWidth: 1,
            borderColor: c.accent,
            backgroundColor: c.accentSurface,
            padding: 16,
            gap: 8,
        },
        heroEyebrow: {
            color: c.accent,
            fontSize: 12,
            fontWeight: '700',
            textTransform: 'uppercase',
        },
        heroTitle: {
            color: c.textPrimary,
            fontSize: 22,
            fontWeight: '700',
        },
        heroDescription: {
            color: c.textMuted,
            fontSize: 13,
            lineHeight: 19,
        },
        section: {
            gap: 10,
        },
        sectionTitle: {
            color: c.textPrimary,
            fontSize: 16,
            fontWeight: '700',
        },
        quickActionGrid: {
            gap: 10,
        },
        quickActionCard: {
            borderRadius: 14,
            borderWidth: 1,
            borderColor: theme.id === 'light' ? lightQuickActionBorder : c.border,
            backgroundColor: c.surfaceMuted,
            padding: 14,
            gap: 8,
        },
        quickActionIconWrap: {
            width: 32,
            height: 32,
            borderRadius: 10,
            borderWidth: 1,
            borderColor: c.borderStrong,
            backgroundColor: c.surfaceAlt,
            alignItems: 'center',
            justifyContent: 'center',
        },
        quickActionTitle: {
            color: c.textPrimary,
            fontSize: 15,
            fontWeight: '600',
        },
        quickActionDescription: {
            color: c.iconMuted,
            fontSize: 12,
            lineHeight: 17,
        },
        faqList: {
            gap: 10,
        },
        faqItem: {
            borderRadius: 14,
            borderWidth: 1,
            borderColor: c.border,
            backgroundColor: c.surfaceMuted,
            paddingHorizontal: 14,
            paddingVertical: 12,
            gap: 10,
        },
        faqHeader: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 12,
        },
        faqQuestion: {
            flex: 1,
            color: c.textPrimary,
            fontSize: 14,
            fontWeight: '600',
        },
        faqAnswer: {
            color: c.iconMuted,
            fontSize: 12,
            lineHeight: 18,
        },
        supportCard: {
            borderRadius: 16,
            borderWidth: 1,
            borderColor: lightQuickActionBorder,
            backgroundColor: c.surfaceMuted,
            padding: 14,
        },
        supportTitle: {
            color: c.textPrimary,
            fontSize: 16,
            fontWeight: '700',
        },
        supportDescription: {
            marginTop: 6,
            color: c.iconMuted,
            fontSize: 13,
            lineHeight: 18,
        },
    });
}
