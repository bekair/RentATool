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
 * @param {node}     leftIcon     — optional element rendered to the left of the value
 */
export default function DropdownField({
    label,
    isEditing,
    value,
    placeholder = 'Select',
    onPress,
    leftIcon,
    error,
}) {
    const stateStyle = isEditing ? fieldStyles.editing : fieldStyles.readOnly;
    const errorStyle = error ? fieldStyles.error : null;
    const textColor = value ? (isEditing ? '#fff' : '#888') : '#444';

    return (
        <View style={fieldStyles.group}>
            <LabelField>{label}</LabelField>
            <TouchableOpacity
                style={[fieldStyles.base, stateStyle, errorStyle, s.row]}
                onPress={() => isEditing && onPress?.()}
                activeOpacity={isEditing ? 0.7 : 1}
            >
                {leftIcon && <View style={s.iconWrap}>{leftIcon}</View>}
                <Text style={[s.valueText, { color: textColor, flex: 1 }]}>
                    {value || placeholder}
                </Text>
                {isEditing && (
                    <Ionicons name="chevron-down" size={20} color="rgba(255,255,255,0.5)" />
                )}
            </TouchableOpacity>
            {typeof error === 'string' && error.length > 0 ? (
                <Text style={fieldStyles.errorText}>{error}</Text>
            ) : null}
        </View>
    );
}

const s = StyleSheet.create({
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    iconWrap: {
        marginRight: 10,
    },
    valueText: {
        fontSize: 16,
    },
});
