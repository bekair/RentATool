import React from 'react';
import MapView from 'react-native-maps';
import darkMapStyle from '../../constants/darkMapStyle';

const AppMapView = React.forwardRef(
    (
        {
            theme = 'light',
            customMapStyle,
            userInterfaceStyle,
            ...rest
        },
        ref,
    ) => {
        const isDark = theme === 'dark';

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
