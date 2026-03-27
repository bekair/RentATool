import React, { useState } from 'react';
import {
    View,
    Text,
    Modal,
    TouchableOpacity,
    FlatList,
    StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import DropdownField from './DropdownField';
import { TOOL_CONDITION_OPTIONS, getToolConditionLabel } from '../../constants/toolConditions';

export default function ToolConditionField({
    label = 'Condition',
    isEditing,
    value,
    onSelect,
    error,
}) {
    const [visible, setVisible] = useState(false);

    const handleSelect = (optionValue) => {
        onSelect(optionValue);
        setVisible(false);
    };

    return (
        <>
            <DropdownField
                label={label}
                isEditing={isEditing}
                value={getToolConditionLabel(value)}
                placeholder="Select condition..."
                onPress={() => isEditing && setVisible(true)}
                error={error}
            />

            <Modal visible={visible} transparent animationType="slide">
                <TouchableOpacity style={s.overlay} activeOpacity={1} onPress={() => setVisible(false)}>
                    <TouchableOpacity activeOpacity={1} style={s.sheet}>
                        <View style={s.handle} />
                        <Text style={s.title}>Select condition</Text>
                        <FlatList
                            data={TOOL_CONDITION_OPTIONS}
                            keyExtractor={(item) => item.value}
                            renderItem={({ item }) => {
                                const isSelected = item.value === value;
                                return (
                                    <TouchableOpacity style={s.option} onPress={() => handleSelect(item.value)}>
                                        <Text style={[s.optionText, isSelected && s.optionTextActive]}>
                                            {item.label}
                                        </Text>
                                        {isSelected ? <Ionicons name="checkmark" size={18} color="#6366f1" /> : null}
                                    </TouchableOpacity>
                                );
                            }}
                        />
                    </TouchableOpacity>
                </TouchableOpacity>
            </Modal>
        </>
    );
}

const s = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.6)',
        justifyContent: 'flex-end',
    },
    sheet: {
        backgroundColor: '#1a1a1a',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        paddingTop: 12,
        paddingBottom: 40,
        paddingHorizontal: 20,
        maxHeight: '70%',
    },
    handle: {
        width: 40,
        height: 4,
        backgroundColor: '#444',
        borderRadius: 2,
        alignSelf: 'center',
        marginBottom: 16,
    },
    title: {
        fontSize: 16,
        fontWeight: '700',
        color: '#fff',
        marginBottom: 12,
    },
    option: {
        paddingVertical: 14,
        borderBottomWidth: 1,
        borderBottomColor: '#262626',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    optionText: {
        fontSize: 16,
        color: '#ddd',
    },
    optionTextActive: {
        color: '#6366f1',
        fontWeight: '600',
    },
});
