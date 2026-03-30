import React, { useMemo } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as WebBrowser from 'expo-web-browser';
import ThemedSafeAreaView from '../../components/layout/ThemedSafeAreaView';
import AppScreenHeader from '../../components/ui/AppScreenHeader';
import { useTheme } from '../../theme';
import createStyles from './LegalScreen.styles';

export default function LegalScreen({ navigation }) {
    const { theme } = useTheme();
    const styles = useMemo(() => createStyles(theme), [theme]);

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
                presentationStyle: WebBrowser.WebBrowserPresentationStyle.PAGE_SHEET,
                controlsColor: theme.colors.accent,
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
                <Ionicons name={item.icon} size={24} color={theme.colors.iconMuted} />
            </View>
            <Text style={styles.menuItemText}>{item.title}</Text>
            <Ionicons name="open-outline" size={18} color={theme.colors.iconMuted} />
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
