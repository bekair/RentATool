import { View, TextInput, Text } from 'react-native';
import LabelField from './LabelField';
import { fieldStyles } from './styles';

/**
 * InputField — labelled text input with read-only / editing states.
 *
 * @param {string}   label
 * @param {boolean}  isEditing
 * @param {string|boolean} error  — error message or boolean
 * @param {object}   props       — everything else forwarded to TextInput
 */
export default function InputField({ label, isEditing, style, noLabel = false, error, ...props }) {
    const stateStyle = isEditing ? fieldStyles.editing : fieldStyles.readOnly;
    const errorStyle = error ? fieldStyles.error : null;

    return (
        <View style={fieldStyles.group}>
            {!noLabel && <LabelField>{label}</LabelField>}
            <TextInput
                style={[fieldStyles.base, stateStyle, errorStyle, style]}
                editable={isEditing}
                color={isEditing ? '#fff' : '#888'}
                placeholderTextColor="#444"
                {...props}
            />
            {typeof error === 'string' && error.length > 0 && (
                <Text style={fieldStyles.errorText}>{error}</Text>
            )}
        </View>
    );
}
