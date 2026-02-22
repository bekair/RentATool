import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    ActivityIndicator,
    Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';

const BrowseToolsScreen = ({ navigation }) => {
    const { user } = useAuth();
    const [tools, setTools] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchTools = async () => {
        try {
            const params = user?.id ? `?exclude=${user.id}` : '';
            const response = await api.get(`/tools${params}`);
            setTools(response.data);
        } catch (error) {
            console.error('Error fetching tools:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            fetchTools();
        }, [])
    );

    const onRefresh = () => {
        setRefreshing(true);
        fetchTools();
    };

    const renderToolItem = ({ item }) => (
        <TouchableOpacity
            style={styles.card}
            activeOpacity={0.8}
            onPress={() => {
                navigation.navigate('ToolDetails', { toolId: item.id });
            }}
        >
            <View style={styles.imagePlaceholder}>
                <Text style={styles.imagePlaceholderText}>No Image</Text>
            </View>
            <View style={styles.cardContent}>
                <View style={styles.cardHeader}>
                    <Text style={styles.toolName}>{item.name}</Text>
                    <Text style={styles.price}>€{item.pricePerDay}<Text style={styles.perDay}>/day</Text></Text>
                </View>
                <Text style={styles.category}>{item.category?.name}</Text>
                <Text style={styles.description} numberOfLines={2}>
                    {item.description}
                </Text>
                <View style={styles.cardFooter}>
                    <Text style={styles.ownerText}>By {item.owner.displayName}</Text>
                    {item.owner.verificationTier !== 'UNVERIFIED' && (
                        <View style={styles.verifiedBadge}>
                            <Text style={styles.verifiedText}>Verified</Text>
                        </View>
                    )}
                </View>
            </View>
        </TouchableOpacity>
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
                <Text style={styles.title}>Explore Tools</Text>
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
                        <Text style={styles.emptyText}>No tools available yet.</Text>
                        <TouchableOpacity
                            style={styles.emptyButton}
                            onPress={() => navigation.navigate('AddTool')}
                        >
                            <Text style={styles.emptyButtonText}>List your first tool</Text>
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
        paddingTop: 15,
        paddingBottom: 20,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: 'rgba(10, 10, 10, 0.8)',
    },
    title: {
        fontSize: 32,
        fontWeight: '800',
        color: '#ffffff',
        letterSpacing: -0.5,
    },
    addButton: {
        width: 44,
        height: 44,
        borderRadius: 12,
        backgroundColor: '#6366f1',
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 4,
        shadowColor: '#6366f1',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
    },
    addButtonText: {
        color: '#ffffff',
        fontSize: 28,
        fontWeight: 'bold',
        marginTop: -2,
    },
    listContainer: {
        padding: 15,
        paddingBottom: 100, // Account for floating tab bar
    },
    card: {
        backgroundColor: '#1a1a1a',
        borderRadius: 20,
        marginBottom: 20,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: '#2a2a2a',
        elevation: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.4,
        shadowRadius: 15,
    },
    imagePlaceholder: {
        height: 200,
        backgroundColor: '#2a2a2a',
        justifyContent: 'center',
        alignItems: 'center',
    },
    imagePlaceholderText: {
        color: '#555',
        fontSize: 16,
        fontWeight: '600',
    },
    cardContent: {
        padding: 18,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 6,
    },
    toolName: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#ffffff',
        flex: 1,
        marginRight: 10,
    },
    price: {
        fontSize: 20,
        fontWeight: '800',
        color: '#818cf8',
    },
    perDay: {
        fontSize: 12,
        color: '#666',
        fontWeight: 'normal',
    },
    category: {
        fontSize: 13,
        color: '#6366f1',
        marginBottom: 10,
        fontWeight: '700',
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    description: {
        fontSize: 14,
        color: '#999',
        marginBottom: 16,
        lineHeight: 22,
    },
    cardFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderTopWidth: 1,
        borderTopColor: '#262626',
        paddingTop: 15,
    },
    ownerText: {
        fontSize: 12,
        color: '#666',
        fontWeight: '500',
    },
    verifiedBadge: {
        backgroundColor: 'rgba(34, 197, 94, 0.15)',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 6,
        borderWidth: 1,
        borderColor: 'rgba(34, 197, 94, 0.2)',
    },
    verifiedText: {
        color: '#4ade80',
        fontSize: 11,
        fontWeight: '700',
    },
    emptyContainer: {
        marginTop: 100,
        alignItems: 'center',
        paddingHorizontal: 40,
    },
    emptyText: {
        color: '#666',
        fontSize: 18,
        textAlign: 'center',
        marginBottom: 25,
        lineHeight: 26,
    },
    emptyButton: {
        backgroundColor: '#6366f1',
        paddingHorizontal: 25,
        paddingVertical: 14,
        borderRadius: 12,
        elevation: 4,
        shadowColor: '#6366f1',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
    },
    emptyButtonText: {
        color: '#ffffff',
        fontWeight: '700',
        fontSize: 16,
    },
});

export default BrowseToolsScreen;
