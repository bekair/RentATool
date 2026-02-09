import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    ScrollView,
    Alert,
    SafeAreaView,
    ActivityIndicator,
} from 'react-native';
import api from '../api/client';

const AddToolScreen = ({ navigation }) => {
    const [name, setName] = useState('');
    const [category, setCategory] = useState('');
    const [description, setDescription] = useState('');
    const [price, setPrice] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async () => {
        if (!name || !category || !description || !price) {
            Alert.alert('Error', 'Please fill in all fields');
            return;
        }

        setLoading(true);
        try {
            await api.post('/tools', {
                name,
                category,
                description,
                pricePerDay: parseFloat(price),
            });
            Alert.alert('Success', 'Tool listed successfully!', [
                { text: 'OK', onPress: () => navigation.goBack() }
            ]);
        } catch (error) {
            console.error('Error listing tool:', error);
            Alert.alert('Error', error.response?.data?.message || 'Failed to list tool');
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Text style={styles.backButton}>Back</Text>
                </TouchableOpacity>
                <Text style={styles.title}>List a Tool</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={styles.form}>
                    <Text style={styles.label}>Tool Name</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="e.g. Bosch Drill PBH 2100"
                        placeholderTextColor="#666"
                        value={name}
                        onChangeText={setName}
                    />

                    <Text style={styles.label}>Category</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="e.g. Power Tools, Gardening"
                        placeholderTextColor="#666"
                        value={category}
                        onChangeText={setCategory}
                    />

                    <Text style={styles.label}>Description</Text>
                    <TextInput
                        style={[styles.input, styles.textArea]}
                        placeholder="Describe your tool, its condition, and any accessories included..."
                        placeholderTextColor="#666"
                        value={description}
                        onChangeText={setDescription}
                        multiline
                        numberOfLines={4}
                    />

                    <Text style={styles.label}>Price per Day (€)</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="15.00"
                        placeholderTextColor="#666"
                        value={price}
                        onChangeText={setPrice}
                        keyboardType="decimal-pad"
                    />

                    <TouchableOpacity
                        style={[styles.submitButton, loading && styles.disabledButton]}
                        onPress={handleSubmit}
                        disabled={loading}
                    >
                        {loading ? (
                            <ActivityIndicator color="#fff" />
                        ) : (
                            <Text style={styles.submitButtonText}>List Tool</Text>
                        )}
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0a0a0a',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 15,
    },
    backButton: {
        color: '#6366f1',
        fontSize: 16,
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#ffffff',
    },
    scrollContent: {
        padding: 20,
    },
    form: {
        gap: 20,
    },
    label: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: -10,
    },
    input: {
        backgroundColor: '#1a1a1a',
        borderRadius: 12,
        padding: 15,
        color: '#fff',
        borderWidth: 1,
        borderColor: '#2a2a2a',
    },
    textArea: {
        height: 120,
        textAlignVertical: 'top',
    },
    submitButton: {
        backgroundColor: '#6366f1',
        borderRadius: 12,
        padding: 18,
        alignItems: 'center',
        marginTop: 10,
    },
    disabledButton: {
        opacity: 0.7,
    },
    submitButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
});

export default AddToolScreen;
