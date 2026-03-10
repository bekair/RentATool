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
import { useStripe } from '@stripe/stripe-react-native';
import * as WebBrowser from 'expo-web-browser';
import { paymentsApi } from '../api/client';
import AppButton from '../components/ui/AppButton';

const PAYMENT_DETAILS_DEEP_LINK = 'shareatool://payment-details';

const REQUIREMENT_LABELS = {
    'business_profile.mcc': 'Select your activity category.',
    'business_profile.product_description': 'Add a short description.',
    'business_profile.url': 'Add a website link.',
    'business_type': 'Confirm account holder type.',
    'company.address.city': 'Add your city.',
    'company.address.country': 'Add your country.',
    'company.address.line1': 'Add your street address.',
    'company.address.postal_code': 'Add your postal code.',
    'company.address.state': 'Add your state or region.',
    'company.name': 'Add your legal name.',
    'company.phone': 'Add your phone number.',
    'company.tax_id': 'Add your tax ID.',
    'external_account': 'Add a bank account.',
    'individual.address.city': 'Add your city.',
    'individual.address.country': 'Add your country.',
    'individual.address.line1': 'Add your street address.',
    'individual.address.postal_code': 'Add your postal code.',
    'individual.address.state': 'Add your state or region.',
    'individual.dob.day': 'Add your birth day.',
    'individual.dob.month': 'Add your birth month.',
    'individual.dob.year': 'Add your birth year.',
    'individual.email': 'Add your email address.',
    'individual.first_name': 'Add your first name.',
    'individual.id_number': 'Add your national ID number.',
    'individual.last_name': 'Add your last name.',
    'individual.phone': 'Add your phone number.',
    'individual.ssn_last_4': 'Add the last 4 digits of your SSN.',
    'tos_acceptance.date': 'Accept Stripe terms to continue.',
    'tos_acceptance.ip': 'Accept Stripe terms to continue.',
};

function toReadableRequirement(value) {
    if (!value) {
        return 'Verification required.';
    }

    if (REQUIREMENT_LABELS[value]) {
        return REQUIREMENT_LABELS[value];
    }

    return `Complete: ${value
        .replace(/\./g, ' > ')
        .replace(/_/g, ' ')
        .replace(/\b\w/g, (char) => char.toUpperCase())}`;
}

function toReadableStatus(status) {
    if (!status) {
        return 'not started';
    }

    return status.toLowerCase().replace(/_/g, ' ');
}

