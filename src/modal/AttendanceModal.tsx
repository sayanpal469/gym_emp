import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
  Vibration,
  Alert,
  Linking,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useSelector } from 'react-redux';
import { RootState } from '../redux/store';
import { useAttendance } from '../hooks/useAttendance';
import Toast from 'react-native-toast-message';
import { getLocationManually, Coordinates } from '../utils/locationUtilis';
import { biometricService } from '../utils/biometricsUtils';

const { width } = Dimensions.get('window');

interface Props {
  visible: boolean;
  onClose: () => void;
}

const AttendanceModal: React.FC<Props> = ({ visible, onClose }) => {
  const [location, setLocation] = useState<Coordinates | null>(null);
  const [fetchingLocation, setFetchingLocation] = useState(false);
  const [locationStatus, setLocationStatus] = useState<string>('');
  const [attemptCount, setAttemptCount] = useState(0);
  const [biometricInfo, setBiometricInfo] = useState<any>(null);
  const [usingBiometric, setUsingBiometric] = useState(false);
  const [biometricAvailable, setBiometricAvailable] = useState(false);
  
  const { userId } = useSelector((state: RootState) => state.auth);
  const { giveAttendance, loading } = useAttendance();

  // Reset states when modal opens
  useEffect(() => {
    if (visible) {
      setLocation(null);
      setLocationStatus('');
      setAttemptCount(0);
      checkBiometricAvailability();
    }
  }, [visible]);

  // Check biometric availability
  const checkBiometricAvailability = async () => {
    try {
      const info = await biometricService.getBiometricInfo();
      setBiometricInfo(info);
      setBiometricAvailable(info.available);
      
      console.log(`🔐 Biometric: ${info.typeName} - ${info.details}`);
      
      if (info.available) {
        // Additional check for enrollment
        try {
          const { available } = await biometricService.isBiometricAvailable();
          if (!available) {
            console.log('⚠️ Biometric reported available but check failed');
          }
        } catch (error) {
          console.log('⚠️ Biometric enrollment check failed');
        }
      }
    } catch (error) {
      console.error('❌ Biometric check failed:', error);
      setBiometricInfo({
        available: false,
        typeName: 'Unavailable',
        icon: '🔒',
        instructions: 'Biometric not available'
      });
      setBiometricAvailable(false);
    }
  };

  const getCurrentDate = (): string => {
    const now = new Date();
    return now.toISOString().split('T')[0];
  };

  const getCurrentTime = (): string => {
    const now = new Date();
    return now.toTimeString().split(' ')[0];
  };

  // Vibration patterns
  const vibrateSuccess = () => {
    Vibration.vibrate([0, 100, 50, 100]);
  };

  const vibrateError = () => {
    Vibration.vibrate([0, 200, 100, 200, 100, 200]);
  };

  const vibrateProcessing = () => {
    Vibration.vibrate(100);
  };

  const vibrateBiometric = () => {
    Vibration.vibrate([0, 50]);
  };

  // Handle biometric authentication
  const handleBiometricAuth = async (): Promise<boolean> => {
    try {
      setUsingBiometric(true);
      setLocationStatus(`Using ${biometricInfo?.typeName}... ${biometricInfo?.icon}`);
      vibrateBiometric();

      const result = await biometricService.authenticate();
      
      setUsingBiometric(false);
      
      if (result.success) {
        console.log('✅ Biometric authentication successful');
        setLocationStatus(`${biometricInfo?.typeName} verified! ✅`);
        return true;
      } else {
        console.log('❌ Biometric authentication failed:', result.error);
        
        // Show helpful messages based on error
        if (result.error === 'BIOMETRIC_UNAVAILABLE') {
          Alert.alert(
            'Biometric Unavailable',
            'Your device does not support fingerprint/face recognition or it is not set up.\n\nYou can still mark attendance with location only.',
            [
              { 
                text: 'Setup Guide', 
                onPress: () => biometricService.showBiometricSetupGuide() 
              },
              { 
                text: 'Continue Without', 
                style: 'default',
                onPress: () => {
                  setLocationStatus('Continuing without biometric...');
                  return true;
                }
              }
            ]
          );
          // Continue without biometric
          return true;
        } else if (result.error === 'AUTH_FAILED') {
          setLocationStatus('Authentication failed ❌');
          Toast.show({
            type: 'error',
            text1: 'Authentication Failed',
            text2: 'Please try again',
            visibilityTime: 3000,
          });
          return false;
        } else if (result.helpText) {
          setLocationStatus(result.helpText);
          return false;
        }
        
        return false;
      }
    } catch (error) {
      setUsingBiometric(false);
      console.error('❌ Biometric auth error:', error);
      setLocationStatus('Biometric error ⚠️');
      return false;
    }
  };

  // Main attendance function
  const handleMarkAttendance = async (retryCount = 0) => {
    try {
      setAttemptCount(prev => prev + 1);

      // Step 1: Biometric Authentication (if available)
      if (biometricAvailable && biometricInfo?.available) {
        const authSuccess = await handleBiometricAuth();
        
        if (!authSuccess) {
          vibrateError();
          return;
        }
        
        // Small delay after successful biometric
        await new Promise(resolve => setTimeout(resolve, 500));
      } else {
        setLocationStatus('Starting attendance process...');
      }

      // Step 2: Location Fetching
      setFetchingLocation(true);
      setLocationStatus('Getting your location... 📍');
      vibrateProcessing();

      console.log(`📍 Attempt ${attemptCount}: Fetching real location`);

      const currentLoc = await getLocationManually();
      setFetchingLocation(false);

      if (!currentLoc) {
        setLocationStatus('Location not available ❌');
        vibrateError();

        if (retryCount < 2) {
          // Auto-retry with delay
          setTimeout(() => {
            setLocationStatus(`Retrying location... (${retryCount + 1}/3)`);
            handleMarkAttendance(retryCount + 1);
          }, 2000);
          return;
        }

        // Final failure after 3 attempts
        setLocationStatus('Failed to get location after 3 attempts');
        Alert.alert(
          'Location Error',
          'Unable to detect your current location.\n\nPlease make sure to:\n\n• Enable location access for this app\n• Turn on GPS from the navigation bar\n• Ensure your internet connection is active\n• If the issue persists, close the app completely and reopen it in an open area',
          [
            { 
              text: 'Open Settings', 
              onPress: () => Linking.openSettings() 
            },
            { text: 'OK', style: 'default' }
          ]
        );
        return;
      }

      // Step 3: Send Attendance
      setLocation(currentLoc);
      setLocationStatus('Location found! Sending attendance... 📤');
      console.log('📍 Real location obtained:', currentLoc);

      const payload = {
        emp_id: userId,
        lat: currentLoc.lat,
        lng: currentLoc.lng,
        date: getCurrentDate(),
        time: getCurrentTime(),
        type: "trainer"
      };

      console.log('🚀 Sending attendance payload:', payload);

      const result = await giveAttendance(payload);
      console.log('📥 Attendance API result:', result);

      if (result.success) {
        setLocationStatus('Attendance marked successfully! ✅');
        vibrateSuccess();

        Toast.show({
          type: 'success',
          text1: 'Attendance Recorded',
          text2: 'Your attendance has been successfully marked.',
          visibilityTime: 3000,
        });

        // Auto-close after success
        setTimeout(() => {
          onClose();
        }, 2000);
      } else {
        setLocationStatus('Failed to mark attendance ❌');
        vibrateError();

        Toast.show({
          type: 'error',
          text1: 'Attendance Failed',
          text2: result.message || 'Could not mark attendance. Please try again.',
          visibilityTime: 3000,
        });
      }

    } catch (error: any) {
      setFetchingLocation(false);
      setUsingBiometric(false);
      setLocationStatus('Error occurred ⚠️');
      vibrateError();

      console.error('❌ Attendance process error:', error);

      Toast.show({
        type: 'error',
        text1: 'Process Error',
        text2: error.message || 'Something went wrong. Please try again.',
        visibilityTime: 3000,
      });
    }
  };

  const handleCloseModal = () => {
    if (!fetchingLocation && !loading && !usingBiometric) {
      onClose();
    }
  };

  const getStatusColor = () => {
    if (locationStatus.includes('success') || locationStatus.includes('✅')) return '#4CAF50';
    if (locationStatus.includes('failed') || locationStatus.includes('❌') || locationStatus.includes('Error')) return '#F44336';
    if (locationStatus.includes('found') || locationStatus.includes('📍')) return '#2196F3';
    if (locationStatus.includes('Biometric') || locationStatus.includes('🔐') || locationStatus.includes('Fingerprint') || locationStatus.includes('Face ID')) return '#FF9800';
    if (locationStatus.includes('verified')) return '#4CAF50';
    return '#666';
  };

  const getStatusIcon = () => {
    if (locationStatus.includes('success')) return 'checkmark-circle';
    if (locationStatus.includes('failed') || locationStatus.includes('Error')) return 'close-circle';
    if (locationStatus.includes('found')) return 'location';
    if (locationStatus.includes('Biometric') || locationStatus.includes('Fingerprint')) return 'finger-print';
    if (locationStatus.includes('Face ID')) return 'scan-circle';
    if (fetchingLocation || usingBiometric) return 'refresh-circle';
    return 'time';
  };

  const isBusy = fetchingLocation || loading || usingBiometric;

  const getButtonText = () => {
    if (isBusy) {
      if (usingBiometric) return 'Authenticating...';
      if (fetchingLocation) return 'Getting Location...';
      return 'Processing...';
    }
    
    if (biometricAvailable) {
      return `Mark with ${biometricInfo?.typeName}`;
    }
    
    return 'Mark Attendance';
  };

  const getHelpText = () => {
    if (isBusy) {
      if (usingBiometric) {
        return biometricInfo?.instructions || 'Waiting for biometric authentication...';
      }
      if (fetchingLocation) {
        return 'Getting your precise location...';
      }
      return 'Processing your attendance...';
    }
    
    if (biometricAvailable) {
      return `Uses ${biometricInfo?.typeName?.toLowerCase()} + real-time GPS location`;
    }
    
    return 'Uses your device\'s real-time GPS location';
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleCloseModal}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>

          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>MARK ATTENDANCE</Text>
            <TouchableOpacity
              onPress={handleCloseModal}
              style={styles.closeButton}
              disabled={isBusy}
            >
              <Ionicons name="close" size={24} color={isBusy ? '#CCC' : '#666'} />
            </TouchableOpacity>
          </View>

          {/* Biometric Status */}
          {biometricAvailable && biometricInfo && (
            <View style={styles.biometricSection}>
              <View style={styles.biometricBadge}>
                <Text style={styles.biometricText}>
                  {biometricInfo.icon} {biometricInfo.typeName} Available
                </Text>
              </View>
              <Text style={styles.biometricInstructions}>
                {biometricInfo.instructions}
              </Text>
            </View>
          )}

          {/* Status Icon */}
          <View style={styles.iconContainer}>
            <Ionicons
              name={getStatusIcon()}
              size={70}
              color={getStatusColor()}
              style={isBusy ? styles.rotatingIcon : {}}
            />
            {isBusy && (
              <ActivityIndicator
                size="large"
                color={getStatusColor()}
                style={styles.iconActivity}
              />
            )}
          </View>

          {/* Status Display */}
          <View style={styles.statusContainer}>
            <Text style={[styles.statusText, { color: getStatusColor() }]}>
              {locationStatus || (biometricAvailable ? 'Ready for biometric authentication' : 'Ready to mark attendance')}
            </Text>

            {attemptCount > 0 && (
              <Text style={styles.attemptText}>
                Attempt: {attemptCount}
              </Text>
            )}
          </View>

          {/* Location Details */}
          {location && (
            <View style={styles.locationDetails}>
              <Text style={styles.detailTitle}>Current Location:</Text>
              <View style={styles.coordinates}>
                <Text style={styles.coordinateText}>
                  📍 Lat: <Text style={styles.coordinateValue}>{location.lat.toFixed(6)}</Text>
                </Text>
                <Text style={styles.coordinateText}>
                  📍 Lng: <Text style={styles.coordinateValue}>{location.lng.toFixed(6)}</Text>
                </Text>
              </View>
            </View>
          )}

          {/* Action Buttons */}
          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={[
                styles.inButton,
                isBusy && styles.disabledButton
              ]}
              onPress={() => handleMarkAttendance(0)}
              disabled={isBusy}
            >
              {isBusy ? (
                <View style={styles.buttonContent}>
                  <ActivityIndicator size="small" color="#fff" />
                  <Text style={styles.inText}>
                    {getButtonText()}
                  </Text>
                </View>
              ) : (
                <View style={styles.buttonContent}>
                  {biometricAvailable ? (
                    <Ionicons 
                      name={biometricInfo?.type === 'FaceID' ? 'scan-circle' : 'finger-print'} 
                      size={20} 
                      color="#fff" 
                    />
                  ) : (
                    <Ionicons name="location" size={20} color="#fff" />
                  )}
                  <Text style={styles.inText}>
                    {getButtonText()}
                  </Text>
                </View>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.outButton,
                isBusy && styles.disabledButton
              ]}
              onPress={handleCloseModal}
              disabled={isBusy}
            >
              <Text style={styles.outText}>Cancel</Text>
            </TouchableOpacity>
          </View>

          {/* Help Text */}
          <Text style={styles.helpText}>
            {getHelpText()}
          </Text>

          {/* Additional Info for Biometric */}
          {biometricAvailable && !isBusy && (
            <Text style={styles.additionalInfo}>
              {biometricInfo?.type === 'Biometrics' 
                ? '📍 Fingerprint sensor location: Check back, front, or power button'
                : 'Make sure your fingerprint/face is registered in device settings'
              }
            </Text>
          )}
        </View>
      </View>
    </Modal>
  );
};

