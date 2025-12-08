import React, { useState, useEffect } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Dimensions,
  Modal,
  Animated,
  TouchableWithoutFeedback,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  ActivityIndicator,
  Alert,
  StatusBar,
} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Feather from 'react-native-vector-icons/Feather';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../redux/slices/authSlice';
import { authClient } from '../services/api.clients';
import { APIEndpoints } from '../services/api.endpoints';

const { height } = Dimensions.get('window');

interface ProfileData {
  first_name: string;
  last_name: string;
  email: string | null;
  phone: string;
  department: string;
  salary: number;
  join_date: string;
}

const Settings = ({ navigation }: any) => {
  const dispatch = useDispatch();
  const authState = useSelector((state: any) => state.auth);

  // State for profile data from API
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  
  // Get user initials from name
  const getUserInitials = (firstName: string, lastName: string) => {
    const first = firstName || '';
    const last = lastName || '';
    if (!first && !last) return 'JD';
    const firstInitial = first.charAt(0).toUpperCase();
    const lastInitial = last.charAt(0).toUpperCase();
    return (firstInitial + lastInitial) || firstInitial || 'JD';
  };

  // Fetch profile data from API
  const fetchProfileData = async () => {
    if (!authState.userId) {
      Alert.alert('Error', 'User ID not found');
      setIsLoadingProfile(false);
      return;
    }

    try {
      setIsLoadingProfile(true);
      const response = await authClient.get(APIEndpoints.getPofile, {
        params: {
          emp_id: authState.userId
        }
      });

      if (response.data.status === 'success') {
        setProfileData(response.data.profile);
      } else {
        Alert.alert('Error', 'Failed to load profile data');
      }
    } catch (error: any) {
      console.error('Fetch profile error:', error);
      Alert.alert('Error', 'Failed to load profile data');
    } finally {
      setIsLoadingProfile(false);
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchProfileData();
  }, [authState.userId]);

  // Form state
  const [userData, setUserData] = useState({
    name: '',
    email: '',
    phone: '',
  });

  // Update form data when profile is loaded
  useEffect(() => {
    if (profileData) {
      const fullName = `${profileData.first_name || ''} ${profileData.last_name || ''}`.trim();
      setUserData({
        name: fullName,
        email: profileData.email || '',
        phone: profileData.phone || '',
      });
    }
  }, [profileData]);

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [passwordVisibility, setPasswordVisibility] = useState({
    currentPassword: true,
    newPassword: true,
    confirmPassword: true,
  });

  const [isPasswordDrawerVisible, setPasswordDrawerVisible] = useState(false);
  const [drawerAnim] = useState(new Animated.Value(height));
  const [isSaving, setIsSaving] = useState(false);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({
    email: '',
    phone: '',
  });

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePhone = (phone: string) => {
    // Remove all non-digit characters
    const cleanedPhone = phone.replace(/\D/g, '');
    // Indian phone number validation (10 digits starting with 6-9)
    const phoneRegex = /^[6-9]\d{9}$/;
    return phoneRegex.test(cleanedPhone);
  };

  const togglePasswordVisibility = (field: keyof typeof passwordVisibility) => {
    setPasswordVisibility(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const openPasswordDrawer = () => {
    setPasswordDrawerVisible(true);
    Animated.timing(drawerAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  const closePasswordDrawer = () => {
    Animated.timing(drawerAnim, {
      toValue: height,
      duration: 250,
      useNativeDriver: true,
    }).start(() => {
      setPasswordDrawerVisible(false);
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
      setPasswordVisibility({
        currentPassword: true,
        newPassword: true,
        confirmPassword: true,
      });
    });
  };

  const validateForm = () => {
    const errors = {
      email: '',
      phone: '',
    };

    let isValid = true;

    // Validate email if provided
    if (userData.email && !validateEmail(userData.email)) {
      errors.email = 'Please enter a valid email address';
      isValid = false;
    }

    // Validate phone if provided
    if (userData.phone && !validatePhone(userData.phone)) {
      errors.phone = 'Please enter a valid phone number';
      isValid = false;
    }

    // Check if at least one field is being updated
    if (!userData.email && !userData.phone) {
      Alert.alert('No Changes', 'Please update either email or phone number');
      return false;
    }

    setFieldErrors(errors);
    return isValid;
  };

  const handleSaveProfile = async () => {
    if (!authState.userId) {
      Alert.alert('Error', 'User ID not found');
      return;
    }

    if (!validateForm()) {
      return;
    }

    setIsSaving(true);
    try {
      // Prepare payload according to API specification
      const payload: any = {
        employee_id: authState.userId,
      };

      let hasChanges = false;

      // Only include fields that have been changed
      if (userData.email && userData.email !== (profileData?.email || '')) {
        payload.email = userData.email;
        hasChanges = true;
      }

      if (userData.phone) {
        const cleanedPhone = userData.phone.replace(/\D/g, '');
        if (cleanedPhone && cleanedPhone !== (profileData?.phone || '')) {
          payload.phone = cleanedPhone;
          hasChanges = true;
        }
      }

      // Check if there are any changes
      if (!hasChanges) {
        Alert.alert('No Changes', 'No changes detected to save');
        setIsSaving(false);
        return;
      }

      console.log('Updating contact with payload:', payload);

      const response = await authClient.post(
        APIEndpoints.updateContact || '/update_employee_contact.php',
        payload
      );

      console.log('Update response:', response.data);

      if (response.data.status === true) {
        Alert.alert('Success', response.data.message || 'Profile updated successfully!');
        
        // Refresh profile data after successful update
        await fetchProfileData();
      } else {
        // Handle different error scenarios
        if (response.data.code === 409) {
          Alert.alert('Conflict', response.data.message || 'Email or phone already exists');
        } else if (response.data.code === 404) {
          Alert.alert('Not Found', response.data.message || 'Employee record not found');
        } else if (response.data.code === 400) {
          Alert.alert('Bad Request', response.data.message || 'Please check your input');
        } else {
          Alert.alert('Error', response.data.message || 'Failed to update profile');
        }
      }
    } catch (error: any) {
      console.error('Update contact error:', error);
      
      if (error.response) {
        console.error('Response data:', error.response.data);
        console.error('Response status:', error.response.status);
        
        if (error.response.status === 400) {
          Alert.alert('Bad Request', error.response.data?.message || 'Please check your input');
        } else if (error.response.status === 404) {
          Alert.alert('Not Found', error.response.data?.message || 'Employee record not found');
        } else if (error.response.status === 409) {
          Alert.alert('Conflict', error.response.data?.message || 'Email or phone already exists');
        } else if (error.response.status === 500) {
          Alert.alert('Server Error', 'Failed to update contact details. Please try again later.');
        } else {
          Alert.alert('Error', error.response.data?.message || 'Failed to update profile');
        }
      } else if (error.request) {
        Alert.alert('Network Error', 'No response from server. Please check your connection.');
      } else {
        Alert.alert('Error', 'Failed to update profile');
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleChangePassword = async () => {
    // Validate passwords
    if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
      Alert.alert('Error', 'Please fill all password fields');
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      Alert.alert('Error', "New passwords don't match");
      return;
    }

    if (passwordData.newPassword.length < 6) {
      Alert.alert('Error', "Password must be at least 6 characters");
      return;
    }

    if (!authState.userId) {
      Alert.alert('Error', 'User ID not found');
      return;
    }

    setIsUpdatingPassword(true);
    try {
      const payload = {
        employee_id: authState.userId,
        old_password: passwordData.currentPassword,
        new_password: passwordData.newPassword,
      };

      const response = await authClient.post(
        APIEndpoints.changePassword || '/change_password_employee.php',
        payload
      );

      if (response.data.status === true) {
        Alert.alert('Success', response.data.message || 'Password changed successfully!');
        closePasswordDrawer();
      } else {
        if (response.data.code === 401) {
          Alert.alert('Error', 'Incorrect current password');
        } else {
          Alert.alert('Error', response.data.message || 'Failed to change password');
        }
      }
    } catch (error: any) {
      console.error('Change password error:', error);
      
      if (error.response?.status === 401) {
        Alert.alert('Error', 'Incorrect current password');
      } else if (error.response?.status === 400) {
        Alert.alert('Error', error.response.data?.message || 'Invalid input');
      } else if (error.response?.status === 404) {
        Alert.alert('Error', 'Employee not found');
      } else {
        Alert.alert('Error', error.response?.data?.message || 'Failed to change password');
      }
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: () => {
            dispatch(logout());
            navigation.reset({
              index: 0,
              routes: [{ name: 'Login' }],
            });
          },
        },
      ],
      { cancelable: true }
    );
  };

  // Show loading indicator while fetching profile
  if (isLoadingProfile) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar backgroundColor="#fff" barStyle="dark-content" />
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <MaterialIcons name="arrow-back" size={26} color="#000" />
          </TouchableOpacity>
          <Text style={styles.title}>Edit Profile</Text>
          <View style={styles.saveButton} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#075E4D" />
          <Text style={styles.loadingText}>Loading profile...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar backgroundColor="#fff" barStyle="dark-content" />
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <MaterialIcons name="arrow-back" size={26} color="#000" />
        </TouchableOpacity>
        <Text style={styles.title}>Edit Profile</Text>
        <TouchableOpacity onPress={handleSaveProfile} style={styles.saveButton} disabled={isSaving}>
          {isSaving ? (
            <ActivityIndicator size="small" color="#075E4D" />
          ) : (
            <Text style={styles.saveText}>Save</Text>
          )}
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Profile Image Section - Replaced with Initials */}
          <View style={styles.profileImageContainer}>
            <View style={styles.initialsContainer}>
              <Text style={styles.initialsText}>
                {getUserInitials(profileData?.first_name || '', profileData?.last_name || '')}
              </Text>
            </View>
            <Text style={styles.changePhotoText}>{userData.name}</Text>
            <Text style={styles.roleText}>{profileData?.department || 'Employee'}</Text>
          </View>

          {/* Form Section */}
          <View style={styles.formContainer}>
            {/* Name Field - Made non-editable */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Full Name</Text>
              <View style={[styles.inputWrapper, styles.disabledInput]}>
                <Ionicons name="person-outline" size={20} color="#666" style={styles.inputIcon} />
                <TextInput
                  style={[styles.textInput, styles.disabledText]}
                  value={userData.name}
                  editable={false}
                  placeholder="Enter your name"
                />
              </View>
            </View>

            {/* Email Field */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Email Address</Text>
              <View style={[
                styles.inputWrapper,
                fieldErrors.email ? styles.inputError : {}
              ]}>
                <MaterialIcons name="email" size={20} color="#666" style={styles.inputIcon} />
                <TextInput
                  style={styles.textInput}
                  value={userData.email}
                  onChangeText={(text) => {
                    setUserData({ ...userData, email: text });
                    if (fieldErrors.email) {
                      setFieldErrors({ ...fieldErrors, email: '' });
                    }
                  }}
                  placeholder={profileData?.email || "Enter your email"}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>
              {fieldErrors.email ? (
                <Text style={styles.errorText}>{fieldErrors.email}</Text>
              ) : (
                <Text style={styles.noteText}>Leave blank if you don't want to change email</Text>
              )}
            </View>

            {/* Phone Field */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Phone Number</Text>
              <View style={[
                styles.inputWrapper,
                fieldErrors.phone ? styles.inputError : {}
              ]}>
                <Feather name="phone" size={20} color="#666" style={styles.inputIcon} />
                <TextInput
                  style={styles.textInput}
                  value={userData.phone}
                  onChangeText={(text) => {
                    setUserData({ ...userData, phone: text });
                    if (fieldErrors.phone) {
                      setFieldErrors({ ...fieldErrors, phone: '' });
                    }
                  }}
                  placeholder={profileData?.phone || "Enter your phone number"}
                  keyboardType="phone-pad"
                  maxLength={10}
                />
              </View>
              {fieldErrors.phone ? (
                <Text style={styles.errorText}>{fieldErrors.phone}</Text>
              ) : (
                <Text style={styles.noteText}>Leave blank if you don't want to change phone</Text>
              )}
            </View>

            {/* Change Password Button */}
            <TouchableOpacity
              style={styles.changePasswordButton}
              onPress={openPasswordDrawer}
            >
              <Ionicons name="lock-closed-outline" size={22} color="#075E4D" />
              <Text style={styles.changePasswordText}>Change Password</Text>
              <MaterialIcons name="keyboard-arrow-right" size={24} color="#075E4D" />
            </TouchableOpacity>

            {/* Logout Button */}
            <TouchableOpacity
              style={styles.logoutButton}
              onPress={handleLogout}
            >
              <MaterialIcons name="logout" size={22} color="#FF3B30" />
              <Text style={styles.logoutText}>Logout</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Password Change Drawer */}
      <Modal
        visible={isPasswordDrawerVisible}
        transparent
        animationType="none"
        onRequestClose={closePasswordDrawer}
      >
        <TouchableWithoutFeedback onPress={closePasswordDrawer}>
          <View style={styles.drawerOverlay} />
        </TouchableWithoutFeedback>

        <Animated.View
          style={[
            styles.passwordDrawer,
            { transform: [{ translateY: drawerAnim }] }
          ]}
        >
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.drawerKeyboardAvoidingView}
          >
            <View style={styles.drawerHeader}>
              <Text style={styles.drawerTitle}>Change Password</Text>
              <TouchableOpacity onPress={closePasswordDrawer}>
                <MaterialIcons name="close" size={24} color="#000" />
              </TouchableOpacity>
            </View>

            <ScrollView
              style={styles.drawerScrollView}
              contentContainerStyle={styles.drawerScrollContent}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              <View style={styles.drawerContent}>
                {/* Current Password */}
                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>Current Password</Text>
                  <View style={styles.inputWrapper}>
                    <Ionicons name="lock-closed-outline" size={20} color="#666" style={styles.inputIcon} />
                    <TextInput
                      style={styles.textInput}
                      value={passwordData.currentPassword}
                      onChangeText={(text) => setPasswordData({ ...passwordData, currentPassword: text })}
                      placeholder="Enter current password"
                      secureTextEntry={passwordVisibility.currentPassword}
                    />
                    <TouchableOpacity
                      onPress={() => togglePasswordVisibility('currentPassword')}
                      style={styles.visibilityToggle}
                    >
                      <Ionicons
                        name={passwordVisibility.currentPassword ? "eye-outline" : "eye-off-outline"}
                        size={20}
                        color="#666"
                      />
                    </TouchableOpacity>
                  </View>
                </View>

                {/* New Password */}
                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>New Password</Text>
                  <View style={styles.inputWrapper}>
                    <Ionicons name="lock-closed-outline" size={20} color="#666" style={styles.inputIcon} />
                    <TextInput
                      style={styles.textInput}
                      value={passwordData.newPassword}
                      onChangeText={(text) => setPasswordData({ ...passwordData, newPassword: text })}
                      placeholder="Enter new password"
                      secureTextEntry={passwordVisibility.newPassword}
                    />
                    <TouchableOpacity
                      onPress={() => togglePasswordVisibility('newPassword')}
                      style={styles.visibilityToggle}
                    >
                      <Ionicons
                        name={passwordVisibility.newPassword ? "eye-outline" : "eye-off-outline"}
                        size={20}
                        color="#666"
                      />
                    </TouchableOpacity>
                  </View>
                  <Text style={styles.noteText}>Password must be at least 6 characters</Text>
                </View>

                {/* Confirm Password */}
                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>Confirm New Password</Text>
                  <View style={styles.inputWrapper}>
                    <Ionicons name="lock-closed-outline" size={20} color="#666" style={styles.inputIcon} />
                    <TextInput
                      style={styles.textInput}
                      value={passwordData.confirmPassword}
                      onChangeText={(text) => setPasswordData({ ...passwordData, confirmPassword: text })}
                      placeholder="Confirm new password"
                      secureTextEntry={passwordVisibility.confirmPassword}
                    />
                    <TouchableOpacity
                      onPress={() => togglePasswordVisibility('confirmPassword')}
                      style={styles.visibilityToggle}
                    >
                      <Ionicons
                        name={passwordVisibility.confirmPassword ? "eye-outline" : "eye-off-outline"}
                        size={20}
                        color="#666"
                      />
                    </TouchableOpacity>
                  </View>
                </View>

                <TouchableOpacity
                  style={[styles.updatePasswordButton, isUpdatingPassword && styles.disabledButton]}
                  onPress={handleChangePassword}
                  disabled={isUpdatingPassword}
                >
                  {isUpdatingPassword ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <Text style={styles.updatePasswordText}>Update Password</Text>
                  )}
                </TouchableOpacity>
              </View>
            </ScrollView>
          </KeyboardAvoidingView>
        </Animated.View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    marginTop: 16
  },
  backButton: {
    padding: 4,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
  },
  saveButton: {
    padding: 8,
  },
  saveText: {
    color: '#075E4D',
    fontSize: 16,
    fontWeight: '600',
  },
  profileImageContainer: {
    alignItems: 'center',
    paddingVertical: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  initialsContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#075E4D',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  initialsText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
  },
  changePhotoText: {
    color: '#333',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  roleText: {
    color: '#666',
    fontSize: 14,
  },
  formContainer: {
    padding: 20,
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 12,
    paddingHorizontal: 12,
    backgroundColor: '#fff',
  },
  inputError: {
    borderColor: '#FF3B30',
    borderWidth: 2,
  },
  disabledInput: {
    backgroundColor: '#f9f9f9',
  },
  inputIcon: {
    marginRight: 10,
  },
  textInput: {
    flex: 1,
    height: 50,
    fontSize: 16,
    color: '#333',
  },
  disabledText: {
    color: '#666',
  },
  errorText: {
    fontSize: 12,
    color: '#FF3B30',
    marginTop: 4,
  },
  noteText: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
    fontStyle: 'italic',
  },
  visibilityToggle: {
    padding: 8,
    marginLeft: 4,
  },
  changePasswordButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f9f7',
    padding: 16,
    borderRadius: 12,
    marginTop: 10,
  },
  changePasswordText: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    fontWeight: '600',
    color: '#075E4D',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF0EF',
    padding: 16,
    borderRadius: 12,
    marginTop: 20,
  },
  logoutText: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    fontWeight: '600',
    color: '#FF3B30',
  },
  drawerOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  passwordDrawer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
  },
  drawerKeyboardAvoidingView: {
    flex: 1,
  },
  drawerScrollView: {
    flex: 1,
  },
  drawerScrollContent: {
    flexGrow: 1,
    paddingBottom: 30,
  },
  drawerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  drawerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
  },
  drawerContent: {
    padding: 20,
  },
  updatePasswordButton: {
    backgroundColor: '#075E4D',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 10,
  },
  disabledButton: {
    backgroundColor: '#cccccc',
  },
  updatePasswordText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  // Add loading styles
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
});

export default Settings;