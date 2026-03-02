import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../api/client';
import { STATIC_DATA_TTL_MS } from '../config/cache';

const CACHE_KEY = '@rent_a_tool/categories_cache';
const CACHE_TTL_MS = STATIC_DATA_TTL_MS;

// Module-level: survives re-renders and navigation, cleared on app restart
let memoryCache = null;

/**
 * useCategories — loads the category list with a two-layer cache:
 *  1. Module-level memory variable (instant, same app session)
 *  2. AsyncStorage with 24h TTL + ETag validation (survives app restarts)
 */
export function useCategories() {
    const [categories, setCategories] = useState(memoryCache ?? []);
    const [loading, setLoading] = useState(memoryCache === null);

    useEffect(() => {
        if (memoryCache !== null) return;
        load();
    }, []);

    async function load() {
        let cached = null;

        try {
            const raw = await AsyncStorage.getItem(CACHE_KEY);
            if (raw) cached = JSON.parse(raw);
        } catch { }

        // Serve immediately from storage while we validate
        if (cached?.data) {
            memoryCache = cached.data;
            setCategories(cached.data);
            setLoading(false);

            const age = Date.now() - (cached.fetchedAt ?? 0);
            if (age < CACHE_TTL_MS) return; // ✅ still fresh — no network call
        }

        // TTL expired (or no cache) — validate with ETag
        try {
            const headers = cached?.etag ? { 'If-None-Match': cached.etag } : {};
            const res = await api.get('/categories', {
                headers,
                validateStatus: (s) => s === 200 || s === 304,
            });

            if (res.status === 200) {
                const newEtag = res.headers['etag'] ?? null;
                memoryCache = res.data;
                setCategories(res.data);
                await AsyncStorage.setItem(CACHE_KEY, JSON.stringify({
                    data: res.data,
                    etag: newEtag,
                    fetchedAt: Date.now(),
                }));
            } else {
                // 304 — reset TTL clock, keep data as-is
                if (cached) {
                    await AsyncStorage.setItem(CACHE_KEY, JSON.stringify({
                        ...cached,
                        fetchedAt: Date.now(),
                    }));
                }
            }
        } catch (e) {
            console.warn('useCategories: network request failed, using cache', e);
        } finally {
            if (!cached?.data) setLoading(false);
        }
    }

    return { categories, loading };
}
