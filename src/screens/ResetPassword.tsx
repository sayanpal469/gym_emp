import React, { useState } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Dimensions,
    Alert,
    KeyboardAvoidingView,
    ScrollView,
    Platform,
    StatusBar,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Input from '../components/Input';
import { useNavigation } from '@react-navigation/native';

const { width, height } = Dimensions.get('window');

const ResetPassword = ({ route }) => {
    const { phone } = route.params;
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [hideNewPassword, setHideNewPassword] = useState(true);
    const [hideConfirmPassword, setHideConfirmPassword] = useState(true);
    const [loading, setLoading] = useState(false);
    const navigation = useNavigation<any>();

    const handleResetPassword = () => {
        // Validate passwords
        if (newPassword.length < 6) {
            Alert.alert('Invalid Password', 'Password must be at least 6 characters long');
            return;
        }

        if (newPassword !== confirmPassword) {
            Alert.alert('Password Mismatch', 'Passwords do not match');
            return;
        }

        setLoading(true);

        // Simulate API call to reset password
        setTimeout(() => {
            setLoading(false);
            Alert.alert(
                'Success',
                'Your password has been reset successfully!',
                [{ text: 'OK', onPress: () => navigation.navigate('Login') }]
            );
        }, 1500);
    };

    return (
        <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
            <StatusBar backgroundColor="#fff" barStyle="dark-content" />
            <ScrollView
                contentContainerStyle={styles.scrollContent}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
            >
                <View style={styles.container}>
                    {/* Back button */}
                    <TouchableOpacity
                        style={styles.backButton}
                        onPress={() => navigation.goBack()}
                    >
                        <MaterialCommunityIcons name="arrow-left" size={24} color="#084c3a" />
                    </TouchableOpacity>

                    {/* Content */}
                    <View style={styles.content}>
                        <Text style={styles.title}>Reset Password</Text>
                        <Text style={styles.subtitle}>
                            Create a new password for your account
                        </Text>

                        <Input
                            label="New Password"
                            value={newPassword}
                            onChangeText={setNewPassword}
                            secureTextEntry={hideNewPassword}
                            rightIcon={
                                <TouchableOpacity onPress={() => setHideNewPassword(!hideNewPassword)}>
                                    <MaterialCommunityIcons
                                        name={hideNewPassword ? 'eye-off' : 'eye'}
                                        size={20}
                                        color="#9ca3af"
                                    />
                                </TouchableOpacity>
                            }
                            containerStyle={styles.inputContainer}
                        />

                        <Input
                            label="Confirm Password"
                            value={confirmPassword}
                            onChangeText={setConfirmPassword}
                            secureTextEntry={hideConfirmPassword}
                            rightIcon={
                                <TouchableOpacity onPress={() => setHideConfirmPassword(!hideConfirmPassword)}>
                                    <MaterialCommunityIcons
                                        name={hideConfirmPassword ? 'eye-off' : 'eye'}
                                        size={20}
                                        color="#9ca3af"
                                    />
                                </TouchableOpacity>
                            }
                            containerStyle={styles.inputContainer}
                        />

                        <TouchableOpacity
                            style={[styles.resetButton, loading && styles.resetButtonDisabled]}
                            onPress={handleResetPassword}
                            disabled={loading}
                        >
                            <Text style={styles.resetText}>
                                {loading ? 'RESETTING...' : 'RESET PASSWORD'}
                            </Text>
                            <View style={styles.arrowContainer}>
                                <MaterialCommunityIcons name="arrow-right" size={20} color="#084c3a" />
                            </View>
                        </TouchableOpacity>
                    </View>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    scrollContent: {
        flexGrow: 1,
        backgroundColor: '#fff',
    },
    container: {
        flex: 1,
        backgroundColor: '#fff',
        minHeight: height,
        paddingHorizontal: 24,
    },
    backButton: {
        paddingTop: Platform.OS === 'ios' ? 60 : 30,
        paddingBottom: 20,
        alignSelf: 'flex-start',
    },
    content: {
        flex: 1,
        justifyContent: 'center',
        marginTop: -40,
    },
    title: {
        fontSize: 28,
        fontWeight: '800',
        marginBottom: 12,
        color: '#084c3a',
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 16,
        color: '#6b7280',
        marginBottom: 40,
        textAlign: 'center',
        lineHeight: 24,
    },
    inputContainer: {
        marginBottom: 20,
    },
    resetButton: {
        flexDirection: 'row',
        backgroundColor: '#084c3a',
        borderRadius: 12,
        paddingHorizontal: 24,
        height: 56,
        alignItems: 'center',
        justifyContent: 'space-between',
        shadowColor: '#084c3a',
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.3,
        shadowRadius: 4.65,
        elevation: 8,
        marginTop: 10,
    },
    resetButtonDisabled: {
        opacity: 0.7,
    },
    resetText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
        flex: 1,
        textAlign: 'center',
    },
    arrowContainer: {
        backgroundColor: 'white',
        borderRadius: 20,
        padding: 8,
    },
});

export default ResetPassword;