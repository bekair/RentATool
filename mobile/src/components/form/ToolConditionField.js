import React, { useMemo, useState } from 'react';
import {
    View,
    Text,
    Modal,
    TouchableOpacity,
    FlatList,
    StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import DropdownField from './DropdownField';
import { TOOL_CONDITION_OPTIONS, getToolConditionLabel } from '../../constants/toolConditions';
import { useTheme } from '../../theme';

export default function ToolConditionField({
    label = 'Condition',
    isEditing,
    value,
    onSelect,
    error,
}) {
    const { theme } = useTheme();
    const styles = useMemo(() => createStyles(theme), [theme]);
    const [visible, setVisible] = useState(false);

    const handleSelect = (optionValue) => {
        onSelect(optionValue);
        setVisible(false);
    };

    return (
        <>
            <DropdownField
                label={label}
                isEditing={isEditing}
                value={getToolConditionLabel(value)}
                placeholder="Select condition..."
                onPress={() => isEditing && setVisible(true)}
                error={error}
            />

            <Modal visible={visible} transparent animationType="slide">
                <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={() => setVisible(false)}>
                    <TouchableOpacity activeOpacity={1} style={styles.sheet}>
                        <View style={styles.handle} />
                        <Text style={styles.title}>Select condition</Text>
                        <FlatList
                            data={TOOL_CONDITION_OPTIONS}
                            keyExtractor={(item) => item.value}
                            renderItem={({ item }) => {
                                const isSelected = item.value === value;
                                return (
                                    <TouchableOpacity style={styles.option} onPress={() => handleSelect(item.value)}>
                                        <Text style={[styles.optionText, isSelected && styles.optionTextActive]}>
                                            {item.label}
                                        </Text>
                                        {isSelected ? (
                                            <Ionicons name="checkmark" size={18} color={theme.colors.accent} />
                                        ) : null}
                                    </TouchableOpacity>
                                );
                            }}
                        />
                    </TouchableOpacity>
                </TouchableOpacity>
            </Modal>
        </>
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
            maxHeight: '70%',
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
        option: {
            paddingVertical: 14,
            borderBottomWidth: 1,
            borderBottomColor: theme.colors.rowDivider,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
        },
        optionText: {
            fontSize: 16,
            color: theme.colors.textSecondary,
        },
        optionTextActive: {
            color: theme.colors.accent,
            fontWeight: '600',
        },
    });
