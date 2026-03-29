import React, { useMemo, useState } from 'react';
import { View, Text, TouchableOpacity, Platform, Modal, StyleSheet } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import LabelField from './LabelField';
import { RESOLVED_THEMES, useTheme } from '../../theme';
import { getFieldStyles } from './styles';

export default function DateField({ label, value, isEditing, onChange }) {
    const { theme, resolvedTheme } = useTheme();
    const fieldStyles = useMemo(() => getFieldStyles(theme), [theme]);
    const styles = useMemo(() => createStyles(theme), [theme]);
    const [showPicker, setShowPicker] = useState(false);

    const onDateChange = (event, selectedDate) => {
        if (Platform.OS === 'android') {
            setShowPicker(false);
        }
        if (selectedDate) {
            onChange(selectedDate.toISOString().split('T')[0]);
        }
    };

    const displayDate = value ? new Date(value).toLocaleDateString([], { day: '2-digit', month: '2-digit', year: 'numeric' }) : 'Select Date';
    const stateStyle = isEditing ? fieldStyles.editing : fieldStyles.readOnly;
    const displayDateColor = value ? theme.colors.fieldEditingText : theme.colors.fieldPlaceholder;

    return (
        <View style={fieldStyles.group}>
            <LabelField>{label}</LabelField>
            {isEditing ? (
                <>
                    <TouchableOpacity
                        style={[fieldStyles.base, stateStyle, { justifyContent: 'center' }]}
                        onPress={() => setShowPicker(true)}
                    >
                        <Text style={{ color: displayDateColor }}>{displayDate}</Text>
                    </TouchableOpacity>

                    {showPicker && Platform.OS === 'ios' && (
                        <Modal transparent={true} animationType="slide" visible={showPicker}>
                            <View style={styles.modalOverlay}>
                                <View style={styles.pickerContainer}>
                                    <View style={styles.pickerHeader}>
                                        <TouchableOpacity onPress={() => setShowPicker(false)}>
                                            <Text style={styles.doneText}>Done</Text>
                                        </TouchableOpacity>
                                    </View>
                                    <DateTimePicker
                                        testID="dateTimePicker"
                                        value={value ? new Date(value) : new Date()}
                                        mode="date"
                                        display="spinner"
                                        onChange={onDateChange}
                                        themeVariant={resolvedTheme === RESOLVED_THEMES.DARK ? 'dark' : 'light'}
                                        maximumDate={new Date()}
                                    />
                                </View>
                            </View>
                        </Modal>
                    )}

                    {showPicker && Platform.OS === 'android' && (
                        <DateTimePicker
                            testID="dateTimePicker"
                            value={value ? new Date(value) : new Date()}
                            mode="date"
                            display="default"
                            onChange={onDateChange}
                            maximumDate={new Date()}
                        />
                    )}
                </>
            ) : (
                <View style={[fieldStyles.base, stateStyle, { justifyContent: 'center' }]}>
                    <Text style={{ color: theme.colors.fieldReadOnlyText }}>{displayDate}</Text>
                </View>
            )}
        </View>
    );
}

const createStyles = (theme) =>
    StyleSheet.create({
        modalOverlay: {
            flex: 1,
            justifyContent: 'flex-end',
            backgroundColor: theme.colors.modalBackdrop,
        },
        pickerContainer: {
            backgroundColor: theme.colors.modalSurface,
            paddingBottom: 20,
        },
        pickerHeader: {
            flexDirection: 'row',
            justifyContent: 'flex-end',
            padding: 15,
            borderBottomWidth: 1,
            borderBottomColor: theme.colors.rowDivider,
        },
        doneText: {
            color: theme.colors.accent,
            fontSize: 16,
            fontWeight: 'bold',
        },
    });
