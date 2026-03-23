import React, { useMemo, useState } from 'react';
import {
    ActivityIndicator,
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

function AddressOption({ address, isSelected, onPress }) {
    const line2 = [address.city, address.country].filter(Boolean).join(', ');
    return (
        <TouchableOpacity
            style={[styles.addressOption, isSelected && styles.addressOptionSelected]}
            onPress={onPress}
            activeOpacity={0.85}
        >
            <View style={styles.addressOptionLeft}>
                <Text style={styles.addressOptionLabel}>{address.label || 'Address'}</Text>
                {address.street ? (
                    <Text style={styles.addressOptionStreet} numberOfLines={1}>
                        {address.street}
                    </Text>
                ) : null}
                {line2 ? (
                    <Text style={styles.addressOptionCity} numberOfLines={1}>
                        {line2}
                    </Text>
                ) : null}
            </View>
            <Ionicons
                name={isSelected ? 'radio-button-on' : 'radio-button-off'}
                size={20}
                color={isSelected ? '#6366f1' : '#666'}
            />
        </TouchableOpacity>
    );
}

export default function ToolLocationSelector({
    locationSource,
    onChangeLocationSource,
    mapLocation,
    locationLoading,
    savedAddressesLoading,
    onPressMapLocation,
    savedAddresses,
    selectedSavedAddressId,
    onSelectSavedAddressId,
    onManageAddresses,
}) {
    const [showAddressPicker, setShowAddressPicker] = useState(false);
    const selectedSavedAddress = useMemo(
        () => savedAddresses.find((address) => address.id === selectedSavedAddressId) || null,
        [savedAddresses, selectedSavedAddressId],
    );
    const hasSavedAddresses = savedAddresses.length > 0;
    const mapIsActive = mapLocation.latitude != null && mapLocation.longitude != null;

    const handleSelectSource = (nextSource) => {
        if (nextSource === 'savedAddress' && !hasSavedAddresses && !savedAddressesLoading) {
            return;
        }
        onChangeLocationSource(nextSource);
    };

    return (
        <View style={styles.wrap}>
            <View style={styles.sourceTabs}>
                <TouchableOpacity
                    style={[styles.sourceTab, locationSource === 'map' && styles.sourceTabActive]}
                    onPress={() => handleSelectSource('map')}
                    activeOpacity={0.85}
                >
                    <Ionicons
                        name="map-outline"
                        size={16}
                        color={locationSource === 'map' ? '#fff' : '#8a8a8a'}
                    />
                    <Text style={[styles.sourceTabText, locationSource === 'map' && styles.sourceTabTextActive]}>
                        Pin on map
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[
                        styles.sourceTab,
                        locationSource === 'savedAddress' && styles.sourceTabActive,
                        !hasSavedAddresses && styles.sourceTabDisabled,
                    ]}
                    onPress={() => handleSelectSource('savedAddress')}
                    activeOpacity={0.85}
                >
                    <Ionicons
                        name="home-outline"
                        size={16}
                        color={locationSource === 'savedAddress' ? '#fff' : '#8a8a8a'}
                    />
                    {savedAddressesLoading ? (
                        <ActivityIndicator size="small" color="#9ca3af" />
                    ) : null}
                    <Text
                        style={[
                            styles.sourceTabText,
                            locationSource === 'savedAddress' && styles.sourceTabTextActive,
                            !hasSavedAddresses && !savedAddressesLoading && styles.sourceTabTextDisabled,
                        ]}
                    >
                        Saved address
                    </Text>
                </TouchableOpacity>
            </View>

            {locationSource === 'map' ? (
                <TouchableOpacity
                    style={[styles.locationCard, mapIsActive && styles.locationCardActive]}
                    onPress={onPressMapLocation}
                    disabled={locationLoading}
                    activeOpacity={0.85}
                >
                    <View style={[styles.locationIcon, mapIsActive && styles.locationIconActive]}>
                        {locationLoading ? (
                            <ActivityIndicator size="small" color="#6366f1" />
                        ) : (
                            <Ionicons
                                name={mapIsActive ? 'location' : 'map-outline'}
                                size={22}
                                color={mapIsActive ? '#fff' : '#888'}
                            />
                        )}
                    </View>

                    <View style={styles.locationInfo}>
                        {mapIsActive && mapLocation.address ? (
                            <>
                                {mapLocation.address.street ? (
                                    <Text style={styles.locationStreet} numberOfLines={1}>
                                        {mapLocation.address.street}
                                    </Text>
                                ) : null}
                                {(mapLocation.address.city || mapLocation.address.country) ? (
                                    <Text style={styles.locationCity} numberOfLines={1}>
                                        {[mapLocation.address.city, mapLocation.address.country]
                                            .filter(Boolean)
                                            .join(', ')}
                                    </Text>
                                ) : null}
                                <Text style={styles.locationCoords}>
                                    {mapLocation.latitude.toFixed(5)}, {mapLocation.longitude.toFixed(5)}
                                </Text>
                            </>
                        ) : (
                            <>
                                <Text style={styles.locationTitle}>Set tool location</Text>
                                <Text style={styles.locationSub}>Pin the exact pickup spot on the map</Text>
                            </>
                        )}
                    </View>

                    <View style={styles.locationChevron}>
                        <Ionicons
                            name={mapIsActive ? 'pencil-outline' : 'chevron-forward'}
                            size={18}
                            color="#555"
                        />
                    </View>
                </TouchableOpacity>
            ) : savedAddressesLoading ? (
                <View style={styles.emptySavedWrap}>
                    <View style={styles.savedLoadingRow}>
                        <ActivityIndicator size="small" color="#6366f1" />
                        <Text style={styles.emptySavedSub}>Loading saved addresses…</Text>
                    </View>
                </View>
            ) : hasSavedAddresses ? (
                <View
                    style={[
                        styles.locationCard,
                        selectedSavedAddress && styles.locationCardActive,
                    ]}
                >
                    {selectedSavedAddress ? (
                        <>
                            <TouchableOpacity
                                style={[styles.savedActionIconBtn, styles.savedActionIconBtnFloating]}
                                onPress={() => setShowAddressPicker(true)}
                                activeOpacity={0.85}
                                accessibilityLabel="Change saved address"
                            >
                                <Ionicons name="pencil" size={16} color="#6366f1" />
                            </TouchableOpacity>
                            <View style={[styles.locationIcon, styles.locationIconActive]}>
                                <Ionicons name="home" size={20} color="#fff" />
                            </View>
                            <View style={[styles.locationInfo, styles.savedLocationInfo]}>
                                <View style={styles.savedTitleRow}>
                                    <Text style={styles.locationStreet} numberOfLines={1}>
                                        {selectedSavedAddress.label || 'Saved address'}
                                    </Text>
                                    {selectedSavedAddress.isDefault ? (
                                        <View style={styles.defaultBadge}>
                                            <Text style={styles.defaultBadgeText}>Default</Text>
                                        </View>
                                    ) : null}
                                </View>
                                {selectedSavedAddress.street ? (
                                    <Text style={styles.locationCity} numberOfLines={1}>
                                        {selectedSavedAddress.street}
                                    </Text>
                                ) : null}
                                <Text style={styles.locationSub} numberOfLines={1}>
                                    {[
                                        selectedSavedAddress.city,
                                        selectedSavedAddress.state,
                                        selectedSavedAddress.postalCode,
                                        selectedSavedAddress.country,
                                    ]
                                        .filter(Boolean)
                                        .join(', ') || 'No address details'}
                                </Text>
                                {selectedSavedAddress.latitude != null &&
                                selectedSavedAddress.longitude != null ? (
                                    <Text style={styles.locationCoords}>
                                        {Number(selectedSavedAddress.latitude).toFixed(5)},
                                        {' '}
                                        {Number(selectedSavedAddress.longitude).toFixed(5)}
                                    </Text>
                                ) : null}
                            </View>
                        </>
                    ) : (
                        <TouchableOpacity
                            style={styles.savedEmptyCardPressable}
                            onPress={() => setShowAddressPicker(true)}
                            activeOpacity={0.85}
                        >
                            <View style={styles.locationIcon}>
                                <Ionicons name="home-outline" size={22} color="#888" />
                            </View>
                            <View style={styles.locationInfo}>
                                <Text style={styles.locationTitle}>Set tool location</Text>
                                <Text style={styles.locationSub}>
                                    Choose one of your saved addresses
                                </Text>
                            </View>
                            <View style={styles.locationChevron}>
                                <Ionicons name="chevron-forward" size={18} color="#555" />
                            </View>
                        </TouchableOpacity>
                    )}
                </View>
            ) : (
                <View style={styles.emptySavedWrap}>
                    <Text style={styles.emptySavedTitle}>No saved addresses yet</Text>
                    <Text style={styles.emptySavedSub}>
                        Add an address once, then reuse it for your listings.
                    </Text>
                    <TouchableOpacity
                        style={styles.emptySavedBtn}
                        onPress={onManageAddresses}
                        activeOpacity={0.85}
                    >
                        <Ionicons name="add-circle-outline" size={18} color="#fff" />
                        <Text style={styles.emptySavedBtnText}>Add address</Text>
                    </TouchableOpacity>
                </View>
            )}

            <Modal visible={showAddressPicker} animationType="slide" transparent>
                <View style={styles.pickerBackdrop}>
                    <View style={styles.pickerSheet}>
                        <View style={styles.pickerHeader}>
                            <Text style={styles.pickerTitle}>Choose saved address</Text>
                            <TouchableOpacity onPress={() => setShowAddressPicker(false)} style={styles.pickerClose}>
                                <Ionicons name="close" size={20} color="#fff" />
                            </TouchableOpacity>
                        </View>
                        <ScrollView contentContainerStyle={styles.pickerList}>
                            {savedAddresses.map((address) => (
                                <AddressOption
                                    key={address.id}
                                    address={address}
                                    isSelected={address.id === selectedSavedAddressId}
                                    onPress={() => {
                                        onSelectSavedAddressId(address.id);
                                        setShowAddressPicker(false);
                                    }}
                                />
                            ))}
                        </ScrollView>
                    </View>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    wrap: {
        gap: 10,
    },
    sourceTabs: {
        flexDirection: 'row',
        backgroundColor: '#161616',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#2a2a2a',
        padding: 4,
        gap: 4,
    },
    sourceTab: {
        flex: 1,
        minHeight: 40,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        flexDirection: 'row',
    },
    sourceTabActive: {
        backgroundColor: '#6366f1',
    },
    sourceTabDisabled: {
        opacity: 0.55,
    },
    sourceTabText: {
        color: '#8a8a8a',
        fontSize: 13,
        fontWeight: '600',
    },
    sourceTabTextActive: {
        color: '#fff',
    },
    sourceTabTextDisabled: {
        color: '#6a6a6a',
    },
    locationCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#1a1a1a',
        borderRadius: 12,
        padding: 16,
        borderWidth: 1,
        borderColor: '#2a2a2a',
    },
    locationCardActive: {
        borderColor: '#6366f1',
    },
    locationIcon: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: '#2a2a2a',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    locationIconActive: {
        backgroundColor: '#6366f1',
    },
    locationInfo: {
        flex: 1,
    },
    locationTitle: {
        fontSize: 15,
        fontWeight: '600',
        color: '#ffffff',
    },
    locationSub: {
        fontSize: 13,
        color: '#888',
        marginTop: 2,
    },
    locationStreet: {
        fontSize: 15,
        fontWeight: '600',
        color: '#ffffff',
    },
    locationCity: {
        fontSize: 14,
        color: '#aaa',
        marginTop: 2,
    },
    locationCoords: {
        fontSize: 11,
        color: '#555',
        marginTop: 4,
        fontVariant: ['tabular-nums'],
    },
    locationChevron: {
        marginLeft: 8,
    },
    savedTitleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    savedLocationInfo: {
        paddingRight: 46,
    },
    savedEmptyCardPressable: {
        flexDirection: 'row',
        alignItems: 'center',
        width: '100%',
    },
    defaultBadge: {
        backgroundColor: '#2b2f44',
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#6366f1',
        paddingHorizontal: 8,
        paddingVertical: 2,
    },
    defaultBadgeText: {
        color: '#c7d2fe',
        fontSize: 11,
        fontWeight: '700',
    },
    savedActionIconBtn: {
        width: 34,
        height: 34,
        borderRadius: 17,
        backgroundColor: '#232329',
        borderWidth: 1,
        borderColor: '#6366f1',
        justifyContent: 'center',
        alignItems: 'center',
    },
    savedActionIconBtnFloating: {
        position: 'absolute',
        top: 10,
        right: 10,
        zIndex: 2,
    },
    emptySavedWrap: {
        backgroundColor: '#1a1a1a',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#2a2a2a',
        padding: 16,
        gap: 8,
    },
    emptySavedTitle: {
        color: '#fff',
        fontSize: 15,
        fontWeight: '700',
    },
    emptySavedSub: {
        color: '#8a8a8a',
        fontSize: 13,
        lineHeight: 18,
    },
    savedLoadingRow: {
        minHeight: 44,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    emptySavedBtn: {
        marginTop: 4,
        alignSelf: 'flex-start',
        backgroundColor: '#6366f1',
        borderRadius: 10,
        paddingHorizontal: 12,
        minHeight: 36,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    emptySavedBtnText: {
        color: '#fff',
        fontSize: 13,
        fontWeight: '700',
    },
    pickerBackdrop: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    pickerSheet: {
        backgroundColor: '#111111',
        borderTopLeftRadius: 18,
        borderTopRightRadius: 18,
        borderWidth: 1,
        borderColor: '#262626',
        maxHeight: '72%',
    },
    pickerHeader: {
        height: 56,
        borderBottomWidth: 1,
        borderBottomColor: '#262626',
        paddingHorizontal: 16,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    pickerTitle: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '700',
    },
    pickerClose: {
        width: 34,
        height: 34,
        borderRadius: 17,
        backgroundColor: '#1f1f1f',
        justifyContent: 'center',
        alignItems: 'center',
    },
    pickerList: {
        padding: 14,
        gap: 10,
        paddingBottom: 20,
    },
    addressOption: {
        backgroundColor: '#1a1a1a',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#2a2a2a',
        padding: 12,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    addressOptionSelected: {
        borderColor: '#6366f1',
    },
    addressOptionLeft: {
        flex: 1,
        paddingRight: 10,
    },
    addressOptionLabel: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '700',
    },
    addressOptionStreet: {
        color: '#ddd',
        fontSize: 13,
        marginTop: 2,
    },
    addressOptionCity: {
        color: '#888',
        fontSize: 12,
        marginTop: 2,
    },
});
