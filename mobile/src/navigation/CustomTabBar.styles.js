import { StyleSheet } from 'react-native';

export const BAR_H = 70;

export default function createStyles(theme) {
    const c = theme.colors;

    return StyleSheet.create({
        wrapper: {
            position: 'absolute',
            left: 15,
            right: 15,
            alignItems: 'center',
        },
        tabBar: {
            flexDirection: 'row',
            width: '100%',
            height: BAR_H,
            borderRadius: 30,
            borderWidth: 1,
            alignItems: 'center',
            overflow: 'visible',
            shadowColor: c.inputShadow,
            shadowOffset: { width: 0, height: 8 },
            shadowOpacity: 0.1,
            shadowRadius: 12,
            elevation: 5,
        },
        tab: {
            flex: 1,
            alignItems: 'center',
            justifyContent: 'center',
            gap: 3,
        },
        label: {
            fontSize: 10,
            fontWeight: '700',
        },
    });
}
