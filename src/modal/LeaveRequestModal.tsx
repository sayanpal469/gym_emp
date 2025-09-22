import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Modal,
  TextInput,
  Alert,
} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { useAttendance } from '../hooks/useAttendance';
import Toast from 'react-native-toast-message';
import { useSelector } from 'react-redux';
import { RootState } from '../redux/store';

interface LeaveRequestModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: (newLeave: any) => void;
}

const LeaveRequestModal: React.FC<LeaveRequestModalProps> = ({
  visible,
  onClose,
  onSuccess,
}) => {
  const { requestLeave, loading } = useAttendance();
  const { userId } = useSelector((state: RootState) => state.auth);

  // Form state
  const [reason, setReason] = useState('');
  const [description, setDescription] = useState('');
  const [leaveFor, setLeaveFor] = useState('');
  const [reqDate, setReqDate] = useState('');

  // Form validation states
  const [errors, setErrors] = useState({
    reason: '',
    description: '',
    leaveFor: '',
    reqDate: '',
  });

  const validateForm = () => {
    const newErrors = {
      reason: '',
      description: '',
      leaveFor: '',
      reqDate: '',
    };

    let isValid = true;

    // Validate reason
    if (!reason.trim()) {
      newErrors.reason = 'Reason is required';
      isValid = false;
    }

    // Validate description
    if (!description.trim()) {
      newErrors.description = 'Description is required';
      isValid = false;
    }

    // Validate leave duration
    if (!leaveFor.trim()) {
      newErrors.leaveFor = 'Leave duration is required';
      isValid = false;
    } else if (isNaN(Number(leaveFor)) || Number(leaveFor) <= 0) {
      newErrors.leaveFor = 'Please enter a valid number of days';
      isValid = false;
    } else if (Number(leaveFor) > 365) {
      newErrors.leaveFor = 'Leave duration cannot exceed 365 days';
      isValid = false;
    }

    // Validate date format
    if (!reqDate.trim()) {
      newErrors.reqDate = 'Request date is required';
      isValid = false;
    } else {
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!dateRegex.test(reqDate)) {
        newErrors.reqDate = 'Please use YYYY-MM-DD format';
        isValid = false;
      } else {
        const date = new Date(reqDate);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        if (isNaN(date.getTime())) {
          newErrors.reqDate = 'Please enter a valid date';
          isValid = false;
        } else if (date < today) {
          newErrors.reqDate = 'Request date cannot be in the past';
          isValid = false;
        }
      }
    }

    setErrors(newErrors);
    return isValid;
  };

  const resetForm = () => {
    setReason('');
    setDescription('');
    setLeaveFor('');
    setReqDate('');
    setErrors({
      reason: '',
      description: '',
      leaveFor: '',
      reqDate: '',
    });
  };

  const handleLeaveSubmit = async () => {
    if (!validateForm()) {
      Toast.show({ 
        type: 'error', 
        text1: 'Validation Error', 
        text2: 'Please correct the errors and try again' 
      });
      return;
    }

    // Show confirmation dialog
    Alert.alert(
      'Confirm Leave Request',
      `Submit leave request for ${leaveFor} day(s) starting from ${reqDate}?`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Submit',
          onPress: async () => {
            const payload = {
              emp_id: userId,
              reason: reason.trim(),
              description: description.trim(),
              leave_for: Number(leaveFor),
              req_dt: reqDate,
            };

            try {
              const res = await requestLeave(payload);

              if (res.success) {
                // Create new leave object for local state
                const newLeave = {
                  id: Date.now(), // Temporary ID
                  emp_id: userId,
                  reason: reason.trim(),
                  description: description.trim(),
                  leave_for: Number(leaveFor),
                  req_dt: reqDate,
                  status: 0, // Pending status
                  status_name: 'Pending',
                };
                
                onSuccess(newLeave);
                resetForm();
                onClose();
                
                Toast.show({
                  type: 'success',
                  text1: 'Success',
                  text2: 'Leave request submitted successfully',
                });
              }
            } catch (error) {
              console.error('Error submitting leave request:', error);
              Toast.show({
                type: 'error',
                text1: 'Error',
                text2: 'Failed to submit leave request',
              });
            }
          },
        },
      ]
    );
  };

  const handleModalClose = () => {
    if (reason || description || leaveFor || reqDate) {
      Alert.alert(
        'Discard Changes?',
        'You have unsaved changes. Are you sure you want to close?',
        [
          {
            text: 'Continue Editing',
            style: 'cancel',
          },
          {
            text: 'Discard',
            style: 'destructive',
            onPress: () => {
              resetForm();
              onClose();
            },
          },
        ]
      );
    } else {
      onClose();
    }
  };

  const formatDateForInput = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={handleModalClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.sheetContainer}>
          {/* Drag Handle */}
          <View style={styles.dragHandle} />

          {/* Header */}
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={handleModalClose}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>New Leave Request</Text>
            <TouchableOpacity 
              onPress={handleLeaveSubmit}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#075E4D" />
              ) : (
                <Text style={styles.submitText}>Submit</Text>
              )}
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Reason */}
            <View style={styles.field}>
              <Text style={styles.label}>Reason *</Text>
              <TextInput
                style={[styles.input, errors.reason && styles.inputError]}
                value={reason}
                onChangeText={(text) => {
                  setReason(text);
                  if (errors.reason) {
                    setErrors(prev => ({ ...prev, reason: '' }));
                  }
                }}
                placeholder="Enter reason (e.g., Medical, Personal, Travel)"
                placeholderTextColor="#aaa"
                editable={!loading}
              />
              {errors.reason && <Text style={styles.errorText}>{errors.reason}</Text>}
            </View>

            {/* Description */}
            <View style={styles.field}>
              <Text style={styles.label}>Description *</Text>
              <TextInput
                style={[styles.input, { height: 90, textAlignVertical: 'top' }, errors.description && styles.inputError]}
                value={description}
                onChangeText={(text) => {
                  setDescription(text);
                  if (errors.description) {
                    setErrors(prev => ({ ...prev, description: '' }));
                  }
                }}
                placeholder="Provide detailed description"
                placeholderTextColor="#aaa"
                multiline
                numberOfLines={4}
                editable={!loading}
              />
              {errors.description && <Text style={styles.errorText}>{errors.description}</Text>}
            </View>

            {/* Leave For */}
            <View style={styles.field}>
              <Text style={styles.label}>Leave For (days) *</Text>
              <TextInput
                style={[styles.input, errors.leaveFor && styles.inputError]}
                value={leaveFor}
                onChangeText={(text) => {
                  // Only allow numeric input
                  const numericText = text.replace(/[^0-9]/g, '');
                  setLeaveFor(numericText);
                  if (errors.leaveFor) {
                    setErrors(prev => ({ ...prev, leaveFor: '' }));
                  }
                }}
                placeholder="e.g. 3"
                placeholderTextColor="#aaa"
                keyboardType="numeric"
                maxLength={3}
                editable={!loading}
              />
              {errors.leaveFor && <Text style={styles.errorText}>{errors.leaveFor}</Text>}
            </View>

            {/* Request Date */}
            <View style={styles.field}>
              <Text style={styles.label}>Request Date *</Text>
              <View style={styles.dateInputContainer}>
                <TextInput
                  style={[styles.input, styles.dateInput, errors.reqDate && styles.inputError]}
                  value={reqDate}
                  onChangeText={(text) => {
                    setReqDate(text);
                    if (errors.reqDate) {
                      setErrors(prev => ({ ...prev, reqDate: '' }));
                    }
                  }}
                  placeholder="YYYY-MM-DD"
                  placeholderTextColor="#aaa"
                  editable={!loading}
                />
                <TouchableOpacity
                  style={styles.todayButton}
                  onPress={() => setReqDate(formatDateForInput())}
                  disabled={loading}
                >
                  <Text style={styles.todayButtonText}>Today</Text>
                </TouchableOpacity>
              </View>
              {errors.reqDate && <Text style={styles.errorText}>{errors.reqDate}</Text>}
              <Text style={styles.helperText}>Select the date when you want to start your leave</Text>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'flex-end',
  },

  sheetContainer: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 14,
    paddingHorizontal: 20,
    paddingBottom: 38,
    maxHeight: '88%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 10,
  },

  dragHandle: {
    width: 60,
    height: 6,
    backgroundColor: '#e0e0e0',
    borderRadius: 3,
    alignSelf: 'center',
    marginBottom: 14,
  },

  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },

  cancelText: {
    color: '#777',
    fontWeight: '600',
    fontSize: 15,
    paddingHorizontal: 8,
  },

  submitText: {
    color: '#075E4D',
    fontWeight: '700',
    fontSize: 15,
    paddingHorizontal: 8,
  },

  modalTitle: {
    fontSize: 17,
    fontWeight: '700',
    textAlign: 'center',
    flex: 1,
    color: '#222',
  },

  field: {
    marginBottom: 18,
  },

  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#666',
    marginBottom: 6,
    marginLeft: 2,
  },

  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    backgroundColor: '#fafafa',
    color: '#222',
    shadowColor: '#000',
    shadowOpacity: 0.03,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 2,
  },

  inputError: {
    borderColor: '#ff6b6b',
    backgroundColor: '#ffeaea',
  },

  errorText: {
    color: '#ff6b6b',
    fontSize: 12,
    marginTop: 4,
    marginLeft: 2,
  },

  helperText: {
    color: '#999',
    fontSize: 11,
    marginTop: 4,
    marginLeft: 2,
  },

  dateInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  dateInput: {
    flex: 1,
    marginRight: 10,
  },

  todayButton: {
    backgroundColor: '#075E4D',
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRadius: 8,
  },

  todayButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
});

export default LeaveRequestModal;