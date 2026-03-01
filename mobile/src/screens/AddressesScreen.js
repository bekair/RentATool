import React, { useState, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    TextInput,
    Modal,
    Alert,
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import MapView from 'react-native-maps';
import * as Location from 'expo-location';
import { useAuth } from '../context/AuthContext';
import { InputField } from '../components/form';

const FIELD_HEIGHT = 56;
const ADDRESS_TYPES = ['Home', 'Work', 'Workshop', 'Office'];

// Defined here so LabelChips (below) can reference it
const chipRow = StyleSheet.create({
    scroll: { marginBottom: 16 },
    chip: {
        paddingHorizontal: 16, paddingVertical: 8,
        borderRadius: 20, borderWidth: 1,
        borderColor: '#2e2e2e', backgroundColor: '#2c2c2e',
    },
    chipActive: {
        backgroundColor: '#6366f1', borderColor: '#6366f1',
        paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20,
    },
    chipText: { fontSize: 14, color: '#888', fontWeight: '500' },
    chipTextActive: { fontSize: 14, color: '#fff', fontWeight: '700' },
    addChip: {
        paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20,
        borderWidth: 1.5, borderColor: '#6366f150', backgroundColor: '#6366f110',
        flexDirection: 'row', alignItems: 'center', gap: 4, borderStyle: 'dashed',
    },
    addChipText: { fontSize: 14, color: '#6366f1', fontWeight: '600' },
    customInputRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 16 },
    customInput: {
        flex: 1, height: 44, backgroundColor: '#3a3a3c',
        borderRadius: 10, borderWidth: 1, borderColor: '#6366f1',
        paddingHorizontal: 14, fontSize: 15, color: '#fff',
    },
    customConfirm: {
        width: 44, height: 44, borderRadius: 10,
        backgroundColor: '#6366f1', justifyContent: 'center', alignItems: 'center',
    },
    customCancel: {
        width: 44, height: 44, borderRadius: 10,
        backgroundColor: '#2a2a2a', justifyContent: 'center', alignItems: 'center',
    },
    selectedCustomRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12 },
    selectedHint: { fontSize: 12, color: '#555' },
});


function LabelChips({ selected, onSelect }) {
    const [showInput, setShowInput] = useState(false);
    const [customText, setCustomText] = useState('');
    const inputRef = useRef(null);

    const handlePressCustom = () => {
        setShowInput(true);
        setTimeout(() => inputRef.current?.focus(), 50);
    };

    const confirmCustom = () => {
        const trimmed = customText.trim();
        if (trimmed) {
            onSelect(trimmed);
            setShowInput(false);
            setCustomText('');
        }
    };

    const cancelCustom = () => {
        setShowInput(false);
        setCustomText('');
    };

    return (
        <View>
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ gap: 8, paddingBottom: 4 }}
                style={chipRow.scroll}
            >
                {/* + Custom chip — first */}
                {!showInput && (
                    <TouchableOpacity
                        style={chipRow.addChip}
                        onPress={handlePressCustom}
                    >
                        <Ionicons name="add" size={14} color="#6366f1" />
                        <Text style={chipRow.addChipText}>Custom</Text>
                    </TouchableOpacity>
                )}
                {ADDRESS_TYPES.map(t => (
                    <TouchableOpacity
                        key={t}
                        style={[chipRow.chip, selected === t && chipRow.chipActive]}
                        onPress={() => { onSelect(t); setShowInput(false); }}
                    >
                        <Text style={[chipRow.chipText, selected === t && chipRow.chipTextActive]}>{t}</Text>
                    </TouchableOpacity>
                ))}
            </ScrollView>

            {/* Inline custom label input */}
            {showInput && (
                <View style={chipRow.customInputRow}>
                    <TextInput
                        ref={inputRef}
                        style={chipRow.customInput}
                        value={customText}
                        onChangeText={setCustomText}
                        placeholder="e.g. Garage, Studio…"
                        placeholderTextColor="#555"
                        onSubmitEditing={confirmCustom}
                        returnKeyType="done"
                        maxLength={30}
                    />
                    <TouchableOpacity style={chipRow.customConfirm} onPress={confirmCustom}>
                        <Ionicons name="checkmark" size={18} color="#fff" />
                    </TouchableOpacity>
                    <TouchableOpacity style={chipRow.customCancel} onPress={cancelCustom}>
                        <Ionicons name="close" size={18} color="#888" />
                    </TouchableOpacity>
                </View>
            )}

            {/* Show selected custom label as a chip if it's not in presets */}
            {selected && !ADDRESS_TYPES.includes(selected) && !showInput && (
                <View style={chipRow.selectedCustomRow}>
                    <View style={chipRow.chipActive}>
                        <Text style={chipRow.chipTextActive}>{selected}</Text>
                    </View>
                    <Text style={chipRow.selectedHint}>Custom label selected</Text>
                </View>
            )}
        </View>
    );
}

