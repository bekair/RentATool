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
import { useCountries } from '../../hooks/useCountries';

/**
 * CountryPickerModal — a reusable, searchable bottom-sheet list of countries.
 *
 * @param {boolean}  visible       — modal visibility state
 * @param {string}   title         — modal title (e.g., "Select Country" or "Select Country Code")
 * @param {string}   selectedValue — currently selected value (used to highlight the row)
 * @param {function} onSelect      — called with the entire country object
 * @param {function} onClose       — called when modal is dismissed
 * @param {function} renderOption  — optional custom renderer for the list items
 */
export default function CountryPickerModal({
    visible,
    title = 'Select Country',
    selectedValue,
    onSelect,
    onClose,
    renderOption,
}) {
    const { countries, loading } = useCountries();
    const [search, setSearch] = useState('');

    const filtered = search.trim()
        ? countries.filter((c) =>
            c.name.toLowerCase().includes(search.toLowerCase()) ||
            c.countryCode.includes(search)
        )
        : countries;

    const handleSelect = (country) => {
        onSelect(country);
        setSearch('');
    };

    const handleClose = () => {
        onClose();
        setSearch('');
    };

    return (
        <Modal visible={visible} transparent animationType="slide">
            <TouchableOpacity
                style={s.overlay}
                activeOpacity={1}
                onPress={handleClose}
            >
                <TouchableOpacity activeOpacity={1} style={s.sheet}>
                    <View style={s.handle} />
                    <Text style={s.title}>{title}</Text>

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
                        <ActivityIndicator color="#6366f1" style={{ marginVertical: 32 }} />
                    ) : (
                        <FlatList
                            data={filtered}
                            keyExtractor={(item) => item.code}
                            keyboardShouldPersistTaps="handled"
                            showsVerticalScrollIndicator={false}
                            renderItem={({ item }) => {
                                const isSelected = selectedValue === item.name || selectedValue === item.code || selectedValue === item.countryCode;

                                if (renderOption) {
                                    return renderOption(item, isSelected, () => handleSelect(item));
                                }

                                return (
                                    <TouchableOpacity
                                        style={s.option}
                                        onPress={() => handleSelect(item)}
                                    >
                                        <Text style={s.flag}>{item.flag}</Text>
                                        <Text style={[s.optionText, isSelected && s.optionTextActive]}>
                                            {item.name}
                                        </Text>
                                        {isSelected && (
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
