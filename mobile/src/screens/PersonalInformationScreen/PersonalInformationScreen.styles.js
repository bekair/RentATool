import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
    headerSpacing: {
        paddingBottom: 20,
    },
    scrollContent: {
        paddingHorizontal: 20,
        paddingBottom: 40,
    },
    menuContainer: {
        backgroundColor: '#161616',
        borderRadius: 16,
        paddingVertical: 10,
        marginBottom: 30,
        borderWidth: 1,
        borderColor: '#262626',
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
        color: '#eee',
        fontWeight: '500',
    },
    deleteAccountContainer: {
        marginTop: 10,
        backgroundColor: '#161616',
        borderRadius: 16,
        paddingVertical: 4,
        marginBottom: 30,
        borderWidth: 1,
        borderColor: '#ef4444',
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
        color: '#ef4444',
        fontWeight: '600',
    },
});

export default styles;
