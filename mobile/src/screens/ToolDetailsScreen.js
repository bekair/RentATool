import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import ThemedSafeAreaView from '../components/layout/ThemedSafeAreaView';

import { Ionicons } from "@expo/vector-icons";
import api from "../api/client";
import { useAuth } from "../context/AuthContext";
import { getToolConditionLabel } from "../constants/toolConditions";

const { width } = Dimensions.get("window");

const C = {
  bg: "#0F0F0F",
  surface: "#1A1A1A",
  surface2: "#242424",
  border: "#2A2A2A",
  text: "#FFFFFF",
  textSub: "#A0A0A0",
  accent: "#6366f1",
  accentSoft: "rgba(99,102,241,0.15)",
  violet: "#818cf8",
  violetSoft: "rgba(129,140,248,0.15)",
  gold: "#FFB400",
  teal: "#00BFA5",
};

const ToolDetailsScreen = ({ route, navigation }) => {
  const { toolId } = route.params;
  const { user } = useAuth();
  const [tool, setTool] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);

  const isOwner = user?.id && tool?.ownerId === user.id;

  useEffect(() => {
    if (!toolId) return;

    setLoading(true);
    api
      .get(`/tools/${toolId}`)
      .then((response) => setTool(response.data))
      .catch(() => {
        Alert.alert("Error", "Failed to load tool details");
        if (navigation.canGoBack()) {
          navigation.goBack();
        }
      })
      .finally(() => setLoading(false));
  }, [navigation, toolId]);

  const openOwnerAvailability = () => {
    if (!tool) return;
    navigation.navigate("ToolCalendar", { toolItem: tool });
  };

  const handleContinueToRequest = () => {
    if (!tool?.id) return;
    navigation.navigate("BookingRequest", {
      toolId: tool.id,
      toolItem: tool,
    });
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={C.accent} />
      </View>
    );
  }

  if (!tool) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.errorText}>Tool not found</Text>
      </View>
    );
  }

  const toolCondition = getToolConditionLabel(
    tool.condition || tool.activeVersion?.condition,
  );
  const replacementValue =
    typeof tool.replacementValue === "number"
      ? `€${tool.replacementValue}`
      : "N/A";
  const address = tool.address || tool.activeVersion?.address || null;
  const locationSummary =
    [address?.city, address?.country].filter(Boolean).join(", ") ||
    "Location shared after approval";
  const locationLine1 = [address?.street, address?.addressLine2]
    .filter(Boolean)
    .join(", ");
  const locationLine2 = [address?.postalCode, address?.state]
    .filter(Boolean)
    .join(" ");
  const hasCoordinates =
    Number.isFinite(Number(address?.latitude)) &&
    Number.isFinite(Number(address?.longitude));
  const joinedDate = tool.owner?.createdAt
    ? new Date(tool.owner.createdAt)
    : null;
  const joinedLabel =
    joinedDate && !Number.isNaN(joinedDate.getTime())
      ? `Joined in ${joinedDate.getFullYear()}`
      : "Member";

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      <View style={styles.header}>
        <TouchableOpacity
          style={styles.iconBtn}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="chevron-back" size={22} color={C.text} />
        </TouchableOpacity>
        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.iconBtn}>
            <Ionicons name="share-outline" size={20} color={C.text} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.iconBtn}
            onPress={() => setIsFavorite((value) => !value)}
          >
            <Ionicons
              name={isFavorite ? "heart" : "heart-outline"}
              size={20}
              color={isFavorite ? C.accent : C.text}
            />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.hero}>
          <View style={styles.heroPlaceholder}>
            <Ionicons name="construct" size={64} color="#333" />
            <Text style={styles.heroPlaceholderText}>
              Professional Tool Imagery
            </Text>
          </View>
          <View style={styles.heroGradient} pointerEvents="none" />
          <View style={styles.photoBadge}>
            <Text style={styles.photoBadgeText}>1 / 5</Text>
          </View>
        </View>

        <View style={styles.content}>
          <Text style={styles.toolName}>{tool.name}</Text>

          <View style={styles.ratingRow}>
            <Ionicons name="star" size={14} color={C.gold} />
            <Text style={styles.ratingScore}> 4.91 · </Text>
            <TouchableOpacity>
              <Text style={styles.reviewsLink}>98 reviews</Text>
            </TouchableOpacity>
            <Text style={styles.locationText}> · {locationSummary}</Text>
          </View>

          <View style={styles.sectionCard}>
            <View style={styles.hostRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.hostTitle}>
                  Tool hosted by {tool.owner?.displayName}
                </Text>
                <Text style={styles.hostSub}>{joinedLabel}</Text>
              </View>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>
                  {tool.owner?.displayName?.[0] ?? "?"}
                </Text>
                <View style={styles.verifiedBadge}>
                  <Ionicons name="checkmark" size={9} color="#fff" />
                </View>
              </View>
            </View>
          </View>

          <View style={styles.sectionCard}>
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
              sub="Arrange pickup and return details directly with the owner."
              isLast
            />
          </View>

          <View style={[styles.section, styles.sectionCard]}>
            <Text style={styles.sectionTitle}>About this tool</Text>
            <Text style={styles.description}>{tool.description}</Text>
          </View>

          <View style={[styles.section, styles.sectionCard]}>
            <Text style={styles.sectionTitle}>Specifications</Text>
            <SpecRow label="Category" value={tool.category?.name} />
            <SpecRow label="Condition" value={toolCondition} />
            <SpecRow label="Replacement value" value={replacementValue} />
          </View>

          <View style={[styles.section, styles.sectionCard]}>
            <Text style={styles.sectionTitle}>Location</Text>
            <View style={styles.locationCard}>
              <View style={styles.locationIcon}>
                <Ionicons name="location-outline" size={20} color={C.accent} />
              </View>
              <View style={styles.locationInfo}>
                <Text style={styles.locationPrimary}>{locationSummary}</Text>
                {locationLine1 ? (
                  <Text style={styles.locationSecondary}>{locationLine1}</Text>
                ) : null}
                {locationLine2 ? (
                  <Text style={styles.locationSecondary}>{locationLine2}</Text>
                ) : null}
                {hasCoordinates ? (
                  <Text style={styles.locationCoordinates}>
                    {Number(address.latitude).toFixed(5)},{" "}
                    {Number(address.longitude).toFixed(5)}
                  </Text>
                ) : null}
              </View>
            </View>
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <ThemedSafeAreaView edges={["bottom"]}>
          <View style={styles.footerContent}>
            <View style={{ flex: 1, paddingRight: 12 }}>
              <Text style={styles.footerPrice}>
                €{tool.pricePerDay}
                <Text style={styles.footerDay}> / day</Text>
              </Text>
            </View>

            {isOwner ? (
              <TouchableOpacity
                style={styles.reserveBtn}
                onPress={openOwnerAvailability}
              >
                <Text style={styles.reserveBtnText}>Settings</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={styles.reserveBtn}
                onPress={handleContinueToRequest}
              >
                <Text style={styles.reserveBtnText}>Continue to request</Text>
              </TouchableOpacity>
            )}
          </View>
        </ThemedSafeAreaView>
      </View>
    </View>
  );
};

