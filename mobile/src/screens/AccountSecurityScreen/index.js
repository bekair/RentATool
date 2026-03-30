import React, { useMemo, useState } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    ScrollView,
    Modal,
    Alert,
} from 'react-native';
import ThemedSafeAreaView from '../../components/layout/ThemedSafeAreaView';
import { Ionicons } from '@expo/vector-icons';
import AppScreenHeader from '../../components/ui/AppScreenHeader';
import { useTheme } from '../../theme';
import createStyles from './AccountSecurityScreen.styles';

export default function AccountSecurityScreen({ navigation }) {
    const { theme } = useTheme();
    const styles = useMemo(() => createStyles(theme), [theme]);
    const [showConfirmModal, setShowConfirmModal] = useState(false);

    const handleSendLink = () => {
        setShowConfirmModal(false);
        Alert.alert("Link Sent", "Check your email for the password reset link.");
    };

    return (
        <ThemedSafeAreaView>
            <AppScreenHeader title="Account Security" onBack={() => navigation.goBack()} />

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                <View style={styles.card}>
                    <TouchableOpacity style={styles.actionRow} onPress={() => setShowConfirmModal(true)}>
                        <View style={styles.actionRowLeft}>
                            <Ionicons
                                name="lock-closed-outline"
                                size={20}
                                color={theme.colors.textSecondary}
                                style={styles.actionIcon}
                            />
                            <Text style={styles.actionText}>Change Password</Text>
                        </View>
                        <Ionicons name="chevron-forward" size={20} color={theme.colors.iconSubtle} />
                    </TouchableOpacity>
                </View>
            </ScrollView>

            <Modal
                visible={showConfirmModal}
                transparent
                animationType="fade"
                onRequestClose={() => setShowConfirmModal(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalCard}>
                        <View style={styles.modalIconWrapper}>
                            <Ionicons name="lock-closed" size={28} color={theme.colors.accent} />
                        </View>
                        <Text style={styles.modalTitle}>Change Password</Text>
                        <Text style={styles.modalMessage}>
                            We'll send a password reset link to your email address. You'll be able to set a new password from there.
                        </Text>
                        <View style={styles.modalButtons}>
                            <TouchableOpacity
                                style={styles.cancelButton}
                                onPress={() => setShowConfirmModal(false)}
                                activeOpacity={0.7}
                            >
                                <Text style={styles.cancelButtonText}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={styles.sendButton}
                                onPress={handleSendLink}
                                activeOpacity={0.7}
                            >
                                <Text style={styles.sendButtonText}>Send Link</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </ThemedSafeAreaView>
    );
}
