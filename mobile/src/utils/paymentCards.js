import { getCardBrandMeta } from '../constants/paymentCardBrands';

export function formatCardMainLabel(card) {
    const brand = getCardBrandMeta(card?.brand).label;
    const last4 = card?.last4 || '----';
    return `${brand} •••• ${last4}`;
}

export function formatCardExpiry(card) {
    if (!card?.expMonth || !card?.expYear) {
        return 'Expiry not available';
    }

    const month = String(card.expMonth).padStart(2, '0');
    return `Expires ${month}/${card.expYear}`;
}

