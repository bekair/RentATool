import React, { useState, useCallback, useMemo } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    ScrollView,
    ActivityIndicator,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import ThemedSafeAreaView from '../../components/layout/ThemedSafeAreaView';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../theme';
import api from '../../api/client';
import { isVerifiedTier } from '../../constants/verificationTier';
import createStyles from './HomeScreen.styles';

export default function HomeScreen({ navigation }) {
    const { user, logout } = useAuth();
    const { theme } = useTheme();
    const styles = useMemo(() => createStyles(theme), [theme]);
    const [stats, setStats] = useState({ listedCount: 0, rentalCount: 0, rating: 5.0 });
    const [loading, setLoading] = useState(true);

    const fetchStats = async () => {
        try {
            const response = await api.get('/users/me/stats');
            setStats({
                ...response.data,
                rating: response.data.rating || 5.0,
            });
        } catch (error) {
            console.error('Error fetching stats:', error);
        } finally {
            setLoading(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            fetchStats();
        }, [])
    );

    const menuItems = [
        { id: 'profile-info', title: 'Personal Information', icon: 'person-outline', screen: 'PersonalInformation' },
        { id: 'favorites', title: 'Your Favorites', icon: 'heart-outline', screen: null },
        { id: 'payment', title: 'Payment details', icon: 'card-outline', screen: 'PaymentDetails' },
        { id: 'trust', title: 'Trust & Verification', icon: 'shield-checkmark-outline', screen: null },
        { id: 'legal', title: 'Legal', icon: 'document-text-outline', screen: 'Legal' },
        { id: 'help', title: 'Help', icon: 'headset-outline', screen: 'Help' },
        { id: 'settings', title: 'Settings', icon: 'settings-outline', screen: 'Settings' },
    ];

    const renderMenuItem = (item) => (
        <TouchableOpacity
            key={item.id}
            style={styles.menuItem}
            onPress={() => item.screen ? navigation.navigate(item.screen) : null}
            activeOpacity={0.6}
        >
            <View style={styles.menuIconContainer}>
                <Ionicons name={item.icon} size={24} color={theme.colors.iconMuted} />
            </View>
            <Text style={styles.menuItemText}>{item.title}</Text>
        </TouchableOpacity>
    );

    const profilePhoneCode = user?.profile?.phoneCode?.trim() || '';
    const profilePhoneNumber = user?.profile?.phoneNumber?.trim() || '';
    const profilePhone = [profilePhoneCode, profilePhoneNumber].filter(Boolean).join(' ');
    const hasProfilePhone = Boolean(profilePhone);
    const firstName = user?.profile?.firstName?.trim() || '';
    const profileDisplayName = user?.profile?.displayName?.trim() || firstName || 'User';

    return (
        <ThemedSafeAreaView>
            <View style={styles.topNav}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton} />
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                <View style={styles.header}>
                    <View style={styles.avatarContainer}>
                        <View style={styles.avatar}>
                            <Text style={styles.avatarText}>
                                {profileDisplayName.charAt(0).toUpperCase()}
                            </Text>
                        </View>

                        <TouchableOpacity style={styles.editAvatarButton}>
                            <Ionicons name="pencil" size={16} color={theme.colors.accent} />
                        </TouchableOpacity>

                        {isVerifiedTier(user?.verificationTier) && (
                            <View style={styles.verifiedBadgeContainer}>
                                <Ionicons name="checkmark-circle" size={24} color={theme.colors.success} />
                            </View>
                        )}
                    </View>
                    <Text style={styles.name}>{profileDisplayName}</Text>

                    <View style={styles.contactInfo}>
                        <View style={styles.contactRow}>
                            <Ionicons name="call-outline" size={16} color={theme.colors.iconMuted} />
                            {hasProfilePhone ? (
                                <Text style={styles.contactText}>{profilePhone}</Text>
                            ) : (
                                <TouchableOpacity onPress={() => navigation.navigate('ContactDetails')}>
                                    <Text style={styles.contactActionText}>Add phone number</Text>
                                </TouchableOpacity>
                            )}
                        </View>
                        <View style={styles.contactRow}>
                            <Ionicons name="mail-outline" size={16} color={theme.colors.iconMuted} />
                            <Text style={styles.contactText}>{user?.email}</Text>
                        </View>
                    </View>
                </View>

                <View style={styles.statsContainer}>
                    <View style={styles.statBox}>
                        <Text style={styles.statValue}>
                            {loading ? <ActivityIndicator size="small" color={theme.colors.textPrimary} /> : stats.rentalCount}
                        </Text>
                        <Text style={styles.statLabel}>Total Rents</Text>
                    </View>
                    <View style={styles.statDivider} />
                    <View style={styles.statBox}>
                        <Text style={styles.statValue}>
                            {loading ? <ActivityIndicator size="small" color={theme.colors.textPrimary} /> : stats.listedCount}
                        </Text>
                        <Text style={styles.statLabel}>Total Lendings</Text>
                    </View>
                </View>

                <View style={styles.menuContainer}>
                    {menuItems.map(renderMenuItem)}
                </View>

                <View style={styles.logoutContainer}>
                    <TouchableOpacity style={styles.logoutItem} onPress={logout} activeOpacity={0.6}>
                        <View style={styles.menuIconContainer}>
                            <Ionicons name="power-outline" size={24} color={theme.colors.danger} />
                        </View>
                        <Text style={styles.logoutText}>Log out</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </ThemedSafeAreaView>
    );
}
