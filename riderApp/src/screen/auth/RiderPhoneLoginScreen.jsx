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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import LinearGradient from 'react-native-linear-gradient';
import AppLogo from '../../components/AppLogo';
import { riderSendOtp } from '../../api/riderApi';

const COLORS = {
  primary: '#FF5722',
  primaryDark: '#E64A19',
  primaryLight: '#FF6E40',
  title: '#1E293B',
  text: '#475569',
  muted: '#94A3B8',
  border: '#E2E8F0',
  inputBg: '#FFFFFF',
  danger: '#EF4444',
  success: '#16A34A',
  white: '#FFFFFF',
};

export default function RiderPhoneLoginScreen({ navigation }) {
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isFocused, setIsFocused] = useState(false);

  // ── Animations ──
  const screenOpacity = useRef(new Animated.Value(0)).current;
  const screenTranslateY = useRef(new Animated.Value(20)).current;
  const buttonScale = useRef(new Animated.Value(1)).current;
  const errorShake = useRef(new Animated.Value(0)).current;
  const inputScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(screenOpacity, {
        toValue: 1,
        duration: 500,
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

  useEffect(() => {
    Animated.spring(inputScale, {
      toValue: isFocused ? 1.02 : 1,
      friction: 6,
      useNativeDriver: true,
    }).start();
  }, [isFocused]);

  const handlePhoneChange = value => {
    const cleaned = value.replace(/[^0-9]/g, '');
    setPhone(cleaned.slice(0, 10));
    if (error) setError('');
  };

  const handleContinue = async () => {
    const trimmedPhone = phone.trim();
    if (trimmedPhone.length !== 10) {
      setError('Please enter a valid 10‑digit mobile number.');
      return;
    }
    try {
      setLoading(true);
      setError('');
      const response = await riderSendOtp({ phone: trimmedPhone });
      const riderId =
        response.data?.riderId ||
        response.riderId ||
        response.data?.data?.riderId;
      if (!riderId) {
        throw new Error('Invalid server response – riderId missing.');
      }
      navigation.navigate('RiderOtpVerification', {
        phoneNumber: trimmedPhone,
        riderId,
      });
    } catch (err) {
      const status = err.response?.status;
      let message =
        err.response?.data?.message ||
        err.message ||
        'Failed to send OTP. Please try again.';
      if (status === 400) {
        message = 'Invalid phone number or user already registered.';
      } else if (status === 429) {
        message = 'Too many attempts. Please wait a moment.';
      }
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const isValid = phone.length === 10;

  return (
    <LinearGradient
      colors={['#FEF9F5', '#FFF3EB', '#FFFFFF']}
      style={styles.gradientBackground}
    >
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="dark-content" backgroundColor="#FEF9F5" />
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
                accessibilityLabel="Go back"
              >
                <Ionicons name="arrow-back" size={22} color={COLORS.title} />
              </Pressable>
            </View>

            {/* Hero Section */}
            <View style={styles.heroSection}>
              <View style={styles.logoWrapper}>
                <AppLogo
                  size={80}
                  showName
                  brandLetters={['F', 'o', 'o', 'd', 'm', 'i', 't', 'r', 'a']}
                  showTagline={false}
                  textColor={COLORS.title}
                  highlightColor={COLORS.primary}
                  underlineColor={COLORS.primary}
                />
              </View>

              <Text style={styles.heading}>Enter your mobile number</Text>
              <Text style={styles.subHeading}>
                We'll send a 6‑digit OTP to verify your account
              </Text>
            </View>

            {/* Form Section */}
            <View style={styles.formSection}>
              <Text style={styles.label}>MOBILE NUMBER</Text>

              <Animated.View
                style={[
                  styles.inputWrapper,
                  error && styles.inputWrapperError,
                  isFocused && styles.inputWrapperFocused,
                  {
                    transform: [
                      { translateX: errorShake },
                      { scale: inputScale },
                    ],
                  },
                ]}
              >
                <View style={styles.countryCodeBadge}>
                  <Text style={styles.flag}>🇮🇳</Text>
                  <Text style={styles.countryCodeText}>+91</Text>
                </View>

                <View style={styles.verticalDivider} />

                <TextInput
                  value={phone}
                  onChangeText={handlePhoneChange}
                  placeholder="00000 00000"
                  placeholderTextColor={COLORS.muted}
                  keyboardType="number-pad"
                  maxLength={10}
                  autoFocus
                  style={styles.input}
                  selectionColor={COLORS.primary}
                  editable={!loading}
                  onFocus={() => setIsFocused(true)}
                  onBlur={() => setIsFocused(false)}
                  accessibilityLabel="Phone number input"
                />

                {isValid && !loading && (
                  <Ionicons
                    name="checkmark-circle"
                    size={22}
                    color={COLORS.success}
                  />
                )}
              </Animated.View>

              {error ? (
                <View style={styles.errorWrapper}>
                  <Ionicons
                    name="alert-circle"
                    size={16}
                    color={COLORS.danger}
                  />
                  <Text style={styles.errorText}>{error}</Text>
                </View>
              ) : (
                <Text style={styles.helperText}>
                  We'll send an SMS to verify this phone number.
                </Text>
              )}

              <Animated.View style={{ transform: [{ scale: buttonScale }] }}>
                <Pressable
                  onPress={handleContinue}
                  onPressIn={() => buttonScale.setValue(0.97)}
                  onPressOut={() => buttonScale.setValue(1)}
                  disabled={loading || !isValid}
                  style={[
                    styles.buttonTouchArea,
                    (!isValid || loading) && styles.disabledButtonState,
                  ]}
                  accessibilityLabel="Get OTP"
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
                        <Text style={styles.continueButtonText}>Get OTP</Text>
                        <Ionicons
                          name="arrow-forward"
                          size={18}
                          color="#FFF"
                          style={styles.buttonIcon}
                        />
                      </View>
                    )}
                  </LinearGradient>
                </Pressable>
              </Animated.View>
            </View>

            {/* Footer */}
            <View style={styles.footer}>
              <Text style={styles.termsText}>
                By continuing, you agree to our{' '}
                <Text style={styles.termsLink}>Terms of Service</Text> &{' '}
                <Text style={styles.termsLink}>Privacy Policy</Text>
              </Text>
            </View>
          </Animated.View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </LinearGradient>
  );
}

// ─── Styles ──────────────────────────────────────────────────
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
    borderRadius: 14,
    backgroundColor: COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  backButtonPressed: {
    opacity: 0.7,
    transform: [{ scale: 0.96 }],
  },
  heroSection: {
    alignItems: 'center',
    marginTop: 8,
    paddingHorizontal: 12,
  },
  logoWrapper: {
    marginBottom: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heading: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.title,
    textAlign: 'center',
    letterSpacing: -0.3,
  },
  subHeading: {
    marginTop: 6,
    fontSize: 14,
    color: COLORS.text,
    textAlign: 'center',
    lineHeight: 20,
  },
  formSection: {
    marginTop: 24,
    flex: 1,
  },
  label: {
    fontSize: 10,
    fontWeight: '800',
    color: COLORS.muted,
    marginBottom: 8,
    letterSpacing: 1.2,
    textAlign: 'center',
  },
  inputWrapper: {
    height: 56,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    backgroundColor: COLORS.inputBg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 2,
    transitionDuration: '0.2s',
  },
  inputWrapperFocused: {
    borderColor: COLORS.primary,
  },
  inputWrapperError: {
    borderColor: COLORS.danger,
    backgroundColor: '#FEF2F2',
  },
  countryCodeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  flag: {
    marginRight: 6,
    fontSize: 18,
  },
  countryCodeText: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.title,
  },
  verticalDivider: {
    width: 1,
    height: 24,
    marginHorizontal: 12,
    backgroundColor: COLORS.border,
  },
  input: {
    flex: 1,
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.title,
    paddingVertical: 0,
    letterSpacing: 1.5,
  },
  helperText: {
    marginTop: 10,
    color: COLORS.muted,
    fontSize: 12,
    textAlign: 'center',
  },
  errorWrapper: {
    marginTop: 8,
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
  buttonTouchArea: {
    marginTop: 24,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 5,
  },
  disabledButtonState: {
    opacity: 0.5,
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
  },
  termsText: {
    fontSize: 12,
    color: COLORS.muted,
    textAlign: 'center',
    lineHeight: 18,
  },
  termsLink: {
    color: COLORS.primary,
    fontWeight: '700',
  },
});
