import React, { useState } from 'react';
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
import { SafeAreaView } from 'react-native-safe-area-context';
import MapView, { Marker } from 'react-native-maps';
import api from '../api/client';
import * as Location from 'expo-location';
import { Ionicons } from '@expo/vector-icons';

const AddToolScreen = ({ navigation }) => {
    const [name, setName] = useState('');
    const [category, setCategory] = useState('');
    const [description, setDescription] = useState('');
    const [price, setPrice] = useState('');
    const [replacementValue, setReplacementValue] = useState('');
    const [condition, setCondition] = useState('');
    const [latitude, setLatitude] = useState(null);
    const [longitude, setLongitude] = useState(null);
    const [tempCoords, setTempCoords] = useState(null);
    const [showMapModal, setShowMapModal] = useState(false);
    const [locationLoading, setLocationLoading] = useState(false);
    const [loading, setLoading] = useState(false);

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

    const confirmLocation = () => {
        if (tempCoords) {
            setLatitude(tempCoords.latitude);
            setLongitude(tempCoords.longitude);
            setShowMapModal(false);
        }
    };

    const handleSubmit = async () => {
        if (!name || !category || !description || !price) {
            Alert.alert('Required Info', 'Please fill in the tool name, category, description and daily price.');
            return;
        }

        if (!latitude || !longitude) {
            Alert.alert('Location Missing', 'Please select where the tool is located on the map.');
            return;
        }

        setLoading(true);
        try {
            await api.post('/tools', {
                name,
                category,
                description,
                pricePerDay: parseFloat(price),
                replacementValue: replacementValue ? parseFloat(replacementValue) : undefined,
                condition: condition || undefined,
                latitude,
                longitude,
            });
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
                            <TextInput
                                style={styles.input}
                                placeholder="Category (e.g. Power Tools)"
                                placeholderTextColor="#999"
                                value={category}
                                onChangeText={setCategory}
                            />
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
                            <Text style={styles.label}>Location</Text>
                            <TouchableOpacity
                                style={[styles.locationCard, (latitude && longitude) && styles.locationCardActive]}
                                onPress={openMapPicker}
                                disabled={locationLoading}
                            >
                                <View style={styles.locationIcon}>
                                    <Ionicons
                                        name={(latitude && longitude) ? "location" : "map-outline"}
                                        size={24}
                                        color={(latitude && longitude) ? "#fff" : "#222"}
                                    />
                                </View>
                                <View style={styles.locationInfo}>
                                    <Text style={styles.locationTitle}>
                                        {(latitude && longitude) ? "Location set" : "Set tool location"}
                                    </Text>
                                    <Text style={styles.locationSub}>
                                        {(latitude && longitude) ? "Tap to change position" : "Pin the exact pickup spot"}
                                    </Text>
                                </View>
                                <Ionicons name="chevron-forward" size={20} color="#555" />
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

            <Modal
                visible={showMapModal}
                animationType="slide"
            >
                <SafeAreaView style={styles.modalContainer}>
                    <View style={styles.modalHeader}>
                        <TouchableOpacity onPress={() => setShowMapModal(false)}>
                            <Text style={styles.modalCancel}>Cancel</Text>
                        </TouchableOpacity>
                        <Text style={styles.modalTitle}>Pickup Location</Text>
                        <TouchableOpacity onPress={confirmLocation}>
                            <Text style={styles.modalConfirm}>Confirm</Text>
                        </TouchableOpacity>
                    </View>
                    <MapView
                        style={styles.pickerMap}
                        initialRegion={{
                            latitude: tempCoords?.latitude || 50.8503,
                            longitude: tempCoords?.longitude || 4.3517,
                            latitudeDelta: 0.01,
                            longitudeDelta: 0.01,
                        }}
                        onPress={(e) => setTempCoords(e.nativeEvent.coordinate)}
                    >
                        {tempCoords && (
                            <Marker coordinate={tempCoords} draggable />
                        )}
                    </MapView>
                    <View style={styles.pickerHint}>
                        <Text style={styles.pickerHintText}>Tap the map to place the pin</Text>
                    </View>
                </SafeAreaView>
            </Modal>
        </SafeAreaView>
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
    locationInfo: {
        flex: 1,
    },
    locationTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#ffffff',
    },
    locationSub: {
        fontSize: 14,
        color: '#888',
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
        backgroundColor: '#FF385C',
        borderRadius: 8,
        padding: 16,
        alignItems: 'center',
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
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#2a2a2a',
    },
    modalTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: '#ffffff',
    },
    modalCancel: {
        color: '#aaa',
        fontSize: 16,
        textDecorationLine: 'underline',
    },
    modalConfirm: {
        color: '#6366f1',
        fontSize: 16,
        fontWeight: '700',
    },
    pickerMap: {
        flex: 1,
    },
    pickerHint: {
        position: 'absolute',
        bottom: 40,
        left: 24,
        right: 24,
        backgroundColor: '#222',
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
    },
    pickerHintText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '600',
    },
});

export default AddToolScreen;
