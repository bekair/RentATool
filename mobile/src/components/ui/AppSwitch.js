import React, { useMemo } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useTheme } from '../../theme';

const TRACK_WIDTH = 46;
const TRACK_HEIGHT = 28;
const THUMB_SIZE = 22;
const THUMB_OFFSET = 3;
const THUMB_TRANSLATE_ON = TRACK_WIDTH - THUMB_SIZE - (THUMB_OFFSET * 2);

export default function AppSwitch({
    value,
    onValueChange,
    disabled = false,
}) {
    const { theme } = useTheme();
    const styles = useMemo(() => createStyles(theme), [theme]);
    const thumbPosition = value ? THUMB_TRANSLATE_ON : 0;

    return (
        <Pressable
            onPress={() => {
                if (!disabled && onValueChange) {
                    onValueChange(!value);
                }
            }}
            disabled={disabled}
            accessibilityRole="switch"
            accessibilityState={{ checked: value, disabled }}
            style={[
                styles.track,
                value ? styles.trackOn : styles.trackOff,
                disabled && styles.trackDisabled,
            ]}
        >
            <View
                style={[
                    styles.thumb,
                    { transform: [{ translateX: thumbPosition }] },
                    disabled && styles.thumbDisabled,
                ]}
            />
        </Pressable>
    );
}

function createStyles(theme) {
    const c = theme.colors;

    return StyleSheet.create({
        track: {
            width: TRACK_WIDTH,
            height: TRACK_HEIGHT,
            borderRadius: TRACK_HEIGHT / 2,
            borderWidth: 1,
            justifyContent: 'center',
            paddingHorizontal: THUMB_OFFSET,
        },
        trackOn: {
            backgroundColor: c.accent,
            borderColor: c.accent,
        },
        trackOff: {
            backgroundColor: c.borderStrong,
            borderColor: c.border,
        },
        trackDisabled: {
            opacity: 0.55,
        },
        thumb: {
            width: THUMB_SIZE,
            height: THUMB_SIZE,
            borderRadius: THUMB_SIZE / 2,
            backgroundColor: c.accentContrast,
        },
        thumbDisabled: {
            backgroundColor: c.selectedCheckInactive,
        },
    });
}
