import React, { useCallback, useMemo, useRef, useState } from 'react';
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
import { Calendar } from 'react-native-calendars';
import { useFocusEffect } from '@react-navigation/native';
import api from '../../api/client';
import * as Location from 'expo-location';
import { Ionicons } from '@expo/vector-icons';
import LabelField from '../../components/form/LabelField';
import { InputField, CategoryField, ToolConditionField } from '../../components/form';
import ToolLocationSelector from '../../components/location/ToolLocationSelector';
import AppButton from '../../components/ui/AppButton';
import AppMapView from '../../components/ui/AppMapView';
import AppScreenHeader from '../../components/ui/AppScreenHeader';
import styles from './AddToolScreen.styles';

const AddToolScreen = ({ navigation }) => {
    const insets = useSafeAreaInsets();
    const [name, setName] = useState('');
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [description, setDescription] = useState('');
    const [price, setPrice] = useState('');
    const [replacementValue, setReplacementValue] = useState('');
    const [condition, setCondition] = useState('');
    const [latitude, setLatitude] = useState(null);
    const [longitude, setLongitude] = useState(null);
    const [locationAddress, setLocationAddress] = useState(null); // { street, city, country }
    const [tempCoords, setTempCoords] = useState(null);
    const [showMapModal, setShowMapModal] = useState(false);
    const [locationLoading, setLocationLoading] = useState(false);
    const [loading, setLoading] = useState(false);
    const [locationSource, setLocationSource] = useState('map');
    const [savedAddresses, setSavedAddresses] = useState([]);
    const [savedAddressesLoading, setSavedAddressesLoading] = useState(false);
    const [selectedSavedAddressId, setSelectedSavedAddressId] = useState(null);
    const [hasAttemptedPublish, setHasAttemptedPublish] = useState(false);
    const hasInitializedSavedLocationRef = useRef(false);

    // Calendar blocks state
    const [manualBlockedDates, setManualBlockedDates] = useState(new Set());
    const [selectionStart, setSelectionStart] = useState(null);

    const maxDateObj = new Date();
    maxDateObj.setDate(maxDateObj.getDate() + 21);
    const maxDateString = maxDateObj.toISOString().split('T')[0];
    const todayString = new Date().toISOString().split('T')[0];
    const selectedSavedAddress = useMemo(
        () => savedAddresses.find((address) => address.id === selectedSavedAddressId) || null,
        [savedAddresses, selectedSavedAddressId],
    );
    const parsedPrice = Number(price);
    const isBasicInfoReady =
        Boolean(name.trim()) &&
        Boolean(selectedCategory?.id) &&
        Boolean(description.trim()) &&
        Boolean(price.trim()) &&
        Number.isFinite(parsedPrice) &&
        parsedPrice > 0 &&
        Boolean(condition);
    const isMapLocationReady =
        latitude != null &&
        longitude != null &&
        Boolean(locationAddress?.country);
    const savedLatitude = Number(selectedSavedAddress?.latitude);
    const savedLongitude = Number(selectedSavedAddress?.longitude);
    const isSavedAddressReady =
        Boolean(selectedSavedAddress) &&
        Boolean(selectedSavedAddress?.country) &&
        Number.isFinite(savedLatitude) &&
        Number.isFinite(savedLongitude);
    const isLocationReady =
        locationSource === 'savedAddress' ? isSavedAddressReady : isMapLocationReady;
    const canPublishListing = isBasicInfoReady && isLocationReady && !loading;
    const showErrors = hasAttemptedPublish;
    const nameError = !name.trim() ? 'Tool name is required.' : null;
    const categoryError = !selectedCategory?.id ? 'Category is required.' : null;
    const descriptionError = !description.trim() ? 'Description is required.' : null;
    const priceError = !price.trim()
        ? 'Daily price is required.'
        : !Number.isFinite(parsedPrice) || parsedPrice <= 0
            ? 'Enter a valid price greater than 0.'
            : null;
    const conditionError = !condition ? 'Condition is required.' : null;
    const locationError =
        locationSource === 'savedAddress'
            ? !selectedSavedAddress
                ? 'Select a saved address.'
                : !selectedSavedAddress?.country
                    ? 'Saved address must include country.'
                    : !Number.isFinite(savedLatitude) || !Number.isFinite(savedLongitude)
                        ? 'Saved address must include valid coordinates.'
                        : null
            : latitude == null || longitude == null
                ? 'Pin location on map.'
                : !locationAddress?.country
                    ? 'Map location must include country.'
                    : null;

    const hydrateSavedAddresses = useCallback((addresses) => {
        const fallbackAddress = addresses.find((address) => address.isDefault) || addresses[0] || null;
        setSavedAddresses(addresses);
        setSelectedSavedAddressId((currentId) => {
            if (hasInitializedSavedLocationRef.current && currentId === null) {
                return null;
            }
            if (currentId && addresses.some((address) => address.id === currentId)) {
                return currentId;
            }
            return fallbackAddress?.id || null;
        });
        setLocationSource((currentSource) => {
            if (!hasInitializedSavedLocationRef.current) {
                hasInitializedSavedLocationRef.current = true;
                return fallbackAddress ? 'savedAddress' : 'map';
            }
            if (!fallbackAddress && currentSource === 'savedAddress') {
                return 'map';
            }
            return currentSource;
        });
    }, []);

    const loadSavedAddresses = useCallback(async () => {
        setSavedAddressesLoading(true);
        try {
            const response = await api.get('/auth/me');
            hydrateSavedAddresses(response.data?.addresses || []);
        } catch (error) {
            console.error('[AddToolScreen] Failed to load saved addresses:', error);
        } finally {
            setSavedAddressesLoading(false);
        }
    }, [hydrateSavedAddresses]);

    useFocusEffect(
        useCallback(() => {
            loadSavedAddresses();
        }, [loadSavedAddresses]),
    );


    const handleDayPress = (day) => {
        const dateString = day.dateString;

        // Prevent tapping past dates or beyond 3 weeks
        if (dateString < todayString || dateString > maxDateString) {
            Alert.alert('Invalid Date', 'You can only block dates within the next 3 weeks.');
            return;
        }

        // Single tap to unblock an already blocked date
        if (manualBlockedDates.has(dateString)) {
            setManualBlockedDates(prev => {
                const newSet = new Set(prev);
                newSet.delete(dateString);
                return newSet;
            });
            setSelectionStart(null);
            return;
        }

        // If no selection start, start one
        if (!selectionStart) {
            setSelectionStart(dateString);
        } else {
            // End date selection
            if (dateString < selectionStart) {
                // Tapped before start date -> make it the new start date
                setSelectionStart(dateString);
            } else {
                // Tapped after start date -> fill the range
                const newBlocks = new Set(manualBlockedDates);
                let cursor = selectionStart;

                while (cursor <= dateString) {
                    newBlocks.add(cursor);
                    // Increment date using UTC-safe arithmetic
                    const d = new Date(cursor + 'T00:00:00Z');
                    d.setUTCDate(d.getUTCDate() + 1);
                    cursor = d.toISOString().split('T')[0];
                }

                setManualBlockedDates(newBlocks);
                setSelectionStart(null); // finish selection
            }
        }
    };

    const markedDates = React.useMemo(() => {
        const marks = {};

        // Render blocked dates as periods
        manualBlockedDates.forEach(date => {
            const dStr = date;
            const d = new Date(dStr + 'T00:00:00Z');
            const prev = new Date(d); prev.setUTCDate(prev.getUTCDate() - 1);
            const next = new Date(d); next.setUTCDate(next.getUTCDate() + 1);

            const prevStr = prev.toISOString().split('T')[0];
            const nextStr = next.toISOString().split('T')[0];

            marks[dStr] = {
                color: '#4a4a5a',
                textColor: '#fff',
                startingDay: !manualBlockedDates.has(prevStr),
                endingDay: !manualBlockedDates.has(nextStr),
            };
        });

        // Add the active selection overlay
        if (selectionStart) {
            marks[selectionStart] = {
                ...marks[selectionStart],
                startingDay: true,
                endingDay: true,
                color: '#6366f1',
                textColor: 'white',
            };
        }

        return marks;
    }, [manualBlockedDates, selectionStart]);

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
        setHasAttemptedPublish(true);

        if (!name || !selectedCategory || !description || !price) {
            Alert.alert('Required Info', 'Please fill in the tool name, category, description and daily price.');
            return;
        }
        if (!Number.isFinite(parsedPrice) || parsedPrice <= 0) {
            Alert.alert('Invalid Price', 'Please enter a valid daily price greater than 0.');
            return;
        }
        if (!condition) {
            Alert.alert('Condition Required', 'Please select the tool condition before publishing.');
            return;
        }

        const usingSavedAddress = locationSource === 'savedAddress';
        let resolvedLocation = null;

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
            if (latitude == null || longitude == null) {
                Alert.alert('Location Missing', 'Please select where the tool is located on the map.');
                return;
            }
            if (!locationAddress?.country) {
                Alert.alert('Country Missing', 'Please pick a location with a valid country before listing.');
                return;
            }

            resolvedLocation = {
                latitude,
                longitude,
                label: 'Tool Location',
                street: locationAddress?.street || undefined,
                addressLine2: undefined,
                city: locationAddress?.city || undefined,
                state: undefined,
                postalCode: undefined,
                country: locationAddress?.country || undefined,
            };
        }

        setLoading(true);
        try {
            const response = await api.post('/tools', {
                name,
                categoryId: selectedCategory.id,
                description,
                pricePerDay: parsedPrice,
                replacementValue: replacementValue ? parseFloat(replacementValue) : undefined,
                condition,
                latitude: resolvedLocation.latitude,
                longitude: resolvedLocation.longitude,
                label: resolvedLocation.label,
                street: resolvedLocation.street,
                addressLine2: resolvedLocation.addressLine2,
                city: resolvedLocation.city,
                state: resolvedLocation.state,
                postalCode: resolvedLocation.postalCode,
                country: resolvedLocation.country,
            });
            const createdTool = response.data;

            // If user selected any calendar dates, block them immediately
            if (manualBlockedDates.size > 0) {
                await api.patch(`/tools/${createdTool.id}/availability`, {
                    manualBlockedDates: Array.from(manualBlockedDates)
                });
            }

            Alert.alert('Success!', 'Your tool is now live on the marketplace.', [
                { text: 'Great!', onPress: () => navigation.goBack() }
            ]);
        } catch (error) {
            console.error('Error listing tool:', error);
            Alert.alert('Error', error.response?.data?.message || 'Failed to list tool');
        } finally {
            setLoading(false);
        }
    };

    return (
        <ThemedSafeAreaView>
            <AppScreenHeader
                title="List your tool"
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
                                placeholder="e.g. Bosch Hammer Drill"
                                error={showErrors ? nameError : null}
                            />
                            <CategoryField
                                label="Category *"
                                isEditing={true}
                                value={selectedCategory}
                                onSelect={setSelectedCategory}
                                error={showErrors ? categoryError : null}
                            />
                            <InputField
                                label="Description *"
                                isEditing={true}
                                value={description}
                                onChangeText={setDescription}
                                placeholder="Tell us more about your tool..."
                                multiline
                                numberOfLines={4}
                                style={{ height: 100 }}
                                error={showErrors ? descriptionError : null}
                            />
                            <InputField
                                label="Price per day (EUR) *"
                                isEditing={true}
                                value={price}
                                onChangeText={setPrice}
                                placeholder="15.00"
                                keyboardType="decimal-pad"
                                error={showErrors ? priceError : null}
                            />
                            <InputField
                                label="Replacement value (EUR)"
                                isEditing={true}
                                value={replacementValue}
                                onChangeText={setReplacementValue}
                                placeholder="0.00"
                                keyboardType="decimal-pad"
                            />
                            <ToolConditionField
                                label="Condition *"
                                isEditing={true}
                                value={condition}
                                onSelect={setCondition}
                                error={showErrors ? conditionError : null}
                            />
                        </View>

                        <View style={styles.section}>
                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                <LabelField>Availability</LabelField>
                            </View>
                            <Text style={[styles.locationSub, { marginBottom: 10 }]}>Select a start and end date to block out a range of days (up to 3 weeks in advance).</Text>
                            <Calendar
                                style={[styles.calendar, { borderRadius: 12, overflow: 'hidden' }]}
                                theme={{
                                    backgroundColor: '#1a1a1a',
                                    calendarBackground: '#1a1a1a',
                                    textSectionTitleColor: '#888',
                                    todayTextColor: '#6366f1',
                                    dayTextColor: '#ffffff',
                                    textDisabledColor: '#333',
                                    arrowColor: '#6366f1',
                                    monthTextColor: '#ffffff',
                                }}
                                markingType={'period'}
                                onDayPress={handleDayPress}
                                markedDates={markedDates}
                                minDate={todayString}
                                maxDate={maxDateString}
                            />
                        </View>

                        <View style={styles.section}>
                            <LabelField>Location *</LabelField>
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
                            {showErrors && locationError ? (
                                <Text style={styles.locationErrorText}>{locationError}</Text>
                            ) : null}
                        </View>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>

            <View style={styles.footer}>
                <AppButton
                    title="Publish Listing"
                    onPress={handleSubmit}
                    loading={loading}
                    disabled={!canPublishListing}
                    style={[styles.submitButton, !canPublishListing && styles.disabledButton]}
                    textStyle={styles.submitButtonText}
                />
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
                            theme="dark"
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
                                <Ionicons name="checkmark" size={18} color="#fff" style={{ marginRight: 6 }} />
                                <Text style={styles.modalConfirmText}>Confirm Location</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </ThemedSafeAreaView>
    );
};

export default AddToolScreen;
