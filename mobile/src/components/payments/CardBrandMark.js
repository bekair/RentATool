import React, { useEffect, useMemo, useState } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import {
    getCardBrandIconSource,
    getCardBrandMeta,
    normalizeCardBrand,
} from '../../constants/paymentCardBrands';

export default function CardBrandMark({ brand }) {
    const [hasImageError, setHasImageError] = useState(false);

    const brandKey = normalizeCardBrand(brand);
    const iconSource = useMemo(() => getCardBrandIconSource(brandKey), [brandKey]);
    const brandMeta = useMemo(() => getCardBrandMeta(brandKey), [brandKey]);

    useEffect(() => {
        setHasImageError(false);
    }, [brandKey]);

    if (iconSource && !hasImageError) {
        return (
            <View style={styles.iconWrap}>
                <Image
                    source={iconSource}
                    style={styles.iconImage}
                    resizeMode="contain"
                    onError={() => setHasImageError(true)}
                />
            </View>
        );
    }

    return (
        <View style={[styles.badge, { backgroundColor: brandMeta.badgeBackground }]}>
            <Text style={styles.badgeText}>{brandMeta.badge}</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    iconWrap: {
        width: 52,
        height: 24,
        borderRadius: 6,
        backgroundColor: '#ffffff',
        borderWidth: 1,
        borderColor: '#d1d5db',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
    },
    iconImage: {
        width: 44,
        height: 16,
    },
    badge: {
        minWidth: 52,
        height: 24,
        borderRadius: 6,
        paddingHorizontal: 8,
        alignItems: 'center',
        justifyContent: 'center',
    },
    badgeText: {
        color: '#fff',
        fontSize: 11,
        fontWeight: '700',
    },
});

