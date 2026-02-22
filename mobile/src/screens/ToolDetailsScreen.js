import React, { useState, useEffect } from 'react';
import {
    View, Text, StyleSheet, ScrollView, TouchableOpacity,
    ActivityIndicator, Alert, Dimensions, StatusBar, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
// expo-linear-gradient not installed — using plain View fade instead
import api from '../api/client';

const { width } = Dimensions.get('window');

// ── Design tokens ─────────────────────────────────────────────────────────────
const C = {
    bg: '#0F0F0F',
    surface: '#1A1A1A',
    surface2: '#242424',
    border: '#2A2A2A',
    text: '#FFFFFF',
    textSub: '#A0A0A0',
    accent: '#6366f1',                    // app-wide purple
    accentSoft: 'rgba(99,102,241,0.15)',
    violet: '#818cf8',                    // lighter purple — icon tints
    violetSoft: 'rgba(129,140,248,0.15)',
    gold: '#FFB400',
    teal: '#00BFA5',
};

const ToolDetailsScreen = ({ route, navigation }) => {
    const { toolId } = route.params;
    const [tool, setTool] = useState(null);
    const [loading, setLoading] = useState(true);
    const [bookingLoading, setBookingLoading] = useState(false);
    const [isFavorite, setIsFavorite] = useState(false);
    const [existingBooking, setExistingBooking] = useState(null);

    useEffect(() => {
        api.get(`/tools/${toolId}`)
            .then(r => setTool(r.data))
            .catch(() => {
                Alert.alert('Error', 'Failed to load tool details');
                navigation.goBack();
            })
            .finally(() => setLoading(false));

        // Check if the user already has an active booking for this tool
        api.get('/bookings/renter')
            .then(r => {
                const active = r.data.find(
                    b => b.toolId === toolId &&
                        b.status !== 'CANCELLED' &&
                        b.status !== 'REJECTED'
                );
                setExistingBooking(active || null);
            })
            .catch(() => { }); // not critical — ignore silently
    }, [toolId]);

    const handleRent = async () => {
        setBookingLoading(true);
        try {
            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);
            const nextDay = new Date(tomorrow);
            nextDay.setDate(nextDay.getDate() + 1);

            await api.post('/bookings', {
                toolId,
                startDate: tomorrow.toISOString(),
                endDate: nextDay.toISOString(),
                totalPrice: tool.pricePerDay,
            });
            Alert.alert(
                'Request Sent',
                'The owner has been notified. You can track this in your bookings.',
                [{ text: 'View Bookings', onPress: () => navigation.navigate('MainTabs', { screen: 'Bookings' }) }]
            );
        } catch (err) {
            Alert.alert('Error', err.response?.data?.message || 'Failed to send rental request');
        } finally {
            setBookingLoading(false);
        }
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={C.accent} />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" />

            {/* ── Floating header ──────────────────────────────────── */}
            <View style={styles.header}>
                <TouchableOpacity style={styles.iconBtn} onPress={() => navigation.goBack()}>
                    <Ionicons name="chevron-back" size={22} color={C.text} />
                </TouchableOpacity>
                <View style={styles.headerRight}>
                    <TouchableOpacity style={styles.iconBtn}>
                        <Ionicons name="share-outline" size={20} color={C.text} />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.iconBtn} onPress={() => setIsFavorite(f => !f)}>
                        <Ionicons
                            name={isFavorite ? 'heart' : 'heart-outline'}
                            size={20}
                            color={isFavorite ? C.accent : C.text}
                        />
                    </TouchableOpacity>
                </View>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

                {/* ── Hero image area ─────────────────────────────── */}
                <View style={styles.hero}>
                    <View style={styles.heroPlaceholder}>
                        <Ionicons name="construct" size={64} color="#333" />
                        <Text style={styles.heroPlaceholderText}>Professional Tool Imagery</Text>
                    </View>
                    <View style={styles.heroGradient} pointerEvents="none" />
                    <View style={styles.photoBadge}>
                        <Text style={styles.photoBadgeText}>1 / 5</Text>
                    </View>
                </View>

                {/* ── Main content ─────────────────────────────────── */}
                <View style={styles.content}>

                    {/* Title + Rating */}
                    <Text style={styles.toolName}>{tool.name}</Text>

                    <View style={styles.ratingRow}>
                        <Ionicons name="star" size={14} color={C.gold} />
                        <Text style={styles.ratingScore}> 4.91  ·  </Text>
                        <TouchableOpacity>
                            <Text style={styles.reviewsLink}>98 reviews</Text>
                        </TouchableOpacity>
                        <Text style={styles.locationText}>  ·  Brussels, Belgium</Text>
                    </View>

                    <Divider />

                    {/* Host */}
                    <View style={styles.hostRow}>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.hostTitle}>
                                Tool hosted by {tool.owner?.displayName}
                            </Text>
                            <Text style={styles.hostSub}>Joined in 2023</Text>
                        </View>
                        <View style={styles.avatar}>
                            <Text style={styles.avatarText}>
                                {tool.owner?.displayName?.[0] ?? '?'}
                            </Text>
                            <View style={styles.verifiedBadge}>
                                <Ionicons name="checkmark" size={9} color="#fff" />
                            </View>
                        </View>
                    </View>

                    <Divider />

                    {/* Highlights */}
                    <Highlight
                        icon="shield-checkmark-outline"
                        title="Fully Insured"
                        sub="Covered against damage and theft for peace of mind."
                    />
                    <Highlight
                        icon="location-outline"
                        title="Great location"
                        sub="95% of recent renters gave the location a 5-star rating."
                    />
                    <Highlight
                        icon="time-outline"
                        title="Flexible pickup"
                        sub="Arrange pickup/delivery directly with the owner."
                    />

                    <Divider />

                    {/* Description */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>About this tool</Text>
                        <Text style={styles.description}>{tool.description}</Text>
                        <TouchableOpacity style={styles.showMore}>
                            <Text style={styles.showMoreText}>Show more </Text>
                            <Ionicons name="chevron-forward" size={13} color={C.text} />
                        </TouchableOpacity>
                    </View>

                    <Divider />

                    {/* Specs */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Specifications</Text>
                        <SpecRow label="Category" value={tool.category?.name} />
                        <SpecRow label="Condition" value={tool.condition || 'Excellent'} />
                        <SpecRow label="Replacement value" value={`€${tool.replacementValue ?? 'N/A'}`} />
                    </View>

                    <Divider />

                    {/* Availability calendar placeholder */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Availability</Text>
                        <View style={styles.calendarPlaceholder}>
                            <Ionicons name="calendar-outline" size={32} color={C.textSub} />
                            <Text style={styles.calendarText}>
                                Add your dates to check availability
                            </Text>
                        </View>
                    </View>

                </View>
            </ScrollView>

            {/* ── Sticky footer ────────────────────────────────────── */}
            <View style={styles.footer}>
                <SafeAreaView edges={['bottom']}>
                    <View style={styles.footerContent}>
                        <View>
                            <Text style={styles.footerPrice}>
                                €{tool.pricePerDay}
                                <Text style={styles.footerDay}> / day</Text>
                            </Text>
                            <TouchableOpacity>
                                <Text style={styles.availLink}>Check availability</Text>
                            </TouchableOpacity>
                        </View>
                        <TouchableOpacity
                            style={[
                                styles.reserveBtn,
                                (bookingLoading || existingBooking) && styles.reserveBtnDisabled,
                            ]}
                            onPress={handleRent}
                            disabled={bookingLoading || !!existingBooking}
                        >
                            {bookingLoading ? (
                                <ActivityIndicator color="#fff" />
                            ) : existingBooking ? (
                                <View style={{ alignItems: 'center' }}>
                                    <Ionicons name="checkmark-circle" size={16} color="#fff" />
                                    <Text style={[styles.reserveBtnText, { fontSize: 12, marginTop: 2 }]}>
                                        {existingBooking.status === 'APPROVED' ? 'Approved' : 'Requested'}
                                    </Text>
                                </View>
                            ) : (
                                <Text style={styles.reserveBtnText}>Reserve</Text>
                            )}
                        </TouchableOpacity>
                    </View>
                </SafeAreaView>
            </View>
        </View>
    );
};

// ── Small helper components ───────────────────────────────────────────────────

const Divider = () => <View style={styles.divider} />;

const Highlight = ({ icon, title, sub }) => (
    <View style={styles.highlightRow}>
        <View style={styles.highlightIcon}>
            <Ionicons name={icon} size={22} color={C.violet} />
        </View>
        <View style={{ flex: 1, marginLeft: 16 }}>
            <Text style={styles.highlightTitle}>{title}</Text>
            <Text style={styles.highlightSub}>{sub}</Text>
        </View>
    </View>
);

const SpecRow = ({ label, value }) => (
    <View style={styles.specRow}>
        <Text style={styles.specLabel}>{label}</Text>
        <Text style={styles.specValue}>{value}</Text>
    </View>
);

// ── Styles ────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: C.bg },
    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: C.bg },

    // Header
    header: {
        position: 'absolute',
        top: Platform.OS === 'ios' ? 52 : 30,
        left: 0, right: 0,
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        zIndex: 100,
    },
    headerRight: { flexDirection: 'row', gap: 12 },
    iconBtn: {
        width: 38, height: 38, borderRadius: 19,
        backgroundColor: 'rgba(0,0,0,0.55)',
        justifyContent: 'center', alignItems: 'center',
        borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)',
    },

    // Hero
    hero: { width, height: 320, backgroundColor: C.surface2, position: 'relative' },
    heroPlaceholder: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    heroPlaceholderText: { marginTop: 12, color: C.textSub, fontSize: 13 },
    heroGradient: { position: 'absolute', bottom: 0, left: 0, right: 0, height: 80, backgroundColor: 'rgba(15,15,15,0.6)' },
    photoBadge: {
        position: 'absolute', bottom: 16, right: 16,
        backgroundColor: 'rgba(0,0,0,0.65)',
        paddingHorizontal: 12, paddingVertical: 4, borderRadius: 6,
    },
    photoBadgeText: { color: '#fff', fontSize: 12, fontWeight: '600' },

    // Content
    scrollContent: { paddingBottom: 130 },
    content: { padding: 24 },

    toolName: { fontSize: 26, fontWeight: '700', color: C.text, marginBottom: 10, lineHeight: 32 },

    ratingRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
    ratingScore: { fontSize: 14, fontWeight: '600', color: C.text },
    reviewsLink: { fontSize: 14, fontWeight: '600', color: C.text, textDecorationLine: 'underline' },
    locationText: { fontSize: 14, color: C.textSub },

    divider: { height: 1, backgroundColor: C.border, marginVertical: 24 },

    // Host
    hostRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    hostTitle: { fontSize: 18, fontWeight: '600', color: C.text, marginBottom: 4 },
    hostSub: { fontSize: 14, color: C.textSub },
    avatar: {
        width: 54, height: 54, borderRadius: 27,
        backgroundColor: '#2A2A2A', justifyContent: 'center', alignItems: 'center',
        borderWidth: 2, borderColor: C.border,
    },
    avatarText: { color: C.text, fontSize: 20, fontWeight: '700' },
    verifiedBadge: {
        position: 'absolute', bottom: 0, right: 0,
        backgroundColor: C.teal, width: 18, height: 18, borderRadius: 9,
        borderWidth: 2, borderColor: C.bg, justifyContent: 'center', alignItems: 'center',
    },

    // Highlights
    highlightRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 20 },
    highlightIcon: {
        width: 44, height: 44, borderRadius: 22,
        backgroundColor: C.violetSoft,
        justifyContent: 'center', alignItems: 'center',
    },
    highlightTitle: { fontSize: 15, fontWeight: '600', color: C.text, marginBottom: 3 },
    highlightSub: { fontSize: 13, color: C.textSub, lineHeight: 18 },

    // Section
    section: { marginBottom: 8 },
    sectionTitle: { fontSize: 20, fontWeight: '700', color: C.text, marginBottom: 16 },
    description: { fontSize: 15, color: C.textSub, lineHeight: 22 },
    showMore: { flexDirection: 'row', alignItems: 'center', marginTop: 14 },
    showMoreText: { fontSize: 15, fontWeight: '600', color: C.text, textDecorationLine: 'underline' },

    // Specs
    specRow: {
        flexDirection: 'row', justifyContent: 'space-between',
        paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: C.border,
    },
    specLabel: { fontSize: 15, color: C.textSub },
    specValue: { fontSize: 15, color: C.text, fontWeight: '500' },

    // Calendar placeholder
    calendarPlaceholder: {
        height: 100, backgroundColor: C.surface,
        borderRadius: 16, borderWidth: 1, borderColor: C.border,
        justifyContent: 'center', alignItems: 'center', gap: 8,
    },
    calendarText: { fontSize: 13, color: C.textSub },

    // Footer
    footer: {
        position: 'absolute', bottom: 0, left: 0, right: 0,
        backgroundColor: C.surface,
        borderTopWidth: 1, borderTopColor: C.border,
    },
    footerContent: {
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
        paddingHorizontal: 24, paddingTop: 16, paddingBottom: 8,
    },
    footerPrice: { fontSize: 20, fontWeight: '700', color: C.text },
    footerDay: { fontSize: 15, fontWeight: '400', color: C.textSub },
    availLink: { fontSize: 13, color: C.accent, fontWeight: '600', marginTop: 3, textDecorationLine: 'underline' },
    reserveBtn: {
        backgroundColor: C.accent,
        paddingHorizontal: 28, paddingVertical: 15,
        borderRadius: 12, minWidth: 130, alignItems: 'center',
        shadowColor: C.accent, shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.45, shadowRadius: 14, elevation: 8,
    },
    reserveBtnDisabled: {
        backgroundColor: C.surface2,
        shadowOpacity: 0,
        elevation: 0,
    },
    reserveBtnText: { color: '#fff', fontSize: 16, fontWeight: '700', letterSpacing: 0.3 },
});

export default ToolDetailsScreen;
