import React from 'react';
import MapView from 'react-native-maps';
import darkMapStyle from '../../constants/darkMapStyle';
import { RESOLVED_THEMES, useTheme } from '../../theme';

const AppMapView = React.forwardRef(
    (
        {
            theme: themeOverride,
            customMapStyle,
            userInterfaceStyle,
            ...rest
        },
        ref,
    ) => {
        const { resolvedTheme } = useTheme();
        const effectiveTheme = themeOverride || resolvedTheme;
        const isDark = effectiveTheme === RESOLVED_THEMES.DARK;

        const resolvedCustomMapStyle =
            customMapStyle ?? (isDark ? darkMapStyle : undefined);
        const resolvedUserInterfaceStyle =
            userInterfaceStyle ?? (isDark ? 'dark' : undefined);

        return (
            <MapView
                ref={ref}
                customMapStyle={resolvedCustomMapStyle}
                userInterfaceStyle={resolvedUserInterfaceStyle}
                {...rest}
            />
        );
    },
);

AppMapView.displayName = 'AppMapView';

export default AppMapView;
