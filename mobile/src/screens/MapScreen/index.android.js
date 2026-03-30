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
    ActivityIndicator,
    Text,
    TextInput,
    TouchableOpacity,
    ScrollView,
} from 'react-native';
import { Marker } from 'react-native-maps';
import { captureRef } from 'react-native-view-shot';
import * as Location from 'expo-location';
import { Ionicons } from '@expo/vector-icons';
import api from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import AppMapView from '../../components/ui/AppMapView';
import styles from './MapScreen.android.styles';

const MapScreen = ({ navigation }) => {
    const { user } = useAuth();
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
                const res = await api.get(user?.id ? `/tools?exclude=${user.id}` : '/tools');
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
                const res = await api.get(user?.id ? `/tools?exclude=${user.id}` : '/tools');
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
            tool.category?.name?.toLowerCase().includes(q);
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
            <AppMapView
                ref={mapRef}
                style={styles.map}
                theme="dark"
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
            </AppMapView>

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
                            {selectedTool.category?.name}{selectedToolCity ? ` in ${selectedToolCity}` : ''}
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

export default MapScreen;
