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

const CARD_BRAND_META = {
    visa: { label: 'Visa', badge: 'VISA', badgeBackground: '#1a5fd0' },
    mastercard: { label: 'Mastercard', badge: 'MC', badgeBackground: '#d1432f' },
    amex: { label: 'Amex', badge: 'AMEX', badgeBackground: '#1478a6' },
    discover: { label: 'Discover', badge: 'DISC', badgeBackground: '#f59e0b' },
    diners: { label: 'Diners', badge: 'DINERS', badgeBackground: '#2563eb' },
    jcb: { label: 'JCB', badge: 'JCB', badgeBackground: '#16a34a' },
    unionpay: { label: 'UnionPay', badge: 'UP', badgeBackground: '#dc2626' },
};

function toReadableStatus(status) {
    if (!status) {
        return 'Not started';
    }
    return status.toLowerCase().replace(/_/g, ' ');
}

function getStatusMeta(isReady) {
    return {
        color: isReady ? '#10b981' : '#f59e0b',
    };
}

function getCardBrandMeta(brand) {
    const key = typeof brand === 'string' ? brand.toLowerCase() : '';
    return CARD_BRAND_META[key] || { label: 'Card', badge: 'CARD', badgeBackground: '#374151' };
}

function formatCardMainLabel(card) {
    const brand = getCardBrandMeta(card?.brand).label;
    const last4 = card?.last4 || '----';
    return `${brand} •••• ${last4}`;
}

function formatCardExpiry(card) {
    if (!card?.expMonth || !card?.expYear) {
        return 'Expiry not available';
    }

    const month = String(card.expMonth).padStart(2, '0');
    return `Expires ${month}/${card.expYear}`;
}

