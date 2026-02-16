import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { ActivityIndicator, View, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { AuthProvider, useAuth } from '../context/AuthContext';
import LoginScreen from '../screens/LoginScreen';
import SignupScreen from '../screens/SignupScreen';
import HomeScreen from '../screens/HomeScreen';
import BrowseToolsScreen from '../screens/BrowseToolsScreen';
import MyToolsScreen from '../screens/MyToolsScreen';
import MapScreen from '../screens/MapScreen';
import AddToolScreen from '../screens/AddToolScreen';
import ToolDetailsScreen from '../screens/ToolDetailsScreen';
import BookingsScreen from '../screens/BookingsScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function AuthStack() {
    return (
        <Stack.Navigator
            screenOptions={{
                headerShown: false,
                contentStyle: { backgroundColor: '#0a0a0a' },
            }}
        >
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Signup" component={SignupScreen} />
        </Stack.Navigator>
    );
}

const CustomTabBarButton = ({ children, onPress }) => (
    <TouchableOpacity
        style={{
            top: -20,
            justifyContent: 'center',
            alignItems: 'center',
            ...styles.shadow,
        }}
        onPress={onPress}
    >
        <View
            style={{
                width: 60,
                height: 60,
                borderRadius: 30,
                backgroundColor: '#6366f1',
                justifyContent: 'center',
                alignItems: 'center',
                borderWidth: 4,
                borderColor: '#0a0a0a',
            }}
        >
            <Ionicons name="add" color="#fff" size={32} />
        </View>
    </TouchableOpacity>
);

function TabNavigator({ navigation }) {
    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                headerShown: false,
                tabBarIcon: ({ focused, color, size }) => {
                    let iconName;

                    if (route.name === 'Explore') {
                        iconName = focused ? 'search' : 'search-outline';
                    } else if (route.name === 'My Tools') {
                        iconName = focused ? 'construct' : 'construct-outline';
                    } else if (route.name === 'Bookings') {
                        iconName = focused ? 'calendar' : 'calendar-outline';
                    } else if (route.name === 'Profile') {
                        iconName = focused ? 'person' : 'person-outline';
                    } else if (route.name === 'Map') {
                        iconName = focused ? 'map' : 'map-outline';
                    }

                    return <Ionicons name={iconName} size={24} color={color} />;
                },
                tabBarStyle: {
                    backgroundColor: 'rgba(26, 26, 26, 0.95)',
                    borderTopColor: 'transparent',
                    position: 'absolute',
                    bottom: 25,
                    left: 15,
                    right: 15,
                    borderRadius: 30,
                    height: 65,
                    paddingBottom: 10,
                    paddingTop: 10,
                    elevation: 5,
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 10 },
                    shadowOpacity: 0.3,
                    shadowRadius: 10,
                    borderWidth: 1,
                    borderColor: 'rgba(255, 255, 255, 0.1)',
                },
                tabBarActiveTintColor: '#6366f1',
                tabBarInactiveTintColor: '#888',
                tabBarLabelStyle: {
                    fontSize: 10,
                    fontWeight: '700',
                    marginTop: -5,
                },
            })}
        >
            <Tab.Screen name="Explore" component={BrowseToolsScreen} />
            <Tab.Screen name="My Tools" component={MyToolsScreen} />
            <Tab.Screen
                name="AddToolAction"
                component={View}
                options={{
                    tabBarButton: (props) => (
                        <CustomTabBarButton
                            {...props}
                            onPress={() => navigation.navigate('AddTool')}
                        />
                    ),
                    tabBarLabel: () => null,
                }}
            />
            <Tab.Screen name="Bookings" component={BookingsScreen} />
            <Tab.Screen name="Map" component={MapScreen} />
            <Tab.Screen name="Profile" component={HomeScreen} />
        </Tab.Navigator>
    );
}

function AppStack() {
    return (
        <Stack.Navigator
            screenOptions={{
                headerShown: false,
                contentStyle: { backgroundColor: '#0a0a0a' },
            }}
        >
            <Stack.Screen name="MainTabs" component={TabNavigator} />
            <Stack.Screen name="ToolDetails" component={ToolDetailsScreen} />
            <Stack.Screen
                name="AddTool"
                component={AddToolScreen}
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

    if (isLoading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#6366f1" />
            </View>
        );
    }

    return isAuthenticated ? <AppStack /> : <AuthStack />;
}

export default function Navigation() {
    return (
        <NavigationContainer>
            <AuthProvider>
                <RootNavigator />
            </AuthProvider>
        </NavigationContainer>
    );
}

const styles = StyleSheet.create({
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#0a0a0a',
    },
    shadow: {
        shadowColor: '#6366f1',
        shadowOffset: {
            width: 0,
            height: 10,
        },
        shadowOpacity: 0.25,
        shadowRadius: 10,
        elevation: 5,
    }
});
