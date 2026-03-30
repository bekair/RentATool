import React, { useState, useCallback } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    KeyboardAvoidingView,
    Platform,
    ActivityIndicator,
    ScrollView,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { InputField } from '../../components/form';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../theme';
import styles from './SignupScreen.styles';

export default function SignupScreen({ navigation }) {
    const { theme } = useTheme();
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [localError, setLocalError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { signup, error, clearError } = useAuth();

    useFocusEffect(
        useCallback(() => {
            return () => {
                clearError();
                setLocalError('');
            };
        }, [clearError]),
    );

    const handleSignup = async () => {
        setLocalError('');

        if (!firstName || !lastName || !email || !password) {
            setLocalError('Please fill in all fields');
            return;
        }

        if (password.length < 8) {
            setLocalError('Password must be at least 8 characters');
            return;
        }

        if (password !== confirmPassword) {
            setLocalError('Passwords do not match');
            return;
        }

        setIsSubmitting(true);
        await signup(email, password, firstName, lastName);
        setIsSubmitting(false);
    };

    return (
        <KeyboardAvoidingView
            style={[styles.container, { backgroundColor: theme.colors.bg }]}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={styles.header}>
                    <MaterialCommunityIcons name="tools" size={64} color="#6366f1" style={styles.headerIcon} />
                    <Text style={styles.title}>Create Account</Text>
                    <Text style={styles.subtitle}>Join the tool-sharing community</Text>
                </View>

                <View style={styles.form}>
                    <InputField
                        label="First Name"
                        placeholder="John"
                        value={firstName}
                        onChangeText={setFirstName}
                        isEditing
                    />

                    <InputField
                        label="Last Name"
                        placeholder="Doe"
                        value={lastName}
                        onChangeText={setLastName}
                        isEditing
                    />

                    <InputField
                        label="Email"
                        placeholder="Enter your email"
                        value={email}
                        onChangeText={setEmail}
                        keyboardType="email-address"
                        autoCapitalize="none"
                        isEditing
                    />

                    <InputField
                        label="Password"
                        placeholder="At least 8 characters"
                        value={password}
                        onChangeText={setPassword}
                        secureTextEntry
                        isEditing
                    />

                    <InputField
                        label="Confirm Password"
                        placeholder="Re-enter your password"
                        value={confirmPassword}
                        onChangeText={setConfirmPassword}
                        secureTextEntry
                        isEditing
                    />

                    {(localError || error) && (
                        <Text style={styles.error}>{localError || error}</Text>
                    )}

                    <TouchableOpacity
                        style={[styles.button, isSubmitting && styles.buttonDisabled]}
                        onPress={handleSignup}
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? (
                            <ActivityIndicator color="#fff" />
                        ) : (
                            <Text style={styles.buttonText}>Create Account</Text>
                        )}
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.linkButton}
                        onPress={() => navigation.navigate('Login')}
                    >
                        <Text style={styles.linkText}>
                            Already have an account? <Text style={styles.linkBold}>Sign in</Text>
                        </Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}
