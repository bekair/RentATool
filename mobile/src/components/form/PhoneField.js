import React, { useMemo, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import LabelField from './LabelField';
import CountryPickerModal from './CountryPickerModal';
import { useTheme } from '../../theme';
import { FIELD_HEIGHT, getFieldStyles } from './styles';

/**
 * PhoneField - labelled row with a country-code picker + phone number input.
 *
 * @param {string}   label
 * @param {boolean}  isEditing
 * @param {string}   phoneCode        - controlled dial code string, e.g. "+32" (owned by parent)
 * @param {function} onCountrySelect  - called with the full country object when the user picks one
 * @param {string}   phone
 * @param {function} onPhoneChange
 */
export default function PhoneField({ label, isEditing, phoneCode, onCountrySelect, phone, onPhoneChange, error }) {
    const { theme } = useTheme();
    const styles = useMemo(() => createStyles(theme), [theme]);
    const fieldStyles = useMemo(() => getFieldStyles(theme), [theme]);
    const stateStyle = isEditing ? fieldStyles.editing : fieldStyles.readOnly;
    const textColor = isEditing ? theme.colors.fieldEditingText : theme.colors.fieldReadOnlyText;
    const errorStyle = error ? fieldStyles.error : null;
    const [showPicker, setShowPicker] = useState(false);

    return (
        <View style={fieldStyles.group}>
            <LabelField>{label}</LabelField>
            <View style={styles.row}>
                <TouchableOpacity
                    style={[styles.countryCode, stateStyle, errorStyle]}
                    onPress={() => isEditing && setShowPicker(true)}
                    activeOpacity={isEditing ? 0.7 : 1}
                >
                    <Text style={[styles.codeText, { color: phoneCode ? textColor : theme.colors.fieldPlaceholder }]}>
                        {phoneCode || 'Code'}
                    </Text>
                    {isEditing && (
                        <Ionicons name="chevron-down" size={16} color={theme.colors.iconMuted} />
                    )}
                </TouchableOpacity>

                <TextInput
                    style={[styles.phoneInput, stateStyle, errorStyle]}
                    value={phone}
                    onChangeText={onPhoneChange}
                    placeholder="543 210 4585"
                    placeholderTextColor={theme.colors.fieldPlaceholder}
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
                    <TouchableOpacity key={item.code} style={styles.pickerOption} onPress={onSelect}>
                        <Text style={styles.optionFlag}>{item.flag}</Text>
                        <Text
                            style={[
                                styles.pickerOptionText,
                                styles.pickerOptionName,
                                isSelected && styles.pickerOptionTextActive,
                            ]}
                        >
                            {item.name}
                        </Text>
                        <Text
                            style={[
                                styles.pickerOptionText,
                                styles.pickerOptionCode,
                                isSelected && styles.pickerOptionTextActive,
                            ]}
                        >
                            {item.countryCode}
                        </Text>
                        {isSelected && (
                            <Ionicons name="checkmark" size={18} color={theme.colors.accent} style={styles.checkmark} />
                        )}
                    </TouchableOpacity>
                )}
                onSelect={(country) => {
                    onCountrySelect?.(country);
                    setShowPicker(false);
                }}
                onClose={() => setShowPicker(false)}
            />
        </View>
    );
}

const createStyles = (theme) =>
    StyleSheet.create({
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
            borderBottomColor: theme.colors.rowDivider,
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
        },
        optionFlag: {
            fontSize: 20,
        },
        pickerOptionText: {
            fontSize: 16,
            color: theme.colors.textSecondary,
        },
        pickerOptionName: {
            flex: 1,
            marginLeft: 12,
        },
        pickerOptionCode: {
            color: theme.colors.textMuted,
        },
        pickerOptionTextActive: {
            color: theme.colors.accent,
            fontWeight: '600',
        },
        checkmark: {
            marginLeft: 10,
        },
    });
