import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useStripe } from "@stripe/stripe-react-native";
import ThemedSafeAreaView from '../components/layout/ThemedSafeAreaView';
import api, { paymentsApi } from "../api/client";
import AppButton from "../components/ui/AppButton";

const PAYMENT_SHEET_RETURN_URL = "shareatool://payment-details";

const PICKUP_WINDOW_LABELS = {
  MORNING: "Morning",
  AFTERNOON: "Afternoon",
  EVENING: "Evening",
  FLEXIBLE: "Flexible",
};

const C = {
  bg: "#0a0a0a",
  card: "#161616",
  border: "#262626",
  text: "#fff",
  muted: "#888",
  accent: "#6366f1",
  success: "#22c55e",
  danger: "#ef4444",
  warning: "#f59e0b",
};

const BookingsScreen = ({ navigation }) => {
  const { initPaymentSheet, presentPaymentSheet, confirmPaymentSheetPayment } =
    useStripe();
  const [viewMode, setViewMode] = useState("rentals");
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState(null);

  const isRentalsMode = useMemo(() => viewMode === "rentals", [viewMode]);

  const fetchBookings = async (isRefreshing = false) => {
    if (!isRefreshing) setLoading(true);

    try {
      const endpoint = isRentalsMode ? "/bookings/renter" : "/bookings/owner";
      const response = await api.get(endpoint);
      setBookings(response.data || []);
    } catch (error) {
      console.error("Error fetching bookings:", error);
      Alert.alert("Error", "Failed to load bookings");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    setBookings([]);
    const unsubscribe = navigation.addListener("focus", () => {
      fetchBookings();
    });

    fetchBookings();
    return unsubscribe;
  }, [navigation, isRentalsMode]);

  const isBookingPaid = (booking) =>
    Boolean(booking.paidAt || booking.stripePaymentStatus === "succeeded");

  const getStatusColor = (booking) => {
    if (booking.status === "APPROVED" && !isBookingPaid(booking)) {
      return C.warning;
    }

    switch (booking.status) {
      case "PENDING":
        return C.accent;
      case "APPROVED":
        return C.success;
      case "REJECTED":
        return C.danger;
      case "CANCELLED":
        return "#888";
      case "COMPLETED":
        return "#10b981";
      default:
        return "#fff";
    }
  };

  const getStatusLabel = (booking) => {
    if (booking.status === "APPROVED" && !isBookingPaid(booking)) {
      return "APPROVED - PAYMENT DUE";
    }

    return booking.status;
  };

  const getPickupWindowLabel = (value) =>
    PICKUP_WINDOW_LABELS[value] || "Flexible";

  const handleUpdateStatus = async (id, status) => {
    const loadingKey = `status-${id}-${status}`;
    setActionLoadingId(loadingKey);

    try {
      await api.patch(`/bookings/${id}/status`, { status });
      Alert.alert("Success", `Booking ${status.toLowerCase()} successfully`);
      fetchBookings();
    } catch (error) {
      Alert.alert(
        "Error",
        error.response?.data?.message || "Failed to update booking status",
      );
    } finally {
      setActionLoadingId(null);
    }
  };

  const handlePayNow = async (booking) => {
    const loadingKey = `pay-${booking.id}`;
    setActionLoadingId(loadingKey);

    try {
      const paymentSetup = await paymentsApi.createBookingPaymentIntent(
        booking.id,
      );
      const initResult = await initPaymentSheet({
        merchantDisplayName: "Share a Tool",
        customerId: paymentSetup.customerId,
        customerEphemeralKeySecret: paymentSetup.ephemeralKeySecret,
        paymentIntentClientSecret: paymentSetup.clientSecret,
        customFlow: true,
        allowsDelayedPaymentMethods: false,
        returnURL: PAYMENT_SHEET_RETURN_URL,
      });

      if (initResult.error) {
        Alert.alert(
          "Payment",
          initResult.error.message || "Unable to prepare checkout.",
        );
        return;
      }

      const presentResult = await presentPaymentSheet();
      if (presentResult.error) {
        if (presentResult.error.code !== "Canceled") {
          Alert.alert(
            "Payment",
            presentResult.error.message ||
            "Unable to complete payment method step.",
          );
        }
        return;
      }

      const confirmResult = await confirmPaymentSheetPayment();
      if (confirmResult.error) {
        Alert.alert(
          "Payment",
          confirmResult.error.message || "Unable to confirm payment.",
        );
        return;
      }

      const paymentStatus = await paymentsApi.syncBookingPayment(booking.id);
      if (!paymentStatus?.isPaid) {
        Alert.alert("Payment", "Payment was not completed. Please try again.");
        return;
      }

      Alert.alert("Payment complete", "Your booking is now paid.");
      fetchBookings();
    } catch (error) {
      Alert.alert(
        "Error",
        error.response?.data?.message || "Unable to process payment right now.",
      );
    } finally {
      setActionLoadingId(null);
    }
  };

  const renderBookingItem = ({ item }) => {
    const isRenting = isRentalsMode;
    const otherPartyName = isRenting
      ? item.owner?.displayName || "Unknown Owner"
      : item.renter?.displayName || "Unknown Renter";

    const showPayNow =
      isRenting && item.status === "APPROVED" && !isBookingPaid(item);

    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={styles.toolIcon}>
            <Ionicons name="build-outline" size={24} color={C.accent} />
          </View>
          <View style={styles.headerInfo}>
            <Text style={styles.toolName}>{item.tool.name}</Text>
            <Text style={styles.otherParty}>
              {isRenting ? "From: " : "To: "}
              {otherPartyName}
            </Text>
          </View>
          <View
            style={[
              styles.statusBadge,
              { backgroundColor: `${getStatusColor(item)}20` },
            ]}
          >
            <Text style={[styles.statusText, { color: getStatusColor(item) }]}>
              {getStatusLabel(item)}
            </Text>
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.detailsRow}>
          <View style={styles.dateInfo}>
            <Text style={styles.dateLabel}>Start</Text>
            <Text style={styles.dateValue}>
              {new Date(item.startDate).toLocaleDateString()}
            </Text>
          </View>
          <View style={styles.dateArrow}>
            <Text style={{ color: "#666" }}>?</Text>
          </View>
          <View style={styles.dateInfo}>
            <Text style={styles.dateLabel}>End</Text>
            <Text style={styles.dateValue}>
              {new Date(item.endDate).toLocaleDateString()}
            </Text>
          </View>
          <View style={styles.priceInfo}>
            <Text style={styles.priceLabel}>Total</Text>
            <Text style={styles.priceValue}>€{item.totalPrice}</Text>
          </View>
        </View>

        <View style={styles.metaSection}>
          <Text style={styles.metaLabel}>Pickup window</Text>
          <Text style={styles.metaValue}>
            {getPickupWindowLabel(item.preferredPickupWindow)}
          </Text>
        </View>

        <View style={styles.metaSection}>
          <Text style={styles.metaLabel}>Use note</Text>
          <Text style={styles.metaNote}>
            {item.usePurposeNote || "No note provided."}
          </Text>
        </View>

        {!isRenting && item.status === "PENDING" && (
          <View style={styles.actions}>
            <TouchableOpacity
              style={[styles.actionButton, styles.rejectButton]}
              disabled={actionLoadingId === `status-${item.id}-REJECTED`}
              onPress={() => handleUpdateStatus(item.id, "REJECTED")}
            >
              {actionLoadingId === `status-${item.id}-REJECTED` ? (
                <ActivityIndicator size="small" color={C.danger} />
              ) : (
                <Text style={styles.rejectButtonText}>Decline</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionButton, styles.approveButton]}
              disabled={actionLoadingId === `status-${item.id}-APPROVED`}
              onPress={() => handleUpdateStatus(item.id, "APPROVED")}
            >
              {actionLoadingId === `status-${item.id}-APPROVED` ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.approveButtonText}>Approve</Text>
              )}
            </TouchableOpacity>
          </View>
        )}

        {isRenting && item.status === "PENDING" && (
          <TouchableOpacity
            style={styles.cancelLink}
            disabled={actionLoadingId === `status-${item.id}-CANCELLED`}
            onPress={() => handleUpdateStatus(item.id, "CANCELLED")}
          >
            {actionLoadingId === `status-${item.id}-CANCELLED` ? (
              <ActivityIndicator size="small" color={C.muted} />
            ) : (
              <Text style={styles.cancelLinkText}>Cancel request</Text>
            )}
          </TouchableOpacity>
        )}

        {showPayNow && (
          <AppButton
            title="Pay now"
            iconName="card-outline"
            loading={actionLoadingId === `pay-${item.id}`}
            onPress={() => handlePayNow(item)}
            style={styles.payNowButton}
          />
        )}
      </View>
    );
  };

  return (
    <ThemedSafeAreaView>
      <View style={styles.headerContainer}>
        <Text style={styles.screenTitle}>Bookings</Text>
        <View style={styles.segmentedControl}>
          <TouchableOpacity
            style={[styles.segment, isRentalsMode && styles.activeSegment]}
            onPress={() => {
              if (!isRentalsMode) {
                setBookings([]);
                setViewMode("rentals");
              }
            }}
          >
            <Text
              style={[
                styles.segmentText,
                isRentalsMode && styles.activeSegmentText,
              ]}
            >
              Rentals
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.segment, !isRentalsMode && styles.activeSegment]}
            onPress={() => {
              if (isRentalsMode) {
                setBookings([]);
                setViewMode("requests");
              }
            }}
          >
            <Text
              style={[
                styles.segmentText,
                !isRentalsMode && styles.activeSegmentText,
              ]}
            >
              Lendings
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {loading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color={C.accent} />
        </View>
      ) : (
        <>
          {refreshing && (
            <View style={styles.topLoader}>
              <ActivityIndicator size="small" color={C.accent} />
            </View>
          )}
          <FlatList
            data={bookings}
            renderItem={renderBookingItem}
            keyExtractor={(item) => item.id}
            style={{ flex: 1 }}
            contentContainerStyle={styles.listContainer}
            refreshControl={
              <RefreshControl
                refreshing={false}
                onRefresh={() => {
                  setRefreshing(true);
                  fetchBookings(true);
                }}
                tintColor={C.accent}
                colors={[C.accent]}
              />
            }
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Ionicons
                  name={
                    isRentalsMode ? "calendar-outline" : "construct-outline"
                  }
                  size={64}
                  color="#333"
                  style={{ marginBottom: 16 }}
                />
                <Text style={styles.emptyTitle}>
                  {isRentalsMode ? "No active rentals" : "No booking requests"}
                </Text>
                <Text style={styles.emptyText}>
                  {isRentalsMode
                    ? "You have not rented any tools yet."
                    : "No one has requested your tools yet."}
                </Text>
              </View>
            }
          />
        </>
      )}
    </ThemedSafeAreaView>
  );
};