// ─── Small helper: renders one address card ──────────────────────────────────
function AddressCard({ address, onDelete, onSetDefault }) {
    return (
        <View style={cardStyles.card}>
            <View style={cardStyles.iconCol}>
                <View style={cardStyles.iconBg}>
                    <Ionicons
                        name={address.label === 'Home' ? 'home' : address.label === 'Work' ? 'briefcase' : 'location'}
                        size={20}
                        color="#6366f1"
                    />
                </View>
            </View>
            <View style={cardStyles.info}>
                <View style={cardStyles.titleRow}>
                    <Text style={cardStyles.label}>{address.label}</Text>
                    {address.isDefault && (
                        <View style={cardStyles.defaultBadge}>
                            <Text style={cardStyles.defaultBadgeText}>Default</Text>
                        </View>
                    )}
                </View>
                {address.street ? (
                    <Text style={cardStyles.detail}>{address.street}</Text>
                ) : null}
                {(address.city || address.country) ? (
                    <Text style={cardStyles.detail}>
                        {[address.city, address.postalCode, address.country].filter(Boolean).join(', ')}
                    </Text>
                ) : null}
                {address.latitude ? (
                    <Text style={cardStyles.coords}>
                        {address.latitude.toFixed(5)}, {address.longitude.toFixed(5)}
                    </Text>
                ) : null}
            </View>
            <View style={cardStyles.actions}>
                {!address.isDefault && (
                    <TouchableOpacity style={cardStyles.actionBtn} onPress={() => onSetDefault(address.id)}>
                        <Ionicons name="star-outline" size={18} color="#888" />
                    </TouchableOpacity>
                )}
                <TouchableOpacity style={cardStyles.actionBtn} onPress={() => onDelete(address.id)}>
                    <Ionicons name="trash-outline" size={18} color="#ef4444" />
                </TouchableOpacity>
            </View>
        </View>
    );
}

