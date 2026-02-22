import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    ActivityIndicator,
    Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import api from '../api/client';

const MyToolsScreen = ({ navigation }) => {
    const [tools, setTools] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchMyTools = async () => {
        try {
            const response = await api.get('/tools/mine');
            setTools(response.data);
        } catch (error) {
            console.error('Error fetching my tools:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            fetchMyTools();
        }, [])
    );

    const onRefresh = () => {
        setRefreshing(true);
        fetchMyTools();
    };

    const handleDelete = (id) => {
        Alert.alert(
            'Delete Tool',
            'Are you sure you want to remove this listing?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await api.delete(`/tools/${id}`);
                            fetchMyTools();
                        } catch (error) {
                            Alert.alert('Error', 'Failed to delete tool');
                        }
                    }
                }
            ]
        );
    };

    const renderToolItem = ({ item }) => (
        <View style={styles.card}>
            <View style={styles.cardInfo}>
                <Text style={styles.toolName}>{item.name}</Text>
                <Text style={styles.category}>{item.category?.name}</Text>
                <Text style={styles.price}>€{item.pricePerDay}/day</Text>
            </View>
            <View style={styles.cardActions}>
                <TouchableOpacity
                    style={styles.editButton}
                    onPress={() => navigation.navigate('EditTool', { tool: item })}
                >
                    <Text style={styles.editButtonText}>Edit</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={() => handleDelete(item.id)}
                >
                    <Text style={styles.deleteButtonText}>Delete</Text>
                </TouchableOpacity>
            </View>
        </View>
    );

    if (loading) {
        return (
            <View style={styles.centerContainer}>
                <ActivityIndicator size="large" color="#6366f1" />
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>My Tools</Text>
                <TouchableOpacity
                    style={styles.addButton}
                    onPress={() => navigation.navigate('AddTool')}
                >
                    <Text style={styles.addButtonText}>+</Text>
                </TouchableOpacity>
            </View>
            <FlatList
                data={tools}
                renderItem={renderToolItem}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.listContainer}
                onRefresh={onRefresh}
                refreshing={refreshing}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Text style={styles.emptyText}>You haven't listed any tools yet.</Text>
                        <TouchableOpacity
                            style={styles.emptyButton}
                            onPress={() => navigation.navigate('AddTool')}
                        >
                            <Text style={styles.emptyButtonText}>List a tool now</Text>
                        </TouchableOpacity>
                    </View>
                }
            />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0a0a0a',
    },
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#0a0a0a',
    },
    header: {
        paddingHorizontal: 20,
        paddingTop: 10,
        paddingBottom: 15,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#ffffff',
    },
    addButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#6366f1',
        justifyContent: 'center',
        alignItems: 'center',
    },
    addButtonText: {
        color: '#ffffff',
        fontSize: 24,
        fontWeight: 'bold',
    },
    listContainer: {
        padding: 15,
    },
    card: {
        backgroundColor: '#1a1a1a',
        borderRadius: 12,
        padding: 15,
        marginBottom: 15,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#2a2a2a',
    },
    cardInfo: {
        flex: 1,
    },
    toolName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 4,
    },
    category: {
        fontSize: 12,
        color: '#6366f1',
        marginBottom: 4,
    },
    price: {
        fontSize: 14,
        color: '#aaa',
    },
    cardActions: {
        marginLeft: 10,
        flexDirection: 'row',
        gap: 8,
    },
    editButton: {
        paddingHorizontal: 15,
        paddingVertical: 8,
        borderRadius: 8,
        backgroundColor: 'rgba(99, 102, 241, 0.1)',
    },
    editButtonText: {
        color: '#6366f1',
        fontWeight: '600',
        fontSize: 12,
    },
    deleteButton: {
        paddingHorizontal: 15,
        paddingVertical: 8,
        borderRadius: 8,
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
    },
    deleteButtonText: {
        color: '#ef4444',
        fontWeight: '600',
        fontSize: 12,
    },
    emptyContainer: {
        marginTop: 100,
        alignItems: 'center',
    },
    emptyText: {
        color: '#888',
        fontSize: 16,
        marginBottom: 20,
    },
    emptyButton: {
        backgroundColor: '#6366f1',
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 10,
    },
    emptyButtonText: {
        color: '#ffffff',
        fontWeight: 'bold',
    },
});

export default MyToolsScreen;
