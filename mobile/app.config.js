import 'dotenv/config';

export default {
    expo: {
        name: "Share a Tool",
        slug: "share-a-tool",
        version: "1.0.0",
        orientation: "portrait",
        icon: "./assets/icon.png",
        userInterfaceStyle: "light",
        newArchEnabled: true,
        splash: {
            image: "./assets/splash-icon.png",
            resizeMode: "contain",
            backgroundColor: "#ffffff",
        },
        ios: {
            supportsTablet: true,
            bundleIdentifier: "com.lorisoft.shareatool",
            infoPlist: {
                ITSAppUsesNonExemptEncryption: false,
                NSLocationWhenInUseUsageDescription:
                    "This app uses your location to show nearby tools on the map.",
            },
        },
        android: {
            adaptiveIcon: {
                foregroundImage: "./assets/adaptive-icon.png",
                backgroundColor: "#ffffff",
            },
            edgeToEdgeEnabled: true,
            package: "com.lorisoft.shareatool",
            permissions: ["ACCESS_FINE_LOCATION", "ACCESS_COARSE_LOCATION"],
            config: {
                googleMaps: {
                    // Loaded from mobile/.env — never committed to git
                    apiKey: process.env.GOOGLE_MAPS_ANDROID_API_KEY,
                },
            },
        },
        web: {
            favicon: "./assets/favicon.png",
        },
        plugins: [
            "expo-secure-store",
            [
                "expo-location",
                {
                    locationAlwaysAndWhenInUsePermission:
                        "Allow Share a Tool to use your location to show nearby tools.",
                },
            ],
        ],
        extra: {
            eas: {
                projectId: "cb49d49f-73ee-44c6-83d6-ad740470efbd",
            },
        },
    },
};
