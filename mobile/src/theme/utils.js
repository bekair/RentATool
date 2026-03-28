import { StyleSheet } from 'react-native';

export function createThemedStyles(factory) {
    return (theme) => StyleSheet.create(factory(theme));
}

export function getThemeColor(theme, key, fallback = undefined) {
    return theme?.colors?.[key] ?? fallback;
}
