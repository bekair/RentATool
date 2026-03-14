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

function toReadableStatus(status) {
    if (!status) {
        return 'Not started';
    }
    return status.toLowerCase().replace(/_/g, ' ');
}

function getStatusMeta(isReady) {
    return {
        color: isReady ? '#10b981' : '#f59e0b',
        icon: isReady ? 'checkmark-circle' : 'alert-circle-outline',
        label: isReady ? 'Ready' : 'Action needed',
    };
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

    const runManagePayoutAccount = async () => {
        try {
            setIsPayoutActionLoading(true);
            const data = await paymentsApi.createPayoutDashboardLink();
            if (!data?.url) {
                Alert.alert('Payouts', 'Unable to open payout management right now.');
                return;
            }

            await openExternalUrl(data.url);
        } catch (error) {
            Alert.alert('Payouts', error?.response?.data?.message || 'Unable to open payout management.');
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
    const isPayoutReady = hasPayout && summary?.payoutOnboardingStatus === 'COMPLETE';
    const blockers = summary?.readinessBlockers || [];
    const isProfileReady = blockers.length === 0;

    const payMeta = getStatusMeta(Boolean(hasMethod));
    const payoutMeta = getStatusMeta(Boolean(isPayoutReady));
    const profileMeta = getStatusMeta(Boolean(isProfileReady));

    const completedCount =
        Number(Boolean(hasMethod)) +
        Number(Boolean(isPayoutReady)) +
        Number(Boolean(isProfileReady));

    const progressWidth = `${Math.round((completedCount / 3) * 100)}%`;

    const payoutButtonTitle = isPayoutReady
        ? 'Manage payout account'
        : hasPayout
            ? 'Continue payout setup'
            : 'Start payout setup';

    const payoutButtonAction = isPayoutReady ? runManagePayoutAccount : handlePayoutSetup;

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
                    refreshControl={(
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={handleRefreshStatus}
                            tintColor="#6366f1"
                        />
                    )}
                >
                    <View style={styles.card}>
                        <View style={styles.rowBetween}>
                            <Text style={styles.sectionTitle}>Setup progress</Text>
                            <Text style={styles.progressLabel}>{completedCount}/3 complete</Text>
                        </View>
                        <View style={styles.progressTrack}>
                            <View style={[styles.progressFill, { width: progressWidth }]} />
                        </View>

                        <View style={styles.statusRow}>
                            <View style={styles.statusCell}>
                                <Ionicons name={payMeta.icon} size={14} color={payMeta.color} />
                                <Text style={styles.statusCellText}>Pay: {payMeta.label}</Text>
                            </View>
                            <View style={styles.statusCell}>
                                <Ionicons name={payoutMeta.icon} size={14} color={payoutMeta.color} />
                                <Text style={styles.statusCellText}>Earn: {payoutMeta.label}</Text>
                            </View>
                            <View style={styles.statusCell}>
                                <Ionicons name={profileMeta.icon} size={14} color={profileMeta.color} />
                                <Text style={styles.statusCellText}>Profile: {profileMeta.label}</Text>
                            </View>
                        </View>
                    </View>

                    <View style={styles.card}>
                        <View style={styles.cardHeaderRow}>
                            <View style={styles.iconWrap}>
                                <Ionicons name="card-outline" size={18} color="#c4b5fd" />
                            </View>
                            <View style={styles.cardTitleWrap}>
                                <Text style={styles.sectionTitle}>How you pay</Text>
                                <Text style={styles.secondaryText}>Default method used for rentals</Text>
                            </View>
                        </View>

                        {hasMethod && method ? (
                            <View style={styles.rowBetween}>
                                <View style={styles.detailTextWrap}>
                                    <Text style={styles.primaryText}>{String(method.brand || '').toUpperCase()} ending in {method.last4}</Text>
                                    <Text style={styles.secondaryText}>Exp {method.expMonth}/{method.expYear}</Text>
                                </View>
                                <View style={styles.pill}>
                                    <Ionicons name="checkmark-circle" size={14} color="#10b981" />
                                    <Text style={styles.pillText}>Default</Text>
                                </View>
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
                        <View style={styles.cardHeaderRow}>
                            <View style={styles.iconWrap}>
                                <Ionicons name="cash-outline" size={18} color="#c4b5fd" />
                            </View>
                            <View style={styles.cardTitleWrap}>
                                <Text style={styles.sectionTitle}>How you get paid</Text>
                                <Text style={styles.secondaryText}>Managed securely via Stripe Express</Text>
                            </View>
                        </View>

                        <View style={styles.rowBetween}>
                            <View style={styles.detailTextWrap}>
                                <Text style={styles.primaryText}>Status: {toReadableStatus(summary?.payoutOnboardingStatus)}</Text>
                                <Text style={styles.secondaryText}>Charges: {summary?.chargesEnabled ? 'enabled' : 'disabled'} | Payouts: {summary?.payoutsEnabled ? 'enabled' : 'disabled'}</Text>
                            </View>
                            <View style={[styles.pill, { borderColor: payoutMeta.color }]}>
                                <Ionicons name={payoutMeta.icon} size={14} color={payoutMeta.color} />
                                <Text style={[styles.pillText, { color: payoutMeta.color }]}>{payoutMeta.label}</Text>
                            </View>
                        </View>

                        <AppButton
                            title={payoutButtonTitle}
                            iconName="cash-outline"
                            onPress={payoutButtonAction}
                            loading={isPayoutActionLoading}
                            disabled={isActionInProgress}
                        />
                    </View>

                    <View style={styles.card}>
                        <Text style={styles.sectionTitle}>Checks to complete</Text>
                        {blockers.length === 0 ? (
                            <View style={styles.checkRow}>
                                <Ionicons name="checkmark-circle" size={16} color="#10b981" />
                                <Text style={styles.checkText}>All checks completed.</Text>
                            </View>
                        ) : (
                            blockers.map((item) => (
                                <View key={item} style={styles.checkRow}>
                                    <Ionicons name="alert-circle-outline" size={16} color="#f59e0b" />
                                    <Text style={styles.checkText}>{item}</Text>
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
    },
    progressLabel: {
        color: '#9ca3af',
        fontSize: 12,
        fontWeight: '600',
    },
    progressTrack: {
        marginTop: 10,
        height: 8,
        borderRadius: 999,
        backgroundColor: '#101010',
        borderWidth: 1,
        borderColor: '#27272a',
        overflow: 'hidden',
    },
    progressFill: {
        height: '100%',
        backgroundColor: '#6366f1',
    },
    statusRow: {
        marginTop: 12,
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    statusCell: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 999,
        borderWidth: 1,
        borderColor: '#27272a',
        backgroundColor: '#101010',
    },
    statusCellText: {
        color: '#f3f4f6',
        fontSize: 12,
        fontWeight: '600',
    },
    cardHeaderRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        marginBottom: 12,
    },
    iconWrap: {
        width: 32,
        height: 32,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#27272a',
        backgroundColor: '#101010',
        alignItems: 'center',
        justifyContent: 'center',
    },
    cardTitleWrap: {
        flex: 1,
        gap: 2,
    },
    rowBetween: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 12,
    },
    detailTextWrap: {
        flex: 1,
        paddingRight: 10,
    },
    primaryText: {
        color: '#f3f4f6',
        fontSize: 15,
        fontWeight: '600',
    },
    secondaryText: {
        color: '#9ca3af',
        fontSize: 13,
        marginTop: 2,
    },
    pill: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        borderRadius: 999,
        borderWidth: 1,
        borderColor: '#27272a',
        paddingHorizontal: 10,
        paddingVertical: 6,
        backgroundColor: '#101010',
    },
    pillText: {
        color: '#f3f4f6',
        fontSize: 12,
        fontWeight: '600',
    },
    checkRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginTop: 10,
    },
    checkText: {
        color: '#f3f4f6',
        fontSize: 13,
        flex: 1,
    },
});
