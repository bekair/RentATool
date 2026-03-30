import React, { useCallback, useEffect, useState } from 'react';
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
import ThemedSafeAreaView from '../components/layout/ThemedSafeAreaView';

import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { getAppSettings, updateAppSettings } from '../services/appSettingsService';
import { useTheme } from '../theme';
import AppScreenHeader from '../components/ui/AppScreenHeader';

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

const THEME_ITEMS = [
    { id: 'light', label: 'Light' },
    { id: 'dark', label: 'Dark' },
    { id: 'system', label: 'System' },
];

export default function SettingsScreen({ navigation }) {
    const { themeMode, setThemeMode, theme } = useTheme();
    const styles = useMemo(() => createStyles(theme), [theme]);
    const switchTrackColor = useMemo(
        () => ({ false: theme.colors.borderStrong, true: theme.colors.accent }),
        [theme],
    );
    const getSwitchThumbColor = useCallback(
        (enabled) => (enabled ? theme.colors.accentContrast : theme.colors.surfaceAlt),
        [theme],
    );
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
        themeMode: themeMode || 'dark',
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

    useEffect(() => {
        setSettings((previous) => ({
            ...previous,
            themeMode,
        }));
    }, [themeMode]);

    const handleToggle = async (key, value) => {
        if (key === 'themeMode') {
            const previousThemeMode = settings.themeMode;
            setSettings((previous) => ({ ...previous, themeMode: value }));
            setSavingKey(key);
            try {
                await setThemeMode(value);
            } catch (error) {
                setSettings((previous) => ({
                    ...previous,
                    themeMode: previousThemeMode,
                }));
                Alert.alert('Settings', 'Could not save this setting. Please try again.');
            } finally {
                setSavingKey(null);
            }
            return;
        }

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
                <View style={styles.switchSlot}>
                    <Switch
                        value={value}
                        onValueChange={(next) => handlePushToggle(item.id, next)}
                        disabled={!isPushEnabled || isSaving}
                        trackColor={switchTrackColor}
                        thumbColor={getSwitchThumbColor(value)}
                    />
                </View>
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
                <View style={styles.switchSlot}>
                    <Switch
                        value={value}
                        onValueChange={(next) => handleToggle(item.id, next)}
                        disabled={isSaving}
                        trackColor={switchTrackColor}
                        thumbColor={getSwitchThumbColor(value)}
                    />
                </View>
            </View>
        );
    };

    return (
        <ThemedSafeAreaView>
            <AppScreenHeader title="Settings" onBack={() => navigation.goBack()} />
            {loading ? (
                <View style={styles.loadingWrap}>
                    <ActivityIndicator size="large" color={theme.colors.accent} />
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
                                        color={theme.colors.textMuted}
                                    />
                                </TouchableOpacity>
                                <View style={styles.pushHeaderRight}>
                                    <Switch
                                        value={Boolean(settings.pushNotificationsEnabled)}
                                        onValueChange={(next) => handleToggle('pushNotificationsEnabled', next)}
                                        disabled={savingKey === 'pushNotificationsEnabled'}
                                        trackColor={switchTrackColor}
                                        thumbColor={getSwitchThumbColor(Boolean(settings.pushNotificationsEnabled))}
                                    />
                                </View>
                            </View>
                            {isPushSectionExpanded ? (
                                <View style={styles.pushSubList}>
                                    {PUSH_NOTIFICATION_ITEMS.map(renderPushNotificationPreference)}
                                </View>
                            ) : null}

                            {TOGGLE_ITEMS.map(renderTogglePreference)}

                            <View style={styles.themeBlock}>
                                <Text style={styles.rowTitle}>Theme</Text>
                                <View style={styles.themeGrid}>
                                    {THEME_ITEMS.map((themeItem) => {
                                        const isSelected = settings.themeMode === themeItem.id;
                                        const isLight = themeItem.id === 'light';
                                        const isSystem = themeItem.id === 'system';
                                        return (
                                            <TouchableOpacity
                                                key={themeItem.id}
                                                style={[
                                                    styles.themeCard,
                                                    isSelected && styles.themeCardSelected,
                                                ]}
                                                onPress={() => handleToggle('themeMode', themeItem.id)}
                                                activeOpacity={0.85}
                                                disabled={savingKey === 'themeMode'}
                                            >
                                                <View
                                                    style={[
                                                        styles.themePreviewFrame,
                                                        isSystem && styles.themePreviewFrameSystem,
                                                        isSystem &&
                                                        isSelected &&
                                                        styles.themePreviewFrameSystemSelected,
                                                    ]}
                                                >
                                                    <View
                                                        style={[
                                                            styles.themePreview,
                                                            isSystem
                                                                ? styles.themePreviewSystem
                                                                : isLight
                                                                    ? styles.themePreviewLight
                                                                    : styles.themePreviewDark,
                                                            isSystem &&
                                                            styles.themePreviewSystemNoPadding,
                                                        ]}
                                                    >
                                                        {isSystem ? (
                                                            <View style={styles.themePreviewSystemSplit}>
                                                                <View
                                                                    style={[
                                                                        styles.themePreviewSystemPane,
                                                                        styles.themePreviewSystemPaneLight,
                                                                    ]}
                                                                >
                                                                    <View
                                                                        style={[
                                                                            styles.themePreviewSystemPaneTop,
                                                                            styles.themePreviewTopLight,
                                                                        ]}
                                                                    />
                                                                    <View style={styles.themePreviewSystemPaneDots}>
                                                                        <View
                                                                            style={[
                                                                                styles.themePreviewDot,
                                                                                styles.themePreviewDotLight,
                                                                            ]}
                                                                        />
                                                                        <View
                                                                            style={[
                                                                                styles.themePreviewDot,
                                                                                styles.themePreviewDotLight,
                                                                            ]}
                                                                        />
                                                                    </View>
                                                                    <View
                                                                        style={
                                                                            styles.themePreviewSystemPaneAccentLight
                                                                        }
                                                                    />
                                                                </View>
                                                                <View
                                                                    style={[
                                                                        styles.themePreviewSystemPane,
                                                                        styles.themePreviewSystemPaneDark,
                                                                    ]}
                                                                >
                                                                    <View
                                                                        style={[
                                                                            styles.themePreviewSystemPaneTop,
                                                                            styles.themePreviewTopDark,
                                                                        ]}
                                                                    />
                                                                    <View style={styles.themePreviewSystemPaneDots}>
                                                                        <View
                                                                            style={[
                                                                                styles.themePreviewDot,
                                                                                styles.themePreviewDotDark,
                                                                            ]}
                                                                        />
                                                                        <View
                                                                            style={[
                                                                                styles.themePreviewDot,
                                                                                styles.themePreviewDotDark,
                                                                            ]}
                                                                        />
                                                                    </View>
                                                                    <View
                                                                        style={
                                                                            styles.themePreviewSystemPaneAccentDark
                                                                        }
                                                                    />
                                                                </View>
                                                            </View>
                                                        ) : (
                                                            <>
                                                                <View
                                                                    style={[
                                                                        styles.themePreviewTop,
                                                                        isLight
                                                                            ? styles.themePreviewTopLight
                                                                            : styles.themePreviewTopDark,
                                                                    ]}
                                                                />
                                                                <View style={styles.themePreviewDots}>
                                                                    <View
                                                                        style={[
                                                                            styles.themePreviewDot,
                                                                            isLight
                                                                                ? styles.themePreviewDotLight
                                                                                : styles.themePreviewDotDark,
                                                                        ]}
                                                                    />
                                                                    <View
                                                                        style={[
                                                                            styles.themePreviewDot,
                                                                            isLight
                                                                                ? styles.themePreviewDotLight
                                                                                : styles.themePreviewDotDark,
                                                                        ]}
                                                                    />
                                                                    <View
                                                                        style={[
                                                                            styles.themePreviewDot,
                                                                            isLight
                                                                                ? styles.themePreviewDotLight
                                                                                : styles.themePreviewDotDark,
                                                                        ]}
                                                                    />
                                                                </View>
                                                                <View style={styles.themePreviewAccent} />
                                                            </>
                                                        )}
                                                    </View>
                                                </View>
                                                <Text
                                                    style={[
                                                        styles.themeCardLabel,
                                                        isSelected && styles.themeCardLabelSelected,
                                                    ]}
                                                >
                                                    {themeItem.label}
                                                </Text>
                                            </TouchableOpacity>
                                        );
                                    })}
                                </View>
                            </View>
                        </View>
                    </View>

                </ScrollView>
            )}
        </ThemedSafeAreaView>
    );
}

