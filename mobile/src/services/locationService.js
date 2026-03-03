import axios from 'axios';

/**
 * Service for location-related external APIs.
 */
export const locationService = {
    /**
     * Looks up location details (like city) based on postal code and country code.
     * Uses the Zippopotam API.
     * 
     * @param {string} postalCode The postal code to look up.
     * @param {string} countryCode The two-letter ISO country code.
     * @returns {Promise<{city: string|null, state: string|null}|null>} The city (place name) and state if found, otherwise null.
     */
    lookupCityByPostalCode: async (postalCode, countryCode) => {
        if (!postalCode || !countryCode) return null;

        try {
            // Zippopotam works with 2-letter country codes
            const res = await axios.get(`https://api.zippopotam.us/${countryCode.toLowerCase()}/${postalCode.trim()}`);
            if (res.data && res.data.places && res.data.places.length > 0) {
                const place = res.data.places[0];
                return {
                    city: place['place name'] || null,
                    state: place['state'] || null
                };
            }
        } catch (err) {
            // Silent fail — maybe it's a new or unsupported postcode
            console.log(`Postal code lookup failed for ${countryCode} - ${postalCode}:`, err.message);
        }

        return null;
    }
};
