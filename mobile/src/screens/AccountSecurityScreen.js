import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    Modal,
    Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

export default function AccountSecurityScreen({ navigation }) {
    const [showConfirmModal, setShowConfirmModal] = useState(false);

    const handleSendLink = () => {
        setShowConfirmModal(false);
        Alert.alert("Link Sent", "Check your email for the password reset link.");
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="#fff" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Account Security</Text>
                <View style={{ width: 34 }} />
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                <View style={styles.card}>
                    <TouchableOpacity style={styles.actionRow} onPress={() => setShowConfirmModal(true)}>
                        <View style={styles.actionRowLeft}>
                            <Ionicons name="lock-closed-outline" size={20} color="#eee" style={styles.actionIcon} />
                            <Text style={styles.actionText}>Change Password</Text>
                        </View>
                        <Ionicons name="chevron-forward" size={20} color="#555" />
                    </TouchableOpacity>
                </View>
            </ScrollView>

            {/* Change Password Confirmation Modal */}
            <Modal
                visible={showConfirmModal}
                transparent
                animationType="fade"
                onRequestClose={() => setShowConfirmModal(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalCard}>
                        <View style={styles.modalIconWrapper}>
                            <Ionicons name="lock-closed" size={28} color="#6366f1" />
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
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#0d0d0d' },
    header: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        paddingHorizontal: 20, paddingVertical: 15,
        borderBottomWidth: 1, borderBottomColor: '#1a1a1a',
    },
    backButton: { padding: 5, marginLeft: -5 },
    headerTitle: { fontSize: 18, fontWeight: '700', color: '#fff' },
    scrollContent: { padding: 20, paddingBottom: 40 },
    card: {
        backgroundColor: '#161616', borderRadius: 12, borderWidth: 1,
        borderColor: '#262626', overflow: 'hidden', marginBottom: 15,
    },
    actionRow: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16,
    },
    actionRowLeft: { flexDirection: 'row', alignItems: 'center' },
    actionIcon: { marginRight: 12 },
    actionText: { fontSize: 16, color: '#eee' },
    helpText: { fontSize: 13, color: '#666', marginTop: 8, paddingHorizontal: 5, lineHeight: 18 },

    // Modal
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.7)',
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 28,
    },
    modalCard: {
        width: '100%',
        backgroundColor: '#1a1a1a',
        borderRadius: 20,
        padding: 28,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#2a2a2a',
    },
    modalIconWrapper: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: '#6366f115',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#6366f130',
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#fff',
        marginBottom: 10,
    },
    modalMessage: {
        fontSize: 14,
        color: '#888',
        textAlign: 'center',
        lineHeight: 22,
        marginBottom: 28,
    },
    modalButtons: {
        flexDirection: 'row',
        gap: 12,
        width: '100%',
    },
    cancelButton: {
        flex: 1,
        paddingVertical: 14,
        borderRadius: 12,
        alignItems: 'center',
        backgroundColor: '#262626',
        borderWidth: 1,
        borderColor: '#333',
    },
    cancelButtonText: {
        fontSize: 15,
        fontWeight: '600',
        color: '#aaa',
    },
    sendButton: {
        flex: 1,
        paddingVertical: 14,
        borderRadius: 12,
        alignItems: 'center',
        backgroundColor: '#6366f1',
    },
    sendButtonText: {
        fontSize: 15,
        fontWeight: '600',
        color: '#fff',
    },
});
