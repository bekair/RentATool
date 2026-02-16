import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Dimensions, ActivityIndicator, Text } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';

const MapScreen = ({ navigation }) => {
    const [location, setLocation] = useState(null);
    const [errorMsg, setErrorMsg] = useState(null);
    const [loading, setLoading] = useState(true);

    // Mock tools data (until backend is ready with geo-coordinates)
    const [tools, setTools] = useState([
        { id: 1, title: 'Power Drill', latitude: 50.8503, longitude: 4.3517, price: 15 },
        { id: 2, title: 'Ladder', latitude: 50.8466, longitude: 4.3528, price: 10 },
        { id: 3, title: 'Lawn Mower', latitude: 50.8530, longitude: 4.3600, price: 25 },
    ]);

    useEffect(() => {
        (async () => {
            let { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                setErrorMsg('Permission to access location was denied');
                setLoading(false);
                return;
            }

            let location = await Location.getCurrentPositionAsync({});
            setLocation(location);
            setLoading(false);
        })();
    }, []);

    if (loading) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" color="#6366f1" />
                <Text style={styles.loadingText}>Locating you...</Text>
            </View>
        );
    }

    if (errorMsg) {
        return (
            <View style={styles.center}>
                <Text style={styles.errorText}>{errorMsg}</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <MapView
                style={styles.map}
                initialRegion={{
                    latitude: location ? location.coords.latitude : 50.8503,
                    longitude: location ? location.coords.longitude : 4.3517,
                    latitudeDelta: 0.0922,
                    longitudeDelta: 0.0421,
                }}
                showsUserLocation={true}
            >
                {tools.map((tool) => (
                    <Marker
                        key={tool.id}
                        coordinate={{ latitude: tool.latitude, longitude: tool.longitude }}
                        title={tool.title}
                        description={`€${tool.price}/day`}
                        pinColor="#6366f1"
                    />
                ))}
            </MapView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    map: {
        width: Dimensions.get('window').width,
        height: Dimensions.get('window').height,
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        marginTop: 10,
        color: '#666',
    },
    errorText: {
        color: 'red',
        fontSize: 16,
    },
});

export default MapScreen;
