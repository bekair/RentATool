import React from 'react';
import {
    ActivityIndicator,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function AppButton({
    title,
    iconName,
    onPress,
    loading = false,
    disabled = false,
    style,
    textStyle,
}) {
    const isDisabled = loading || disabled;

    return (
        <TouchableOpacity
            activeOpacity={0.8}
            onPress={onPress}
            disabled={isDisabled}
            style={[styles.button, isDisabled && styles.buttonDisabled, style]}
        >
            {loading ? (
                <ActivityIndicator size="small" color="#fff" />
            ) : (
                <View style={styles.content}>
                    {iconName ? <Ionicons name={iconName} size={18} color="#fff" /> : null}
                    <Text style={[styles.text, textStyle]}>{title}</Text>
                </View>
            )}
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    button: {
        marginTop: 14,
        backgroundColor: '#6366f1',
        borderRadius: 12,
        minHeight: 44,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 14,
    },
    buttonDisabled: {
        opacity: 0.6,
    },
    content: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    text: {
        color: '#fff',
        fontWeight: '700',
        fontSize: 14,
    },
});

