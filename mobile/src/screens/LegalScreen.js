import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import ThemedSafeAreaView from '../components/layout/ThemedSafeAreaView';
import { Ionicons } from '@expo/vector-icons';
import AppScreenHeader from '../components/ui/AppScreenHeader';
import * as WebBrowser from 'expo-web-browser';

export default function LegalScreen({ navigation }) {
    const legalItems = [
        { id: 'tos', title: 'Terms of Service', icon: 'document-text-outline', url: 'https://rentatool.com/terms' },
        { id: 'privacy', title: 'Privacy Policy', icon: 'shield-checkmark-outline', url: 'https://rentatool.com/privacy' },
        { id: 'payment', title: 'Payment & Refund Policy', icon: 'card-outline', url: 'https://rentatool.com/payment' },
        { id: 'agreement', title: 'Owner & Renter Agreement', icon: 'hand-right-outline', url: 'https://rentatool.com/agreement' },
        { id: 'licenses', title: 'Open Source Licenses', icon: 'code-slash-outline', url: 'https://rentatool.com/licenses' },
    ];

    const handlePress = async (url) => {
        try {
            await WebBrowser.openBrowserAsync(url, {
                presentationStyle: WebBrowser.WebBrowserPresentationStyle.PAGE_SHEET, // iOS: opens as a modal sheet
                controlsColor: '#6366f1',
            });
        } catch (err) {
            console.error("Couldn't open browser", err);
        }
    };

    const renderLegalItem = (item) => (
        <TouchableOpacity
            key={item.id}
            style={styles.menuItem}
            onPress={() => handlePress(item.url)}
            activeOpacity={0.6}
        >
            <View style={styles.menuIconContainer}>
                <Ionicons name={item.icon} size={24} color="#555" />
            </View>
            <Text style={styles.menuItemText}>{item.title}</Text>
            <Ionicons name="open-outline" size={18} color="#555" />
        </TouchableOpacity>
    );

    return (
        <ThemedSafeAreaView>
            <AppScreenHeader title="Legal" onBack={() => navigation.goBack()} style={styles.headerSpacing} />

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                <View style={styles.menuContainer}>
                    {legalItems.map(renderLegalItem)}
                </View>
            </ScrollView>
        </ThemedSafeAreaView>
    );
}

const styles = StyleSheet.create({
    headerSpacing: {
        paddingBottom: 20,
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
});
