import React, { useState } from 'react';
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

/**
 * CategoryField — a DropdownField that opens a full-screen category grid picker.
 * Uses useCategories internally (cached, ETag-validated).
 *
 * @param {string}   label     — field label (default "Category")
 * @param {boolean}  isEditing
 * @param {object}   value     — selected category object { id, name, icon } or null
 * @param {function} onSelect  — called with the chosen category object
 */
export default function CategoryField({
    label = 'Category',
    isEditing,
    value,
    onSelect,
    error,
}) {
    const { categories } = useCategories();
    const [visible, setVisible] = useState(false);
    const insets = useSafeAreaInsets();

    const handleSelect = (cat) => {
        onSelect(cat);
        setVisible(false);
    };

    return (
        <>
            <DropdownField
                label={label}
                isEditing={isEditing}
                value={value?.name}
                placeholder="Select a category…"
                onPress={() => isEditing && setVisible(true)}
                error={error}
                leftIcon={
                    value?.icon
                        ? <MaterialCommunityIcons name={value.icon} size={20} color="#6366f1" />
                        : null
                }
            />

            <Modal visible={visible} animationType="slide" statusBarTranslucent>
                <View style={s.container}>
                    {/* Header */}
                    <View style={[s.topBar, { paddingTop: insets.top + 12 }]}>
                        <Text style={s.title}>Select a Category</Text>
                        <Text style={s.subtitle}>Choose the type that best fits your tool</Text>
                    </View>

                    {/* Grid */}
                    <ScrollView
                        contentContainerStyle={s.grid}
                        showsVerticalScrollIndicator={false}
                    >
                        {categories.map((cat) => {
                            const isActive = value?.id === cat.id;
                            return (
                                <TouchableOpacity
                                    key={cat.id}
                                    style={[s.gridItem, isActive && s.gridItemActive]}
                                    onPress={() => handleSelect(cat)}
                                >
                                    <MaterialCommunityIcons
                                        name={cat.icon}
                                        size={32}
                                        color={isActive ? '#6366f1' : '#aaa'}
                                    />
                                    <Text style={[s.gridLabel, isActive && s.gridLabelActive]}>
                                        {cat.name}
                                    </Text>
                                </TouchableOpacity>
                            );
                        })}
                    </ScrollView>

                    {/* Footer */}
                    <View style={[s.bottomBar, { paddingBottom: insets.bottom || 16 }]}>
                        <View style={s.actions}>
                            <TouchableOpacity
                                style={s.cancelBtn}
                                onPress={() => setVisible(false)}
                            >
                                <Text style={s.cancelText}>Cancel</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </>
    );
}

const s = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0a0a0a',
    },
    topBar: {
        backgroundColor: '#0a0a0a',
        borderBottomWidth: 1,
        borderBottomColor: '#2a2a2a',
        paddingHorizontal: 20,
        paddingBottom: 14,
        alignItems: 'center',
    },
    title: {
        fontSize: 16,
        fontWeight: '700',
        color: '#fff',
    },
    subtitle: {
        fontSize: 12,
        color: '#666',
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
        backgroundColor: '#1a1a1a',
        borderRadius: 14,
        borderWidth: 1,
        borderColor: '#2a2a2a',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 8,
        padding: 8,
    },
    gridItemActive: {
        borderColor: '#6366f1',
        backgroundColor: '#1e1b4b',
    },
    gridLabel: {
        fontSize: 11,
        color: '#aaa',
        textAlign: 'center',
    },
    gridLabelActive: {
        color: '#818cf8',
        fontWeight: '600',
    },
    bottomBar: {
        backgroundColor: '#0a0a0a',
        borderTopWidth: 1,
        borderTopColor: '#2a2a2a',
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
        backgroundColor: '#1a1a1a',
        borderWidth: 1,
        borderColor: '#2a2a2a',
    },
    cancelText: {
        fontSize: 15,
        fontWeight: '600',
        color: '#aaa',
    },
});
