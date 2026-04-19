import React, { useState, useCallback, useMemo } from 'react';
import {
    View,
    Text,
    FlatList,
    TouchableOpacity,
    ActivityIndicator,
    RefreshControl,
} from 'react-native';
import ThemedSafeAreaView from '../../components/layout/ThemedSafeAreaView';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import api from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { isVerifiedTier } from '../../constants/verificationTier';
import { useTheme } from '../../theme';
import createStyles from './BrowseToolsScreen.styles';

const BrowseToolsScreen = ({ navigation }) => {
    const { user } = useAuth();
    const { theme } = useTheme();
    const styles = useMemo(() => createStyles(theme), [theme]);
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
                    {isVerifiedTier(item.owner.verificationTier) && (
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
                <ActivityIndicator size="large" color={theme.colors.accent} />
            </View>
        );
    }

    return (
        <ThemedSafeAreaView>
            <View style={styles.header}>
                <Text style={styles.title}>Explore Tools</Text>
            </View>
            {refreshing && (
                <View style={styles.topLoader}>
                    <ActivityIndicator size="small" color={theme.colors.accent} />
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
                        tintColor={theme.colors.accent}
                        colors={[theme.colors.accent]}
                    />
                }
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <View style={styles.emptyIconContainer}>
                            <Ionicons name="search-outline" size={48} color={theme.colors.accent} />
                        </View>
                        <Text style={styles.emptyTitle}>Nothing to see here</Text>
                        <Text style={styles.emptyText}>
                            It looks like no one has listed any tools in your area yet. Check back soon for new listings!
                        </Text>
                        <View style={styles.swipeDownToRefreshContainer}>
                            <Ionicons
                                name="arrow-down"
                                size={16}
                                color={theme.colors.accent}
                                style={styles.swipeDownToRefreshIcon}
                            />
                            <Text style={styles.swipeDownToRefreshText}>Swipe down to refresh</Text>
                        </View>
                    </View>
                }
            />
        </ThemedSafeAreaView>
    );
};

export default BrowseToolsScreen;
