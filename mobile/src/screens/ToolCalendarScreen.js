import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { Calendar } from 'react-native-calendars';
import { toolsApi } from '../api/client';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function ToolCalendarScreen({ route, navigation }) {
    const { toolItem } = route.params;
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    // Dates the tool is booked (read-only)
    const [bookedDates, setBookedDates] = useState(new Set());
    // Dates the owner has manually blocked (toggleable)
    const [manualBlockedDates, setManualBlockedDates] = useState(new Set());
    const [selectionStart, setSelectionStart] = useState(null);

    const maxDateObj = new Date();
    maxDateObj.setDate(maxDateObj.getDate() + 21);
    const maxDateString = maxDateObj.toISOString().split('T')[0];
    const todayString = new Date().toISOString().split('T')[0];

    // We keep a ref to the original manual blocks to know if there are unsaved changes
    const [originalManualBlocks, setOriginalManualBlocks] = useState(new Set());

    const fetchAvailability = useCallback(async () => {
        try {
            const data = await toolsApi.getAvailability(toolItem.id);
            setBookedDates(new Set(data.bookedDates || []));
            const manualBlocksSet = new Set(data.manualBlockedDates || []);
            setManualBlockedDates(manualBlocksSet);
            setOriginalManualBlocks(new Set(manualBlocksSet)); // Copy for tracking changes
        } catch (error) {
            console.error('Failed to fetch availability:', error);
            Alert.alert('Error', 'Could not load calendar data.');
        } finally {
            setIsLoading(false);
        }
    }, [toolItem.id]);

    useEffect(() => {
        fetchAvailability();
    }, [fetchAvailability]);

    const handleDayPress = (day) => {
        const dateString = day.dateString;

        // Cannot toggle booked dates
        if (bookedDates.has(dateString)) {
            Alert.alert('Tool is Booked', 'You cannot manually toggle dates that have an active booking.');
            return;
        }

        if (dateString < todayString || dateString > maxDateString) {
            Alert.alert('Invalid Date', 'You can only block dates within the next 3 weeks.');
            return;
        }

        // Single tap to unblock an already blocked date
        if (manualBlockedDates.has(dateString)) {
            setManualBlockedDates(prev => {
                const newSet = new Set(prev);
                newSet.delete(dateString);
                return newSet;
            });
            setSelectionStart(null);
            return;
        }

        // If no selection start, start one
        if (!selectionStart) {
            setSelectionStart(dateString);
        } else {
            // End date selection
            if (dateString < selectionStart) {
                // Tapped before start date -> make it the new start date
                setSelectionStart(dateString);
            } else {
                // Tapped after start date -> fill the range
                let current = new Date(selectionStart);
                const endObj = new Date(dateString);
                const newBlocks = new Set(manualBlockedDates);

                let collision = false;
                while (current <= endObj) {
                    const dStr = current.toISOString().split('T')[0];
                    if (bookedDates.has(dStr)) {
                        collision = true;
                        break;
                    }
                    newBlocks.add(dStr);
                    current.setDate(current.getDate() + 1);
                }

                if (collision) {
                    Alert.alert('Invalid Range', 'Your selection includes dates that are already booked.');
                    setSelectionStart(dateString); // Reset start to the date after the invalid span
                } else {
                    setManualBlockedDates(newBlocks);
                    setSelectionStart(null); // finish selection
                }
            }
        }
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            await toolsApi.updateAvailability(toolItem.id, Array.from(manualBlockedDates));
            setOriginalManualBlocks(new Set(manualBlockedDates));
            Alert.alert('Success', 'Availability updated successfully.');
            // Allow them to stay on the screen or navigation.goBack() 
        } catch (error) {
            const msg = error.response?.data?.message;
            const finalMessage = Array.isArray(msg) ? msg.join('\n') : (msg || 'Failed to save changes. Please try again.');
            Alert.alert('Update Warning', finalMessage);
        } finally {
            setIsSaving(false);
        }
    };

    const hasUnsavedChanges = manualBlockedDates.size !== originalManualBlocks.size ||
        [...manualBlockedDates].some(date => !originalManualBlocks.has(date));

    // Build the markedDates object for the calendar component
    const markedDates = {};

    // 1. Mark blocked dates as periods
    manualBlockedDates.forEach(date => {
        const d = new Date(date);
        const prev = new Date(d); prev.setDate(prev.getDate() - 1);
        const next = new Date(d); next.setDate(next.getDate() + 1);

        const prevStr = prev.toISOString().split('T')[0];
        const nextStr = next.toISOString().split('T')[0];

        markedDates[date] = {
            color: '#4b5563',
            textColor: '#fff',
            startingDay: !manualBlockedDates.has(prevStr),
            endingDay: !manualBlockedDates.has(nextStr),
        };
    });

    // 2. Mark booked dates (Red)
    // We treat them as standalone single-day period chips or let them connect? We'll make them distinct single chips.
    bookedDates.forEach(date => {
        markedDates[date] = {
            startingDay: true,
            endingDay: true,
            color: '#ef4444',
            textColor: '#fff',
            disableTouchEvent: true
        };
    });

    // 3. Mark the active selection overlay
    if (selectionStart) {
        markedDates[selectionStart] = {
            ...markedDates[selectionStart],
            startingDay: true,
            endingDay: true,
            color: '#6366f1',
            textColor: 'white',
        };
    }

    if (isLoading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#6366f1" />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <MaterialCommunityIcons name="arrow-left" size={24} color="#fff" />
                </TouchableOpacity>
                <Text style={styles.title}>Manage Availability</Text>
                <View style={{ width: 40 }} />
            </View>

            <View style={styles.toolInfo}>
                <Text style={styles.toolName}>{toolItem.name}</Text>
                <Text style={styles.instructions}>
                    Select a start and end date to block a range of days (up to 3 weeks ahead). Red dates are booked by renters.
                </Text>
            </View>

            <View style={styles.legendContainer}>
                <View style={styles.legendItem}>
                    <View style={[styles.legendDot, { backgroundColor: '#ef4444' }]} />
                    <Text style={styles.legendText}>Booked</Text>
                </View>
                <View style={styles.legendItem}>
                    <View style={[styles.legendDot, { backgroundColor: '#4b5563' }]} />
                    <Text style={styles.legendText}>Blocked</Text>
                </View>
                <View style={styles.legendItem}>
                    <View style={[styles.legendDot, { backgroundColor: '#1a1a1a', borderWidth: 1, borderColor: '#333' }]} />
                    <Text style={styles.legendText}>Available</Text>
                </View>
            </View>

            <Calendar
                style={styles.calendar}
                theme={{
                    backgroundColor: '#0a0a0a',
                    calendarBackground: '#0a0a0a',
                    textSectionTitleColor: '#888',
                    selectedDayBackgroundColor: '#6366f1',
                    selectedDayTextColor: '#ffffff',
                    todayTextColor: '#6366f1',
                    dayTextColor: '#ffffff',
                    textDisabledColor: '#333',
                    dotColor: '#6366f1',
                    selectedDotColor: '#ffffff',
                    arrowColor: '#6366f1',
                    monthTextColor: '#ffffff',
                    indicatorColor: '#6366f1',
                }}
                onDayPress={handleDayPress}
                markedDates={markedDates}
                markingType={'period'}
                minDate={todayString}
                maxDate={maxDateString}
            />

            <View style={styles.footer}>
                <TouchableOpacity
                    style={[styles.saveButton, (!hasUnsavedChanges || isSaving) && styles.saveButtonDisabled]}
                    onPress={handleSave}
                    disabled={!hasUnsavedChanges || isSaving}
                >
                    {isSaving ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <Text style={styles.saveButtonText}>Save Changes</Text>
                    )}
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
        marginBottom: 8,
    },
    instructions: {
        fontSize: 14,
        color: '#888',
        lineHeight: 20,
    },
    legendContainer: {
        flexDirection: 'row',
        paddingHorizontal: 20,
        paddingBottom: 16,
    },
    legendItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginRight: 16,
    },
    legendDot: {
        width: 12,
        height: 12,
        borderRadius: 6,
        marginRight: 6,
    },
    legendText: {
        color: '#888',
        fontSize: 12,
    },
    calendar: {
        borderTopWidth: 1,
        borderBottomWidth: 1,
        borderColor: '#1a1a1a',
    },
    footer: {
        padding: 20,
        marginTop: 'auto',
    },
    saveButton: {
        backgroundColor: '#6366f1',
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
    },
    saveButtonDisabled: {
        backgroundColor: '#333',
    },
    saveButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
});
