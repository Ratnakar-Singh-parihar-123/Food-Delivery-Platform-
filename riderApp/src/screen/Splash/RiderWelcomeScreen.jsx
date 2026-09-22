import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  StatusBar,
  StyleSheet,
  Text,
  View,
  Dimensions,
  ImageBackground,
  Pressable,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Ionicons from 'react-native-vector-icons/Ionicons';
import LinearGradient from 'react-native-linear-gradient';

const { width, height } = Dimensions.get('window');

const LOGO_IMAGE = require('../../assets/logo/foodmitra.png');
const RIDER_IMAGE = require('../../assets/image/riderbg.png');

export default function RiderWelcomeScreen({ navigation }) {
  const [loading, setLoading] = useState(true);
  const [tokenExists, setTokenExists] = useState(false);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideUp = useRef(new Animated.Value(30)).current;

  // ─── Token Check ────────────────────────────────────────
  useEffect(() => {
    const checkToken = async () => {
      try {
        const token = await AsyncStorage.getItem('riderToken');
        if (token) {
          // ✅ Token found → directly go to Home
          setTokenExists(true);
          navigation.reset({
            index: 0,
            routes: [{ name: 'RiderTabs' }],
          });
        } else {
          setTokenExists(false);
          // Start entrance animation after token check
          startAnimation();
        }
      } catch (error) {
        console.warn('Token check error:', error);
        setTokenExists(false);
        startAnimation();
      } finally {
        setLoading(false);
      }
    };

    checkToken();
  }, []);

  // ─── Entrance Animation ─────────────────────────────────
  const startAnimation = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.spring(slideUp, {
        toValue: 0,
        tension: 40,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();
  };

  // ─── Loading State ──────────────────────────────────────
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF5722" />
      </View>
    );
  }

  // ─── If token exists, we already navigated ─────────────
  // (But just in case, render nothing)
  if (tokenExists) {
    return null;
  }

  return (
    <ImageBackground
      source={RIDER_IMAGE}
      style={styles.backgroundImage}
      resizeMode="cover"
    >
      <SafeAreaView style={styles.safeArea}>
        <StatusBar
          barStyle="light-content"
          backgroundColor="transparent"
          translucent
        />

        <Animated.View
          style={[
            styles.container,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideUp }],
            },
          ]}
        >
          {/* --- Top Logo Circle (Chota Logo) --- */}
          <View style={styles.logoContainer}>
            <View style={styles.logoCircle}>
              <Animated.Image
                source={LOGO_IMAGE}
                style={[
                  styles.logoImage,
                  {
                    transform: [
                      {
                        scale: fadeAnim.interpolate({
                          inputRange: [0, 1],
                          outputRange: [0.8, 1],
                        }),
                      },
                    ],
                  },
                ]}
                resizeMode="contain"
              />
            </View>
          </View>

          {/* --- Brand Name & Tagline --- */}
          <View style={styles.brandContainer}>
            <Text style={styles.brandText}>
              Food<Text style={styles.brandHighlight}>Mitra</Text>
            </Text>
            <View style={styles.underline} />
            <Text style={styles.tagline}>Partner for every delivery</Text>
          </View>

          {/* --- Spacer to push content up --- */}
          <View style={{ flex: 1 }} />

          {/* --- Get Started Button with Circle Arrow --- */}
          <Pressable
            onPress={() => navigation?.navigate('RiderPhoneLogin')}
            style={({ pressed }) => [
              styles.button,
              pressed && styles.buttonPressed,
            ]}
          >
            <LinearGradient
              colors={['#FF5722', '#FF6E40']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.buttonGradient}
            >
              <Text style={styles.buttonText}>Get Started</Text>
              <View style={styles.arrowCircle}>
                <Ionicons name="arrow-forward" size={20} color="#FF5722" />
              </View>
            </LinearGradient>
          </Pressable>

          {/* --- Footer with Lock Icon --- */}
          <View style={styles.footerContainer}>
            <Ionicons
              name="lock-closed"
              size={14}
              color="#FFFFFF"
              style={styles.lockIcon}
            />
            <Text style={styles.terms}>
              By continuing you agree to our{'\n'}
              <Text style={styles.link}>Terms & Privacy Policy</Text>
            </Text>
          </View>
        </Animated.View>
      </SafeAreaView>
    </ImageBackground>
  );
}

// --- Styles ----------------------------------------------
const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    width: width,
    height: height,
  },
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 20,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFF8F5',
  },

  /* Top Logo Circle (Updated Sizes) */
  logoContainer: {
    alignItems: 'center',
    marginTop: 10,
  },
  logoCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 6,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    overflow: 'hidden',
  },
  imageOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
  },
  logoImage: {
    width: 100,
    height: 100,
  },
  logoTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#E65100',
    fontFamily: 'sans-serif-condensed',
    marginTop: 2,
  },
  logoSubtitle: {
    fontSize: 7,
    fontWeight: '700',
    color: '#555',
    letterSpacing: 0.8,
  },

  /* Brand Heading */
  brandContainer: {
    alignItems: 'center',
    marginVertical: 10,
  },
  brandText: {
    fontSize: 32,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: -0.5,
  },
  brandHighlight: {
    color: '#dd3409',
  },
  underline: {
    width: 60,
    height: 4,
    backgroundColor: '#FF5722',
    borderRadius: 2,
    marginVertical: 8,
  },
  tagline: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    marginTop: 2,
  },

  /* Action Button */
  button: {
    width: '100%',
    height: 58,
    borderRadius: 30,
    overflow: 'hidden',
    elevation: 6,
    shadowColor: '#FF5722',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    marginBottom: 10,
  },
  buttonGradient: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  buttonPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.99 }],
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
    flex: 1,
    textAlign: 'center',
    marginLeft: 30,
  },
  arrowCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },

  /* Footer Terms */
  footerContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  lockIcon: {
    marginRight: 6,
    marginTop: 2,
  },
  terms: {
    fontSize: 12,
    color: '#FFFFFF',
    textAlign: 'center',
    fontWeight: '500',
    lineHeight: 18,
  },
  link: {
    color: '#FFCC80',
    fontWeight: '700',
    textDecorationLine: 'underline',
  },
});