// ─── Main Screen ─────────────────────────────────────────────────────────────
export default function AddressesScreen({ navigation }) {
    const { user } = useAuth();
    const insets = useSafeAreaInsets();

    const [addresses, setAddresses] = useState(user?.addresses || []);
    const [showAddModal, setShowAddModal] = useState(false);

    // Add-modal state
    const [addTab, setAddTab] = useState('manual'); // 'manual' | 'map'

    // Manual form
    const [label, setLabel] = useState('Home');
    const [street, setStreet] = useState('');
    const [city, setCity] = useState('');
    const [postalCode, setPostalCode] = useState('');
    const [country, setCountry] = useState('');

    // Map state
    const [mapReady, setMapReady] = useState(false);
    const [locationLoading, setLocationLoading] = useState(false);
    const [tempCoords, setTempCoords] = useState(null);
    const [mapLabel, setMapLabel] = useState('Home');

    const resetForm = () => {
        setLabel('Home');
        setStreet('');
        setCity('');
        setPostalCode('');
        setCountry('');
        setTempCoords(null);
        setMapLabel('Home');
        setMapReady(false);
        setAddTab('manual');
    };

    const openModal = () => {
        resetForm();
        setShowAddModal(true);
    };

    // ── Map helpers ──────────────────────────────────────────────────────────
    const initMap = async () => {
        if (mapReady) return;
        setLocationLoading(true);
        try {
            const { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert('Permission Denied', 'Location access was denied.');
                return;
            }
            const loc = await Location.getCurrentPositionAsync({});
            setTempCoords({ latitude: loc.coords.latitude, longitude: loc.coords.longitude });
            setMapReady(true);
        } catch {
            Alert.alert('Error', 'Failed to fetch your location.');
        } finally {
            setLocationLoading(false);
        }
    };

    const switchToMap = () => {
        setAddTab('map');
        initMap();
    };

    const confirmMapAddress = () => {
        if (!tempCoords) return;
        const newAddr = {
            id: Date.now().toString(),
            label: mapLabel,
            latitude: tempCoords.latitude,
            longitude: tempCoords.longitude,
            isDefault: addresses.length === 0,
        };
        setAddresses(prev => [...prev, newAddr]);
        setShowAddModal(false);
        resetForm();
    };

    // ── Manual helpers ───────────────────────────────────────────────────────
    const confirmManualAddress = () => {
        if (!street.trim() && !city.trim()) {
            Alert.alert('Missing Info', 'Please enter at least a street or city.');
            return;
        }
        const newAddr = {
            id: Date.now().toString(),
            label,
            street: street.trim(),
            city: city.trim(),
            postalCode: postalCode.trim(),
            country: country.trim(),
            isDefault: addresses.length === 0,
        };
        setAddresses(prev => [...prev, newAddr]);
        setShowAddModal(false);
        resetForm();
    };

    const deleteAddress = (id) => {
        Alert.alert('Remove Address', 'Are you sure you want to remove this address?', [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Remove', style: 'destructive',
                onPress: () => setAddresses(prev => {
                    const filtered = prev.filter(a => a.id !== id);
                    // If deleted was default, promote first remaining
                    if (filtered.length > 0 && !filtered.some(a => a.isDefault)) {
                        filtered[0] = { ...filtered[0], isDefault: true };
                    }
                    return filtered;
                }),
            },
        ]);
    };

    const setDefault = (id) => {
        setAddresses(prev => prev.map(a => ({ ...a, isDefault: a.id === id })));
    };

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="#fff" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Addresses</Text>
                <View style={{ width: 34 }} />
            </View>

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                {addresses.length === 0 ? (
                    <View style={styles.emptyState}>
                        <Ionicons name="location-outline" size={52} color="#333" />
                        <Text style={styles.emptyTitle}>No addresses yet</Text>
                        <Text style={styles.emptySubtitle}>
                            Add your home, work, or any other location to make tool pickups easier.
                        </Text>
                    </View>
                ) : (
                    addresses.map(addr => (
                        <AddressCard
                            key={addr.id}
                            address={addr}
                            onDelete={deleteAddress}
                            onSetDefault={setDefault}
                        />
                    ))
                )}

                {/* Add Address Button */}
                <TouchableOpacity style={styles.addButton} onPress={openModal} activeOpacity={0.8}>
                    <Ionicons name="add-circle-outline" size={22} color="#6366f1" />
                    <Text style={styles.addButtonText}>Add New Address</Text>
                </TouchableOpacity>
            </ScrollView>

            {/* ── Add Address Modal ─────────────────────────────────────── */}
            <Modal
                visible={showAddModal}
                animationType="slide"
                presentationStyle="pageSheet"
                onRequestClose={() => setShowAddModal(false)}
            >
                <View style={[modal.container, { paddingTop: insets.top || 20 }]}>
                    {/* Modal Header */}
                    <View style={modal.header}>
                        <TouchableOpacity onPress={() => setShowAddModal(false)}>
                            <Text style={modal.cancel}>Cancel</Text>
                        </TouchableOpacity>
                        <Text style={modal.title}>Add Address</Text>
                        <TouchableOpacity
                            onPress={addTab === 'manual' ? confirmManualAddress : confirmMapAddress}
                        >
                            <Text style={modal.confirm}>Add</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Tab Toggle */}
                    <View style={modal.tabBar}>
                        <TouchableOpacity
                            style={[modal.tab, addTab === 'manual' && modal.tabActive]}
                            onPress={() => setAddTab('manual')}
                        >
                            <Ionicons name="create-outline" size={16} color={addTab === 'manual' ? '#fff' : '#888'} />
                            <Text style={[modal.tabText, addTab === 'manual' && modal.tabTextActive]}>Manual</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[modal.tab, addTab === 'map' && modal.tabActive]}
                            onPress={switchToMap}
                        >
                            <Ionicons name="map-outline" size={16} color={addTab === 'map' ? '#fff' : '#888'} />
                            <Text style={[modal.tabText, addTab === 'map' && modal.tabTextActive]}>Pick from Map</Text>
                        </TouchableOpacity>
                    </View>

                    {/* ── Manual Tab ── */}
                    {addTab === 'manual' && (
                        <KeyboardAvoidingView
                            style={{ flex: 1 }}
                            behavior={Platform.OS === 'ios' ? 'padding' : null}
                        >
                            <ScrollView
                                contentContainerStyle={modal.scrollContent}
                                keyboardShouldPersistTaps="handled"
                                showsVerticalScrollIndicator={false}
                            >
                                {/* Label chips */}
                                <Text style={modal.fieldLabel}>Label</Text>
                                <LabelChips selected={label} onSelect={setLabel} />

                                <InputField
                                    label="Street Address"
                                    isEditing={true}
                                    value={street}
                                    onChangeText={setStreet}
                                    placeholder="123 Main St"
                                />

                                <View style={modal.rowFields}>
                                    <View style={{ flex: 1 }}>
                                        <InputField
                                            label="City"
                                            isEditing={true}
                                            value={city}
                                            onChangeText={setCity}
                                            placeholder="Brussels"
                                        />
                                    </View>
                                    <View style={{ width: 12 }} />
                                    <View style={{ flex: 0.6 }}>
                                        <InputField
                                            label="Postal Code"
                                            isEditing={true}
                                            value={postalCode}
                                            onChangeText={setPostalCode}
                                            placeholder="1000"
                                            keyboardType="numeric"
                                        />
                                    </View>
                                </View>

                                <InputField
                                    label="Country"
                                    isEditing={true}
                                    value={country}
                                    onChangeText={setCountry}
                                    placeholder="Belgium"
                                />
                            </ScrollView>
                        </KeyboardAvoidingView>
                    )}

                    {/* ── Map Tab ── */}
                    {addTab === 'map' && (
                        <View style={{ flex: 1 }}>
                            <View style={modal.chipScrollMap}>
                                <LabelChips selected={mapLabel} onSelect={setMapLabel} />
                            </View>

                            <View style={modal.mapContainer}>
                                {locationLoading ? (
                                    <View style={modal.mapLoader}>
                                        <ActivityIndicator size="large" color="#6366f1" />
                                        <Text style={modal.mapLoaderText}>Getting your location…</Text>
                                    </View>
                                ) : tempCoords ? (
                                    <>
                                        <MapView
                                            style={StyleSheet.absoluteFill}
                                            initialRegion={{
                                                latitude: tempCoords.latitude,
                                                longitude: tempCoords.longitude,
                                                latitudeDelta: 0.01,
                                                longitudeDelta: 0.01,
                                            }}
                                            onRegionChange={(r) =>
                                                setTempCoords({ latitude: r.latitude, longitude: r.longitude })
                                            }
                                        />
                                        {/* Fixed crosshair */}
                                        <View style={cross.container} pointerEvents="none">
                                            <View style={cross.shadow} />
                                            <View style={cross.stem} />
                                            <View style={cross.head}>
                                                <View style={cross.inner} />
                                            </View>
                                        </View>
                                        {/* Coords pill */}
                                        <View style={modal.coordsPill}>
                                            <Ionicons name="location" size={12} color="#6366f1" />
                                            <Text style={modal.coordsText}>
                                                {tempCoords.latitude.toFixed(5)}, {tempCoords.longitude.toFixed(5)}
                                            </Text>
                                        </View>
                                    </>
                                ) : null}
                            </View>

                            <Text style={modal.mapHint}>
                                Pan the map to position the pin exactly where the address is.
                            </Text>
                        </View>
                    )}
                </View>
            </Modal>
        </SafeAreaView>
    );
}

