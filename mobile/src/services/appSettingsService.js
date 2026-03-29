import AsyncStorage from '@react-native-async-storage/async-storage';
import { RESOLVED_THEMES } from '../theme';

const APP_SETTINGS_STORAGE_KEY = 'app_settings_v1';

export const defaultPushNotifications = {
    bookingActivity: true,
    paymentAndRefunds: true,
};

export const defaultAppSettings = {
    pushNotificationsEnabled: true,
    pushNotifications: { ...defaultPushNotifications },
    emailUpdatesEnabled: true,
    biometricLockEnabled: false,
    themeMode: RESOLVED_THEMES.DARK,
};

function resolveLegacyNotificationsEnabled(value) {
    return typeof value?.notificationsEnabled === 'boolean'
        ? value.notificationsEnabled
        : null;
}

function normalizePushNotifications(value, legacyNotificationsEnabled) {
    const fallback =
        typeof legacyNotificationsEnabled === 'boolean'
            ? legacyNotificationsEnabled
            : true;

    return {
        bookingActivity:
            typeof value?.bookingActivity === 'boolean'
                ? value.bookingActivity
                : fallback,
        paymentAndRefunds:
            typeof value?.paymentAndRefunds === 'boolean'
                ? value.paymentAndRefunds
                : fallback,
    };
}

function mergeWithDefaults(value) {
    if (!value || typeof value !== 'object') {
        return {
            ...defaultAppSettings,
            pushNotifications: { ...defaultPushNotifications },
        };
    }

    const legacyNotificationsEnabled = resolveLegacyNotificationsEnabled(value);
    const normalizedPushNotifications = normalizePushNotifications(
        value.pushNotifications,
        legacyNotificationsEnabled,
    );
    const inferredPushEnabledFromCategories = Object.values(
        normalizedPushNotifications,
    ).some(Boolean);

    return {
        pushNotificationsEnabled:
            typeof value.pushNotificationsEnabled === 'boolean'
                ? value.pushNotificationsEnabled
                : typeof legacyNotificationsEnabled === 'boolean'
                    ? legacyNotificationsEnabled
                    : inferredPushEnabledFromCategories,
        pushNotifications: normalizedPushNotifications,
        emailUpdatesEnabled:
            typeof value.emailUpdatesEnabled === 'boolean'
                ? value.emailUpdatesEnabled
                : defaultAppSettings.emailUpdatesEnabled,
        biometricLockEnabled:
            typeof value.biometricLockEnabled === 'boolean'
                ? value.biometricLockEnabled
                : defaultAppSettings.biometricLockEnabled,
        themeMode:
            value.themeMode === 'light' ||
                value.themeMode === 'dark' ||
                value.themeMode === 'system'
                ? value.themeMode
                : defaultAppSettings.themeMode,
    };
}

export async function getAppSettings() {
    try {
        const raw = await AsyncStorage.getItem(APP_SETTINGS_STORAGE_KEY);
        if (!raw) {
            return {
                ...defaultAppSettings,
                pushNotifications: { ...defaultPushNotifications },
            };
        }

        const parsed = JSON.parse(raw);
        return mergeWithDefaults(parsed);
    } catch (error) {
        await AsyncStorage.removeItem(APP_SETTINGS_STORAGE_KEY);
        return {
            ...defaultAppSettings,
            pushNotifications: { ...defaultPushNotifications },
        };
    }
}

export async function updateAppSettings(patch) {
    const current = await getAppSettings();
    const pushNotificationsPatch =
        patch && typeof patch.pushNotifications === 'object'
            ? patch.pushNotifications
            : null;

    const next = mergeWithDefaults({
        ...current,
        ...(patch || {}),
        pushNotifications: {
            ...current.pushNotifications,
            ...(pushNotificationsPatch || {}),
        },
    });

    await AsyncStorage.setItem(APP_SETTINGS_STORAGE_KEY, JSON.stringify(next));
    return next;
}

export async function resetAppSettings() {
    const next = {
        ...defaultAppSettings,
        pushNotifications: { ...defaultPushNotifications },
    };
    await AsyncStorage.setItem(APP_SETTINGS_STORAGE_KEY, JSON.stringify(next));
    return next;
}
