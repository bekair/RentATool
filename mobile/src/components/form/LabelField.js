import React from 'react';
import { Text, StyleSheet } from 'react-native';

/**
 * LabelField — standard label displayed above each form field.
 * Accepts an optional `style` prop for overrides.
 */
export default function LabelField({ children, style }) {
    return <Text style={[s.label, style]}>{children}</Text>;
}

const s = StyleSheet.create({
    label: {
        fontSize: 16,
        fontWeight: '600',
        color: '#ffffff',
        marginBottom: 8,
    },
});
