import { StatusBar } from 'expo-status-bar';
import Constants from 'expo-constants';
import { View } from 'react-native';
import { StripeProvider } from '@stripe/stripe-react-native';
import * as WebBrowser from 'expo-web-browser';
import Navigation from './src/navigation';
import { STATUS_BAR_STYLE_BY_THEME, ThemeProvider, useTheme } from './src/theme';

WebBrowser.maybeCompleteAuthSession();

const stripePublishableKey = Constants.expoConfig.extra.stripePublishableKey;

function AppShell() {
  const { resolvedTheme, theme } = useTheme();
  const statusBarStyle = STATUS_BAR_STYLE_BY_THEME[resolvedTheme];

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.bg }}>
      <StatusBar style={statusBarStyle} />
      <Navigation />
    </View>
  );
}

export default function App() {
  return (
    <StripeProvider publishableKey={stripePublishableKey}>
      <ThemeProvider>
        <AppShell />
      </ThemeProvider>
    </StripeProvider>
  );
}
