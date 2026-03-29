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
import { useTheme } from '../../theme';

function AddressOption({ address, isSelected, onPress, styles, theme }) {
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
                color={isSelected ? theme.colors.accent : theme.colors.iconSubtle}
            />
        </TouchableOpacity>
    );
}

function formatSavedAddressLine(address) {
    return [address.city, address.state, address.postalCode, address.country]
        .filter(Boolean)
        .join(', ');
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
    const { theme } = useTheme();
    const styles = useMemo(() => createStyles(theme), [theme]);
    const [showAddressPicker, setShowAddressPicker] = useState(false);

    const selectedSavedAddress = useMemo(
        () => savedAddresses.find((address) => address.id === selectedSavedAddressId) || null,
        [savedAddresses, selectedSavedAddressId],
    );

    const hasSavedAddresses = savedAddresses.length > 0;
    const mapIsActive = mapLocation.latitude != null && mapLocation.longitude != null;

    const selectedSource = useMemo(() => {
        if (mapIsActive) {
            return 'map';
        }

        if (selectedSavedAddress) {
            return 'savedAddress';
        }

        return null;
    }, [mapIsActive, selectedSavedAddress]);

    const handleSelectSource = (nextSource) => {
        if (nextSource === 'savedAddress' && !hasSavedAddresses && !savedAddressesLoading) {
            return;
        }

        onChangeLocationSource(nextSource);
    };

    const openSavedAddressPicker = () => {
        if (!hasSavedAddresses || savedAddressesLoading) {
            return;
        }

        setShowAddressPicker(true);
    };

    const selectedLocationTitle =
        selectedSource === 'savedAddress'
            ? selectedSavedAddress?.label || 'Saved address'
            : selectedSource === 'map'
                ? mapLocation?.address?.street || 'Pinned pickup spot'
                : 'Set tool location';

    const selectedLocationSub =
        selectedSource === 'savedAddress'
            ? formatSavedAddressLine(selectedSavedAddress) || 'No address details'
            : selectedSource === 'map'
                ? [mapLocation?.address?.city, mapLocation?.address?.country]
                    .filter(Boolean)
                    .join(', ')
                : 'Choose a saved address or pin a map location.';

    const selectedLocationCoords =
        selectedSource === 'savedAddress' &&
        selectedSavedAddress?.latitude != null &&
        selectedSavedAddress?.longitude != null
            ? `${Number(selectedSavedAddress.latitude).toFixed(5)}, ${Number(
                selectedSavedAddress.longitude,
            ).toFixed(5)}`
            : selectedSource === 'map' && mapIsActive
                ? `${Number(mapLocation.latitude).toFixed(5)}, ${Number(mapLocation.longitude).toFixed(5)}`
                : null;

    return (
        <View style={styles.wrap}>
            <View style={styles.sourceTabs}>
                <TouchableOpacity
                    style={[
                        styles.sourceTab,
                        locationSource === 'savedAddress' && styles.sourceTabActive,
                        !hasSavedAddresses && !savedAddressesLoading && styles.sourceTabDisabled,
                    ]}
                    onPress={() => handleSelectSource('savedAddress')}
                    activeOpacity={0.85}
                >
                    <Ionicons
                        name="home-outline"
                        size={16}
                        color={locationSource === 'savedAddress' ? theme.colors.accentContrast : theme.colors.iconMuted}
                    />
                    {savedAddressesLoading ? (
                        <ActivityIndicator size="small" color={theme.colors.textMuted} />
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

                <TouchableOpacity
                    style={[styles.sourceTab, locationSource === 'map' && styles.sourceTabActive]}
                    onPress={() => handleSelectSource('map')}
                    activeOpacity={0.85}
                >
                    <Ionicons
                        name="map-outline"
                        size={16}
                        color={locationSource === 'map' ? theme.colors.accentContrast : theme.colors.iconMuted}
                    />
                    <Text style={[styles.sourceTabText, locationSource === 'map' && styles.sourceTabTextActive]}>
                        Pin on map
                    </Text>
                </TouchableOpacity>
            </View>

            {locationSource === 'map' ? (
                <TouchableOpacity
                    style={styles.actionCard}
                    onPress={onPressMapLocation}
                    disabled={locationLoading}
                    activeOpacity={0.85}
                >
                    <View style={styles.actionLeft}>
                        <View style={styles.actionIconWrap}>
                            {locationLoading ? (
                                <ActivityIndicator size="small" color={theme.colors.accent} />
                            ) : (
                                <Ionicons name="map-outline" size={18} color={theme.colors.accent} />
                            )}
                        </View>
                        <View style={styles.actionCopy}>
                            <Text style={styles.actionTitle}>{mapIsActive ? 'Change map pin' : 'Set tool location'}</Text>
                            <Text style={styles.actionSub}>Pin the exact pickup spot on the map</Text>
                        </View>
                    </View>
                    <Ionicons name="chevron-forward" size={18} color={theme.colors.iconSubtle} />
                </TouchableOpacity>
            ) : savedAddressesLoading ? (
                <View style={styles.emptySavedWrap}>
                    <View style={styles.savedLoadingRow}>
                        <ActivityIndicator size="small" color={theme.colors.accent} />
                        <Text style={styles.emptySavedSub}>Loading saved addresses...</Text>
                    </View>
                </View>
            ) : hasSavedAddresses ? (
                <TouchableOpacity
                    style={styles.actionCard}
                    onPress={openSavedAddressPicker}
                    activeOpacity={0.85}
                >
                    <View style={styles.actionLeft}>
                        <View style={styles.actionIconWrap}>
                            <Ionicons name="home-outline" size={18} color={theme.colors.accent} />
                        </View>
                        <View style={styles.actionCopy}>
                            <Text style={styles.actionTitle}>Choose saved address</Text>
                            <Text style={styles.actionSub}>Select one of your saved addresses</Text>
                        </View>
                    </View>
                    <Ionicons name="chevron-forward" size={18} color={theme.colors.iconSubtle} />
                </TouchableOpacity>
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
                        <Ionicons name="add-circle-outline" size={18} color={theme.colors.buttonPrimaryText} />
                        <Text style={styles.emptySavedBtnText}>Add address</Text>
                    </TouchableOpacity>
                </View>
            )}

            <View style={[styles.selectedCard, selectedSource && styles.selectedCardActive]}>
                <View style={[styles.locationIcon, selectedSource && styles.locationIconActive]}>
                    <Ionicons
                        name={selectedSource === 'savedAddress' ? 'home' : selectedSource === 'map' ? 'location' : 'location-outline'}
                        size={20}
                        color={selectedSource ? theme.colors.accentContrast : theme.colors.iconMuted}
                    />
                </View>

                <View style={styles.locationInfo}>
                    <View style={styles.selectedHeaderRow}>
                        <Text style={styles.selectedHeaderText}>Selected location</Text>
                    </View>

                    <Text style={styles.locationStreet} numberOfLines={1}>
                        {selectedLocationTitle}
                    </Text>

                    {selectedLocationSub ? (
                        <Text style={styles.locationCity} numberOfLines={1}>
                            {selectedLocationSub}
                        </Text>
                    ) : null}

                    {selectedLocationCoords ? (
                        <Text style={styles.locationCoords}>{selectedLocationCoords}</Text>
                    ) : null}
                </View>

                <View style={styles.locationChevron}>
                    <Ionicons
                        name="checkmark-circle"
                        size={20}
                        color={selectedSource ? theme.colors.accent : theme.colors.selectedCheckInactive}
                    />
                </View>
            </View>

            <Modal visible={showAddressPicker} animationType="slide" transparent>
                <View style={styles.pickerBackdrop}>
                    <View style={styles.pickerSheet}>
                        <View style={styles.pickerHeader}>
                            <Text style={styles.pickerTitle}>Choose saved address</Text>
                            <TouchableOpacity onPress={() => setShowAddressPicker(false)} style={styles.pickerClose}>
                                <Ionicons name="close" size={20} color={theme.colors.textPrimary} />
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
                                    styles={styles}
                                    theme={theme}
                                />
                            ))}
                        </ScrollView>
                    </View>
                </View>
            </Modal>
        </View>
    );
}

