// screens/SplashScreen.js
import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  StatusBar,
  Animated,
  Dimensions,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { COLORS } from '../../constants/colors';

const { width, height } = Dimensions.get('window');

const SplashScreen = () => {
  // ─── Animations ──────────────────────────────────────────
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const translateY = useRef(new Animated.Value(30)).current;
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    // Start animations on mount
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 40,
        friction: 7,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();

    // Optional: pulse animation loop
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 1.05,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
      ]),
    );
    // Start pulse after initial animation
    setTimeout(() => pulse.start(), 1000);

    return () => pulse.stop();
  }, []);

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle="light-content"
        backgroundColor="transparent"
        translucent
      />

      {/* Gradient Background */}
      <LinearGradient
        colors={[COLORS.primary, COLORS.primaryDark, '#d45a1a']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      />

      {/* Decorative Circles (floating elements) */}
      <View style={styles.decoCircle1} />
      <View style={styles.decoCircle2} />

      {/* Animated Content */}
      <Animated.View
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }, { translateY }],
          },
        ]}
      >
        {/* Circular Logo Container with Shadow */}
        <View style={styles.logoWrapper}>
          {!imageError ? (
            <Image
              source={require('../../assets/logo.png')}
              style={styles.logo}
              resizeMode="contain"
              onError={() => setImageError(true)}
            />
          ) : (
            // Fallback text if image fails to load
            <Text style={styles.fallbackIcon}>🍱</Text>
          )}
          {/* Glow Effect */}
          <View style={styles.glowRing} />
        </View>

        <Text style={styles.title}>Tiffin Partner</Text>
        <Text style={styles.subtitle}>Delivering Homely Meals</Text>

        {/* Version / Tagline */}
        <View style={styles.versionContainer}>
          <Text style={styles.versionText}>v2.0.0</Text>
        </View>
      </Animated.View>
    </View>
  );
};

// ─── STYLES ──────────────────────────────────────────────
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.primary,
  },
  gradient: {
    ...StyleSheet.absoluteFillObject,
  },

  // ─── Decorative Elements ────────────────────────────────
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

  // ─── Content ─────────────────────────────────────────────
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 30,
  },
  logoWrapper: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 12,
    marginBottom: 30,
    position: 'relative',
  },
  logo: {
    width: 80,
    height: 80,
    // tintColor removed – your original logo will show as is
  },
  fallbackIcon: {
    fontSize: 60,
    color: COLORS.primary,
  },
  glowRing: {
    position: 'absolute',
    width: 160,
    height: 160,
    borderRadius: 80,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.3)',
    top: -10,
    left: -10,
  },
  title: {
    fontSize: 30,
    fontWeight: '900',
    color: COLORS.white,
    letterSpacing: 0.5,
    textShadowColor: 'rgba(0,0,0,0.1)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 15,
    color: 'rgba(255,255,255,0.85)',
    fontWeight: '500',
    letterSpacing: 0.3,
  },
  versionContainer: {
    position: 'absolute',
    bottom: 50,
    alignSelf: 'center',
  },
  versionText: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
});

export default SplashScreen;
