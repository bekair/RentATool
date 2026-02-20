import React, { useState, useEffect, useRef, useCallback } from 'react';
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

// ─────────────────────────────────────────────────────────────────────────────
// APPROACH: "Capture during loading"
//
// iOS only renders views that are actively on screen. So instead of trying to
// trick iOS with z-indexes or off-screen positions, we render the pills visibly
// DURING the loading phase and capture them before showing the map.
//
// Flow:
//  1. 'loading'   – fetch location + tools, show spinner
//  2. 'capturing' – tools arrived; pills rendered VISIBLY below spinner;
//                   react-native-view-shot captures each one as a PNG data URI
//  3. 'ready'     – map shown with captured images as Marker image prop
//
// The map.image prop bypasses the buggy "View→bitmap snapshot" path entirely.
// ─────────────────────────────────────────────────────────────────────────────

const MapScreen = ({ navigation }) => {
    const mapRef = useRef(null);
    const justTappedMarker = useRef(false); // iOS guard: prevents MapView.onPress deselecting immediately after Marker.onPress

    // 'loading' | 'capturing' | 'ready'
    const [phase, setPhase] = useState('loading');

    const [location, setLocation] = useState(null);
    const [tools, setTools] = useState([]);
    const [markerImages, setMarkerImages] = useState({}); // { id: { uri, selectedUri } }
    const [searchQuery, setSearchQuery] = useState('');
    const [priceFilter, setPriceFilter] = useState('all');
    const [selectedTool, setSelectedTool] = useState(null);
    const [selectedToolCity, setSelectedToolCity] = useState('');

    const pillRefs = useRef({}); // { `${id}-normal`: ref, `${id}-selected`: ref }
    const locationCache = useRef({});

    // ── Step 1: location + tools ──────────────────────────────────────────────
    useEffect(() => {
        (async () => {
            const { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') { setPhase('ready'); return; }
            const loc = await Location.getCurrentPositionAsync({});
            setLocation(loc);
            try {
                const res = await api.get('/tools');
                const valid = res.data.filter(t => t.latitude && t.longitude);
                setTools(valid);
                if (valid.length > 0) {
                    setPhase('capturing'); // trigger pill capture phase
                } else {
                    setPhase('ready');
                }
            } catch (e) {
                console.error('[Map] fetch error:', e);
                setPhase('ready');
            }
        })();
    }, []);

    // ── Step 2: capture pills once they're rendered on screen ─────────────────
    // The 'capturing' phase renders the pills visibly in the loading screen,
    // so iOS has them fully in the GPU layer and captureRef works perfectly.
    useEffect(() => {
        if (phase !== 'capturing' || tools.length === 0) return;

        // Wait two frames for React to commit the pill views to the native layer
        const timer = setTimeout(async () => {
            const images = {};
            for (const tool of tools) {
                try {
                    const nRef = pillRefs.current[`${tool.id}-normal`];
                    const sRef = pillRefs.current[`${tool.id}-selected`];
                    if (!nRef || !sRef) continue;

                    const [uri, selectedUri] = await Promise.all([
                        captureRef(nRef, { format: 'png', quality: 1, result: 'data-uri' }),
                        captureRef(sRef, { format: 'png', quality: 1, result: 'data-uri' }),
                    ]);
                    images[tool.id] = { uri, selectedUri };
                } catch (e) {
                    console.warn(`[Map] capture failed for tool ${tool.id}:`, e);
                }
            }
            setMarkerImages(images);
            setPhase('ready');           // now show the map
        }, 300); // 300 ms is enough — views are on screen, not off-screen

        return () => clearTimeout(timer);
    }, [phase, tools]);

    // ── Map fit ───────────────────────────────────────────────────────────────
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

    // ── Marker selection ──────────────────────────────────────────────────────
    const handleSelect = useCallback((tool) => {
        justTappedMarker.current = true;   // block MapView.onPress from deselecting
        setSelectedTool(tool);
        // Clear the guard after a short window — long enough to outlast any MapView.onPress
        setTimeout(() => { justTappedMarker.current = false; }, 300);
    }, []);

    // ── Reverse geocode ───────────────────────────────────────────────────────
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
                console.warn('[Map] reverse geocode failed:', e);
            }
        })();
    }, [selectedTool]);

    // ── Render: loading / capturing ───────────────────────────────────────────
    if (phase === 'loading' || phase === 'capturing') {
        return (
            <View style={styles.loadingScreen}>
                <ActivityIndicator size="large" color="#FF385C" />
                <Text style={styles.loadingText}>Loading map...</Text>

                {/* Pills rendered visibly here so iOS captures them correctly  */}
                {/* They sit below the spinner — the user sees them briefly but  */}
                {/* they disappear once the map opens (phase → 'ready').         */}
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

    // ── Render: map ready ─────────────────────────────────────────────────────
    return (
        <View style={styles.container}>

            {/* ── Map ───────────────────────────────────────────────────── */}
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
                    return (
                        <Marker
                            key={tool.id}
                            coordinate={{ latitude: tool.latitude, longitude: tool.longitude }}
                            // Static pre-rendered PNG — no bitmap snapshotting by map engine
                            image={imgs
                                ? { uri: isSelected ? imgs.selectedUri : imgs.uri }
                                : undefined
                            }
                            onPress={() => handleSelect(tool)}
                            tappable={true}
                            tracksViewChanges={false}
                            zIndex={isSelected ? 99 : 1}
                            anchor={{ x: 0.5, y: 0.5 }}
                        />
                    );
                })}
            </MapView>

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

    // ── Loading / Capturing screen ────────────────────────────────────────────
    loadingScreen: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fff',
    },
    loadingText: { marginTop: 12, color: '#555', fontSize: 14 },

    // ── Pill capture area (visible during 'capturing' phase) ──────────────────
    // Pills are on-screen so iOS renders them; captureRef works perfectly.
    // Once phase → 'ready', this whole screen is replaced by the map.
    pillCapture: {
        marginTop: 40,
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
        paddingHorizontal: 20,
        gap: 8,
    },

    // ── Price pill appearance ─────────────────────────────────────────────────
    pill: {
        backgroundColor: '#FFFFFF',
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 22,
        borderWidth: 1.5,
        borderColor: '#DDDDDD',
        margin: 4,
        alignItems: 'center',
        justifyContent: 'center',
    },
    pillSelected: {
        backgroundColor: '#222222',
        borderColor: '#222222',
    },
    pillText: {
        fontSize: 14,
        fontWeight: '700',
        color: '#222222',
        letterSpacing: 0.2,
    },
    pillTextSelected: {
        color: '#FFFFFF',
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
    searchInput: { flex: 1, fontSize: 14, fontWeight: '500', color: '#222' },
    filterMenuIcon: {
        padding: 8,
        borderLeftWidth: 1,
        borderLeftColor: '#eee',
        marginLeft: 10,
    },
    filterScroll: { marginTop: 12 },
    filterContent: { paddingHorizontal: 20, gap: 8 },
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
    filterPillActive: { backgroundColor: '#222', borderColor: '#222' },
    filterPillText: { fontSize: 13, fontWeight: '600', color: '#222' },
    filterPillTextActive: { color: '#fff' },

    // ── Tool detail card ──────────────────────────────────────────────────────
    card: {
        position: 'absolute',
        bottom: 100,
        left: 20,
        right: 20,
        backgroundColor: '#fff',
        borderRadius: 16,
        overflow: 'hidden',
        zIndex: 100,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.15,
        shadowRadius: 20,
        elevation: 12,
    },
    cardImageContainer: { height: 180, backgroundColor: '#f5f5f5' },
    cardImagePlaceholder: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    cardImageTopRow: {
        position: 'absolute', top: 15, left: 15, right: 15,
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    },
    guestFavoriteBadge: {
        backgroundColor: '#fff', paddingHorizontal: 12, paddingVertical: 6,
        borderRadius: 20,
        shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1, shadowRadius: 4, elevation: 2,
    },
    guestFavoriteText: { fontSize: 12, fontWeight: '700', color: '#222' },
    heartButton: {
        shadowColor: '#000', shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.5, shadowRadius: 4,
    },
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
        justifyContent: 'center', alignItems: 'center',
        zIndex: 20,
        shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1, shadowRadius: 4, elevation: 4,
    },
});

export default MapScreen;
