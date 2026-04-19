import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Calendar } from "react-native-calendars";
import ThemedSafeAreaView from '../../components/layout/ThemedSafeAreaView';
import { Ionicons } from "@expo/vector-icons";
import api, { toolsApi } from "../../api/client";
import AppButton from "../../components/ui/AppButton";
import InputField from "../../components/form/InputField";
import AppScreenHeader from '../../components/ui/AppScreenHeader';
import { useTheme, RESOLVED_THEMES } from '../../theme';
import createStyles from './BookingRequestScreen.styles';

const PICKUP_WINDOWS = [
  { value: "MORNING", label: "Morning" },
  { value: "AFTERNOON", label: "Afternoon" },
  { value: "EVENING", label: "Evening" },
  { value: "FLEXIBLE", label: "Flexible" },
];

export default function BookingRequestScreen({ route, navigation }) {
  const { toolId, toolItem } = route.params;
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

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

  const todayString = new Date().toISOString().split("T")[0];
  const currentMonthKey = todayString.slice(0, 7);
  const [displayedMonth, setDisplayedMonth] = useState(currentMonthKey);

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
        color: theme.colors.accent,
        textColor: theme.colors.accentContrast,
      };
    }

    if (endDate) {
      marks[endDate] = {
        ...marks[endDate],
        endingDay: true,
        color: theme.colors.accent,
        textColor: theme.colors.accentContrast,
      };

      const current = new Date(startDate);
      current.setDate(current.getDate() + 1);
      const last = new Date(endDate);

      while (current < last) {
        const dateString = current.toISOString().split("T")[0];
        marks[dateString] = {
          color: theme.colors.accent,
          textColor: theme.colors.accentContrast,
        };
        current.setDate(current.getDate() + 1);
      }
    }

    return marks;
  }, [endDate, startDate, unavailableDates, theme]);

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
        <ActivityIndicator size="large" color={theme.colors.accent} />
      </View>
    );
  }

  return (
    <ThemedSafeAreaView>
      <AppScreenHeader
        title="Request reservation"
        onBack={() => navigation.goBack()}
        iconColor={theme.colors.textPrimary}
        style={styles.header}
        right={<View style={styles.headerBtn} />}
      />

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
            color={theme.colors.accent}
          />
          <Text style={styles.payLaterText}>You pay after owner approval.</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Availability</Text>
          <Calendar
            style={styles.calendar}
            theme={{
              backgroundColor: theme.id === RESOLVED_THEMES.LIGHT ? theme.colors.fieldEditingBg : theme.colors.bg,
              calendarBackground: theme.id === RESOLVED_THEMES.LIGHT ? theme.colors.fieldEditingBg : theme.colors.bg,
              textSectionTitleColor: theme.colors.iconMuted,
              todayTextColor: theme.colors.accent,
              dayTextColor: theme.colors.textPrimary,
              textDisabledColor: theme.colors.borderStrong,
              arrowColor: theme.colors.accent,
              monthTextColor: theme.colors.textPrimary,
            }}
            markingType="period"
            onDayPress={handleDayPress}
            markedDates={markedDates}
            disableArrowLeft={displayedMonth === currentMonthKey}
            onMonthChange={(month) => setDisplayedMonth(month.dateString.slice(0, 7))}
            minDate={todayString}
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
