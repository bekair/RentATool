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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import api from '../api/client';
import { InputField, PhoneField, CountryField, DateField } from '../components/form';


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
    const [phone, setPhone] = useState(user?.profile?.phoneNumber || '');
    const [phoneCode, setPhoneCode] = useState(user?.profile?.phoneCode || null);

    // Validation logic
    const errors = {
        firstName: firstName.trim().length < 2 ? 'First name is too short' : null,
        lastName: lastName.trim().length < 1 ? 'Last name is required' : null,
        phone: (phone.trim().length > 0 && !phoneCode) ? 'Country code required' : null,
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
                phoneCode: phoneCode || null,
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

                    {/* Country */}
                    <CountryField
                        label="Country"
                        isEditing={isEditing}
                        value={region}
                        onSelect={(c) => setRegion(c.name)}
                    />

                    {/* Phone */}
                    <PhoneField
                        label="Phone"
                        isEditing={isEditing}
                        phoneCode={phoneCode}
                        onCountrySelect={(c) => setPhoneCode(c.countryCode)}
                        phone={phone}
                        onPhoneChange={setPhone}
                        error={showErrors ? errors.phone : null}
                    />

                </ScrollView>
            </KeyboardAvoidingView>

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
});
