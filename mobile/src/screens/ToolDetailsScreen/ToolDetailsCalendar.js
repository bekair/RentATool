import React, { useEffect, useState } from "react";
import { ActivityIndicator, View, Text } from "react-native";
import { toolsApi } from "../../api/client";
import AvailabilityCalendar from "../../components/calendar/AvailabilityCalendar";
import { COLORS as C, styles } from "./ToolDetailsScreen.styles";

export default function ToolDetailsCalendar({ toolId }) {
  const [bookedDates, setBookedDates] = useState(new Set());
  const [manualBlockedDates, setManualBlockedDates] = useState(new Set());
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!toolId) {
      setBookedDates(new Set());
      setManualBlockedDates(new Set());
      setLoading(false);
      return;
    }

    setLoading(true);
    toolsApi
      .getAvailability(toolId)
      .then((availability) => {
        setBookedDates(new Set(availability.bookedDates || []));
        setManualBlockedDates(new Set(availability.manualBlockedDates || []));
      })
      .catch(() => {
        setBookedDates(new Set());
        setManualBlockedDates(new Set());
      })
      .finally(() => setLoading(false));
  }, [toolId]);

  return (
    <View style={[styles.section, styles.sectionCard]}>
      <Text style={styles.sectionTitle}>Availability</Text>
      <Text style={styles.availabilityHint}>
        Red dates are booked and purple dates are owner-blocked.
      </Text>
      {loading ? (
        <View style={styles.availabilityLoading}>
          <ActivityIndicator size="small" color={C.accent} />
        </View>
      ) : (
        <AvailabilityCalendar
          manualBlockedDates={manualBlockedDates}
          unavailableDates={bookedDates}
          readOnly
        />
      )}
      <View style={styles.availabilityLegendRow}>
        <View style={styles.availabilityLegendItem}>
          <View style={[styles.availabilityLegendDot, { backgroundColor: C.booked }]} />
          <Text style={styles.availabilityLegendText}>Booked</Text>
        </View>
        <View style={styles.availabilityLegendItem}>
          <View style={[styles.availabilityLegendDot, { backgroundColor: C.accent }]} />
          <Text style={styles.availabilityLegendText}>Blocked</Text>
        </View>
      </View>
    </View>
  );
}
