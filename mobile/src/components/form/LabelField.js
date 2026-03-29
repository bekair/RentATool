import React from 'react';
import { Text, StyleSheet } from 'react-native';
import { useTheme } from '../../theme';

/**
 * LabelField — standard label displayed above each form field.
 * Accepts an optional `style` prop for overrides.
 */
export default function LabelField({ children, style }) {
    const { theme } = useTheme();

    return <Text style={[s.label, { color: theme.colors.textPrimary }, style]}>{children}</Text>;
}

const s = StyleSheet.create({
    label: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 8,
    },
});