const createStyles = (theme) => StyleSheet.create({
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
        color: theme.colors.textPrimary,
        fontSize: 16,
        fontWeight: '700',
    },
    card: {
        backgroundColor: theme.colors.surface,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: theme.colors.border,
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
        backgroundColor: theme.colors.surfaceAlt,
        borderWidth: 1,
        borderColor: theme.colors.borderStrong,
        borderRadius: 12,
        marginLeft: 26,
        marginRight: 4,
        borderLeftWidth: 2,
        borderLeftColor: theme.colors.accent,
    },
    subRowDisabled: {
        opacity: 0.55,
    },
    rowTextWrap: {
        flex: 1,
    },
    rowTitle: {
        color: theme.colors.textPrimary,
        fontSize: 15,
        fontWeight: '600',
    },
    rowSubtitle: {
        color: theme.colors.textMuted,
        fontSize: 12,
        marginTop: 3,
    },
    switchSlot: {
        width: 52,
        alignItems: 'flex-end',
        justifyContent: 'center',
    },
    themeBlock: {
        paddingHorizontal: 14,
        paddingTop: 10,
        paddingBottom: 12,
    },
    themeGrid: {
        marginTop: 10,
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 10,
    },
    themeCard: {
        flex: 1,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: theme.colors.borderStrong,
        borderRadius: 12,
        backgroundColor: theme.colors.surfaceAlt,
        paddingVertical: 8,
    },
    themeCardSelected: {
        borderColor: theme.colors.accent,
        shadowColor: theme.colors.accent,
        shadowOpacity: 0.35,
        shadowRadius: 6,
        shadowOffset: { width: 0, height: 0 },
        elevation: 2,
    },
    themeCardLabel: {
        color: theme.colors.textMuted,
        fontSize: 13,
        fontWeight: '600',
        marginTop: 7,
    },
    themeCardLabelSelected: {
        color: theme.colors.textPrimary,
    },
    themePreview: {
        width: 46,
        height: 74,
        borderRadius: 8,
        borderWidth: 1,
        overflow: 'hidden',
        paddingHorizontal: 6,
        paddingTop: 7,
        paddingBottom: 6,
        justifyContent: 'space-between',
    },
    themePreviewFrame: {
        width: 46,
        height: 74,
        borderRadius: 8,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: theme.colors.borderStrong,
    },
    themePreviewFrameSystem: {
        borderColor: theme.colors.textMuted,
    },
    themePreviewFrameSystemSelected: {
        borderColor: theme.colors.border,
    },
    themePreviewLight: {
        backgroundColor: '#f3f4f6',
        borderColor: '#d1d5db',
    },
    themePreviewDark: {
        backgroundColor: '#1c1c1f',
        borderColor: '#3f3f46',
    },
    themePreviewSystem: {
        backgroundColor: '#111114',
        borderColor: '#3f3f46',
    },
    themePreviewSystemNoPadding: {
        paddingHorizontal: 0,
        paddingTop: 0,
        paddingBottom: 0,
        justifyContent: 'flex-start',
    },
    themePreviewSystemSplit: {
        flex: 1,
        flexDirection: 'row',
        width: '100%',
        height: '100%',
        borderRadius: 7,
        overflow: 'hidden',
    },
    themePreviewSystemPane: {
        flex: 1,
        paddingHorizontal: 3,
        paddingVertical: 5,
        justifyContent: 'space-between',
    },
    themePreviewSystemPaneLight: {
        backgroundColor: '#f3f4f6',
    },
    themePreviewSystemPaneDark: {
        backgroundColor: '#1c1c1f',
    },
    themePreviewSystemPaneTop: {
        height: 7,
        borderRadius: 3,
        width: '85%',
    },
    themePreviewSystemPaneDots: {
        flexDirection: 'row',
        gap: 2,
    },
    themePreviewSystemPaneAccentLight: {
        height: 6,
        borderRadius: 3,
        backgroundColor: '#818cf8',
    },
    themePreviewSystemPaneAccentDark: {
        height: 6,
        borderRadius: 3,
        backgroundColor: '#6366f1',
    },
    themePreviewTop: {
        height: 8,
        borderRadius: 3,
        width: '74%',
    },
    themePreviewTopLight: {
        backgroundColor: '#d4d4d8',
    },
    themePreviewTopDark: {
        backgroundColor: '#3f3f46',
    },
    themePreviewDots: {
        flexDirection: 'row',
        gap: 3,
    },
    themePreviewDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
    },
    themePreviewDotLight: {
        backgroundColor: '#d4d4d8',
    },
    themePreviewDotDark: {
        backgroundColor: '#3f3f46',
    },
    themePreviewAccent: {
        height: 6,
        borderRadius: 3,
        backgroundColor: '#6366f1',
    },
});