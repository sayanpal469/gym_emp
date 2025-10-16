// locationUtilis.ts
import { 
  Alert, 
  Linking, 
  PermissionsAndroid, 
  Platform, 
  NativeModules
} from 'react-native';
import Geolocation from '@react-native-community/geolocation';

export type Coordinates = { lat: number; lng: number };

// Universal Android Support Class
class AndroidUniversalSupport {
  // Check Android version and apply appropriate methods
  static getAndroidVersionInfo() {
    const version = Platform.Version;
    
    // Android version mapping
    const versionMap: {[key: number]: string} = {
      34: 'Android 14', 33: 'Android 13', 32: 'Android 12L', 
      31: 'Android 12', 30: 'Android 11', 29: 'Android 10',
      28: 'Android 9 Pie', 27: 'Android 8.1', 26: 'Android 8.0',
      25: 'Android 7.1', 24: 'Android 7.0', 23: 'Android 6.0',
      22: 'Android 5.1', 21: 'Android 5.0', 20: 'Android 4.4W',
      19: 'Android 4.4', 18: 'Android 4.3', 17: 'Android 4.2',
      16: 'Android 4.1'
    };
    
    return {
      version,
      versionName: versionMap[version] || `Android ${version}`,
      isPreMarshmallow: version < 23,  // Before Android 6.0
      isMarshmallowToPie: version >= 23 && version <= 28, // Android 6.0-9.0
      isAndroid10Plus: version >= 29,   // Android 10+
      isAndroid12Plus: version >= 31    // Android 12+
    };
  }

  // Universal permission handler for all Android versions
  static async requestUniversalLocationPermission(): Promise<boolean> {
    if (Platform.OS !== 'android') return true;

    const versionInfo = this.getAndroidVersionInfo();
    
    try {
      // For Android 5.1 and below (pre-runtime permissions)
      if (versionInfo.isPreMarshmallow) {
        console.log('📱 Pre-Android 6.0: Using install-time permissions');
        return true; // Permissions granted at install time
      }

      // For Android 6.0+ (runtime permissions)
      console.log('📱 Android 6.0+: Requesting runtime location permission');
      
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        {
          title: 'Location Access Required',
          message: 'This app needs location access to mark your attendance accurately.',
          buttonNeutral: 'Ask Me Later',
          buttonNegative: 'Cancel', 
          buttonPositive: 'Allow',
        }
      );

      const hasPermission = granted === PermissionsAndroid.RESULTS.GRANTED;
      console.log(`📱 Permission ${hasPermission ? 'granted' : 'denied'} for ${versionInfo.versionName}`);
      
      return hasPermission;

    } catch (err) {
      console.warn('📱 Permission request error:', err);
      return false;
    }
  }

  // Get optimized location config for specific Android version
  static getOptimizedLocationConfig() {
    const versionInfo = this.getAndroidVersionInfo();
    
    let config = {
      enableHighAccuracy: false,
      timeout: 45000,
      maximumAge: 300000,
      distanceFilter: 0,
    };

    // Optimize for different Android versions
    if (versionInfo.isPreMarshmallow) {
      // Android 4.1-5.1: Slower devices, need more time
      config.enableHighAccuracy = false;
      config.timeout = 60000; // 60 seconds
      config.maximumAge = 900000; // 15 minutes cache
      console.log('📍 Config: Pre-Android 6.0 optimized');
      
    } else if (versionInfo.isMarshmallowToPie) {
      // Android 6.0-9.0: Balanced approach
      config.enableHighAccuracy = true;
      config.timeout = 35000; // 35 seconds
      config.maximumAge = 300000; // 5 minutes cache
      console.log('📍 Config: Android 6.0-9.0 optimized');
      
    } else if (versionInfo.isAndroid10Plus) {
      // Android 10+: Modern devices, faster
      config.enableHighAccuracy = true;
      config.timeout = 25000; // 25 seconds
      config.maximumAge = 180000; // 3 minutes cache
      console.log('📍 Config: Android 10+ optimized');
    }

    return config;
  }
}

// Universal location service check
const checkLocationServices = async (): Promise<boolean> => {
  if (Platform.OS !== 'android') return true;

  return new Promise((resolve) => {
    // Try to get location - if successful, services are enabled
    Geolocation.getCurrentPosition(
      () => {
        console.log('✅ Location services are enabled');
        resolve(true);
      },
      (error) => {
        console.warn('📍 Location services may be disabled:', error.message);
        
        // Show helpful alert based on Android version
        const versionInfo = AndroidUniversalSupport.getAndroidVersionInfo();
        let message = 'Please enable location services to mark attendance.';
        
        if (versionInfo.isPreMarshmallow) {
          message = 'Go to Settings > Location and enable location services.';
        } else if (versionInfo.isAndroid10Plus) {
          message = 'Swipe down and enable Location, or go to Settings > Location.';
        }
        
        Alert.alert(
          'Location Services Required',
          message,
          [
            { text: 'Cancel', style: 'cancel' },
            { 
              text: 'Open Settings', 
              onPress: () => Linking.openSettings() 
            },
          ]
        );
        resolve(false);
      },
      {
        enableHighAccuracy: false,
        timeout: 10000,
        maximumAge: 600000
      }
    );
  });
};

