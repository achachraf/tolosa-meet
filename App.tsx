import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AppNavigator from './src/navigation/AppNavigator';
import { FirebaseAppProvider } from 'reactfire';
import firebaseConfig from './firebaseConfig';

export default function App() {
  return (
    <FirebaseAppProvider firebaseConfig={firebaseConfig}>
      <SafeAreaProvider>
        <AppNavigator />
      </SafeAreaProvider>
    </FirebaseAppProvider>
  );
}
