import React, { useEffect, useState, useRef } from 'react';
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
  Animated,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Input from '../components/Input';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../hooks/useAuth';
import changeNavigationBarColor from 'react-native-navigation-bar-color';

import Logo from '../assets/images/Logo.png';

const { width, height } = Dimensions.get('window');

const Login = () => {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [hidePassword, setHidePassword] = useState(true);
  const navigation = useNavigation<any>();

  // Animation refs
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(-50)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    changeNavigationBarColor('#ffffff', true);

    // Start animations
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();

    // Pulsing animation for logo
    const startPulse = () => {
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
      ]).start(() => startPulse());
    };
    startPulse();
  }, []);

  const { loginUser, loading } = useAuth();

  const validate = () => {
    const phoneRegex = /^\d{10}$/;
    if (!phoneRegex.test(phone)) {
      Alert.alert('Invalid Phone Number', 'Please enter a valid 10-digit phone number');
      return false;
    }
    return true;
  };

  const handleSignIn = async () => {
    if (validate()) {
      const result = await loginUser({ phone_number: phone, password });
      if (result.success) {
        navigation.navigate('MainTabs');
      } else {
        Alert.alert('Login Failed', (result as any).message || 'Invalid credentials');
      }
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 60 : 0}
    >
      <StatusBar backgroundColor="#084c3a" barStyle="light-content" />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.container}>
          {/* Animated Top Area */}
          <Animated.View 
            style={[
              styles.topArea,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }]
              }
            ]}
          >
            {/* Decorative circles */}
            <View style={[styles.decorativeCircle, styles.circle1]} />
            <View style={[styles.decorativeCircle, styles.circle2]} />
            <View style={[styles.decorativeCircle, styles.circle3]} />
            
            {/* Logo Container */}
            <View style={styles.logoContainer}>
               <Image
                  source={Logo}
                  style={styles.logo}
                  resizeMode="contain"
                />
            </View>
          </Animated.View>

          {/* Centered Form Container */}
          <Animated.View 
            style={[
              styles.centerContainer,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }]
              }
            ]}
          >
            <View style={styles.contentContainer}>
              <Text style={styles.title}>LET'S SIGN YOU IN</Text>
              <Text style={styles.subtitle}>Hello there, sign in to continue</Text>

              <View style={styles.formContainer}>
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

                <Input
                  label="Password"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={hidePassword}
                  rightIcon={
                    <TouchableOpacity onPress={() => setHidePassword(!hidePassword)}>
                      <MaterialCommunityIcons
                        name={hidePassword ? 'eye-off' : 'eye'}
                        size={20}
                        color="#9ca3af"
                      />
                    </TouchableOpacity>
                  }
                  containerStyle={styles.inputContainer}
                />

                <TouchableOpacity 
                  style={styles.forgotContainer}
                  onPress={() => navigation.navigate('ForgotPassword')}
                >
                  <Text style={styles.forgotText}>Forgot Password?</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={[styles.signInButton, loading && styles.signInButtonDisabled]} 
                  onPress={handleSignIn}
                  disabled={loading}
                >
                  <Text style={styles.signInText}>
                    {loading ? 'PLEASE WAIT...' : 'SIGN IN'}
                  </Text>
                  <View style={styles.arrowContainer}>
                    <MaterialCommunityIcons name="arrow-right" size={20} color="#084c3a" />
                  </View>
                </TouchableOpacity>
              </View>
            </View>
          </Animated.View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default Login;

const styles = StyleSheet.create({
  scrollContent: {
    flexGrow: 1,
    backgroundColor: '#f8fafc',
    minHeight: height,
  },
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  topArea: {
    backgroundColor: '#084c3a',
    height: height * 0.45,
    position: 'relative',
    overflow: 'hidden',
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  decorativeCircle: {
    position: 'absolute',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 1000,
  },
  circle1: {
    width: 200,
    height: 200,
    top: -50,
    right: -50,
  },
  circle2: {
    width: 150,
    height: 150,
    top: 50,
    left: -75,
  },
  circle3: {
    width: 100,
    height: 100,
    bottom: 30,
    right: 30,
  },
  logoContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  logoBackground: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 100,
    padding: 35,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 15,
  },
  logo: {
    width: width * 0.4,
    height: width * 0.4 * 0.6,
    tintColor: '#ffffff',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    marginTop: -height * 0.1,
    zIndex: 5,
  },
  contentContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 25,
    padding: 35,
    shadowColor: '#084c3a',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 10,
    borderWidth: 1,
    borderColor: 'rgba(8, 76, 58, 0.05)',
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    marginBottom: 8,
    color: '#084c3a',
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
    marginBottom: 35,
    textAlign: 'center',
    lineHeight: 24,
  },
  formContainer: {
    marginBottom: 10,
  },
  inputContainer: {
    marginBottom: 20,
  },
  forgotContainer: {
    alignSelf: 'flex-end',
    marginBottom: 25,
    marginTop: 5,
  },
  forgotText: {
    color: '#084c3a',
    fontSize: 14,
    fontWeight: '600',
  },
  signInButton: {
    flexDirection: 'row',
    backgroundColor: '#084c3a',
    borderRadius: 16,
    paddingHorizontal: 24,
    height: 58,
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#084c3a',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 12,
    marginTop: 10,
  },
  signInButtonDisabled: {
    opacity: 0.7,
  },
  signInText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  arrowContainer: {
    backgroundColor: 'white',
    borderRadius: 25,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
});