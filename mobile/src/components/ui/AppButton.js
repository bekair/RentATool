import React, { useMemo } from 'react';
import {
    ActivityIndicator,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../theme';

export default function AppButton({
    title,
    iconName,
    onPress,
    loading = false,
    disabled = false,
    style,
    textStyle,
}) {
    const { theme } = useTheme();
    const styles = useMemo(() => createStyles(theme), [theme]);
    const isDisabled = loading || disabled;

    return (
        <TouchableOpacity
            activeOpacity={0.8}
            onPress={onPress}
            disabled={isDisabled}
            style={[styles.button, isDisabled && styles.buttonDisabled, style]}
        >
            {loading ? (
                <ActivityIndicator size="small" color={theme.colors.buttonPrimaryText} />
            ) : (
                <View style={styles.content}>
                    {iconName ? <Ionicons name={iconName} size={18} color={theme.colors.buttonPrimaryText} /> : null}
                    <Text style={[styles.text, textStyle]}>{title}</Text>
                </View>
            )}
        </TouchableOpacity>
    );
}

const createStyles = (theme) =>
    StyleSheet.create({
        button: {
            marginTop: 14,
            backgroundColor: theme.colors.buttonPrimary,
            borderRadius: 12,
            minHeight: 44,
            alignItems: 'center',
            justifyContent: 'center',
            paddingHorizontal: 14,
        },
        buttonDisabled: {
            backgroundColor: theme.colors.buttonDisabled,
            opacity: 0.8,
        },
        content: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: 8,
        },
        text: {
            color: theme.colors.buttonPrimaryText,
            fontWeight: '700',
            fontSize: 14,
        },
    });

