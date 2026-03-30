import { StyleSheet } from 'react-native';

export default function createStyles(theme) {
    return StyleSheet.create({
        headerSpacing: {
            paddingBottom: 20,
        },
        scrollContent: {
            paddingHorizontal: 20,
            paddingBottom: 40,
        },
        menuContainer: {
            backgroundColor: theme.colors.surface,
            borderRadius: 16,
            paddingVertical: 10,
            borderWidth: 1,
            borderColor: theme.colors.border,
        },
        menuItem: {
            flexDirection: 'row',
            alignItems: 'center',
            paddingVertical: 16,
            paddingHorizontal: 20,
        },
        menuIconContainer: {
            width: 32,
            justifyContent: 'center',
            alignItems: 'flex-start',
        },
        menuItemText: {
            flex: 1,
            fontSize: 16,
            color: theme.colors.textSecondary,
            fontWeight: '500',
        },
    });
}
