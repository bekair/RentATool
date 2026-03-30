import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import ThemedSafeAreaView from '../../components/layout/ThemedSafeAreaView';
import AppScreenHeader from '../../components/ui/AppScreenHeader';
import { useAuth } from '../../context/AuthContext';
import styles from './PersonalInformationScreen.styles';

export default function PersonalInformationScreen({ navigation }) {
    const { logout } = useAuth();

    const sections = [
        { id: 'general-info', title: 'General information', icon: 'person-outline', screen: 'GeneralInfo' },
        { id: 'contact-details', title: 'Contact details', icon: 'call-outline', screen: 'ContactDetails' },
        { id: 'account-security', title: 'Account security', icon: 'lock-closed-outline', screen: 'AccountSecurity' },
        { id: 'addresses', title: 'Addresses', icon: 'location-outline', screen: 'Addresses' },
    ];

    const handleDeleteAccount = () => {
        Alert.alert(
            'Delete Account',
            'Are you sure you want to permanently delete your account? This action cannot be undone.',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: () => {
                        console.log('Initiate account deletion');
                        logout && logout();
                    },
                },
            ],
        );
    };

    const renderSectionItem = (item) => (
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
        <ThemedSafeAreaView>
            <AppScreenHeader title="Personal Information" onBack={() => navigation.goBack()} style={styles.headerSpacing} />

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                <View style={styles.menuContainer}>
                    {sections.map(renderSectionItem)}
                </View>

                <View style={styles.deleteAccountContainer}>
                    <TouchableOpacity
                        style={styles.deleteAccountItem}
                        onPress={handleDeleteAccount}
                        activeOpacity={0.6}
                    >
                        <Text style={styles.deleteAccountText}>Delete Account</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </ThemedSafeAreaView>
    );
}
