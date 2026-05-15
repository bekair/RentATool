import React, { useMemo } from 'react';
import { NavigationContainer, DefaultTheme as NavigationDefaultTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { ActivityIndicator, View, StyleSheet } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider, useAuth } from '../context/AuthContext';
import { useTheme } from '../theme';
import CustomTabBar from './CustomTabBar';
import LoginScreen from '../screens/LoginScreen';
import SignupScreen from '../screens/SignupScreen';
import ForgotPasswordScreen from '../screens/ForgotPasswordScreen';
import HomeScreen from '../screens/HomeScreen';
import PersonalInformationScreen from '../screens/PersonalInformationScreen';
import GeneralInfoScreen from '../screens/GeneralInfoScreen';
import ContactDetailsScreen from '../screens/ContactDetailsScreen';
import AccountSecurityScreen from '../screens/AccountSecurityScreen';
import AddressesScreen from '../screens/AddressesScreen';
import MapScreen from '../screens/MapScreen';
import AddToolScreen from '../screens/AddToolScreen';
import ToolDetailsScreen from '../screens/ToolDetailsScreen';
import BookingsScreen from '../screens/BookingsScreen';
import EditToolScreen from '../screens/EditToolScreen';
import BookingRequestScreen from '../screens/BookingRequestScreen';
import BrowseToolsScreen from '../screens/BrowseToolsScreen';
import MyToolsScreen from '../screens/MyToolsScreen';
import LegalScreen from '../screens/LegalScreen';
import PaymentDetailsScreen from '../screens/PaymentDetailsScreen';
import HelpScreen from '../screens/HelpScreen';
import SettingsScreen from '../screens/SettingsScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const linking = {
    prefixes: ['shareatool://'],
    config: {
        screens: {
            PaymentDetails: 'payment-details',
            Legal: 'legal',
        },
    },
};

function AuthStack() {
    const { theme } = useTheme();

    return (
        <Stack.Navigator
            screenOptions={{
                headerShown: false,
                contentStyle: { backgroundColor: theme.colors.bg },
            }}
        >
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Signup" component={SignupScreen} />
            <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
        </Stack.Navigator>
    );
}

function TabNavigator() {
    return (
        <Tab.Navigator
            tabBar={(props) => <CustomTabBar {...props} />}
            screenOptions={{ headerShown: false }}
        >
            <Tab.Screen name="Explore" component={BrowseToolsScreen} />
            <Tab.Screen name="MyTools" component={MyToolsScreen} />
            <Tab.Screen name="Bookings" component={BookingsScreen} />
            <Tab.Screen name="Map" component={MapScreen} />
            <Tab.Screen name="Profile" component={HomeScreen} />
        </Tab.Navigator>
    );
}

function AppStack() {
    const { theme } = useTheme();

    return (
        <Stack.Navigator
            screenOptions={{
                headerShown: false,
                contentStyle: { backgroundColor: theme.colors.bg },
            }}
        >
            <Stack.Screen name="MainTabs" component={TabNavigator} />
            <Stack.Screen name="ToolDetails" component={ToolDetailsScreen} />
            <Stack.Screen name="PersonalInformation" component={PersonalInformationScreen} />
            <Stack.Screen name="GeneralInfo" component={GeneralInfoScreen} />
            <Stack.Screen name="ContactDetails" component={ContactDetailsScreen} />
            <Stack.Screen name="AccountSecurity" component={AccountSecurityScreen} />
            <Stack.Screen name="Addresses" component={AddressesScreen} />
            <Stack.Screen name="Legal" component={LegalScreen} />
            <Stack.Screen name="Help" component={HelpScreen} />
            <Stack.Screen name="Settings" component={SettingsScreen} />
            <Stack.Screen name="PaymentDetails" component={PaymentDetailsScreen} />
            <Stack.Screen
                name="AddTool"
                component={AddToolScreen}
                options={{
                    presentation: 'modal',
                    animation: 'slide_from_bottom'
                }}
            />
            <Stack.Screen
                name="EditTool"
                component={EditToolScreen}
                options={{
                    presentation: 'modal',
                    animation: 'slide_from_bottom'
                }}
            />
            <Stack.Screen
                name="BookingRequest"
                component={BookingRequestScreen}
                options={{
                    presentation: 'modal',
                    animation: 'slide_from_bottom'
                }}
            />
        </Stack.Navigator>
    );
}

function RootNavigator() {
    const { isAuthenticated, isLoading } = useAuth();
    const { theme } = useTheme();

    if (isLoading) {
        return (
            <View style={[styles.loadingContainer, { backgroundColor: theme.colors.bg }]}>
                <ActivityIndicator size="large" color={theme.colors.accent} />
            </View>
        );
    }

    return isAuthenticated ? <AppStack /> : <AuthStack />;
}

export default function Navigation() {
    const { theme, resolvedTheme } = useTheme();
    const navigationTheme = useMemo(() => ({
        ...NavigationDefaultTheme,
        dark: resolvedTheme === 'dark',
        colors: {
            ...NavigationDefaultTheme.colors,
            primary: theme.colors.accent,
            background: theme.colors.bg,
            card: theme.colors.surface,
            text: theme.colors.textPrimary,
            border: theme.colors.border,
            notification: theme.colors.accent,
        },
    }), [resolvedTheme, theme]);

    return (
        <SafeAreaProvider>
            <NavigationContainer linking={linking} theme={navigationTheme}>
                <AuthProvider>
                    <RootNavigator />
                </AuthProvider>
            </NavigationContainer>
        </SafeAreaProvider>
    );
}

const styles = StyleSheet.create({
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#0a0a0a',
    }
});
