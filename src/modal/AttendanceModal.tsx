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
  Platform,
  ScrollView,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useSelector } from 'react-redux';
import { RootState } from '../redux/store';
import { useAttendance } from '../hooks/useAttendance';
import Toast from 'react-native-toast-message';
import { getLocationManually, Coordinates, isWithinAllowedDistance, Branch } from '../utils/locationUtilis';

const { width, height } = Dimensions.get('window');

interface Props {
  visible: boolean;
  onClose: () => void;
}

// Custom Modal Types
type CustomModalType = 'branch-selection' | 'navigation-options' | null;

const AttendanceModal: React.FC<Props> = ({ visible, onClose }) => {
  const [location, setLocation] = useState<Coordinates | null>(null);
  const [fetchingLocation, setFetchingLocation] = useState(false);
  const [locationStatus, setLocationStatus] = useState<string>('');
  const [attemptCount, setAttemptCount] = useState(0);
  const { userId, branches } = useSelector((state: RootState) => state.auth);
  const { giveAttendance, loading } = useAttendance();

  // Custom Modal States
  const [customModalVisible, setCustomModalVisible] = useState(false);
  const [customModalType, setCustomModalType] = useState<CustomModalType>(null);
  const [selectedBranch, setSelectedBranch] = useState<Branch | null>(null);

  console.log("::::::::::::::::::::Branches Data", branches);

  // Reset states when modal opens
  useEffect(() => {
    if (visible) {
      setLocation(null);
      setLocationStatus('');
      setAttemptCount(0);
      setCustomModalVisible(false);
      setCustomModalType(null);
      setSelectedBranch(null);
    }
  }, [visible]);

  const getCurrentDate = (): string => {
    const now = new Date();
    return now.toISOString().split('T')[0]; // YYYY-MM-DD
  };

  const getCurrentTime = (): string => {
    const now = new Date();
    return now.toTimeString().split(' ')[0]; // HH:mm:ss
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

  // ✅ FIXED: Proper Google Maps Directions function
  const openBranchWithDirections = async (branch: Branch, travelMode: string = 'driving') => {
    try {
      console.log('📍 Opening directions to branch:', branch.name, 'Mode:', travelMode);

      // Close custom modal first
      setCustomModalVisible(false);
      setCustomModalType(null);

      // Get current location for directions
      let currentLoc: Coordinates | null = null;
      try {
        currentLoc = await getLocationManually();
        console.log('📍 Current location for directions:', currentLoc);
      } catch (locationError) {
        console.log('📍 Could not get current location, using device location');
      }

      // Different URL formats for different scenarios
      let url = '';

      if (currentLoc) {
        // ✅ PROPER Google Maps Directions URL with origin and destination
        if (Platform.OS === 'ios') {
          // Apple Maps with travel mode
          const dirflg = travelMode === 'walking' ? 'w' : 
                        travelMode === 'transit' ? 'r' : 'd';
          url = `http://maps.apple.com/?saddr=${currentLoc.lat},${currentLoc.lng}&daddr=${branch.lat},${branch.lng}&dirflg=${dirflg}`;
        } else {
          // Google Maps with proper directions parameters
          url = `https://www.google.com/maps/dir/?api=1&origin=${currentLoc.lat},${currentLoc.lng}&destination=${branch.lat},${branch.lng}&travelmode=${travelMode}&dir_action=navigate`;
        }
      } else {
        // Fallback: Direct navigation to destination
        if (Platform.OS === 'ios') {
          url = `http://maps.apple.com/?q=${branch.lat},${branch.lng}&z=15&t=m`;
        } else {
          url = `https://www.google.com/maps/dir/?api=1&destination=${branch.lat},${branch.lng}&travelmode=${travelMode}&dir_action=navigate`;
        }
      }

      console.log('🗺️ Opening maps URL:', url);

      // Check if URL can be opened
      const canOpen = await Linking.canOpenURL(url);
      if (canOpen) {
        await Linking.openURL(url);
        console.log('✅ Successfully opened maps with directions');
      } else {
        // Fallback to simple search
        const fallbackUrl = Platform.OS === 'ios' 
          ? `http://maps.apple.com/?q=${encodeURIComponent(branch.name)}&ll=${branch.lat},${branch.lng}`
          : `https://www.google.com/maps/search/?api=1&query=${branch.lat},${branch.lng}`;
        
        await Linking.openURL(fallbackUrl);
      }

    } catch (error) {
      console.error('❌ Error opening maps with directions:', error);
      
      // Ultimate fallback
      Alert.alert(
        'Open Maps for Directions',
        `Please open maps app and search for:\n"${branch.name}"\n\nOr use coordinates:\n📍 ${branch.lat}, ${branch.lng}`,
        [
          {
            text: 'Open Google Maps',
            onPress: () => Linking.openURL('https://maps.google.com')
          },
          {
            text: 'Open Apple Maps',
            onPress: () => Linking.openURL('http://maps.apple.com')
          },
          { text: 'OK', style: 'cancel' }
        ]
      );
    }
  };

  // ✅ STEP 1: Show branch selection using Custom Modal
  const showBranchSelection = () => {
    if (!branches || branches.length === 0) {
      Alert.alert('No Branches', 'No branch locations available.');
      return;
    }

    console.log('🔵 Opening branch selection modal');
    setCustomModalType('branch-selection');
    setCustomModalVisible(true);
  };

  // ✅ STEP 2: Show navigation options using Custom Modal
  const showNavigationOptions = (branch: Branch) => {
    console.log('🔵 Opening navigation options for branch:', branch.name);
    setSelectedBranch(branch);
    setCustomModalType('navigation-options');
    setCustomModalVisible(true);
  };

  // ✅ Handle branch selection from custom modal
  const handleBranchSelect = (branch: Branch) => {
    console.log('🔵 Branch selected:', branch.name);
    showNavigationOptions(branch);
  };

  // ✅ Simple map view without directions
  const openBranchOnMap = async (branch: Branch) => {
    try {
      setCustomModalVisible(false);
      setCustomModalType(null);

      const url = Platform.OS === 'ios'
        ? `http://maps.apple.com/?q=${branch.lat},${branch.lng}&z=15`
        : `https://www.google.com/maps/?q=${branch.lat},${branch.lng}`;
      
      await Linking.openURL(url);
    } catch (error) {
      console.error('Error opening branch on map:', error);
    }
  };

  // ✅ Main function to show branches list
  const showBranchesList = () => {
    if (!branches || branches.length === 0) {
      Alert.alert('No Branches', 'No branch locations available.');
      return;
    }

    console.log('🔵 Show branches list called. Branch count:', branches.length);

    // If only one branch, directly show navigation options
    if (branches.length === 1) {
      console.log('🔵 Only one branch, showing navigation options directly');
      showNavigationOptions(branches[0]);
      return;
    }

    // If multiple branches, show branch selection first
    console.log('🔵 Multiple branches, showing branch selection');
    showBranchSelection();
  };

  // ✅ Quick directions to nearest branch
  const openDirectionsToNearestBranch = async () => {
    if (!location || !branches || branches.length === 0) return;

    try {
      const distanceCheck = isWithinAllowedDistance(location, branches, 100);
      if (distanceCheck.nearestBranch) {
        await openBranchWithDirections(distanceCheck.nearestBranch, 'driving');
      }
    } catch (error) {
      console.error('Error opening directions to nearest branch:', error);
    }
  };

  // ✅ Custom Modal Component - FIXED
  const renderCustomModal = () => {
    return (
      <Modal
        visible={customModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => {
          setCustomModalVisible(false);
          setCustomModalType(null);
        }}
        statusBarTranslucent
      >
        <TouchableOpacity 
          style={styles.customModalOverlay}
          activeOpacity={1}
          onPress={() => {
            setCustomModalVisible(false);
            setCustomModalType(null);
          }}
        >
          <TouchableOpacity 
            activeOpacity={1} 
            style={styles.customModalContainer}
            onPress={(e) => e.stopPropagation()}
          >
            
            {/* Header */}
            <View style={styles.customModalHeader}>
              <Text style={styles.customModalTitle}>
                {customModalType === 'branch-selection' 
                  ? 'Select Your Branch' 
                  : `Navigation to ${selectedBranch?.name}`}
              </Text>
              <TouchableOpacity
                onPress={() => {
                  setCustomModalVisible(false);
                  setCustomModalType(null);
                }}
                style={styles.customModalCloseButton}
              >
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            {/* Content */}
            <ScrollView style={styles.customModalContent}>
              {customModalType === 'branch-selection' && (
                <View style={styles.branchList}>
                  <Text style={styles.customModalSubtitle}>
                    Choose your branch location:
                  </Text>
                  {branches?.map((branch, index) => (
                    <TouchableOpacity
                      key={index}
                      style={styles.branchItem}
                      onPress={() => handleBranchSelect(branch)}
                    >
                      <Ionicons name="business" size={20} color="#075E4D" />
                      <Text style={styles.branchName}>{branch.name}</Text>
                      <Ionicons name="chevron-forward" size={16} color="#999" />
                    </TouchableOpacity>
                  ))}
                </View>
              )}

              {customModalType === 'navigation-options' && selectedBranch && (
                <View style={styles.navigationOptions}>
                  <Text style={styles.customModalSubtitle}>
                    Choose your travel mode to {selectedBranch.name}:
                  </Text>
                  
                  <TouchableOpacity
                    style={styles.navOption}
                    onPress={() => openBranchWithDirections(selectedBranch, 'driving')}
                  >
                    <Ionicons name="car" size={24} color="#075E4D" />
                    <View style={styles.navOptionText}>
                      <Text style={styles.navOptionTitle}>Driving</Text>
                      <Text style={styles.navOptionSubtitle}>Get driving directions</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={16} color="#999" />
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.navOption}
                    onPress={() => openBranchWithDirections(selectedBranch, 'walking')}
                  >
                    <Ionicons name="walk" size={24} color="#075E4D" />
                    <View style={styles.navOptionText}>
                      <Text style={styles.navOptionTitle}>Walking</Text>
                      <Text style={styles.navOptionSubtitle}>Get walking directions</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={16} color="#999" />
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.navOption}
                    onPress={() => openBranchWithDirections(selectedBranch, 'transit')}
                  >
                    <Ionicons name="bus" size={24} color="#075E4D" />
                    <View style={styles.navOptionText}>
                      <Text style={styles.navOptionTitle}>Public Transit</Text>
                      <Text style={styles.navOptionSubtitle}>Get transit directions</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={16} color="#999" />
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.navOption}
                    onPress={() => openBranchOnMap(selectedBranch)}
                  >
                    <Ionicons name="map" size={24} color="#075E4D" />
                    <View style={styles.navOptionText}>
                      <Text style={styles.navOptionTitle}>View on Map</Text>
                      <Text style={styles.navOptionSubtitle}>Open in maps without directions</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={16} color="#999" />
                  </TouchableOpacity>

                  {branches && branches.length > 1 && (
                    <TouchableOpacity
                      style={styles.backButton}
                      onPress={showBranchSelection}
                    >
                      <Ionicons name="arrow-back" size={20} color="#666" />
                      <Text style={styles.backButtonText}>Back to Branches</Text>
                    </TouchableOpacity>
                  )}
                </View>
              )}
            </ScrollView>

          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    );
  };

  const handleMarkAttendance = async (retryCount = 0) => {
    try {
      setFetchingLocation(true);
      setAttemptCount(prev => prev + 1);
      setLocationStatus('Getting your location... 📍');

      // Vibration for starting process
      vibrateProcessing();

      console.log(`📍 Attempt ${attemptCount + 1}: Fetching real location`);

      const currentLoc = await getLocationManually();

      setFetchingLocation(false);

      if (!currentLoc) {
        setLocationStatus('Location not available ❌');
        vibrateError();

        if (retryCount < 2) {
          // Auto-retry with delay
          setTimeout(() => {
            setLocationStatus(`Retrying... (${retryCount + 1}/3)`);
            handleMarkAttendance(retryCount + 1);
          }, 2000);
          return;
        }

        // Final failure after 3 attempts
        setLocationStatus('Failed to get location after 3 attempts');
        Alert.alert(
          'Location Error',
          'Unable to detect your current location.\n\nPlease make sure to:\n\n• Enable location access for this app\n• Turn on GPS from the navigation bar\n• Ensure your internet connection is active\n• If the issue persists, close the app completely and reopen it in an open area',
          [{ text: 'OK', style: 'default' }]
        );

        return;
      }

      setLocation(currentLoc);
      
      // ✅ Check if within 100 meters of any branch
      const distanceCheck = isWithinAllowedDistance(currentLoc, branches || [], 100);
      
      if (!distanceCheck.isWithin) {
        setLocationStatus('Too far from branch! ❌');
        vibrateError();
        
        Alert.alert(
          'Location Restriction',
          `You are ${distanceCheck.distance.toFixed(0)} meters away from ${distanceCheck.nearestBranch?.name}.\n\nPlease come within 100 meters of any branch.`,
          [
            { 
              text: '🚗 Get Directions to Nearest', 
              onPress: () => distanceCheck.nearestBranch && openDirectionsToNearestBranch()
            },
            { 
              text: '📋 Select Branch & Get Directions', 
              onPress: showBranchesList
            },
            { text: 'OK', style: 'cancel' }
          ]
        );
        
        return;
      }

      setLocationStatus('Location verified! Sending attendance... 📤');

      console.log('📍 Real location obtained:', currentLoc);
      console.log('📍 Distance to nearest branch:', distanceCheck.distance.toFixed(2), 'meters');

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
      console.log('🔥 Attendance API result:', result);

      if (result.success) {
        setLocationStatus('Attendance marked successfully! ✅');
        vibrateSuccess();

        Toast.show({
          type: 'success',
          text1: 'Attendance Recorded',
          text2: `Your attendance has been successfully marked at ${distanceCheck.nearestBranch?.name}.`,
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
          text2: 'Could not mark attendance. Please try again.',
          visibilityTime: 3000,
        });
      }

    } catch (error) {
      setFetchingLocation(false);
      setLocationStatus('Error occurred ⚠️');
      vibrateError();

      console.error('❌ Attendance process error:', error);

      Toast.show({
        type: 'error',
        text1: 'Process Error',
        text2: 'Something went wrong. Please try again.',
        visibilityTime: 3000,
      });
    }
  };

  const handleCloseModal = () => {
    if (!fetchingLocation && !loading) {
      onClose();
    }
  };

  const getStatusColor = () => {
    if (locationStatus.includes('success') || locationStatus.includes('✅')) return '#4CAF50';
    if (locationStatus.includes('failed') || locationStatus.includes('❌') || locationStatus.includes('Error')) return '#F44336';
    if (locationStatus.includes('found') || locationStatus.includes('📍')) return '#2196F3';
    return '#666';
  };

  const getStatusIcon = () => {
    if (locationStatus.includes('success')) return 'checkmark-circle';
    if (locationStatus.includes('failed') || locationStatus.includes('Error')) return 'close-circle';
    if (locationStatus.includes('found')) return 'location';
    if (fetchingLocation) return 'refresh-circle';
    return 'time';
  };

  const isBusy = fetchingLocation || loading;

  return (
    <>
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
                {locationStatus || 'Ready to mark attendance'}
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
                  
                  {/* Show distance to nearest branch */}
                  {(() => {
                    const distanceCheck = isWithinAllowedDistance(location, branches || [], 100);
                    return (
                      <View>
                        <Text style={[
                          styles.distanceText, 
                          { color: distanceCheck.isWithin ? '#4CAF50' : '#F44336' }
                        ]}>
                          📍 Distance: {distanceCheck.distance.toFixed(0)} meters 
                          {distanceCheck.nearestBranch && ` from ${distanceCheck.nearestBranch.name}`}
                          {distanceCheck.isWithin ? ' ✅' : ' ❌'}
                        </Text>
                        
                        {/* Show directions button */}
                        <TouchableOpacity 
                          style={styles.branchesButton}
                          onPress={showBranchesList}
                        >
                          <Ionicons name="navigate-outline" size={16} color="#075E4D" />
                          <Text style={styles.branchesButtonText}>
                            {branches && branches.length > 1 ? 'Select Branch & Get Directions' : 'Get Directions'}
                          </Text>
                        </TouchableOpacity>
                      </View>
                    );
                  })()}
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
                    <Text style={styles.inText}>Processing...</Text>
                  </View>
                ) : (
                  <View style={styles.buttonContent}>
                    <Ionicons name="finger-print" size={20} color="#fff" />
                    <Text style={styles.inText}>Mark In</Text>
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
              {isBusy
                ? 'Please wait while we get your location...'
                : 'Must be within 100 meters of any branch to mark attendance'
              }
            </Text>

            {/* Branches Quick Access */}
            {!isBusy && (
              <TouchableOpacity 
                style={styles.quickMapButton}
                onPress={showBranchesList}
              >
                <Ionicons name="navigate" size={18} color="#075E4D" />
                <Text style={styles.quickMapButtonText}>
                  {branches && branches.length > 1 ? 'Select Branch & Get Directions' : 'Get Directions with Travel Time'}
                </Text>
              </TouchableOpacity>
            )}

          </View>
        </View>
      </Modal>

      {/* Custom Modal for Branch Selection and Navigation Options */}
      {renderCustomModal()}
    </>
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
    marginBottom: 20,
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
  distanceText: {
    fontSize: 13,
    fontWeight: '600',
    marginTop: 8,
    fontFamily: 'System',
  },
  branchesButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    padding: 8,
    backgroundColor: '#E8F5E8',
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  branchesButtonText: {
    fontSize: 12,
    color: '#075E4D',
    fontWeight: '600',
    marginLeft: 6,
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
  quickMapButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    padding: 10,
    backgroundColor: '#F0F8FF',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#075E4D',
  },
  quickMapButtonText: {
    fontSize: 12,
    color: '#075E4D',
    fontWeight: '600',
    marginLeft: 8,
  },

  // Custom Modal Styles - FIXED for proper rendering
  customModalOverlay: {
    flex: 1,
    backgroundColor: '#000000AA',
    justifyContent: 'flex-end',
  },
  customModalContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: height * 0.8,
    paddingBottom: Platform.OS === 'ios' ? 34 : 20,
    elevation: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  customModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  customModalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  customModalCloseButton: {
    padding: 4,
  },
  customModalContent: {
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  customModalSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 15,
    textAlign: 'center',
  },
  branchList: {
    marginBottom: 10,
  },
  branchItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 15,
    backgroundColor: '#F8F9FA',
    borderRadius: 10,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  branchName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    flex: 1,
    marginLeft: 10,
  },
  navigationOptions: {
    marginBottom: 10,
  },
  navOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 15,
    backgroundColor: '#F8F9FA',
    borderRadius: 10,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  navOptionText: {
    flex: 1,
    marginLeft: 12,
  },
  navOptionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  navOptionSubtitle: {
    fontSize: 12,
    color: '#666',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
  },
  backButtonText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '600',
    marginLeft: 8,
  },
});