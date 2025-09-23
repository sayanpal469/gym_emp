import { Alert, Linking, PermissionsAndroid, Platform } from 'react-native';
import Geolocation from '@react-native-community/geolocation';
import { promptForEnableLocationIfNeeded } from 'react-native-android-location-enabler';

export type Coordinates = { lat: number; lng: number };

const DUMMY_COORDINATES: Coordinates = {
  lat: 22.5738994,
  lng: 88.3065939,
};

const requestLocationPermission = async (): Promise<boolean> => {
  if (Platform.OS === 'android') {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        {
          title: 'Location Permission',
          message: 'App needs access to your location for tracking.',
          buttonNeutral: 'Ask Me Later',
          buttonNegative: 'Cancel',
          buttonPositive: 'OK',
        },
      );
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    } catch (err) {
      console.warn('Permission error:', err);
      return false;
    }
  }
  return true; // iOS handled via Info.plist
};

export const getLocationManually = async (
  useDummy: boolean = true,
): Promise<Coordinates | null> => {
  try {
    if (useDummy) {
      return DUMMY_COORDINATES;
    }

    const hasPermission = await requestLocationPermission();
    if (!hasPermission) {
      Alert.alert('Permission Denied', 'Location permission is required.');
      return null;
    }

    if (Platform.OS === 'android') {
      await promptForEnableLocationIfNeeded({ interval: 10000 });
    }

    return new Promise((resolve, reject) => {
      Geolocation.getCurrentPosition(
        position => {
          const { latitude, longitude } = position.coords;
          resolve({ lat: latitude, lng: longitude });
        },
        error => {
          console.error('Geolocation error:', error);

          if (error.code === 2) {
            Alert.alert(
              'Location Services Disabled',
              'Please enable location services and try again.',
              [
                { text: 'Cancel', style: 'cancel' },
                {
                  text: 'Open Settings',
                  onPress: () => {
                    if (Platform.OS === 'android') {
                      Linking.openSettings();
                    } else {
                      Linking.openURL('app-settings:');
                    }
                  },
                },
              ],
            );
          } else {
            Alert.alert(
              'Location Error',
              `Code: ${error.code}\nMessage: ${error.message}`,
            );
          }
          reject(null);
        },
        {
          enableHighAccuracy: true,
          timeout: 30000,
          maximumAge: 1000,
        },
      );
    });
  } catch (error) {
    console.warn('Location fetch failed:', error);
    Alert.alert(
      'Enable Location Services',
      'Please turn on your GPS manually.',
      [
        { text: 'Open Settings', onPress: () => Linking.openSettings() },
        { text: 'Cancel', style: 'cancel' },
      ],
    );
    return null;
  }
};
