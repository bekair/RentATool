import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    KeyboardAvoidingView,
    ScrollView,
    Platform,
    Alert,
    ActivityIndicator,
} from 'react-native';
import ThemedSafeAreaView from '../components/layout/ThemedSafeAreaView';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import api from '../api/client';
import { InputField, PhoneField } from '../components/form';
import AppScreenHeader from '../components/ui/AppScreenHeader';

export default function ContactDetailsScreen({ navigation }) {
    const { user, updateCurrentUser } = useAuth();
    const [loading, setLoading] = useState(false);
    const [isEditing, setIsEditing] = useState(false);


    const [phone, setPhone] = useState(user?.profile?.phoneNumber || '');
    const [phoneCode, setPhoneCode] = useState(user?.profile?.phoneCode || null);

    const handleSave = async () => {
        try {
            setLoading(true);
            const payload = {
                phoneCode: phoneCode || null,
                phoneNumber: phone || null,
            };
            const response = await api.patch('/users/me/profile', payload);
            if (updateCurrentUser) {
                updateCurrentUser(response.data);
            }
            Alert.alert('Success', 'Contact details updated successfully.');
            setIsEditing(false);
        } catch (error) {
            console.error('Failed to update contact info:', error);
            Alert.alert('Error', 'Failed to update contact details.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <ThemedSafeAreaView>
            <AppScreenHeader
                title="Contact Details"
                onBack={() => navigation.goBack()}
                right={(
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
                )}
            />

            <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : null}>
                <ScrollView
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.scrollContent}
                    keyboardShouldPersistTaps="handled"
                >
                    {/* Email — always read only */}
                    <InputField
                        label="Email Address"
                        isEditing={false}
                        value={user?.email || ''}
                        placeholder="john@example.com"
                    />

                    {/* Phone */}
                    <PhoneField
                        label="Phone"
                        isEditing={isEditing}
                        phoneCode={phoneCode}
                        onCountrySelect={(c) => setPhoneCode(c.countryCode)}
                        phone={phone}
                        onPhoneChange={setPhone}
                    />

                    <Text style={styles.helpText}>
                        Your email is linked to your account and cannot be changed here.
                    </Text>
                </ScrollView>
            </KeyboardAvoidingView>
        </ThemedSafeAreaView>
    );
}

const styles = StyleSheet.create({
    saveButton: { padding: 5 },
    saveButtonText: { fontSize: 16, fontWeight: '600', color: '#6366f1' },
    scrollContent: {
        paddingHorizontal: 16,
        paddingTop: 24,
        paddingBottom: 50,
    },
    helpText: {
        fontSize: 13,
        color: '#666',
        marginTop: 8,
        paddingHorizontal: 5,
        lineHeight: 18,
    },
});
