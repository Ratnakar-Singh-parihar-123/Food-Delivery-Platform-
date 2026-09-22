// screens/partner/SubscriptionDetailScreen.js
import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  Pressable,
  ScrollView,
  StatusBar,
  Animated,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from '@react-native-vector-icons/ionicons';
import LinearGradient from 'react-native-linear-gradient';
import { COLORS } from '../../constants/colors';

const { height } = Dimensions.get('window');

const SubscriptionDetailScreen = ({ navigation, route }) => {
  const { subscription } = route.params || {};

  // Fallback data
  const fallback = {
    id: 'S1',
    customer: 'Rahul Sharma',
    avatar: 'https://ui-avatars.com/api/?name=Rahul+Sharma&background=random',
    plan: 'Weekly',
    meals: 'Lunch',
    status: 'active',
    nextDelivery: 'Today, 12:30 PM',
    mealsCount: 5,
    total: '₹600',
    startDate: '01 Aug 2026',
    endDate: '31 Aug 2026',
    deliveryAddress: '123, MG Road, Indore',
    phone: '+91 98765 43210',
    deliveryDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
    mealsList: ['Thali', 'Dal Rice', 'Paneer'],
  };

  const data = subscription || fallback;

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const statusColor =
    data.status === 'active'
      ? COLORS.success
      : data.status === 'paused'
      ? '#f59e0b'
      : '#9ca3af';

  const statusIcon =
    data.status === 'active'
      ? 'checkmark-circle'
      : data.status === 'paused'
      ? 'pause'
      : 'checkmark-done';

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar
        barStyle="light-content"
        backgroundColor="transparent"
        translucent
      />
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Cover */}
        <LinearGradient
          colors={[COLORS.primary, COLORS.primaryDark]}
          style={styles.cover}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Pressable onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color={COLORS.white} />
          </Pressable>
          <View style={styles.coverContent}>
            <Image source={{ uri: data.avatar }} style={styles.coverAvatar} />
            <Text style={styles.coverName}>{data.customer}</Text>
            <View style={styles.coverStatus}>
              <Ionicons name={statusIcon} size={16} color={COLORS.white} />
              <Text style={styles.coverStatusText}>{data.status}</Text>
            </View>
          </View>
        </LinearGradient>

        {/* Animated Content */}
        <Animated.View
          style={{
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
            paddingHorizontal: 16,
            paddingTop: 16,
          }}
        >
          {/* Plan Info */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Plan Details</Text>
            <View style={styles.planRow}>
              <Text style={styles.planLabel}>Plan</Text>
              <Text style={styles.planValue}>{data.plan}</Text>
            </View>
            <View style={styles.planRow}>
              <Text style={styles.planLabel}>Meals</Text>
              <Text style={styles.planValue}>{data.meals}</Text>
            </View>
            <View style={styles.planRow}>
              <Text style={styles.planLabel}>Total</Text>
              <Text style={styles.planValue}>{data.total}</Text>
            </View>
            <View style={styles.planRow}>
              <Text style={styles.planLabel}>Meals Count</Text>
              <Text style={styles.planValue}>{data.mealsCount}</Text>
            </View>
          </View>

          {/* Delivery Info */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Delivery Info</Text>
            <View style={styles.detailItem}>
              <Ionicons
                name="calendar-outline"
                size={18}
                color={COLORS.primary}
              />
              <Text style={styles.detailText}>Next: {data.nextDelivery}</Text>
            </View>
            <View style={styles.detailItem}>
              <Ionicons
                name="location-outline"
                size={18}
                color={COLORS.primary}
              />
              <Text style={styles.detailText}>{data.deliveryAddress}</Text>
            </View>
            <View style={styles.detailItem}>
              <Ionicons name="call-outline" size={18} color={COLORS.primary} />
              <Text style={styles.detailText}>{data.phone}</Text>
            </View>
            <View style={styles.detailItem}>
              <Ionicons
                name="calendar-outline"
                size={18}
                color={COLORS.primary}
              />
              <Text style={styles.detailText}>
                {data.startDate} – {data.endDate}
              </Text>
            </View>
          </View>

          {/* Delivery Days */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Delivery Days</Text>
            <View style={styles.daysContainer}>
              {data.deliveryDays.map((day, idx) => (
                <View key={idx} style={styles.dayChip}>
                  <Text style={styles.dayText}>{day}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Meals List */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Meals Included</Text>
            {data.mealsList.map((meal, idx) => (
              <View key={idx} style={styles.mealRow}>
                <Ionicons name="ellipse" size={6} color={COLORS.primary} />
                <Text style={styles.mealText}>{meal}</Text>
              </View>
            ))}
          </View>

          {/* Actions */}
          <View style={styles.actionContainer}>
            {data.status === 'active' && (
              <Pressable
                style={[styles.actionBtn, { backgroundColor: '#f59e0b' }]}
                onPress={() => alert('Pause subscription')}
              >
                <Ionicons name="pause" size={20} color={COLORS.white} />
                <Text style={styles.actionText}>Pause</Text>
              </Pressable>
            )}
            {data.status === 'paused' && (
              <Pressable
                style={[styles.actionBtn, { backgroundColor: COLORS.success }]}
                onPress={() => alert('Resume subscription')}
              >
                <Ionicons name="play" size={20} color={COLORS.white} />
                <Text style={styles.actionText}>Resume</Text>
              </Pressable>
            )}
            <Pressable
              style={[styles.actionBtn, { backgroundColor: '#ef4444' }]}
              onPress={() => alert('Cancel subscription')}
            >
              <Ionicons name="close" size={20} color={COLORS.white} />
              <Text style={styles.actionText}>Cancel</Text>
            </Pressable>
          </View>
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.background },
  container: { flex: 1 },

  // ─── COVER ──────────────────────────────────────────────
  cover: {
    height: height * 0.3,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 20,
  },
  backBtn: {
    position: 'absolute',
    top: 12,
    left: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  coverContent: {
    alignItems: 'center',
  },
  coverAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    borderColor: COLORS.white,
    marginBottom: 8,
  },
  coverName: {
    fontSize: 20,
    fontWeight: '900',
    color: COLORS.white,
  },
  coverStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
    gap: 6,
    marginTop: 4,
  },
  coverStatusText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
  },

  // ─── CARDS ──────────────────────────────────────────────
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.title,
    marginBottom: 10,
  },
  planRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  planLabel: {
    fontSize: 14,
    color: COLORS.muted,
  },
  planValue: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    gap: 8,
  },
  detailText: {
    fontSize: 14,
    color: COLORS.text,
    flex: 1,
  },

  // ─── DAYS ────────────────────────────────────────────────
  daysContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  dayChip: {
    backgroundColor: COLORS.soft,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  dayText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.primary,
  },

  // ─── MEALS ───────────────────────────────────────────────
  mealRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 3,
    gap: 8,
  },
  mealText: {
    fontSize: 14,
    color: COLORS.text,
  },

  // ─── ACTIONS ─────────────────────────────────────────────
  actionContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: 16,
    gap: 12,
    paddingBottom: 20,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    flex: 1,
    justifyContent: 'center',
    gap: 8,
  },
  actionText: {
    color: COLORS.white,
    fontWeight: '700',
    fontSize: 14,
  },
});

export default SubscriptionDetailScreen;
