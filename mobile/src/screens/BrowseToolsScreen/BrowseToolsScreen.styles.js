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
            paddingTop: 15,
            paddingBottom: 20,
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            backgroundColor: c.bg,
        },
        title: {
            fontSize: 28,
            fontWeight: 'bold',
            color: c.textPrimary,
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
            borderRadius: 20,
            marginBottom: 20,
            overflow: 'hidden',
            borderWidth: 1,
            borderColor: c.border,
            elevation: 8,
            shadowColor: c.inputShadow,
            shadowOffset: { width: 0, height: 10 },
            shadowOpacity: 0.4,
            shadowRadius: 15,
        },
        imagePlaceholder: {
            height: 200,
            backgroundColor: c.surfaceAlt,
            justifyContent: 'center',
            alignItems: 'center',
        },
        imagePlaceholderText: {
            color: c.iconSubtle,
            fontSize: 16,
            fontWeight: '600',
        },
        cardContent: {
            padding: 18,
        },
        cardHeader: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            marginBottom: 6,
        },
        toolName: {
            fontSize: 20,
            fontWeight: 'bold',
            color: c.textPrimary,
            flex: 1,
            marginRight: 10,
        },
        price: {
            fontSize: 20,
            fontWeight: '800',
            color: c.accent,
        },
        perDay: {
            fontSize: 12,
            color: c.iconSubtle,
            fontWeight: 'normal',
        },
        category: {
            fontSize: 13,
            color: c.accent,
            marginBottom: 10,
            fontWeight: '700',
            textTransform: 'uppercase',
            letterSpacing: 1,
        },
        description: {
            fontSize: 14,
            color: c.textMuted,
            marginBottom: 16,
            lineHeight: 22,
        },
        cardFooter: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderTopWidth: 1,
            borderTopColor: c.rowDivider,
            paddingTop: 15,
        },
        ownerText: {
            fontSize: 12,
            color: c.iconSubtle,
            fontWeight: '500',
        },
        verifiedBadge: {
            backgroundColor: c.accentSurface,
            paddingHorizontal: 10,
            paddingVertical: 4,
            borderRadius: 6,
            borderWidth: 1,
            borderColor: c.success,
        },
        verifiedText: {
            color: c.success,
            fontSize: 11,
            fontWeight: '700',
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
            backgroundColor: c.accentSurface,
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
            color: c.textMuted,
            fontSize: 15,
            textAlign: 'center',
            marginBottom: 35,
            lineHeight: 22,
        },
        swipeDownToRefreshContainer: {
            flexDirection: 'row',
            alignItems: 'center',
            marginTop: 10,
            opacity: 0.8,
        },
        swipeDownToRefreshIcon: {
            marginRight: 6,
        },
        swipeDownToRefreshText: {
            color: c.accent,
            fontWeight: '600',
            fontSize: 14,
            letterSpacing: 0.5,
        },
    });
}
