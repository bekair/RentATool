/**
 * MapScreen.android.js
 *
 * Android implementation — pre-captured PNG pills via react-native-view-shot.
 *
 * Why: Google Maps on Android lets us use static bitmap descriptors (BitmapDescriptorFactory)
 * via the `image` prop. With tracksViewChanges=false the marker is fully frozen after
 * the initial render — zero overhead during map panning/zooming.
 *
 * 3-phase flow:
 *   1. 'loading'   — fetch location + tools, show spinner
 *   2. 'capturing' — pills rendered visibly on-screen; react-native-view-shot
 *                    captures each one as a tmpfile PNG
 *   3. 'ready'     — map shown; markers use the captured PNG via `image` prop
 *
 * New tools added after initial load are captured via the pendingCapture strip
 * (rendered in a hidden strip at the bottom, behind the floating tab bar).
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
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
import { captureRef } from 'react-native-view-shot';
import * as Location from 'expo-location';
import { Ionicons } from '@expo/vector-icons';
import api from '../api/client';

const { width } = Dimensions.get('window');

const MapScreen = ({ navigation }) => {
    const mapRef = useRef(null);
    const justTappedMarker = useRef(false);
    const locationCache = useRef({});
    const pillRefs = useRef({}); // { `${id}-normal`: ref, `${id}-selected`: ref }
    const pendingRefs = useRef({});

    // 'loading' | 'capturing' | 'ready'
    const [phase, setPhase] = useState('loading');
    const [location, setLocation] = useState(null);
    const [tools, setTools] = useState([]);
    const [markerImages, setMarkerImages] = useState({}); // { id: { uri, selectedUri } }
    const [pendingCapture, setPendingCapture] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [priceFilter, setPriceFilter] = useState('all');
    const [selectedTool, setSelectedTool] = useState(null);
    const [selectedToolCity, setSelectedToolCity] = useState('');

    // ── Step 1: initial location + tools ─────────────────────────────────────
    useEffect(() => {
        (async () => {
            const { status } = await Location.requestForegroundPermissionsAsync();
            if (status === 'granted') {
                const loc = await Location.getCurrentPositionAsync({});
                setLocation(loc);
            }
            try {
                const res = await api.get('/tools');
                const valid = res.data.filter(t => t.latitude && t.longitude);
                setTools(valid);
                setPhase(valid.length > 0 ? 'capturing' : 'ready');
            } catch (e) {
                console.error('[Map/Android] fetch error:', e);
                setPhase('ready');
            }
        })();
    }, []);

    // ── Re-fetch on tab focus (pick up newly added tools) ────────────────────
    useFocusEffect(useCallback(() => {
        if (phase !== 'ready') return;
        (async () => {
            try {
                const res = await api.get('/tools');
                const valid = res.data.filter(t => t.latitude && t.longitude);
                setTools(valid);
                setMarkerImages(prev => {
                    const uncaptured = valid.filter(t => !prev[t.id]);
                    if (uncaptured.length > 0) setPendingCapture(uncaptured);
                    return prev;
                });
            } catch (e) {
                console.warn('[Map/Android] focus re-fetch error:', e);
            }
        })();
    }, [phase]));

    // ── Step 2: capture pill images during the 'capturing' phase ─────────────
    useEffect(() => {
        if (phase !== 'capturing' || tools.length === 0) return;
        const timer = setTimeout(async () => {
            const images = {};
            for (const tool of tools) {
                try {
                    const nRef = pillRefs.current[`${tool.id}-normal`];
                    const sRef = pillRefs.current[`${tool.id}-selected`];
                    if (!nRef || !sRef) continue;
                    const [uri, selectedUri] = await Promise.all([
                        captureRef(nRef, { format: 'png', quality: 1, result: 'tmpfile' }),
                        captureRef(sRef, { format: 'png', quality: 1, result: 'tmpfile' }),
                    ]);
                    images[tool.id] = { uri, selectedUri };
                } catch (e) {
                    console.warn(`[Map/Android] capture failed for tool ${tool.id}:`, e);
                }
            }
            setMarkerImages(images);
            setPhase('ready');
        }, 300);
        return () => clearTimeout(timer);
    }, [phase, tools]);

    // ── Step 3: capture new tools added after initial load ───────────────────
    // Pills render behind the floating tab bar (bottom strip) — on-screen for
    // Android compositor, never visible to the user.
    useEffect(() => {
        if (pendingCapture.length === 0) return;
        const timer = setTimeout(async () => {
            const newImages = {};
            for (const tool of pendingCapture) {
                try {
                    const nRef = pendingRefs.current[`${tool.id}-normal`];
                    const sRef = pendingRefs.current[`${tool.id}-selected`];
                    if (!nRef || !sRef) continue;
                    const [uri, selectedUri] = await Promise.all([
                        captureRef(nRef, { format: 'png', quality: 1, result: 'tmpfile' }),
                        captureRef(sRef, { format: 'png', quality: 1, result: 'tmpfile' }),
                    ]);
                    newImages[tool.id] = { uri, selectedUri };
                } catch (e) {
                    console.warn(`[Map/Android] incremental capture failed for ${tool.id}:`, e);
                }
            }
            setMarkerImages(prev => ({ ...prev, ...newImages }));
            setPendingCapture([]);
        }, 300);
        return () => clearTimeout(timer);
    }, [pendingCapture]);

    // ── Fit map to all markers once after initial load ────────────────────────
    useEffect(() => {
        if (phase !== 'ready' || tools.length === 0) return;
        setTimeout(() => {
            mapRef.current?.fitToCoordinates(
                tools.map(t => ({ latitude: t.latitude, longitude: t.longitude })),
                { edgePadding: { top: 150, right: 80, bottom: 300, left: 80 }, animated: true }
            );
        }, 500);
    }, [phase]);

    // ── Filtering ─────────────────────────────────────────────────────────────
    const filteredTools = tools.filter(tool => {
        const q = searchQuery.toLowerCase();
        const matchesSearch =
            tool.name.toLowerCase().includes(q) ||
            tool.description?.toLowerCase().includes(q) ||
            tool.category?.toLowerCase().includes(q);
        let matchesPrice = true;
        if (priceFilter === 'low') matchesPrice = tool.pricePerDay < 20;
        if (priceFilter === 'mid') matchesPrice = tool.pricePerDay >= 20 && tool.pricePerDay <= 50;
        if (priceFilter === 'high') matchesPrice = tool.pricePerDay > 50;
        return matchesSearch && matchesPrice;
    });

    // ── Marker selection + map centering ──────────────────────────────────────
    const handleSelect = useCallback((tool) => {
        justTappedMarker.current = true;
        setSelectedTool(tool);
        setTimeout(() => { justTappedMarker.current = false; }, 300);

        mapRef.current?.animateToRegion(
            {
                latitude: tool.latitude - 0.001,
                longitude: tool.longitude,
                latitudeDelta: 0.02,
                longitudeDelta: 0.02,
            },
            350
        );
    }, []);

    // ── Reverse geocode selected tool ─────────────────────────────────────────
    useEffect(() => {
        if (!selectedTool) return;
        const key = `${selectedTool.latitude},${selectedTool.longitude}`;
        if (locationCache.current[key]) {
            setSelectedToolCity(locationCache.current[key]);
            return;
        }
        setSelectedToolCity('');
        (async () => {
            try {
                const [r] = await Location.reverseGeocodeAsync({
                    latitude: selectedTool.latitude,
                    longitude: selectedTool.longitude,
                });
                const city = r?.city || r?.district || r?.subregion || r?.region || '';
                locationCache.current[key] = city;
                setSelectedToolCity(city);
            } catch (e) {
                console.warn('[Map/Android] reverse geocode failed:', e);
            }
        })();
    }, [selectedTool]);

    // ── Render: loading / capturing ───────────────────────────────────────────
    if (phase === 'loading' || phase === 'capturing') {
        return (
            <View style={styles.loadingScreen}>
                <ActivityIndicator size="large" color="#FF385C" />
                <Text style={styles.loadingText}>Loading map...</Text>

                {/* Pills rendered visibly so Android can snapshot them */}
                {phase === 'capturing' && (
                    <View style={styles.pillCapture} pointerEvents="none">
                        {tools.map(tool => (
                            <React.Fragment key={tool.id}>
                                <View
                                    ref={r => { pillRefs.current[`${tool.id}-normal`] = r; }}
                                    style={styles.pill}
                                    collapsable={false}
                                >
                                    <Text style={styles.pillText} allowFontScaling={false}>
                                        €{Math.round(tool.pricePerDay)}
                                    </Text>
                                </View>
                                <View
                                    ref={r => { pillRefs.current[`${tool.id}-selected`] = r; }}
                                    style={[styles.pill, styles.pillSelected]}
                                    collapsable={false}
                                >
                                    <Text style={[styles.pillText, styles.pillTextSelected]} allowFontScaling={false}>
                                        €{Math.round(tool.pricePerDay)}
                                    </Text>
                                </View>
                            </React.Fragment>
                        ))}
                    </View>
                )}
            </View>
        );
    }

    // ── Render: map ───────────────────────────────────────────────────────────
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
                onPress={() => {
                    if (!justTappedMarker.current) setSelectedTool(null);
                }}
            >
                {filteredTools.map(tool => {
                    const isSelected = selectedTool?.id === tool.id;
                    const imgs = markerImages[tool.id];
                    const imageUri = imgs
                        ? (isSelected ? imgs.selectedUri : imgs.uri)
                        : undefined;
                    return (
                        <Marker
                            key={tool.id}
                            coordinate={{ latitude: tool.latitude, longitude: tool.longitude }}
                            image={imageUri ? { uri: imageUri } : undefined}
                            onPress={() => handleSelect(tool)}
                            tappable={true}
                            tracksViewChanges={false}
                            zIndex={isSelected ? 99 : 1}
                            anchor={{ x: 0.5, y: 0.5 }}
                        />
                    );
                })}
            </MapView>

            {/* ── Hidden strip for new tools (behind floating tab bar) ─── */}
            {pendingCapture.length > 0 && (
                <View style={styles.pendingCaptureStrip} pointerEvents="none">
                    {pendingCapture.map(tool => (
                        <React.Fragment key={tool.id}>
                            <View
                                ref={r => { pendingRefs.current[`${tool.id}-normal`] = r; }}
                                style={styles.pill}
                                collapsable={false}
                            >
                                <Text style={styles.pillText} allowFontScaling={false}>
                                    €{Math.round(tool.pricePerDay)}
                                </Text>
                            </View>
                            <View
                                ref={r => { pendingRefs.current[`${tool.id}-selected`] = r; }}
                                style={[styles.pill, styles.pillSelected]}
                                collapsable={false}
                            >
                                <Text style={[styles.pillText, styles.pillTextSelected]} allowFontScaling={false}>
                                    €{Math.round(tool.pricePerDay)}
                                </Text>
                            </View>
                        </React.Fragment>
                    ))}
                </View>
            )}

            {/* ── Search + Filters ─────────────────────────────────────── */}
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

                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    style={styles.filterScroll}
                    contentContainerStyle={styles.filterContent}
                >
                    {[
                        { id: 'all', label: 'All prices' },
                        { id: 'low', label: '< €20' },
                        { id: 'mid', label: '€20 – €50' },
                        { id: 'high', label: '> €50' },
                    ].map(f => (
                        <TouchableOpacity
                            key={f.id}
                            onPress={() => setPriceFilter(f.id)}
                            style={[styles.filterPill, priceFilter === f.id && styles.filterPillActive]}
                        >
                            <Text style={[styles.filterPillText, priceFilter === f.id && styles.filterPillTextActive]}>
                                {f.label}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>

            {/* ── Tool detail card ─────────────────────────────────────── */}
            {selectedTool && (
                <View style={styles.card}>
                    <View style={styles.cardImageContainer}>
                        <View style={styles.cardImagePlaceholder}>
                            <Ionicons name="construct-outline" size={40} color="#ccc" />
                        </View>
                        <View style={styles.cardImageTopRow}>
                            <View style={styles.guestFavoriteBadge}>
                                <Text style={styles.guestFavoriteText}>Guest favorite</Text>
                            </View>
                            <TouchableOpacity style={styles.heartButton}>
                                <Ionicons name="heart-outline" size={24} color="#fff" />
                            </TouchableOpacity>
                        </View>
                        <View style={styles.carouselDots}>
                            <View style={[styles.dot, styles.dotActive]} />
                            <View style={styles.dot} />
                            <View style={styles.dot} />
                        </View>
                    </View>

                    <TouchableOpacity
                        style={styles.cardBody}
                        activeOpacity={0.9}
                        onPress={() => navigation.navigate('ToolDetails', { toolId: selectedTool.id })}
                    >
                        <View style={styles.cardRatingRow}>
                            <Ionicons name="star" size={14} color="#ffb400" />
                            <Text style={styles.cardRatingText}> 4.91 (98)</Text>
                        </View>
                        <Text style={styles.cardCategoryText}>
                            {selectedTool.category}{selectedToolCity ? ` in ${selectedToolCity}` : ''}
                        </Text>
                        <Text style={styles.cardNameText} numberOfLines={1}>{selectedTool.name}</Text>
                        <Text style={styles.cardPriceLine}>
                            <Text style={styles.cardPriceValue}>€{selectedTool.pricePerDay}</Text>
                            <Text style={styles.cardPriceUnit}> / day</Text>
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.cardCloseX} onPress={() => setSelectedTool(null)}>
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

    loadingScreen: {
        flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff',
    },
    loadingText: { marginTop: 12, color: '#555', fontSize: 14 },

    pillCapture: {
        marginTop: 40,
        flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center',
        paddingHorizontal: 20, gap: 8,
    },

    pendingCaptureStrip: {
        position: 'absolute', bottom: 0, left: 0, right: 0, height: 74,
        flexDirection: 'row', flexWrap: 'wrap', overflow: 'hidden', zIndex: 1,
    },

    pill: {
        backgroundColor: '#FFFFFF',
        paddingHorizontal: 14, paddingVertical: 8,
        borderRadius: 22, borderWidth: 1.5, borderColor: '#DDDDDD',
        margin: 4, alignItems: 'center', justifyContent: 'center',
    },
    pillSelected: { backgroundColor: '#222222', borderColor: '#222222' },
    pillText: { fontSize: 14, fontWeight: '700', color: '#222222', letterSpacing: 0.2 },
    pillTextSelected: { color: '#FFFFFF' },

    searchRow: {
        position: 'absolute', top: 30, left: 0, right: 0, zIndex: 10,
    },
    searchBar: {
        flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff',
        borderRadius: 32, marginHorizontal: 20, paddingHorizontal: 20, height: 56,
        shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1, shadowRadius: 12, elevation: 8,
        borderWidth: StyleSheet.hairlineWidth, borderColor: '#ddd',
    },
    searchInput: { flex: 1, fontSize: 14, fontWeight: '500', color: '#222' },
    filterMenuIcon: { padding: 8, borderLeftWidth: 1, borderLeftColor: '#eee', marginLeft: 10 },
    filterScroll: { marginTop: 12 },
    filterContent: { paddingHorizontal: 20, gap: 8 },
    filterPill: {
        backgroundColor: '#fff', paddingHorizontal: 16, paddingVertical: 8,
        borderRadius: 20, borderWidth: 1, borderColor: '#ddd', height: 36, justifyContent: 'center',
    },
    filterPillActive: { backgroundColor: '#222', borderColor: '#222' },
    filterPillText: { fontSize: 13, fontWeight: '600', color: '#222' },
    filterPillTextActive: { color: '#fff' },

    card: {
        position: 'absolute', bottom: 100, left: 20, right: 20,
        backgroundColor: '#fff', borderRadius: 16, overflow: 'hidden', zIndex: 100,
        shadowColor: '#000', shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.15, shadowRadius: 20, elevation: 12,
    },
    cardImageContainer: { height: 180, backgroundColor: '#f5f5f5' },
    cardImagePlaceholder: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    cardImageTopRow: {
        position: 'absolute', top: 15, left: 15, right: 15,
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    },
    guestFavoriteBadge: {
        backgroundColor: '#fff', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20,
        shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 2,
    },
    guestFavoriteText: { fontSize: 12, fontWeight: '700', color: '#222' },
    heartButton: { shadowColor: '#000', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.5, shadowRadius: 4 },
    carouselDots: {
        position: 'absolute', bottom: 15, width: '100%',
        flexDirection: 'row', justifyContent: 'center', gap: 6,
    },
    dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.6)' },
    dotActive: { backgroundColor: '#fff' },
    cardBody: { padding: 16 },
    cardRatingRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
    cardRatingText: { fontSize: 14, color: '#222', fontWeight: '500' },
    cardCategoryText: { fontSize: 15, color: '#717171', marginBottom: 4 },
    cardNameText: { fontSize: 16, fontWeight: '600', color: '#222', marginBottom: 8 },
    cardPriceLine: { fontSize: 16, color: '#222' },
    cardPriceValue: { fontWeight: 'bold' },
    cardPriceUnit: { color: '#717171', fontWeight: '300' },
    cardCloseX: {
        position: 'absolute', top: 10, right: 10,
        backgroundColor: 'rgba(255,255,255,0.9)',
        width: 30, height: 30, borderRadius: 15,
        justifyContent: 'center', alignItems: 'center', zIndex: 20,
        shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 4,
    },
});

export default MapScreen;