const Highlight = ({ icon, title, sub, isLast = false }) => (
  <View style={[styles.highlightRow, isLast && styles.highlightRowLast]}>
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

const styles = StyleSheet.create({
  container: {
    flex: 1, backgroundColor: C.bg
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: C.bg,
  },
  errorText: { color: C.textSub, fontSize: 15 },

  header: {
    position: "absolute",
    top: Platform.OS === "ios" ? 52 : 30,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    zIndex: 100,
  },
  headerRight: { flexDirection: "row", gap: 12 },
  iconBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "rgba(0,0,0,0.55)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },

  hero: {
    width,
    height: 320,
    backgroundColor: C.surface2,
    position: "relative",
  },
  heroPlaceholder: { flex: 1, justifyContent: "center", alignItems: "center" },
  heroPlaceholderText: { marginTop: 12, color: C.textSub, fontSize: 13 },
  heroGradient: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 80,
    backgroundColor: "rgba(15,15,15,0.6)",
  },
  photoBadge: {
    position: "absolute",
    bottom: 16,
    right: 16,
    backgroundColor: "rgba(0,0,0,0.65)",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 6,
  },
  photoBadgeText: { color: "#fff", fontSize: 12, fontWeight: "600" },

  scrollContent: { paddingBottom: 130 },
  content: { padding: 24 },

  toolName: {
    fontSize: 26,
    fontWeight: "700",
    color: C.text,
    marginBottom: 10,
    lineHeight: 32,
  },

  ratingRow: { flexDirection: "row", alignItems: "center", marginBottom: 8 },
  ratingScore: { fontSize: 14, fontWeight: "600", color: C.text },
  reviewsLink: {
    fontSize: 14,
    fontWeight: "600",
    color: C.text,
    textDecorationLine: "underline",
  },
  locationText: { fontSize: 14, color: C.textSub },

  section: { marginBottom: 0 },
  sectionCard: {
    backgroundColor: C.surface,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 16,
    padding: 16,
    marginTop: 16,
  },

  hostRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  hostTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: C.text,
    marginBottom: 4,
  },
  hostSub: { fontSize: 14, color: C.textSub },
  avatar: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: "#2A2A2A",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: C.border,
  },
  avatarText: { color: C.text, fontSize: 20, fontWeight: "700" },
  verifiedBadge: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: C.teal,
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: C.bg,
    justifyContent: "center",
    alignItems: "center",
  },

  highlightRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 20,
  },
  highlightRowLast: {
    marginBottom: 0,
  },
  highlightIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: C.violetSoft,
    justifyContent: "center",
    alignItems: "center",
  },
  highlightTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: C.text,
    marginBottom: 3,
  },
  highlightSub: { fontSize: 13, color: C.textSub, lineHeight: 18 },

  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: C.text,
    marginBottom: 12,
  },
  description: { fontSize: 15, color: C.textSub, lineHeight: 22 },

  specRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 14,
  },
  specLabel: { fontSize: 15, color: C.textSub },
  specValue: { fontSize: 15, color: C.text, fontWeight: "500" },

  locationCard: {
    backgroundColor: "rgba(255,255,255,0.02)",
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 12,
    padding: 12,
    flexDirection: "row",
    alignItems: "flex-start",
  },
  locationIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: C.accentSoft,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  locationInfo: {
    flex: 1,
  },
  locationPrimary: {
    color: C.text,
    fontSize: 15,
    fontWeight: "700",
  },
  locationSecondary: {
    marginTop: 3,
    color: C.textSub,
    fontSize: 13,
  },
  locationCoordinates: {
    marginTop: 6,
    color: C.accent,
    fontSize: 12,
    fontWeight: "600",
  },

  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: C.surface,
  },
  footerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 8,
  },
  footerPrice: { fontSize: 20, fontWeight: "700", color: C.text },
  footerDay: { fontSize: 15, fontWeight: "400", color: C.textSub },
  reserveBtn: {
    backgroundColor: C.accent,
    paddingHorizontal: 24,
    paddingVertical: 15,
    borderRadius: 12,
    minWidth: 140,
    alignItems: "center",
    shadowColor: C.accent,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.45,
    shadowRadius: 14,
    elevation: 8,
  },
  reserveBtnText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: 0.3,
  },
});

export default ToolDetailsScreen;
