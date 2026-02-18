import React, { useState, useEffect, useRef } from 'react';
import {
    View,
    StyleSheet,
    Dimensions,
    ActivityIndicator,
    Text,
    TextInput,
    TouchableOpacity,
    Platform,
    ScrollView,
} from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import { Ionicons } from '@expo/vector-icons';
import api from '../api/client';

const { width } = Dimensions.get('window');

const MapScreen = ({ navigation }) => {
    const mapRef = useRef(null);
    const [location, setLocation] = useState(null);
    const [loading, setLoading] = useState(true);
    const [tools, setTools] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedTool, setSelectedTool] = useState(null);
    const [markersReady, setMarkersReady] = useState(false);
    const [priceFilter, setPriceFilter] = useState('all'); // 'all', 'low', 'mid', 'high'

    // Force markers to re-render after a delay to replace default pins on Android
    useEffect(() => {
        const timer = setTimeout(() => {
            setMarkersReady(true);
        }, 1500);
        return () => clearTimeout(timer);
    }, []);

    useEffect(() => {
        (async () => {
            let { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                setLoading(false);
                return;
            }
            let loc = await Location.getCurrentPositionAsync({});
            setLocation(loc);
            fetchTools();
        })();
    }, []);

    const fetchTools = async () => {
        try {
            const response = await api.get('/tools');
            const validTools = response.data.filter(t => t.latitude && t.longitude);
            setTools(validTools);
            if (validTools.length > 0 && mapRef.current) {
                setTimeout(() => {
                    mapRef.current?.fitToCoordinates(
                        validTools.map(t => ({ latitude: t.latitude, longitude: t.longitude })),
                        { edgePadding: { top: 150, right: 80, bottom: 300, left: 80 }, animated: true }
                    );
                }, 500);
            }
        } catch (err) {
            console.error('[Map] fetch error:', err);
        } finally {
            setLoading(false);
        }
    };

    const filteredTools = tools.filter(tool => {
        const matchesSearch = tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            tool.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            tool.category.toLowerCase().includes(searchQuery.toLowerCase());

        let matchesPrice = true;
        if (priceFilter === 'low') matchesPrice = tool.pricePerDay < 20;
        else if (priceFilter === 'mid') matchesPrice = tool.pricePerDay >= 20 && tool.pricePerDay <= 50;
        else if (priceFilter === 'high') matchesPrice = tool.pricePerDay > 50;

        return matchesSearch && matchesPrice;
    });

    if (loading) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" color="#222" />
                <Text style={styles.loadingText}>Loading map...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <MapView
                ref={mapRef}
                style={styles.map}
                initialRegion={{
                    latitude: location?.coords.latitude ?? 50.8503,
                    longitude: location?.coords.longitude ?? 4.3517,
                    latitudeDelta: 0.05,
                    longitudeDelta: 0.05,
                }}
                showsUserLocation
                onPress={() => setSelectedTool(null)}
            >
                {filteredTools.map((tool) => {
                    const isSelected = selectedTool?.id === tool.id;
                    return (
                        <Marker
                            key={`${tool.id}-${isSelected}`}
                            coordinate={{ latitude: tool.latitude, longitude: tool.longitude }}
                            onPress={(e) => {
                                if (Platform.OS === 'ios') e.stopPropagation();
                                setSelectedTool(tool);
                            }}
                            // Android needs this to be true more often for custom markers to show up
                            tracksViewChanges={Platform.OS === 'android' ? true : (!markersReady || isSelected)}
                            zIndex={isSelected ? 99 : 1}
                            anchor={{ x: 0.5, y: 0.5 }}
                            tappable={true}
                        >
                            <View
                                collapsable={false}
                                pointerEvents={Platform.OS === 'ios' ? 'none' : 'auto'}
                                style={[
                                    styles.pricePill,
                                    isSelected && styles.pricePillSelected,
                                ]}
                            >
                                <Text
                                    style={[
                                        styles.pricePillText,
                                        isSelected && styles.pricePillTextSelected,
                                    ]}
                                >
                                    €{Math.round(tool.pricePerDay)}
                                </Text>
                            </View>
                        </Marker>
                    );
                })}
            </MapView>

            {/* Search and Filters */}
            <View style={styles.searchRow}>
                <View style={styles.searchBar}>
                    <Ionicons name="search" size={20} color="#FF385C" style={{ marginRight: 10 }} />
                    <TextInput
                        placeholder="Search for tools..."
                        placeholderTextColor="#717171"
                        style={styles.searchInput}
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                    />
                    <TouchableOpacity style={styles.filterMenuIcon}>
                        <Ionicons name="options-outline" size={20} color="#222" />
                    </TouchableOpacity>
                </View>

                {/* Horizontal Price Filters */}
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    style={styles.filterScroll}
                    contentContainerStyle={styles.filterContent}
                >
                    {[
                        { id: 'all', label: 'All prices' },
                        { id: 'low', label: '< €20' },
                        { id: 'mid', label: '€20 - €50' },
                        { id: 'high', label: '> €50' },
                    ].map((f) => (
                        <TouchableOpacity
                            key={f.id}
                            onPress={() => setPriceFilter(f.id)}
                            style={[
                                styles.filterPill,
                                priceFilter === f.id && styles.filterPillActive
                            ]}
                        >
                            <Text style={[
                                styles.filterPillText,
                                priceFilter === f.id && styles.filterPillTextActive
                            ]}>
                                {f.label}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>

            {selectedTool && (
                <View style={styles.card}>
                    {/* Image area with carousel dots and heart */}
                    <View style={styles.cardImageContainer}>
                        <View style={styles.cardImagePlaceholder}>
                            <Ionicons name="construct-outline" size={40} color="#ccc" />
                        </View>

                        {/* Status/Heart icons top row */}
                        <View style={styles.cardImageTopRow}>
                            <View style={styles.guestFavoriteBadge}>
                                <Text style={styles.guestFavoriteText}>Guest favorite</Text>
                            </View>
                            <TouchableOpacity style={styles.heartButton}>
                                <Ionicons name="heart-outline" size={24} color="#fff" />
                            </TouchableOpacity>
                        </View>

                        {/* Carousel Dots */}
                        <View style={styles.carouselDots}>
                            <View style={[styles.dot, styles.dotActive]} />
                            <View style={styles.dot} />
                            <View style={styles.dot} />
                            <View style={styles.dot} />
                            <View style={styles.dot} />
                        </View>
                    </View>

                    {/* Info area */}
                    <TouchableOpacity
                        style={styles.cardBody}
                        activeOpacity={0.9}
                        onPress={() => navigation.navigate('ToolDetails', { toolId: selectedTool.id })}
                    >
                        <View style={styles.cardRatingRow}>
                            <Ionicons name="star" size={14} color="#ffb400" />
                            <Text style={styles.cardRatingText}> 4.91 (98)</Text>
                        </View>
                        <Text style={styles.cardCategoryText}>{selectedTool.category} in Brussels</Text>
                        <Text style={styles.cardNameText} numberOfLines={1}>{selectedTool.name}</Text>
                        <Text style={styles.cardPriceLine}>
                            <Text style={styles.cardPriceValue}>€{selectedTool.pricePerDay}</Text>
                            <Text style={styles.cardPriceUnit}> / day</Text>
                        </Text>
                    </TouchableOpacity>

                    {/* Subtle close button if map tap isn't enough */}
                    <TouchableOpacity
                        style={styles.cardCloseX}
                        onPress={() => setSelectedTool(null)}
                    >
                        <Ionicons name="close" size={20} color="#222" />
                    </TouchableOpacity>
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1 },
    map: { width: '100%', height: '100%' },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    loadingText: { marginTop: 12, color: '#555', fontSize: 14 },

    // ── Price Bubbles ────────────────────────────────────────────────────────
    pricePill: {
        backgroundColor: '#fff',
        borderRadius: 20,
        borderWidth: 1.5,
        borderColor: '#ddd',
        paddingHorizontal: 10,
        paddingVertical: 5,
        minWidth: 70, // Critical to avoid horizontal clipping
        alignItems: 'center',
        justifyContent: 'center',
        elevation: 3,
    },
    pricePillSelected: {
        backgroundColor: '#222',
        borderColor: '#222',
    },
    pricePillText: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#222',
        textAlign: 'center',
    },
    pricePillTextSelected: {
        color: '#fff',
    },

    // ── Search bar ────────────────────────────────────────────────────────────
    searchRow: {
        position: 'absolute',
        top: Platform.OS === 'ios' ? 50 : 30,
        left: 0,
        right: 0,
        zIndex: 10,
    },
    searchBar: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        borderRadius: 32,
        marginHorizontal: 20,
        paddingHorizontal: 20,
        height: 56,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 8,
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: '#ddd',
    },
    searchInput: {
        flex: 1,
        fontSize: 14,
        fontWeight: '500',
        color: '#222'
    },
    filterMenuIcon: {
        padding: 8,
        borderLeftWidth: 1,
        borderLeftColor: '#eee',
        marginLeft: 10,
    },
    filterScroll: {
        marginTop: 12,
    },
    filterContent: {
        paddingHorizontal: 20,
        gap: 8,
    },
    filterPill: {
        backgroundColor: '#fff',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#ddd',
        height: 36,
        justifyContent: 'center',
    },
    filterPillActive: {
        backgroundColor: '#222',
        borderColor: '#222',
    },
    filterPillText: {
        fontSize: 13,
        fontWeight: '600',
        color: '#222',
    },
    filterPillTextActive: {
        color: '#fff',
    },

    // ── Airbnb detail card ────────────────────────────────────────────────────
    card: {
        position: 'absolute',
        bottom: 100,
        left: 20,
        right: 20,
        backgroundColor: '#fff',
        borderRadius: 16,
        overflow: 'hidden',
        zIndex: 100, // Critical for iOS visibility
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.15,
        shadowRadius: 20,
        elevation: 12,
    },
    cardImageContainer: {
        height: 180,
        backgroundColor: '#f5f5f5',
    },
    cardImagePlaceholder: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    cardImageTopRow: {
        position: 'absolute',
        top: 15,
        left: 15,
        right: 15,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    guestFavoriteBadge: {
        backgroundColor: '#fff',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    guestFavoriteText: {
        fontSize: 12,
        fontWeight: '700',
        color: '#222',
    },
    heartButton: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.5,
        shadowRadius: 4,
    },
    carouselDots: {
        position: 'absolute',
        bottom: 15,
        width: '100%',
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 6,
    },
    dot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: 'rgba(255,255,255,0.6)',
    },
    dotActive: {
        backgroundColor: '#fff',
    },
    cardBody: {
        padding: 16,
    },
    cardRatingRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 6,
    },
    cardRatingText: {
        fontSize: 14,
        color: '#222',
        fontWeight: '500',
    },
    cardCategoryText: {
        fontSize: 15,
        color: '#717171',
        marginBottom: 4,
    },
    cardNameText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#222',
        marginBottom: 8,
    },
    cardPriceLine: {
        fontSize: 16,
        color: '#222',
    },
    cardPriceValue: {
        fontWeight: 'bold',
    },
    cardPriceUnit: {
        color: '#717171',
        fontWeight: '300',
    },
    cardCloseX: {
        position: 'absolute',
        top: 10,
        right: 10,
        backgroundColor: 'rgba(255,255,255,0.9)',
        width: 30,
        height: 30,
        borderRadius: 15,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 4,
    },
});

export default MapScreen;