const styles = StyleSheet.create({
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  topLoader: {
    paddingVertical: 10,
    alignItems: "center",
  },
  headerContainer: {
    padding: 20,
    paddingBottom: 10,
  },
  screenTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: C.text,
    marginBottom: 20,
  },
  segmentedControl: {
    flexDirection: "row",
    backgroundColor: "#1a1a1a",
    borderRadius: 12,
    padding: 4,
    height: 44,
  },
  segment: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 10,
  },
  activeSegment: {
    backgroundColor: "#333",
  },
  segmentText: {
    color: C.muted,
    fontWeight: "600",
    fontSize: 14,
  },
  activeSegmentText: {
    color: C.text,
    fontWeight: "bold",
  },
  listContainer: {
    padding: 20,
    paddingTop: 10,
    paddingBottom: 100,
    flexGrow: 1,
  },
  card: {
    backgroundColor: C.card,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: C.border,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  toolIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: "rgba(99,102,241,0.1)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  headerInfo: {
    flex: 1,
  },
  toolName: {
    fontSize: 16,
    fontWeight: "bold",
    color: C.text,
    marginBottom: 4,
  },
  otherParty: {
    fontSize: 12,
    color: C.muted,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    maxWidth: 130,
  },
  statusText: {
    fontSize: 10,
    fontWeight: "bold",
    textTransform: "uppercase",
  },
  divider: {
    height: 1,
    backgroundColor: C.border,
    marginBottom: 16,
  },
  detailsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
  },
  dateInfo: {
    alignItems: "center",
  },
  dateArrow: {
    paddingHorizontal: 10,
  },
  dateLabel: {
    fontSize: 10,
    color: "#666",
    marginBottom: 2,
    textTransform: "uppercase",
  },
  dateValue: {
    fontSize: 13,
    color: "#ccc",
    fontWeight: "500",
  },
  priceInfo: {
    alignItems: "flex-end",
    borderLeftWidth: 1,
    borderLeftColor: C.border,
    paddingLeft: 16,
  },
  priceLabel: {
    fontSize: 10,
    color: "#666",
    marginBottom: 2,
    textTransform: "uppercase",
  },
  priceValue: {
    fontSize: 16,
    color: C.accent,
    fontWeight: "bold",
  },
  metaSection: {
    marginBottom: 10,
  },
  metaLabel: {
    color: C.muted,
    fontSize: 11,
    textTransform: "uppercase",
    marginBottom: 2,
    letterSpacing: 0.4,
  },
  metaValue: {
    color: C.text,
    fontSize: 14,
    fontWeight: "600",
  },
  metaNote: {
    color: "#cfcfcf",
    fontSize: 13,
    lineHeight: 19,
  },
  actions: {
    flexDirection: "row",
    gap: 12,
    marginTop: 8,
  },
  actionButton: {
    flex: 1,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  approveButton: {
    backgroundColor: C.success,
  },
  rejectButton: {
    backgroundColor: "rgba(239,68,68,0.1)",
    borderWidth: 1,
    borderColor: C.danger,
  },
  approveButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 14,
  },
  rejectButtonText: {
    color: C.danger,
    fontWeight: "bold",
    fontSize: 14,
  },
  cancelLink: {
    alignSelf: "center",
    paddingVertical: 8,
    marginTop: 4,
  },
  cancelLinkText: {
    color: "#9d9d9d",
    fontSize: 12,
    textDecorationLine: "underline",
  },
  payNowButton: {
    marginTop: 10,
  },
  emptyContainer: {
    marginTop: 60,
    alignItems: "center",
    padding: 40,
    flex: 1,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: C.text,
    marginTop: 10,
    marginBottom: 8,
  },
  emptyText: {
    color: C.muted,
    fontSize: 15,
    textAlign: "center",
    lineHeight: 22,
  },
});

export default BookingsScreen;
