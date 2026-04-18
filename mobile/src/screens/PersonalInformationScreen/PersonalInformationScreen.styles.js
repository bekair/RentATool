import { StyleSheet } from 'react-native';

export default function createStyles(theme) {
    const c = theme.colors;
    return StyleSheet.create({
        headerSpacing: {
            paddingBottom: 20,
        },
        scrollContent: {
            paddingHorizontal: 20,
            paddingBottom: 40,
        },
        menuContainer: {
            backgroundColor: c.surface,
            borderRadius: 16,
            paddingVertical: 10,
            marginBottom: 30,
            borderWidth: 1,
            borderColor: c.border,
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
            color: c.textPrimary,
            fontWeight: '500',
        },
        deleteAccountContainer: {
            marginTop: 10,
            backgroundColor: c.surface,
            borderRadius: 16,
            paddingVertical: 4,
            marginBottom: 30,
            borderWidth: 1,
            borderColor: c.danger,
        },
        deleteAccountItem: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            paddingVertical: 16,
            paddingHorizontal: 20,
        },
        deleteAccountText: {
            fontSize: 16,
            color: c.danger,
            fontWeight: '600',
        },
    });
}
