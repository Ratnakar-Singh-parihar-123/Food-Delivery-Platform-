// screens/AuthScreen.js
import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  Animated,
  Dimensions,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Ionicons from '@react-native-vector-icons/ionicons';
import { COLORS } from '../../constants/colors';
import { storeToken, storeUserData, setApproved } from '../../utils/storage';

const { width, height } = Dimensions.get('window');

// ─── SIMULATED API ──────────────────────────────────────────
const sendOtp = async phone => {
  await new Promise(resolve => setTimeout(resolve, 1000));
  return { success: true, otp: '1234' };
};

const verifyOtp = async (phone, otp) => {
  await new Promise(resolve => setTimeout(resolve, 1000));
  const exists = phone.endsWith('9999');
  const approved = phone.endsWith('9999');
  return {
    success: true,
    exists,
    approved,
    user: { id: '1', name: 'Test Tiffin' },
  };
};

// ─── MAIN COMPONENT ──────────────────────────────────────────
const AuthScreen = ({ navigation }) => {
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState('phone');
  const [loading, setLoading] = useState(false);

  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideUp = useRef(new Animated.Value(30)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(slideUp, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 40,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleSendOtp = async () => {
    if (phone.length < 10) {
      Alert.alert('Error', 'Please enter a valid phone number');
      return;
    }
    setLoading(true);
    try {
      const res = await sendOtp(phone);
      if (res.success) {
        setStep('otp');
        Alert.alert('OTP Sent', 'Check your SMS (dummy: 1234)');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (otp.length < 4) {
      Alert.alert('Error', 'Enter 4-digit OTP');
      return;
    }
    setLoading(true);
    try {
      const res = await verifyOtp(phone, otp);
      if (res.success) {
        if (res.exists && res.approved) {
          await storeToken('dummy_token');
          await storeUserData(res.user);
          await setApproved(true);
          navigation.replace('PartnerTabs');
        } else if (res.exists && !res.approved) {
          await storeToken('dummy_token');
          await storeUserData(res.user);
          await setApproved(false);
          navigation.replace('PendingApproval');
        } else {
          await storeToken('dummy_token');
          await storeUserData({ phone });
          navigation.replace('CreateProfile');
        }
      } else {
        Alert.alert('Error', 'Invalid OTP');
      }
    } catch (error) {
      Alert.alert('Error', 'Verification failed');
    } finally {
      setLoading(false);
    }
  };

  const renderPhoneStep = () => (
    <>
      <View style={styles.inputWrapper}>
        <Ionicons
          name="call-outline"
          size={20}
          color={COLORS.primary}
          style={styles.inputIcon}
        />
        <TextInput
          style={styles.input}
          placeholder="Phone Number"
          placeholderTextColor="#9ca3af"
          keyboardType="phone-pad"
          maxLength={10}
          value={phone}
          onChangeText={setPhone}
        />
      </View>
      <Pressable
        style={({ pressed }) => [
          styles.button,
          pressed && styles.buttonPressed,
        ]}
        onPress={handleSendOtp}
        disabled={loading}
      >
        <LinearGradient
          colors={[COLORS.primary, COLORS.primaryDark]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.buttonGradient}
        >
          {loading ? (
            <ActivityIndicator color={COLORS.white} />
          ) : (
            <>
              <Text style={styles.buttonText}>Send OTP</Text>
              <Ionicons name="arrow-forward" size={20} color={COLORS.white} />
            </>
          )}
        </LinearGradient>
      </Pressable>
    </>
  );

  const renderOtpStep = () => (
    <>
      <View style={styles.inputWrapper}>
        <Ionicons
          name="key-outline"
          size={20}
          color={COLORS.primary}
          style={styles.inputIcon}
        />
        <TextInput
          style={styles.input}
          placeholder="Enter OTP"
          placeholderTextColor="#9ca3af"
          keyboardType="number-pad"
          maxLength={4}
          value={otp}
          onChangeText={setOtp}
        />
      </View>
      <Pressable
        style={({ pressed }) => [
          styles.button,
          pressed && styles.buttonPressed,
        ]}
        onPress={handleVerifyOtp}
        disabled={loading}
      >
        <LinearGradient
          colors={[COLORS.primary, COLORS.primaryDark]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.buttonGradient}
        >
          {loading ? (
            <ActivityIndicator color={COLORS.white} />
          ) : (
            <>
              <Text style={styles.buttonText}>Verify OTP</Text>
              <Ionicons
                name="checkmark-circle"
                size={20}
                color={COLORS.white}
              />
            </>
          )}
        </LinearGradient>
      </Pressable>
      <View style={styles.otpFooter}>
        <Pressable onPress={() => setStep('phone')}>
          <Text style={styles.backText}>Change phone number</Text>
        </Pressable>
        <Pressable onPress={handleSendOtp}>
          <Text style={styles.resendText}>Resend OTP</Text>
        </Pressable>
      </View>
    </>
  );

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 40 : 0}
    >
      <StatusBar
        barStyle="light-content"
        backgroundColor="transparent"
        translucent
      />

      {/* Gradient Background */}
      <LinearGradient
        colors={['#ff7a2f', COLORS.primary, COLORS.primaryDark]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.background}
      />

      {/* Decorative circles */}
      <View style={styles.decoCircle1} />
      <View style={styles.decoCircle2} />

      <Animated.View
        style={[
          styles.inner,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideUp }, { scale: scaleAnim }],
          },
        ]}
      >
        {/* Logo / Brand */}
        <View style={styles.brandContainer}>
          <View style={styles.logoCircle}>
            <Ionicons
              name="restaurant-outline"
              size={40}
              color={COLORS.white}
            />
          </View>
          <Text style={styles.title}>Tiffin Partner</Text>
          <Text style={styles.subtitle}>
            {step === 'phone'
              ? 'Enter your phone number to continue'
              : 'Enter the OTP sent to your phone'}
          </Text>
        </View>

        {/* Input area */}
        <View style={styles.formContainer}>
          {step === 'phone' ? renderPhoneStep() : renderOtpStep()}
        </View>
      </Animated.View>
    </KeyboardAvoidingView>
  );
};

