import { StyleSheet } from 'react-native';

export default function createStyles(theme) {
    const c = theme.colors;

    return StyleSheet.create({
        centerContainer: {
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: c.bg,
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
            color: c.textPrimary,
        },
        addButton: {
            width: 40,
            height: 40,
            borderRadius: 20,
            backgroundColor: c.accent,
            justifyContent: 'center',
            alignItems: 'center',
        },
        addButtonIcon: {
            color: c.accentContrast,
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
            backgroundColor: c.surfaceMuted,
            borderRadius: 12,
            padding: 15,
            marginBottom: 15,
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderWidth: 1,
            borderColor: c.border,
        },
        cardInfo: {
            flex: 1,
        },
        toolName: {
            fontSize: 16,
            fontWeight: 'bold',
            color: c.textPrimary,
            marginBottom: 4,
        },
        category: {
            fontSize: 12,
            color: c.accent,
            marginBottom: 4,
        },
        price: {
            fontSize: 14,
            color: c.iconMuted,
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
            backgroundColor: `${c.selectedCheckInactive}33`,
        },
        detailsButtonText: {
            color: c.textSecondary,
            fontWeight: '600',
            fontSize: 12,
        },
        editButton: {
            paddingHorizontal: 15,
            paddingVertical: 8,
            borderRadius: 8,
            backgroundColor: `${c.accent}1A`,
        },
        editButtonText: {
            color: c.accent,
            fontWeight: '600',
            fontSize: 12,
        },
        deleteButton: {
            paddingHorizontal: 15,
            paddingVertical: 8,
            borderRadius: 8,
            backgroundColor: `${c.danger}1A`,
        },
        deleteButtonText: {
            color: c.danger,
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
            backgroundColor: `${c.accent}1A`,
            justifyContent: 'center',
            alignItems: 'center',
            marginBottom: 24,
        },
        emptyTitle: {
            color: c.textPrimary,
            fontSize: 22,
            fontWeight: '800',
            marginBottom: 12,
            letterSpacing: -0.5,
        },
        emptyText: {
            color: c.iconMuted,
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
            color: c.accent,
        },
        swipeDownToRefreshText: {
            color: c.accent,
            fontWeight: '600',
            fontSize: 14,
            letterSpacing: 0.5,
        },
    });
}
