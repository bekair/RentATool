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
    const [stats, setStats] = useState({ listedCount: 0, rentalCount: 0, rating: 0 });
    const [loading, setLoading] = useState(true);

    const fetchStats = async () => {
        try {
            const response = await api.get('/users/me/stats');
            setStats(response.data);
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
        { id: 'explore', title: 'Find Tools', icon: 'search', screen: 'Explore', color: '#6366f1' },
        { id: 'my-tools', title: 'My Tools', icon: 'construct', screen: 'MyTools', color: '#10b981' },
        { id: 'add-tool', title: 'List a Tool', icon: 'add-circle', screen: 'AddTool', color: '#f59e0b' },
        { id: 'bookings', title: 'My Bookings', icon: 'calendar', screen: 'Bookings', color: '#ec4899' },
    ];

    const renderMenuItem = (item) => (
        <TouchableOpacity
            key={item.id}
            style={styles.menuItem}
            onPress={() => navigation.navigate(item.screen)}
        >
            <View style={[styles.menuIconContainer, { backgroundColor: item.color + '15' }]}>
                <Ionicons name={item.icon} size={22} color={item.color} />
            </View>
            <Text style={styles.menuItemText}>{item.title}</Text>
            <Ionicons name="chevron-forward" size={18} color="#444" />
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                <View style={styles.header}>
                    <View style={styles.avatarContainer}>
                        <View style={styles.avatar}>
                            <Text style={styles.avatarText}>
                                {user?.displayName?.charAt(0).toUpperCase() || 'U'}
                            </Text>
                        </View>
                        <View style={styles.verifiedBadgeContainer}>
                            <Ionicons name="checkmark-circle" size={20} color="#22c55e" />
                        </View>
                    </View>
                    <Text style={styles.name}>{user?.displayName || 'User'}</Text>
                    <Text style={styles.email}>{user?.email}</Text>
                    <View style={styles.tierBadge}>
                        <Text style={styles.tierBadgeText}>{user?.verificationTier || 'UNVERIFIED'}</Text>
                    </View>
                </View>

                <View style={styles.statsContainer}>
                    <View style={styles.statBox}>
                        <Text style={styles.statValue}>
                            {loading ? <ActivityIndicator size="small" color="#fff" /> : stats.listedCount}
                        </Text>
                        <Text style={styles.statLabel}>Listed</Text>
                    </View>
                    <View style={[styles.statBox, styles.statDivider]}>
                        <Text style={styles.statValue}>
                            {loading ? <ActivityIndicator size="small" color="#fff" /> : stats.rentalCount}
                        </Text>
                        <Text style={styles.statLabel}>Rentals</Text>
                    </View>
                    <View style={styles.statBox}>
                        <Text style={styles.statValue}>
                            {loading ? <ActivityIndicator size="small" color="#fff" /> : stats.rating.toFixed(1)}
                        </Text>
                        <Text style={styles.statLabel}>Rating</Text>
                    </View>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Dashboard</Text>
                    <View style={styles.menuContainer}>
                        {menuItems.map(renderMenuItem)}
                    </View>
                </View>

                <View style={[styles.section, { marginBottom: 30 }]}>
                    <Text style={styles.sectionTitle}>Account</Text>
                    <View style={styles.menuContainer}>
                        <TouchableOpacity style={styles.menuItem}>
                            <View style={[styles.menuIconContainer, { backgroundColor: '#4441' }]}>
                                <Ionicons name="settings-outline" size={22} color="#888" />
                            </View>
                            <Text style={styles.menuItemText}>Settings</Text>
                            <Ionicons name="chevron-forward" size={18} color="#444" />
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.logoutItem} onPress={logout}>
                            <View style={[styles.menuIconContainer, { backgroundColor: '#ef444415' }]}>
                                <Ionicons name="log-out-outline" size={22} color="#ef4444" />
                            </View>
                            <Text style={[styles.menuItemText, { color: '#ef4444' }]}>Sign Out</Text>
                        </TouchableOpacity>
                    </View>
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
    scrollContent: {
        paddingHorizontal: 20,
        paddingBottom: 110, // Avoid overlap with floating tab bar
    },
    header: {
        alignItems: 'center',
        marginTop: 40,
        marginBottom: 30,
    },
    avatarContainer: {
        position: 'relative',
        marginBottom: 15,
    },
    avatar: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: '#1a1a1a',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#333',
    },
    avatarText: {
        fontSize: 40,
        fontWeight: 'bold',
        color: '#6366f1',
    },
    verifiedBadgeContainer: {
        position: 'absolute',
        bottom: 5,
        right: 5,
        backgroundColor: '#0a0a0a',
        borderRadius: 12,
        padding: 2,
    },
    name: {
        fontSize: 24,
        fontWeight: '800',
        color: '#fff',
        marginBottom: 4,
    },
    email: {
        fontSize: 14,
        color: '#666',
        marginBottom: 12,
    },
    tierBadge: {
        backgroundColor: 'rgba(99, 102, 241, 0.1)',
        paddingHorizontal: 15,
        paddingVertical: 6,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: 'rgba(99, 102, 241, 0.2)',
    },
    tierBadgeText: {
        fontSize: 11,
        fontWeight: 'bold',
        color: '#818cf8',
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    statsContainer: {
        flexDirection: 'row',
        backgroundColor: '#161616',
        borderRadius: 20,
        paddingVertical: 20,
        marginBottom: 35,
        borderWidth: 1,
        borderColor: '#262626',
    },
    statBox: {
        flex: 1,
        alignItems: 'center',
    },
    statDivider: {
        borderLeftWidth: 1,
        borderRightWidth: 1,
        borderColor: '#262626',
    },
    statValue: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 4,
    },
    statLabel: {
        fontSize: 12,
        color: '#666',
        fontWeight: '500',
    },
    section: {
        marginBottom: 25,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: '#444',
        marginBottom: 15,
        textTransform: 'uppercase',
        letterSpacing: 1,
        marginLeft: 5,
    },
    menuContainer: {
        backgroundColor: '#161616',
        borderRadius: 20,
        padding: 8,
        borderWidth: 1,
        borderColor: '#262626',
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 12,
        marginBottom: 4,
    },
    logoutItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 12,
        marginTop: 4,
        borderTopWidth: 1,
        borderTopColor: '#262626',
    },
    menuIconContainer: {
        width: 40,
        height: 40,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 15,
    },
    menuItemText: {
        flex: 1,
        fontSize: 16,
        fontWeight: '600',
        color: '#eee',
    },
});
