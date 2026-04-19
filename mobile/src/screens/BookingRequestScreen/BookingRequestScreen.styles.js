import { StyleSheet } from 'react-native';
import { RESOLVED_THEMES } from '../../theme';

export default function createStyles(theme) {
    const c = theme.colors;
    return StyleSheet.create({
        loadingContainer: {
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: c.bg,
        },
        header: {
            paddingVertical: 14,
            borderBottomWidth: 1,
            borderBottomColor: c.border,
            backgroundColor: c.surfaceMuted,
        },
        headerBtn: {
            width: 28,
        },
        scroll: {
            flex: 1,
        },
        scrollContent: {
            padding: 20,
            paddingBottom: 36,
        },
        toolCard: {
            backgroundColor: c.surface,
            borderWidth: 1,
            borderColor: c.border,
            borderRadius: 14,
            padding: 16,
            marginBottom: 12,
        },
        toolName: {
            color: c.textPrimary,
            fontSize: 17,
            fontWeight: '700',
        },
        toolPrice: {
            marginTop: 4,
            color: c.iconMuted,
            fontSize: 13,
            fontWeight: '600',
        },
        payLaterBanner: {
            backgroundColor: `${c.accent}14`,
            borderWidth: 1,
            borderColor: `${c.accent}59`,
            borderRadius: 12,
            paddingHorizontal: 12,
            paddingVertical: 10,
            flexDirection: 'row',
            alignItems: 'center',
            marginBottom: 20,
        },
        payLaterText: {
            marginLeft: 8,
            color: c.accent,
            fontSize: 13,
            fontWeight: '600',
        },
        section: {
            marginBottom: 20,
        },
        sectionTitle: {
            color: c.textPrimary,
            fontSize: 16,
            fontWeight: '700',
            marginBottom: 12,
        },
        calendar: {
            borderWidth: 1,
            borderColor: theme.id === RESOLVED_THEMES.LIGHT ? c.fieldEditingBorder : c.border,
            borderRadius: 12,
            overflow: 'hidden',
            ...(theme.id === RESOLVED_THEMES.LIGHT && {
                shadowColor: c.inputShadow,
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.15,
                shadowRadius: 10,
                elevation: 4,
            }),
        },
        legendRow: {
            marginTop: 10,
            flexDirection: 'row',
            alignItems: 'center',
        },
        legendDot: {
            width: 10,
            height: 10,
            borderRadius: 5,
            backgroundColor: c.borderStrong,
            marginRight: 8,
        },
        legendText: {
            color: c.iconMuted,
            fontSize: 12,
        },
        pickupGrid: {
            flexDirection: 'row',
            flexWrap: 'wrap',
            gap: 10,
        },
        pickupChip: {
            minWidth: '47%',
            borderWidth: 1,
            borderColor: c.border,
            borderRadius: 10,
            paddingVertical: 12,
            alignItems: 'center',
            backgroundColor: c.surface,
        },
        pickupChipActive: {
            borderColor: c.accent,
            backgroundColor: `${c.accent}29`,
        },
        pickupChipText: {
            color: c.iconMuted,
            fontSize: 13,
            fontWeight: '600',
        },
        pickupChipTextActive: {
            color: c.accent,
        },
        noteInput: {
            height: 128,
            paddingTop: 14,
            textAlignVertical: 'top',
        },
        noteCounter: {
            marginTop: -12,
            color: c.iconMuted,
            fontSize: 12,
            textAlign: 'right',
        },
        summaryCard: {
            backgroundColor: c.surface,
            borderWidth: 1,
            borderColor: c.border,
            borderRadius: 14,
            padding: 16,
        },
        summaryTop: {
            color: c.iconMuted,
            fontSize: 13,
            fontWeight: '600',
        },
        summaryAmount: {
            color: c.textPrimary,
            fontSize: 28,
            fontWeight: '800',
            marginTop: 4,
        },
        submitButton: {
            marginTop: 16,
            marginBottom: 8,
        },
        errorText: {
            color: c.danger,
            fontSize: 12,
            marginTop: 8,
            fontWeight: '500',
        },
    });
}
