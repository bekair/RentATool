import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
    headerIconButton: {
        width: 34,
        height: 34,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#31313a',
        backgroundColor: '#16161b',
        alignItems: 'center',
        justifyContent: 'center',
    },
    scrollContent: {
        paddingHorizontal: 20,
        paddingBottom: 28,
        gap: 18,
    },
    heroCard: {
        borderRadius: 18,
        borderWidth: 1,
        borderColor: '#312e81',
        backgroundColor: '#18172b',
        padding: 16,
        gap: 8,
    },
    heroEyebrow: {
        color: '#c4b5fd',
        fontSize: 12,
        fontWeight: '700',
        textTransform: 'uppercase',
    },
    heroTitle: {
        color: '#fff',
        fontSize: 22,
        fontWeight: '700',
    },
    heroDescription: {
        color: '#a3a3b2',
        fontSize: 13,
        lineHeight: 19,
    },
    section: {
        gap: 10,
    },
    sectionTitle: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '700',
    },
    quickActionGrid: {
        gap: 10,
    },
    quickActionCard: {
        borderRadius: 14,
        borderWidth: 1,
        borderColor: '#2e2e36',
        backgroundColor: '#15151a',
        padding: 14,
        gap: 8,
    },
    quickActionIconWrap: {
        width: 32,
        height: 32,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#323243',
        backgroundColor: '#1b1b24',
        alignItems: 'center',
        justifyContent: 'center',
    },
    quickActionTitle: {
        color: '#f3f4f6',
        fontSize: 15,
        fontWeight: '600',
    },
    quickActionDescription: {
        color: '#9ca3af',
        fontSize: 12,
        lineHeight: 17,
    },
    faqList: {
        gap: 10,
    },
    faqItem: {
        borderRadius: 14,
        borderWidth: 1,
        borderColor: '#2e2e36',
        backgroundColor: '#141418',
        paddingHorizontal: 14,
        paddingVertical: 12,
        gap: 10,
    },
    faqHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 12,
    },
    faqQuestion: {
        flex: 1,
        color: '#f3f4f6',
        fontSize: 14,
        fontWeight: '600',
    },
    faqAnswer: {
        color: '#9ca3af',
        fontSize: 12,
        lineHeight: 18,
    },
    supportCard: {
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#2f2f37',
        backgroundColor: '#16161b',
        padding: 14,
    },
    supportTitle: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '700',
    },
    supportDescription: {
        marginTop: 6,
        color: '#9ca3af',
        fontSize: 13,
        lineHeight: 18,
    },
});

export default styles;
