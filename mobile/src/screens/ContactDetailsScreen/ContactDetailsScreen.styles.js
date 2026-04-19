import { StyleSheet } from 'react-native';

export default function createStyles(theme) {
    const c = theme.colors;

    return StyleSheet.create({
        saveButton: { padding: 5 },
        saveButtonText: { fontSize: 16, fontWeight: '600', color: c.accent },
        keyboardContainer: {
            flex: 1,
        },
        scrollContent: {
            paddingHorizontal: 16,
            paddingTop: 24,
            paddingBottom: 50,
        },
        helpText: {
            fontSize: 13,
            color: c.iconSubtle,
            marginTop: 8,
            paddingHorizontal: 5,
            lineHeight: 18,
        },
    });
}
