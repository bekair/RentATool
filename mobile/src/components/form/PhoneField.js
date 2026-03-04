import React, { useState } from 'react'; // useState kept for showPicker only
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import LabelField from './LabelField';
import CountryPickerModal from './CountryPickerModal';
import { FIELD_HEIGHT, fieldStyles } from './styles';

/**
 * PhoneField — labelled row with a country-code picker + phone number input.
 *
 * @param {string}   label
 * @param {boolean}  isEditing
 * @param {string}   phoneCode        — controlled dial code string, e.g. "+32" (owned by parent)
 * @param {function} onCountrySelect  — called with the full country object when the user picks one
 * @param {string}   phone
 * @param {function} onPhoneChange
 */
export default function PhoneField({ label, isEditing, phoneCode, onCountrySelect, phone, onPhoneChange, error }) {
    const stateStyle = isEditing ? fieldStyles.editing : fieldStyles.readOnly;
    const textColor = isEditing ? '#fff' : '#888';
    const errorStyle = error ? fieldStyles.error : null;
    const [showPicker, setShowPicker] = useState(false);

    return (
        <View style={fieldStyles.group}>
            <LabelField>{label}</LabelField>
            <View style={s.row}>
                {/* Country code button */}
                <TouchableOpacity
                    style={[s.countryCode, stateStyle, errorStyle]}
                    onPress={() => isEditing && setShowPicker(true)}
                    activeOpacity={isEditing ? 0.7 : 1}
                >
                    <Text style={[s.codeText, { color: phoneCode ? textColor : '#444' }]}>
                        {phoneCode || 'Code'}
                    </Text>
                    {isEditing && (
                        <Ionicons name="chevron-down" size={16} color="rgba(255,255,255,0.3)" />
                    )}
                </TouchableOpacity>

                {/* Phone number input */}
                <TextInput
                    style={[s.phoneInput, stateStyle, errorStyle]}
                    value={phone}
                    onChangeText={onPhoneChange}
                    placeholder="543 210 4585"
                    placeholderTextColor="#444"
                    keyboardType="phone-pad"
                    editable={isEditing}
                    color={textColor}
                />
            </View>
            {typeof error === 'string' && error.length > 0 && (
                <Text style={fieldStyles.errorText}>{error}</Text>
            )}

            <CountryPickerModal
                visible={showPicker}
                title="Select Country Code"
                selectedValue={phoneCode}
                renderOption={(item, isSelected, onSelect) => (
                    <TouchableOpacity key={item.code} style={s.pickerOption} onPress={onSelect}>
                        <Text style={{ fontSize: 20 }}>{item.flag}</Text>
                        <Text style={[s.pickerOptionText, { flex: 1, marginLeft: 12 }, isSelected && { color: '#6366f1', fontWeight: '600' }]}>
                            {item.name}
                        </Text>
                        <Text style={[s.pickerOptionText, { color: '#888' }, isSelected && { color: '#6366f1' }]}>
                            {item.countryCode}
                        </Text>
                        {isSelected && <Ionicons name="checkmark" size={18} color="#6366f1" style={{ marginLeft: 10 }} />}
                    </TouchableOpacity>
                )}
                onSelect={(c) => { onCountrySelect?.(c); setShowPicker(false); }}
                onClose={() => setShowPicker(false)}
            />
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
    pickerOption: {
        paddingVertical: 14,
        borderBottomWidth: 1,
        borderBottomColor: '#262626',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    pickerOptionText: {
        fontSize: 16,
        color: '#ddd',
    },
});
