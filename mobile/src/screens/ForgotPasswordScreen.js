import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    KeyboardAvoidingView,
    Platform,
    ActivityIndicator,
    Alert
} from 'react-native';
import { useAuth } from '../context/AuthContext';

export default function ForgotPasswordScreen({ navigation }) {
    const [email, setEmail] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const { forgotPassword, error } = useAuth();

    const handleReset = async () => {
        if (!email) {
            Alert.alert('Error', 'Please enter your email address');
            return;
        }

        setIsSubmitting(true);
        const success = await forgotPassword(email);
        setIsSubmitting(false);

        if (success) {
            setIsSuccess(true);
        }
    };

    if (isSuccess) {
        return (
            <View style={styles.container}>
                <View style={[styles.header, { marginTop: 120 }]}>
                    <Text style={styles.logo}>📧</Text>
                    <Text style={styles.title}>Check your email</Text>
                    <Text style={styles.subtitle}>
                        We have sent password reset instructions to {email}
                    </Text>
                </View>
                <TouchableOpacity
                    style={styles.button}
                    onPress={() => navigation.navigate('Login')}
                >
                    <Text style={styles.buttonText}>Back to Login</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <View style={styles.header}>
                <Text style={styles.logo}>🔐</Text>
                <Text style={styles.title}>Reset Password</Text>
                <Text style={styles.subtitle}>
                    Enter your email to receive reset instructions
                </Text>
            </View>

            <View style={styles.form}>
                <View style={styles.inputContainer}>
                    <Text style={styles.label}>Email Address</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Enter your email"
                        placeholderTextColor="#666"
                        value={email}
                        onChangeText={setEmail}
                        keyboardType="email-address"
                        autoCapitalize="none"
                    />
                </View>

                {error && <Text style={styles.error}>{error}</Text>}

                <TouchableOpacity
                    style={[styles.button, isSubmitting && styles.buttonDisabled]}
                    onPress={handleReset}
                    disabled={isSubmitting}
                >
                    {isSubmitting ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <Text style={styles.buttonText}>Send Reset Link</Text>
                    )}
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.linkButton}
                    onPress={() => navigation.goBack()}
                >
                    <Text style={styles.linkText}>Back to Login</Text>
                </TouchableOpacity>
            </View>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0a0a0a',
        paddingHorizontal: 24,
    },
    header: {
        alignItems: 'center',
        marginTop: 80,
        marginBottom: 48,
    },
    logo: {
        fontSize: 64,
        marginBottom: 16,
    },
    title: {
        fontSize: 32,
        fontWeight: '700',
        color: '#fff',
        marginBottom: 8,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 16,
        color: '#888',
        textAlign: 'center',
        paddingHorizontal: 20,
    },
    form: {
        flex: 1,
    },
    inputContainer: {
        marginBottom: 20,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: '#fff',
        marginBottom: 8,
    },
    input: {
        backgroundColor: '#1a1a1a',
        borderRadius: 12,
        padding: 16,
        fontSize: 16,
        color: '#fff',
        borderWidth: 1,
        borderColor: '#333',
    },
    error: {
        color: '#ff4444',
        fontSize: 14,
        marginBottom: 16,
        textAlign: 'center',
    },
    button: {
        backgroundColor: '#6366f1',
        borderRadius: 12,
        padding: 18,
        alignItems: 'center',
        marginTop: 8,
    },
    buttonDisabled: {
        opacity: 0.6,
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '700',
    },
    linkButton: {
        marginTop: 24,
        alignItems: 'center',
    },
    linkText: {
        color: '#888',
        fontSize: 14,
    },
});
