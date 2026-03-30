import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../theme';

export default function AppScreenHeader({
  title,
  onBack,
  right,
  iconName = 'arrow-back',
  iconColor,
  style,
  titleStyle,
  backButtonStyle,
}) {
  const { theme } = useTheme();
  const resolvedIconColor = iconColor || theme.colors.textPrimary;

  return (
    <View style={[styles.header, style]}>
      <TouchableOpacity onPress={onBack} style={[styles.backButton, backButtonStyle]}>
        <Ionicons name={iconName} size={24} color={resolvedIconColor} />
      </TouchableOpacity>
      <Text style={[styles.headerTitle, { color: theme.colors.textPrimary }, titleStyle]}>{title}</Text>
      {right || <View style={styles.rightSpacer} />}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 12,
  },
  backButton: {
    padding: 5,
    marginLeft: -5,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  rightSpacer: {
    width: 34,
  },
});
