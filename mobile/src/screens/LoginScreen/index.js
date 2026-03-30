import React, { useState, useCallback, useMemo } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    KeyboardAvoidingView,
    Platform,
    ActivityIndicator,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../theme';
import createStyles from './LoginScreen.styles';

export default function LoginScreen({ navigation }) {
    const { theme } = useTheme();
    const styles = useMemo(() => createStyles(theme), [theme]);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { login, error, clearError } = useAuth();

    useFocusEffect(
        useCallback(() => {
            return () => {
                clearError();
            };
        }, [])
    );

    const handleLogin = async () => {
        if (!email || !password) return;
        setIsSubmitting(true);
        await login(email, password);
        setIsSubmitting(false);
    };

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <View style={styles.header}>
                <MaterialCommunityIcons name="tools" size={64} color={theme.colors.accent} style={styles.headerIcon} />
                <Text style={styles.title}>RENT-a-Tool</Text>
                <Text style={styles.subtitle}>Welcome back!</Text>
            </View>

            <View style={styles.form}>
                <View style={styles.inputContainer}>
                    <Text style={styles.label}>Email</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Enter your email"
                        placeholderTextColor={theme.colors.fieldPlaceholder}
                        value={email}
                        onChangeText={setEmail}
                        keyboardType="email-address"
                        autoCapitalize="none"
                    />
                </View>

                <View style={styles.inputContainer}>
                    <Text style={styles.label}>Password</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Enter your password"
                        placeholderTextColor={theme.colors.fieldPlaceholder}
                        value={password}
                        onChangeText={setPassword}
                        secureTextEntry
                    />
                </View>

                {error && <Text style={styles.error}>{error}</Text>}

                <TouchableOpacity
                    style={styles.forgotPasswordButton}
                    onPress={() => navigation.navigate('ForgotPassword')}
                >
                    <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.button, isSubmitting && styles.buttonDisabled]}
                    onPress={handleLogin}
                    disabled={isSubmitting}
                >
                    {isSubmitting ? (
                        <ActivityIndicator color={theme.colors.buttonPrimaryText} />
                    ) : (
                        <Text style={styles.buttonText}>Sign In</Text>
                    )}
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.linkButton}
                    onPress={() => navigation.navigate('Signup')}
                >
                    <Text style={styles.linkText}>
                        Don't have an account? <Text style={styles.linkBold}>Sign up</Text>
                    </Text>
                </TouchableOpacity>
            </View>
        </KeyboardAvoidingView>
    );
}
