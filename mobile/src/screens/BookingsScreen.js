import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    ActivityIndicator,
    SafeAreaView,
    Alert,
} from 'react-native';
import api from '../api/client';

const BookingsScreen = ({ navigation }) => {
    const [viewMode, setViewMode] = useState('rentals'); // 'rentals' or 'requests'
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchBookings = async () => {
        setLoading(true);
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
        const unsubscribe = navigation.addListener('focus', () => {
            fetchBookings();
        });
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

    const renderBookingItem = ({ item }) => (
        <View style={styles.card}>
            <View style={styles.cardHeader}>
                <Text style={styles.toolName}>{item.tool.name}</Text>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) + '20' }]}>
                    <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>{item.status}</Text>
                </View>
            </View>

            <View style={styles.details}>
                <Text style={styles.detailText}>
                    📅 {new Date(item.startDate).toLocaleDateString()} - {new Date(item.endDate).toLocaleDateString()}
                </Text>
                <Text style={styles.detailText}>
                    👤 {viewMode === 'rentals' ? `Owner: ${item.owner.displayName}` : `Renter: ${item.renter.displayName}`}
                </Text>
                <Text style={styles.price}>Total: €{item.totalPrice}</Text>
            </View>

            {viewMode === 'requests' && item.status === 'PENDING' && (
                <View style={styles.actions}>
                    <TouchableOpacity
                        style={[styles.actionButton, styles.approveButton]}
                        onPress={() => handleUpdateStatus(item.id, 'APPROVED')}
                    >
                        <Text style={styles.approveButtonText}>Approve</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.actionButton, styles.rejectButton]}
                        onPress={() => handleUpdateStatus(item.id, 'REJECTED')}
                    >
                        <Text style={styles.rejectButtonText}>Reject</Text>
                    </TouchableOpacity>
                </View>
            )}

            {item.status === 'PENDING' && viewMode === 'rentals' && (
                <TouchableOpacity
                    style={styles.cancelButton}
                    onPress={() => handleUpdateStatus(item.id, 'CANCELLED')}
                >
                    <Text style={styles.cancelButtonText}>Cancel Request</Text>
                </TouchableOpacity>
            )}
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.tabHeader}>
                <TouchableOpacity
                    style={[styles.tab, viewMode === 'rentals' && styles.activeTab]}
                    onPress={() => setViewMode('rentals')}
                >
                    <Text style={[styles.tabText, viewMode === 'rentals' && styles.activeTabText]}>My Rentals</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.tab, viewMode === 'requests' && styles.activeTab]}
                    onPress={() => setViewMode('requests')}
                >
                    <Text style={[styles.tabText, viewMode === 'requests' && styles.activeTabText]}>Requests</Text>
                </TouchableOpacity>
            </View>

            <FlatList
                data={bookings}
                renderItem={renderBookingItem}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.listContainer}
                onRefresh={() => fetchBookings()}
                refreshing={refreshing}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Text style={styles.emptyText}>No {viewMode} found.</Text>
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
    tabHeader: {
        flexDirection: 'row',
        padding: 15,
        backgroundColor: '#1a1a1a',
    },
    tab: {
        flex: 1,
        paddingVertical: 10,
        alignItems: 'center',
        borderRadius: 8,
    },
    activeTab: {
        backgroundColor: '#6366f1',
    },
    tabText: {
        color: '#888',
        fontWeight: 'bold',
        fontSize: 14,
    },
    activeTabText: {
        color: '#fff',
    },
    listContainer: {
        padding: 15,
    },
    card: {
        backgroundColor: '#1a1a1a',
        borderRadius: 16,
        padding: 15,
        marginBottom: 15,
        borderWidth: 1,
        borderColor: '#2a2a2a',
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    toolName: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#fff',
        flex: 1,
    },
    statusBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
    },
    statusText: {
        fontSize: 10,
        fontWeight: 'bold',
    },
    details: {
        marginBottom: 15,
    },
    detailText: {
        color: '#888',
        fontSize: 14,
        marginBottom: 4,
    },
    price: {
        color: '#6366f1',
        fontWeight: 'bold',
        fontSize: 16,
        marginTop: 4,
    },
    actions: {
        flexDirection: 'row',
        gap: 10,
    },
    actionButton: {
        flex: 1,
        paddingVertical: 10,
        borderRadius: 8,
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
    },
    rejectButtonText: {
        color: '#ef4444',
        fontWeight: 'bold',
    },
    cancelButton: {
        paddingVertical: 10,
        borderRadius: 8,
        alignItems: 'center',
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderColor: '#444',
    },
    cancelButtonText: {
        color: '#888',
        fontWeight: 'bold',
    },
    emptyContainer: {
        marginTop: 100,
        alignItems: 'center',
    },
    emptyText: {
        color: '#888',
        fontSize: 16,
    },
});

export default BookingsScreen;
