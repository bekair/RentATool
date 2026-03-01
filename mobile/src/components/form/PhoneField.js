import React from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import LabelField from './LabelField';
import { FIELD_HEIGHT, fieldStyles } from './styles';

/**
 * PhoneField — labelled row with a country-code picker + phone number input.
 *
 * @param {string}   label
 * @param {boolean}  isEditing
 * @param {object}   countryCode      — { code: '+1', label: 'US' }
 * @param {function} onCountryPress   — opens the country picker
 * @param {string}   phone
 * @param {function} onPhoneChange
 */
export default function PhoneField({ label, isEditing, countryCode, onCountryPress, phone, onPhoneChange }) {
    const stateStyle = isEditing ? fieldStyles.editing : fieldStyles.readOnly;
    const textColor = isEditing ? '#fff' : '#888';

    return (
        <View style={fieldStyles.group}>
            <LabelField>{label}</LabelField>
            <View style={s.row}>
                {/* Country code button */}
                <TouchableOpacity
                    style={[s.countryCode, stateStyle]}
                    onPress={() => isEditing && onCountryPress?.()}
                    activeOpacity={isEditing ? 0.7 : 1}
                >
                    <Text style={[s.codeText, { color: textColor }]}>{countryCode?.code}</Text>
                    {isEditing && (
                        <Ionicons name="chevron-down" size={18} color="rgba(255,255,255,0.5)" />
                    )}
                </TouchableOpacity>

                {/* Phone number input */}
                <TextInput
                    style={[s.phoneInput, stateStyle]}
                    value={phone}
                    onChangeText={onPhoneChange}
                    placeholder="000 000 0000"
                    placeholderTextColor="#444"
                    keyboardType="phone-pad"
                    editable={isEditing}
                    color={textColor}
                />
            </View>
        </View>
    );
}

const s = StyleSheet.create({
    row: {
        flexDirection: 'row',
        gap: 10,
    },
    countryCode: {
        height: FIELD_HEIGHT,
        borderRadius: 10,
        borderWidth: 1,
        paddingHorizontal: 14,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        minWidth: 90,
    },
    codeText: {
        fontSize: 16,
    },
    phoneInput: {
        flex: 1,
        height: FIELD_HEIGHT,
        borderRadius: 10,
        borderWidth: 1,
        paddingHorizontal: 16,
        fontSize: 16,
    },
});
