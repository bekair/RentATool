import { createThemedStyles } from '../../theme';

export const FIELD_HEIGHT = 56;

const createFieldStyles = createThemedStyles((theme) => ({
    group: {
        marginBottom: 22,
    },
    base: {
        height: FIELD_HEIGHT,
        borderRadius: 10,
        borderWidth: 1,
        paddingHorizontal: 16,
        fontSize: 16,
    },
    readOnly: {
        backgroundColor: theme.colors.fieldReadOnlyBg,
        borderColor: theme.colors.fieldReadOnlyBorder,
        color: theme.colors.fieldReadOnlyText,
    },
    editing: {
        backgroundColor: theme.colors.fieldEditingBg,
        borderWidth: 1,
        borderColor: theme.colors.fieldEditingBorder,
        color: theme.colors.fieldEditingText,
        shadowColor: theme.colors.inputShadow,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.4,
        shadowRadius: 10,
        elevation: 6,
    },
    error: {
        borderColor: theme.colors.danger,
        borderWidth: 1.5,
    },
    errorText: {
        color: theme.colors.danger,
        fontSize: 12,
        marginTop: 6,
        fontWeight: '500',
    },
}));

export function getFieldStyles(theme) {
    return createFieldStyles(theme);
}
