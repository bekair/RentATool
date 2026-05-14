import { StyleSheet } from 'react-native';
import { darkTheme, lightTheme } from '../../theme';

const createStyles = (theme) => StyleSheet.create({
    loadingWrap: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    scrollContent: {
        paddingHorizontal: 20,
        paddingBottom: 24,
        gap: 18,
    },
    section: {
        gap: 10,
    },
    sectionTitle: {
        color: theme.colors.textPrimary,
        fontSize: 16,
        fontWeight: '700',
    },
    card: {
        backgroundColor: theme.colors.surface,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: theme.colors.border,
        paddingVertical: 4,
    },
    pushGroupHeader: {
        minHeight: 62,
        paddingHorizontal: 14,
        paddingTop: 12,
        paddingBottom: 8,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    pushHeaderToggle: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    pushHeaderRight: {
        minWidth: 52,
        alignItems: 'flex-end',
        justifyContent: 'center',
    },
    pushSubList: {
        paddingLeft: 8,
        paddingRight: 8,
        paddingBottom: 8,
        gap: 8,
    },
    row: {
        minHeight: 72,
        paddingHorizontal: 14,
        paddingVertical: 12,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    subRow: {
        minHeight: 68,
        paddingLeft: 12,
        paddingRight: 10,
        paddingVertical: 10,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        backgroundColor: theme.colors.surfaceAlt,
        borderWidth: 1,
        borderColor: theme.colors.borderStrong,
        borderRadius: 12,
        marginLeft: 26,
        marginRight: 4,
        borderLeftWidth: 2,
        borderLeftColor: theme.colors.accent,
    },
    subRowDisabled: {
        opacity: 0.55,
    },
    rowTextWrap: {
        flex: 1,
    },
    rowTitle: {
        color: theme.colors.textPrimary,
        fontSize: 15,
        fontWeight: '600',
    },
    rowSubtitle: {
        color: theme.colors.textMuted,
        fontSize: 12,
        marginTop: 3,
    },
    switchSlot: {
        width: 52,
        alignItems: 'flex-end',
        justifyContent: 'center',
    },
    themeBlock: {
        paddingHorizontal: 14,
        paddingTop: 10,
        paddingBottom: 12,
    },
    themeGrid: {
        marginTop: 10,
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 10,
    },
    themeCard: {
        flex: 1,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: theme.colors.borderStrong,
        borderRadius: 12,
        backgroundColor: theme.colors.surfaceAlt,
        paddingVertical: 8,
    },
    themeCardSelected: {
        borderColor: theme.colors.accent,
        shadowColor: theme.colors.accent,
        shadowOpacity: 0.35,
        shadowRadius: 6,
        shadowOffset: { width: 0, height: 0 },
        elevation: 2,
    },
    themeCardLabel: {
        color: theme.colors.textMuted,
        fontSize: 13,
        fontWeight: '600',
        marginTop: 7,
    },
    themeCardLabelSelected: {
        color: theme.colors.textPrimary,
    },
    themePreview: {
        width: 46,
        height: 74,
        borderRadius: 8,
        borderWidth: 1,
        overflow: 'hidden',
        paddingHorizontal: 6,
        paddingTop: 7,
        paddingBottom: 6,
        justifyContent: 'space-between',
    },
    themePreviewFrame: {
        width: 46,
        height: 74,
        borderRadius: 8,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: theme.colors.borderStrong,
    },
    themePreviewFrameSystem: {
        borderColor: theme.colors.textMuted,
    },
    themePreviewFrameSystemSelected: {
        borderColor: theme.colors.border,
    },
    themePreviewLight: {
        backgroundColor: lightTheme.colors.surfaceMuted,
        borderColor: lightTheme.colors.borderStrong,
    },
    themePreviewDark: {
        backgroundColor: darkTheme.colors.surfaceAlt,
        borderColor: darkTheme.colors.borderStrong,
    },
    themePreviewSystem: {
        backgroundColor: darkTheme.colors.bg,
        borderColor: darkTheme.colors.borderStrong,
    },
    themePreviewSystemNoPadding: {
        paddingHorizontal: 0,
        paddingTop: 0,
        paddingBottom: 0,
        justifyContent: 'flex-start',
    },
    themePreviewSystemSplit: {
        flex: 1,
        flexDirection: 'row',
        width: '100%',
        height: '100%',
        borderRadius: 7,
        overflow: 'hidden',
    },
    themePreviewSystemPane: {
        flex: 1,
        paddingHorizontal: 3,
        paddingVertical: 5,
        justifyContent: 'space-between',
    },
    themePreviewSystemPaneLight: {
        backgroundColor: lightTheme.colors.surfaceMuted,
    },
    themePreviewSystemPaneDark: {
        backgroundColor: darkTheme.colors.surfaceAlt,
    },
    themePreviewSystemPaneTop: {
        height: 7,
        borderRadius: 3,
        width: '85%',
    },
    themePreviewSystemPaneDots: {
        flexDirection: 'row',
        gap: 2,
    },
    themePreviewSystemPaneAccentLight: {
        height: 6,
        borderRadius: 3,
        backgroundColor: lightTheme.colors.fieldEditingBorder,
    },
    themePreviewSystemPaneAccentDark: {
        height: 6,
        borderRadius: 3,
        backgroundColor: darkTheme.colors.accent,
    },
    themePreviewTop: {
        height: 8,
        borderRadius: 3,
        width: '74%',
    },
    themePreviewTopLight: {
        backgroundColor: lightTheme.colors.borderStrong,
    },
    themePreviewTopDark: {
        backgroundColor: darkTheme.colors.borderStrong,
    },
    themePreviewDots: {
        flexDirection: 'row',
        gap: 3,
    },
    themePreviewDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
    },
    themePreviewDotLight: {
        backgroundColor: lightTheme.colors.borderStrong,
    },
    themePreviewDotDark: {
        backgroundColor: darkTheme.colors.borderStrong,
    },
    themePreviewAccent: {
        height: 6,
        borderRadius: 3,
        backgroundColor: darkTheme.colors.accent,
    },
});

export default createStyles;