// ─── STYLES ──────────────────────────────────────────────
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.primary,
  },
  background: {
    ...StyleSheet.absoluteFillObject,
  },

  // ─── DECORATIVE ──────────────────────────────────────────
  decoCircle1: {
    position: 'absolute',
    width: width * 0.6,
    height: width * 0.6,
    borderRadius: width * 0.3,
    backgroundColor: 'rgba(255,255,255,0.08)',
    top: -width * 0.2,
    right: -width * 0.15,
  },
  decoCircle2: {
    position: 'absolute',
    width: width * 0.8,
    height: width * 0.8,
    borderRadius: width * 0.4,
    backgroundColor: 'rgba(255,255,255,0.04)',
    bottom: -width * 0.3,
    left: -width * 0.3,
  },

  // ─── INNER CONTENT ──────────────────────────────────────
  inner: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 30,
    paddingBottom: 40,
  },

  brandContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  title: {
    fontSize: 28,
    fontWeight: '900',
    color: COLORS.white,
    letterSpacing: 0.5,
    textShadowColor: 'rgba(0,0,0,0.1)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  subtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 6,
    textAlign: 'center',
    fontWeight: '500',
  },

  // ─── FORM ─────────────────────────────────────────────────
  formContainer: {
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: 24,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 10,
  },

  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 14,
    backgroundColor: COLORS.white,
    marginBottom: 16,
    paddingHorizontal: 12,
  },
  inputIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    height: 52,
    fontSize: 16,
    color: COLORS.title,
    paddingVertical: 0,
  },
  button: {
    borderRadius: 14,
    overflow: 'hidden',
    marginBottom: 10,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonPressed: {
    transform: [{ scale: 0.97 }],
  },
  buttonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    gap: 8,
  },
  buttonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '700',
  },

  // ─── OTP STEP ──────────────────────────────────────────────
  otpFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  backText: {
    color: COLORS.muted,
    fontSize: 13,
    fontWeight: '500',
  },
  resendText: {
    color: COLORS.primary,
    fontSize: 13,
    fontWeight: '600',
  },
});

export default AuthScreen;
