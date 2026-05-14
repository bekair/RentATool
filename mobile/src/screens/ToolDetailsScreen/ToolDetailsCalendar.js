import React, { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, View, Text } from "react-native";
import { toolsApi } from "../../api/client";
import AvailabilityCalendar from "../../components/calendar/AvailabilityCalendar";
import { useTheme } from "../../theme";
import createStyles from "./ToolDetailsScreen.styles";

export default function ToolDetailsCalendar({ toolId }) {
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
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
          <ActivityIndicator size="small" color={theme.colors.accent} />
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
          <View style={[styles.availabilityLegendDot, styles.availabilityLegendBookedDot]} />
          <Text style={styles.availabilityLegendText}>Booked</Text>
        </View>
        <View style={styles.availabilityLegendItem}>
          <View style={[styles.availabilityLegendDot, styles.availabilityLegendBlockedDot]} />
          <Text style={styles.availabilityLegendText}>Blocked</Text>
        </View>
      </View>
    </View>
  );
}
