/**
 * MapScreen.ios.js — Dual static marker approach.
 *
 * PROBLEM: iOS MKAnnotationView uses a bitmap snapshot of the React subview.
 * When the view style changes (selected ↔ unselected), the snapshot goes stale
 * and cannot be reliably refreshed without a map animation to trigger a redraw.
 *
 * SOLUTION: Mount TWO Markers per tool from the start:
 *   • "${id}-nrm"  → always white pill   → opacity 0 when selected, 1 otherwise
 *   • "${id}-sel"  → always dark pill    → opacity 1 when selected, 0 otherwise
 *
 * Keys are PERMANENT so markers never remount → no pool rescans, no blank views.
 * Styles are FIXED so the snapshot taken at mount is always correct.
 * Only opacity changes, which goes directly to MKAnnotationView.alpha (native layer)
 * and does NOT trigger a re-snapshot.
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import {
    View, ActivityIndicator, Text, TextInput,
    TouchableOpacity, ScrollView,
} from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import { Ionicons } from '@expo/vector-icons';
import api from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import darkMapStyle from '../../constants/darkMapStyle';
import styles from './MapScreen.ios.styles';

const MapScreen = ({ navigation }) => {
    const { user } = useAuth();
    const mapRef = useRef(null);
    const justTapped = useRef(false);
    const locationCache = useRef({});
    const currentRegion = useRef({ latitudeDelta: 0.05, longitudeDelta: 0.05 });

    const [loading, setLoading] = useState(true);
    const [location, setLocation] = useState(null);
    const [tools, setTools] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [priceFilter, setPriceFilter] = useState('all');
    const [selectedTool, setSelectedTool] = useState(null);
    const [selectedToolCity, setSelectedToolCity] = useState('');

    // ── Fetch location + tools ────────────────────────────────────────────────
    useEffect(() => {
        (async () => {
            const { status } = await Location.requestForegroundPermissionsAsync();
            if (status === 'granted') {
                const loc = await Location.getCurrentPositionAsync({});
                setLocation(loc);
            }
            try {
                const res = await api.get(user?.id ? `/tools?exclude=${user.id}` : '/tools');
                setTools(res.data.filter(t => t.latitude && t.longitude));
            } catch (e) {
                console.error('[Map/iOS] fetch:', e);
            }
            setLoading(false);
        })();
    }, []);

    // ── Re-fetch on tab focus ─────────────────────────────────────────────────
    useFocusEffect(useCallback(() => {
        if (loading) return;
        api.get(user?.id ? `/tools?exclude=${user.id}` : '/tools')
            .then(res => setTools(res.data.filter(t => t.latitude && t.longitude)))
            .catch(e => console.warn('[Map/iOS] focus fetch:', e));
    }, [loading]));

    // ── Fit map once after initial load ───────────────────────────────────────
    useEffect(() => {
        if (loading || tools.length === 0) return;
        setTimeout(() => {
            mapRef.current?.fitToCoordinates(
                tools.map(t => ({ latitude: t.latitude, longitude: t.longitude })),
                { edgePadding: { top: 150, right: 80, bottom: 300, left: 80 }, animated: true }
            );
        }, 500);
    }, [loading]);

    // ── Filtering ─────────────────────────────────────────────────────────────
    const filteredTools = tools.filter(tool => {
        const q = searchQuery.toLowerCase();
        const matchesSearch =
            tool.name.toLowerCase().includes(q) ||
            tool.description?.toLowerCase().includes(q) ||
            tool.category?.name?.toLowerCase().includes(q);
        let matchesPrice = true;
        if (priceFilter === 'low') matchesPrice = tool.pricePerDay < 20;
        if (priceFilter === 'mid') matchesPrice = tool.pricePerDay >= 20 && tool.pricePerDay <= 50;
        if (priceFilter === 'high') matchesPrice = tool.pricePerDay > 50;
        return matchesSearch && matchesPrice;
    });

    // ── Selection ─────────────────────────────────────────────────────────────
    const handleSelect = useCallback((tool) => {
        justTapped.current = true;
        setSelectedTool(tool);
        setTimeout(() => { justTapped.current = false; }, 300);

        const { latitudeDelta, longitudeDelta } = currentRegion.current;
        mapRef.current?.animateToRegion({
            latitude: tool.latitude - latitudeDelta * 0.15,
            longitude: tool.longitude,
            latitudeDelta,
            longitudeDelta,
        }, 350);
    }, []);

    // ── Reverse geocode ───────────────────────────────────────────────────────
    useEffect(() => {
        if (!selectedTool) return;
        const key = `${selectedTool.latitude},${selectedTool.longitude}`;
        if (locationCache.current[key]) { setSelectedToolCity(locationCache.current[key]); return; }
        setSelectedToolCity('');
        Location.reverseGeocodeAsync({ latitude: selectedTool.latitude, longitude: selectedTool.longitude })
            .then(([r]) => {
                const city = r?.city || r?.district || r?.subregion || r?.region || '';
                locationCache.current[key] = city;
                setSelectedToolCity(city);
            })
            .catch(() => { });
    }, [selectedTool]);

    // ── Loading ───────────────────────────────────────────────────────────────
    if (loading) {
        return (
            <View style={styles.loadingScreen}>
                <ActivityIndicator size="large" color="#FF385C" />
                <Text style={styles.loadingText}>Loading map...</Text>
            </View>
        );
    }

    // ── Map ───────────────────────────────────────────────────────────────────
    return (
        <View style={styles.container}>
            <MapView
                ref={mapRef}
                style={styles.map}
                customMapStyle={darkMapStyle}
                userInterfaceStyle="dark"
                initialRegion={{
                    latitude: location?.coords.latitude ?? 50.8503,
                    longitude: location?.coords.longitude ?? 4.3517,
                    latitudeDelta: 0.05,
                    longitudeDelta: 0.05,
                }}
                showsUserLocation
                onRegionChangeComplete={r => { currentRegion.current = r; }}
                onPress={() => {
                    if (!justTapped.current) setSelectedTool(null);
                }}
            >
                {filteredTools.flatMap(tool => {
                    const isSelected = selectedTool?.id === tool.id;
                    return [
                        // ── Normal (white) pill ── always mounted, hidden when selected
                        <Marker
                            key={`${tool.id}-nrm`}
                            coordinate={{ latitude: tool.latitude, longitude: tool.longitude }}
                            tracksViewChanges={false}
                            opacity={isSelected ? 0 : 1}
                            tappable={!isSelected}
                            zIndex={1}
                            anchor={{ x: 0.5, y: 0.5 }}
                            onPress={() => handleSelect(tool)}
                        >
                            <View style={styles.pill} collapsable={false}>
                                <Text style={styles.pillText} allowFontScaling={false}>
                                    €{Math.round(tool.pricePerDay)}
                                </Text>
                            </View>
                        </Marker>,

                        // ── Selected (dark) pill ── always mounted, visible only when selected
                        <Marker
                            key={`${tool.id}-sel`}
                            coordinate={{ latitude: tool.latitude, longitude: tool.longitude }}
                            tracksViewChanges={false}
                            opacity={isSelected ? 1 : 0}
                            tappable={false}
                            zIndex={isSelected ? 99 : 2}
                            anchor={{ x: 0.5, y: 0.5 }}
                        >
                            <View style={[styles.pill, styles.pillSelected]} collapsable={false}>
                                <Text style={[styles.pillText, styles.pillTextSelected]} allowFontScaling={false}>
                                    €{Math.round(tool.pricePerDay)}
                                </Text>
                            </View>
                        </Marker>,
                    ];
                })}
            </MapView>

            {/* Search + filters */}
            <View style={styles.searchRow}>
                <View style={styles.searchBar}>
                    <Ionicons name="search" size={20} color="#FF385C" style={styles.searchIcon} />
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
                <ScrollView horizontal showsHorizontalScrollIndicator={false}
                    style={styles.filterScroll} contentContainerStyle={styles.filterContent}>
                    {[
                        { id: 'all', label: 'All prices' },
                        { id: 'low', label: '< €20' },
                        { id: 'mid', label: '€20 – €50' },
                        { id: 'high', label: '> €50' },
                    ].map(f => (
                        <TouchableOpacity key={f.id}
                            onPress={() => setPriceFilter(f.id)}
                            style={[styles.filterPill, priceFilter === f.id && styles.filterPillActive]}>
                            <Text style={[styles.filterPillText, priceFilter === f.id && styles.filterPillTextActive]}>
                                {f.label}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>

            {/* Tool detail card */}
            {selectedTool && (
                <View style={styles.card}>
                    <View style={styles.cardImg}>
                        <View style={styles.cardImgPlaceholder}>
                            <Ionicons name="construct-outline" size={40} color="#ccc" />
                        </View>
                        <View style={styles.cardImgTopRow}>
                            <View style={styles.guestBadge}>
                                <Text style={styles.guestBadgeText}>Guest favorite</Text>
                            </View>
                            <TouchableOpacity>
                                <Ionicons name="heart-outline" size={24} color="#fff" />
                            </TouchableOpacity>
                        </View>
                        <View style={styles.dots}>
                            <View style={[styles.dot, styles.dotActive]} />
                            <View style={styles.dot} />
                            <View style={styles.dot} />
                        </View>
                    </View>

                    <TouchableOpacity style={styles.cardBody} activeOpacity={0.9}
                        onPress={() => navigation.navigate('ToolDetails', { toolId: selectedTool.id })}>
                        <View style={styles.ratingRow}>
                            <Ionicons name="star" size={14} color="#ffb400" />
                            <Text style={styles.ratingText}> 4.91 (98)</Text>
                        </View>
                        <Text style={styles.categoryText}>
                            {selectedTool.category?.name}{selectedToolCity ? ` in ${selectedToolCity}` : ''}
                        </Text>
                        <Text style={styles.nameText} numberOfLines={1}>{selectedTool.name}</Text>
                        <Text style={styles.priceLine}>
                            <Text style={styles.priceValue}>€{selectedTool.pricePerDay}</Text>
                            <Text style={styles.priceUnit}> / day</Text>
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.closeBtn} onPress={() => setSelectedTool(null)}>
                        <Ionicons name="close" size={20} color="#222" />
                    </TouchableOpacity>
                </View>
            )}
        </View>
    );
};

export default MapScreen;
