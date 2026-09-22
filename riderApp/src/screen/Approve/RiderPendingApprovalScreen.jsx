import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Easing,
  StatusBar,
  Pressable,
  ScrollView,
  Linking,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import LinearGradient from 'react-native-linear-gradient';
import { getRiderProfile } from '../../api/riderApi'; // ✅ import

const COLORS = {
  primary: '#FF6B35',
  primaryDark: '#E55A2B',
  primaryLight: '#FFF0EA',
  background: '#FFF8F5',
  white: '#FFFFFF',
  title: '#0F172A',
  text: '#334155',
  muted: '#64748B',
  lightMuted: '#94A3B8',
  border: '#E2E8F0',
  success: '#10B981',
  successBg: '#ECFDF5',
  warning: '#F59E0B',
  warningBg: '#FEF3C7',
};

const STEPS = [
  {
    id: 1,
    title: 'Application Submitted',
    subtitle: 'Profile & details received',
    status: 'completed',
  },
  {
    id: 2,
    title: 'KYC & Document Verification',
    subtitle: 'Verification under review by team',
    status: 'in_progress',
  },
  {
    id: 3,
    title: 'Account Activation',
    subtitle: 'Start taking orders & earning',
    status: 'pending',
  },
];

export default function RiderPendingApprovalScreen({ route, navigation }) {
  const { estimatedHours = 24 } = route.params || {};
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [loading, setLoading] = useState(true); // for initial check

  // Animations (same as before)
  const scale = useRef(new Animated.Value(0.6)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scale, {
        toValue: 1,
        tension: 40,
        friction: 6,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 1,
        duration: 500,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.25,
          duration: 1200,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1200,
          easing: Easing.in(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
    ).start();
  }, []);

  // ─── Check approval status ──────────────────────────────
  const checkApprovalStatus = useCallback(
    async (showLoading = true) => {
      try {
        if (showLoading) setIsRefreshing(true);
        const res = await getRiderProfile();
        const rider = res?.data?.rider;

        if (!rider) {
          // Token might be invalid – go back to login
          navigation.replace('RiderWelcome');
          return;
        }

        const { approvalStatus } = rider;

        if (approvalStatus === 'approved') {
          navigation.replace('RiderTabs');
        } else if (approvalStatus === 'rejected') {
          navigation.replace('RiderRejected', { riderId: rider._id });
        } else {
          // Still pending – optionally update UI (e.g., show a toast)
          Alert.alert(
            'Still Under Review',
            'Your application is still being verified. We will notify you once approved.',
            [{ text: 'OK' }],
          );
        }
      } catch (error) {
        console.error('Status check error:', error);
        Alert.alert('Error', 'Failed to check status. Please try again later.');
      } finally {
        setIsRefreshing(false);
        setLoading(false);
      }
    },
    [navigation],
  );

  // ─── On mount ────────────────────────────────────────────
  useEffect(() => {
    checkApprovalStatus(false); // initial check without showing refresh spinner
  }, []);

  // ─── On focus (e.g., coming back from settings) ──────
  useFocusEffect(
    useCallback(() => {
      checkApprovalStatus(false);
    }, []),
  );

  // ─── Manual refresh ─────────────────────────────────────
  const handleRefresh = () => {
    checkApprovalStatus(true);
  };

  if (loading) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: COLORS.background,
        }}
      >
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        {/* Top Badge */}
        <View style={styles.topBadge}>
          <View style={styles.pulseDot} />
          <Text style={styles.topBadgeText}>REVIEW IN PROGRESS</Text>
        </View>

        {/* Hourglass Radar Section */}
        <View style={styles.radarContainer}>
          <Animated.View
            style={[
              styles.pulseRing,
              {
                transform: [{ scale: pulseAnim }],
                opacity: pulseAnim.interpolate({
                  inputRange: [1, 1.25],
                  outputRange: [0.4, 0],
                }),
              },
            ]}
          />
          <Animated.View
            style={[styles.iconWrapper, { transform: [{ scale }], opacity }]}
          >
            <LinearGradient
              colors={['#FFF0EA', '#FFE4D6']}
              style={styles.iconCircle}
            >
              <Ionicons name="hourglass" size={54} color={COLORS.primary} />
            </LinearGradient>
          </Animated.View>
        </View>

        {/* Heading & Subtitle */}
        <Text style={styles.heading}>Application Under Review</Text>
        <Text style={styles.description}>
          We have safely received your profile & KYC documents. Our partner
          verification team is cross-checking the details.
        </Text>

        {/* Time Estimate Box */}
        <View style={styles.estimateCard}>
          <View style={styles.estimateHeader}>
            <View style={styles.clockIconBg}>
              <Ionicons name="time-outline" size={20} color={COLORS.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.estimateLabel}>
                EXPECTED VERIFICATION TIME
              </Text>
              <Text style={styles.estimateValue}>
                Within ~{estimatedHours} Hours
              </Text>
            </View>
          </View>
          <View style={styles.estimateProgressTrack}>
            <View style={[styles.estimateProgressFill, { width: '65%' }]} />
          </View>
        </View>

        {/* Step Timeline Card */}
        <View style={styles.timelineCard}>
          <Text style={styles.timelineTitle}>Verification Roadmap</Text>

          {STEPS.map((step, index) => {
            const isCompleted = step.status === 'completed';
            const isInProgress = step.status === 'in_progress';

            return (
              <View key={step.id} style={styles.timelineItem}>
                <View style={styles.timelineLeft}>
                  <View
                    style={[
                      styles.timelineIconBg,
                      isCompleted && styles.bgCompleted,
                      isInProgress && styles.bgInProgress,
                    ]}
                  >
                    {isCompleted ? (
                      <Ionicons name="checkmark" size={16} color="#FFF" />
                    ) : isInProgress ? (
                      <Ionicons name="sync" size={16} color={COLORS.primary} />
                    ) : (
                      <Ionicons
                        name="ellipse-outline"
                        size={12}
                        color={COLORS.lightMuted}
                      />
                    )}
                  </View>
                  {index < STEPS.length - 1 && (
                    <View
                      style={[
                        styles.timelineLine,
                        isCompleted && styles.lineCompleted,
                      ]}
                    />
                  )}
                </View>

                <View style={styles.timelineContent}>
                  <Text
                    style={[
                      styles.stepTitle,
                      isInProgress && styles.stepTitleActive,
                    ]}
                  >
                    {step.title}
                  </Text>
                  <Text style={styles.stepSubtitle}>{step.subtitle}</Text>
                </View>
              </View>
            );
          })}
        </View>

        {/* Action Buttons */}
        <View style={styles.actionContainer}>
          <Pressable
            style={[
              styles.refreshBtn,
              isRefreshing && styles.refreshBtnLoading,
            ]}
            onPress={handleRefresh}
            disabled={isRefreshing}
          >
            {isRefreshing ? (
              <ActivityIndicator size="small" color={COLORS.primary} />
            ) : (
              <>
                <Ionicons
                  name="refresh-outline"
                  size={18}
                  color={COLORS.title}
                />
                <Text style={styles.refreshBtnText}>Check Live Status</Text>
              </>
            )}
          </Pressable>

          <Pressable
            style={styles.supportBtn}
            onPress={() => Linking.openURL('mailto:support@yourdomain.com')}
          >
            <Ionicons name="headset-outline" size={18} color={COLORS.muted} />
            <Text style={styles.supportBtnText}>
              Need Help? Contact Support
            </Text>
          </Pressable>
        </View>

        <View style={{ height: 30 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.background },
  container: {
    paddingHorizontal: 20,
    paddingTop: 16,
    alignItems: 'center',
  },

  /* Top Badge */
  topBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: COLORS.warningBg,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 24,
  },
  pulseDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.warning,
  },
  topBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#92400E',
    letterSpacing: 0.8,
  },

  /* Hourglass Radar */
  radarContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  pulseRing: {
    position: 'absolute',
    width: 150,
    height: 150,
    borderRadius: 75,
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  iconWrapper: {
    zIndex: 2,
  },
  iconCircle: {
    width: 110,
    height: 110,
    borderRadius: 55,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 107, 53, 0.25)',
  },

  /* Typography */
  heading: {
    fontSize: 24,
    fontWeight: '900',
    color: COLORS.title,
    letterSpacing: -0.3,
    textAlign: 'center',
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    color: COLORS.muted,
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 10,
    marginBottom: 24,
  },

  /* Time Estimate Card */
  estimateCard: {
    width: '100%',
    backgroundColor: COLORS.white,
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 2,
    marginBottom: 16,
  },
  estimateHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 14,
  },
  clockIconBg: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  estimateLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: COLORS.lightMuted,
    letterSpacing: 0.8,
  },
  estimateValue: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.title,
    marginTop: 2,
  },
  estimateProgressTrack: {
    height: 6,
    backgroundColor: '#F1F5F9',
    borderRadius: 3,
    overflow: 'hidden',
  },
  estimateProgressFill: {
    height: '100%',
    backgroundColor: COLORS.primary,
    borderRadius: 3,
  },

  /* Step Timeline Card */
  timelineCard: {
    width: '100%',
    backgroundColor: COLORS.white,
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 2,
    marginBottom: 20,
  },
  timelineTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.title,
    marginBottom: 16,
  },
  timelineItem: {
    flexDirection: 'row',
    gap: 14,
  },
  timelineLeft: {
    alignItems: 'center',
  },
  timelineIconBg: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  bgCompleted: {
    backgroundColor: COLORS.success,
    borderColor: COLORS.success,
  },
  bgInProgress: {
    backgroundColor: COLORS.primaryLight,
    borderColor: COLORS.primary,
  },
  timelineLine: {
    width: 2,
    height: 32,
    backgroundColor: COLORS.border,
    marginVertical: 2,
  },
  lineCompleted: {
    backgroundColor: COLORS.success,
  },
  timelineContent: {
    flex: 1,
    paddingBottom: 20,
  },
  stepTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.muted,
  },
  stepTitleActive: {
    color: COLORS.primary,
    fontWeight: '800',
  },
  stepSubtitle: {
    fontSize: 12,
    color: COLORS.lightMuted,
    marginTop: 2,
  },

  /* Action Buttons */
  actionContainer: {
    width: '100%',
    gap: 10,
  },
  refreshBtn: {
    height: 50,
    borderRadius: 14,
    backgroundColor: COLORS.white,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  refreshBtnText: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.title,
  },
  supportBtn: {
    height: 44,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  supportBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.muted,
  },
});
