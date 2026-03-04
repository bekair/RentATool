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
import { InputField, PhoneField, CountryField, DateField } from '../components/form';

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
    const [hasAttemptedSave, setHasAttemptedSave] = useState(false);

    const [firstName, setFirstName] = useState(user?.profile?.firstName || '');
    const [lastName, setLastName] = useState(user?.profile?.lastName || '');
    const [displayName, setDisplayName] = useState(user?.profile?.displayName || '');
    const [dob, setDob] = useState(user?.profile?.birthDate || '');
    const [region, setRegion] = useState(user?.profile?.region || '');

    const initialCountry = COUNTRIES.find(c => c.code === user?.profile?.phoneCode) || null;
    const initialPhone = user?.profile?.phoneNumber || '';

    const [countryCode, setCountryCode] = useState(initialCountry);
    const [phone, setPhone] = useState(initialPhone);
    const [showCountryPicker, setShowCountryPicker] = useState(false);

    // Validation logic
    const errors = {
        firstName: firstName.trim().length < 2 ? 'First name is too short' : null,
        lastName: lastName.trim().length < 1 ? 'Last name is required' : null,
        phone: (phone.trim().length > 0 && !countryCode) ? 'Country code required' : null,
    };

    const isFormValid = Object.values(errors).every(e => e === null);
    const showErrors = hasAttemptedSave || isEditing; // Show errors while editing or after first save attempt

    const handleSave = async () => {
        setHasAttemptedSave(true);
        if (!isFormValid) return;

        try {
            setLoading(true);
            const payload = {
                firstName,
                lastName,
                displayName,
                birthDate: dob,
                region,
                phoneCode: countryCode?.code || null,
                phoneNumber: phone || null,
            };
            console.log('[GeneralInfoScreen] Saving profile:', payload);
            const response = await api.patch('/users/me/profile', payload);
            if (updateCurrentUser) {
                updateCurrentUser(response.data);
            }
            Alert.alert('Success', 'General information updated successfully.');
            setIsEditing(false);
            setHasAttemptedSave(false);
        } catch (error) {
            console.error('Failed to update general info:', error);
            Alert.alert('Error', 'Failed to update general information.');
        } finally {
            setLoading(false);
        }
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
                    disabled={loading || (isEditing && !isFormValid)}
                    style={[styles.saveButton, (isEditing && !isFormValid) && { opacity: 0.4 }]}
                >
                    {loading ? (
                        <ActivityIndicator size="small" color="#6366f1" />
                    ) : (
                        <Text style={[styles.saveButtonText, (isEditing && !isFormValid) && { color: '#444' }]}>
                            {isEditing ? 'Save' : 'Edit'}
                        </Text>
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
                        label="First Name"
                        isEditing={isEditing}
                        value={firstName}
                        onChangeText={setFirstName}
                        placeholder="John"
                        error={showErrors ? errors.firstName : null}
                    />

                    <InputField
                        label="Last Name"
                        isEditing={isEditing}
                        value={lastName}
                        onChangeText={setLastName}
                        placeholder="Smith"
                        error={showErrors ? errors.lastName : null}
                    />

                    <InputField
                        label="Display Name (Public)"
                        isEditing={isEditing}
                        value={displayName}
                        onChangeText={setDisplayName}
                        placeholder="e.g. John D."
                    />

                    {/* Email — always read only */}
                    <InputField
                        label="Email"
                        isEditing={false}
                        value={user?.email || ''}
                        placeholder="john@example.com"
                    />

                    {/* Date of Birth */}
                    <DateField
                        label="Date of birth"
                        isEditing={isEditing}
                        value={dob}
                        onChange={setDob}
                    />

                    {/* Country / Region */}
                    <CountryField
                        label="Country/Region"
                        isEditing={isEditing}
                        value={region}
                        onSelect={setRegion}
                    />

                    {/* Phone */}
                    <PhoneField
                        label="Phone"
                        isEditing={isEditing}
                        countryCode={countryCode}
                        onCountryPress={() => setShowCountryPicker(true)}
                        phone={phone}
                        onPhoneChange={setPhone}
                        error={showErrors ? errors.phone : null}
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
