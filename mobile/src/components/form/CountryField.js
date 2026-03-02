import React, { useState } from 'react';
import {
    View,
    Text,
    Modal,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import DropdownField from './DropdownField';

const COUNTRIES = [
    'Belgium', 'China', 'France', 'Germany', 'India',
    'Nepal', 'Netherlands', 'Turkey', 'United Kingdom', 'United States',
];

/**
 * CountryField — a DropdownField that opens a bottom-sheet country picker.
 *
 * @param {string}   label       — field label (default "Country")
 * @param {boolean}  isEditing
 * @param {string}   value       — currently selected country name
 * @param {function} onSelect    — called with the chosen country string
 */
export default function CountryField({
    label = 'Country',
    isEditing,
    value,
    onSelect,
}) {
    const [visible, setVisible] = useState(false);

    const handleSelect = (country) => {
        onSelect(country);
        setVisible(false);
    };

    return (
        <>
            <DropdownField
                label={label}
                isEditing={isEditing}
                value={value}
                placeholder="Select country"
                onPress={() => isEditing && setVisible(true)}
            />

            <Modal visible={visible} transparent animationType="slide">
                <TouchableOpacity
                    style={s.overlay}
                    activeOpacity={1}
                    onPress={() => setVisible(false)}
                >
                    <View style={s.sheet}>
                        <View style={s.handle} />
                        <Text style={s.title}>Select Country</Text>
                        <ScrollView showsVerticalScrollIndicator={false}>
                            {COUNTRIES.map((country) => (
                                <TouchableOpacity
                                    key={country}
                                    style={s.option}
                                    onPress={() => handleSelect(country)}
                                >
                                    <Text style={[s.optionText, value === country && s.optionTextActive]}>
                                        {country}
                                    </Text>
                                    {value === country && (
                                        <Ionicons name="checkmark" size={18} color="#6366f1" />
                                    )}
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>
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
        width: 40, height: 4,
        backgroundColor: '#444',
        borderRadius: 2,
        alignSelf: 'center',
        marginBottom: 16,
    },
    title: {
        fontSize: 16, fontWeight: '700',
        color: '#fff', marginBottom: 16,
    },
    option: {
        paddingVertical: 14,
        borderBottomWidth: 1,
        borderBottomColor: '#262626',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    optionText: { fontSize: 16, color: '#ddd' },
    optionTextActive: { color: '#6366f1', fontWeight: '600' },
});
