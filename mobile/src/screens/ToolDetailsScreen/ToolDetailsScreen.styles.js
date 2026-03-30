import { Dimensions, Platform, StyleSheet } from 'react-native';

const { width } = Dimensions.get('window');

export const COLORS = {
    bg: '#0F0F0F',
    surface: '#1A1A1A',
    surface2: '#242424',
    border: '#2A2A2A',
    text: '#FFFFFF',
    textSub: '#A0A0A0',
    accent: '#6366f1',
    accentSoft: 'rgba(99,102,241,0.15)',
    violet: '#818cf8',
    violetSoft: 'rgba(129,140,248,0.15)',
    gold: '#FFB400',
    teal: '#00BFA5',
};

export const styles = StyleSheet.create({
    container: {
        flex: 1, backgroundColor: COLORS.bg,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: COLORS.bg,
    },
    errorText: { color: COLORS.textSub, fontSize: 15 },

    header: {
        position: 'absolute',
        top: Platform.OS === 'ios' ? 52 : 30,
        left: 0,
        right: 0,
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        zIndex: 100,
    },
    headerRight: { flexDirection: 'row', gap: 12 },
    iconBtn: {
        width: 38,
        height: 38,
        borderRadius: 19,
        backgroundColor: 'rgba(0,0,0,0.55)',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.08)',
    },

    hero: {
        width,
        height: 320,
        backgroundColor: COLORS.surface2,
        position: 'relative',
    },
    heroPlaceholder: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    heroPlaceholderText: { marginTop: 12, color: COLORS.textSub, fontSize: 13 },
    heroGradient: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: 80,
        backgroundColor: 'rgba(15,15,15,0.6)',
    },
    photoBadge: {
        position: 'absolute',
        bottom: 16,
        right: 16,
        backgroundColor: 'rgba(0,0,0,0.65)',
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 6,
    },
    photoBadgeText: { color: '#fff', fontSize: 12, fontWeight: '600' },

    scrollContent: { paddingBottom: 130 },
    content: { padding: 24 },

    toolName: {
        fontSize: 26,
        fontWeight: '700',
        color: COLORS.text,
        marginBottom: 10,
        lineHeight: 32,
    },

    ratingRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
    ratingScore: { fontSize: 14, fontWeight: '600', color: COLORS.text },
    reviewsLink: {
        fontSize: 14,
        fontWeight: '600',
        color: COLORS.text,
        textDecorationLine: 'underline',
    },
    locationText: { fontSize: 14, color: COLORS.textSub },

    section: { marginBottom: 0 },
    sectionCard: {
        backgroundColor: COLORS.surface,
        borderWidth: 1,
        borderColor: COLORS.border,
        borderRadius: 16,
        padding: 16,
        marginTop: 16,
    },

    hostRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    hostTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: COLORS.text,
        marginBottom: 4,
    },
    hostTextWrap: {
        flex: 1,
    },
    hostSub: { fontSize: 14, color: COLORS.textSub },
    avatar: {
        width: 54,
        height: 54,
        borderRadius: 27,
        backgroundColor: '#2A2A2A',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: COLORS.border,
    },
    avatarText: { color: COLORS.text, fontSize: 20, fontWeight: '700' },
    verifiedBadge: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        backgroundColor: COLORS.teal,
        width: 18,
        height: 18,
        borderRadius: 9,
        borderWidth: 2,
        borderColor: COLORS.bg,
        justifyContent: 'center',
        alignItems: 'center',
    },

    highlightRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 20,
    },
    highlightRowLast: {
        marginBottom: 0,
    },
    highlightIcon: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: COLORS.violetSoft,
        justifyContent: 'center',
        alignItems: 'center',
    },
    highlightTitle: {
        fontSize: 15,
        fontWeight: '600',
        color: COLORS.text,
        marginBottom: 3,
    },
    highlightContent: {
        flex: 1,
        marginLeft: 16,
    },
    highlightSub: { fontSize: 13, color: COLORS.textSub, lineHeight: 18 },

    sectionTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: COLORS.text,
        marginBottom: 12,
    },
    description: { fontSize: 15, color: COLORS.textSub, lineHeight: 22 },

    specRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 14,
    },
    specLabel: { fontSize: 15, color: COLORS.textSub },
    specValue: { fontSize: 15, color: COLORS.text, fontWeight: '500' },

    locationCard: {
        backgroundColor: 'rgba(255,255,255,0.02)',
        borderWidth: 1,
        borderColor: COLORS.border,
        borderRadius: 12,
        padding: 12,
        flexDirection: 'row',
        alignItems: 'flex-start',
    },
    locationIcon: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: COLORS.accentSoft,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    locationInfo: {
        flex: 1,
    },
    locationPrimary: {
        color: COLORS.text,
        fontSize: 15,
        fontWeight: '700',
    },
    locationSecondary: {
        marginTop: 3,
        color: COLORS.textSub,
        fontSize: 13,
    },
    locationCoordinates: {
        marginTop: 6,
        color: COLORS.accent,
        fontSize: 12,
        fontWeight: '600',
    },

    footer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: COLORS.surface,
    },
    footerContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 24,
        paddingTop: 16,
        paddingBottom: 8,
    },
    footerPriceWrap: {
        flex: 1,
        paddingRight: 12,
    },
    footerPrice: { fontSize: 20, fontWeight: '700', color: COLORS.text },
    footerDay: { fontSize: 15, fontWeight: '400', color: COLORS.textSub },
    reserveBtn: {
        backgroundColor: COLORS.accent,
        paddingHorizontal: 24,
        paddingVertical: 15,
        borderRadius: 12,
        minWidth: 140,
        alignItems: 'center',
        shadowColor: COLORS.accent,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.45,
        shadowRadius: 14,
        elevation: 8,
    },
    reserveBtnText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '700',
        letterSpacing: 0.3,
    },
});