export default function PaymentDetailsScreen({ navigation }) {
    const { initPaymentSheet, presentPaymentSheet } = useStripe();
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [summary, setSummary] = useState(null);
    const [savedCards, setSavedCards] = useState([]);
    const [selectedCardId, setSelectedCardId] = useState(null);
    const [hasMoreCards, setHasMoreCards] = useState(false);
    const [nextCardsCursor, setNextCardsCursor] = useState(null);
    const [isLoadingMoreCards, setIsLoadingMoreCards] = useState(false);
    const [isCardActionLoading, setIsCardActionLoading] = useState(false);
    const [isPayoutActionLoading, setIsPayoutActionLoading] = useState(false);

    const isActionInProgress = isCardActionLoading || isPayoutActionLoading;

    const applyCardPage = useCallback((page, append) => {
        const incomingCards = Array.isArray(page?.items) ? page.items : [];

        setSavedCards((prevCards) => {
            const nextCards = append
                ? [
                    ...prevCards,
                    ...incomingCards.filter(
                        (card) => !prevCards.some((prevCard) => prevCard.id === card.id),
                    ),
                ]
                : incomingCards;

            setSelectedCardId((currentSelectedId) => {
                if (nextCards.length === 0) {
                    return null;
                }

                if (
                    currentSelectedId &&
                    nextCards.some((card) => card.id === currentSelectedId)
                ) {
                    return currentSelectedId;
                }

                const defaultCard = nextCards.find((card) => card.isDefault);
                return defaultCard?.id || nextCards[0].id;
            });

            return nextCards;
        });

        setHasMoreCards(Boolean(page?.hasMore));
        setNextCardsCursor(page?.nextCursor || null);
    }, []);

    const loadSummary = useCallback(async (showSpinner = true, syncStripeStatus = true) => {
        if (showSpinner) {
            setLoading(true);
        }

        try {
            if (syncStripeStatus) {
                await paymentsApi.refreshStatus();
            }

            const [summaryData, cardsPage] = await Promise.all([
                paymentsApi.getSummary(),
                paymentsApi.listPaymentMethods({ limit: 3 }),
            ]);

            setSummary(summaryData);
            applyCardPage(cardsPage, false);
        } catch (error) {
            Alert.alert('Payment details', error?.response?.data?.message || 'Unable to load payment details.');
        } finally {
            if (showSpinner) {
                setLoading(false);
            }
            setRefreshing(false);
        }
    }, [applyCardPage]);

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

    const handleLoadMoreCards = async () => {
        if (!hasMoreCards || !nextCardsCursor) {
            return;
        }

        try {
            setIsLoadingMoreCards(true);
            const cardsPage = await paymentsApi.listPaymentMethods({
                limit: 3,
                startingAfter: nextCardsCursor,
            });
            applyCardPage(cardsPage, true);
        } catch (error) {
            Alert.alert('Payment methods', error?.response?.data?.message || 'Unable to load more cards.');
        } finally {
            setIsLoadingMoreCards(false);
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

    const hasMethod = savedCards.length > 0;
    const hasPayout = summary?.hasConnectedPayoutAccount;
    const isPayoutReady = hasPayout && summary?.payoutOnboardingStatus === 'COMPLETE';
    const payoutMeta = getStatusMeta(Boolean(isPayoutReady));

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
                <Text style={styles.headerTitle}>Payment Details</Text>
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
                    <View style={styles.sectionWrap}>
                        <Text style={styles.sectionTitle}>How you pay</Text>
                        <Text style={styles.sectionDescription}>Use your saved card for rentals.</Text>

                        <View style={styles.listCard}>
                            {hasMethod ? (
                                savedCards.map((card) => {
                                    const isSelected = selectedCardId === card.id;
                                    const brandMeta = getCardBrandMeta(card.brand);

                                    return (
                                        <TouchableOpacity
                                            key={card.id}
                                            style={[styles.listRow, isSelected && styles.listRowSelected]}
                                            activeOpacity={0.85}
                                            onPress={() => setSelectedCardId(card.id)}
                                        >
                                            <View style={styles.rowIconWrap}>
                                                <Ionicons
                                                    name="card-outline"
                                                    size={18}
                                                    color={isSelected ? '#c4b5fd' : '#9ca3af'}
                                                />
                                            </View>
                                            <View style={styles.rowTextWrap}>
                                                <Text style={styles.rowTitle}>{formatCardMainLabel(card)}</Text>
                                                <Text style={styles.rowSubtitle}>{formatCardExpiry(card)}</Text>
                                            </View>
                                            <View
                                                style={[
                                                    styles.brandBadge,
                                                    { backgroundColor: brandMeta.badgeBackground },
                                                ]}
                                            >
                                                <Text style={styles.brandBadgeText}>{brandMeta.badge}</Text>
                                            </View>
                                            <View
                                                style={[
                                                    styles.radioOuter,
                                                    isSelected && styles.radioOuterSelected,
                                                ]}
                                            >
                                                {isSelected ? <View style={styles.radioInner} /> : null}
                                            </View>
                                        </TouchableOpacity>
                                    );
                                })
                            ) : (
                                <View style={styles.listRow}>
                                    <View style={styles.rowIconWrap}>
                                        <Ionicons name="card-outline" size={18} color="#9ca3af" />
                                    </View>
                                    <View style={styles.rowTextWrap}>
                                        <Text style={styles.rowTitle}>No card added</Text>
                                        <Text style={styles.rowSubtitle}>Add one card to pay for rentals</Text>
                                    </View>
                                </View>
                            )}

                            {hasMoreCards ? (
                                <AppButton
                                    title="Load more cards"
                                    onPress={handleLoadMoreCards}
                                    loading={isLoadingMoreCards}
                                    disabled={isActionInProgress}
                                    style={styles.loadMoreButton}
                                    textStyle={styles.loadMoreButtonText}
                                />
                            ) : null}

                            <AppButton
                                title={hasMethod ? 'Replace card' : 'Add new card'}
                                iconName="add"
                                onPress={handleAddOrReplaceCard}
                                loading={isCardActionLoading}
                                disabled={isActionInProgress}
                                style={styles.addCardButton}
                            />
                        </View>
                    </View>

                    <View style={styles.sectionWrap}>
                        <Text style={styles.sectionTitle}>How you get paid</Text>
                        <Text style={styles.sectionDescription}>Set up payouts for your lending earnings.</Text>

                        <View style={styles.listCard}>
                            <View style={styles.listRow}>
                                <View style={styles.rowIconWrap}>
                                    <Ionicons name="cash-outline" size={18} color="#c4b5fd" />
                                </View>
                                <View style={styles.rowTextWrap}>
                                    <Text style={styles.rowTitle}>Stripe Express account</Text>
                                    <Text style={styles.rowSubtitle}>
                                        Status: {toReadableStatus(summary?.payoutOnboardingStatus)}
                                    </Text>
                                </View>
                                <View style={[styles.statusDot, { backgroundColor: payoutMeta.color }]} />
                            </View>

                            <View style={styles.listRow}>
                                <View style={styles.rowIconWrap}>
                                    <Ionicons name="swap-horizontal-outline" size={18} color="#c4b5fd" />
                                </View>
                                <View style={styles.rowTextWrap}>
                                    <Text style={styles.rowTitle}>Capabilities</Text>
                                    <Text style={styles.rowSubtitle}>
                                        Charges {summary?.chargesEnabled ? 'enabled' : 'disabled'} - Payouts {summary?.payoutsEnabled ? 'enabled' : 'disabled'}
                                    </Text>
                                </View>
                            </View>

                            <AppButton
                                title={payoutButtonTitle}
                                iconName="chevron-forward"
                                onPress={payoutButtonAction}
                                loading={isPayoutActionLoading}
                                disabled={isActionInProgress}
                                style={styles.primaryActionButton}
                            />
                        </View>
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
        paddingBottom: 12,
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
        paddingBottom: 24,
        gap: 18,
    },
    sectionWrap: {
        gap: 10,
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
        padding: 12,
        gap: 10,
    },
    listRow: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#2b2b2f',
        borderRadius: 12,
        backgroundColor: '#111114',
        minHeight: 64,
        paddingHorizontal: 12,
        paddingVertical: 10,
        gap: 10,
    },
    listRowSelected: {
        borderColor: '#4f46e5',
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
    brandBadge: {
        minWidth: 52,
        height: 24,
        borderRadius: 6,
        paddingHorizontal: 8,
        alignItems: 'center',
        justifyContent: 'center',
    },
    brandBadgeText: {
        color: '#fff',
        fontSize: 11,
        fontWeight: '700',
    },
    radioOuter: {
        width: 20,
        height: 20,
        borderRadius: 10,
        borderWidth: 2,
        borderColor: '#6b7280',
        alignItems: 'center',
        justifyContent: 'center',
        marginLeft: 2,
    },
    radioOuterSelected: {
        borderColor: '#6366f1',
    },
    radioInner: {
        width: 9,
        height: 9,
        borderRadius: 5,
        backgroundColor: '#6366f1',
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

