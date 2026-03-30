import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#0a0a0a',
    },
    topLoader: {
        paddingVertical: 10,
        alignItems: 'center',
    },
    header: {
        paddingHorizontal: 20,
        paddingTop: 10,
        paddingBottom: 15,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#ffffff',
    },
    addButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#6366f1',
        justifyContent: 'center',
        alignItems: 'center',
    },
    addButtonText: {
        color: '#ffffff',
        fontSize: 24,
        fontWeight: 'bold',
    },
    list: {
        flex: 1,
    },
    listContainer: {
        padding: 15,
        paddingBottom: 100,
        flexGrow: 1,
    },
    card: {
        backgroundColor: '#1a1a1a',
        borderRadius: 12,
        padding: 15,
        marginBottom: 15,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#2a2a2a',
    },
    cardInfo: {
        flex: 1,
    },
    toolName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 4,
    },
    category: {
        fontSize: 12,
        color: '#6366f1',
        marginBottom: 4,
    },
    price: {
        fontSize: 14,
        color: '#aaa',
    },
    cardActions: {
        marginLeft: 10,
        flexDirection: 'row',
        gap: 8,
    },
    detailsButton: {
        paddingHorizontal: 15,
        paddingVertical: 8,
        borderRadius: 8,
        backgroundColor: 'rgba(148, 163, 184, 0.12)',
    },
    detailsButtonText: {
        color: '#cbd5e1',
        fontWeight: '600',
        fontSize: 12,
    },
    editButton: {
        paddingHorizontal: 15,
        paddingVertical: 8,
        borderRadius: 8,
        backgroundColor: 'rgba(99, 102, 241, 0.1)',
    },
    editButtonText: {
        color: '#6366f1',
        fontWeight: '600',
        fontSize: 12,
    },
    deleteButton: {
        paddingHorizontal: 15,
        paddingVertical: 8,
        borderRadius: 8,
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
    },
    deleteButtonText: {
        color: '#ef4444',
        fontWeight: '600',
        fontSize: 12,
    },
    emptyContainer: {
        marginTop: 60,
        alignItems: 'center',
        paddingHorizontal: 40,
        flex: 1,
    },
    emptyIconContainer: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: 'rgba(99, 102, 241, 0.1)',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 24,
    },
    emptyTitle: {
        color: '#fff',
        fontSize: 22,
        fontWeight: '800',
        marginBottom: 12,
        letterSpacing: -0.5,
    },
    emptyText: {
        color: '#888',
        fontSize: 15,
        textAlign: 'center',
        marginBottom: 35,
        lineHeight: 22,
    },
    swipeDownToRefreshContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        opacity: 0.8,
    },
    refreshIcon: {
        marginRight: 6,
    },
    swipeDownToRefreshText: {
        color: '#6366f1',
        fontWeight: '600',
        fontSize: 14,
        letterSpacing: 0.5,
    },
});

export default styles;
