import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../api/client';
import { STATIC_DATA_TTL_MS } from '../config/cache';

const CACHE_KEY = '@rent_a_tool/countries_cache';
// 24 hours — see src/config/cache.js to adjust
const CACHE_TTL_MS = STATIC_DATA_TTL_MS;

// Module-level: persists for the lifetime of the JS runtime (survives re-renders/navigation)
let memoryCache = null;

/**
 * useCountries — loads the country list with a two-layer cache:
 *  1. Module-level memory variable (instant, same app session)
 *  2. AsyncStorage with 24h TTL + ETag validation (survives app restarts)
 *
 * Network is only called when the TTL has expired.
 * Even then, if the server data hasn't changed it returns 304 (no body download).
 */
export function useCountries() {
    const [countries, setCountries] = useState(memoryCache ?? []);
    const [loading, setLoading] = useState(memoryCache === null);

    useEffect(() => {
        if (memoryCache !== null) return; // already loaded this session
        load();
    }, []);

    async function load() {
        let cached = null;

        try {
            const raw = await AsyncStorage.getItem(CACHE_KEY);
            if (raw) cached = JSON.parse(raw);
        } catch { }

        // Serve immediately from AsyncStorage while we validate
        if (cached?.data) {
            memoryCache = cached.data;
            setCountries(cached.data);
            setLoading(false);

            const age = Date.now() - (cached.fetchedAt ?? 0);
            if (age < CACHE_TTL_MS) return; // ✅ still fresh — no network call
        }

        // TTL expired (or no cache at all) — validate with ETag
        try {
            const headers = cached?.etag ? { 'If-None-Match': cached.etag } : {};
            const res = await api.get('/countries', {
                headers,
                validateStatus: (s) => s === 200 || s === 304,
            });

            if (res.status === 200) {
                const newEtag = res.headers['etag'] ?? null;
                memoryCache = res.data;
                setCountries(res.data);
                await AsyncStorage.setItem(CACHE_KEY, JSON.stringify({
                    data: res.data,
                    etag: newEtag,
                    fetchedAt: Date.now(),
                }));
            } else {
                // 304 — data unchanged, just reset the TTL clock
                if (cached) {
                    await AsyncStorage.setItem(CACHE_KEY, JSON.stringify({
                        ...cached,
                        fetchedAt: Date.now(),
                    }));
                }
            }
        } catch (e) {
            console.warn('useCountries: network request failed, using cache', e);
        } finally {
            if (!cached?.data) setLoading(false); // first-ever load with no cache
        }
    }

    return { countries, loading };
}
