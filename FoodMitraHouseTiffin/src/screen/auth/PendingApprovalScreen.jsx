// screens/PendingApprovalScreen.js
import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  RefreshControl,
  ScrollView,
  ActivityIndicator,
  Pressable,
  StatusBar,
  Animated,
  Dimensions,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Ionicons from '@react-native-vector-icons/ionicons';
import { COLORS } from '../../constants/colors';
import { getApproved, setApproved, clearAll } from '../../utils/storage';

const { width, height } = Dimensions.get('window');

const PendingApprovalScreen = ({ navigation }) => {
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(false);

  // Animation for pulsing icon
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Pulse animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.2,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
      ]),
    ).start();

    // Rotation animation
    Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 4000,
        useNativeDriver: true,
      }),
    ).start();
  }, []);

  const rotate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const checkApproval = async () => {
    setLoading(true);
    try {
      const approved = await getApproved();
      if (approved) {
        navigation.replace('PartnerTabs');
      } else {
        // still pending
      }
    } catch (error) {
      console.warn('Check approval error:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    checkApproval();
  };

  // For demo: simulate approval
  const simulateApproval = async () => {
    await setApproved(true);
    navigation.replace('PartnerTabs');
  };

  const handleLogout = async () => {
    await clearAll();
    navigation.replace('Auth');
  };

  return (
    <View style={styles.container}>
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

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[COLORS.white]}
            tintColor={COLORS.white}
            progressBackgroundColor="rgba(255,255,255,0.2)"
          />
        }
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.card}>
          {/* Animated Icon */}
          <Animated.View
            style={[
              styles.iconWrapper,
              {
                transform: [{ scale: pulseAnim }, { rotate }],
              },
            ]}
          >
            <LinearGradient
              colors={[COLORS.primary, COLORS.primaryDark]}
              style={styles.iconGradient}
            >
              <Ionicons
                name="hourglass-outline"
                size={60}
                color={COLORS.white}
              />
            </LinearGradient>
          </Animated.View>

          <Text style={styles.title}>Awaiting Approval</Text>
          <Text style={styles.subtitle}>
            Your tiffin house profile is under review by our team.
            {'\n'}You will be notified once approved.
          </Text>

          {/* Status Steps */}
          <View style={styles.stepsContainer}>
            <View style={styles.step}>
              <View style={[styles.stepDot, styles.stepCompleted]}>
                <Ionicons name="checkmark" size={12} color={COLORS.white} />
              </View>
              <Text style={styles.stepText}>Profile Submitted</Text>
            </View>
            <View style={styles.stepLine} />
            <View style={styles.step}>
              <View style={[styles.stepDot, styles.stepActive]}>
                <ActivityIndicator size="small" color={COLORS.white} />
              </View>
              <Text style={styles.stepTextActive}>Under Review</Text>
            </View>
            <View style={styles.stepLine} />
            <View style={styles.step}>
              <View style={styles.stepDot}>
                <Ionicons name="time-outline" size={14} color={COLORS.muted} />
              </View>
              <Text style={styles.stepText}>Approved</Text>
            </View>
          </View>

          {/* Action Buttons */}
          <Pressable
            style={({ pressed }) => [
              styles.primaryBtn,
              pressed && styles.btnPressed,
            ]}
            onPress={onRefresh}
            disabled={loading}
          >
            <LinearGradient
              colors={[COLORS.primary, COLORS.primaryDark]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.primaryGradient}
            >
              {loading ? (
                <ActivityIndicator color={COLORS.white} size="small" />
              ) : (
                <>
                  <Text style={styles.primaryBtnText}>Check Status</Text>
                  <Ionicons
                    name="refresh-outline"
                    size={18}
                    color={COLORS.white}
                  />
                </>
              )}
            </LinearGradient>
          </Pressable>

          <Pressable style={styles.logoutBtn} onPress={handleLogout}>
            <Ionicons name="log-out-outline" size={18} color={COLORS.muted} />
            <Text style={styles.logoutText}>Logout</Text>
          </Pressable>

          {/* Demo Simulate Button (hidden in production) */}
          <Pressable style={styles.simulateBtn} onPress={simulateApproval}>
            <Text style={styles.simulateText}>🔓 Simulate Approval (Demo)</Text>
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
};

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

  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 40,
  },

  // ─── CARD ──────────────────────────────────────────────────
  card: {
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 10,
  },

  // ─── ICON ──────────────────────────────────────────────────
  iconWrapper: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 16,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  iconGradient: {
    flex: 1,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // ─── TYPOGRAPHY ──────────────────────────────────────────
  title: {
    fontSize: 24,
    fontWeight: '900',
    color: COLORS.title,
    marginTop: 4,
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.muted,
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 20,
  },

  // ─── STEPS ──────────────────────────────────────────────────
  stepsContainer: {
    marginTop: 24,
    width: '100%',
    paddingHorizontal: 8,
  },
  step: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  stepDot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#e5e7eb',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#e5e7eb',
  },
  stepCompleted: {
    backgroundColor: COLORS.success,
    borderColor: COLORS.success,
  },
  stepActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  stepText: {
    fontSize: 14,
    color: COLORS.muted,
    fontWeight: '500',
  },
  stepTextActive: {
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: '700',
  },
  stepLine: {
    width: 2,
    height: 16,
    backgroundColor: '#e5e7eb',
    marginLeft: 13,
  },

  // ─── BUTTONS ──────────────────────────────────────────────
  primaryBtn: {
    marginTop: 24,
    borderRadius: 12,
    overflow: 'hidden',
    width: '100%',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  primaryGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    gap: 8,
  },
  primaryBtnText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '700',
  },
  btnPressed: {
    transform: [{ scale: 0.97 }],
  },

  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
    paddingVertical: 8,
    gap: 6,
  },
  logoutText: {
    color: COLORS.muted,
    fontSize: 14,
    fontWeight: '500',
  },

  // ─── DEMO ──────────────────────────────────────────────────
  simulateBtn: {
    marginTop: 20,
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: '#f3f4f6',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  simulateText: {
    color: '#3b82f6',
    fontSize: 12,
    fontWeight: '600',
  },
});

export default PendingApprovalScreen;
