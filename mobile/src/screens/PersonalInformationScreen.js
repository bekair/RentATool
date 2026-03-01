import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';

export default function PersonalInformationScreen({ navigation }) {
    const { user, logout } = useAuth();

    const sections = [
        { id: 'general-info', title: 'General information', icon: 'person-outline', screen: 'GeneralInfo' },
        { id: 'contact-details', title: 'Contact details', icon: 'call-outline', screen: 'ContactDetails' },
        { id: 'account-security', title: 'Account security', icon: 'lock-closed-outline', screen: 'AccountSecurity' },
        { id: 'addresses', title: 'Addresses', icon: 'location-outline', screen: 'Addresses' },
    ];

    const handleDeleteAccount = () => {
        Alert.alert(
            "Delete Account",
            "Are you sure you want to permanently delete your account? This action cannot be undone.",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Delete",
                    style: "destructive",
                    onPress: () => {
                        console.log('Initiate account deletion');
                        // Call deletion API and log out on success
                        logout && logout();
                    }
                }
            ]
        );
    };

    const renderSectionItem = (item, index) => (
        <TouchableOpacity
            key={item.id}
            style={styles.menuItem}
            onPress={() => item.screen ? navigation.navigate(item.screen) : null}
            activeOpacity={0.6}
        >
            <View style={styles.menuIconContainer}>
                <Ionicons name={item.icon} size={24} color="#555" />
            </View>
            <Text style={styles.menuItemText}>{item.title}</Text>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="#fff" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Personal Information</Text>
                <View style={{ width: 34 }} />
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>

                {/* Section Menu */}
                <View style={styles.menuContainer}>
                    {sections.map(renderSectionItem)}
                </View>

                {/* Account Actions */}
                <View style={[styles.deleteAccountContainer, { marginTop: 10 }]}>
                    <TouchableOpacity
                        style={styles.deleteAccountItem}
                        onPress={handleDeleteAccount}
                        activeOpacity={0.6}
                    >
                        <Text style={styles.deleteAccountText}>Delete Account</Text>
                    </TouchableOpacity>
                </View>

            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0a0a0a',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingTop: 10,
        paddingBottom: 20,
    },
    backButton: {
        padding: 5,
        marginLeft: -5,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#fff',
    },
    scrollContent: {
        paddingHorizontal: 20,
        paddingBottom: 40,
    },
    pageDescription: {
        fontSize: 15,
        color: '#888',
        marginBottom: 25,
        lineHeight: 22,
    },
    menuContainer: {
        backgroundColor: '#161616',
        borderRadius: 16,
        paddingVertical: 10,
        marginBottom: 30,
        borderWidth: 1,
        borderColor: '#262626',
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 16,
        paddingHorizontal: 20,
    },
    menuIconContainer: {
        width: 32,
        justifyContent: 'center',
        alignItems: 'flex-start',
    },
    menuItemText: {
        flex: 1,
        fontSize: 16,
        color: '#eee',
        fontWeight: '500',
    },
    deleteAccountContainer: {
        backgroundColor: '#161616',
        borderRadius: 16,
        paddingVertical: 4,
        marginBottom: 30,
        borderWidth: 1,
        borderColor: '#ef4444',
    },
    deleteAccountItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 16,
        paddingHorizontal: 20,
    },
    deleteAccountText: {
        fontSize: 16,
        color: '#ef4444',
        fontWeight: '600',
    },
});
