import React, { useState } from 'react';
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
    Image,
    ActivityIndicator,
    Alert,
    StatusBar,
} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Feather from 'react-native-vector-icons/Feather';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import { useDispatch } from 'react-redux';
import { logout } from '../../../redux/slices/authSlice';

const { height } = Dimensions.get('window');

const ProfileScreen = ({ navigation }: any) => {
    const dispatch = useDispatch();
    const [userData, setUserData] = useState({
        name: 'John Doe',
        email: 'johndoe@example.com',
    });

    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
    });

    const [passwordVisibility, setPasswordVisibility] = useState({
        currentPassword: false,
        newPassword: false,
        confirmPassword: false,
    });

    const [isPasswordDrawerVisible, setPasswordDrawerVisible] = useState(false);
    const [drawerAnim] = useState(new Animated.Value(height));
    const [isSaving, setIsSaving] = useState(false);

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
            // Reset visibility states when closing drawer
            setPasswordVisibility({
                currentPassword: false,
                newPassword: false,
                confirmPassword: false,
            });
        });
    };

    const handleSaveProfile = () => {
        setIsSaving(true);
        // Simulate API call
        setTimeout(() => {
            setIsSaving(false);
            // Show success message
            alert('Profile updated successfully!');
        }, 1500);
    };

    const handleChangePassword = () => {
        // Validate passwords
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            alert("New passwords don't match");
            return;
        }

        if (passwordData.newPassword.length < 6) {
            alert("Password must be at least 6 characters");
            return;
        }

        // Simulate API call
        alert('Password changed successfully!');
        closePasswordDrawer();
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
                        // Navigate to login screen or perform any other cleanup
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
                    {/* Profile Image Section */}
                    <View style={styles.profileImageContainer}>
                        <View style={styles.imageWrapper}>
                            <Image
                                source={{ uri: 'https://randomuser.me/api/portraits/men/1.jpg' }}
                                style={styles.profileImage}
                            />
                            <TouchableOpacity style={styles.editImageButton}>
                                <Feather name="camera" size={20} color="#fff" />
                            </TouchableOpacity>
                        </View>
                        <Text style={styles.changePhotoText}>Change Profile Photo</Text>
                    </View>

                    {/* Form Section */}
                    <View style={styles.formContainer}>
                        {/* Name Field */}
                        <View style={styles.inputContainer}>
                            <Text style={styles.inputLabel}>Full Name</Text>
                            <View style={styles.inputWrapper}>
                                <Ionicons name="person-outline" size={20} color="#666" style={styles.inputIcon} />
                                <TextInput
                                    style={styles.textInput}
                                    value={userData.name}
                                    onChangeText={(text) => setUserData({ ...userData, name: text })}
                                    placeholder="Enter your name"
                                />
                            </View>
                        </View>

                        {/* Email Field */}
                        <View style={styles.inputContainer}>
                            <Text style={styles.inputLabel}>Email Address</Text>
                            <View style={styles.inputWrapper}>
                                <MaterialIcons name="email" size={20} color="#666" style={styles.inputIcon} />
                                <TextInput
                                    style={styles.textInput}
                                    value={userData.email}
                                    onChangeText={(text) => setUserData({ ...userData, email: text })}
                                    placeholder="Enter your email"
                                    keyboardType="email-address"
                                    autoCapitalize="none"
                                />
                            </View>
                        </View>

                        {/* Phone Field (readonly) */}
                        <View style={styles.inputContainer}>
                            <Text style={styles.inputLabel}>Phone Number</Text>
                            <View style={[styles.inputWrapper, styles.disabledInput]}>
                                <Feather name="phone" size={20} color="#666" style={styles.inputIcon} />
                                <TextInput
                                    style={[styles.textInput, { color: '#999' }]}
                                    value="+1 (555) 123-4567"
                                    editable={false}
                                    placeholder="Phone number"
                                />
                            </View>
                            <Text style={styles.noteText}>Phone number cannot be changed</Text>
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
                    <View style={styles.drawerHeader}>
                        <Text style={styles.drawerTitle}>Change Password</Text>
                        <TouchableOpacity onPress={closePasswordDrawer}>
                            <MaterialIcons name="close" size={24} color="#000" />
                        </TouchableOpacity>
                    </View>

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
                                    secureTextEntry={!passwordVisibility.currentPassword}
                                />
                                <TouchableOpacity
                                    onPress={() => togglePasswordVisibility('currentPassword')}
                                    style={styles.visibilityToggle}
                                >
                                    <Ionicons
                                        name={passwordVisibility.currentPassword ? "eye-off-outline" : "eye-outline"}
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
                                    secureTextEntry={!passwordVisibility.newPassword}
                                />
                                <TouchableOpacity
                                    onPress={() => togglePasswordVisibility('newPassword')}
                                    style={styles.visibilityToggle}
                                >
                                    <Ionicons
                                        name={passwordVisibility.newPassword ? "eye-off-outline" : "eye-outline"}
                                        size={20}
                                        color="#666"
                                    />
                                </TouchableOpacity>
                            </View>
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
                                    secureTextEntry={!passwordVisibility.confirmPassword}
                                />
                                <TouchableOpacity
                                    onPress={() => togglePasswordVisibility('confirmPassword')}
                                    style={styles.visibilityToggle}
                                >
                                    <Ionicons
                                        name={passwordVisibility.confirmPassword ? "eye-off-outline" : "eye-outline"}
                                        size={20}
                                        color="#666"
                                    />
                                </TouchableOpacity>
                            </View>
                        </View>

                        <TouchableOpacity
                            style={styles.updatePasswordButton}
                            onPress={handleChangePassword}
                        >
                            <Text style={styles.updatePasswordText}>Update Password</Text>
                        </TouchableOpacity>
                    </View>
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
    imageWrapper: {
        position: 'relative',
        marginBottom: 12,
    },
    profileImage: {
        width: 100,
        height: 100,
        borderRadius: 50,
    },
    editImageButton: {
        position: 'absolute',
        right: 0,
        bottom: 0,
        backgroundColor: '#075E4D',
        width: 36,
        height: 36,
        borderRadius: 18,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 3,
        borderColor: '#fff',
    },
    changePhotoText: {
        color: '#075E4D',
        fontSize: 14,
        fontWeight: '500',
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
    visibilityToggle: {
        padding: 8,
        marginLeft: 4,
    },
    noteText: {
        fontSize: 12,
        color: '#999',
        marginTop: 6,
        fontStyle: 'italic',
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
        paddingBottom: 30,
        maxHeight: '70%',
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
    },
    updatePasswordText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
});

export default ProfileScreen;