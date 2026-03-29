import React, { useMemo, useState } from 'react';
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
import { useTheme } from '../../theme';

/**
 * CountryPickerModal - a reusable, searchable bottom-sheet list of countries.
 *
 * @param {boolean}  visible       - modal visibility state
 * @param {string}   title         - modal title (for example, "Select Country" or "Select Country Code")
 * @param {string}   selectedValue - currently selected value (used to highlight the row)
 * @param {function} onSelect      - called with the entire country object
 * @param {function} onClose       - called when modal is dismissed
 * @param {function} renderOption  - optional custom renderer for the list items
 */
export default function CountryPickerModal({
    visible,
    title = 'Select Country',
    selectedValue,
    onSelect,
    onClose,
    renderOption,
}) {
    const { theme } = useTheme();
    const styles = useMemo(() => createStyles(theme), [theme]);
    const { countries, loading } = useCountries();
    const [search, setSearch] = useState('');

    const filtered = search.trim()
        ? countries.filter((country) =>
            country.name.toLowerCase().includes(search.toLowerCase()) ||
            country.countryCode.includes(search)
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
                style={styles.overlay}
                activeOpacity={1}
                onPress={handleClose}
            >
                <TouchableOpacity activeOpacity={1} style={styles.sheet}>
                    <View style={styles.handle} />
                    <Text style={styles.title}>{title}</Text>

                    <View style={styles.searchRow}>
                        <Ionicons
                            name="search-outline"
                            size={16}
                            color={theme.colors.iconSubtle}
                            style={styles.searchIcon}
                        />
                        <TextInput
                            style={styles.searchInput}
                            placeholder="Search..."
                            placeholderTextColor={theme.colors.fieldPlaceholder}
                            value={search}
                            onChangeText={setSearch}
                            autoCorrect={false}
                        />
                        {search.length > 0 && (
                            <TouchableOpacity onPress={() => setSearch('')}>
                                <Ionicons
                                    name="close-circle"
                                    size={16}
                                    color={theme.colors.fieldPlaceholder}
                                />
                            </TouchableOpacity>
                        )}
                    </View>

                    {loading ? (
                        <ActivityIndicator color={theme.colors.accent} style={styles.loading} />
                    ) : (
                        <FlatList
                            data={filtered}
                            keyExtractor={(item) => item.code}
                            keyboardShouldPersistTaps="handled"
                            showsVerticalScrollIndicator={false}
                            renderItem={({ item }) => {
                                const isSelected =
                                    selectedValue === item.name ||
                                    selectedValue === item.code ||
                                    selectedValue === item.countryCode;

                                if (renderOption) {
                                    return renderOption(item, isSelected, () => handleSelect(item));
                                }

                                return (
                                    <TouchableOpacity
                                        style={styles.option}
                                        onPress={() => handleSelect(item)}
                                    >
                                        <Text style={styles.flag}>{item.flag}</Text>
                                        <Text style={[styles.optionText, isSelected && styles.optionTextActive]}>
                                            {item.name}
                                        </Text>
                                        {isSelected && (
                                            <Ionicons name="checkmark" size={18} color={theme.colors.accent} />
                                        )}
                                    </TouchableOpacity>
                                );
                            }}
                            ListEmptyComponent={
                                <Text style={styles.emptyText}>No countries found</Text>
                            }
                        />
                    )}
                </TouchableOpacity>
            </TouchableOpacity>
        </Modal>
    );
}

const createStyles = (theme) =>
    StyleSheet.create({
        overlay: {
            flex: 1,
            backgroundColor: theme.colors.modalBackdrop,
            justifyContent: 'flex-end',
        },
        sheet: {
            backgroundColor: theme.colors.modalSurface,
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
            paddingTop: 12,
            paddingBottom: 40,
            paddingHorizontal: 20,
            maxHeight: '75%',
        },
        handle: {
            width: 40,
            height: 4,
            backgroundColor: theme.colors.modalHandle,
            borderRadius: 2,
            alignSelf: 'center',
            marginBottom: 16,
        },
        title: {
            fontSize: 16,
            fontWeight: '700',
            color: theme.colors.textPrimary,
            marginBottom: 12,
        },
        searchRow: {
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: theme.colors.surfaceAlt,
            borderRadius: 10,
            paddingHorizontal: 12,
            marginBottom: 12,
            height: 40,
        },
        searchIcon: {
            marginRight: 8,
        },
        searchInput: {
            flex: 1,
            color: theme.colors.textPrimary,
            fontSize: 14,
        },
        loading: {
            marginVertical: 32,
        },
        option: {
            paddingVertical: 14,
            borderBottomWidth: 1,
            borderBottomColor: theme.colors.rowDivider,
            flexDirection: 'row',
            alignItems: 'center',
            gap: 12,
        },
        flag: {
            fontSize: 20,
        },
        optionText: {
            flex: 1,
            fontSize: 16,
            color: theme.colors.textSecondary,
        },
        optionTextActive: {
            color: theme.colors.accent,
            fontWeight: '600',
        },
        emptyText: {
            textAlign: 'center',
            color: theme.colors.textMuted,
            paddingVertical: 24,
            fontSize: 14,
        },
    });
