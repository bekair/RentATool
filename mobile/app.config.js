import 'dotenv/config';

function getRequiredEnv(name) {
    const value = process.env[name];
    if (!value) {
        throw new Error(`Missing required environment variable: ${name}`);
    }

    return value;
}

const apiUrl = getRequiredEnv('EXPO_PUBLIC_API_URL');
const googleMapsApiKey = getRequiredEnv('GOOGLE_MAPS_ANDROID_API_KEY');
const stripePublishableKey = getRequiredEnv('EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY');

export default {
    expo: {
        name: "Share a Tool",
        slug: "share-a-tool",
        scheme: "shareatool",
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
                    apiKey: googleMapsApiKey,
                },
            },
        },
        web: {
            favicon: "./assets/favicon.png",
        },
        plugins: [
            "expo-secure-store",
            [
                "@stripe/stripe-react-native",
                {
                    merchantIdentifier: "merchant.com.lorisoft.shareatool",
                    enableGooglePay: false,
                },
            ],
            [
                "expo-location",
                {
                    locationAlwaysAndWhenInUsePermission:
                        "Allow Share a Tool to use your location to show nearby tools.",
                },
            ],
            "@react-native-community/datetimepicker",
        ],
        extra: {
            eas: {
                projectId: "cb49d49f-73ee-44c6-83d6-ad740470efbd",
            },
            apiUrl,
            googleMapsApiKey,
            stripePublishableKey,
        },
    },
};

