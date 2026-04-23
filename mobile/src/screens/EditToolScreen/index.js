import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    Alert,
    ActivityIndicator,
    Modal,
    Platform,
    KeyboardAvoidingView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import ThemedSafeAreaView from '../../components/layout/ThemedSafeAreaView';
import { useFocusEffect } from '@react-navigation/native';
import api from '../../api/client';
import * as Location from 'expo-location';
import { Ionicons } from '@expo/vector-icons';
import LabelField from '../../components/form/LabelField';
import { InputField, CategoryField, ToolConditionField } from '../../components/form';
import AvailabilityCalendar from '../../components/calendar/AvailabilityCalendar';
import ToolLocationSelector from '../../components/location/ToolLocationSelector';
import AppMapView from '../../components/ui/AppMapView';
import AppScreenHeader from '../../components/ui/AppScreenHeader';
import { isValidToolCondition } from '../../constants/toolConditions';
import { useTheme } from '../../theme';
import createStyles from './EditToolScreen.styles';

const EditToolScreen = ({ route, navigation }) => {
    const { tool } = route.params;
    const insets = useSafeAreaInsets();
    const { theme } = useTheme();
    const styles = useMemo(() => createStyles(theme), [theme]);
    const initialToolAddress = tool.address
        ? {
            street: tool.address.street || '',
            city: tool.address.city || '',
            country: tool.address.country || '',
        }
        : null;
    const [name, setName] = useState(tool.name || '');
    const [selectedCategory, setSelectedCategory] = useState(tool.category || null);
    const [description, setDescription] = useState(tool.description || '');
    const [price, setPrice] = useState(tool.pricePerDay ? tool.pricePerDay.toString() : '');
    const [replacementValue, setReplacementValue] = useState(tool.replacementValue ? tool.replacementValue.toString() : '');
    const [condition, setCondition] = useState(tool.condition || '');
    const [latitude, setLatitude] = useState(tool.latitude || null);
    const [longitude, setLongitude] = useState(tool.longitude || null);
    const [locationAddress, setLocationAddress] = useState(initialToolAddress); // { street, city, country }
    const [tempCoords, setTempCoords] = useState(null);
    const [showMapModal, setShowMapModal] = useState(false);
    const [locationLoading, setLocationLoading] = useState(false);
    const [loading, setLoading] = useState(false);
    const [locationSource, setLocationSource] = useState('savedAddress');
    const [savedAddresses, setSavedAddresses] = useState([]);
    const [savedAddressesLoading, setSavedAddressesLoading] = useState(false);
    const [selectedSavedAddressId, setSelectedSavedAddressId] = useState(null);
    const hasInitializedSavedLocationRef = useRef(false);

    // Calendar blocks state
    // Calendar blocks state
    const [manualBlockedDates, setManualBlockedDates] = useState(() => {
        const blocks = tool.blocks || [];
        const initialSet = new Set();
        const today = new Date();
        today.setUTCHours(0, 0, 0, 0);

        blocks.forEach(block => {
            if (block.date) {
                const dateObj = new Date(block.date);
                if (dateObj >= today) {
                    initialSet.add(dateObj.toISOString().split('T')[0]);
                }
            }
        });
        return initialSet;
    });
    const [selectionStart, setSelectionStart] = useState(null);

    const todayString = new Date().toISOString().split('T')[0];
    const selectedSavedAddress = useMemo(
        () => savedAddresses.find((address) => address.id === selectedSavedAddressId) || null,
        [savedAddresses, selectedSavedAddressId],
    );

    const hydrateSavedAddresses = useCallback((addresses) => {
        const fallbackAddress = addresses.find((address) => address.isDefault) || addresses[0] || null;

        setSavedAddresses(addresses);
        if (!hasInitializedSavedLocationRef.current) {
            hasInitializedSavedLocationRef.current = true;
            setSelectedSavedAddressId(null);
            setLocationSource(fallbackAddress ? 'savedAddress' : 'map');
            return;
        }

        setSelectedSavedAddressId((currentId) => {
            if (currentId === null) {
                return null;
            }

            if (addresses.some((address) => address.id === currentId)) {
                return currentId;
            }

            return null;
        });

        if (!fallbackAddress) {
            setLocationSource((currentSource) =>
                currentSource === 'savedAddress' ? 'map' : currentSource,
            );
        }
    }, []);

    const loadSavedAddresses = useCallback(async () => {
        setSavedAddressesLoading(true);
        try {
            const response = await api.get('/auth/me');
            hydrateSavedAddresses(response.data?.addresses || []);
        } catch (error) {
            console.error('[EditToolScreen] Failed to load saved addresses:', error);
        } finally {
            setSavedAddressesLoading(false);
        }
    }, [hydrateSavedAddresses]);

    useFocusEffect(
        useCallback(() => {
            loadSavedAddresses();
        }, [loadSavedAddresses]),
    );

    useEffect(() => {
        if (latitude && longitude && !locationAddress?.country) {
            Location.reverseGeocodeAsync({ latitude, longitude })
                .then(([result]) => {
                    if (result) {
                        const street = [result.streetNumber, result.street].filter(Boolean).join(' ');
                        setLocationAddress({
                            street: street || result.name || '',
                            city: result.city || result.district || result.subregion || '',
                            country: result.country || '',
                        });
                    }
                })
                .catch(e => {
                    setLocationAddress({
                        street: `${latitude.toFixed(5)}, ${longitude.toFixed(5)}`,
                        city: '',
                        country: '',
                    });
                });
        }
    }, [latitude, longitude, locationAddress?.country]);

    const openMapPicker = async () => {
        setLocationLoading(true);
        try {
            let { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert('Permission Denied', 'Permission to access location was denied');
                return;
            }

            if (!latitude) {
                let location = await Location.getCurrentPositionAsync({});
                setTempCoords({
                    latitude: location.coords.latitude,
                    longitude: location.coords.longitude
                });
            } else {
                setTempCoords({ latitude, longitude });
            }
            setShowMapModal(true);
        } catch (error) {
            console.error('Error opening map picker:', error);
            Alert.alert('Error', 'Failed to initialize map');
        } finally {
            setLocationLoading(false);
        }
    };

    const confirmLocation = async () => {
        if (tempCoords) {
            setSelectedSavedAddressId(null);
            setLatitude(tempCoords.latitude);
            setLongitude(tempCoords.longitude);
            // Reverse-geocode to get a human-readable address
            try {
                const [result] = await Location.reverseGeocodeAsync(tempCoords);
                if (result) {
                    const street = [
                        result.streetNumber,
                        result.street,
                    ].filter(Boolean).join(' ');
                    setLocationAddress({
                        street: street || result.name || '',
                        city: result.city || result.district || result.subregion || '',
                        country: result.country || '',
                    });
                }
            } catch (e) {
                // Geocode failed — show coordinates as fallback
                setLocationAddress({
                    street: `${tempCoords.latitude.toFixed(5)}, ${tempCoords.longitude.toFixed(5)}`,
                    city: '',
                    country: '',
                });
            }
            setShowMapModal(false);
        }
    };

    const handleSubmit = async () => {
        if (!name || !selectedCategory || !description || !price) {
            Alert.alert('Required Info', 'Please fill in the tool name, category, description and daily price.');
            return;
        }
        if (!isValidToolCondition(condition)) {
            Alert.alert('Condition Required', 'Please select one of the available condition options.');
            return;
        }

        const hasSavedSelection = Boolean(selectedSavedAddress);
        const hasMapSelection = latitude != null && longitude != null;
        const usingSavedAddress = hasSavedSelection;
        const currentAddress = tool.address || {};
        let resolvedLocation = null;

        if (!hasSavedSelection && !hasMapSelection) {
            Alert.alert('Location Missing', 'Please choose a saved address or pin a map location.');
            return;
        }

        if (usingSavedAddress) {
            if (!selectedSavedAddress) {
                Alert.alert('Location Missing', 'Please choose one of your saved addresses.');
                return;
            }
            if (!selectedSavedAddress.country) {
                Alert.alert('Country Missing', 'Please choose a saved address with a valid country.');
                return;
            }
            if (selectedSavedAddress.latitude == null || selectedSavedAddress.longitude == null) {
                Alert.alert(
                    'Address Incomplete',
                    'The selected address has no map coordinates. Please edit it in Addresses or use map pinning.',
                );
                return;
            }
            const savedLatitude = Number(selectedSavedAddress.latitude);
            const savedLongitude = Number(selectedSavedAddress.longitude);
            if (!Number.isFinite(savedLatitude) || !Number.isFinite(savedLongitude)) {
                Alert.alert(
                    'Address Incomplete',
                    'The selected address coordinates are invalid. Please edit it in Addresses or use map pinning.',
                );
                return;
            }

            resolvedLocation = {
                latitude: savedLatitude,
                longitude: savedLongitude,
                label: selectedSavedAddress.label || 'Tool Location',
                street: selectedSavedAddress.street || undefined,
                addressLine2: selectedSavedAddress.addressLine2 || undefined,
                city: selectedSavedAddress.city || undefined,
                state: selectedSavedAddress.state || undefined,
                postalCode: selectedSavedAddress.postalCode || undefined,
                country: selectedSavedAddress.country || undefined,
            };
        } else {
            if (!locationAddress?.country) {
                Alert.alert('Country Missing', 'Please pick a location with a valid country before updating.');
                return;
            }
            resolvedLocation = {
                latitude,
                longitude,
                label: currentAddress.label ?? undefined,
                street: locationAddress?.street || undefined,
                addressLine2: currentAddress.addressLine2 ?? undefined,
                city: locationAddress?.city || undefined,
                state: currentAddress.state ?? undefined,
                postalCode: currentAddress.postalCode ?? undefined,
                country: locationAddress?.country || undefined,
            };
        }

        const isSameNumber = (a, b) => {
            const n1 = Number(a);
            const n2 = Number(b);
            if (!Number.isFinite(n1) && !Number.isFinite(n2)) {
                return true;
            }
            if (!Number.isFinite(n1) || !Number.isFinite(n2)) {
                return false;
            }
            return Math.abs(n1 - n2) < 0.000001;
        };

        const isSameText = (a, b) => (a ?? '') === (b ?? '');
        const nextPricePerDay = parseFloat(price);
        const nextReplacementValue = replacementValue ? parseFloat(replacementValue) : undefined;
        const currentReplacementValue = tool.replacementValue ?? undefined;

        const toolPayload = {};

        if (!isSameText(name, tool.name)) {
            toolPayload.name = name;
        }
        if (selectedCategory?.id && selectedCategory.id !== tool.categoryId) {
            toolPayload.categoryId = selectedCategory.id;
        }
        if (!isSameText(description, tool.description)) {
            toolPayload.description = description;
        }
        if (!isSameNumber(nextPricePerDay, tool.pricePerDay)) {
            toolPayload.pricePerDay = nextPricePerDay;
        }
        if (!isSameNumber(nextReplacementValue, currentReplacementValue)) {
            toolPayload.replacementValue = nextReplacementValue;
        }
        if (!isSameText(condition, tool.condition)) {
            toolPayload.condition = condition;
        }

        const hasLocationChanges =
            !isSameNumber(resolvedLocation.latitude, tool.latitude) ||
            !isSameNumber(resolvedLocation.longitude, tool.longitude) ||
            !isSameText(resolvedLocation.label, currentAddress.label) ||
            !isSameText(resolvedLocation.street, currentAddress.street) ||
            !isSameText(resolvedLocation.addressLine2, currentAddress.addressLine2) ||
            !isSameText(resolvedLocation.city, currentAddress.city) ||
            !isSameText(resolvedLocation.state, currentAddress.state) ||
            !isSameText(resolvedLocation.postalCode, currentAddress.postalCode) ||
            !isSameText(resolvedLocation.country, currentAddress.country);

        if (hasLocationChanges) {
            toolPayload.latitude = resolvedLocation.latitude;
            toolPayload.longitude = resolvedLocation.longitude;
            toolPayload.label = resolvedLocation.label;
            toolPayload.street = resolvedLocation.street;
            toolPayload.addressLine2 = resolvedLocation.addressLine2;
            toolPayload.city = resolvedLocation.city;
            toolPayload.state = resolvedLocation.state;
            toolPayload.postalCode = resolvedLocation.postalCode;
            toolPayload.country = resolvedLocation.country;
        }

        const futureBlockedDates = Array.from(manualBlockedDates)
            .filter((date) => date >= todayString)
            .sort();
        const initialFutureBlockedDates = Array.from(
            new Set(
                (tool.blocks || [])
                    .map((block) =>
                        block?.date ? new Date(block.date).toISOString().split('T')[0] : null,
                    )
                    .filter((date) => date && date >= todayString),
            ),
        ).sort();
        const hasAvailabilityChanges =
            futureBlockedDates.length !== initialFutureBlockedDates.length ||
            futureBlockedDates.some((date, index) => date !== initialFutureBlockedDates[index]);
        const hasToolChanges = Object.keys(toolPayload).length > 0;

        if (!hasToolChanges && !hasAvailabilityChanges) {
            Alert.alert('No Changes', 'Nothing changed, so there is nothing to save.');
            return;
        }

        setLoading(true);
        try {
            if (hasToolChanges) {
                await api.patch(`/tools/${tool.id}`, toolPayload);
            }

            if (hasAvailabilityChanges) {
                await api.patch(`/tools/${tool.id}/availability`, {
                    manualBlockedDates: futureBlockedDates,
                });
            }

            Alert.alert('Success!', 'Your tool has been updated.', [
                { text: 'Great!', onPress: () => navigation.goBack() }
            ]);
        } catch (error) {
            const msg = error.response?.data?.message;
            const finalMessage = Array.isArray(msg) ? msg.join('\n') : (msg || 'Failed to update tool.');
            Alert.alert('Update Warning', finalMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <ThemedSafeAreaView>
            <AppScreenHeader
                title="Edit your tool"
                onBack={() => navigation.goBack()}
                iconName="close"
                right={<View style={styles.headerRightSpacer} />}
            />

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1 }}
            >
                <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                    <View style={styles.form}>
                        <View style={styles.section}>
                            <InputField
                                label="Tool name *"
                                isEditing={true}
                                value={name}
                                onChangeText={setName}
                                placeholder="Tool name (e.g. Bosch Hammer Drill)"
                            />
                            <CategoryField
                                label="Category *"
                                isEditing={true}
                                value={selectedCategory}
                                onSelect={setSelectedCategory}
                            />
                            <InputField
                                label="Description *"
                                isEditing={true}
                                value={description}
                                onChangeText={setDescription}
                                placeholder="Tell us more about your tool..."
                                multiline
                                numberOfLines={4}
                                style={styles.descriptionInput}
                            />
                        </View>

                        <View style={styles.section}>
                            <InputField
                                label="Price per day (EUR) *"
                                isEditing={true}
                                value={price}
                                onChangeText={setPrice}
                                placeholder="15.00"
                                keyboardType="decimal-pad"
                            />
                            <InputField
                                label="Replacement value (EUR)"
                                isEditing={true}
                                value={replacementValue}
                                onChangeText={setReplacementValue}
                                placeholder="0.00"
                                keyboardType="decimal-pad"
                            />
                        </View>

                        <View style={styles.section}>
                            <ToolConditionField
                                label="Condition *"
                                isEditing={true}
                                value={condition}
                                onSelect={setCondition}
                            />
                        </View>

                        <View style={styles.section}>
                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                <LabelField>Availability (Optional)</LabelField>
                            </View>
                            <Text style={[styles.locationSub, { marginBottom: 10 }]}>Select a start and end date to block out a range of days (up to 3 weeks in advance).</Text>
                            <AvailabilityCalendar
                                manualBlockedDates={manualBlockedDates}
                                onManualBlockedDatesChange={setManualBlockedDates}
                                selectionStart={selectionStart}
                                onSelectionStartChange={setSelectionStart}
                            />
                        </View>

                        <View style={styles.section}>
                            <LabelField>Location</LabelField>
                            <ToolLocationSelector
                                locationSource={locationSource}
                                onChangeLocationSource={(nextSource) => {
                                    setLocationSource(nextSource);
                                }}
                                mapLocation={{ latitude, longitude, address: locationAddress }}
                                locationLoading={locationLoading}
                                savedAddressesLoading={savedAddressesLoading}
                                onPressMapLocation={openMapPicker}
                                savedAddresses={savedAddresses}
                                selectedSavedAddressId={selectedSavedAddressId}
                                onSelectSavedAddressId={(addressId) => {
                                    setSelectedSavedAddressId(addressId);
                                    setLatitude(null);
                                    setLongitude(null);
                                    setLocationAddress(null);
                                }}
                                onManageAddresses={() => navigation.navigate('Addresses')}
                            />
                        </View>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>

            <View style={styles.footer}>
                <TouchableOpacity
                    style={[styles.submitButton, loading && styles.disabledButton]}
                    onPress={handleSubmit}
                    disabled={loading}
                >
                    {loading ? (
                        <ActivityIndicator color={theme.colors.accentContrast} />
                    ) : (
                        <Text style={styles.submitButtonText}>Save Changes</Text>
                    )}
                </TouchableOpacity>
            </View>

            {/* ── Map Modal ───────────────── */}
            <Modal
                visible={showMapModal}
                animationType="slide"
                statusBarTranslucent
            >
                <View style={styles.modalContainer}>
                    {/* ── Top bar — uses insets.top for reliable notch/island clearance ── */}
                    <View style={[styles.modalTopBar, { paddingTop: insets.top + 12 }]}>
                        <Text style={styles.modalTitle}>Pin Pickup Location</Text>
                        <Text style={styles.modalSubtitle}>Move the map — the pin stays centred</Text>
                    </View>

                    {/* ── Map + fixed centre-pin ───────────────────────── */}
                    <View style={styles.mapWrapper}>
                        <AppMapView
                            style={StyleSheet.absoluteFill}
                            initialRegion={{
                                latitude: tempCoords?.latitude || 50.8503,
                                longitude: tempCoords?.longitude || 4.3517,
                                latitudeDelta: 0.01,
                                longitudeDelta: 0.01,
                            }}
                            onRegionChange={(region) => {
                                // Live-update coords as user pans
                                setTempCoords({ latitude: region.latitude, longitude: region.longitude });
                            }}
                        />

                        {/* Fixed crosshair — always centre of the view */}
                        <View style={styles.crosshairContainer} pointerEvents="none">
                            {/* Shadow dot on the ground */}
                            <View style={styles.crosshairShadow} />
                            {/* Pin stem */}
                            <View style={styles.crosshairStem} />
                            {/* Pin head */}
                            <View style={styles.crosshairHead}>
                                <View style={styles.crosshairInner} />
                            </View>
                        </View>
                    </View>

                    {/* ── Sticky bottom action bar ─────────────────────────── */}
                    <View style={[styles.modalBottomBar, { paddingBottom: insets.bottom }]}>
                        <View style={styles.modalActions}>
                            <TouchableOpacity
                                style={styles.modalCancelBtn}
                                onPress={() => setShowMapModal(false)}
                            >
                                <Text style={styles.modalCancelText}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={styles.modalConfirmBtn}
                                onPress={confirmLocation}
                            >
                                <Ionicons name="checkmark" size={18} color={theme.colors.accentContrast} style={{ marginRight: 6 }} />
                                <Text style={styles.modalConfirmText}>Confirm Location</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </ThemedSafeAreaView>
    );
};

export default EditToolScreen;


