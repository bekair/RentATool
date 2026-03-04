import React, { useState } from 'react';
import DropdownField from './DropdownField';
import CountryPickerModal from './CountryPickerModal';

/**
 * CountryField — a DropdownField that opens a bottom-sheet country picker.
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

            <CountryPickerModal
                visible={visible}
                title="Select Country"
                selectedValue={value}
                onSelect={handleSelect}
                onClose={() => setVisible(false)}
            />
        </>
    );
}
