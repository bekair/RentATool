import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import ThemedSafeAreaView from '../../components/layout/ThemedSafeAreaView';

import { Ionicons } from "@expo/vector-icons";
import api from "../../api/client";
import { useAuth } from "../../context/AuthContext";
import { getToolConditionLabel } from "../../constants/toolConditions";
import { COLORS as C, styles } from "./ToolDetailsScreen.styles";

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
              <View style={styles.hostTextWrap}>
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
            <View style={styles.footerPriceWrap}>
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
    <View style={styles.highlightContent}>
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

export default ToolDetailsScreen;
