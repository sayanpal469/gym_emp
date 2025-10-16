// biometricsUtils.ts
import ReactNativeBiometrics from 'react-native-biometrics';
import { Platform, Alert, Linking } from 'react-native';

export type BiometricType = 'TouchID' | 'FaceID' | 'Biometrics' | null;

class BiometricService {
  private rnBiometrics: any;

  constructor() {
    this.rnBiometrics = new ReactNativeBiometrics();
  }

  // Comprehensive biometric check
  async isBiometricAvailable(): Promise<{
    available: boolean;
    biometryType?: BiometricType;
    error?: string;
    details?: string;
  }> {
    try {
      const { available, biometryType } = await this.rnBiometrics.isSensorAvailable();
      
      let details = '';
      
      if (available) {
        switch (biometryType) {
          case 'TouchID':
            details = 'Fingerprint sensor available';
            break;
          case 'FaceID':
            details = 'Face recognition available';
            break;
          case 'Biometrics':
            details = 'Biometric authentication available';
            break;
          default:
            details = 'Biometric available';
        }
      } else {
        details = 'Biometric not available on this device';
      }

      return {
        available,
        biometryType: biometryType || null,
        details
      };
    } catch (error) {
      console.error('❌ Biometric check error:', error);
      return {
        available: false,
        error: 'Biometric check failed',
        details: 'Unable to check biometric capabilities'
      };
    }
  }

  // Enhanced authentication with fallback
  async authenticate(
    promptMessage: string = 'Authenticate to mark attendance'
  ): Promise<{
    success: boolean;
    error?: string;
    helpText?: string;
  }> {
    try {
      const { available, biometryType, details } = await this.isBiometricAvailable();
      
      if (!available) {
        return {
          success: false,
          error: 'BIOMETRIC_UNAVAILABLE',
          helpText: 'Fingerprint/Face ID not available on this device'
        };
      }

      // Platform-specific prompt messages
      let finalPromptMessage = promptMessage;
      
      if (Platform.OS === 'android') {
        if (biometryType === 'Biometrics') {
          finalPromptMessage = 'Use fingerprint sensor to authenticate\n\n📍 Check: Back, Front, or Power button';
        }
      } else {
        if (biometryType === 'TouchID') {
          finalPromptMessage = 'Touch the Home button fingerprint sensor';
        } else if (biometryType === 'FaceID') {
          finalPromptMessage = 'Face ID to authenticate';
        }
      }

      console.log(`🔐 Starting biometric auth: ${biometryType}`);

      const result = await this.rnBiometrics.simplePrompt({
        promptMessage: finalPromptMessage,
        cancelButtonText: 'Cancel',
        fallbackButtonText: 'Use Password', // iOS only
      });

      if (result.success) {
        console.log('✅ Biometric authentication successful');
        return {
          success: true
        };
      } else {
        console.log('❌ Biometric authentication failed/cancelled');
        return {
          success: false,
          error: 'AUTH_FAILED',
          helpText: 'Authentication failed. Please try again.'
        };
      }
    } catch (error: any) {
      console.error('❌ Biometric authentication error:', error);
      
      let errorMessage = 'Authentication failed';
      let helpText = 'Please try again';

      if (error?.message?.includes('cancel')) {
        errorMessage = 'Authentication cancelled';
        helpText = 'You cancelled the biometric authentication';
      } else if (error?.message?.includes('not enrolled')) {
        errorMessage = 'Biometric not set up';
        helpText = 'Please set up fingerprint/face ID in device settings';
      }

      return {
        success: false,
        error: errorMessage,
        helpText
      };
    }
  }

  // Get detailed biometric information
  async getBiometricInfo() {
    const { available, biometryType, details } = await this.isBiometricAvailable();
    
    let typeName = 'Not Available';
    let icon = '🔒';
    let instructions = 'Biometric authentication not available';

    if (available && biometryType) {
      switch (biometryType) {
        case 'TouchID':
          typeName = 'Touch ID';
          icon = '👆';
          instructions = 'Touch the Home button fingerprint sensor';
          break;
        case 'FaceID':
          typeName = 'Face ID';
          icon = '👁';
          instructions = 'Look at the front camera';
          break;
        case 'Biometrics':
          typeName = 'Fingerprint';
          icon = '📱';
          instructions = 'Use fingerprint sensor (Check: Back, Front, or Power button)';
          break;
        default:
          typeName = 'Biometric';
          icon = '🔐';
          instructions = 'Use biometric authentication';
      }
    }

    return {
      available,
      type: biometryType,
      typeName,
      icon,
      instructions,
      details
    };
  }

  // Check if user has biometrics enrolled
  async isBiometricEnrolled(): Promise<boolean> {
    try {
      const { available } = await this.isBiometricAvailable();
      
      if (!available) return false;

      // Try to authenticate - if it fails with "not enrolled", we know it's not set up
      const result = await this.authenticate();
      
      return result.success;
    } catch (error) {
      return false;
    }
  }

  // Show biometric setup guide
  showBiometricSetupGuide() {
    Alert.alert(
      'Setup Biometric Authentication',
      'To use fingerprint/face recognition:\n\n' +
      '1. Go to Device Settings\n' +
      '2. Find "Security" or "Biometrics"\n' + 
      '3. Register your fingerprint/face\n' +
      '4. Come back and try again\n\n' +
      '📍 Fingerprint sensor locations:\n' +
      '• Back of phone (Pixel, Xiaomi)\n' +
      '• Power button (Sony, Samsung)\n' +
      '• Below screen (Samsung, OnePlus)\n' +
      '• In display (newer phones)',
      [
        { 
          text: 'Open Settings', 
          onPress: () => Linking.openSettings() 
        },
        { text: 'Cancel', style: 'cancel' }
      ]
    );
  }
}

export const biometricService = new BiometricService();