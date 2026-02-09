import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    ActivityIndicator,
    Alert,
    SafeAreaView,
} from 'react-native';
import api from '../api/client';

const ToolDetailsScreen = ({ route, navigation }) => {
    const { toolId } = route.params;
    const [tool, setTool] = useState(null);
    const [loading, setLoading] = useState(true);
    const [bookingLoading, setBookingLoading] = useState(false);

    useEffect(() => {
        const fetchTool = async () => {
            try {
                const response = await api.get(`/tools/${toolId}`);
                setTool(response.data);
            } catch (error) {
                console.error('Error fetching tool details:', error);
                Alert.alert('Error', 'Failed to load tool details');
                navigation.goBack();
            } finally {
                setLoading(false);
            }
        };

        fetchTool();
    }, [toolId]);

    const handleRent = async () => {
        setBookingLoading(true);
        try {
            // Simple logic: Rent for tomorrow (1 day) for MVP
            const today = new Date();
            const tomorrow = new Date(today);
            tomorrow.setDate(tomorrow.getDate() + 1);

            const nextDay = new Date(tomorrow);
            nextDay.setDate(nextDay.getDate() + 1);

            await api.post('/bookings', {
                toolId,
                startDate: tomorrow.toISOString(),
                endDate: nextDay.toISOString(),
                totalPrice: tool.pricePerDay,
            });

            Alert.alert(
                'Success',
                'Rental request sent to owner!',
                [{ text: 'View My Rentals', onPress: () => navigation.navigate('My Tools') }] // Will update to Bookings tab
            );
        } catch (error) {
            Alert.alert('Error', error.response?.data?.message || 'Failed to send rental request');
        } finally {
            setBookingLoading(false);
        }
    };

    if (loading) {
        return (
            <View style={styles.centerContainer}>
                <ActivityIndicator size="large" color="#6366f1" />
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Text style={styles.backButton}>Back</Text>
                </TouchableOpacity>
                <Text style={styles.title}>Tool Details</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={styles.imagePlaceholder}>
                    <Text style={styles.imagePlaceholderText}>No Image</Text>
                </View>

                <View style={styles.content}>
                    <View style={styles.mainInfo}>
                        <View>
                            <Text style={styles.toolName}>{tool.name}</Text>
                            <Text style={styles.category}>{tool.category}</Text>
                        </View>
                        <Text style={styles.price}>€{tool.pricePerDay}<Text style={styles.perDay}>/day</Text></Text>
                    </View>

                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Description</Text>
                        <Text style={styles.description}>{tool.description}</Text>
                    </View>

                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Owner Info</Text>
                        <View style={styles.ownerCard}>
                            <View style={styles.ownerAvatar}>
                                <Text style={styles.avatarText}>{tool.owner.displayName[0]}</Text>
                            </View>
                            <View>
                                <Text style={styles.ownerName}>{tool.owner.displayName}</Text>
                                <Text style={styles.ownerStatus}>
                                    {tool.owner.verificationTier === 'UNVERIFIED' ? 'Unverified' : 'Verified Owner'}
                                </Text>
                            </View>
                        </View>
                    </View>
                </View>
            </ScrollView>

            <View style={styles.footer}>
                <TouchableOpacity
                    style={[styles.rentButton, bookingLoading && styles.disabledButton]}
                    onPress={handleRent}
                    disabled={bookingLoading}
                >
                    {bookingLoading ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <Text style={styles.rentButtonText}>Request to Rent</Text>
                    )}
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0a0a0a',
    },
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#0a0a0a',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 15,
    },
    backButton: {
        color: '#6366f1',
        fontSize: 16,
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#ffffff',
    },
    scrollContent: {
        paddingBottom: 100,
    },
    imagePlaceholder: {
        height: 250,
        backgroundColor: '#1a1a1a',
        justifyContent: 'center',
        alignItems: 'center',
    },
    imagePlaceholderText: {
        color: '#444',
        fontSize: 18,
    },
    content: {
        padding: 20,
    },
    mainInfo: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 24,
    },
    toolName: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 4,
    },
    category: {
        fontSize: 14,
        color: '#6366f1',
        fontWeight: '600',
    },
    price: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#6366f1',
    },
    perDay: {
        fontSize: 14,
        color: '#888',
        fontWeight: 'normal',
    },
    section: {
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 12,
    },
    description: {
        fontSize: 16,
        color: '#aaa',
        lineHeight: 24,
    },
    ownerCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#1a1a1a',
        padding: 15,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#2a2a2a',
    },
    ownerAvatar: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: '#6366f1',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 15,
    },
    avatarText: {
        color: '#fff',
        fontSize: 20,
        fontWeight: 'bold',
    },
    ownerName: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    ownerStatus: {
        color: '#888',
        fontSize: 12,
    },
    footer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        padding: 20,
        backgroundColor: '#0a0a0a',
        borderTopWidth: 1,
        borderTopColor: '#1a1a1a',
    },
    rentButton: {
        backgroundColor: '#6366f1',
        padding: 18,
        borderRadius: 12,
        alignItems: 'center',
    },
    disabledButton: {
        opacity: 0.7,
    },
    rentButtonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
});

export default ToolDetailsScreen;
