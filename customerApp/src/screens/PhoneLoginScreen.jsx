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
import { getAuth, signInWithPhoneNumber } from '@react-native-firebase/auth';
import Ionicons from '@react-native-vector-icons/ionicons';
import AppLogo from '../components/AppLogo';

export default function PhoneLoginScreen({ navigation }) {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isFocused, setIsFocused] = useState(false);

  // ── Animations ──
  const screenOpacity = useRef(new Animated.Value(0)).current;
  const screenTranslateY = useRef(new Animated.Value(20)).current;
  const buttonScale = useRef(new Animated.Value(1)).current;
  const errorShake = useRef(new Animated.Value(0)).current;

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
    ]).start();
  }, []);

  // Shake animation for invalid input/error
  useEffect(() => {
    if (error) {
      Animated.sequence([
        Animated.timing(errorShake, {
          toValue: 10,
          duration: 50,
          useNativeDriver: true,
        }),
        Animated.timing(errorShake, {
          toValue: -10,
          duration: 50,
          useNativeDriver: true,
        }),
        Animated.timing(errorShake, {
          toValue: 8,
          duration: 50,
          useNativeDriver: true,
        }),
        Animated.timing(errorShake, {
          toValue: -8,
          duration: 50,
          useNativeDriver: true,
        }),
        Animated.timing(errorShake, {
          toValue: 0,
          duration: 50,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [error]);

  // ── Handlers ──
  const handlePhoneChange = value => {
    const cleaned = value.replace(/[^0-9]/g, '');
    setPhoneNumber(cleaned.slice(0, 10));
    if (error) setError('');
  };

  const handleContinue = async () => {
    if (phoneNumber.length !== 10) {
      setError('Please enter a valid 10-digit mobile number.');
      return;
    }

    try {
      setLoading(true);
      setError('');
      const auth = getAuth();
      const confirmation = await signInWithPhoneNumber(
        auth,
        '+91' + phoneNumber,
      );

      navigation.navigate('OtpVerification', {
        phoneNumber,
        confirmation,
      });
    } catch (err) {
      console.log('Firebase OTP Error:', err);
      setError(err.message || 'Failed to send OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const animateButton = pressed => {
    Animated.spring(buttonScale, {
      toValue: pressed ? 0.96 : 1,
      useNativeDriver: true,
    }).start();
  };

  const isValid = phoneNumber.length === 10;

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
          {/* Subtle Ambient Decorative Glows */}
          <View style={styles.topDecorationContainer} pointerEvents="none">
            <View style={styles.ambientGlowPrimary} />
          </View>

          {/* Upper Content Group */}
          <View style={styles.topSection}>
            {/* Header & Branding */}
            <View style={styles.header}>
              <View style={styles.logoWrapper}>
                <AppLogo size={68} showName={false} />
              </View>

              <Text style={styles.brandTitle}>FoodMitra</Text>
              <Text style={styles.heading}>Welcome Back</Text>
              <Text style={styles.description}>
                Enter your mobile number to discover delicious food from top
                restaurants.
              </Text>
            </View>

            {/* Input Section - Seamless & Close to Description */}
            <View style={styles.formSection}>
              <View style={styles.labelRow}>
                <Text style={styles.label}>Mobile Number</Text>
                <Text style={styles.labelSubText}>Require 10 digits</Text>
              </View>

              <Animated.View
                style={[
                  styles.inputContainer,
                  isFocused && styles.inputContainerFocused,
                  error && styles.inputContainerError,
                  { transform: [{ translateX: errorShake }] },
                ]}
              >
                <View style={styles.countryCode}>
                  <Text style={styles.flag}>🇮🇳</Text>
                  <Text style={styles.countryCodeText}>+91</Text>
                </View>

                <View style={styles.divider} />

                <TextInput
                  value={phoneNumber}
                  onChangeText={handlePhoneChange}
                  onFocus={() => setIsFocused(true)}
                  onBlur={() => setIsFocused(false)}
                  placeholder="Enter 10-digit number"
                  placeholderTextColor="#A1A1AA"
                  keyboardType="number-pad"
                  maxLength={10}
                  autoFocus
                  style={styles.input}
                  selectionColor="#FF5A1F"
                  editable={!loading}
                />

                {phoneNumber.length > 0 && !loading && (
                  <TouchableOpacity
                    onPress={() => setPhoneNumber('')}
                    hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                    style={styles.clearIcon}
                  >
                    <Ionicons name="close-circle" size={20} color="#A1A1AA" />
                  </TouchableOpacity>
                )}

                {isValid && !loading && (
                  <Ionicons
                    name="checkmark-circle-sharp"
                    size={22}
                    color="#16A34A"
                  />
                )}
              </Animated.View>

              {/* Status Message */}
              {error ? (
                <View style={styles.errorWrapper}>
                  <Ionicons name="alert-circle" size={15} color="#DC2626" />
                  <Text style={styles.errorText}>{error}</Text>
                </View>
              ) : (
                <Text style={styles.helperText}>
                  An OTP will be sent to this number for verification.
                </Text>
              )}

              {/* Primary Action Button */}
              <Animated.View style={{ transform: [{ scale: buttonScale }] }}>
                <Pressable
                  onPress={handleContinue}
                  onPressIn={() => animateButton(true)}
                  onPressOut={() => animateButton(false)}
                  style={[
                    styles.continueButton,
                    (!isValid || loading) && styles.continueButtonDisabled,
                  ]}
                  disabled={loading || !isValid}
                >
                  {loading ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <>
                      <Text style={styles.continueButtonText}>
                        Send Verification Code
                      </Text>
                      <View style={styles.buttonIconWrapper}>
                        <Ionicons
                          name="arrow-forward"
                          size={16}
                          color={isValid ? '#FF5A1F' : '#9CA3AF'}
                        />
                      </View>
                    </>
                  )}
                </Pressable>
              </Animated.View>

              {/* Compliance Text */}
              <Text style={styles.termsText}>
                By continuing, you agree to our{' '}
                <Text style={styles.termsLink}>Terms of Service</Text> &{' '}
                <Text style={styles.termsLink}>Privacy Policy</Text>.
              </Text>
            </View>
          </View>

          {/* Bottom Security Footer */}
          <View style={styles.secureWrapper}>
            <View style={styles.shieldIconBadge}>
              <Ionicons
                name="shield-checkmark-sharp"
                size={13}
                color="#16A34A"
              />
            </View>
            <Text style={styles.secureText}>
              100% Safe & Secure Verification
            </Text>
          </View>
        </Animated.View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// ── Refined Styles ──
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

  // Ambient Soft Glow
  topDecorationContainer: {
    position: 'absolute',
    top: -60,
    right: -50,
    width: 220,
    height: 220,
  },
  ambientGlowPrimary: {
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: '#FFF0E6',
    opacity: 0.85,
  },

  topSection: {
    width: '100%',
  },

  // Header Section
  header: {
    alignItems: 'center',
    marginTop: 12,
  },
  logoWrapper: {
    padding: 6,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    shadowColor: '#FF5A1F',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 14,
    elevation: 4,
  },
  brandTitle: {
    marginTop: 8,
    fontSize: 16,
    fontWeight: '900',
    color: '#FF5A1F',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  heading: {
    marginTop: 10,
    color: '#0F172A',
    fontSize: 26,
    lineHeight: 32,
    fontWeight: '900',
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  description: {
    maxWidth: 290,
    marginTop: 6,
    color: '#64748B',
    fontSize: 13.5,
    lineHeight: 19,
    fontWeight: '500',
    textAlign: 'center',
  },

  // Form Section (Tight gap from header)
  formSection: {
    width: '100%',
    marginTop: 60,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
    paddingHorizontal: 2,
  },
  label: {
    color: '#1E293B',
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 0.2,
  },
  labelSubText: {
    color: '#94A3B8',
    fontSize: 11,
    fontWeight: '600',
  },

  // Input Field Container
  inputContainer: {
    height: 56,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  inputContainerFocused: {
    borderColor: '#FF5A1F',
    shadowColor: '#FF5A1F',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 4,
  },
  inputContainerError: {
    borderColor: '#EF4444',
    backgroundColor: '#FEF2F2',
  },
  countryCode: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  flag: {
    marginRight: 6,
    fontSize: 18,
  },
  countryCodeText: {
    color: '#0F172A',
    fontSize: 15.5,
    fontWeight: '800',
  },
  divider: {
    width: 1,
    height: 22,
    marginHorizontal: 10,
    backgroundColor: '#E2E8F0',
  },
  input: {
    flex: 1,
    color: '#0F172A',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.5,
    paddingVertical: 0,
  },
  clearIcon: {
    marginRight: 6,
  },

  // Helper & Error Text
  helperText: {
    marginTop: 8,
    marginLeft: 2,
    color: '#94A3B8',
    fontSize: 11.5,
    fontWeight: '500',
  },
  errorWrapper: {
    marginTop: 8,
    marginLeft: 2,
    flexDirection: 'row',
    alignItems: 'center',
  },
  errorText: {
    marginLeft: 5,
    color: '#DC2626',
    fontSize: 11.5,
    fontWeight: '600',
  },

  // Button
  continueButton: {
    height: 54,
    marginTop: 50,
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
  continueButtonDisabled: {
    backgroundColor: '#E2E8F0',
    shadowOpacity: 0,
    elevation: 0,
  },
  continueButtonText: {
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

  // Terms Paragraph
  termsText: {
    marginTop: 14,
    color: '#94A3B8',
    fontSize: 11,
    lineHeight: 16,
    textAlign: 'center',
  },
  termsLink: {
    color: '#FF5A1F',
    fontWeight: '700',
  },

  // Security Badge Footer
  secureWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
  },
  shieldIconBadge: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#DCFCE7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  secureText: {
    marginLeft: 6,
    color: '#64748B',
    fontSize: 11.5,
    fontWeight: '600',
  },
});
