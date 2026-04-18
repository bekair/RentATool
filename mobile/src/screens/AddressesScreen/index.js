import React, { useState, useRef, useEffect, useMemo } from 'react';
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
    LogBox,
} from 'react-native';
import validator from 'validator';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import ThemedSafeAreaView from '../../components/layout/ThemedSafeAreaView';
import { Ionicons } from '@expo/vector-icons';
import MapView from 'react-native-maps';
import * as Location from 'expo-location';
import { useAuth } from '../../context/AuthContext';
import { InputField, CountryField } from '../../components/form';
import AppScreenHeader from '../../components/ui/AppScreenHeader';
import api from '../../api/client';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
import Constants from 'expo-constants';
import { useTheme } from '../../theme';
import createStyles from './AddressesScreen.styles';

const GOOGLE_API_KEY = Constants.expoConfig?.extra?.googleMapsApiKey;

const ADDRESS_TYPES = ['Home', 'Work', 'Workshop', 'Office'];

// Ignore the VirtualizedList warning caused by GooglePlacesAutocomplete inside ScrollView
LogBox.ignoreLogs(['VirtualizedLists should never be nested']);

function LabelChips({ selected, onSelect }) {
    const { theme } = useTheme();
    const { chipRow } = useMemo(() => createStyles(theme), [theme]);
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
                        <Ionicons name="add" size={14} color={theme.colors.accent} />
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
                        placeholderTextColor={theme.colors.fieldPlaceholder}
                        onSubmitEditing={confirmCustom}
                        returnKeyType="done"
                        maxLength={30}
                    />
                    <TouchableOpacity style={chipRow.customConfirm} onPress={confirmCustom}>
                        <Ionicons name="checkmark" size={18} color={theme.colors.accentContrast} />
                    </TouchableOpacity>
                    <TouchableOpacity style={chipRow.customCancel} onPress={cancelCustom}>
                        <Ionicons name="close" size={18} color={theme.colors.iconMuted} />
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
    const { theme } = useTheme();
    const { cardStyles } = useMemo(() => createStyles(theme), [theme]);

    return (
        <View style={cardStyles.card}>
            <View style={cardStyles.iconCol}>
                <View style={cardStyles.iconBg}>
                    <Ionicons
                        name={address.label === 'Home' ? 'home' : address.label === 'Work' ? 'briefcase' : 'location'}
                        size={20}
                        color={theme.colors.accent}
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
                {address.addressLine2 ? (
                    <Text style={cardStyles.detail}>{address.addressLine2}</Text>
                ) : null}
                {(address.city || address.country) ? (
                    <Text style={cardStyles.detail}>
                        {[address.city, address.state, address.postalCode, address.country].filter(Boolean).join(', ')}
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
                        <Ionicons name="star-outline" size={18} color={theme.colors.iconMuted} />
                    </TouchableOpacity>
                )}
                <TouchableOpacity style={cardStyles.actionBtn} onPress={() => onDelete(address.id)}>
                    <Ionicons name="trash-outline" size={18} color={theme.colors.danger} />
                </TouchableOpacity>
            </View>
        </View>
    );
}

