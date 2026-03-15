const CARD_BRAND_META = {
    visa: { label: 'Visa', badge: 'VISA', badgeBackground: '#1a5fd0' },
    mastercard: { label: 'Mastercard', badge: 'MC', badgeBackground: '#d1432f' },
    amex: { label: 'Amex', badge: 'AMEX', badgeBackground: '#1478a6' },
    discover: { label: 'Discover', badge: 'DISC', badgeBackground: '#f59e0b' },
    diners: { label: 'Diners', badge: 'DINERS', badgeBackground: '#2563eb' },
    jcb: { label: 'JCB', badge: 'JCB', badgeBackground: '#16a34a' },
    unionpay: { label: 'UnionPay', badge: 'UP', badgeBackground: '#dc2626' },
    maestro: { label: 'Maestro', badge: 'MAE', badgeBackground: '#1d4ed8' },
};

const CARD_BRAND_ICON_SOURCES = {
    visa: require('../assets/payment-brands/visa-official.png'),
    mastercard: require('../assets/payment-brands/mastercard-logo.png'),
    amex: require('../assets/payment-brands/Amex-logo.png'),
    maestro: require('../assets/payment-brands/maestro.png'),
};

export function normalizeCardBrand(brand) {
    return typeof brand === 'string' ? brand.toLowerCase() : '';
}

export function getCardBrandMeta(brand) {
    const key = normalizeCardBrand(brand);
    return CARD_BRAND_META[key] || { label: 'Card', badge: 'CARD', badgeBackground: '#374151' };
}

export function getCardBrandIconSource(brand) {
    const key = normalizeCardBrand(brand);
    return CARD_BRAND_ICON_SOURCES[key] || null;
}

