import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Platform, Modal, StyleSheet, Button } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import LabelField from './LabelField';
import { fieldStyles } from './styles';

export default function DateField({ label, value, isEditing, onChange }) {
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

    return (
        <View style={fieldStyles.group}>
            <LabelField>{label}</LabelField>
            {isEditing ? (
                <>
                    <TouchableOpacity
                        style={[fieldStyles.base, stateStyle, { justifyContent: 'center' }]}
                        onPress={() => setShowPicker(true)}
                    >
                        <Text style={{ color: value ? '#fff' : '#444' }}>{displayDate}</Text>
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
                                        themeVariant="dark"
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
                    <Text style={{ color: '#888' }}>{displayDate}</Text>
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        justifyContent: 'flex-end',
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    pickerContainer: {
        backgroundColor: '#1a1a1a',
        paddingBottom: 20,
    },
    pickerHeader: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        padding: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#333',
    },
    doneText: {
        color: '#6366f1',
        fontSize: 16,
        fontWeight: 'bold',
    },
});