// ─── Main Screen ─────────────────────────────────────────────────────────────
export default function AddressesScreen({ navigation }) {
    const { user } = useAuth();
    const insets = useSafeAreaInsets();
    const { theme } = useTheme();
    const { styles, modal, cross } = useMemo(() => createStyles(theme), [theme]);

    const [addresses, setAddresses] = useState(user?.addresses || []);
    const [showAddModal, setShowAddModal] = useState(false);
    const [actionLoading, setActionLoading] = useState(false);
    const [loadingAddresses, setLoadingAddresses] = useState(false);

    // Fetch addresses from API on mount
    useEffect(() => {
        const fetchAddresses = async () => {
            setLoadingAddresses(true);
            try {
                const response = await api.get('/auth/me');
                setAddresses(response.data?.addresses || []);
            } catch (err) {
                console.error('[AddressesScreen] Failed to load addresses:', err);
            } finally {
                setLoadingAddresses(false);
            }
        };
        fetchAddresses();
    }, []);

    // Add-modal state
    const [addTab, setAddTab] = useState('manual'); // 'manual' | 'map'

    // Manual form
    const [label, setLabel] = useState('Home');
    const [street, setStreet] = useState('');
    const [addressLine2, setAddressLine2] = useState('');
    const [city, setCity] = useState('');
    const [state, setState] = useState('');
    const [postalCode, setPostalCode] = useState('');
    const [country, setCountry] = useState('');
    const [countryCode, setCountryCode] = useState('');
    const [manualLat, setManualLat] = useState(null);
    const [manualLng, setManualLng] = useState(null);

    // Map state
    const [mapReady, setMapReady] = useState(false);
    const [locationLoading, setLocationLoading] = useState(false);
    const [tempCoords, setTempCoords] = useState(null);
    const [mapLabel, setMapLabel] = useState('Home');

    const handleManualChange = (setter) => (val) => {
        setter(val);
        setManualLat(null);
        setManualLng(null);
    };

    const resetForm = () => {
        setLabel('Home');
        setStreet('');
        setAddressLine2('');
        setCity('');
        setState('');
        setPostalCode('');
        setCountry('');
        setCountryCode('');
        setManualLat(null);
        setManualLng(null);
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

    const [mapSaving, setMapSaving] = useState(false);

    const confirmMapAddress = async () => {
        if (!tempCoords) return;
        setMapSaving(true);
        try {
            let resolvedStreet = '';
            let resolvedCity = '';
            let resolvedState = '';
            let resolvedPostalCode = '';
            let resolvedCountry = '';

            try {
                const [result] = await Location.reverseGeocodeAsync(tempCoords);
                if (result) {
                    resolvedStreet = [result.streetNumber, result.street]
                        .filter(Boolean).join(' ') || result.name || '';
                    resolvedCity = result.city || result.district || result.subregion || '';
                    resolvedState = result.region || '';
                    resolvedPostalCode = result.postalCode || '';
                    resolvedCountry = result.country || '';
                }
            } catch {
                // geocode failed — coords will still be saved
            }

            const newAddr = {
                label: mapLabel,
                street: resolvedStreet,
                city: resolvedCity,
                state: resolvedState,
                postalCode: resolvedPostalCode,
                country: resolvedCountry,
                latitude: tempCoords.latitude,
                longitude: tempCoords.longitude,
                isDefault: addresses.length === 0,
            };

            const response = await api.post('/users/me/addresses', newAddr);
            setAddresses(response.data.addresses || []);
            user.updateCurrentUser && user.updateCurrentUser(response.data);

            setShowAddModal(false);
            resetForm();
        } catch (err) {
            Alert.alert('Error', 'Failed to save address.');
        } finally {
            setMapSaving(false);
        }
    };

    // ── Manual helpers ───────────────────────────────────────────────────────
    const confirmManualAddress = async () => {
        if (!street.trim() && !city.trim()) {
            Alert.alert('Missing Info', 'Please enter at least a street or city.');
            return;
        }

        // Validate Postal Code if country is selected
        if (postalCode.trim() && countryCode) {
            try {
                if (!validator.isPostalCode(postalCode.trim(), countryCode)) {
                    Alert.alert('Invalid Postal Code', `The postal code format for ${country} is invalid.`);
                    return;
                }
            } catch (err) {
                // validator throws an error if the countryCode locale isn't supported.
                // If it's unsupported, we just skip validation rather than crashing.
            }
        }

        let finalLat = manualLat;
        let finalLng = manualLng;

        if (!finalLat || !finalLng) {
            try {
                const query = [street, city, state, postalCode, country].filter(Boolean).join(', ');
                if (query.length > 5) {
                    const results = await Location.geocodeAsync(query);
                    if (results && results.length > 0) {
                        finalLat = results[0].latitude;
                        finalLng = results[0].longitude;
                    }
                }
            } catch (err) {
                console.log('[confirmManualAddress] geocode fallback failed:', err.message);
            }
        }

        setActionLoading(true);
        try {
            const newAddr = {
                label,
                street: street.trim(),
                addressLine2: addressLine2.trim() || undefined,
                city: city.trim(),
                state: state.trim(),
                postalCode: postalCode.trim(),
                country: country.trim(),
                latitude: finalLat,
                longitude: finalLng,
                isDefault: addresses.length === 0,
            };
            const response = await api.post('/users/me/addresses', newAddr);
            setAddresses(response.data.addresses || []);
            user.updateCurrentUser && user.updateCurrentUser(response.data);

            setShowAddModal(false);
            resetForm();
        } catch (err) {
            Alert.alert('Error', 'Failed to save address.');
        } finally {
            setActionLoading(false);
        }
    };

    const deleteAddress = (id) => {
        Alert.alert('Remove Address', 'Are you sure you want to remove this address?', [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Remove', style: 'destructive',
                onPress: async () => {
                    setActionLoading(true);
                    try {
                        const res = await api.delete(`/users/me/addresses/${id}`);
                        // To keep it simple, just fetch me again if delete responds success
                        const profilePayload = await api.get('/auth/me');
                        setAddresses(profilePayload.data.addresses || []);
                        user.updateCurrentUser && user.updateCurrentUser(profilePayload.data);
                    } catch (err) {
                        Alert.alert('Error', 'Failed to remove address.');
                    } finally {
                        setActionLoading(false);
                    }
                },
            },
        ]);
    };

    const setDefault = async (id) => {
        setActionLoading(true);
        try {
            const response = await api.patch(`/users/me/addresses/${id}`, { isDefault: true });
            setAddresses(response.data.addresses || []);
            user.updateCurrentUser && user.updateCurrentUser(response.data);
        } catch (err) {
            Alert.alert('Error', 'Failed to set default address.');
        } finally {
            setActionLoading(false);
        }
    };

    return (
        <ThemedSafeAreaView>
            <AppScreenHeader title="Addresses" onBack={() => navigation.goBack()} />

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                {loadingAddresses ? (
                    <ActivityIndicator size="large" color={theme.colors.accent} style={{ marginTop: 60 }} />
                ) : addresses.length === 0 ? (
                    <View style={styles.emptyState}>
                        <Ionicons name="location-outline" size={52} color={theme.colors.borderStrong} />
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
                    <Ionicons name="add-circle-outline" size={22} color={theme.colors.accent} />
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
                            disabled={mapSaving || actionLoading}
                        >
                            {(mapSaving || actionLoading)
                                ? <ActivityIndicator size="small" color={theme.colors.accent} />
                                : <Text style={modal.confirm}>Add</Text>
                            }
                        </TouchableOpacity>
                    </View>

                    {/* Tab Toggle */}
                    <View style={modal.tabBar}>
                        <TouchableOpacity
                            style={[modal.tab, addTab === 'manual' && modal.tabActive]}
                            onPress={() => setAddTab('manual')}
                        >
                            <Ionicons name="create-outline" size={16} color={addTab === 'manual' ? theme.colors.accentContrast : theme.colors.iconMuted} />
                            <Text style={[modal.tabText, addTab === 'manual' && modal.tabTextActive]}>Manual</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[modal.tab, addTab === 'map' && modal.tabActive]}
                            onPress={switchToMap}
                        >
                            <Ionicons name="map-outline" size={16} color={addTab === 'map' ? theme.colors.accentContrast : theme.colors.iconMuted} />
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

                                {/* Address search — for lookup only, not saved directly */}
                                <View style={{ zIndex: 1, marginBottom: 16 }}>
                                    <Text style={modal.fieldLabel}>Address</Text>
                                    <GooglePlacesAutocomplete
                                        placeholder="Search your address..."
                                        fetchDetails={true}
                                        debounce={400}
                                        minLength={3}
                                        onPress={(data, details = null) => {
                                            if (!details) return;
                                            console.log('[GPlaces] address_components:', JSON.stringify(details.address_components, null, 2));
                                            let stNumber = '';
                                            let stName = '';
                                            let tempLocality = '';
                                            let tempPostalTown = '';
                                            let tempAdminArea = '';
                                            let tempAdminAreaLevel1 = '';

                                            details.address_components.forEach(component => {
                                                const types = component.types;
                                                if (types.includes('street_number')) stNumber = component.long_name;
                                                if (types.includes('route')) stName = component.long_name;

                                                if (types.includes('locality')) tempLocality = component.long_name;
                                                if (types.includes('postal_town')) tempPostalTown = component.long_name;
                                                if (types.includes('administrative_area_level_2')) tempAdminArea = component.long_name;
                                                if (types.includes('administrative_area_level_1')) tempAdminAreaLevel1 = component.long_name;

                                                if (types.includes('postal_code')) {
                                                    setPostalCode(component.long_name);
                                                }
                                                if (types.includes('country')) {
                                                    setCountry(component.long_name);
                                                    setCountryCode(component.short_name);
                                                }
                                            });

                                            const computedStreet = `${stNumber} ${stName}`.trim();
                                            setStreet(computedStreet || data.description);

                                            // Smart city resolution:
                                            // Google's hierarchy varies by country. For Turkey-style addresses:
                                            //   - no locality at all
                                            //   - admin_level_2 = district (Çankaya)
                                            //   - admin_level_1 = province/city (Ankara)
                                            // In that case admin_level_1 is what the user recognises as "the city".
                                            //
                                            // For Western-style addresses:
                                            //   - locality = city (Brussels, San Francisco)
                                            //   - admin_level_1 = state/region
                                            //
                                            // UK uses postal_town as the city equivalent.
                                            const noLocalCity = !tempLocality && !tempPostalTown;

                                            const computedCity =
                                                tempPostalTown ||
                                                tempLocality ||
                                                (noLocalCity && tempAdminAreaLevel1
                                                    ? tempAdminAreaLevel1
                                                    : tempAdminArea) ||
                                                tempAdminAreaLevel1 ||
                                                '';

                                            // State: only set if it differs from city (avoids "Ankara / Ankara")
                                            const computedState =
                                                tempAdminAreaLevel1 && tempAdminAreaLevel1 !== computedCity
                                                    ? tempAdminAreaLevel1
                                                    : '';

                                            if (computedCity) setCity(computedCity);
                                            setState(computedState);

                                            if (details.geometry && details.geometry.location) {
                                                setManualLat(details.geometry.location.lat);
                                                setManualLng(details.geometry.location.lng);
                                            }
                                        }}
                                        query={{
                                            key: GOOGLE_API_KEY,
                                            language: 'en',
                                        }}
                                        textInputProps={{
                                            placeholderTextColor: theme.colors.fieldPlaceholder,
                                        }}
                                        styles={{
                                            textInput: {
                                                height: 56,
                                                backgroundColor: theme.colors.fieldEditingBg,
                                                borderRadius: 10,
                                                borderWidth: 1,
                                                borderColor: theme.colors.fieldEditingBorder,
                                                color: theme.colors.textPrimary,
                                                paddingHorizontal: 16,
                                                fontSize: 16,
                                            },
                                            container: { flex: 0 },
                                            listView: {
                                                backgroundColor: theme.colors.fieldReadOnlyBg,
                                                borderRadius: 10,
                                                marginTop: 4,
                                                position: 'absolute',
                                                top: 60, left: 0, right: 0,
                                                zIndex: 999,
                                                borderWidth: 1,
                                                borderColor: theme.colors.borderStrong,
                                            },
                                            row: {
                                                backgroundColor: theme.colors.fieldReadOnlyBg,
                                                padding: 13,
                                                height: 48,
                                                flexDirection: 'row',
                                                borderBottomWidth: 1,
                                                borderBottomColor: theme.colors.border,
                                            },
                                            description: { color: theme.colors.textSecondary },
                                        }}
                                        enablePoweredByContainer={false}
                                    />
                                </View>

                                <InputField
                                    label="Street"
                                    isEditing={true}
                                    value={street}
                                    onChangeText={handleManualChange(setStreet)}
                                    placeholder="e.g. Rue de la Loi 16"
                                />

                                <InputField
                                    label="Address Line 2"
                                    isEditing={true}
                                    value={addressLine2}
                                    onChangeText={handleManualChange(setAddressLine2)}
                                    placeholder="Apt, suite, floor, unit… (optional)"
                                />

                                <CountryField
                                    label="Country"
                                    isEditing={true}
                                    value={country}
                                    onSelect={(c) => {
                                        setCountry(c.name);
                                        setCountryCode(c.code);
                                        setManualLat(null);
                                        setManualLng(null);
                                    }}
                                />

                                <View style={modal.rowFields}>
                                    <View style={{ flex: 1 }}>
                                        <InputField
                                            label="Postal Code"
                                            isEditing={true}
                                            value={postalCode}
                                            onChangeText={handleManualChange(setPostalCode)}
                                            placeholder="3210"
                                        />
                                    </View>
                                </View>

                                <View style={modal.rowFields}>
                                    <View style={{ flex: 1 }}>
                                        <InputField
                                            label="City"
                                            isEditing={true}
                                            value={city}
                                            onChangeText={handleManualChange(setCity)}
                                            placeholder="Brussels"
                                        />
                                    </View>
                                    <View style={{ width: 12 }} />
                                    <View style={{ flex: 1 }}>
                                        <InputField
                                            label="State / Province"
                                            isEditing={true}
                                            value={state}
                                            onChangeText={handleManualChange(setState)}
                                            placeholder="Vlaams-Brabant"
                                        />
                                    </View>
                                </View>
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
                                        <ActivityIndicator size="large" color={theme.colors.accent} />
                                        <Text style={modal.mapLoaderText}>Getting your location…</Text>
                                    </View>
                                ) : tempCoords ? (
                                    <>
                                        <MapView
                                            style={StyleSheet.absoluteFill}
                                            userInterfaceStyle={theme.id}
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
                                            <Ionicons name="location" size={12} color={theme.colors.accent} />
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
        </ThemedSafeAreaView>
    );
}
