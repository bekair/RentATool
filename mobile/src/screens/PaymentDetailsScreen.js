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
import { CustomerSheet } from '@stripe/stripe-react-native';
import * as WebBrowser from 'expo-web-browser';
import { paymentsApi } from '../api/client';
import CardBrandMark from '../components/payments/CardBrandMark';
import AppButton from '../components/ui/AppButton';
import { formatCardExpiry, formatCardMainLabel } from '../utils/paymentCards';

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
    };
}

export default function PaymentDetailsScreen({ navigation }) {
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
    const [isDefaultUpdateCardId, setIsDefaultUpdateCardId] = useState(null);

    const isActionInProgress =
        isCardActionLoading ||
        isPayoutActionLoading ||
        Boolean(isDefaultUpdateCardId);

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

                const defaultCard = nextCards.find((card) => card.isDefault);
                if (defaultCard?.id) {
                    return defaultCard.id;
                }

                if (
                    currentSelectedId &&
                    nextCards.some((card) => card.id === currentSelectedId)
                ) {
                    return currentSelectedId;
                }

                return nextCards[0].id;
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

            const initResult = await CustomerSheet.initialize({
                merchantDisplayName: 'Share a Tool',
                customerId: data.customerId,
                customerEphemeralKeySecret: data.ephemeralKeySecret,
                setupIntentClientSecret: data.clientSecret,
                returnURL: PAYMENT_DETAILS_DEEP_LINK,
                headerTextForSelectionScreen: 'Payment methods',
            });

            if (initResult.error) {
                Alert.alert('Cards', initResult.error.message || 'Unable to prepare card settings.');
                return;
            }

            const presentResult = await CustomerSheet.present();
            if (presentResult.error) {
                if (presentResult.error.code !== 'Canceled') {
                    Alert.alert('Cards', presentResult.error.message || 'Unable to update saved cards.');
                }
                return;
            }

            if (presentResult.paymentMethod?.id) {
                setSelectedCardId(presentResult.paymentMethod.id);
            }

            await paymentsApi.refreshStatus();
            await loadSummary(false, false);
        } catch (error) {
            Alert.alert('Cards', error?.response?.data?.message || 'Unable to open card settings.');
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

    const handleSelectDefaultCard = async (cardId) => {
        if (!cardId || selectedCardId === cardId || isActionInProgress) {
            return;
        }

        const previousSelectedCardId = selectedCardId;

        setSelectedCardId(cardId);
        setIsDefaultUpdateCardId(cardId);
        setSavedCards((currentCards) =>
            currentCards.map((card) => ({
                ...card,
                isDefault: card.id === cardId,
            })),
        );

        try {
            await paymentsApi.setDefaultPaymentMethod(cardId);
            await paymentsApi.refreshStatus();
            await loadSummary(false, false);
        } catch (error) {
            setSelectedCardId(previousSelectedCardId || null);
            await loadSummary(false, false);
            Alert.alert(
                'Cards',
                error?.response?.data?.message || 'Unable to update default payment method.',
            );
        } finally {
            setIsDefaultUpdateCardId(null);
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
            ? 'Continue setup'
            : 'Start setup';

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
                                    const isUpdatingDefault = isDefaultUpdateCardId === card.id;

                                    return (
                                        <TouchableOpacity
                                            key={card.id}
                                            style={[styles.listRow, isSelected && styles.listRowSelected]}
                                            activeOpacity={0.85}
                                            onPress={() => handleSelectDefaultCard(card.id)}
                                            disabled={isActionInProgress}
                                        >
                                            <View style={styles.rowTextWrap}>
                                                <Text style={styles.rowTitle}>{formatCardMainLabel(card)}</Text>
                                                <Text style={styles.rowSubtitle}>{formatCardExpiry(card)}</Text>
                                            </View>
                                            <CardBrandMark brand={card.brand} />
                                            {isUpdatingDefault ? (
                                                <ActivityIndicator size="small" color="#6366f1" />
                                            ) : isSelected ? (
                                                <View style={styles.defaultPill}>
                                                    <Text style={styles.defaultPillText}>Default</Text>
                                                </View>
                                            ) : null}
                                        </TouchableOpacity>
                                    );
                                })
                            ) : (
                                <View style={styles.listRow}>
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
                                title={hasMethod ? 'Manage cards' : 'Add card'}
                                iconName={!hasMethod ? 'add' : 'card'}
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
    defaultPill: {
        borderRadius: 999,
        paddingHorizontal: 10,
        height: 24,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#312e81',
        borderWidth: 1,
        borderColor: '#6366f1',
    },
    defaultPillText: {
        color: '#e0e7ff',
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

