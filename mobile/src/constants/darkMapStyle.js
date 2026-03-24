const darkMapStyle = [
    {
        elementType: 'geometry',
        stylers: [{ color: '#1d1d1d' }],
    },
    {
        elementType: 'labels.text.fill',
        stylers: [{ color: '#8c8c8c' }],
    },
    {
        elementType: 'labels.text.stroke',
        stylers: [{ color: '#1d1d1d' }],
    },
    {
        featureType: 'administrative',
        elementType: 'geometry',
        stylers: [{ color: '#3a3a3a' }],
    },
    {
        featureType: 'poi',
        elementType: 'geometry',
        stylers: [{ color: '#222222' }],
    },
    {
        featureType: 'poi',
        elementType: 'labels.text.fill',
        stylers: [{ color: '#757575' }],
    },
    {
        featureType: 'road',
        elementType: 'geometry',
        stylers: [{ color: '#2f2f2f' }],
    },
    {
        featureType: 'road',
        elementType: 'geometry.stroke',
        stylers: [{ color: '#262626' }],
    },
    {
        featureType: 'road',
        elementType: 'labels.text.fill',
        stylers: [{ color: '#9a9a9a' }],
    },
    {
        featureType: 'road.highway',
        elementType: 'geometry',
        stylers: [{ color: '#3c3c3c' }],
    },
    {
        featureType: 'road.highway',
        elementType: 'geometry.stroke',
        stylers: [{ color: '#2f2f2f' }],
    },
    {
        featureType: 'transit',
        elementType: 'geometry',
        stylers: [{ color: '#252525' }],
    },
    {
        featureType: 'water',
        elementType: 'geometry',
        stylers: [{ color: '#0f172a' }],
    },
    {
        featureType: 'water',
        elementType: 'labels.text.fill',
        stylers: [{ color: '#64748b' }],
    },
];

export default darkMapStyle;
