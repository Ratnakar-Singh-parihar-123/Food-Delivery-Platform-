import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  Easing,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Ionicons from '@react-native-vector-icons/ionicons';
import { phoneLogin } from '../api/customerApi';

const OTP_LENGTH = 6;

export default function OtpVerificationScreen({ navigation, route }) {
  const phoneNumber = route.params?.phoneNumber;
  const confirmation = route.params?.confirmation;

  const [otp, setOtp] = useState(Array(OTP_LENGTH).fill(''));
  const [loading, setLoading] = useState(false);
  const [seconds, setSeconds] = useState(30);
  const [error, setError] = useState('');
  const [focusedIndex, setFocusedIndex] = useState(0);

  const inputRefs = useRef([]);

  // ── Animations ──
  const screenOpacity = useRef(new Animated.Value(0)).current;
  const screenTranslateY = useRef(new Animated.Value(20)).current;
  const iconScale = useRef(new Animated.Value(0.7)).current;
  const buttonScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(screenOpacity, {
        toValue: 1,
        duration: 450,
        useNativeDriver: true,
      }),
      Animated.timing(screenTranslateY, {
        toValue: 0,
        duration: 550,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.spring(iconScale, {
        toValue: 1,
        friction: 6,
        tension: 80,
        useNativeDriver: true,
      }),
    ]).start();
  }, [iconScale, screenOpacity, screenTranslateY]);

  useEffect(() => {
    if (seconds <= 0) return;

    const timer = setInterval(() => {
      setSeconds(current => current - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [seconds]);

  const handleOtpChange = (value, index) => {
    const cleanedValue = value.replace(/[^0-9]/g, '');

    if (cleanedValue.length > 1) {
      const pastedOtp = cleanedValue.slice(0, OTP_LENGTH).split('');
      const nextOtp = Array(OTP_LENGTH).fill('');

      pastedOtp.forEach((digit, digitIndex) => {
        nextOtp[digitIndex] = digit;
      });

      setOtp(nextOtp);
      const finalIndex = Math.min(pastedOtp.length, OTP_LENGTH - 1);
      inputRefs.current[finalIndex]?.focus();
      return;
    }

    const updatedOtp = [...otp];
    updatedOtp[index] = cleanedValue;

    setOtp(updatedOtp);
    setError('');

    if (cleanedValue && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (event, index) => {
    if (event.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerifyOtp = async () => {
    const code = otp.join('');

    if (code.length !== OTP_LENGTH) {
      setError('Please enter complete 6-digit OTP');
      return;
    }

    if (!confirmation) {
      setError('OTP session expired. Please try again.');
      return;
    }

    try {
      setLoading(true);
      setError('');

      const userCredential = await confirmation.confirm(code);
      const idToken = await userCredential.user.getIdToken();
      const response = await phoneLogin(idToken);

      await AsyncStorage.setItem('customerToken', response.data.token);

      if (response.data.profileCompleted) {
        navigation.reset({
          index: 0,
          routes: [{ name: 'MainTabs' }],
        });
      } else {
        navigation.reset({
          index: 0,
          routes: [{ name: 'CustomerProfile' }],
        });
      }
    } catch (err) {
      console.log('OTP Verify Error:', err);
      setError(err?.message || 'Invalid OTP code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = () => {
    if (seconds > 0) return;

    setOtp(Array(OTP_LENGTH).fill(''));
    setSeconds(30);
    setError('');
    inputRefs.current[0]?.focus();
  };

  const maskedNumber = phoneNumber
    ? `+91 ${phoneNumber.slice(0, 2)}••••••${phoneNumber.slice(-2)}`
    : '+91 Mobile Number';

  const isOtpComplete = otp.join('').length === OTP_LENGTH;

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFDFB" />

      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <Animated.View
          style={[
            styles.container,
            {
              opacity: screenOpacity,
              transform: [{ translateY: screenTranslateY }],
            },
          ]}
        >
          {/* Header Action Bar */}
          <View style={styles.navBar}>
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={styles.backButton}
              activeOpacity={0.7}
            >
              <Ionicons name="arrow-back" size={20} color="#0F172A" />
            </TouchableOpacity>
          </View>

          {/* Core Content */}
          <View style={styles.content}>
            {/* Top Badge Icon */}
            <Animated.View
              style={[
                styles.iconWrapper,
                { transform: [{ scale: iconScale }] },
              ]}
            >
              <View style={styles.iconCircle}>
                <Ionicons name="shield-checkmark" size={36} color="#FF5A1F" />
              </View>
            </Animated.View>

            {/* Verification Header Text */}
            <Text style={styles.heading}>Verify Phone Number</Text>
            <Text style={styles.description}>
              We've sent a 6-digit security code to
            </Text>

            {/* Interactive Phone Number Capsule */}
            <View style={styles.phoneChip}>
              <Text style={styles.phoneNumber}>{maskedNumber}</Text>
              <TouchableOpacity
                onPress={() => navigation.goBack()}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Text style={styles.changeNumberText}>Edit</Text>
              </TouchableOpacity>
            </View>

            {/* OTP Input Container */}
            <View style={styles.otpContainer}>
              {otp.map((digit, index) => {
                const isFocused = focusedIndex === index;
                return (
                  <TextInput
                    key={index}
                    ref={reference => {
                      inputRefs.current[index] = reference;
                    }}
                    value={digit}
                    onChangeText={value => handleOtpChange(value, index)}
                    onKeyPress={event => handleKeyPress(event, index)}
                    onFocus={() => setFocusedIndex(index)}
                    keyboardType="number-pad"
                    maxLength={1}
                    autoFocus={index === 0}
                    selectionColor="#FF5A1F"
                    style={[
                      styles.otpInput,
                      digit ? styles.otpInputFilled : null,
                      isFocused ? styles.otpInputFocused : null,
                      error ? styles.otpInputError : null,
                    ]}
                  />
                );
              })}
            </View>

            {/* Error or Helper Message */}
            {error ? (
              <View style={styles.errorWrapper}>
                <Ionicons name="alert-circle" size={15} color="#DC2626" />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : null}

            {/* Resend Timer Group */}
            <View style={styles.resendWrapper}>
              <Text style={styles.resendLabel}>Didn't receive code? </Text>
              <TouchableOpacity
                onPress={handleResend}
                disabled={seconds > 0}
                activeOpacity={0.6}
              >
                <Text
                  style={[
                    styles.resendButton,
                    seconds > 0 && styles.resendDisabled,
                  ]}
                >
                  {seconds > 0
                    ? `Resend in 00:${String(seconds).padStart(2, '0')}`
                    : 'Resend OTP'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Primary Submit Button Section */}
          <Animated.View
            style={[
              styles.bottomSection,
              { transform: [{ scale: buttonScale }] },
            ]}
          >
            <Pressable
              disabled={!isOtpComplete || loading}
              onPress={handleVerifyOtp}
              onPressIn={() => {
                if (!loading) {
                  Animated.spring(buttonScale, {
                    toValue: 0.97,
                    useNativeDriver: true,
                  }).start();
                }
              }}
              onPressOut={() => {
                if (!loading) {
                  Animated.spring(buttonScale, {
                    toValue: 1,
                    useNativeDriver: true,
                  }).start();
                }
              }}
              style={[
                styles.verifyButton,
                (!isOtpComplete || loading) && styles.verifyButtonDisabled,
              ]}
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <>
                  <Text style={styles.verifyButtonText}>Verify & Continue</Text>
                  <View style={styles.buttonIconWrapper}>
                    <Ionicons
                      name="arrow-forward"
                      size={16}
                      color={isOtpComplete ? '#FF5A1F' : '#9CA3AF'}
                    />
                  </View>
                </>
              )}
            </Pressable>
          </Animated.View>
        </Animated.View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFDFB',
  },
  keyboardView: {
    flex: 1,
  },
  container: {
    flex: 1,
    paddingHorizontal: 22,
    paddingTop: 8,
    paddingBottom: 20,
    justifyContent: 'space-between',
  },

  // Navigation Header
  navBar: {
    height: 44,
    justifyContent: 'center',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },

  // Main Content Section
  content: {
    alignItems: 'center',
    marginTop: 10,
  },
  iconWrapper: {
    marginBottom: 16,
  },
  iconCircle: {
    width: 76,
    height: 76,
    borderRadius: 38,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF0E6',
    borderWidth: 1,
    borderColor: '#FFE2D1',
  },
  heading: {
    color: '#0F172A',
    fontSize: 24,
    fontWeight: '900',
    letterSpacing: -0.4,
  },
  description: {
    marginTop: 6,
    color: '#64748B',
    fontSize: 13.5,
    fontWeight: '500',
  },

  // Compact Phone Number Chip
  phoneChip: {
    marginTop: 10,
    paddingHorizontal: 14,
    paddingVertical: 6,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 20,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  phoneNumber: {
    color: '#0F172A',
    fontSize: 13.5,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  changeNumberText: {
    marginLeft: 10,
    color: '#FF5A1F',
    fontSize: 12.5,
    fontWeight: '800',
  },

  // OTP Input Boxes
  otpContainer: {
    width: '100%',
    marginTop: 32,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  otpInput: {
    width: 46,
    height: 56,
    borderRadius: 15,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
    color: '#0F172A',
    fontSize: 20,
    fontWeight: '800',
    textAlign: 'center',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 2,
  },
  otpInputFilled: {
    backgroundColor: '#FFFFFF',
    borderColor: '#CBD5E1',
  },
  otpInputFocused: {
    borderColor: '#FF5A1F',
    shadowColor: '#FF5A1F',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 4,
  },
  otpInputError: {
    borderColor: '#EF4444',
    backgroundColor: '#FEF2F2',
  },

  // Status/Error Wrapper
  errorWrapper: {
    marginTop: 14,
    flexDirection: 'row',
    alignItems: 'center',
  },
  errorText: {
    marginLeft: 5,
    color: '#DC2626',
    fontSize: 12,
    fontWeight: '600',
  },

  // Resend Timer Group
  resendWrapper: {
    marginTop: 24,
    flexDirection: 'row',
    alignItems: 'center',
  },
  resendLabel: {
    color: '#64748B',
    fontSize: 13,
    fontWeight: '500',
  },
  resendButton: {
    color: '#FF5A1F',
    fontSize: 13,
    fontWeight: '800',
  },
  resendDisabled: {
    color: '#94A3B8',
    fontWeight: '600',
  },

  // Bottom Action Section
  bottomSection: {
    width: '100%',
  },
  verifyButton: {
    height: 54,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
    backgroundColor: '#FF5A1F',
    shadowColor: '#FF5A1F',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.28,
    shadowRadius: 12,
    elevation: 6,
  },
  verifyButtonDisabled: {
    backgroundColor: '#E2E8F0',
    shadowOpacity: 0,
    elevation: 0,
  },
  verifyButtonText: {
    color: '#FFFFFF',
    fontSize: 15.5,
    fontWeight: '800',
    letterSpacing: 0.2,
  },
  buttonIconWrapper: {
    position: 'absolute',
    right: 12,
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
});
