import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useColorScheme } from 'react-native';
import { defaultAppSettings, getAppSettings, updateAppSettings } from '../services/appSettingsService';
import { darkTheme, lightTheme, RESOLVED_THEMES, THEME_MODES } from './themes';

const ThemeContext = createContext(null);

const ALLOWED_THEME_MODES = new Set(Object.values(THEME_MODES));

function normalizeThemeMode(mode) {
    if (typeof mode !== 'string') {
        return defaultAppSettings.themeMode;
    }

    return ALLOWED_THEME_MODES.has(mode) ? mode : defaultAppSettings.themeMode;
}

export function ThemeProvider({ children }) {
    const systemColorScheme = useColorScheme();
    const [themeMode, setThemeModeState] = useState(defaultAppSettings.themeMode);
    const [isHydrated, setIsHydrated] = useState(false);

    useEffect(() => {
        let isMounted = true;

        async function hydrateThemeMode() {
            try {
                const settings = await getAppSettings();
                if (!isMounted) {
                    return;
                }
                setThemeModeState(normalizeThemeMode(settings?.themeMode));
            } finally {
                if (isMounted) {
                    setIsHydrated(true);
                }
            }
        }

        hydrateThemeMode();

        return () => {
            isMounted = false;
        };
    }, []);

    const resolvedTheme = useMemo(() => {
        const normalizedMode = normalizeThemeMode(themeMode);
        if (normalizedMode === THEME_MODES.SYSTEM) {
            return systemColorScheme === RESOLVED_THEMES.LIGHT
                ? RESOLVED_THEMES.LIGHT
                : RESOLVED_THEMES.DARK;
        }

        return normalizedMode;
    }, [themeMode, systemColorScheme]);

    const setThemeMode = useCallback(async (nextMode) => {
        const normalizedMode = normalizeThemeMode(nextMode);
        const previousMode = themeMode;

        setThemeModeState(normalizedMode);
        try {
            await updateAppSettings({ themeMode: normalizedMode });
        } catch (error) {
            setThemeModeState(previousMode);
            throw error;
        }
    }, [themeMode]);

    const theme = resolvedTheme === RESOLVED_THEMES.LIGHT ? lightTheme : darkTheme;

    const value = useMemo(() => ({
        themeMode,
        resolvedTheme,
        theme,
        isHydrated,
        setThemeMode,
    }), [themeMode, resolvedTheme, theme, isHydrated, setThemeMode]);

    return (
        <ThemeContext.Provider value={value}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used inside ThemeProvider');
    }

    return context;
}
