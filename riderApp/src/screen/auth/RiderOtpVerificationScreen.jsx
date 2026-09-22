// RiderOtpVerificationScreen.js
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
  View,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import LinearGradient from 'react-native-linear-gradient';
import { riderVerifyOtp, riderSendOtp, storeToken } from '../../api/riderApi';

const { width } = Dimensions.get('window');

const COLORS = {
  primary: '#FF6B35',
  primaryDark: '#E55A2B',
  title: '#0F172A',
  text: '#475569',
  muted: '#94A3B8',
  border: '#E2E8F0',
  inputBg: '#FFFFFF',
  danger: '#EF4444',
  success: '#16A34A',
  white: '#FFFFFF',
};

const OTP_LENGTH = 6;

export default function RiderOtpVerificationScreen({ navigation, route }) {
  const { phoneNumber, riderId } = route.params || {};
  const [otp, setOtp] = useState(Array(OTP_LENGTH).fill(''));
  const [loading, setLoading] = useState(false);
  const [seconds, setSeconds] = useState(30);
  const [error, setError] = useState('');
  const [focusedIndex, setFocusedIndex] = useState(0);
  const inputRefs = useRef([]);

  const screenOpacity = useRef(new Animated.Value(0)).current;
  const screenTranslateY = useRef(new Animated.Value(20)).current;
  const buttonScale = useRef(new Animated.Value(1)).current;
  const errorShake = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(screenOpacity, {
        toValue: 1,
        duration: 400,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.spring(screenTranslateY, {
        toValue: 0,
        tension: 50,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  useEffect(() => {
    if (seconds <= 0) return;
    const timer = setInterval(() => setSeconds(s => s - 1), 1000);
    return () => clearInterval(timer);
  }, [seconds]);

  useEffect(() => {
    if (error) {
      Animated.sequence([
        Animated.timing(errorShake, {
          toValue: 8,
          duration: 70,
          useNativeDriver: true,
        }),
        Animated.timing(errorShake, {
          toValue: -8,
          duration: 70,
          useNativeDriver: true,
        }),
        Animated.timing(errorShake, {
          toValue: 5,
          duration: 70,
          useNativeDriver: true,
        }),
        Animated.timing(errorShake, {
          toValue: -5,
          duration: 70,
          useNativeDriver: true,
        }),
        Animated.timing(errorShake, {
          toValue: 0,
          duration: 70,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [error]);

  const handleOtpChange = (value, index) => {
    const cleaned = value.replace(/[^0-9]/g, '');

    // Handle Copy Paste OTP
    if (cleaned.length > 1) {
      const pasted = cleaned.slice(0, OTP_LENGTH).split('');
      const newOtp = Array(OTP_LENGTH).fill('');
      pasted.forEach((d, i) => (newOtp[i] = d));
      setOtp(newOtp);
      const finalIndex = Math.min(pasted.length, OTP_LENGTH - 1);
      inputRefs.current[finalIndex]?.focus();
      return;
    }

    const updated = [...otp];
    updated[index] = cleaned;
    setOtp(updated);
    if (error) setError('');

    if (cleaned && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (event, index) => {
    if (event.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify = async () => {
    const code = otp.join('');
    if (code.length !== OTP_LENGTH) {
      setError('Please enter complete 6-digit OTP.');
      return;
    }
    try {
      setLoading(true);
      setError('');
      const response = await riderVerifyOtp({ riderId, otp: code });
      const { action, data } = response;
      if (data?.token) {
        await storeToken(data.token);
      }

      // ⭐ RESET navigation for ALL actions
      let targetScreen = '';
      let params = {};
      if (action === 'home') {
        targetScreen = 'RiderTabs';
      } else if (action === 'create_profile') {
        targetScreen = 'RiderCreateProfile';
        params = { riderId };
      } else if (action === 'upload_documents') {
        targetScreen = 'RiderUploadDocuments';
        params = { riderId };
      } else if (action === 'pending') {
        targetScreen = 'RiderPendingApproval';
        params = { riderId };
      } else if (action === 'rejected') {
        targetScreen = 'RiderRejected';
        params = { riderId };
      } else {
        targetScreen = 'RiderHome';
      }

      navigation.reset({
        index: 0,
        routes: [{ name: targetScreen, params }],
      });
    } catch (err) {
      setError(err.message || 'OTP verification failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (seconds > 0) return;
    try {
      setLoading(true);
      await riderSendOtp({ phone: `+91${phoneNumber}` });
      setSeconds(30);
      setOtp(Array(OTP_LENGTH).fill(''));
      setError('');
      inputRefs.current[0]?.focus();
    } catch (err) {
      setError('Failed to resend OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const formattedPhone = phoneNumber
    ? `+91 ${phoneNumber.slice(0, 5)} ${phoneNumber.slice(5)}`
    : '+91 00000 00000';

  const isOtpComplete = otp.join('').length === OTP_LENGTH;

  return (
    <LinearGradient
      colors={['#FFF8F5', '#FFF3EB', '#FFFFFF']}
      style={styles.gradientBackground}
    >
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="dark-content" backgroundColor="#FFF8F5" />
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
            {/* Top Bar */}
            <View style={styles.topBar}>
              <Pressable
                onPress={() => navigation.goBack()}
                style={({ pressed }) => [
                  styles.backButton,
                  pressed && styles.backButtonPressed,
                ]}
              >
                <Ionicons name="arrow-back" size={22} color={COLORS.title} />
              </Pressable>
            </View>

            {/* Centered Hero Section */}
            <View style={styles.heroSection}>
              <View style={styles.iconContainer}>
                <View style={styles.iconCircle}>
                  <Ionicons
                    name="chatbox-ellipses"
                    size={36}
                    color={COLORS.primary}
                  />
                </View>
                <View style={styles.checkBadge}>
                  <Ionicons name="shield-checkmark" size={14} color="#FFF" />
                </View>
              </View>

              <Text style={styles.heading}>OTP Verification</Text>
              <Text style={styles.subHeading}>
                Enter the 6-digit verification code sent to
              </Text>

              <View style={styles.phoneBadgeContainer}>
                <Text style={styles.phoneNumberText}>{formattedPhone}</Text>
                <Pressable
                  onPress={() => navigation.goBack()}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <Ionicons
                    name="create-outline"
                    size={18}
                    color={COLORS.primary}
                  />
                </Pressable>
              </View>
            </View>

            {/* OTP Input Form Section */}
            <View style={styles.formSection}>
              <Animated.View
                style={[
                  styles.otpContainer,
                  { transform: [{ translateX: errorShake }] },
                ]}
              >
                {otp.map((digit, index) => {
                  const isFocused = focusedIndex === index;
                  const isFilled = digit.length > 0;

                  return (
                    <TextInput
                      key={index}
                      ref={ref => (inputRefs.current[index] = ref)}
                      value={digit}
                      onChangeText={value => handleOtpChange(value, index)}
                      onKeyPress={e => handleKeyPress(e, index)}
                      onFocus={() => setFocusedIndex(index)}
                      keyboardType="number-pad"
                      maxLength={1}
                      autoFocus={index === 0}
                      selectionColor={COLORS.primary}
                      style={[
                        styles.otpInput,
                        isFilled && styles.otpInputFilled,
                        isFocused && styles.otpInputFocused,
                        error && styles.otpInputError,
                      ]}
                    />
                  );
                })}
              </Animated.View>

              {/* Error Message Display */}
              {error ? (
                <View style={styles.errorWrapper}>
                  <Ionicons
                    name="alert-circle"
                    size={16}
                    color={COLORS.danger}
                  />
                  <Text style={styles.errorText}>{error}</Text>
                </View>
              ) : null}

              {/* Resend OTP Timer Section */}
              <View style={styles.resendContainer}>
                <Text style={styles.resendText}>Didn't receive the code? </Text>
                <Pressable
                  onPress={handleResend}
                  disabled={seconds > 0 || loading}
                >
                  <Text
                    style={[
                      styles.resendBtnText,
                      seconds > 0 && styles.resendBtnDisabled,
                    ]}
                  >
                    {seconds > 0 ? `Resend in ${seconds}s` : 'Resend OTP'}
                  </Text>
                </Pressable>
              </View>

              {/* CTA Action Button */}
              <Animated.View style={{ transform: [{ scale: buttonScale }] }}>
                <Pressable
                  onPress={handleVerify}
                  onPressIn={() => buttonScale.setValue(0.97)}
                  onPressOut={() => buttonScale.setValue(1)}
                  disabled={!isOtpComplete || loading}
                  style={[
                    styles.buttonTouchArea,
                    (!isOtpComplete || loading) && styles.disabledButtonState,
                  ]}
                >
                  <LinearGradient
                    colors={[COLORS.primary, COLORS.primaryDark]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.continueButton}
                  >
                    {loading ? (
                      <ActivityIndicator color="#FFF" size="small" />
                    ) : (
                      <View style={styles.buttonContent}>
                        <Text style={styles.continueButtonText}>
                          Verify & Continue
                        </Text>
                        <Ionicons
                          name="checkmark-done"
                          size={20}
                          color="#FFF"
                          style={styles.buttonIcon}
                        />
                      </View>
                    )}
                  </LinearGradient>
                </Pressable>
              </Animated.View>
            </View>

            {/* Footer Information */}
            <View style={styles.footer}>
              <Ionicons
                name="lock-closed-outline"
                size={14}
                color={COLORS.muted}
              />
              <Text style={styles.footerText}>
                Secured with end-to-end encryption
              </Text>
            </View>
          </Animated.View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradientBackground: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  container: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'space-between',
  },
  topBar: {
    paddingTop: 8,
    alignItems: 'flex-start',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  backButtonPressed: {
    opacity: 0.7,
  },
  heroSection: {
    alignItems: 'center',
    marginTop: 10,
  },
  iconContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  iconCircle: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: '#FFF0EA',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 107, 53, 0.2)',
  },
  checkBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: COLORS.success,
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: COLORS.white,
  },
  heading: {
    fontSize: 24,
    fontWeight: '800',
    color: COLORS.title,
    textAlign: 'center',
    letterSpacing: -0.4,
  },
  subHeading: {
    marginTop: 6,
    fontSize: 14,
    color: COLORS.text,
    textAlign: 'center',
  },
  phoneBadgeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    backgroundColor: 'rgba(255, 107, 53, 0.08)',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
  },
  phoneNumberText: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.title,
    marginRight: 8,
    letterSpacing: 0.5,
  },
  formSection: {
    marginTop: 32,
    flex: 1,
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
  },
  otpInput: {
    width: (width - 48 - 40) / 6,
    height: 56,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    backgroundColor: COLORS.inputBg,
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.title,
    textAlign: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 2,
  },
  otpInputFilled: {
    borderColor: COLORS.primary,
    backgroundColor: '#FFF9F6',
  },
  otpInputFocused: {
    borderColor: COLORS.primary,
    borderWidth: 2,
    backgroundColor: COLORS.white,
  },
  otpInputError: {
    borderColor: COLORS.danger,
    backgroundColor: '#FEF2F2',
  },
  errorWrapper: {
    marginTop: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorText: {
    marginLeft: 6,
    color: COLORS.danger,
    fontSize: 12,
    fontWeight: '600',
  },
  resendContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 24,
  },
  resendText: {
    fontSize: 13,
    color: COLORS.text,
  },
  resendBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.primary,
  },
  resendBtnDisabled: {
    color: COLORS.muted,
  },
  buttonTouchArea: {
    marginTop: 28,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 5,
  },
  disabledButtonState: {
    opacity: 0.55,
    shadowOpacity: 0,
    elevation: 0,
  },
  continueButton: {
    height: 54,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  continueButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  buttonIcon: {
    marginLeft: 8,
  },
  footer: {
    paddingBottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  footerText: {
    marginLeft: 6,
    fontSize: 12,
    color: COLORS.muted,
    fontWeight: '500',
  },
});
