import { StyleSheet } from 'react-native';

export default function createStyles(theme) {
    const c = theme.colors;

    return StyleSheet.create({
        saveButton: {
            padding: 5,
        },
        saveButtonDisabled: {
            opacity: 0.4,
        },
        saveButtonText: {
            fontSize: 16,
            fontWeight: '600',
            color: c.accent,
        },
        saveButtonTextDisabled: {
            color: c.iconMuted,
        },
        keyboardContainer: {
            flex: 1,
        },
        scrollContent: {
            paddingHorizontal: 16,
            paddingTop: 24,
            paddingBottom: 50,
        },
    });
}
