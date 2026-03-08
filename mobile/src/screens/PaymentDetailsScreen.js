import React, { useCallback, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import * as WebBrowser from 'expo-web-browser';
import { paymentsApi } from '../api/client';

export default function PaymentDetailsScreen({ navigation }) {
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [summary, setSummary] = useState(null);

    const loadSummary = useCallback(async (showSpinner = true) => {
        if (showSpinner) {
            setLoading(true);
        }

        try {
            const data = await paymentsApi.getSummary();
            setSummary(data);
        } catch (error) {
            Alert.alert('Payment details', error?.response?.data?.message || 'Unable to load payment details.');
        } finally {
            if (showSpinner) {
                setLoading(false);
            }
            setRefreshing(false);
        }
    }, []);

    useFocusEffect(
        useCallback(() => {
            loadSummary(true);
        }, [loadSummary])
    );

    const openExternalUrl = async (url) => {
        try {
            await WebBrowser.openBrowserAsync(url, {
                presentationStyle: WebBrowser.WebBrowserPresentationStyle.PAGE_SHEET,
                controlsColor: '#6366f1',
            });
            await paymentsApi.refreshStatus();
            await loadSummary(false);
        } catch (error) {
            Alert.alert('Payment details', error?.response?.data?.message || 'Unable to open external payment flow.');
        }
    };

    const handleAddOrReplaceCard = async () => {
        try {
            const data = await paymentsApi.createSetupIntent();
            if (data.billingPortalUrl) {
                await openExternalUrl(data.billingPortalUrl);
                return;
            }

            Alert.alert(
                'Setup intent created',
                'Card setup intent is ready. Configure a Stripe-hosted card collection page or billing portal URL to complete the flow in-app.',
            );
        } catch (error) {
            Alert.alert('Card setup', error?.response?.data?.message || 'Unable to start card setup.');
        }
    };

    const handlePayoutSetup = async () => {
        try {
            const data = await paymentsApi.createConnectAccountLink();
            if (!data?.url) {
                Alert.alert('Payout setup', 'Unable to create Stripe onboarding link.');
                return;
            }
            await openExternalUrl(data.url);
        } catch (error) {
            Alert.alert('Payout setup', error?.response?.data?.message || 'Unable to start payout onboarding.');
        }
    };

    const handleRefreshStatus = async () => {
        try {
            setRefreshing(true);
            await paymentsApi.refreshStatus();
            await loadSummary(false);
        } catch (error) {
            setRefreshing(false);
            Alert.alert('Refresh status', error?.response?.data?.message || 'Unable to refresh payment status.');
        }
    };

    const renderMethodSection = () => {
        const hasMethod = summary?.hasDefaultPaymentMethod;
        const method = summary?.defaultPaymentMethod;

        return (
            <View style={styles.card}>
                <Text style={styles.sectionTitle}>Payment methods</Text>
                {hasMethod && method ? (
                    <View style={styles.rowBetween}>
                        <View>
                            <Text style={styles.primaryText}>{String(method.brand || '').toUpperCase()} ending in {method.last4}</Text>
                            <Text style={styles.secondaryText}>Exp {method.expMonth}/{method.expYear}</Text>
                        </View>
                        <Ionicons name="checkmark-circle" size={20} color="#10b981" />
                    </View>
                ) : (
                    <Text style={styles.secondaryText}>No default payment method saved yet.</Text>
                )}

                <TouchableOpacity style={styles.ctaButton} onPress={handleAddOrReplaceCard}>
                    <Ionicons name="card-outline" size={18} color="#fff" />
                    <Text style={styles.ctaText}>{hasMethod ? 'Replace card' : 'Add card'}</Text>
                </TouchableOpacity>
            </View>
        );
    };

    const renderPayoutSection = () => {
        const hasPayout = summary?.hasConnectedPayoutAccount;
        const status = summary?.payoutOnboardingStatus || 'not_started';

        return (
            <View style={styles.card}>
                <Text style={styles.sectionTitle}>Payouts</Text>
                <View style={styles.rowBetween}>
                    <View>
                        <Text style={styles.primaryText}>Onboarding status: {status.replace('_', ' ')}</Text>
                        <Text style={styles.secondaryText}>Charges: {summary?.chargesEnabled ? 'enabled' : 'disabled'} | Payouts: {summary?.payoutsEnabled ? 'enabled' : 'disabled'}</Text>
                    </View>
                    <Ionicons
                        name={summary?.payoutsEnabled ? 'checkmark-circle' : 'alert-circle-outline'}
                        size={20}
                        color={summary?.payoutsEnabled ? '#10b981' : '#f59e0b'}
                    />
                </View>

                {Array.isArray(summary?.requirementsDue) && summary.requirementsDue.length > 0 ? (
                    <View style={styles.requirementsWrap}>
                        <Text style={styles.secondaryText}>Stripe requirements due:</Text>
                        {summary.requirementsDue.map((req) => (
                            <Text key={req} style={styles.requirementItem}>• {req}</Text>
                        ))}
                    </View>
                ) : null}

                <TouchableOpacity style={styles.ctaButton} onPress={handlePayoutSetup}>
                    <Ionicons name="cash-outline" size={18} color="#fff" />
                    <Text style={styles.ctaText}>{hasPayout ? 'Continue payout setup' : 'Start payout setup'}</Text>
                </TouchableOpacity>
            </View>
        );
    };

    const renderReadinessSection = () => {
        const blockers = summary?.readinessBlockers || [];

        return (
            <View style={styles.card}>
                <View style={styles.rowBetween}>
                    <Text style={styles.sectionTitle}>Readiness</Text>
                    <TouchableOpacity onPress={handleRefreshStatus} style={styles.refreshButton}>
                        <Ionicons name="refresh" size={16} color="#c4b5fd" />
                        <Text style={styles.refreshText}>Refresh</Text>
                    </TouchableOpacity>
                </View>

                {blockers.length === 0 ? (
                    <View style={styles.okRow}>
                        <Ionicons name="checkmark-circle" size={18} color="#10b981" />
                        <Text style={styles.okText}>You are ready to pay and get paid.</Text>
                    </View>
                ) : (
                    blockers.map((item) => (
                        <View key={item} style={styles.blockerRow}>
                            <Ionicons name="alert-circle-outline" size={18} color="#f59e0b" />
                            <Text style={styles.blockerText}>{item}</Text>
                        </View>
                    ))
                )}
            </View>
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="#fff" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Payment details</Text>
                <View style={styles.backButton} />
            </View>

            {loading ? (
                <View style={styles.loadingWrap}>
                    <ActivityIndicator size="large" color="#6366f1" />
                </View>
            ) : (
                <ScrollView
                    contentContainerStyle={styles.scrollContent}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={handleRefreshStatus}
                            tintColor="#6366f1"
                        />
                    }
                >
                    {renderMethodSection()}
                    {renderPayoutSection()}
                    {renderReadinessSection()}
                </ScrollView>
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0a0a0a',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingTop: 10,
        paddingBottom: 20,
    },
    backButton: {
        width: 34,
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#fff',
    },
    loadingWrap: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    scrollContent: {
        paddingHorizontal: 20,
        paddingBottom: 40,
        gap: 14,
    },
    card: {
        backgroundColor: '#161616',
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#262626',
        padding: 16,
    },
    sectionTitle: {
        fontSize: 16,
        color: '#fff',
        fontWeight: '700',
        marginBottom: 12,
    },
    rowBetween: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 12,
    },
    primaryText: {
        color: '#f3f4f6',
        fontSize: 15,
        fontWeight: '600',
    },
    secondaryText: {
        color: '#9ca3af',
        fontSize: 13,
        marginTop: 4,
    },
    ctaButton: {
        marginTop: 14,
        backgroundColor: '#6366f1',
        borderRadius: 12,
        minHeight: 44,
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row',
        gap: 8,
    },
    ctaText: {
        color: '#fff',
        fontWeight: '700',
        fontSize: 14,
    },
    requirementsWrap: {
        marginTop: 10,
        backgroundColor: '#101010',
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#27272a',
        padding: 10,
    },
    requirementItem: {
        color: '#d1d5db',
        fontSize: 12,
        marginTop: 4,
    },
    refreshButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        borderWidth: 1,
        borderColor: '#4c1d95',
        borderRadius: 8,
        paddingHorizontal: 8,
        paddingVertical: 4,
    },
    refreshText: {
        color: '#c4b5fd',
        fontSize: 12,
        fontWeight: '600',
    },
    blockerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 8,
    },
    blockerText: {
        color: '#f3f4f6',
        fontSize: 13,
        flex: 1,
    },
    okRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    okText: {
        color: '#f3f4f6',
        fontSize: 13,
    },
});
