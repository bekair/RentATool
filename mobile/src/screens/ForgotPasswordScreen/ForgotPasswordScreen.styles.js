import { StyleSheet } from 'react-native';

export default function createStyles(theme) {
    const c = theme.colors;

    return StyleSheet.create({
        container: {
            flex: 1,
            paddingHorizontal: 24,
            backgroundColor: c.bg,
        },
        header: {
            alignItems: 'center',
            marginTop: 80,
            marginBottom: 48,
        },
        successHeader: {
            marginTop: 120,
        },
        icon: {
            marginBottom: 16,
        },
        title: {
            fontSize: 32,
            fontWeight: '700',
            color: c.textPrimary,
            marginBottom: 8,
            textAlign: 'center',
        },
        subtitle: {
            fontSize: 16,
            color: c.iconMuted,
            textAlign: 'center',
            paddingHorizontal: 20,
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
            color: c.textPrimary,
            marginBottom: 8,
        },
        input: {
            backgroundColor: c.fieldEditingBg,
            borderRadius: 12,
            padding: 16,
            fontSize: 16,
            color: c.textPrimary,
            borderWidth: 1,
            borderColor: c.fieldEditingBorder,
        },
        error: {
            color: c.danger,
            fontSize: 14,
            marginBottom: 16,
            textAlign: 'center',
        },
        button: {
            backgroundColor: c.accent,
            borderRadius: 12,
            padding: 18,
            alignItems: 'center',
            marginTop: 8,
        },
        buttonDisabled: {
            opacity: 0.6,
        },
        buttonText: {
            color: c.accentContrast,
            fontSize: 16,
            fontWeight: '700',
        },
        linkButton: {
            marginTop: 24,
            alignItems: 'center',
        },
        linkText: {
            color: c.iconMuted,
            fontSize: 14,
        },
    });
}
