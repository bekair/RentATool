import React, { useCallback, useMemo, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    RefreshControl,
    ScrollView,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { CustomerSheet } from '@stripe/stripe-react-native';
import ThemedSafeAreaView from '../../components/layout/ThemedSafeAreaView';
import * as WebBrowser from 'expo-web-browser';
import { paymentsApi } from '../../api/client';
import CardBrandMark from '../../components/payments/CardBrandMark';
import AppButton from '../../components/ui/AppButton';
import AppScreenHeader from '../../components/ui/AppScreenHeader';
import { formatCardExpiry, formatCardMainLabel } from '../../utils/paymentCards';
import { useTheme } from '../../theme';
import createStyles from './PaymentDetailsScreen.styles';

const PAYMENT_DETAILS_DEEP_LINK = 'shareatool://payment-details';

function toReadableStatus(status) {
    if (!status) {
        return 'Not started';
    }
    return status.toLowerCase().replace(/_/g, ' ');
}

function getStatusMeta(isReady, theme) {
    return {
        color: isReady ? theme.colors.success : theme.colors.warning,
    };
}

function buildCustomerSheetAppearance(theme) {
    const c = theme.colors;

    return {
        colors: {
            primary: c.accent,
            background: c.bg,
            componentBackground: c.surface,
            componentBorder: c.border,
            componentDivider: c.borderStrong,
            primaryText: c.textPrimary,
            secondaryText: c.textSecondary,
            componentText: c.textPrimary,
            placeholderText: c.textMuted,
            icon: c.iconMuted,
            error: c.danger,
        },
        primaryButton: {
            colors: {
                background: c.buttonPrimary,
                text: c.buttonPrimaryText,
                border: c.buttonPrimary,
                successBackgroundColor: c.success,
                successTextColor: c.accentContrast,
            },
        },
    };
}

export default function PaymentDetailsScreen({ navigation }) {
    const { theme } = useTheme();
    const styles = useMemo(() => createStyles(theme), [theme]);
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

                const defaultCard = nextCards.find((card) => card.isDefault);
                if (defaultCard?.id) {
                    return defaultCard.id;
                }

                if (
                    append &&
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

    const loadSummary = useCallback(async (showSpinner = true, syncStripeStatus = false) => {
        if (showSpinner) {
            setLoading(true);
        }

        try {
            let summaryData;
            let cardsPage;

            if (syncStripeStatus) {
                // Keep sync deterministic: reconcile Stripe first, then fetch the first cards page.
                summaryData = await paymentsApi.refreshStatus();
                cardsPage = await paymentsApi.listPaymentMethods({ limit: 3 });
            } else {
                [summaryData, cardsPage] = await Promise.all([
                    paymentsApi.getSummary(),
                    paymentsApi.listPaymentMethods({ limit: 3 }),
                ]);
            }

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
            // Always sync on focus so card list/default stay fresh when returning.
            loadSummary(true, true);
        }, [loadSummary]),
    );

    const openExternalUrl = async (url) => {
        try {
            await WebBrowser.openAuthSessionAsync(url, PAYMENT_DETAILS_DEEP_LINK);
            await loadSummary(false, true);
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
                style: theme.id === 'dark' ? 'alwaysDark' : 'alwaysLight',
                appearance: buildCustomerSheetAppearance(theme),
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
                // Always re-sync after closing Stripe UI so default-card changes are reflected.
                await loadSummary(false, true);
                return;
            }

            if (presentResult.paymentMethod?.id) {
                await paymentsApi.setDefaultPaymentMethod(presentResult.paymentMethod.id);
            }

            // Success path: force sync to reflect Stripe-managed default card updates.
            await loadSummary(false, true);
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
            await loadSummary(false, true);
        } catch (error) {
            setRefreshing(false);
            Alert.alert('Refresh status', error?.response?.data?.message || 'Unable to refresh payment status.');
        }
    };

    const hasMethod = savedCards.length > 0;
    const hasPayout = summary?.hasConnectedPayoutAccount;
    const isPayoutReady = Boolean(summary?.isPayoutReady);
    const payoutMeta = getStatusMeta(Boolean(isPayoutReady), theme);
    const payoutButtonTitle = isPayoutReady
        ? 'Manage payout account'
        : hasPayout
            ? 'Continue setup'
            : 'Start setup';
    const payoutButtonAction = isPayoutReady ? runManagePayoutAccount : handlePayoutSetup;

    return (
        <ThemedSafeAreaView>
            <AppScreenHeader title="Payment Details" onBack={() => navigation.goBack()} />
            {refreshing && (
                <View style={styles.topLoader}>
                    <ActivityIndicator size="small" color={theme.colors.accent} />
                </View>
            )}

            {loading ? (
                <View style={styles.loadingWrap}>
                    <ActivityIndicator size="large" color={theme.colors.accent} />
                </View>
            ) : (
                <ScrollView
                    contentContainerStyle={styles.scrollContent}
                    refreshControl={(
                        <RefreshControl
                            refreshing={false}
                            onRefresh={handleRefreshStatus}
                            tintColor={theme.colors.accent}
                            colors={[theme.colors.accent]}
                        />
                    )}
                >
                    <View style={styles.sectionWrap}>
                        <Text style={styles.sectionTitle}>Payment methods</Text>
                        <Text style={styles.sectionDescription}>
                            Manage cards in Stripe. The default card is highlighted below.
                        </Text>

                        <View style={styles.listCard}>
                            {hasMethod ? (
                                savedCards.map((card) => {
                                    const isSelected = selectedCardId === card.id;

                                    return (
                                        <View
                                            key={card.id}
                                            style={[styles.listRow, isSelected && styles.listRowSelected]}
                                        >
                                            <View style={styles.cardBrandSlot}>
                                                <CardBrandMark brand={card.brand} />
                                            </View>
                                            <View style={styles.rowTextWrap}>
                                                <Text style={styles.rowTitle}>{formatCardMainLabel(card)}</Text>
                                                <Text style={styles.rowSubtitle}>{formatCardExpiry(card)}</Text>
                                            </View>
                                            {isSelected ? (
                                                <View style={styles.rowRight}>
                                                    <View style={styles.defaultBadge}>
                                                        <Text style={styles.defaultBadgeText}>Default</Text>
                                                    </View>
                                                    <Ionicons name="checkmark-circle" size={20} style={styles.defaultCheckIcon} />
                                                </View>
                                            ) : null}
                                        </View>
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

                    <View style={[styles.sectionWrap, styles.sectionWrapSpaced]}>
                        <Text style={styles.sectionTitle}>Payout account</Text>
                        <Text style={styles.sectionDescription}>Set up payouts for your lending earnings.</Text>

                        <View style={styles.listCard}>
                            <View style={styles.listRow}>
                                <View style={styles.rowIconWrap}>
                                    <Ionicons name="cash-outline" size={18} style={styles.rowIcon} />
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
                                    <Ionicons name="swap-horizontal-outline" size={18} style={styles.rowIcon} />
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
        </ThemedSafeAreaView>
    );
}


