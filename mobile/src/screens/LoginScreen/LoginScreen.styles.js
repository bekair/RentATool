import { StyleSheet } from 'react-native';

export default function createStyles(theme) {
    return StyleSheet.create({
        container: {
            flex: 1,
            paddingHorizontal: 24,
            backgroundColor: theme.colors.bg,
        },
        header: {
            alignItems: 'center',
            marginTop: 80,
            marginBottom: 48,
        },
        headerIcon: {
            marginBottom: 16,
        },
        title: {
            fontSize: 32,
            fontWeight: '700',
            color: theme.colors.textPrimary,
            marginBottom: 8,
        },
        subtitle: {
            fontSize: 16,
            color: theme.colors.textMuted,
        },
        form: {
            flex: 1,
        },
        inputContainer: {
            marginBottom: 20,
        },
        label: {
            fontSize: 14,
            fontWeight: '600',
            color: theme.colors.textPrimary,
            marginBottom: 8,
        },
        input: {
            backgroundColor: theme.colors.fieldEditingBg,
            borderRadius: 12,
            padding: 16,
            fontSize: 16,
            color: theme.colors.fieldEditingText,
            borderWidth: 1,
            borderColor: theme.colors.borderStrong,
        },
        error: {
            color: theme.colors.danger,
            fontSize: 14,
            marginBottom: 16,
            textAlign: 'center',
        },
        forgotPasswordButton: {
            alignSelf: 'flex-end',
            marginBottom: 20,
        },
        forgotPasswordText: {
            color: theme.colors.accent,
            fontWeight: '600',
        },
        button: {
            backgroundColor: theme.colors.buttonPrimary,
            borderRadius: 12,
            padding: 18,
            alignItems: 'center',
            marginTop: 8,
        },
        buttonDisabled: {
            opacity: 0.6,
        },
        buttonText: {
            color: theme.colors.buttonPrimaryText,
            fontSize: 16,
            fontWeight: '700',
        },
        linkButton: {
            marginTop: 24,
            alignItems: 'center',
        },
        linkText: {
            color: theme.colors.textMuted,
            fontSize: 14,
        },
        linkBold: {
            color: theme.colors.accent,
            fontWeight: '600',
        },
    });
}