// Progressive location strategy for all devices
class UniversalLocationStrategy {
  static async getUniversalLocation(): Promise<Coordinates | null> {
    const versionInfo = AndroidUniversalSupport.getAndroidVersionInfo();
    console.log(`🔄 Getting location for ${versionInfo.versionName}`);

    // Strategy 1: Try with version-optimized config
    try {
      const location = await this.tryVersionOptimizedLocation();
      if (location) {
        console.log('✅ Version-optimized location successful');
        return location;
      }
    } catch (error) {
      console.log('📍 Strategy 1 failed, trying alternative...');
    }

    // Strategy 2: Try network-only (works on all Android versions)
    try {
      const location = await this.tryNetworkLocation();
      if (location) {
        console.log('✅ Network location successful');
        return location;
      }
    } catch (error) {
      console.log('📍 Strategy 2 failed, trying final...');
    }

    // Strategy 3: Try with maximum compatibility settings
    try {
      const location = await this.tryCompatibleLocation();
      if (location) {
        console.log('✅ Compatible location successful');
        return location;
      }
    } catch (error) {
      console.log('📍 All strategies failed');
    }

    return null;
  }

  private static tryVersionOptimizedLocation(): Promise<Coordinates> {
    return new Promise((resolve, reject) => {
      const config = AndroidUniversalSupport.getOptimizedLocationConfig();
      
      Geolocation.getCurrentPosition(
        position => {
          const { latitude, longitude, accuracy } = position.coords;
          console.log(`📍 Optimized - Accuracy: ${accuracy ? accuracy + 'm' : 'Unknown'}`);
          resolve({ lat: latitude, lng: longitude });
        },
        error => reject(error),
        config
      );
    });
  }

  private static tryNetworkLocation(): Promise<Coordinates> {
    return new Promise((resolve, reject) => {
      console.log('📍 Trying network-based location (universal)');
      
      Geolocation.getCurrentPosition(
        position => {
          const { latitude, longitude } = position.coords;
          resolve({ lat: latitude, lng: longitude });
        },
        error => reject(error),
        {
          enableHighAccuracy: false, // Network only - works everywhere
          timeout: 30000,
          maximumAge: 600000, // 10 minutes cache
        }
      );
    });
  }

  private static tryCompatibleLocation(): Promise<Coordinates> {
    return new Promise((resolve, reject) => {
      console.log('📍 Trying maximum compatibility location');
      
      Geolocation.getCurrentPosition(
        position => {
          const { latitude, longitude } = position.coords;
          resolve({ lat: latitude, lng: longitude });
        },
        error => reject(error),
        {
          enableHighAccuracy: false,
          timeout: 60000, // Very long timeout for slow devices
          maximumAge: 86400000, // 24 hours - accept any cached location
        }
      );
    });
  }
}

// MAIN LOCATION FUNCTION - WORKS ON ALL ANDROID DEVICES
export const getLocationManually = async (): Promise<Coordinates | null> => {
  try {
    console.log('📍 Starting universal Android location fetch...');
    
    const versionInfo = AndroidUniversalSupport.getAndroidVersionInfo();
    console.log(`📱 Device: ${versionInfo.versionName}`);

    // 1. Check permissions (handles all Android versions)
    const hasPermission = await AndroidUniversalSupport.requestUniversalLocationPermission();
    if (!hasPermission) {
      Alert.alert(
        'Location Permission Required',
        'Please allow location access to mark attendance.',
        [{ text: 'OK', style: 'cancel' }]
      );
      return null;
    }

    // 2. Check location services
    const locationEnabled = await checkLocationServices();
    if (!locationEnabled) {
      return null;
    }

    // 3. Get location using universal strategy
    console.log(`📍 Fetching location for ${versionInfo.versionName}`);
    
    const location = await UniversalLocationStrategy.getUniversalLocation();
    
    if (location) {
      console.log(`✅ Successfully got location on ${versionInfo.versionName}:`, location);
      return location;
    } else {
      throw new Error(`Could not get location on ${versionInfo.versionName}`);
    }

  } catch (error) {
    console.warn('📍 Universal location fetch failed:', error);
    
    const versionInfo = AndroidUniversalSupport.getAndroidVersionInfo();
    let helpMessage = '';
    
    // Version-specific help messages
    if (versionInfo.isPreMarshmallow) {
      helpMessage = 'For older Android devices:\n• Enable GPS in Settings\n• Wait 1-2 minutes for GPS lock\n• Try in open area\n• Restart location services';
    } else if (versionInfo.isMarshmallowToPie) {
      helpMessage = 'For Android 6.0-9.0:\n• Allow location permission\n• Enable high accuracy mode\n• Check internet connection\n• Try outdoor for better GPS';
    } else {
      helpMessage = 'For modern Android:\n• Allow precise location\n• Disable battery optimization\n• Enable all location services';
    }
    
    Alert.alert(
      'Location Unavailable',
      helpMessage,
      [
        { 
          text: 'Try Again', 
          style: 'default'
        },
        { 
          text: 'Cancel', 
          style: 'cancel' 
        },
      ]
    );

    return null;
  }
};

// Utility function
export const calculateDistance = (coord1: Coordinates, coord2: Coordinates): number => {
  const R = 6371000;
  const dLat = (coord2.lat - coord1.lat) * Math.PI / 180;
  const dLng = (coord2.lng - coord1.lng) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(coord1.lat * Math.PI / 180) * Math.cos(coord2.lat * Math.PI / 180) * 
    Math.sin(dLng/2) * Math.sin(dLng/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
};