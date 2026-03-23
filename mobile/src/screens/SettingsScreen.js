import React, { useCallback, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import AppButton from '../components/ui/AppButton';
import { getAppSettings, updateAppSettings } from '../services/appSettingsService';
import { useAuth } from '../context/AuthContext';

const PUSH_NOTIFICATION_ITEMS = [
    {
        id: 'bookingActivity',
        title: 'Booking activity',
        subtitle: 'Requests, approvals, declines, cancellations, and completion updates',
    },
    {
        id: 'paymentAndRefunds',
        title: 'Payments and refunds',
        subtitle: 'Payment status, refund updates, and failures',
    },
];

const TOGGLE_ITEMS = [
    {
        id: 'emailUpdatesEnabled',
        title: 'Email updates',
        subtitle: 'Receive booking and account updates via email',
    },
    {
        id: 'biometricLockEnabled',
        title: 'Biometric lock',
        subtitle: 'Use Face ID/Touch ID intent for future app lock',
    },
];

export default function SettingsScreen({ navigation }) {
    const { logout } = useAuth();
    const [loading, setLoading] = useState(true);
    const [savingKey, setSavingKey] = useState(null);
    const [isPushSectionExpanded, setIsPushSectionExpanded] = useState(true);
    const [settings, setSettings] = useState({
        pushNotificationsEnabled: true,
        pushNotifications: {
            bookingActivity: true,
            paymentAndRefunds: true,
        },
        emailUpdatesEnabled: true,
        biometricLockEnabled: false,
        themeMode: 'dark',
    });

    const loadSettings = useCallback(async () => {
        try {
            const next = await getAppSettings();
            setSettings(next);
        } catch (error) {
            Alert.alert('Settings', 'Unable to load settings. Using defaults.');
        } finally {
            setLoading(false);
        }
    }, []);

    useFocusEffect(
        useCallback(() => {
            setLoading(true);
            loadSettings();
        }, [loadSettings]),
    );

    const handleToggle = async (key, value) => {
        const previous = settings;
        const nextPushNotifications =
            key === 'pushNotificationsEnabled'
                ? {
                    bookingActivity: value,
                    paymentAndRefunds: value,
                }
                : previous.pushNotifications;
        const next = {
            ...previous,
            [key]: value,
            pushNotifications: nextPushNotifications,
        };

        setSettings(next);
        setSavingKey(key);

        try {
            const persisted = await updateAppSettings({
                [key]: value,
                ...(key === 'pushNotificationsEnabled'
                    ? { pushNotifications: nextPushNotifications }
                    : {}),
            });
            setSettings(persisted);
        } catch (error) {
            setSettings(previous);
            Alert.alert('Settings', 'Could not save this setting. Please try again.');
        } finally {
            setSavingKey(null);
        }
    };

    const handlePushToggle = async (pushKey, value) => {
        const previous = settings;
        const nextPushNotifications = {
            ...previous.pushNotifications,
            [pushKey]: value,
        };
        const anyPushEnabled = Object.values(nextPushNotifications).some(Boolean);
        const next = {
            ...previous,
            pushNotifications: nextPushNotifications,
            pushNotificationsEnabled: anyPushEnabled,
        };

        const savingId = `push:${pushKey}`;
        setSettings(next);
        setSavingKey(savingId);

        try {
            const persisted = await updateAppSettings({
                pushNotifications: nextPushNotifications,
                pushNotificationsEnabled: anyPushEnabled,
            });
            setSettings(persisted);
        } catch (error) {
            setSettings(previous);
            Alert.alert('Settings', 'Could not save this setting. Please try again.');
        } finally {
            setSavingKey(null);
        }
    };

    const renderPushNotificationPreference = (item) => {
        const isPushEnabled = Boolean(settings.pushNotificationsEnabled);
        const value = Boolean(settings.pushNotifications?.[item.id]);
        const isSaving = savingKey === `push:${item.id}`;

        return (
            <View key={item.id} style={[styles.subRow, !isPushEnabled && styles.subRowDisabled]}>
                <View style={styles.rowTextWrap}>
                    <Text style={styles.rowTitle}>{item.title}</Text>
                    <Text style={styles.rowSubtitle}>{item.subtitle}</Text>
                </View>
                {isSaving ? (
                    <ActivityIndicator size="small" color="#6366f1" />
                ) : (
                    <Switch
                        value={value}
                        onValueChange={(next) => handlePushToggle(item.id, next)}
                        disabled={!isPushEnabled}
                        trackColor={{ false: '#3f3f46', true: '#6366f1' }}
                        thumbColor={value ? '#ffffff' : '#d4d4d8'}
                    />
                )}
            </View>
        );
    };

    const renderTogglePreference = (item) => {
        const value = Boolean(settings[item.id]);
        const isSaving = savingKey === item.id;

        return (
            <View key={item.id} style={styles.row}>
                <View style={styles.rowTextWrap}>
                    <Text style={styles.rowTitle}>{item.title}</Text>
                    <Text style={styles.rowSubtitle}>{item.subtitle}</Text>
                </View>
                {isSaving ? (
                    <ActivityIndicator size="small" color="#6366f1" />
                ) : (
                    <Switch
                        value={value}
                        onValueChange={(next) => handleToggle(item.id, next)}
                        trackColor={{ false: '#3f3f46', true: '#6366f1' }}
                        thumbColor={value ? '#ffffff' : '#d4d4d8'}
                    />
                )}
            </View>
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="#fff" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Settings</Text>
                <View style={styles.headerRightSpacer} />
            </View>

            {loading ? (
                <View style={styles.loadingWrap}>
                    <ActivityIndicator size="large" color="#6366f1" />
                </View>
            ) : (
                <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>App preferences</Text>
                        <View style={styles.card}>
                            <View style={styles.pushGroupHeader}>
                                <TouchableOpacity
                                    style={styles.pushHeaderToggle}
                                    activeOpacity={0.8}
                                    onPress={() => setIsPushSectionExpanded((current) => !current)}
                                >
                                    <View style={styles.rowTextWrap}>
                                        <Text style={styles.rowTitle}>Push notifications</Text>
                                        <Text style={styles.rowSubtitle}>Choose which push alerts you receive</Text>
                                    </View>
                                    <Ionicons
                                        name={isPushSectionExpanded ? 'chevron-up' : 'chevron-down'}
                                        size={18}
                                        color="#9ca3af"
                                    />
                                </TouchableOpacity>
                                <View style={styles.pushHeaderRight}>
                                    {savingKey === 'pushNotificationsEnabled' ? (
                                        <ActivityIndicator size="small" color="#6366f1" />
                                    ) : (
                                        <Switch
                                            value={Boolean(settings.pushNotificationsEnabled)}
                                            onValueChange={(next) => handleToggle('pushNotificationsEnabled', next)}
                                            trackColor={{ false: '#3f3f46', true: '#6366f1' }}
                                            thumbColor={
                                                settings.pushNotificationsEnabled ? '#ffffff' : '#d4d4d8'
                                            }
                                        />
                                    )}
                                </View>
                            </View>
                            {isPushSectionExpanded ? (
                                <View style={styles.pushSubList}>
                                    {PUSH_NOTIFICATION_ITEMS.map(renderPushNotificationPreference)}
                                </View>
                            ) : null}

                            {TOGGLE_ITEMS.map(renderTogglePreference)}

                            <View style={styles.row}>
                                <View style={styles.rowTextWrap}>
                                    <Text style={styles.rowTitle}>Theme</Text>
                                    <Text style={styles.rowSubtitle}>Choose your app appearance</Text>
                                </View>
                                <View style={styles.themeSwitchWrap}>
                                    <TouchableOpacity
                                        style={[
                                            styles.themeOption,
                                            settings.themeMode === 'dark' && styles.themeOptionSelected,
                                        ]}
                                        onPress={() => handleToggle('themeMode', 'dark')}
                                        activeOpacity={0.8}
                                        disabled={savingKey === 'themeMode'}
                                    >
                                        <Text
                                            style={[
                                                styles.themeOptionText,
                                                settings.themeMode === 'dark' && styles.themeOptionTextSelected,
                                            ]}
                                        >
                                            Dark
                                        </Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        style={[
                                            styles.themeOption,
                                            settings.themeMode === 'light' && styles.themeOptionSelected,
                                        ]}
                                        onPress={() => handleToggle('themeMode', 'light')}
                                        activeOpacity={0.8}
                                        disabled={savingKey === 'themeMode'}
                                    >
                                        <Text
                                            style={[
                                                styles.themeOptionText,
                                                settings.themeMode === 'light' && styles.themeOptionTextSelected,
                                            ]}
                                        >
                                            Light
                                        </Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </View>
                    </View>

                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Session</Text>
                        <View style={styles.card}>
                            <Text style={styles.sessionDescription}>
                                End the current session on this device.
                            </Text>
                            <AppButton
                                title="Log out"
                                iconName="power-outline"
                                onPress={logout}
                                style={styles.logoutButton}
                            />
                        </View>
                    </View>
                </ScrollView>
            )}
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
        paddingBottom: 12,
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
    headerRightSpacer: {
        width: 34,
    },
    loadingWrap: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    scrollContent: {
        paddingHorizontal: 20,
        paddingBottom: 24,
        gap: 18,
    },
    section: {
        gap: 10,
    },
    sectionTitle: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '700',
    },
    card: {
        backgroundColor: '#161616',
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#262626',
        paddingVertical: 4,
    },
    pushGroupHeader: {
        minHeight: 62,
        paddingHorizontal: 14,
        paddingTop: 12,
        paddingBottom: 8,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    pushHeaderToggle: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    pushHeaderRight: {
        minWidth: 52,
        alignItems: 'flex-end',
        justifyContent: 'center',
    },
    pushSubList: {
        paddingLeft: 8,
        paddingRight: 8,
        paddingBottom: 8,
        gap: 8,
    },
    row: {
        minHeight: 72,
        paddingHorizontal: 14,
        paddingVertical: 12,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    subRow: {
        minHeight: 68,
        paddingLeft: 12,
        paddingRight: 10,
        paddingVertical: 10,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        backgroundColor: '#111118',
        borderWidth: 1,
        borderColor: '#2f2f3a',
        borderRadius: 12,
        marginLeft: 26,
        marginRight: 4,
        borderLeftWidth: 2,
        borderLeftColor: '#4f46e5',
    },
    subRowDisabled: {
        opacity: 0.55,
    },
    rowTextWrap: {
        flex: 1,
    },
    rowTitle: {
        color: '#f3f4f6',
        fontSize: 15,
        fontWeight: '600',
    },
    rowSubtitle: {
        color: '#9ca3af',
        fontSize: 12,
        marginTop: 3,
    },
    themeSwitchWrap: {
        flexDirection: 'row',
        backgroundColor: '#101014',
        borderWidth: 1,
        borderColor: '#30303a',
        borderRadius: 10,
        overflow: 'hidden',
    },
    themeOption: {
        minWidth: 64,
        minHeight: 34,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 12,
    },
    themeOptionSelected: {
        backgroundColor: '#6366f1',
    },
    themeOptionText: {
        color: '#9ca3af',
        fontSize: 12,
        fontWeight: '600',
    },
    themeOptionTextSelected: {
        color: '#fff',
    },
    sessionDescription: {
        color: '#9ca3af',
        fontSize: 13,
        lineHeight: 19,
        paddingHorizontal: 14,
        paddingTop: 12,
    },
    logoutButton: {
        marginHorizontal: 14,
        marginTop: 12,
        marginBottom: 12,
    },
});
