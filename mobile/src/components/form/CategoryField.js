import React, { useMemo, useState } from 'react';
import {
    View,
    Text,
    Modal,
    TouchableOpacity,
    ScrollView,
    StyleSheet,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import DropdownField from './DropdownField';
import { useCategories } from '../../hooks/useCategories';
import { useTheme } from '../../theme';

/**
 * CategoryField - a DropdownField that opens a full-screen category grid picker.
 * Uses useCategories internally (cached, ETag-validated).
 *
 * @param {string}   label     - field label (default "Category")
 * @param {boolean}  isEditing
 * @param {object}   value     - selected category object { id, name, icon } or null
 * @param {function} onSelect  - called with the chosen category object
 */
export default function CategoryField({
    label = 'Category',
    isEditing,
    value,
    onSelect,
    error,
}) {
    const { theme } = useTheme();
    const styles = useMemo(() => createStyles(theme), [theme]);
    const { categories } = useCategories();
    const [visible, setVisible] = useState(false);
    const insets = useSafeAreaInsets();

    const handleSelect = (category) => {
        onSelect(category);
        setVisible(false);
    };

    return (
        <>
            <DropdownField
                label={label}
                isEditing={isEditing}
                value={value?.name}
                placeholder="Select a category..."
                onPress={() => isEditing && setVisible(true)}
                error={error}
                leftIcon={
                    value?.icon
                        ? <MaterialCommunityIcons name={value.icon} size={20} color={theme.colors.accent} />
                        : null
                }
            />

            <Modal visible={visible} animationType="slide" statusBarTranslucent>
                <View style={styles.container}>
                    <View style={[styles.topBar, { paddingTop: insets.top + 12 }]}>
                        <Text style={styles.title}>Select a Category</Text>
                        <Text style={styles.subtitle}>Choose the type that best fits your tool</Text>
                    </View>

                    <ScrollView
                        contentContainerStyle={styles.grid}
                        showsVerticalScrollIndicator={false}
                    >
                        {categories.map((category) => {
                            const isActive = value?.id === category.id;
                            return (
                                <TouchableOpacity
                                    key={category.id}
                                    style={[styles.gridItem, isActive && styles.gridItemActive]}
                                    onPress={() => handleSelect(category)}
                                >
                                    <MaterialCommunityIcons
                                        name={category.icon}
                                        size={32}
                                        color={isActive ? theme.colors.accent : theme.colors.textMuted}
                                    />
                                    <Text style={[styles.gridLabel, isActive && styles.gridLabelActive]}>
                                        {category.name}
                                    </Text>
                                </TouchableOpacity>
                            );
                        })}
                    </ScrollView>

                    <View style={[styles.bottomBar, { paddingBottom: insets.bottom || 16 }]}>
                        <View style={styles.actions}>
                            <TouchableOpacity
                                style={styles.cancelBtn}
                                onPress={() => setVisible(false)}
                            >
                                <Text style={styles.cancelText}>Cancel</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </>
    );
}

const createStyles = (theme) =>
    StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: theme.colors.bg,
        },
        topBar: {
            backgroundColor: theme.colors.bg,
            borderBottomWidth: 1,
            borderBottomColor: theme.colors.rowDivider,
            paddingHorizontal: 20,
            paddingBottom: 14,
            alignItems: 'center',
        },
        title: {
            fontSize: 16,
            fontWeight: '700',
            color: theme.colors.textPrimary,
        },
        subtitle: {
            fontSize: 12,
            color: theme.colors.textMuted,
            marginTop: 3,
        },
        grid: {
            flexDirection: 'row',
            flexWrap: 'wrap',
            padding: 16,
            gap: 12,
        },
        gridItem: {
            width: '30%',
            aspectRatio: 1,
            backgroundColor: theme.colors.surfaceMuted,
            borderRadius: 14,
            borderWidth: 1,
            borderColor: theme.colors.border,
            justifyContent: 'center',
            alignItems: 'center',
            gap: 8,
            padding: 8,
        },
        gridItemActive: {
            borderColor: theme.colors.accent,
            backgroundColor: theme.colors.accentSurfaceStrong,
        },
        gridLabel: {
            fontSize: 11,
            color: theme.colors.textMuted,
            textAlign: 'center',
        },
        gridLabelActive: {
            color: theme.colors.accent,
            fontWeight: '600',
        },
        bottomBar: {
            backgroundColor: theme.colors.bg,
            borderTopWidth: 1,
            borderTopColor: theme.colors.rowDivider,
        },
        actions: {
            flexDirection: 'row',
            paddingHorizontal: 20,
            paddingVertical: 16,
        },
        cancelBtn: {
            flex: 1,
            borderRadius: 12,
            paddingVertical: 16,
            alignItems: 'center',
            backgroundColor: theme.colors.surfaceMuted,
            borderWidth: 1,
            borderColor: theme.colors.border,
        },
        cancelText: {
            fontSize: 15,
            fontWeight: '600',
            color: theme.colors.textMuted,
        },
    });
