import React, { useEffect } from 'react';
import Routes from './src/routes';
import 'react-native-reanimated';

import { Platform, Text, TextInput, PermissionsAndroid, Alert, Linking } from 'react-native';
import { Provider } from 'react-redux';
import { persistor, store } from './src/redux/store';
import { PersistGate } from 'redux-persist/integration/react';
import { toastConfig } from './src/components/toastconfig';
import Toast from 'react-native-toast-message';

export const fontFamily = 'FontBueno';

// Set default font for Text & TextInput
(Text as any).defaultProps = {
  ...(Text as any).defaultProps,
  style: [{ fontFamily }],
};

// console.log("hello")

(TextInput as any).defaultProps = {
  ...(TextInput as any).defaultProps,
  style: [{ fontFamily }],
};

const requestLocationPermission = async () => {
  if (Platform.OS === 'android') {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        {
          title: 'Location Permission',
          message: 'App needs access to your location for attendance tracking.',
          buttonNeutral: 'Ask Me Later',
          buttonNegative: 'Cancel',
          buttonPositive: 'OK',
        }
      );

      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        console.log('Location permission granted');
      } else {
        console.warn('Location permission denied');
        Alert.alert(
          'Location Required',
          'Location access is required to mark your attendance.\n\nWould you like to open settings?',
          [
            { text: 'Cancel', style: 'cancel' },
            {
              text: 'Open Settings',
              onPress: () => Linking.openSettings(),
            },
          ]
        );
      }
    } catch (err) {
      console.warn(err);
    }
  }
};
const App = () => {
  useEffect(() => {
    requestLocationPermission();
  }, []);

  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <Routes />
        <Toast config={toastConfig} />
      </PersistGate>
    </Provider>
  );
};

export default App;
