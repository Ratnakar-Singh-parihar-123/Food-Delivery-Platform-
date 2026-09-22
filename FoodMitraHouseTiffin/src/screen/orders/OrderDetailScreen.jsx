// screens/partner/OrderDetailScreen.js
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

const { width, height } = Dimensions.get('window');

// ─── FALLBACK DATA ──────────────────────────────────────────
const FALLBACK_ORDER = {
  id: 'ORD-001',
  customer: 'Rajesh Kumar',
  avatar: 'https://ui-avatars.com/api/?name=Rajesh+Kumar&background=random',
  items: '2 x Thali + 1 x Chai',
  time: '10:30 AM',
  status: 'preparing',
  total: '₹240',
  address: '123, MG Road, Indore',
  phone: '+91 98765 43210',
  instructions: 'Extra spicy please',
  itemsList: [
    { name: 'Thali', qty: 2, price: 120 },
    { name: 'Chai', qty: 1, price: 20 },
  ],
  coverImage:
    'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80',
};

// ─── MAIN COMPONENT ────────────────────────────────────────
const OrderDetailScreen = ({ navigation, route }) => {
  // Merge passed order with fallback – ensures every property exists
  const passedOrder = route.params?.order || {};
  const orderData = { ...FALLBACK_ORDER, ...passedOrder };

  // ─── ANIMATIONS ────────────────────────────────────────────
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  // ─── STATUS HELPERS ──────────────────────────────────────
  const statusColor =
    orderData.status === 'preparing'
      ? '#f59e0b'
      : orderData.status === 'ready'
      ? '#3b82f6'
      : orderData.status === 'delivered'
      ? '#22c55e'
      : orderData.status === 'cancelled'
      ? '#ef4444'
      : '#8b5cf6';

  const statusIcon =
    orderData.status === 'preparing'
      ? 'time'
      : orderData.status === 'ready'
      ? 'checkmark-circle'
      : orderData.status === 'delivered'
      ? 'checkmark-done'
      : orderData.status === 'cancelled'
      ? 'close-circle'
      : 'help-circle';

  const statusSteps = [
    { label: 'Order Placed', time: '10:30 AM', completed: true },
    {
      label: 'Preparing',
      time: '10:45 AM',
      completed: orderData.status !== 'upcoming',
    },
    {
      label: 'Ready',
      time: '11:00 AM',
      completed: ['ready', 'delivered'].includes(orderData.status),
    },
    {
      label: 'Delivered',
      time: '11:30 AM',
      completed: orderData.status === 'delivered',
    },
  ];

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar
        barStyle="light-content"
        backgroundColor="transparent"
        translucent
      />

      <ScrollView
        style={styles.container}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        {/* ─── COVER IMAGE HEADER ──────────────────────────── */}
        <View style={styles.coverContainer}>
          <Image
            source={{ uri: orderData.coverImage }}
            style={styles.coverImage}
            onError={() => console.warn('Cover image failed to load')}
          />
          <LinearGradient
            colors={['rgba(0,0,0,0.1)', 'rgba(0,0,0,0.6)']}
            style={styles.coverGradient}
          />
          {/* Back Button */}
          <Pressable onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color={COLORS.white} />
          </Pressable>
          {/* Order ID & Status */}
          <View style={styles.coverFooter}>
            <Text style={styles.coverOrderId}>#{orderData.id}</Text>
            <View
              style={[
                styles.coverStatusBadge,
                { backgroundColor: statusColor },
              ]}
            >
              <Ionicons name={statusIcon} size={14} color={COLORS.white} />
              <Text style={styles.coverStatusText}>{orderData.status}</Text>
            </View>
          </View>
        </View>

        {/* ─── ANIMATED CONTENT ────────────────────────────── */}
        <Animated.View
          style={{
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
            paddingHorizontal: 16,
          }}
        >
          {/* Customer Info */}
          <View style={styles.card}>
            <View style={styles.customerRow}>
              <Image
                source={{ uri: orderData.avatar }}
                style={styles.avatar}
                onError={() => console.warn('Avatar failed to load')}
              />
              <View style={styles.customerInfo}>
                <Text style={styles.customerName}>{orderData.customer}</Text>
                <Text style={styles.customerPhone}>{orderData.phone}</Text>
              </View>
              <View style={styles.timeBadge}>
                <Ionicons name="time-outline" size={12} color={COLORS.muted} />
                <Text style={styles.timeText}>{orderData.time}</Text>
              </View>
            </View>
            <View style={styles.addressRow}>
              <Ionicons
                name="location-outline"
                size={18}
                color={COLORS.primary}
              />
              <Text style={styles.addressText}>{orderData.address}</Text>
            </View>
          </View>

          {/* Order Timeline */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Order Status</Text>
            <View style={styles.timeline}>
              {statusSteps.map((step, idx) => (
                <View key={idx} style={styles.timelineItem}>
                  <View style={styles.timelineLeft}>
                    <View
                      style={[
                        styles.timelineDot,
                        {
                          backgroundColor: step.completed
                            ? COLORS.success
                            : '#e5e7eb',
                        },
                      ]}
                    />
                    {idx < statusSteps.length - 1 && (
                      <View
                        style={[
                          styles.timelineLine,
                          {
                            backgroundColor: step.completed
                              ? COLORS.success
                              : '#e5e7eb',
                          },
                        ]}
                      />
                    )}
                  </View>
                  <View style={styles.timelineRight}>
                    <Text
                      style={[
                        styles.timelineLabel,
                        step.completed && styles.timelineLabelCompleted,
                      ]}
                    >
                      {step.label}
                    </Text>
                    <Text style={styles.timelineTime}>{step.time}</Text>
                  </View>
                </View>
              ))}
            </View>
          </View>

          {/* Items */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Order Items</Text>
            {orderData.itemsList ? (
              orderData.itemsList.map((item, idx) => (
                <View key={idx} style={styles.itemRow}>
                  <View style={styles.itemLeft}>
                    <Text style={styles.itemQty}>{item.qty}x</Text>
                    <Text style={styles.itemName}>{item.name}</Text>
                  </View>
                  <Text style={styles.itemPrice}>₹{item.price * item.qty}</Text>
                </View>
              ))
            ) : (
              <Text style={styles.itemName}>{orderData.items}</Text>
            )}
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Total</Text>
              <Text style={styles.totalAmount}>{orderData.total}</Text>
            </View>
          </View>

          {/* Instructions */}
          {orderData.instructions && (
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Special Instructions</Text>
              <View style={styles.instructionBox}>
                <Ionicons
                  name="chatbubble-outline"
                  size={18}
                  color={COLORS.primary}
                />
                <Text style={styles.instructionsText}>
                  {orderData.instructions}
                </Text>
              </View>
            </View>
          )}

          {/* Action Buttons */}
          <View style={styles.actionContainer}>
            {orderData.status === 'preparing' && (
              <>
                <Pressable
                  style={({ pressed }) => [
                    styles.actionBtn,
                    { backgroundColor: COLORS.success },
                    pressed && styles.actionPressed,
                  ]}
                  onPress={() => alert('Mark as ready')}
                >
                  <LinearGradient
                    colors={[COLORS.success, '#16a34a']}
                    style={styles.actionGradient}
                  >
                    <Ionicons
                      name="checkmark-circle"
                      size={20}
                      color={COLORS.white}
                    />
                    <Text style={styles.actionText}>Mark Ready</Text>
                  </LinearGradient>
                </Pressable>
                <Pressable
                  style={({ pressed }) => [
                    styles.actionBtn,
                    { backgroundColor: '#ef4444' },
                    pressed && styles.actionPressed,
                  ]}
                  onPress={() => alert('Cancel order')}
                >
                  <LinearGradient
                    colors={['#ef4444', '#dc2626']}
                    style={styles.actionGradient}
                  >
                    <Ionicons
                      name="close-circle"
                      size={20}
                      color={COLORS.white}
                    />
                    <Text style={styles.actionText}>Cancel</Text>
                  </LinearGradient>
                </Pressable>
              </>
            )}
            {orderData.status === 'upcoming' && (
              <Pressable
                style={({ pressed }) => [
                  styles.actionBtn,
                  { backgroundColor: COLORS.primary },
                  pressed && styles.actionPressed,
                ]}
                onPress={() => alert('Start preparing')}
              >
                <LinearGradient
                  colors={[COLORS.primary, COLORS.primaryDark]}
                  style={styles.actionGradient}
                >
                  <Ionicons name="play" size={20} color={COLORS.white} />
                  <Text style={styles.actionText}>Start Preparing</Text>
                </LinearGradient>
              </Pressable>
            )}
          </View>
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
};

// ─── STYLES ──────────────────────────────────────────────
const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.background },
  container: { flex: 1 },

  // ─── COVER ──────────────────────────────────────────────
  coverContainer: {
    height: height * 0.3,
    position: 'relative',
    marginBottom: 16,
  },
  coverImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  coverGradient: {
    ...StyleSheet.absoluteFillObject,
  },
  backBtn: {
    position: 'absolute',
    top: 12,
    left: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  coverFooter: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    right: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  coverOrderId: {
    fontSize: 20,
    fontWeight: '900',
    color: COLORS.white,
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  coverStatusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
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
    marginBottom: 12,
  },

  // ─── CUSTOMER ───────────────────────────────────────────
  customerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 12,
    backgroundColor: '#f0ece8',
  },
  customerInfo: { flex: 1 },
  customerName: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.title,
  },
  customerPhone: {
    fontSize: 13,
    color: COLORS.muted,
    marginTop: 2,
  },
  timeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f1f3f5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  timeText: {
    fontSize: 11,
    color: COLORS.muted,
    fontWeight: '500',
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  addressText: {
    fontSize: 13,
    color: COLORS.text,
    marginLeft: 6,
    flex: 1,
  },

  // ─── TIMELINE ───────────────────────────────────────────
  timeline: { marginTop: 4 },
  timelineItem: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  timelineLeft: {
    alignItems: 'center',
    width: 24,
    marginRight: 12,
  },
  timelineDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: COLORS.white,
    marginTop: 4,
  },
  timelineLine: {
    width: 2,
    flex: 1,
    marginTop: 2,
  },
  timelineRight: {
    flex: 1,
    paddingBottom: 4,
  },
  timelineLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
  },
  timelineLabelCompleted: {
    color: COLORS.title,
    fontWeight: '700',
  },
  timelineTime: {
    fontSize: 12,
    color: COLORS.muted,
    marginTop: 2,
  },

  // ─── ITEMS ──────────────────────────────────────────────
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f3f5',
  },
  itemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  itemQty: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.primary,
    marginRight: 8,
    minWidth: 24,
  },
  itemName: {
    fontSize: 14,
    color: COLORS.text,
  },
  itemPrice: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.title,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 2,
    borderTopColor: COLORS.border,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.title,
  },
  totalAmount: {
    fontSize: 16,
    fontWeight: '900',
    color: COLORS.primary,
  },

  // ─── INSTRUCTIONS ───────────────────────────────────────
  instructionBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.soft,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    gap: 8,
  },
  instructionsText: {
    flex: 1,
    fontSize: 14,
    color: COLORS.text,
    lineHeight: 20,
  },

  // ─── ACTIONS ─────────────────────────────────────────────
  actionContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: 16,
    gap: 12,
    paddingHorizontal: 16,
  },
  actionBtn: {
    flex: 1,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  actionGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    gap: 8,
  },
  actionPressed: {
    transform: [{ scale: 0.96 }],
  },
  actionText: {
    color: COLORS.white,
    fontWeight: '700',
    fontSize: 15,
  },
});

export default OrderDetailScreen;
