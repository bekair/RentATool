import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    ActivityIndicator,
    Alert,
    RefreshControl,
    Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import api from '../api/client';

const BookingsScreen = ({ navigation }) => {
    const [viewMode, setViewMode] = useState('rentals'); // 'rentals' or 'requests'
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchBookings = async () => {
        if (!refreshing) setLoading(true);
        try {
            const endpoint = viewMode === 'rentals' ? '/bookings/renter' : '/bookings/owner';
            const response = await api.get(endpoint);
            setBookings(response.data);
        } catch (error) {
            console.error('Error fetching bookings:', error);
            Alert.alert('Error', 'Failed to load bookings');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        setBookings([]); // Clear list on mode switch to prevent crash
        const unsubscribe = navigation.addListener('focus', () => {
            fetchBookings();
        });
        fetchBookings(); // Fetch immediately when viewMode changes
        return unsubscribe;
    }, [navigation, viewMode]);

    const handleUpdateStatus = async (id, status) => {
        try {
            await api.patch(`/bookings/${id}/status`, { status });
            Alert.alert('Success', `Booking ${status.toLowerCase()} successfully`);
            fetchBookings();
        } catch (error) {
            Alert.alert('Error', 'Failed to update booking status');
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'PENDING': return '#6366f1';
            case 'APPROVED': return '#22c55e';
            case 'REJECTED': return '#ef4444';
            case 'CANCELLED': return '#888';
            case 'COMPLETED': return '#10b981';
            default: return '#fff';
        }
    };

    const renderBookingItem = ({ item }) => {
        const isRenting = viewMode === 'rentals';
        const otherPartyName = isRenting
            ? item.owner?.displayName || 'Unknown Owner'
            : item.renter?.displayName || 'Unknown Renter';

        return (
            <View style={styles.card}>
                <View style={styles.cardHeader}>
                    <View style={styles.toolIcon}>
                        <Ionicons name="build-outline" size={24} color="#6366f1" />
                    </View>
                    <View style={styles.headerInfo}>
                        <Text style={styles.toolName}>{item.tool.name}</Text>
                        <Text style={styles.otherParty}>
                            {isRenting ? 'From: ' : 'To: '}{otherPartyName}
                        </Text>
                    </View>
                    <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) + '20' }]}>
                        <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
                            {item.status}
                        </Text>
                    </View>
                </View>

                <View style={styles.divider} />

                <View style={styles.detailsRow}>
                    <View style={styles.dateInfo}>
                        <Text style={styles.dateLabel}>Start</Text>
                        <Text style={styles.dateValue}>{new Date(item.startDate).toLocaleDateString()}</Text>
                    </View>
                    <View style={styles.dateArrow}>
                        <Text style={{ color: '#666' }}>→</Text>
                    </View>
                    <View style={styles.dateInfo}>
                        <Text style={styles.dateLabel}>End</Text>
                        <Text style={styles.dateValue}>{new Date(item.endDate).toLocaleDateString()}</Text>
                    </View>
                    <View style={styles.priceInfo}>
                        <Text style={styles.priceLabel}>Total</Text>
                        <Text style={styles.priceValue}>€{item.totalPrice}</Text>
                    </View>
                </View>

                {!isRenting && item.status === 'PENDING' && (
                    <View style={styles.actions}>
                        <TouchableOpacity
                            style={[styles.actionButton, styles.rejectButton]}
                            onPress={() => handleUpdateStatus(item.id, 'REJECTED')}
                        >
                            <Text style={styles.rejectButtonText}>Decline</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.actionButton, styles.approveButton]}
                            onPress={() => handleUpdateStatus(item.id, 'APPROVED')}
                        >
                            <Text style={styles.approveButtonText}>Approve</Text>
                        </TouchableOpacity>
                    </View>
                )}

                {isRenting && item.status === 'PENDING' && (
                    <TouchableOpacity
                        style={styles.cancelLink}
                        onPress={() => handleUpdateStatus(item.id, 'CANCELLED')}
                    >
                        <Text style={styles.cancelLinkText}>Cancel Request</Text>
                    </TouchableOpacity>
                )}
            </View>
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.headerContainer}>
                <Text style={styles.screenTitle}>Bookings</Text>
                <View style={styles.segmentedControl}>
                    <TouchableOpacity
                        style={[styles.segment, viewMode === 'rentals' && styles.activeSegment]}
                        onPress={() => {
                            if (viewMode !== 'rentals') {
                                setBookings([]);
                                setViewMode('rentals');
                            }
                        }}
                    >
                        <Text style={[styles.segmentText, viewMode === 'rentals' && styles.activeSegmentText]}>
                            I'm Renting
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.segment, viewMode === 'requests' && styles.activeSegment]}
                        onPress={() => {
                            if (viewMode !== 'requests') {
                                setBookings([]);
                                setViewMode('requests');
                            }
                        }}
                    >
                        <Text style={[styles.segmentText, viewMode === 'requests' && styles.activeSegmentText]}>
                            My Tools
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>

            <FlatList
                data={bookings}
                renderItem={renderBookingItem}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.listContainer}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={() => {
                            setRefreshing(true);
                            fetchBookings();
                        }}
                        tintColor="#6366f1"
                        colors={['#6366f1']}
                        progressBackgroundColor="#1a1a1a"
                    />
                }
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Ionicons
                            name={viewMode === 'rentals' ? 'calendar-outline' : 'construct-outline'}
                            size={64}
                            color="#333"
                            style={{ marginBottom: 16 }}
                        />
                        <Text style={styles.emptyTitle}>
                            {viewMode === 'rentals' ? 'No Active Rentals' : 'No Booking Requests'}
                        </Text>
                        <Text style={styles.emptyText}>
                            {viewMode === 'rentals'
                                ? "You haven't rented any tools yet."
                                : "No one has requested your tools yet."}
                        </Text>
                        <View style={styles.pullToRefreshContainer}>
                            <Ionicons name="arrow-down" size={16} color="#6366f1" style={{ marginRight: 6 }} />
                            <Text style={styles.pullToRefreshText}>Pull down to refresh</Text>
                        </View>
                    </View>
                }
            />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0a0a0a',
    },
    headerContainer: {
        padding: 20,
        paddingBottom: 10,
    },
    screenTitle: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 20,
    },
    segmentedControl: {
        flexDirection: 'row',
        backgroundColor: '#1a1a1a',
        borderRadius: 12,
        padding: 4,
        height: 44,
    },
    segment: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 10,
    },
    activeSegment: {
        backgroundColor: '#333',
    },
    segmentText: {
        color: '#888',
        fontWeight: '600',
        fontSize: 14,
    },
    activeSegmentText: {
        color: '#fff',
        fontWeight: 'bold',
    },
    listContainer: {
        padding: 20,
        paddingTop: 10,
    },
    card: {
        backgroundColor: '#161616',
        borderRadius: 16,
        padding: 16,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#262626',
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    toolIcon: {
        width: 48,
        height: 48,
        borderRadius: 12,
        backgroundColor: 'rgba(99, 102, 241, 0.1)',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    headerInfo: {
        flex: 1,
    },
    toolName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 4,
    },
    otherParty: {
        fontSize: 12,
        color: '#888',
    },
    statusBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
    },
    statusText: {
        fontSize: 10,
        fontWeight: 'bold',
        textTransform: 'uppercase',
    },
    divider: {
        height: 1,
        backgroundColor: '#262626',
        marginBottom: 16,
    },
    detailsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    dateInfo: {
        alignItems: 'center',
    },
    dateArrow: {
        paddingHorizontal: 10,
    },
    dateLabel: {
        fontSize: 10,
        color: '#666',
        marginBottom: 2,
        textTransform: 'uppercase',
    },
    dateValue: {
        fontSize: 13,
        color: '#ccc',
        fontWeight: '500',
    },
    priceInfo: {
        alignItems: 'flex-end',
        borderLeftWidth: 1,
        borderLeftColor: '#262626',
        paddingLeft: 16,
    },
    priceLabel: {
        fontSize: 10,
        color: '#666',
        marginBottom: 2,
        textTransform: 'uppercase',
    },
    priceValue: {
        fontSize: 16,
        color: '#6366f1',
        fontWeight: 'bold',
    },
    actions: {
        flexDirection: 'row',
        gap: 12,
        marginTop: 4,
    },
    actionButton: {
        flex: 1,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    approveButton: {
        backgroundColor: '#22c55e',
    },
    rejectButton: {
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        borderWidth: 1,
        borderColor: '#ef4444',
    },
    approveButtonText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 14,
    },
    rejectButtonText: {
        color: '#ef4444',
        fontWeight: 'bold',
        fontSize: 14,
    },
    cancelLink: {
        alignSelf: 'center',
        paddingVertical: 8,
    },
    cancelLinkText: {
        color: '#666',
        fontSize: 12,
        textDecorationLine: 'underline',
    },
    emptyContainer: {
        marginTop: 60,
        alignItems: 'center',
        padding: 40,
        height: Dimensions.get('window').height * 0.7,
    },
    emptyTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#fff',
        marginTop: 10,
        marginBottom: 8,
    },
    emptyText: {
        color: '#888',
        fontSize: 15,
        textAlign: 'center',
        lineHeight: 22,
        marginBottom: 35,
    },
    pullToRefreshContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        opacity: 0.8,
    },
    pullToRefreshText: {
        color: '#6366f1',
        fontWeight: '600',
        fontSize: 14,
        letterSpacing: 0.5,
    },
});

export default BookingsScreen;