const createStyles = (theme) =>
    StyleSheet.create({
        wrap: {
            gap: 10,
        },
        sourceTabs: {
            flexDirection: 'row',
            backgroundColor: theme.colors.surface,
            borderRadius: 12,
            borderWidth: 1,
            borderColor: theme.colors.border,
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
            backgroundColor: theme.colors.accent,
        },
        sourceTabDisabled: {
            opacity: 0.55,
        },
        sourceTabText: {
            color: theme.colors.iconMuted,
            fontSize: 13,
            fontWeight: '600',
        },
        sourceTabTextActive: {
            color: theme.colors.accentContrast,
        },
        sourceTabTextDisabled: {
            color: theme.colors.textDisabled,
        },
        selectedCard: {
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: theme.colors.surfaceMuted,
            borderRadius: 12,
            padding: 16,
            borderWidth: 1,
            borderColor: theme.colors.border,
        },
        selectedCardActive: {
            borderColor: theme.colors.accent,
        },
        selectedHeaderRow: {
            flexDirection: 'row',
            alignItems: 'center',
            marginBottom: 4,
        },
        selectedHeaderText: {
            fontSize: 12,
            color: theme.colors.textMuted,
            fontWeight: '700',
            textTransform: 'uppercase',
            letterSpacing: 0.4,
        },
        locationIcon: {
            width: 44,
            height: 44,
            borderRadius: 22,
            backgroundColor: theme.colors.border,
            justifyContent: 'center',
            alignItems: 'center',
            marginRight: 16,
        },
        locationIconActive: {
            backgroundColor: theme.colors.accent,
        },
        locationInfo: {
            flex: 1,
        },
        locationStreet: {
            fontSize: 15,
            fontWeight: '600',
            color: theme.colors.textPrimary,
        },
        locationCity: {
            fontSize: 14,
            color: theme.colors.textSecondary,
            marginTop: 2,
        },
        locationCoords: {
            fontSize: 11,
            color: theme.colors.textMuted,
            marginTop: 4,
            fontVariant: ['tabular-nums'],
        },
        locationChevron: {
            marginLeft: 8,
        },
        actionCard: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            backgroundColor: theme.colors.surface,
            borderRadius: 12,
            borderWidth: 1,
            borderColor: theme.colors.border,
            paddingHorizontal: 14,
            minHeight: 62,
        },
        actionLeft: {
            flexDirection: 'row',
            alignItems: 'center',
            flex: 1,
            marginRight: 8,
        },
        actionIconWrap: {
            width: 34,
            height: 34,
            borderRadius: 17,
            borderWidth: 1,
            borderColor: theme.colors.accent,
            backgroundColor: theme.colors.accentSurface,
            justifyContent: 'center',
            alignItems: 'center',
            marginRight: 12,
        },
        actionCopy: {
            flex: 1,
        },
        actionTitle: {
            color: theme.colors.textPrimary,
            fontSize: 14,
            fontWeight: '700',
        },
        actionSub: {
            color: theme.colors.textMuted,
            fontSize: 12,
            marginTop: 2,
        },
        emptySavedWrap: {
            backgroundColor: theme.colors.surfaceMuted,
            borderRadius: 12,
            borderWidth: 1,
            borderColor: theme.colors.border,
            padding: 16,
            gap: 8,
        },
        emptySavedTitle: {
            color: theme.colors.textPrimary,
            fontSize: 15,
            fontWeight: '700',
        },
        emptySavedSub: {
            color: theme.colors.textMuted,
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
            backgroundColor: theme.colors.buttonPrimary,
            borderRadius: 10,
            paddingHorizontal: 12,
            minHeight: 36,
            flexDirection: 'row',
            alignItems: 'center',
            gap: 8,
        },
        emptySavedBtnText: {
            color: theme.colors.buttonPrimaryText,
            fontSize: 13,
            fontWeight: '700',
        },
        pickerBackdrop: {
            flex: 1,
            backgroundColor: theme.colors.modalBackdrop,
            justifyContent: 'flex-end',
        },
        pickerSheet: {
            backgroundColor: theme.colors.modalSurface,
            borderTopLeftRadius: 18,
            borderTopRightRadius: 18,
            borderWidth: 1,
            borderColor: theme.colors.rowDivider,
            maxHeight: '72%',
        },
        pickerHeader: {
            height: 56,
            borderBottomWidth: 1,
            borderBottomColor: theme.colors.rowDivider,
            paddingHorizontal: 16,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
        },
        pickerTitle: {
            color: theme.colors.textPrimary,
            fontSize: 16,
            fontWeight: '700',
        },
        pickerClose: {
            width: 34,
            height: 34,
            borderRadius: 17,
            backgroundColor: theme.colors.surfaceAlt,
            justifyContent: 'center',
            alignItems: 'center',
        },
        pickerList: {
            padding: 14,
            gap: 10,
            paddingBottom: 20,
        },
        addressOption: {
            backgroundColor: theme.colors.surfaceMuted,
            borderRadius: 12,
            borderWidth: 1,
            borderColor: theme.colors.border,
            padding: 12,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
        },
        addressOptionSelected: {
            borderColor: theme.colors.accent,
        },
        addressOptionLeft: {
            flex: 1,
            paddingRight: 10,
        },
        addressOptionLabel: {
            color: theme.colors.textPrimary,
            fontSize: 14,
            fontWeight: '700',
        },
        addressOptionStreet: {
            color: theme.colors.textSecondary,
            fontSize: 13,
            marginTop: 2,
        },
        addressOptionCity: {
            color: theme.colors.textMuted,
            fontSize: 12,
            marginTop: 2,
        },
    });