export default AttendanceModal;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: '#000000AA',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContainer: {
    width: width * 0.9,
    maxWidth: 400,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    paddingVertical: 25,
    paddingHorizontal: 20,
    alignItems: 'center',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.25,
    shadowRadius: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginBottom: 15,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
    textAlign: 'center',
  },
  closeButton: {
    padding: 4,
    borderRadius: 20,
  },
  biometricSection: {
    alignItems: 'center',
    marginBottom: 15,
    width: '100%',
  },
  biometricBadge: {
    backgroundColor: '#E8F5E8',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#4CAF50',
  },
  biometricText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#2E7D32',
  },
  biometricInstructions: {
    fontSize: 11,
    color: '#666',
    textAlign: 'center',
    fontStyle: 'italic',
    paddingHorizontal: 10,
  },
  iconContainer: {
    position: 'relative',
    marginBottom: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rotatingIcon: {
    transform: [{ rotate: '0deg' }],
  },
  iconActivity: {
    position: 'absolute',
  },
  statusContainer: {
    alignItems: 'center',
    marginBottom: 20,
    minHeight: 60,
    justifyContent: 'center',
    width: '100%',
  },
  statusText: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 5,
    lineHeight: 22,
  },
  attemptText: {
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
  },
  locationDetails: {
    backgroundColor: '#F8F9FA',
    padding: 15,
    borderRadius: 12,
    marginBottom: 20,
    width: '100%',
    borderLeftWidth: 4,
    borderLeftColor: '#075E4D',
  },
  detailTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  coordinates: {
    marginLeft: 5,
  },
  coordinateText: {
    fontSize: 13,
    color: '#555',
    marginBottom: 4,
    fontFamily: 'System',
  },
  coordinateValue: {
    fontWeight: '700',
    color: '#075E4D',
    fontFamily: 'monospace',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 15,
  },
  inButton: {
    backgroundColor: '#075E4D',
    borderRadius: 30,
    paddingVertical: 12,
    paddingHorizontal: 25,
    flex: 1,
    marginRight: 10,
    minHeight: 50,
    justifyContent: 'center',
  },
  outButton: {
    borderColor: '#666',
    borderWidth: 1.5,
    borderRadius: 30,
    paddingVertical: 12,
    paddingHorizontal: 25,
    flex: 1,
    marginLeft: 10,
    minHeight: 50,
    justifyContent: 'center',
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  inText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
    marginLeft: 8,
  },
  outText: {
    color: '#666',
    fontWeight: '600',
    fontSize: 16,
    textAlign: 'center',
  },
  disabledButton: {
    opacity: 0.6,
  },
  helpText: {
    fontSize: 12,
    color: '#888',
    textAlign: 'center',
    fontStyle: 'italic',
    marginTop: 5,
  },
  additionalInfo: {
    fontSize: 10,
    color: '#999',
    textAlign: 'center',
    marginTop: 8,
    fontStyle: 'italic',
  },
});