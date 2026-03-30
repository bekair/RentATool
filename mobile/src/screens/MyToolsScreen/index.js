import React, { useState, useCallback } from 'react';
import {
    View,
    Text,
    FlatList,
    TouchableOpacity,
    ActivityIndicator,
    Alert,
    RefreshControl,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import api from '../../api/client';
import ThemedSafeAreaView from '../../components/layout/ThemedSafeAreaView';
import styles from './MyToolsScreen.styles';

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
                    style={styles.detailsButton}
                    onPress={() => navigation.navigate('ToolDetails', { toolId: item.id })}
                >
                    <Text style={styles.detailsButtonText}>Details</Text>
                </TouchableOpacity>
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
        <ThemedSafeAreaView>
            <View style={styles.header}>
                <Text style={styles.title}>My Tools</Text>
                <TouchableOpacity
                    style={styles.addButton}
                    onPress={() => navigation.navigate('AddTool')}
                >
                    <Text style={styles.addButtonText}>+</Text>
                </TouchableOpacity>
            </View>
            {refreshing && (
                <View style={styles.topLoader}>
                    <ActivityIndicator size="small" color="#6366f1" />
                </View>
            )}
            <FlatList
                data={tools}
                renderItem={renderToolItem}
                keyExtractor={(item) => item.id}
                style={styles.list}
                contentContainerStyle={styles.listContainer}
                alwaysBounceVertical={true}
                refreshControl={
                    <RefreshControl
                        refreshing={false}
                        onRefresh={onRefresh}
                        tintColor="#6366f1"
                        colors={['#6366f1']}
                    />
                }
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <View style={styles.emptyIconContainer}>
                            <Ionicons name="hardware-chip-outline" size={48} color="#6366f1" />
                        </View>
                        <Text style={styles.emptyTitle}>Nothing here yet</Text>
                        <Text style={styles.emptyText}>You haven't listed any tools yet.</Text>
                        <View style={styles.swipeDownToRefreshContainer}>
                            <Ionicons name="arrow-down" size={16} color="#6366f1" style={styles.refreshIcon} />
                            <Text style={styles.swipeDownToRefreshText}>Swipe down to refresh</Text>
                        </View>
                    </View>
                }
            />
        </ThemedSafeAreaView>
    );
};

export default MyToolsScreen;
