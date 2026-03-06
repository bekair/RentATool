/**
 * Validates a phone number and country code combination.
 * Both must be provided together, or both must be empty.
 * 
 * @param {string} phone - The phone number string
 * @param {string} phoneCode - The country dial code
 * @returns {string|null} - The error message, or null if valid
 */
export const validatePhone = (phone, phoneCode) => {
    const hasPhone = phone && phone.trim().length > 0;
    const hasCode = !!phoneCode;

    if (hasPhone && !hasCode) return 'Country code required';
    if (!hasPhone && hasCode) return 'Phone number required';
    return null;
};
