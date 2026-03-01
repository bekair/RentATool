import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import LabelField from './LabelField';
import { fieldStyles } from './styles';

/**
 * DropdownField — labelled touchable that opens a picker/modal.
 *
 * @param {string}   label
 * @param {boolean}  isEditing
 * @param {string}   value        — currently selected value
 * @param {string}   placeholder  — shown when no value is selected
 * @param {function} onPress      — called when the field is tapped in edit mode
 */
export default function DropdownField({ label, isEditing, value, placeholder = 'Select', onPress }) {
    const stateStyle = isEditing ? fieldStyles.editing : fieldStyles.readOnly;
    const textColor = value ? (isEditing ? '#fff' : '#888') : '#444';

    return (
        <View style={fieldStyles.group}>
            <LabelField>{label}</LabelField>
            <TouchableOpacity
                style={[fieldStyles.base, stateStyle, s.row]}
                onPress={() => isEditing && onPress?.()}
                activeOpacity={isEditing ? 0.7 : 1}
            >
                <Text style={[s.valueText, { color: textColor }]}>
                    {value || placeholder}
                </Text>
                {isEditing && (
                    <Ionicons name="chevron-down" size={20} color="rgba(255,255,255,0.5)" />
                )}
            </TouchableOpacity>
        </View>
    );
}

const s = StyleSheet.create({
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    valueText: {
        fontSize: 16,
    },
});
