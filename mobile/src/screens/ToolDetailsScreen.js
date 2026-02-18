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
    Image,
    Dimensions,
    StatusBar,
    Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import api from '../api/client';

const { width } = Dimensions.get('window');

const ToolDetailsScreen = ({ route, navigation }) => {
    const { toolId } = route.params;
    const [tool, setTool] = useState(null);
    const [loading, setLoading] = useState(true);
    const [bookingLoading, setBookingLoading] = useState(false);
    const [isFavorite, setIsFavorite] = useState(false);

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
                'Request Sent',
                'The owner has been notified. You can track this in your bookings.',
                [{ text: 'View Bookings', onPress: () => navigation.navigate('Bookings') }]
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
                <ActivityIndicator size="large" color="#FF385C" />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" transparent backgroundColor="transparent" />

            {/* Custom Header overlay */}
            <View style={styles.headerFloating}>
                <TouchableOpacity style={styles.iconButton} onPress={() => navigation.goBack()}>
                    <Ionicons name="chevron-back" size={24} color="#222" />
                </TouchableOpacity>
                <View style={styles.headerRight}>
                    <TouchableOpacity style={styles.iconButton}>
                        <Ionicons name="share-outline" size={22} color="#222" />
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.iconButton}
                        onPress={() => setIsFavorite(!isFavorite)}
                    >
                        <Ionicons
                            name={isFavorite ? "heart" : "heart-outline"}
                            size={22}
                            color={isFavorite ? "#FF385C" : "#222"}
                        />
                    </TouchableOpacity>
                </View>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent} bounces={false}>
                {/* Hero Image */}
                <View style={styles.heroImageContainer}>
                    <View style={styles.imagePlaceholder}>
                        <Ionicons name="construct" size={60} color="#ddd" />
                        <Text style={styles.imagePlaceholderText}>Professional Tool Imagery</Text>
                    </View>
                    <View style={styles.counterBadge}>
                        <Text style={styles.counterText}>1 / 5</Text>
                    </View>
                </View>

                {/* Main Content */}
                <View style={styles.content}>
                    <Text style={styles.toolName}>{tool.name}</Text>

                    <View style={styles.ratingRow}>
                        <Ionicons name="star" size={16} color="#222" />
                        <Text style={styles.ratingText}> 4.91 · </Text>
                        <TouchableOpacity>
                            <Text style={styles.reviewsText}>98 reviews</Text>
                        </TouchableOpacity>
                        <Text style={styles.locationText}> · Brussels, Belgium</Text>
                    </View>

                    <View style={styles.divider} />

                    {/* Owner / Host section */}
                    <View style={styles.hostRow}>
                        <View style={styles.hostInfo}>
                            <Text style={styles.hostTitle}>Tool hosted by {tool.owner.displayName}</Text>
                            <Text style={styles.hostSub}>Joined in 2023</Text>
                        </View>
                        <View style={styles.hostAvatar}>
                            <Text style={styles.avatarText}>{tool.owner.displayName[0]}</Text>
                            <View style={styles.verifiedBadge}>
                                <Ionicons name="checkmark" size={10} color="#fff" />
                            </View>
                        </View>
                    </View>

                    <View style={styles.divider} />

                    <View style={styles.highlightRow}>
                        <Ionicons name="shield-checkmark-outline" size={26} color="#222" />
                        <View style={styles.highlightTextWrapper}>
                            <Text style={styles.highlightTitle}>Fully Insured</Text>
                            <Text style={styles.highlightSub}>Covered against damage and theft for peace of mind.</Text>
                        </View>
                    </View>
                    <View style={styles.highlightRow}>
                        <Ionicons name="location-outline" size={26} color="#222" />
                        <View style={styles.highlightTextWrapper}>
                            <Text style={styles.highlightTitle}>Great location</Text>
                            <Text style={styles.highlightSub}>95% of recent renters gave the location a 5-star rating.</Text>
                        </View>
                    </View>

                    <View style={styles.divider} />

                    {/* Description */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>About this tool</Text>
                        <Text style={styles.descriptionText}>{tool.description}</Text>
                        <TouchableOpacity style={styles.showMore}>
                            <Text style={styles.showMoreText}>Show more </Text>
                            <Ionicons name="chevron-forward" size={14} color="#222" />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.divider} />

                    {/* Condition & Specs */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Specifications</Text>
                        <View style={styles.specRow}>
                            <Text style={styles.specLabel}>Category</Text>
                            <Text style={styles.specValue}>{tool.category}</Text>
                        </View>
                        <View style={styles.specRow}>
                            <Text style={styles.specLabel}>Condition</Text>
                            <Text style={styles.specValue}>{tool.condition || 'Excelllent'}</Text>
                        </View>
                        <View style={styles.specRow}>
                            <Text style={styles.specLabel}>Replacement Value</Text>
                            <Text style={styles.specValue}>€{tool.replacementValue || 'N/A'}</Text>
                        </View>
                    </View>
                </View>
            </ScrollView>

            {/* Bottom Sticky Footer */}
            <SafeAreaView style={styles.footer}>
                <View style={styles.footerContent}>
                    <View style={styles.priceContainer}>
                        <Text style={styles.footerPrice}>€{tool.pricePerDay} <Text style={styles.footerDay}>day</Text></Text>
                        <TouchableOpacity>
                            <Text style={styles.availabilityLink}>Check availability</Text>
                        </TouchableOpacity>
                    </View>
                    <TouchableOpacity
                        style={[styles.reserveButton, bookingLoading && styles.disabledButton]}
                        onPress={handleRent}
                        disabled={bookingLoading}
                    >
                        {bookingLoading ? (
                            <ActivityIndicator color="#fff" />
                        ) : (
                            <Text style={styles.reserveButtonText}>Reserve</Text>
                        )}
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fff',
    },
    headerFloating: {
        position: 'absolute',
        top: Platform.OS === 'ios' ? 50 : 30,
        left: 0,
        right: 0,
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        zIndex: 100,
    },
    headerRight: {
        flexDirection: 'row',
        gap: 15,
    },
    iconButton: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: '#fff',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 4,
    },
    scrollContent: {
        paddingBottom: 120,
    },
    heroImageContainer: {
        width: width,
        height: 300,
        backgroundColor: '#f7f7f7',
    },
    imagePlaceholder: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    imagePlaceholderText: {
        marginTop: 10,
        color: '#666',
        fontSize: 14,
        fontWeight: '500',
    },
    counterBadge: {
        position: 'absolute',
        bottom: 20,
        right: 20,
        backgroundColor: 'rgba(0,0,0,0.7)',
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 4,
    },
    counterText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: '600',
    },
    content: {
        padding: 24,
    },
    toolName: {
        fontSize: 26,
        fontWeight: '600',
        color: '#222',
        marginBottom: 8,
    },
    ratingRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    ratingText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#222',
    },
    reviewsText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#222',
        textDecorationLine: 'underline',
    },
    locationText: {
        fontSize: 14,
        color: '#222',
    },
    divider: {
        height: 1,
        backgroundColor: '#ebebeb',
        marginVertical: 24,
    },
    hostRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    hostInfo: {
        flex: 1,
    },
    hostTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#222',
        marginBottom: 4,
    },
    hostSub: {
        fontSize: 14,
        color: '#717171',
    },
    hostAvatar: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: '#222',
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarText: {
        color: '#fff',
        fontSize: 22,
        fontWeight: 'bold',
    },
    verifiedBadge: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        backgroundColor: '#00bfa5',
        width: 18,
        height: 18,
        borderRadius: 9,
        borderWidth: 2,
        borderColor: '#fff',
        justifyContent: 'center',
        alignItems: 'center',
    },
    highlightRow: {
        flexDirection: 'row',
        marginBottom: 24,
    },
    highlightTextWrapper: {
        marginLeft: 16,
        flex: 1,
    },
    highlightTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#222',
        marginBottom: 4,
    },
    highlightSub: {
        fontSize: 14,
        color: '#717171',
    },
    section: {
        marginBottom: 10,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#222',
        marginBottom: 16,
    },
    descriptionText: {
        fontSize: 16,
        color: '#222',
        lineHeight: 24,
    },
    showMore: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 16,
    },
    showMoreText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#222',
        textDecorationLine: 'underline',
    },
    specRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    specLabel: {
        fontSize: 16,
        color: '#717171',
    },
    specValue: {
        fontSize: 16,
        color: '#222',
        fontWeight: '500',
    },
    footer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: '#fff',
        borderTopWidth: 1,
        borderTopColor: '#ebebeb',
    },
    footerContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 24,
        paddingTop: 12,
        paddingBottom: Platform.OS === 'ios' ? 0 : 12,
    },
    priceContainer: {
        flexDirection: 'column',
    },
    footerPrice: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#222',
    },
    footerDay: {
        fontSize: 16,
        fontWeight: 'normal',
        color: '#222',
    },
    availabilityLink: {
        fontSize: 14,
        fontWeight: '600',
        color: '#222',
        textDecorationLine: 'underline',
        marginTop: 2,
    },
    reserveButton: {
        backgroundColor: '#FF385C',
        paddingHorizontal: 24,
        paddingVertical: 14,
        borderRadius: 8,
        minWidth: 120,
        alignItems: 'center',
    },
    reserveButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    disabledButton: {
        opacity: 0.7,
    },
});

export default ToolDetailsScreen;
