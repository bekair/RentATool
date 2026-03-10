import { StatusBar } from 'expo-status-bar';
import Constants from 'expo-constants';
import { StripeProvider } from '@stripe/stripe-react-native';
import * as WebBrowser from 'expo-web-browser';
import Navigation from './src/navigation';

WebBrowser.maybeCompleteAuthSession();

const stripePublishableKey = Constants.expoConfig.extra.stripePublishableKey;

export default function App() {
  return (
    <StripeProvider publishableKey={stripePublishableKey}>
      <StatusBar style="light" />
      <Navigation />
    </StripeProvider>
  );
}
