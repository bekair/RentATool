import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Alert, DeviceEventEmitter } from 'react-native';
import { Calendar } from 'react-native-calendars';
import { toolsApi } from '../api/client';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';

export default function BookingDatesScreen({ route, navigation }) {
    const { toolItem, initialStartDate = null, initialEndDate = null } = route.params;
    const [isLoading, setIsLoading] = useState(true);

    // Dates the tool is unavailable (bookings + manual blocks)
    const [unavailableDates, setUnavailableDates] = useState(new Set());

    const [startDate, setStartDate] = useState(initialStartDate);
    const [endDate, setEndDate] = useState(initialEndDate);

    const fetchAvailability = useCallback(async () => {
        try {
            const data = await toolsApi.getAvailability(toolItem.id);
            // Combine both booked and manually blocked dates
            const allUnavailable = new Set([
                ...(data.bookedDates || []),
                ...(data.manualBlockedDates || [])
            ]);
            setUnavailableDates(allUnavailable);
        } catch (error) {
            console.error('Failed to fetch availability:', error);
            Alert.alert('Error', 'Could not load calendar data.');
            navigation.goBack();
        } finally {
            setIsLoading(false);
        }
    }, [toolItem.id, navigation]);

    useEffect(() => {
        fetchAvailability();
    }, [fetchAvailability]);

    // Check if a range contains any unavailable dates
    const isRangeValid = (start, end) => {
        let current = new Date(start);
        const endObj = new Date(end);

        while (current <= endObj) {
            const dateStr = current.toISOString().split('T')[0];
            if (unavailableDates.has(dateStr)) {
                return false;
            }
            current.setDate(current.getDate() + 1);
        }
        return true;
    };

    const handleDayPress = (day) => {
        const dateString = day.dateString;

        if (unavailableDates.has(dateString)) {
            return; // Ignore taps on disabled dates
        }

        if (!startDate || (startDate && endDate)) {
            // Start a new selection
            setStartDate(dateString);
            setEndDate(null);
        } else if (startDate && !endDate) {
            // Clicking a date before the start date -> reset start date
            if (new Date(dateString) < new Date(startDate)) {
                setStartDate(dateString);
            } else {
                // Clicking a date after start date -> finish selection if valid
                if (isRangeValid(startDate, dateString)) {
                    setEndDate(dateString);
                } else {
                    Alert.alert('Unavailable Dates', 'Your selection includes dates that are already booked or blocked.');
                    setStartDate(dateString); // Reset to just this new day
                }
            }
        }
    };

    const handleConfirm = () => {
        if (!startDate) return;
        const effectiveEnd = endDate || startDate;

        // Emit an event to the originating ToolDetailsScreen, then pop the modal off the stack
        DeviceEventEmitter.emit(`confirmDates_${toolItem.id}`, { start: startDate, end: effectiveEnd });
        navigation.goBack();
    };

    // Calculate days and total price for the summary
    const bookingSummary = useMemo(() => {
        if (!startDate) return null;
        const effectiveEnd = endDate || startDate;
        const start = new Date(startDate);
        const end = new Date(effectiveEnd);
        const diffTime = Math.abs(end - start);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
        return {
            days: diffDays,
            totalPrice: diffDays * toolItem.pricePerDay
        };
    }, [startDate, endDate, toolItem.pricePerDay]);

    // Build the markedDates object dynamically based on selection
    const markedDates = useMemo(() => {
        const marks = {};

        // Mark unavailable dates
        unavailableDates.forEach(date => {
            marks[date] = { disabled: true, disableTouchEvent: true };
        });

        // Mark selection
        if (startDate) {
            marks[startDate] = {
                ...marks[startDate],
                startingDay: true,
                color: '#6366f1',
                textColor: 'white',
                // If no end date, this single day is both start and end
                endingDay: !endDate,
            };
        }

        if (endDate) {
            marks[endDate] = {
                ...marks[endDate],
                endingDay: true,
                color: '#6366f1',
                textColor: 'white',
            };

            // Fill the days in between
            let current = new Date(startDate);
            current.setDate(current.getDate() + 1);
            const endObj = new Date(endDate);

            while (current < endObj) {
                const dateStr = current.toISOString().split('T')[0];
                marks[dateStr] = {
                    color: 'rgba(99,102,241,0.2)',
                    textColor: 'white',
                };
                current.setDate(current.getDate() + 1);
            }
        }

        return marks;
    }, [unavailableDates, startDate, endDate]);

    if (isLoading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#6366f1" />
            </View>
        );
    }

    const canSubmit = !!startDate;

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <MaterialCommunityIcons name="arrow-left" size={24} color="#fff" />
                </TouchableOpacity>
                <Text style={styles.title}>Select Dates</Text>
                <View style={{ width: 40 }} />
            </View>

            <View style={styles.toolInfo}>
                <Text style={styles.toolName}>{toolItem.name}</Text>
                <Text style={styles.price}>€{toolItem.pricePerDay} / day</Text>
            </View>

            <Calendar
                style={styles.calendar}
                theme={{
                    backgroundColor: '#0a0a0a',
                    calendarBackground: '#0a0a0a',
                    textSectionTitleColor: '#888',
                    todayTextColor: '#6366f1',
                    dayTextColor: '#ffffff',
                    textDisabledColor: '#333',
                    arrowColor: '#6366f1',
                    monthTextColor: '#ffffff',
                }}
                markingType={'period'}
                onDayPress={handleDayPress}
                markedDates={markedDates}
                minDate={new Date().toISOString().split('T')[0]}
            />

            <View style={styles.legendContainer}>
                <View style={[styles.legendDot, { backgroundColor: '#333' }]} />
                <Text style={styles.legendText}>Unavailable</Text>
            </View>

            <View style={styles.footer}>
                {bookingSummary ? (
                    <View style={styles.summaryRow}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                            <Ionicons name="calendar-outline" size={16} color="#888" style={{ marginRight: 6 }} />
                            <Text style={styles.summaryDays}>{bookingSummary.days} days</Text>
                        </View>
                        <Text style={styles.summaryPrice}>Total: €{bookingSummary.totalPrice}</Text>
                    </View>
                ) : (
                    <View style={styles.summaryRow}>
                        <Text style={styles.selectPrompt}>Select your start and end dates</Text>
                    </View>
                )}

                <TouchableOpacity
                    style={[styles.reserveButton, !canSubmit && styles.reserveButtonDisabled]}
                    onPress={handleConfirm}
                    disabled={!canSubmit}
                >
                    <Text style={[styles.reserveButtonText, !canSubmit && { color: '#888' }]}>
                        Confirm
                    </Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0a0a0a',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#0a0a0a',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingTop: 60,
        paddingBottom: 20,
        backgroundColor: '#1a1a1a',
    },
    backButton: {
        padding: 8,
        marginLeft: -8,
    },
    title: {
        fontSize: 18,
        fontWeight: '700',
        color: '#fff',
    },
    toolInfo: {
        padding: 20,
    },
    toolName: {
        fontSize: 22,
        fontWeight: '700',
        color: '#fff',
        marginBottom: 4,
    },
    price: {
        fontSize: 16,
        color: '#888',
    },
    calendar: {
        borderTopWidth: 1,
        borderBottomWidth: 1,
        borderColor: '#1a1a1a',
    },
    legendContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 20,
    },
    legendDot: {
        width: 12,
        height: 12,
        borderRadius: 6,
        marginRight: 8,
    },
    legendText: {
        color: '#888',
        fontSize: 14,
    },
    footer: {
        padding: 20,
        marginTop: 'auto',
        backgroundColor: '#1a1a1a',
        borderTopWidth: 1,
        borderTopColor: '#2a2a2a',
    },
    summaryRow: {
        marginBottom: 20,
    },
    summaryDays: {
        color: '#888',
        fontSize: 14,
        fontWeight: '500',
    },
    summaryPrice: {
        color: '#fff',
        fontSize: 24,
        fontWeight: '700',
    },
    selectPrompt: {
        color: '#888',
        fontSize: 16,
        fontStyle: 'italic',
        height: 44, // Match approx height of summary text
        lineHeight: 44,
    },
    reserveButton: {
        backgroundColor: '#6366f1',
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
    },
    reserveButtonDisabled: {
        backgroundColor: '#2a2a2a',
    },
    reserveButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
});
