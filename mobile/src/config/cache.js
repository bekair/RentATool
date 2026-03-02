/**
 * Cache TTL constants
 *
 * Centralised so changing a policy doesn't require hunting through hook files.
 */

/** Data that almost never changes (countries, categories, languages…) */
export const STATIC_DATA_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

/** User-generated or frequently updated content */
export const DYNAMIC_DATA_TTL_MS = 5 * 60 * 1000; // 5 minutes
