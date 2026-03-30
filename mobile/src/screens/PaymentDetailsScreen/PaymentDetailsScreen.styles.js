import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
    topLoader: {
        paddingVertical: 10,
        alignItems: 'center',
    },
    loadingWrap: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    scrollContent: {
        paddingHorizontal: 20,
        paddingBottom: 24,
        gap: 24,
    },
    sectionWrap: {
        gap: 10,
    },
    sectionWrapSpaced: {
        marginTop: 6,
    },
    sectionTitle: {
        fontSize: 16,
        color: '#fff',
        fontWeight: '700',
    },
    sectionDescription: {
        color: '#9ca3af',
        fontSize: 13,
    },
    listCard: {
        backgroundColor: '#161616',
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#262626',
        padding: 14,
        gap: 12,
    },
    listRow: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#303036',
        borderRadius: 14,
        backgroundColor: '#121217',
        minHeight: 72,
        paddingHorizontal: 12,
        paddingVertical: 12,
        gap: 12,
    },
    listRowSelected: {
        borderColor: '#6366f1',
        backgroundColor: '#171729',
    },
    cardBrandSlot: {
        width: 56,
        alignItems: 'flex-start',
        justifyContent: 'center',
    },
    rowIconWrap: {
        width: 34,
        height: 34,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#31313a',
        backgroundColor: '#18181e',
        alignItems: 'center',
        justifyContent: 'center',
    },
    rowTextWrap: {
        flex: 1,
    },
    rowRight: {
        alignItems: 'flex-end',
        justifyContent: 'center',
        gap: 6,
    },
    rowTitle: {
        color: '#f3f4f6',
        fontSize: 15,
        fontWeight: '600',
    },
    rowSubtitle: {
        color: '#9ca3af',
        fontSize: 12,
        marginTop: 3,
    },
    defaultBadge: {
        height: 24,
        borderRadius: 999,
        paddingHorizontal: 10,
        backgroundColor: '#312e81',
        borderWidth: 1,
        borderColor: '#6366f1',
        alignItems: 'center',
        justifyContent: 'center',
    },
    defaultBadgeText: {
        color: '#c7d2fe',
        fontSize: 11,
        fontWeight: '700',
    },
    statusDot: {
        width: 10,
        height: 10,
        borderRadius: 5,
    },
    loadMoreButton: {
        marginTop: 0,
        backgroundColor: '#1f2937',
        borderWidth: 1,
        borderColor: '#374151',
    },
    loadMoreButtonText: {
        color: '#d1d5db',
    },
    addCardButton: {
        marginTop: 0,
    },
    primaryActionButton: {
        marginTop: 0,
    },
});

export default styles;