// ─── Stylesheet ───────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#0d0d0d' },
    header: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        paddingHorizontal: 20, paddingVertical: 15,
        borderBottomWidth: 1, borderBottomColor: '#1a1a1a',
    },
    backButton: { padding: 5, marginLeft: -5 },
    headerTitle: { fontSize: 18, fontWeight: '700', color: '#fff' },
    scrollContent: { paddingHorizontal: 16, paddingTop: 20, paddingBottom: 50 },

    emptyState: { alignItems: 'center', paddingVertical: 60, paddingHorizontal: 30 },
    emptyTitle: { fontSize: 18, fontWeight: '700', color: '#444', marginTop: 16, marginBottom: 8 },
    emptySubtitle: { fontSize: 14, color: '#555', textAlign: 'center', lineHeight: 20 },

    addButton: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10,
        marginTop: 12,
        paddingVertical: 16,
        borderRadius: 14,
        borderWidth: 1.5,
        borderColor: '#6366f130',
        backgroundColor: '#6366f108',
        borderStyle: 'dashed',
    },
    addButtonText: { fontSize: 16, color: '#6366f1', fontWeight: '600' },
});

const cardStyles = StyleSheet.create({
    card: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#1a1a1a',
        borderRadius: 14,
        borderWidth: 1,
        borderColor: '#2a2a2a',
        padding: 14,
        marginBottom: 12,
    },
    iconCol: { marginRight: 14 },
    iconBg: {
        width: 44, height: 44, borderRadius: 22,
        backgroundColor: '#6366f115',
        borderWidth: 1, borderColor: '#6366f130',
        justifyContent: 'center', alignItems: 'center',
    },
    info: { flex: 1 },
    titleRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 },
    label: { fontSize: 16, fontWeight: '700', color: '#fff' },
    defaultBadge: {
        backgroundColor: '#10b98120',
        borderRadius: 6,
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderWidth: 1,
        borderColor: '#10b98140',
    },
    defaultBadgeText: { fontSize: 10, color: '#10b981', fontWeight: '700' },
    detail: { fontSize: 13, color: '#888', lineHeight: 18 },
    coords: { fontSize: 11, color: '#555', marginTop: 2 },
    actions: { gap: 8, marginLeft: 8 },
    actionBtn: { padding: 6 },
});

