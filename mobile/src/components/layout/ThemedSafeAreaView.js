import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../theme';

export default function ThemedSafeAreaView({ style, children, ...props }) {
  const { theme } = useTheme();

  return (
    <SafeAreaView style={[{ flex: 1, backgroundColor: theme.colors.bg }, style]} {...props}>
      {children}
    </SafeAreaView>
  );
}
