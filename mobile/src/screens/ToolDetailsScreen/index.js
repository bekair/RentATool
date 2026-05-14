import React, { useEffect, useMemo, useState } from "react";
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
import ToolDetailsCalendar from "./ToolDetailsCalendar";
import { useAuth } from "../../context/AuthContext";
import { getToolConditionLabel } from "../../constants/toolConditions";
import { useTheme } from "../../theme";
import createStyles from "./ToolDetailsScreen.styles";

const ToolDetailsScreen = ({ route, navigation }) => {
  const { toolId } = route.params;
  const { user } = useAuth();
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
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
        <ActivityIndicator size="large" color={theme.colors.accent} />
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
      <StatusBar barStyle={theme.id === "dark" ? "light-content" : "dark-content"} />

      <View style={styles.header}>
        <TouchableOpacity
          style={styles.iconBtn}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="chevron-back" size={22} style={styles.iconBtnIcon} />
        </TouchableOpacity>
        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.iconBtn}>
            <Ionicons name="share-outline" size={20} style={styles.iconBtnIcon} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.iconBtn}
            onPress={() => setIsFavorite((value) => !value)}
          >
            <Ionicons
              name={isFavorite ? "heart" : "heart-outline"}
              size={20}
              style={isFavorite ? styles.favoriteIconActive : styles.iconBtnIcon}
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
            <Ionicons name="construct" size={64} style={styles.heroPlaceholderIcon} />
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
            <Ionicons name="star" size={14} style={styles.ratingStar} />
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
                  <Ionicons name="checkmark" size={9} style={styles.verifiedBadgeIcon} />
                </View>
              </View>
            </View>
          </View>

          <View style={styles.sectionCard}>
            <Highlight
              icon="shield-checkmark-outline"
              title="Fully Insured"
              sub="Covered against damage and theft for peace of mind."
              styles={styles}
            />
            <Highlight
              icon="location-outline"
              title="Great location"
              sub="95% of recent renters gave the location a 5-star rating."
              styles={styles}
            />
            <Highlight
              icon="time-outline"
              title="Flexible pickup"
              sub="Arrange pickup and return details directly with the owner."
              isLast
              styles={styles}
            />
          </View>

          <View style={[styles.section, styles.sectionCard]}>
            <Text style={styles.sectionTitle}>About this tool</Text>
            <Text style={styles.description}>{tool.description}</Text>
          </View>

          <View style={[styles.section, styles.sectionCard]}>
            <Text style={styles.sectionTitle}>Specifications</Text>
            <SpecRow label="Category" value={tool.category?.name} styles={styles} />
            <SpecRow label="Condition" value={toolCondition} styles={styles} />
            <SpecRow label="Replacement value" value={replacementValue} styles={styles} />
          </View>

          {isOwner ? <ToolDetailsCalendar toolId={tool.id} /> : null}

          <View style={[styles.section, styles.sectionCard]}>
            <Text style={styles.sectionTitle}>Location</Text>
            <View style={styles.locationCard}>
              <View style={styles.locationIcon}>
                <Ionicons name="location-outline" size={20} style={styles.locationPinIcon} />
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
      {isOwner ? null : (
        <View style={styles.footer}>
          <ThemedSafeAreaView edges={["bottom"]}>
            <View style={styles.footerContent}>
              <View style={styles.footerPriceWrap}>
                <Text style={styles.footerPrice}>
                  €{tool.pricePerDay}
                  <Text style={styles.footerDay}> / day</Text>
                </Text>
              </View>

              <TouchableOpacity
                style={styles.reserveBtn}
                onPress={handleContinueToRequest}
              >
                <Text style={styles.reserveBtnText}>Continue to request</Text>
              </TouchableOpacity>
            </View>
          </ThemedSafeAreaView>
        </View>
      )}
    </View>
  );
};

const Highlight = ({ icon, title, sub, isLast = false, styles }) => (
  <View style={[styles.highlightRow, isLast && styles.highlightRowLast]}>
    <View style={styles.highlightIcon}>
      <Ionicons name={icon} size={22} style={styles.highlightIconColor} />
    </View>
    <View style={styles.highlightContent}>
      <Text style={styles.highlightTitle}>{title}</Text>
      <Text style={styles.highlightSub}>{sub}</Text>
    </View>
  </View>
);

const SpecRow = ({ label, value, styles }) => (
  <View style={styles.specRow}>
    <Text style={styles.specLabel}>{label}</Text>
    <Text style={styles.specValue}>{value}</Text>
  </View>
);

export default ToolDetailsScreen;
