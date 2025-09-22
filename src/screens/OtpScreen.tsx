import React, { useState, useRef } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Dimensions,
    Alert,
    TextInput,
    KeyboardAvoidingView,
    ScrollView,
    Platform,
    StatusBar,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';

const { width, height } = Dimensions.get('window');

const OtpScreen = ({ route }) => {
    const { phone } = route.params;
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [loading, setLoading] = useState(false);
    const inputs = useRef([]);
    const navigation = useNavigation<any>();

    const focusNext = (index, value) => {
        if (value && index < 5) {
            inputs.current[index + 1].focus();
        }

        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);

        // Auto submit when all fields are filled
        if (newOtp.every(digit => digit !== '') && index === 5) {
            handleVerifyOtp();
        }
    };

    const focusPrevious = (index, key) => {
        if (key === 'Backspace' && index > 0) {
            inputs.current[index - 1].focus();
        }
    };

    const handleVerifyOtp = async () => {
        setLoading(true);
        const otpCode = otp.join('');

        // Simulate verification process
        setTimeout(() => {
            setLoading(false);
            Alert.alert(
                'Success',
                'OTP verified successfully!',
                [{ text: 'OK', onPress: () => navigation.navigate('ResetPassword', { phone }) }]
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
                        <Text style={styles.title}>Verification</Text>
                        <Text style={styles.subtitle}>
                            Enter the 6-digit code sent to your phone number
                        </Text>
                        <Text style={styles.phoneText}>+1 {phone}</Text>

                        <View style={styles.otpContainer}>
                            {otp.map((digit, index) => (
                                <TextInput
                                    key={index}
                                    style={styles.otpInput}
                                    value={digit}
                                    onChangeText={(value) => focusNext(index, value)}
                                    onKeyPress={({ nativeEvent: { key } }) => focusPrevious(index, key)}
                                    keyboardType="number-pad"
                                    maxLength={1}
                                    ref={(ref) => (inputs.current[index] = ref)}
                                    selectTextOnFocus
                                />
                            ))}
                        </View>

                        <TouchableOpacity
                            style={[styles.verifyButton, loading && styles.verifyButtonDisabled]}
                            onPress={handleVerifyOtp}
                            disabled={loading}
                        >
                            <Text style={styles.verifyText}>
                                {loading ? 'VERIFYING...' : 'VERIFY OTP'}
                            </Text>
                            <View style={styles.arrowContainer}>
                                <MaterialCommunityIcons name="arrow-right" size={20} color="#084c3a" />
                            </View>
                        </TouchableOpacity>

                        <View style={styles.resendContainer}>
                            <Text style={styles.resendText}>Didn't receive the code? </Text>
                            <TouchableOpacity>
                                <Text style={styles.resendLink}>Resend</Text>
                            </TouchableOpacity>
                        </View>
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
        marginBottom: 8,
        textAlign: 'center',
        lineHeight: 24,
    },
    phoneText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#084c3a',
        marginBottom: 40,
        textAlign: 'center',
    },
    otpContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 40,
    },
    otpInput: {
        width: 45,
        height: 55,
        borderWidth: 1.5,
        borderColor: '#d1d5db',
        borderRadius: 10,
        textAlign: 'center',
        fontSize: 20,
        fontWeight: '700',
        color: '#084c3a',
    },
    verifyButton: {
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
        marginBottom: 24,
    },
    verifyButtonDisabled: {
        opacity: 0.7,
    },
    verifyText: {
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
    resendContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
    },
    resendText: {
        fontSize: 15,
        color: '#6b7280',
    },
    resendLink: {
        fontSize: 15,
        color: '#084c3a',
        fontWeight: '600',
    },
});

export default OtpScreen;