export default function PaymentDetailsScreen({ navigation }) {
    const { initPaymentSheet, presentPaymentSheet } = useStripe();
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [summary, setSummary] = useState(null);
    const [isCardActionLoading, setIsCardActionLoading] = useState(false);
    const [isPayoutActionLoading, setIsPayoutActionLoading] = useState(false);

    const isActionInProgress = isCardActionLoading || isPayoutActionLoading;

    const loadSummary = useCallback(async (showSpinner = true, syncStripeStatus = true) => {
        if (showSpinner) {
            setLoading(true);
        }

        try {
            if (syncStripeStatus) {
                await paymentsApi.refreshStatus();
            }

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
            loadSummary(true, true);
        }, [loadSummary]),
    );

    const openExternalUrl = async (url) => {
        try {
            await WebBrowser.openAuthSessionAsync(url, PAYMENT_DETAILS_DEEP_LINK);
            await paymentsApi.refreshStatus();
            await loadSummary(false, false);
        } catch (error) {
            Alert.alert('Payment details', error?.response?.data?.message || 'Unable to open secure payment flow.');
        }
    };

    const handleAddOrReplaceCard = async () => {
        try {
            setIsCardActionLoading(true);
            const data = await paymentsApi.createSetupIntent();

            const initResult = await initPaymentSheet({
                merchantDisplayName: 'Share a Tool',
                customerId: data.customerId,
                customerEphemeralKeySecret: data.ephemeralKeySecret,
                setupIntentClientSecret: data.clientSecret,
                allowsDelayedPaymentMethods: false,
                returnURL: PAYMENT_DETAILS_DEEP_LINK,
            });

            if (initResult.error) {
                Alert.alert('Card setup', initResult.error.message || 'Unable to prepare card setup.');
                return;
            }

            const presentResult = await presentPaymentSheet();
            if (presentResult.error) {
                if (presentResult.error.code !== 'Canceled') {
                    Alert.alert('Card setup', presentResult.error.message || 'Unable to complete card setup.');
                }
                return;
            }

            await paymentsApi.refreshStatus();
            await loadSummary(false, false);
        } catch (error) {
            Alert.alert('Card setup', error?.response?.data?.message || 'Unable to start card setup.');
        } finally {
            setIsCardActionLoading(false);
        }
    };

    const runPayoutSetup = async () => {
        try {
            setIsPayoutActionLoading(true);
            const data = await paymentsApi.createConnectAccountLink();
            if (!data?.url) {
                Alert.alert('Payout setup', 'Unable to create payout onboarding link.');
                return;
            }

            await openExternalUrl(data.url);
        } catch (error) {
            Alert.alert('Payout setup', error?.response?.data?.message || 'Unable to start payout onboarding.');
        } finally {
            setIsPayoutActionLoading(false);
        }
    };

    const handlePayoutSetup = () => {
        Alert.alert(
            'Payout setup',
            'Continue in Stripe to complete setup. You will return here automatically.',
            [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Continue', onPress: runPayoutSetup },
            ],
        );
    };

    const handleRefreshStatus = async () => {
        try {
            setRefreshing(true);
            await paymentsApi.refreshStatus();
            await loadSummary(false, false);
        } catch (error) {
            setRefreshing(false);
            Alert.alert('Refresh status', error?.response?.data?.message || 'Unable to refresh payment status.');
        }
    };

    const hasMethod = summary?.hasDefaultPaymentMethod;
    const method = summary?.defaultPaymentMethod;
    const hasPayout = summary?.hasConnectedPayoutAccount;
    const blockers = summary?.readinessBlockers || [];

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="#fff" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Payment details</Text>
                <TouchableOpacity onPress={handleRefreshStatus} style={styles.refreshButtonHeader}>
                    <Ionicons name="refresh" size={18} color="#c4b5fd" />
                </TouchableOpacity>
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
                    <View style={styles.card}>
                        <Text style={styles.sectionTitle}>Payment method</Text>
                        {hasMethod && method ? (
                            <View style={styles.rowBetween}>
                                <View>
                                    <Text style={styles.primaryText}>{String(method.brand || '').toUpperCase()} ending in {method.last4}</Text>
                                    <Text style={styles.secondaryText}>Exp {method.expMonth}/{method.expYear}</Text>
                                </View>
                                <Ionicons name="checkmark-circle" size={20} color="#10b981" />
                            </View>
                        ) : (
                            <Text style={styles.secondaryText}>No default card saved yet.</Text>
                        )}

                        <AppButton
                            title={hasMethod ? 'Replace card' : 'Add card'}
                            iconName="card-outline"
                            onPress={handleAddOrReplaceCard}
                            loading={isCardActionLoading}
                            disabled={isActionInProgress}
                        />
                    </View>

                    <View style={styles.card}>
                        <Text style={styles.sectionTitle}>Payouts</Text>
                        <View style={styles.rowBetween}>
                            <View>
                                <Text style={styles.primaryText}>Status: {toReadableStatus(summary?.payoutOnboardingStatus)}</Text>
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
                                <Text style={styles.secondaryText}>Required to continue:</Text>
                                {summary.requirementsDue.slice(0, 5).map((req) => (
                                    <Text key={req} style={styles.requirementItem}>• {toReadableRequirement(req)}</Text>
                                ))}
                                {summary.requirementsDue.length > 5 ? (
                                    <Text style={styles.requirementItem}>• +{summary.requirementsDue.length - 5} more item(s)</Text>
                                ) : null}
                            </View>
                        ) : null}

                        <AppButton
                            title={hasPayout ? 'Continue payout setup' : 'Start payout setup'}
                            iconName="cash-outline"
                            onPress={handlePayoutSetup}
                            loading={isPayoutActionLoading}
                            disabled={isActionInProgress}
                        />
                    </View>

                    <View style={styles.card}>
                        <Text style={styles.sectionTitle}>Readiness</Text>
                        {blockers.length === 0 ? (
                            <View style={styles.okRow}>
                                <Ionicons name="checkmark-circle" size={18} color="#10b981" />
                                <Text style={styles.okText}>You are ready.</Text>
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
        padding: 5,
        marginLeft: -5,
    },
    refreshButtonHeader: {
        width: 34,
        alignItems: 'flex-end',
        paddingRight: 2,
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


