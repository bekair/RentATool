import React, { useState } from 'react';
import {
    View,
    Text,
    Modal,
    TouchableOpacity,
    StyleSheet,
    FlatList,
    ActivityIndicator,
    TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import DropdownField from './DropdownField';
import { useCountries } from '../../hooks/useCountries';

/**
 * CountryField — a DropdownField that opens a bottom-sheet country picker.
 * Countries are loaded from the backend with 24h AsyncStorage caching + ETag validation.
 *
 * @param {string}   label     — field label (default "Country")
 * @param {boolean}  isEditing
 * @param {string}   value     — currently selected country name
 * @param {function} onSelect  — called with the chosen country name string
 */
export default function CountryField({
    label = 'Country',
    isEditing,
    value,
    onSelect,
}) {
    const { countries, loading } = useCountries();
    const [visible, setVisible] = useState(false);
    const [search, setSearch] = useState('');

    const filtered = search.trim()
        ? countries.filter((c) =>
            c.name.toLowerCase().includes(search.toLowerCase())
        )
        : countries;

    const handleSelect = (country) => {
        onSelect(country.name);
        setVisible(false);
        setSearch('');
    };

    const handleClose = () => {
        setVisible(false);
        setSearch('');
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
                    onPress={handleClose}
                >
                    <TouchableOpacity activeOpacity={1} style={s.sheet}>
                        <View style={s.handle} />
                        <Text style={s.title}>Select Country</Text>

                        {/* Search box */}
                        <View style={s.searchRow}>
                            <Ionicons name="search-outline" size={16} color="#666" style={s.searchIcon} />
                            <TextInput
                                style={s.searchInput}
                                placeholder="Search…"
                                placeholderTextColor="#555"
                                value={search}
                                onChangeText={setSearch}
                                autoCorrect={false}
                            />
                            {search.length > 0 && (
                                <TouchableOpacity onPress={() => setSearch('')}>
                                    <Ionicons name="close-circle" size={16} color="#555" />
                                </TouchableOpacity>
                            )}
                        </View>

                        {loading ? (
                            <ActivityIndicator
                                color="#6366f1"
                                style={{ marginVertical: 32 }}
                            />
                        ) : (
                            <FlatList
                                data={filtered}
                                keyExtractor={(item) => item.code}
                                keyboardShouldPersistTaps="handled"
                                showsVerticalScrollIndicator={false}
                                renderItem={({ item }) => {
                                    const selected = value === item.name;
                                    return (
                                        <TouchableOpacity
                                            style={s.option}
                                            onPress={() => handleSelect(item)}
                                        >
                                            <Text style={s.flag}>{item.flag}</Text>
                                            <Text style={[s.optionText, selected && s.optionTextActive]}>
                                                {item.name}
                                            </Text>
                                            {selected && (
                                                <Ionicons name="checkmark" size={18} color="#6366f1" />
                                            )}
                                        </TouchableOpacity>
                                    );
                                }}
                                ListEmptyComponent={
                                    <Text style={s.emptyText}>No countries found</Text>
                                }
                            />
                        )}
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
        maxHeight: '75%',
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
        color: '#fff', marginBottom: 12,
    },
    searchRow: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#2a2a2a',
        borderRadius: 10,
        paddingHorizontal: 12,
        marginBottom: 12,
        height: 40,
    },
    searchIcon: { marginRight: 8 },
    searchInput: {
        flex: 1,
        color: '#fff',
        fontSize: 14,
    },
    option: {
        paddingVertical: 14,
        borderBottomWidth: 1,
        borderBottomColor: '#262626',
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    flag: { fontSize: 20 },
    optionText: { flex: 1, fontSize: 16, color: '#ddd' },
    optionTextActive: { color: '#6366f1', fontWeight: '600' },
    emptyText: {
        textAlign: 'center',
        color: '#555',
        paddingVertical: 24,
        fontSize: 14,
    },
});
