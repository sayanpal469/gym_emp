import React, { useState } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Image,
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

const ForgotPassword = () => {
    const [phone, setPhone] = useState('');
    const navigation = useNavigation<any>();

    const handleSendOtp = () => {
        // Validate phone number
        const phoneRegex = /^\d{10}$/;
        if (!phoneRegex.test(phone)) {
            Alert.alert('Invalid Phone Number', 'Please enter a valid 10-digit phone number');
            return;
        }

        // Navigate to OTP screen
        navigation.navigate('OtpScreen', { phone });
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
                            Enter your phone number to receive a verification code
                        </Text>

                        <Input
                            label="Phone Number"
                            value={phone}
                            onChangeText={(text) => {
                                const cleaned = text.replace(/[^0-9]/g, '');
                                if (cleaned.length <= 10) {
                                    setPhone(cleaned);
                                }
                            }}
                            keyboardType="phone-pad"
                            autoCapitalize="none"
                            containerStyle={styles.inputContainer}
                        />

                        <TouchableOpacity
                            style={styles.sendOtpButton}
                            onPress={handleSendOtp}
                        >
                            <Text style={styles.sendOtpText}>SEND OTP</Text>
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
        marginBottom: 30,
    },
    sendOtpButton: {
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
    },
    sendOtpText: {
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

export default ForgotPassword;