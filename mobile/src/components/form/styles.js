import { StyleSheet } from 'react-native';

export const FIELD_HEIGHT = 56;

export const fieldStyles = StyleSheet.create({
    group: {
        marginBottom: 22,
    },
    // Base box shared by all input types
    base: {
        height: FIELD_HEIGHT,
        borderRadius: 10,
        borderWidth: 1,
        paddingHorizontal: 16,
        fontSize: 16,
    },
    // Read-only / locked state
    readOnly: {
        backgroundColor: '#1c1c1e',
        borderColor: '#1e1e1e',
        color: '#888',
    },
    // Active editing state
    editing: {
        backgroundColor: 'rgba(255, 255, 255, 0.12)',
        borderWidth: 1,
        borderColor: 'rgba(99, 102, 241, 0.4)',
        color: '#fff',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.4,
        shadowRadius: 10,
        elevation: 6,
    },
});