const modal = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#0d0d0d' },
    header: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        paddingHorizontal: 20, paddingVertical: 14,
        borderBottomWidth: 1, borderBottomColor: '#1f1f1f',
    },
    cancel: { fontSize: 16, color: '#888', fontWeight: '500' },
    title: { fontSize: 17, fontWeight: '700', color: '#fff' },
    confirm: { fontSize: 16, color: '#6366f1', fontWeight: '700' },

    tabBar: {
        flexDirection: 'row',
        margin: 16,
        backgroundColor: '#1a1a1a',
        borderRadius: 12,
        padding: 4,
        borderWidth: 1,
        borderColor: '#2a2a2a',
    },
    tab: {
        flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
        paddingVertical: 10, borderRadius: 10, gap: 6,
    },
    tabActive: { backgroundColor: '#6366f1' },
    tabText: { fontSize: 14, color: '#888', fontWeight: '600' },
    tabTextActive: { color: '#fff' },

    scrollContent: { padding: 16, paddingBottom: 40 },
    fieldLabel: { fontSize: 13, color: '#888', marginBottom: 8, fontWeight: '500' },
    input: {
        height: FIELD_HEIGHT,
        backgroundColor: '#2c2c2e',
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#2e2e2e',
        paddingHorizontal: 16,
        fontSize: 16,
        color: '#fff',
        marginBottom: 16,
    },
    rowFields: { flexDirection: 'row' },

    chipScroll: { marginBottom: 20 },
    chipScrollMap: { paddingVertical: 12 },
    chip: {
        paddingHorizontal: 16, paddingVertical: 8,
        borderRadius: 20, borderWidth: 1,
        borderColor: '#2e2e2e',
        backgroundColor: '#2c2c2e',
    },
    chipActive: { backgroundColor: '#6366f1', borderColor: '#6366f1' },
    chipText: { fontSize: 14, color: '#888', fontWeight: '500' },
    chipTextActive: { color: '#fff', fontWeight: '700' },

    mapContainer: { flex: 1, position: 'relative', overflow: 'hidden' },
    mapLoader: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 14 },
    mapLoaderText: { color: '#666', fontSize: 14 },

    coordsPill: {
        position: 'absolute', bottom: 16, alignSelf: 'center',
        flexDirection: 'row', alignItems: 'center', gap: 6,
        backgroundColor: 'rgba(10,10,10,0.85)',
        paddingHorizontal: 14, paddingVertical: 8,
        borderRadius: 20, borderWidth: 1, borderColor: '#2a2a2a',
    },
    coordsText: { fontSize: 12, color: '#ccc', fontWeight: '500' },
    mapHint: {
        fontSize: 13, color: '#555', textAlign: 'center',
        paddingHorizontal: 20, paddingVertical: 14, lineHeight: 18,
    },
});

const cross = StyleSheet.create({
    container: {
        position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
        justifyContent: 'center', alignItems: 'center',
    },
    shadow: {
        position: 'absolute', width: 20, height: 6, borderRadius: 10,
        backgroundColor: 'rgba(0,0,0,0.25)', bottom: '50%', marginBottom: -3,
    },
    stem: {
        position: 'absolute', width: 3, height: 22, backgroundColor: '#6366f1',
        borderRadius: 2, bottom: '50%', marginBottom: 12,
    },
    head: {
        position: 'absolute', width: 32, height: 32, borderRadius: 16,
        backgroundColor: '#6366f1', bottom: '50%', marginBottom: 30,
        justifyContent: 'center', alignItems: 'center',
        shadowColor: '#6366f1', shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.5, shadowRadius: 8, elevation: 6,
    },
    inner: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#fff' },
});
