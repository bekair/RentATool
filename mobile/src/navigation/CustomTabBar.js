import React, { useMemo } from 'react';
import { View, TouchableOpacity, Text, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../theme';
import createStyles from './CustomTabBar.styles';

const ICON_MAP = {
    Explore:  ['search',    'search-outline'],
    MyTools:  ['construct', 'construct-outline'],
    Bookings: ['calendar',  'calendar-outline'],
    Map:      ['map',       'map-outline'],
    Profile:  ['person',    'person-outline'],
};
const LABEL_MAP = { MyTools: 'My Tools' };

export default function CustomTabBar({ state, descriptors, navigation }) {
    const insets = useSafeAreaInsets();
    const { theme } = useTheme();
    const c = theme.colors;
    const styles = useMemo(() => createStyles(theme), [theme]);

    const tabBottom = Platform.OS === 'android' ? insets.bottom + 8 : 25;
    const routes    = state.routes;

    const emit = (route, focused) => {
        const ev = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
        if (!focused && !ev.defaultPrevented) navigation.navigate({ name: route.name, merge: true });
    };

    const renderTab = (route, idx) => {
        const focused   = state.index === idx;
        const color     = focused ? c.accent : c.tabBarInactive;
        const [on, off] = ICON_MAP[route.name] || ['ellipse', 'ellipse-outline'];
        const label     = LABEL_MAP[route.name] ?? route.name;

        return (
            <TouchableOpacity
                key={route.key}
                onPress={() => emit(route, focused)}
                style={styles.tab}
                activeOpacity={0.7}
                accessibilityRole="button"
                accessibilityLabel={label}
            >
                <Ionicons name={focused ? on : off} size={22} color={color} />
                <Text style={[styles.label, { color }]}>{label}</Text>
            </TouchableOpacity>
        );
    };

    return (
        <View style={[styles.wrapper, { bottom: tabBottom }]}>

            <View style={[styles.tabBar, {
                backgroundColor: c.tabBarBackground,
                borderColor: c.tabBarBorder,
            }]}>
                {routes.map((route, i) => renderTab(route, i))}
            </View>

        </View>
    );
}
