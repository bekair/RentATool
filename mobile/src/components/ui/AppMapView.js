import React from 'react';
import MapView from 'react-native-maps';
import darkMapStyle from '../../constants/darkMapStyle';
import { RESOLVED_THEMES, useTheme } from '../../theme';

const AppMapView = React.forwardRef((props, ref) => {
    const { resolvedTheme } = useTheme();
    const isDark = resolvedTheme === RESOLVED_THEMES.DARK;

    return (
        <MapView
            ref={ref}
            customMapStyle={isDark ? darkMapStyle : undefined}
            userInterfaceStyle={resolvedTheme}
            {...props}
        />
    );
});

AppMapView.displayName = 'AppMapView';

export default AppMapView;
