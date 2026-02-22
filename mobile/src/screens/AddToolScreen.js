import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    ScrollView,
    Alert,
    ActivityIndicator,
    Modal,
    Dimensions,
    Platform,
    KeyboardAvoidingView,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import MapView from 'react-native-maps';
import { Calendar } from 'react-native-calendars';
import api from '../api/client';
import * as Location from 'expo-location';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

const AddToolScreen = ({ navigation }) => {
    const insets = useSafeAreaInsets();
    const [name, setName] = useState('');
    const [selectedCategory, setSelectedCategory] = useState(null); // { id, name, icon }
    const [categories, setCategories] = useState([]);
    const [showCategoryModal, setShowCategoryModal] = useState(false);
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

    // Calendar blocks state
    const [manualBlockedDates, setManualBlockedDates] = useState(new Set());
    const [selectionStart, setSelectionStart] = useState(null);

    const maxDateObj = new Date();
    maxDateObj.setDate(maxDateObj.getDate() + 21);
    const maxDateString = maxDateObj.toISOString().split('T')[0];
    const todayString = new Date().toISOString().split('T')[0];

    useEffect(() => {
        api.get('/categories')
            .then(res => setCategories(res.data))
            .catch(() => { }); // silently fall back — picker just stays empty
    }, []);

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
                let current = new Date(selectionStart);
                const endObj = new Date(dateString);
                const newBlocks = new Set(manualBlockedDates);

                while (current <= endObj) {
                    const dStr = current.toISOString().split('T')[0];
                    newBlocks.add(dStr);
                    current.setDate(current.getDate() + 1);
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
            const d = new Date(dStr);
            const prev = new Date(d); prev.setDate(prev.getDate() - 1);
            const next = new Date(d); next.setDate(next.getDate() + 1);

            const prevStr = prev.toISOString().split('T')[0];
            const nextStr = next.toISOString().split('T')[0];

            marks[dStr] = {
                color: '#333',
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

        if (!latitude || !longitude) {
            Alert.alert('Location Missing', 'Please select where the tool is located on the map.');
            return;
        }

        setLoading(true);
        try {
            const response = await api.post('/tools', {
                name,
                categoryId: selectedCategory.id,
                description,
                pricePerDay: parseFloat(price),
                replacementValue: replacementValue ? parseFloat(replacementValue) : undefined,
                condition: condition || undefined,
                latitude,
                longitude,
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
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="close" size={24} color="#ffffff" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>List your tool</Text>
                <View style={{ width: 40 }} />
            </View>

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1 }}
            >
                <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                    <View style={styles.form}>
                        <View style={styles.section}>
                            <Text style={styles.label}>Basic Information</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Tool name (e.g. Bosch Hammer Drill)"
                                placeholderTextColor="#999"
                                value={name}
                                onChangeText={setName}
                            />
                            {/* Category picker */}
                            <TouchableOpacity
                                style={[styles.input, styles.categoryCard]}
                                onPress={() => setShowCategoryModal(true)}
                            >
                                {selectedCategory ? (
                                    <View style={styles.categorySelected}>
                                        <MaterialCommunityIcons
                                            name={selectedCategory.icon}
                                            size={22}
                                            color="#6366f1"
                                        />
                                        <Text style={styles.categorySelectedText}>{selectedCategory.name}</Text>
                                    </View>
                                ) : (
                                    <Text style={styles.categoryPlaceholder}>Select a category…</Text>
                                )}
                                <Ionicons name="chevron-forward" size={18} color="#555" />
                            </TouchableOpacity>
                            <TextInput
                                style={[styles.input, styles.textArea]}
                                placeholder="Tell us more about your tool..."
                                placeholderTextColor="#999"
                                value={description}
                                onChangeText={setDescription}
                                multiline
                                numberOfLines={4}
                            />
                        </View>

                        <View style={styles.section}>
                            <Text style={styles.label}>Pricing & Value</Text>
                            <View style={styles.row}>
                                <View style={[styles.inputContainer, { flex: 1, marginRight: 10 }]}>
                                    <Text style={styles.currencyPrefix}>€</Text>
                                    <TextInput
                                        style={styles.inputInner}
                                        placeholder="15.00"
                                        placeholderTextColor="#999"
                                        value={price}
                                        onChangeText={setPrice}
                                        keyboardType="decimal-pad"
                                    />
                                    <Text style={styles.unitSuffix}>/day</Text>
                                </View>
                                <View style={[styles.inputContainer, { flex: 1 }]}>
                                    <Text style={styles.currencyPrefix}>€</Text>
                                    <TextInput
                                        style={styles.inputInner}
                                        placeholder="Value"
                                        placeholderTextColor="#999"
                                        value={replacementValue}
                                        onChangeText={setReplacementValue}
                                        keyboardType="decimal-pad"
                                    />
                                </View>
                            </View>
                        </View>

                        <View style={styles.section}>
                            <Text style={styles.label}>Condition</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="e.g. Excellent, Minor scratches"
                                placeholderTextColor="#999"
                                value={condition}
                                onChangeText={setCondition}
                            />
                        </View>

                        <View style={styles.section}>
                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                <Text style={styles.label}>Availability (Optional)</Text>
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
                            <Text style={styles.label}>Location</Text>
                            <TouchableOpacity
                                style={[styles.locationCard, (latitude && longitude) && styles.locationCardActive]}
                                onPress={openMapPicker}
                                disabled={locationLoading}
                            >
                                <View style={[
                                    styles.locationIcon,
                                    (latitude && longitude) && styles.locationIconActive,
                                ]}>
                                    {locationLoading
                                        ? <ActivityIndicator size="small" color="#6366f1" />
                                        : <Ionicons
                                            name={(latitude && longitude) ? 'location' : 'map-outline'}
                                            size={22}
                                            color={(latitude && longitude) ? '#fff' : '#888'}
                                        />}
                                </View>

                                <View style={styles.locationInfo}>
                                    {(latitude && longitude && locationAddress) ? (
                                        <>
                                            {locationAddress.street ? (
                                                <Text style={styles.locationStreet} numberOfLines={1}>
                                                    {locationAddress.street}
                                                </Text>
                                            ) : null}
                                            {(locationAddress.city || locationAddress.country) ? (
                                                <Text style={styles.locationCity} numberOfLines={1}>
                                                    {[locationAddress.city, locationAddress.country].filter(Boolean).join(', ')}
                                                </Text>
                                            ) : null}
                                            <Text style={styles.locationCoords}>
                                                {latitude.toFixed(5)}, {longitude.toFixed(5)}
                                            </Text>
                                        </>
                                    ) : (
                                        <>
                                            <Text style={styles.locationTitle}>Set tool location</Text>
                                            <Text style={styles.locationSub}>Pin the exact pickup spot on the map</Text>
                                        </>
                                    )}
                                </View>

                                <View style={styles.locationChevron}>
                                    <Ionicons
                                        name={(latitude && longitude) ? 'pencil-outline' : 'chevron-forward'}
                                        size={18}
                                        color="#555"
                                    />
                                </View>
                            </TouchableOpacity>
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
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <Text style={styles.submitButtonText}>Publish Listing</Text>
                    )}
                </TouchableOpacity>
            </View>

            {/* ── Category Picker Modal ───────────────── */}
            <Modal
                visible={showCategoryModal}
                animationType="slide"
                statusBarTranslucent
            >
                <View style={styles.modalContainer}>
                    <View style={[styles.modalTopBar, { paddingTop: insets.top + 12 }]}>
                        <Text style={styles.modalTitle}>Select a Category</Text>
                        <Text style={styles.modalSubtitle}>Choose the type that best fits your tool</Text>
                    </View>

                    <ScrollView
                        contentContainerStyle={styles.categoryGrid}
                        showsVerticalScrollIndicator={false}
                    >
                        {categories.map((cat) => {
                            const isActive = selectedCategory?.id === cat.id;
                            return (
                                <TouchableOpacity
                                    key={cat.id}
                                    style={[styles.categoryGridItem, isActive && styles.categoryGridItemActive]}
                                    onPress={() => {
                                        setSelectedCategory(cat);
                                        setShowCategoryModal(false);
                                    }}
                                >
                                    <MaterialCommunityIcons
                                        name={cat.icon}
                                        size={32}
                                        color={isActive ? '#6366f1' : '#aaa'}
                                    />
                                    <Text style={[styles.categoryGridLabel, isActive && styles.categoryGridLabelActive]}>
                                        {cat.name}
                                    </Text>
                                </TouchableOpacity>
                            );
                        })}
                    </ScrollView>

                    <View style={[styles.modalBottomBar, { paddingBottom: insets.bottom }]}>
                        <View style={styles.modalActions}>
                            <TouchableOpacity
                                style={styles.modalCancelBtn}
                                onPress={() => setShowCategoryModal(false)}
                            >
                                <Text style={styles.modalCancelText}>Cancel</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

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
                        <MapView
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
                                <Ionicons name="checkmark" size={18} color="#fff" style={{ marginRight: 6 }} />
                                <Text style={styles.modalConfirmText}>Confirm Location</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </SafeAreaView >
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0a0a0a',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 15,
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#2a2a2a',
    },
    headerTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: '#ffffff',
    },
    backButton: {
        padding: 5,
    },
    scrollContent: {
        padding: 24,
        paddingBottom: 120,
    },
    form: {
        gap: 25,
    },
    section: {
        gap: 12,
    },
    label: {
        fontSize: 18,
        fontWeight: '600',
        color: '#ffffff',
        marginBottom: 4,
    },
    input: {
        backgroundColor: '#1a1a1a',
        borderRadius: 10,
        padding: 16,
        color: '#ffffff',
        borderWidth: 1,
        borderColor: '#2a2a2a',
        fontSize: 16,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#1a1a1a',
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#2a2a2a',
        paddingHorizontal: 16,
    },
    inputInner: {
        flex: 1,
        paddingVertical: 16,
        fontSize: 16,
        color: '#ffffff',
    },
    currencyPrefix: {
        fontSize: 16,
        color: '#aaa',
        marginRight: 4,
    },
    unitSuffix: {
        fontSize: 14,
        color: '#666',
    },
    textArea: {
        height: 120,
        textAlignVertical: 'top',
    },
    row: {
        flexDirection: 'row',
    },
    locationCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#1a1a1a',
        borderRadius: 12,
        padding: 16,
        borderWidth: 1,
        borderColor: '#2a2a2a',
    },
    locationCardActive: {
        borderColor: '#6366f1',
        backgroundColor: '#1a1a1a',
    },
    locationIcon: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: '#2a2a2a',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    locationIconActive: {
        backgroundColor: '#6366f1',
    },
    locationInfo: {
        flex: 1,
    },
    locationTitle: {
        fontSize: 15,
        fontWeight: '600',
        color: '#ffffff',
    },
    locationSub: {
        fontSize: 13,
        color: '#888',
        marginTop: 2,
    },
    locationStreet: {
        fontSize: 15,
        fontWeight: '600',
        color: '#ffffff',
    },
    locationCity: {
        fontSize: 14,
        color: '#aaa',
        marginTop: 2,
    },
    locationCoords: {
        fontSize: 11,
        color: '#555',
        marginTop: 4,
        fontVariant: ['tabular-nums'],
    },
    locationChevron: {
        marginLeft: 8,
    },
    footer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: '#0a0a0a',
        borderTopWidth: 1,
        borderTopColor: '#2a2a2a',
        padding: 24,
        paddingBottom: Platform.OS === 'ios' ? 40 : 24,
    },
    submitButton: {
        backgroundColor: '#6366f1',
        borderRadius: 12,
        padding: 18,
        alignItems: 'center',
        shadowColor: '#6366f1',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.4,
        shadowRadius: 12,
        elevation: 8,
    },
    submitButtonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '600',
    },
    disabledButton: {
        opacity: 0.7,
    },
    modalContainer: {
        flex: 1,
        backgroundColor: '#0a0a0a',
    },
    modalTopBar: {
        backgroundColor: '#0a0a0a',
        borderBottomWidth: 1,
        borderBottomColor: '#2a2a2a',
        paddingHorizontal: 20,
        paddingBottom: 14,
        paddingTop: 10,
        alignItems: 'center',
    },
    modalTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: '#ffffff',
    },
    modalSubtitle: {
        fontSize: 12,
        color: '#666',
        marginTop: 3,
    },
    mapWrapper: {
        flex: 1,
        position: 'relative',
    },
    // ── Centre-pin crosshair ──────────────────────────────────────────────
    crosshairContainer: {
        position: 'absolute',
        top: 0, left: 0, right: 0, bottom: 0,
        justifyContent: 'center',
        alignItems: 'center',
    },
    crosshairShadow: {
        position: 'absolute',
        width: 20, height: 6, borderRadius: 10,
        backgroundColor: 'rgba(0,0,0,0.25)',
        bottom: '50%',
        marginBottom: -3,
    },
    crosshairStem: {
        position: 'absolute',
        width: 3, height: 22,
        backgroundColor: '#6366f1',
        borderRadius: 2,
        bottom: '50%',
        marginBottom: 12,
    },
    crosshairHead: {
        position: 'absolute',
        width: 32, height: 32, borderRadius: 16,
        backgroundColor: '#6366f1',
        bottom: '50%',
        marginBottom: 30,
        justifyContent: 'center', alignItems: 'center',
        shadowColor: '#6366f1',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.5,
        shadowRadius: 8,
        elevation: 6,
    },
    crosshairInner: {
        width: 10, height: 10, borderRadius: 5,
        backgroundColor: '#fff',
    },
    modalBottomBar: {
        backgroundColor: '#0a0a0a',
        borderTopWidth: 1,
        borderTopColor: '#2a2a2a',
    },
    modalActions: {
        flexDirection: 'row',
        gap: 12,
        paddingHorizontal: 20,
        paddingVertical: 16,
    },
    modalCancelBtn: {
        flex: 1,
        borderRadius: 12,
        paddingVertical: 16,
        alignItems: 'center',
        backgroundColor: '#1a1a1a',
        borderWidth: 1,
        borderColor: '#2a2a2a',
    },
    modalCancelText: {
        fontSize: 15,
        fontWeight: '600',
        color: '#aaa',
    },
    modalConfirmBtn: {
        flex: 2,
        borderRadius: 12,
        paddingVertical: 16,
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: 'center',
        backgroundColor: '#6366f1',
        shadowColor: '#6366f1',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.4,
        shadowRadius: 12,
        elevation: 8,
    },
    modalConfirmText: {
        fontSize: 15,
        fontWeight: '700',
        color: '#fff',
    },
    // ── Category picker ──────────────────────────────────────────────────────
    categoryCard: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 14,
    },
    categorySelected: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        flex: 1,
    },
    categorySelectedText: {
        fontSize: 16,
        color: '#ffffff',
    },
    categoryPlaceholder: {
        fontSize: 16,
        color: '#666',
        flex: 1,
    },
    categoryGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        padding: 16,
        gap: 12,
    },
    categoryGridItem: {
        width: '30%',
        aspectRatio: 1,
        backgroundColor: '#1a1a1a',
        borderRadius: 14,
        borderWidth: 1,
        borderColor: '#2a2a2a',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 8,
        padding: 8,
    },
    categoryGridItemActive: {
        borderColor: '#6366f1',
        backgroundColor: '#1e1b4b',
    },
    categoryGridLabel: {
        fontSize: 11,
        color: '#aaa',
        textAlign: 'center',
    },
    categoryGridLabelActive: {
        color: '#818cf8',
        fontWeight: '600',
    },
});

export default AddToolScreen;
