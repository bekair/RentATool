import React, { useState, useEffect } from 'react';
import {
    View,
    StyleSheet,
    Dimensions,
    ActivityIndicator,
    Text,
    TextInput,
    TouchableOpacity,
    Platform,
    Image,
} from 'react-native';
import MapView, { Marker, Callout } from 'react-native-maps';
import * as Location from 'expo-location';
import { Ionicons } from '@expo/vector-icons';
import api from '../api/client';

const MapScreen = ({ navigation }) => {
    const [location, setLocation] = useState(null);
    const [errorMsg, setErrorMsg] = useState(null);
    const [loading, setLoading] = useState(true);
    const [tools, setTools] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [filters, setFilters] = useState({ maxPrice: null, category: null });
    const [showFilters, setShowFilters] = useState(false);

    useEffect(() => {
        (async () => {
            let { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                setErrorMsg('Permission to access location was denied');
                setLoading(false);
                return;
            }

            let location = await Location.getCurrentPositionAsync({});
            setLocation(location);
            fetchTools(); // Fetch tools after getting location
        })();
    }, []);

    const fetchTools = async () => {
        try {
            const response = await api.get('/tools');
            // Filter out tools without coordinates
            const validTools = response.data.filter(t => t.latitude && t.longitude);
            setTools(validTools);
        } catch (err) {
            console.error('Error fetching map tools:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = () => {
        // Implement client-side filtering for now
        // In a real app, this would be a backend query with ?q=...
        fetchTools();
    };

    const filteredTools = tools.filter(tool => {
        const matchesSearch = tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            tool.description.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesPrice = filters.maxPrice ? tool.pricePerDay <= filters.maxPrice : true;
        // Add category match if we implement category filter UI
        return matchesSearch && matchesPrice;
    });

    if (loading) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" color="#6366f1" />
                <Text style={styles.loadingText}>Locating you...</Text>
            </View>
        );
    }

    if (errorMsg) {
        return (
            <View style={styles.center}>
                <Text style={styles.errorText}>{errorMsg}</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <MapView
                style={styles.map}
                initialRegion={{
                    latitude: location ? location.coords.latitude : 50.8503,
                    longitude: location ? location.coords.longitude : 4.3517,
                    latitudeDelta: 0.0922,
                    longitudeDelta: 0.0421,
                }}
                showsUserLocation={true}
            >
                {filteredTools.map((tool) => (
                    <Marker
                        key={tool.id}
                        coordinate={{ latitude: tool.latitude, longitude: tool.longitude }}
                        pinColor="#6366f1"
                    >
                        <Callout onPress={() => navigation.navigate('ToolDetails', { toolId: tool.id })}>
                            <View style={styles.callout}>
                                <Text style={styles.calloutTitle}>{tool.name}</Text>
                                <Text style={styles.calloutPrice}>€{tool.pricePerDay}/day</Text>
                                <Text style={styles.calloutMore}>Tap for details</Text>
                            </View>
                        </Callout>
                    </Marker>
                ))}
            </MapView>

            <View style={styles.searchContainer}>
                <View style={styles.searchBar}>
                    <Ionicons name="search" size={20} color="#666" style={{ marginRight: 8 }} />
                    <TextInput
                        placeholder="Search for tools..."
                        placeholderTextColor="#666"
                        style={styles.searchInput}
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                        returnKeyType="search"
                    />
                </View>
                <TouchableOpacity
                    style={[styles.filterButton, showFilters && styles.filterButtonActive]}
                    onPress={() => setShowFilters(!showFilters)}
                >
                    <Ionicons name="options" size={24} color={showFilters ? "#fff" : "#333"} />
                </TouchableOpacity>
            </View>

            {showFilters && (
                <View style={styles.filterContainer}>
                    <Text style={styles.filterTitle}>Max Price: €{filters.maxPrice || 'Any'}</Text>
                    <View style={styles.priceButtons}>
                        {[10, 20, 50, 100].map(price => (
                            <TouchableOpacity
                                key={price}
                                style={[styles.priceChip, filters.maxPrice === price && styles.priceChipActive]}
                                onPress={() => setFilters({ ...filters, maxPrice: filters.maxPrice === price ? null : price })}
                            >
                                <Text style={[styles.priceChipText, filters.maxPrice === price && styles.priceChipTextActive]}>
                                    €{price}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    map: {
        width: Dimensions.get('window').width,
        height: Dimensions.get('window').height,
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        marginTop: 10,
        color: '#666',
    },
    errorText: {
        color: 'red',
        fontSize: 16,
    },
    searchContainer: {
        position: 'absolute',
        top: Platform.OS === 'ios' ? 60 : 40,
        left: 20,
        right: 20,
        flexDirection: 'row',
        alignItems: 'center',
        zIndex: 1,
    },
    searchBar: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        borderRadius: 12,
        paddingHorizontal: 15,
        height: 50,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
        marginRight: 10,
    },
    searchInput: {
        flex: 1,
        fontSize: 16,
        color: '#333',
    },
    filterButton: {
        width: 50,
        height: 50,
        backgroundColor: '#fff',
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    filterButtonActive: {
        backgroundColor: '#6366f1',
    },
    filterContainer: {
        position: 'absolute',
        top: Platform.OS === 'ios' ? 120 : 100,
        left: 20,
        right: 20,
        backgroundColor: '#fff',
        borderRadius: 15,
        padding: 15,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
        zIndex: 1,
    },
    filterTitle: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 10,
    },
    priceButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    priceChip: {
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 20,
        backgroundColor: '#f3f4f6',
        borderWidth: 1,
        borderColor: '#e5e7eb',
    },
    priceChipActive: {
        backgroundColor: '#6366f1',
        borderColor: '#6366f1',
    },
    priceChipText: {
        fontSize: 14,
        color: '#4b5563',
    },
    priceChipTextActive: {
        color: '#fff',
        fontWeight: 'bold',
    },
    callout: {
        width: 150,
        padding: 5,
        alignItems: 'center',
    },
    calloutTitle: {
        fontWeight: 'bold',
        fontSize: 16,
        marginBottom: 2,
    },
    calloutPrice: {
        color: '#6366f1',
        fontWeight: 'bold',
    },
    calloutMore: {
        fontSize: 10,
        color: '#888',
        marginTop: 2,
    },
});

export default MapScreen;
