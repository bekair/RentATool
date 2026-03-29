import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Calendar } from "react-native-calendars";
import ThemedSafeAreaView from '../components/layout/ThemedSafeAreaView';
import { Ionicons } from "@expo/vector-icons";
import api, { toolsApi } from "../api/client";
import AppButton from "../components/ui/AppButton";
import InputField from "../components/form/InputField";

const PICKUP_WINDOWS = [
  { value: "MORNING", label: "Morning" },
  { value: "AFTERNOON", label: "Afternoon" },
  { value: "EVENING", label: "Evening" },
  { value: "FLEXIBLE", label: "Flexible" },
];

const C = {
  bg: "#0a0a0a",
  card: "#161616",
  cardAlt: "#1a1a1a",
  border: "#262626",
  text: "#fff",
  textMuted: "#888",
  accent: "#6366f1",
  accentSoft: "rgba(99,102,241,0.16)",
  danger: "#ef4444",
};

export default function BookingRequestScreen({ route, navigation }) {
  const { toolId, toolItem } = route.params;
  const [tool, setTool] = useState(toolItem || null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [unavailableDates, setUnavailableDates] = useState(new Set());
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [preferredPickupWindow, setPreferredPickupWindow] =
    useState("FLEXIBLE");
  const [usePurposeNote, setUsePurposeNote] = useState("");
  const [errors, setErrors] = useState({ date: null, note: null });

  const fetchRequestData = useCallback(async () => {
    try {
      const [toolResponse, availability] = await Promise.all([
        toolItem
          ? Promise.resolve({ data: toolItem })
          : api.get(`/tools/${toolId}`),
        toolsApi.getAvailability(toolId),
      ]);

      setTool(toolResponse.data);

      const blocked = new Set([
        ...(availability.bookedDates || []),
        ...(availability.manualBlockedDates || []),
      ]);
      setUnavailableDates(blocked);
    } catch (error) {
      Alert.alert("Error", "Failed to load booking request data.");
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  }, [navigation, toolId, toolItem]);

  useEffect(() => {
    fetchRequestData();
  }, [fetchRequestData]);

  const isRangeValid = (start, end) => {
    const current = new Date(start);
    const last = new Date(end);

    while (current <= last) {
      const key = current.toISOString().split("T")[0];
      if (unavailableDates.has(key)) {
        return false;
      }
      current.setDate(current.getDate() + 1);
    }

    return true;
  };

  const handleDayPress = (day) => {
    const dateString = day.dateString;
    if (unavailableDates.has(dateString)) {
      return;
    }

    setErrors((prev) => ({ ...prev, date: null }));

    if (!startDate || (startDate && endDate)) {
      setStartDate(dateString);
      setEndDate(null);
      return;
    }

    if (new Date(dateString) < new Date(startDate)) {
      setStartDate(dateString);
      return;
    }

    if (isRangeValid(startDate, dateString)) {
      setEndDate(dateString);
      return;
    }

    Alert.alert(
      "Unavailable Dates",
      "Your selection includes unavailable days.",
    );
    setStartDate(dateString);
    setEndDate(null);
  };

  const markedDates = useMemo(() => {
    const marks = {};

    unavailableDates.forEach((date) => {
      marks[date] = { disabled: true, disableTouchEvent: true };
    });

    if (startDate) {
      marks[startDate] = {
        ...marks[startDate],
        startingDay: true,
        endingDay: !endDate,
        color: C.accent,
        textColor: "#fff",
      };
    }

    if (endDate) {
      marks[endDate] = {
        ...marks[endDate],
        endingDay: true,
        color: C.accent,
        textColor: "#fff",
      };

      const current = new Date(startDate);
      current.setDate(current.getDate() + 1);
      const last = new Date(endDate);

      while (current < last) {
        const dateString = current.toISOString().split("T")[0];
        marks[dateString] = {
          color: C.accentSoft,
          textColor: "#fff",
        };
        current.setDate(current.getDate() + 1);
      }
    }

    return marks;
  }, [endDate, startDate, unavailableDates]);

  const summary = useMemo(() => {
    if (!startDate || !tool) {
      return null;
    }

    const selectedEndDate = endDate || startDate;
    const start = new Date(startDate);
    const end = new Date(selectedEndDate);
    const days = Math.ceil(Math.abs(end - start) / (1000 * 60 * 60 * 24)) + 1;
    const total =
      Math.round((days * tool.pricePerDay + Number.EPSILON) * 100) / 100;

    return {
      days,
      total,
      selectedEndDate,
    };
  }, [endDate, startDate, tool]);

  const trimmedNote = usePurposeNote.trim();
  const noteIsValid = trimmedNote.length >= 20 && trimmedNote.length <= 500;
  const canSubmit = Boolean(
    summary && noteIsValid && preferredPickupWindow && !submitting,
  );

  const handleSubmit = async () => {
    const dateError = summary ? null : "Please select your rental dates.";
    const noteError = noteIsValid
      ? null
      : "Please add at least 20 characters explaining your intended use.";

    setErrors({ date: dateError, note: noteError });

    if (dateError || noteError || !tool?.id) {
      return;
    }

    try {
      setSubmitting(true);

      await api.post("/bookings", {
        toolId: tool.id,
        startDate: new Date(`${startDate}T00:00:00Z`).toISOString(),
        endDate: new Date(`${summary.selectedEndDate}T23:59:59Z`).toISOString(),
        usePurposeNote: trimmedNote,
        preferredPickupWindow,
      });

      Alert.alert(
        "Request sent",
        "Your request was sent to the owner. You can pay after approval.",
        [
          {
            text: "View bookings",
            onPress: () =>
              navigation.navigate("MainTabs", { screen: "Bookings" }),
          },
        ],
      );
    } catch (error) {
      Alert.alert(
        "Error",
        error.response?.data?.message || "Failed to submit request.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={C.accent} />
      </View>
    );
  }

  return (
    <ThemedSafeAreaView>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.headerBtn}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={22} color={C.text} />
        </TouchableOpacity>
        <Text style={styles.title}>Request reservation</Text>
        <View style={styles.headerBtn} />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.toolCard}>
          <Text style={styles.toolName}>{tool?.name}</Text>
          <Text style={styles.toolPrice}>€{tool?.pricePerDay} / day</Text>
        </View>

        <View style={styles.payLaterBanner}>
          <Ionicons
            name="information-circle-outline"
            size={18}
            color={C.accent}
          />
          <Text style={styles.payLaterText}>You pay after owner approval.</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Availability</Text>
          <Calendar
            style={styles.calendar}
            theme={{
              backgroundColor: C.bg,
              calendarBackground: C.bg,
              textSectionTitleColor: C.textMuted,
              todayTextColor: C.accent,
              dayTextColor: C.text,
              textDisabledColor: "#333",
              arrowColor: C.accent,
              monthTextColor: C.text,
            }}
            markingType="period"
            onDayPress={handleDayPress}
            markedDates={markedDates}
            minDate={new Date().toISOString().split("T")[0]}
          />
          {errors.date ? (
            <Text style={styles.errorText}>{errors.date}</Text>
          ) : null}

          <View style={styles.legendRow}>
            <View style={styles.legendDot} />
            <Text style={styles.legendText}>Unavailable</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Preferred pickup window</Text>
          <View style={styles.pickupGrid}>
            {PICKUP_WINDOWS.map((slot) => {
              const selected = preferredPickupWindow === slot.value;
              return (
                <TouchableOpacity
                  key={slot.value}
                  style={[
                    styles.pickupChip,
                    selected && styles.pickupChipActive,
                  ]}
                  onPress={() => setPreferredPickupWindow(slot.value)}
                >
                  <Text
                    style={[
                      styles.pickupChipText,
                      selected && styles.pickupChipTextActive,
                    ]}
                  >
                    {slot.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>What will you use it for?</Text>
          <InputField
            noLabel
            isEditing
            multiline
            numberOfLines={5}
            value={usePurposeNote}
            onChangeText={(value) => {
              setUsePurposeNote(value);
              if (errors.note) {
                setErrors((prev) => ({ ...prev, note: null }));
              }
            }}
            maxLength={500}
            placeholder="Describe your project or intended use"
            style={styles.noteInput}
            error={errors.note}
          />
          <Text style={styles.noteCounter}>{trimmedNote.length}/500</Text>
        </View>

        <View style={styles.summaryCard}>
          {summary ? (
            <>
              <Text style={styles.summaryTop}>
                {summary.days} {summary.days === 1 ? "day" : "days"} selected
              </Text>
              <Text style={styles.summaryAmount}>€{summary.total}</Text>
            </>
          ) : (
            <Text style={styles.summaryTop}>
              Select your dates to view total
            </Text>
          )}
        </View>

        <AppButton
          title="Send request"
          iconName="send-outline"
          loading={submitting}
          disabled={!canSubmit}
          onPress={handleSubmit}
          style={styles.submitButton}
        />
      </ScrollView>
    </ThemedSafeAreaView>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: C.bg,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
    backgroundColor: C.cardAlt,
  },
  headerBtn: {
    width: 28,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    color: C.text,
    fontSize: 18,
    fontWeight: "700",
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 36,
  },
  toolCard: {
    backgroundColor: C.card,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
  },
  toolName: {
    color: C.text,
    fontSize: 17,
    fontWeight: "700",
  },
  toolPrice: {
    marginTop: 4,
    color: C.textMuted,
    fontSize: 13,
    fontWeight: "600",
  },
  payLaterBanner: {
    backgroundColor: "rgba(99,102,241,0.08)",
    borderWidth: 1,
    borderColor: "rgba(99,102,241,0.35)",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  payLaterText: {
    marginLeft: 8,
    color: "#c7c8ff",
    fontSize: 13,
    fontWeight: "600",
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    color: C.text,
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 12,
  },
  calendar: {
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 12,
    overflow: "hidden",
  },
  legendRow: {
    marginTop: 10,
    flexDirection: "row",
    alignItems: "center",
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#333",
    marginRight: 8,
  },
  legendText: {
    color: C.textMuted,
    fontSize: 12,
  },
  pickupGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  pickupChip: {
    minWidth: "47%",
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: "center",
    backgroundColor: C.card,
  },
  pickupChipActive: {
    borderColor: C.accent,
    backgroundColor: C.accentSoft,
  },
  pickupChipText: {
    color: C.textMuted,
    fontSize: 13,
    fontWeight: "600",
  },
  pickupChipTextActive: {
    color: C.accent,
  },
  noteInput: {
    height: 128,
    paddingTop: 14,
    textAlignVertical: "top",
  },
  noteCounter: {
    marginTop: -12,
    color: C.textMuted,
    fontSize: 12,
    textAlign: "right",
  },
  summaryCard: {
    backgroundColor: C.card,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 14,
    padding: 16,
  },
  summaryTop: {
    color: C.textMuted,
    fontSize: 13,
    fontWeight: "600",
  },
  summaryAmount: {
    color: C.text,
    fontSize: 28,
    fontWeight: "800",
    marginTop: 4,
  },
  submitButton: {
    marginTop: 16,
    marginBottom: 8,
  },
  errorText: {
    color: C.danger,
    fontSize: 12,
    marginTop: 8,
    fontWeight: "500",
  },
});
