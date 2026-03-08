import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
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
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="#fff" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Legal</Text>
                <View style={{ width: 34 }} />
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                <View style={styles.menuContainer}>
                    {legalItems.map(renderLegalItem)}
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
