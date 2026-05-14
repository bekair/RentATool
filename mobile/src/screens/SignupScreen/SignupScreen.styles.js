import { StyleSheet } from 'react-native';

export default function createStyles(theme) {
    const c = theme.colors;

    return StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: c.bg,
        },
        scrollContent: {
            paddingHorizontal: 24,
            paddingBottom: 40,
        },
        header: {
            alignItems: 'center',
            marginTop: 60,
            marginBottom: 32,
        },
        headerIcon: {
            marginBottom: 16,
            color: c.accent,
        },
        title: {
            fontSize: 28,
            fontWeight: '700',
            color: c.textPrimary,
            marginBottom: 8,
        },
        subtitle: {
            fontSize: 16,
            color: c.textMuted,
        },
        form: {
            flex: 1,
        },
        error: {
            color: c.danger,
            fontSize: 14,
            marginBottom: 16,
            textAlign: 'center',
        },
        button: {
            backgroundColor: c.buttonPrimary,
            borderRadius: 12,
            padding: 18,
            alignItems: 'center',
            marginTop: 8,
        },
        buttonDisabled: {
            opacity: 0.6,
        },
        buttonText: {
            color: c.buttonPrimaryText,
            fontSize: 16,
            fontWeight: '700',
        },
        linkButton: {
            marginTop: 24,
            alignItems: 'center',
        },
        linkText: {
            color: c.textMuted,
            fontSize: 14,
        },
        linkBold: {
            color: c.accent,
            fontWeight: '600',
        },
    });
}
