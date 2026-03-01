import React from 'react';
import { View, TextInput } from 'react-native';
import LabelField from './LabelField';
import { fieldStyles } from './styles';

/**
 * InputField — labelled text input with read-only / editing states.
 *
 * @param {string}   label
 * @param {boolean}  isEditing
 * @param {object}   props       — everything else forwarded to TextInput
 */
export default function InputField({ label, isEditing, style, noLabel = false, ...props }) {
    const stateStyle = isEditing ? fieldStyles.editing : fieldStyles.readOnly;
    return (
        <View style={fieldStyles.group}>
            {!noLabel && <LabelField>{label}</LabelField>}
            <TextInput
                style={[fieldStyles.base, stateStyle, style]}
                editable={isEditing}
                color={isEditing ? '#fff' : '#888'}
                placeholderTextColor="#444"
                {...props}
            />
        </View>
    );
}
