import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    ScrollView,
    Alert,
    SafeAreaView,
    ActivityIndicator,
    Modal,
    Dimensions,
} from 'react-native';
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

            // If we don't have a location set yet, get current to center the map
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
            Alert.alert('Error', 'Please fill in all basic fields');
            return;
        }

        if (!latitude || !longitude) {
            Alert.alert('Error', 'Please set the tool location for the map');
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
            Alert.alert('Success', 'Tool listed successfully!', [
                { text: 'OK', onPress: () => navigation.goBack() }
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
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Text style={styles.backButton}>Back</Text>
                </TouchableOpacity>
                <Text style={styles.title}>List a Tool</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={styles.form}>
                    <Text style={styles.label}>Tool Name *</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="e.g. Bosch Drill PBH 2100"
                        placeholderTextColor="#666"
                        value={name}
                        onChangeText={setName}
                    />

                    <Text style={styles.label}>Category *</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="e.g. Power Tools, Gardening"
                        placeholderTextColor="#666"
                        value={category}
                        onChangeText={setCategory}
                    />

                    <Text style={styles.label}>Description *</Text>
                    <TextInput
                        style={[styles.input, styles.textArea]}
                        placeholder="Describe your tool, its condition..."
                        placeholderTextColor="#666"
                        value={description}
                        onChangeText={setDescription}
                        multiline
                        numberOfLines={4}
                    />

                    <Text style={styles.label}>Price per Day (€) *</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="15.00"
                        placeholderTextColor="#666"
                        value={price}
                        onChangeText={setPrice}
                        keyboardType="decimal-pad"
                    />

                    <Text style={styles.label}>Replacement Value (€)</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="150.00 (optional)"
                        placeholderTextColor="#666"
                        value={replacementValue}
                        onChangeText={setReplacementValue}
                        keyboardType="decimal-pad"
                    />

                    <Text style={styles.label}>Condition</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="e.g. Good as new (optional)"
                        placeholderTextColor="#666"
                        value={condition}
                        onChangeText={setCondition}
                    />

                    <Text style={styles.label}>Location *</Text>
                    <TouchableOpacity
                        style={[styles.locationButton, (latitude && longitude) && styles.locationButtonActive]}
                        onPress={openMapPicker}
                        disabled={locationLoading}
                    >
                        {locationLoading ? (
                            <ActivityIndicator color="#6366f1" />
                        ) : (
                            <>
                                <Ionicons
                                    name={(latitude && longitude) ? "location" : "map-outline"}
                                    size={20}
                                    color={(latitude && longitude) ? "#6366f1" : "#666"}
                                    style={{ marginRight: 8 }}
                                />
                                <Text style={[styles.locationButtonText, (latitude && longitude) && styles.locationButtonTextActive]}>
                                    {(latitude && longitude)
                                        ? "Location Selected (Tap to change)"
                                        : "Select on Map"}
                                </Text>
                            </>
                        )}
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.submitButton, loading && styles.disabledButton]}
                        onPress={handleSubmit}
                        disabled={loading}
                    >
                        {loading ? (
                            <ActivityIndicator color="#fff" />
                        ) : (
                            <Text style={styles.submitButtonText}>List Tool</Text>
                        )}
                    </TouchableOpacity>
                </View>
            </ScrollView>

            <Modal
                visible={showMapModal}
                animationType="slide"
            >
                <SafeAreaView style={styles.modalContainer}>
                    <View style={styles.modalHeader}>
                        <TouchableOpacity onPress={() => setShowMapModal(false)}>
                            <Text style={styles.cancelText}>Cancel</Text>
                        </TouchableOpacity>
                        <Text style={styles.modalTitle}>Select Location</Text>
                        <TouchableOpacity onPress={confirmLocation}>
                            <Text style={styles.confirmText}>Confirm</Text>
                        </TouchableOpacity>
                    </View>

                    <MapView
                        style={styles.pickerMap}
                        initialRegion={{
                            latitude: tempCoords?.latitude || 50.8503,
                            longitude: tempCoords?.longitude || 4.3517,
                            latitudeDelta: 0.0122,
                            longitudeDelta: 0.0121,
                        }}
                        onPress={(e) => setTempCoords(e.nativeEvent.coordinate)}
                    >
                        {tempCoords && (
                            <Marker coordinate={tempCoords} draggable />
                        )}
                    </MapView>

                    <View style={styles.pickerTip}>
                        <Text style={styles.pickerTipText}>Tap on the map to set the exact tool location</Text>
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
        paddingHorizontal: 20,
        paddingVertical: 15,
    },
    backButton: {
        color: '#6366f1',
        fontSize: 16,
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#ffffff',
    },
    scrollContent: {
        padding: 20,
    },
    form: {
        gap: 20,
    },
    label: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: -10,
    },
    input: {
        backgroundColor: '#1a1a1a',
        borderRadius: 12,
        padding: 15,
        color: '#fff',
        borderWidth: 1,
        borderColor: '#2a2a2a',
    },
    textArea: {
        height: 120,
        textAlignVertical: 'top',
    },
    submitButton: {
        backgroundColor: '#6366f1',
        borderRadius: 12,
        padding: 18,
        alignItems: 'center',
        marginTop: 10,
    },
    locationButton: {
        backgroundColor: '#1a1a1a',
        borderRadius: 12,
        padding: 15,
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#2a2a2a',
    },
    locationButtonActive: {
        borderColor: '#6366f1',
        backgroundColor: 'rgba(99, 102, 241, 0.05)',
    },
    locationButtonText: {
        color: '#666',
        fontSize: 14,
    },
    locationButtonTextActive: {
        color: '#6366f1',
        fontWeight: 'bold',
    },
    disabledButton: {
        opacity: 0.7,
    },
    submitButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
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
        backgroundColor: '#1a1a1a',
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#fff',
    },
    cancelText: {
        color: '#ff4444',
        fontSize: 16,
    },
    confirmText: {
        color: '#6366f1',
        fontSize: 16,
        fontWeight: 'bold',
    },
    pickerMap: {
        flex: 1,
    },
    pickerTip: {
        position: 'absolute',
        bottom: 40,
        left: 20,
        right: 20,
        backgroundColor: 'rgba(0,0,0,0.8)',
        padding: 15,
        borderRadius: 12,
        alignItems: 'center',
    },
    pickerTipText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: '500',
    },
});

export default AddToolScreen;
