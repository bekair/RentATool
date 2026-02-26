import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
    ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import api from '../api/client';

export default function HomeScreen({ navigation }) {
    const { user, logout } = useAuth();
    // Assuming listedCount represents "Lendings" (tools you own that have been rented) 
    // and rentalCount represents "Rents" (times you rented other people's tools).
    const [stats, setStats] = useState({ listedCount: 0, rentalCount: 0, rating: 5.0 });
    const [loading, setLoading] = useState(true);

    const fetchStats = async () => {
        try {
            const response = await api.get('/users/me/stats');
            setStats({
                ...response.data,
                // Defaulting rating for visual purposes until reputation mission is built
                rating: response.data.rating || 5.0
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
        { id: 'profile-info', title: 'Profile Information', icon: 'person-outline', screen: null },
        { id: 'favorites', title: 'Your Favorites', icon: 'heart-outline', screen: null },
        { id: 'payment', title: 'Payment details', icon: 'card-outline', screen: null },
        { id: 'trust', title: 'Trust & Verification', icon: 'shield-checkmark-outline', screen: null },
        { id: 'legal', title: 'Legal', icon: 'document-text-outline', screen: null },
        { id: 'help', title: 'Help', icon: 'headset-outline', screen: null },
        { id: 'settings', title: 'Settings', icon: 'settings-outline', screen: null },
    ];

    const renderMenuItem = (item) => (
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
            {/* Minimalist Top Nav Header */}
            <View style={styles.topNav}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    {/* Only show back if pushed on stack, otherwise hide it. Using empty view for spacing */}
                </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>

                {/* 1. Header Information */}
                <View style={styles.header}>
                    <View style={styles.avatarContainer}>
                        <View style={styles.avatar}>
                            <Text style={styles.avatarText}>
                                {user?.displayName?.charAt(0).toUpperCase() || 'U'}
                            </Text>
                        </View>

                        {/* Edit Pencil Icon on Avatar */}
                        <TouchableOpacity style={styles.editAvatarButton}>
                            <Ionicons name="pencil" size={16} color="#6366f1" />
                        </TouchableOpacity>

                        {/* Verification Badge */}
                        {user?.verificationTier !== 'UNVERIFIED' && (
                            <View style={styles.verifiedBadgeContainer}>
                                <Ionicons name="checkmark-circle" size={24} color="#10b981" />
                            </View>
                        )}
                    </View>
                    <Text style={styles.name}>{user?.displayName || 'User'}</Text>

                    <View style={styles.ratingContainer}>
                        <Ionicons name="star" size={14} color="#3b82f6" />
                        <Ionicons name="star" size={14} color="#3b82f6" />
                        <Ionicons name="star" size={14} color="#3b82f6" />
                        <Ionicons name="star" size={14} color="#3b82f6" />
                        <Ionicons name="star" size={14} color="#3b82f6" />
                        <Text style={styles.ratingText}> ({stats.rating.toFixed(1)})</Text>
                    </View>

                    <View style={styles.contactInfo}>
                        <View style={styles.contactRow}>
                            <Ionicons name="call-outline" size={16} color="#888" />
                            <Text style={styles.contactText}>+1 (555) 012-3456</Text>
                        </View>
                        <View style={styles.contactRow}>
                            <Ionicons name="mail-outline" size={16} color="#888" />
                            <Text style={styles.contactText}>{user?.email}</Text>
                        </View>
                    </View>
                </View>

                {/* 2. Quick Stats Row */}
                <View style={styles.statsContainer}>
                    <View style={styles.statBox}>
                        <Text style={styles.statValue}>
                            {loading ? <ActivityIndicator size="small" color="#fff" /> : stats.rentalCount}
                        </Text>
                        <Text style={styles.statLabel}>Total Rents</Text>
                    </View>
                    <View style={styles.statDivider} />
                    <View style={styles.statBox}>
                        <Text style={styles.statValue}>
                            {loading ? <ActivityIndicator size="small" color="#fff" /> : stats.listedCount}
                        </Text>
                        <Text style={styles.statLabel}>Total Lendings</Text>
                    </View>
                </View>

                {/* 3. Vertical Menu List */}
                <View style={styles.menuContainer}>
                    {menuItems.map(renderMenuItem)}
                </View>

                {/* 4. Bottom Log Out Box */}
                <View style={styles.logoutContainer}>
                    <TouchableOpacity style={styles.logoutItem} onPress={logout} activeOpacity={0.6}>
                        <View style={styles.menuIconContainer}>
                            <Ionicons name="power-outline" size={24} color="#ef4444" />
                        </View>
                        <Text style={[styles.menuItemText, { color: '#ef4444', fontWeight: 'bold' }]}>
                            Log out
                        </Text>
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
    topNav: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingTop: 10,
    },
    backButton: {
        width: 40,
        height: 40,
        justifyContent: 'center',
    },
    scrollContent: {
        paddingHorizontal: 20,
        paddingBottom: 110,
    },
    header: {
        alignItems: 'center',
        paddingVertical: 10,
    },
    avatarContainer: {
        position: 'relative',
        marginBottom: 15,
        marginTop: 10,
        alignItems: 'center',
    },
    avatar: {
        width: 110,
        height: 110,
        borderRadius: 55,
        backgroundColor: '#1a1a1a',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 3,
        borderColor: '#333',
    },
    avatarText: {
        fontSize: 42,
        fontWeight: 'bold',
        color: '#6366f1',
    },
    editAvatarButton: {
        position: 'absolute',
        top: 0,
        right: 0,
        backgroundColor: '#1a1a1a',
        borderRadius: 15,
        width: 32,
        height: 32,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1.5,
        borderColor: '#333',
    },
    verifiedBadgeContainer: {
        position: 'absolute',
        bottom: 2,
        right: 2,
        backgroundColor: '#0a0a0a',
        borderRadius: 15,
        padding: 2,
    },
    name: {
        fontSize: 26,
        fontWeight: '700',
        color: '#fff',
        marginBottom: 6,
    },
    ratingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    ratingText: {
        fontSize: 14,
        color: '#888',
        marginLeft: 6,
        fontWeight: '500',
    },
    contactInfo: {
        alignItems: 'flex-start',
        marginBottom: 10,
    },
    contactRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-start',
        marginBottom: 6,
    },
    contactText: {
        fontSize: 14,
        color: '#888',
        marginLeft: 8,
    },
    statsContainer: {
        flexDirection: 'row',
        backgroundColor: '#161616',
        borderRadius: 16,
        paddingVertical: 20,
        marginTop: 10,
        marginBottom: 30,
        borderWidth: 1,
        borderColor: '#262626',
    },
    statBox: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    statDivider: {
        width: 1,
        backgroundColor: '#262626',
    },
    statValue: {
        fontSize: 22,
        fontWeight: '700',
        color: '#fff',
        marginBottom: 6,
    },
    statLabel: {
        fontSize: 14,
        color: '#888',
        fontWeight: '500',
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
    logoutContainer: {
        backgroundColor: '#161616',
        borderRadius: 16,
        paddingVertical: 4,
        marginBottom: 30,
        borderWidth: 1,
        borderColor: '#262626',
    },
    logoutItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 16,
        paddingHorizontal: 20,
    },
});
