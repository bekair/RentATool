import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    KeyboardAvoidingView,
    ScrollView,
    Platform,
    Alert,
    ActivityIndicator,
    Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import api from '../api/client';
import { InputField, DropdownField, PhoneField } from '../components/form';

const COUNTRIES = [
    { code: '+1', label: 'US', name: 'United States' },
    { code: '+32', label: 'BE', name: 'Belgium' },
    { code: '+31', label: 'NL', name: 'Netherlands' },
    { code: '+49', label: 'DE', name: 'Germany' },
    { code: '+33', label: 'FR', name: 'France' },
    { code: '+44', label: 'GB', name: 'United Kingdom' },
    { code: '+90', label: 'TR', name: 'Turkey' },
    { code: '+977', label: 'NP', name: 'Nepal' },
    { code: '+91', label: 'IN', name: 'India' },
    { code: '+86', label: 'CN', name: 'China' },
];

const REGIONS = [
    'Belgium', 'France', 'Germany', 'India', 'Nepal',
    'Netherlands', 'Turkey', 'United Kingdom', 'United States',
];


function PickerModal({ visible, title, options, onSelect, onClose }) {
    return (
        <Modal visible={visible} transparent animationType="slide">
            <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={onClose}>
                <View style={styles.pickerSheet}>
                    <View style={styles.pickerHandle} />
                    <Text style={styles.pickerTitle}>{title}</Text>
                    {options.map((opt) => (
                        <TouchableOpacity
                            key={typeof opt === 'object' ? opt.code : opt}
                            style={styles.pickerOption}
                            onPress={() => onSelect(opt)}
                        >
                            <Text style={styles.pickerOptionText}>
                                {typeof opt === 'object' ? `${opt.code}  ${opt.name}` : opt}
                            </Text>
                            <Ionicons name="checkmark" size={18} color="#6366f1" style={{ opacity: 0 }} />
                        </TouchableOpacity>
                    ))}
                </View>
            </TouchableOpacity>
        </Modal>
    );
}

export default function GeneralInfoScreen({ navigation }) {
    const { user, updateCurrentUser } = useAuth();
    const [loading, setLoading] = useState(false);
    const [isEditing, setIsEditing] = useState(false);

    const [displayName, setDisplayName] = useState(user?.displayName || '');
    const [dob, setDob] = useState(user?.dob || '');
    const [region, setRegion] = useState(user?.region || '');
    const [countryCode, setCountryCode] = useState(COUNTRIES[0]);
    const [phone, setPhone] = useState(user?.phone || '');
    const [showCountryPicker, setShowCountryPicker] = useState(false);
    const [showRegionPicker, setShowRegionPicker] = useState(false);

    const handleSave = async () => {
        try {
            setLoading(true);
            const payload = {
                displayName,
                dob,
                region,
                phone: `${countryCode.code}${phone}`,
            };
            const response = await api.patch('/users/me', payload);
            if (updateCurrentUser) {
                updateCurrentUser(response.data);
            }
            Alert.alert('Success', 'General information updated successfully.');
            setIsEditing(false);
        } catch (error) {
            console.error('Failed to update general info:', error);
            Alert.alert('Error', 'Failed to update general information.');
        } finally {
            setLoading(false);
        }
    };

    const formatDob = (text) => {
        // Strip non-numeric
        const cleaned = text.replace(/\D/g, '');
        let result = '';
        if (cleaned.length > 0) result += cleaned.substring(0, 2);
        if (cleaned.length >= 3) result += ' / ' + cleaned.substring(2, 4);
        if (cleaned.length >= 5) result += ' / ' + cleaned.substring(4, 8);
        setDob(result);
    };

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="#fff" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>General Information</Text>
                <TouchableOpacity
                    onPress={isEditing ? handleSave : () => setIsEditing(true)}
                    disabled={loading}
                    style={styles.saveButton}
                >
                    {loading ? (
                        <ActivityIndicator size="small" color="#6366f1" />
                    ) : (
                        <Text style={styles.saveButtonText}>{isEditing ? 'Save' : 'Edit'}</Text>
                    )}
                </TouchableOpacity>
            </View>

            <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : null}>
                <ScrollView
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.scrollContent}
                    keyboardShouldPersistTaps="handled"
                >
                    {/* Name */}
                    <InputField
                        label="Name"
                        isEditing={isEditing}
                        value={displayName}
                        onChangeText={setDisplayName}
                        placeholder="John Smith"
                    />

                    {/* Email — always read only */}
                    <InputField
                        label="Email"
                        isEditing={false}
                        value={user?.email || ''}
                        placeholder="john@example.com"
                    />

                    {/* Date of Birth */}
                    <InputField
                        label="Date of birth"
                        isEditing={isEditing}
                        value={dob}
                        onChangeText={formatDob}
                        placeholder="dd / mm / yyyy"
                        keyboardType="numeric"
                        maxLength={14}
                    />

                    {/* Country / Region */}
                    <DropdownField
                        label="Country/Region"
                        isEditing={isEditing}
                        value={region}
                        placeholder="Select"
                        onPress={() => setShowRegionPicker(true)}
                    />

                    {/* Phone */}
                    <PhoneField
                        label="Phone"
                        isEditing={isEditing}
                        countryCode={countryCode}
                        onCountryPress={() => setShowCountryPicker(true)}
                        phone={phone}
                        onPhoneChange={setPhone}
                    />

                </ScrollView>
            </KeyboardAvoidingView>

            {/* Pickers */}
            <PickerModal
                visible={showCountryPicker}
                title="Select Country Code"
                options={COUNTRIES}
                onSelect={(c) => { setCountryCode(c); setShowCountryPicker(false); }}
                onClose={() => setShowCountryPicker(false)}
            />
            <PickerModal
                visible={showRegionPicker}
                title="Select Country/Region"
                options={REGIONS}
                onSelect={(r) => { setRegion(r); setShowRegionPicker(false); }}
                onClose={() => setShowRegionPicker(false)}
            />

        </SafeAreaView>
    );
}


const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#0d0d0d' },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#1a1a1a',
    },
    backButton: { padding: 5, marginLeft: -5 },
    headerTitle: { fontSize: 18, fontWeight: '700', color: '#fff' },
    saveButton: { padding: 5 },
    saveButtonText: { fontSize: 16, fontWeight: '600', color: '#6366f1' },

    scrollContent: {
        paddingHorizontal: 16,
        paddingTop: 24,
        paddingBottom: 50,
    },

    // ─── Picker Modal ────────────────────────────────────────────────────────────────
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.6)',
        justifyContent: 'flex-end',
    },
    pickerSheet: {
        backgroundColor: '#1a1a1a',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        paddingTop: 12,
        paddingBottom: 40,
        paddingHorizontal: 20,
    },
    pickerHandle: {
        width: 40,
        height: 4,
        backgroundColor: '#444',
        borderRadius: 2,
        alignSelf: 'center',
        marginBottom: 16,
    },
    pickerTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: '#fff',
        marginBottom: 16,
    },
    pickerOption: {
        paddingVertical: 14,
        borderBottomWidth: 1,
        borderBottomColor: '#262626',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    pickerOptionText: {
        fontSize: 16,
        color: '#ddd',
    },
});
