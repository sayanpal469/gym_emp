import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { isWithinRadius } from '../utils/distanceUtils';
import { useSelector } from 'react-redux';
import { RootState } from '../redux/store';
import { useAttendance } from '../hooks/useAttendance';
import Toast from 'react-native-toast-message';
import { getLocationManually, Coordinates } from '../utils/locationUtilis';

const { width } = Dimensions.get('window');

interface Props {
  visible: boolean;
  onClose: () => void;
}

const AttendanceModal: React.FC<Props> = ({ visible, onClose }) => {
  const [location, setLocation] = useState<Coordinates | null>(null);
  const [fetchingLocation, setFetchingLocation] = useState(false);
  const { branches, userId } = useSelector((state: RootState) => state.auth);
  const { giveAttendance, loading } = useAttendance();

  const getCurrentDate = (): string => {
    const now = new Date();
    return now.toISOString().split('T')[0]; // YYYY-MM-DD
  };

  const getCurrentTime = (): string => {
    const now = new Date();
    return now.toTimeString().split(' ')[0]; // HH:mm:ss
  };

  const handleCheckLocation = async () => {
    try {
      setFetchingLocation(true);
      const currentLoc = await getLocationManually(); // Set to false for dummy
      setFetchingLocation(false);

      if (!currentLoc) return;

      setLocation(currentLoc);

      const isNearby = branches.some(branch =>
        isWithinRadius(
          currentLoc,
          { lat: parseFloat(branch.lat), lng: parseFloat(branch.lng) },
          100
        )
      );

      if (isNearby) {
        const payload = {
          emp_id: userId,
          lat: currentLoc.lat,
          lng: currentLoc.lng,
          date: getCurrentDate(),
          time: getCurrentTime(),
          type: 'in',
        };

        const result = await giveAttendance(payload);

        if (result.success) {
          Toast.show({
            type: 'success',
            text1: 'Success',
            text2: 'Your attendance has been marked.',
          });
          onClose();
        } else {
          Toast.show({
            type: 'error',
            text1: 'Failed',
            text2: 'Could not mark attendance.',
          });
        }
      } else {
        Toast.show({
          type: 'info',
          text1: 'Too Far',
          text2: 'You are not within 100 meters of any branch.',
        });
        onClose()
      }
    } catch (error) {
      setFetchingLocation(false);
      console.error('Attendance error:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Something went wrong while checking location.',
      });
    }
  };

  const isBusy = fetchingLocation || loading;

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <Text style={styles.title}>ATTENDANCE</Text>

          <Ionicons name="finger-print" size={60} color="#000" style={styles.icon} />

          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={[styles.inButton, isBusy && styles.disabledButton]}
              onPress={handleCheckLocation}
              disabled={isBusy}
            >
              {isBusy ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.inText}>In</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.outButton, isBusy && styles.disabledButton]}
              onPress={onClose}
              disabled={isBusy}
            >
              <Text style={styles.outText}>Out</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default AttendanceModal;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: '#000000aa',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: width * 0.85,
    backgroundColor: '#fff',
    borderRadius: 24,
    paddingVertical: 30,
    paddingHorizontal: 20,
    alignItems: 'center',
    elevation: 10,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  icon: {
    marginBottom: 20,
  },
  buttonRow: {
    flexDirection: 'row',
    marginTop: 10,
  },
  inButton: {
    backgroundColor: '#075E4D',
    borderRadius: 30,
    paddingVertical: 10,
    paddingHorizontal: 30,
    marginRight: 10,
  },
  outButton: {
    borderColor: '#000',
    borderWidth: 1.5,
    borderRadius: 30,
    paddingVertical: 10,
    paddingHorizontal: 30,
  },
  inText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  outText: {
    color: '#000',
    fontWeight: '600',
    fontSize: 16,
  },
  disabledButton: {
    opacity: 0.6,
  },
});
