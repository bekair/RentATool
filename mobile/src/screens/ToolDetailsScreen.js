import React, { useState, useEffect } from 'react';
import {
    View, Text, StyleSheet, ScrollView, TouchableOpacity,
    ActivityIndicator, Alert, Dimensions, StatusBar, Platform, DeviceEventEmitter
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
// expo-linear-gradient not installed — using plain View fade instead
import api from '../api/client';
import { useAuth } from '../context/AuthContext';

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
    const { user } = useAuth();
    const [tool, setTool] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isFavorite, setIsFavorite] = useState(false);
    const [selectedStartDate, setSelectedStartDate] = useState(null);
    const [selectedEndDate, setSelectedEndDate] = useState(null);
    const [isReserving, setIsReserving] = useState(false);

    const isOwner = user?.id && tool?.ownerId === user.id;
    const hasSelection = !!selectedStartDate;

    useEffect(() => {
        if (!toolId) return;

        // Only show loading if we haven't loaded the tool yet
        if (!tool) setLoading(true);

        api.get(`/tools/${toolId}`)
            .then(r => setTool(r.data))
            .catch(() => {
                Alert.alert('Error', 'Failed to load tool details');
                if (navigation.canGoBack()) navigation.goBack();
            })
            .finally(() => setLoading(false));
    }, [toolId]);

    const openDatePicker = () => {
        if (isOwner) {
            navigation.navigate('ToolCalendar', { toolItem: tool });
        } else {
            navigation.navigate('BookingDates', {
                toolItem: tool,
                initialStartDate: selectedStartDate,
                initialEndDate: selectedEndDate,
            });
        }
    };

    useEffect(() => {
        if (!toolId) return;
        const sub = DeviceEventEmitter.addListener(`confirmDates_${toolId}`, ({ start, end }) => {
            setSelectedStartDate(start);
            setSelectedEndDate(end);
        });
        return () => sub.remove();
    }, [toolId]);

    const handleReserve = async () => {
        if (!selectedStartDate || isReserving) return;
        const effectiveEnd = selectedEndDate || selectedStartDate;

        setIsReserving(true);
        try {
            await api.post('/bookings', {
                toolId: tool.id,
                startDate: new Date(`${selectedStartDate}T00:00:00Z`).toISOString(),
                endDate: new Date(`${effectiveEnd}T23:59:59Z`).toISOString(),
                totalPrice,
            });

            Alert.alert(
                'Request Sent! 🎉',
                'The owner has been notified. You can track this in your bookings.',
                [{ text: 'View Bookings', onPress: () => navigation.navigate('MainTabs', { screen: 'Bookings' }) }]
            );
            setSelectedStartDate(null);
            setSelectedEndDate(null);
        } catch (err) {
            Alert.alert('Error', err.response?.data?.message || 'Failed to send rental request');
        } finally {
            setIsReserving(false);
        }
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return '';
        const d = new Date(dateStr);
        return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
    };

    const dateLabel = selectedStartDate
        ? selectedEndDate && selectedEndDate !== selectedStartDate
            ? `${formatDate(selectedStartDate)} – ${formatDate(selectedEndDate)}`
            : formatDate(selectedStartDate)
        : null;

    let totalDays = 0;
    let totalPrice = 0;
    if (hasSelection && tool) {
        const startObj = new Date(selectedStartDate);
        const effectiveEnd = selectedEndDate || selectedStartDate;
        const endObj = new Date(effectiveEnd);
        totalDays = Math.ceil(Math.abs(endObj - startObj) / (1000 * 60 * 60 * 24)) + 1;
        totalPrice = tool.pricePerDay * totalDays;
    }



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

                    {/* Availability / Date selection */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Availability</Text>
                        {isOwner ? (
                            <TouchableOpacity
                                style={styles.calendarPlaceholder}
                                onPress={openDatePicker}
                            >
                                <Ionicons name="calendar-outline" size={28} color={C.accent} />
                                <Text style={[styles.calendarText, { color: C.accent, fontWeight: '600' }]}>
                                    Manage availability calendar
                                </Text>
                            </TouchableOpacity>
                        ) : (
                            <TouchableOpacity
                                style={[
                                    styles.calendarPlaceholder,
                                    hasSelection && { borderColor: C.accent, backgroundColor: C.accentSoft }
                                ]}
                                onPress={openDatePicker}
                            >
                                <Ionicons
                                    name={hasSelection ? 'calendar' : 'calendar-outline'}
                                    size={28}
                                    color={hasSelection ? C.accent : C.textSub}
                                />
                                {hasSelection ? (
                                    <View style={{ flex: 1, marginLeft: 12 }}>
                                        <Text style={{ color: C.accent, fontWeight: '700', fontSize: 15 }}>
                                            {dateLabel}
                                        </Text>
                                        <Text style={{ color: C.textSub, fontSize: 12, marginTop: 2 }}>
                                            Tap to change dates
                                        </Text>
                                    </View>
                                ) : (
                                    <View style={{ flex: 1, marginLeft: 12 }}>
                                        <Text style={{ color: C.text, fontWeight: '600', fontSize: 15 }}>
                                            Select dates
                                        </Text>
                                        <Text style={{ color: C.textSub, fontSize: 12, marginTop: 2 }}>
                                            Check availability & pick your rental period
                                        </Text>
                                    </View>
                                )}
                                <Ionicons name="chevron-forward" size={18} color={C.textSub} />
                            </TouchableOpacity>
                        )}
                    </View>

                </View>
            </ScrollView>

            {/* ── Sticky footer ────────────────────────────────────── */}
            <View style={styles.footer}>
                <SafeAreaView edges={['bottom']}>
                    <View style={styles.footerContent}>
                        <View style={{ flex: 1, paddingRight: 12 }}>
                            {!hasSelection ? (
                                <Text style={styles.footerPrice}>
                                    €{tool.pricePerDay}
                                    <Text style={styles.footerDay}> / day</Text>
                                </Text>
                            ) : (
                                <View>
                                    <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 6, marginBottom: 2 }}>
                                        <Text style={styles.footerTotalVal}>€{totalPrice}</Text>
                                        <Text style={styles.footerTotalLabel}>total</Text>
                                    </View>
                                    <Text style={styles.footerDateSub}>
                                        {totalDays} {totalDays === 1 ? 'day' : 'days'} ({dateLabel})
                                    </Text>
                                    <Text style={styles.footerStrikeThru}>
                                        €{tool.pricePerDay} / day
                                    </Text>
                                </View>
                            )}
                        </View>
                        {isOwner ? (
                            <TouchableOpacity
                                style={styles.reserveBtn}
                                onPress={openDatePicker}
                            >
                                <Text style={styles.reserveBtnText}>Settings</Text>
                            </TouchableOpacity>
                        ) : (
                            <TouchableOpacity
                                style={[styles.reserveBtn, !hasSelection && styles.reserveBtnDisabled]}
                                onPress={handleReserve}
                                disabled={!hasSelection || isReserving}
                            >
                                {isReserving
                                    ? <ActivityIndicator color="#fff" />
                                    : <Text style={styles.reserveBtnText}>Reserve</Text>
                                }
                            </TouchableOpacity>
                        )}
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
        minHeight: 76, backgroundColor: C.surface,
        borderRadius: 16, borderWidth: 1, borderColor: C.border,
        flexDirection: 'row', alignItems: 'center', padding: 16,
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

    // Dynamic Summary specific styles
    footerTotalVal: { fontSize: 24, fontWeight: '800', color: C.text, letterSpacing: -0.5 },
    footerTotalLabel: { fontSize: 13, fontWeight: '700', color: C.textSub, marginBottom: 4, textTransform: 'uppercase', letterSpacing: 0.5 },
    footerDateSub: { color: '#fff', fontSize: 13, fontWeight: '600', opacity: 0.9 },
    footerStrikeThru: {
        textDecorationLine: 'line-through', color: C.textSub,
        fontSize: 11, marginTop: 3, fontWeight: '500'
    },
});

export default ToolDetailsScreen;
