import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  StatusBar,
  ActivityIndicator,
  Alert,
  Dimensions,
  Linking,
  Modal,
  TextInput,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import LinearGradient from 'react-native-linear-gradient';
import { getRiderOrder, riderCompleteOrderWithOTP } from '../../api/riderApi';

const { width, height } = Dimensions.get('window');

const COLORS = {
  primary: '#f25a22',
  primaryDark: '#cc3f0a',
  primaryLight: '#fef0ea',
  background: '#f8fafc',
  white: '#ffffff',
  title: '#0f172a',
  text: '#334155',
  muted: '#64748b',
  lightMuted: '#94a3b8',
  border: '#e2e8f0',
  success: '#16a34a',
  danger: '#ef4444',
  warning: '#f59e0b',
  info: '#3b82f6',
  purple: '#7c3aed',
};

const STATUS_COLORS = {
  placed: '#f59e0b',
  confirmed: '#3b82f6',
  preparing: '#8b5cf6',
  ready_for_pickup: '#10b981',
  rider_assigned: '#3b82f6',
  picked_up: '#f59e0b',
  on_the_way: '#f59e0b',
  delivered: '#6b7280',
  cancelled: '#ef4444',
  rejected: '#6b7280',
};

// ─── Helper: Image URL with base URL ─────────────────────
const BASE_URL = 'http://10.200.227.211:9000'; // अपने server URL से replace करें
const getImageUrl = url => {
  if (!url) return null;
  if (url.startsWith('http')) return url;
  if (url.startsWith('/')) return BASE_URL + url;
  return BASE_URL + '/' + url;
};

export default function RiderOrderDetailsScreen({ navigation, route }) {
  const { orderId } = route.params || {};
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showOTPModal, setShowOTPModal] = useState(false);
  const [otp, setOtp] = useState('');

  const getCoordinates = location => {
    if (!location) return null;
    if (
      Array.isArray(location.coordinates) &&
      location.coordinates.length === 2
    ) {
      return {
        latitude: location.coordinates[1],
        longitude: location.coordinates[0],
      };
    }
    if (
      location.coordinates?.lat !== undefined &&
      location.coordinates?.lng !== undefined
    ) {
      return {
        latitude: location.coordinates.lat,
        longitude: location.coordinates.lng,
      };
    }
    if (location.lat !== undefined && location.lng !== undefined) {
      return { latitude: location.lat, longitude: location.lng };
    }
    return null;
  };

  useEffect(() => {
    if (!orderId) {
      Alert.alert('Error', 'Order ID missing');
      navigation.goBack();
      return;
    }
    fetchOrderDetails();
  }, [orderId]);

  const fetchOrderDetails = async () => {
    try {
      setLoading(true);
      const res = await getRiderOrder(orderId);
      setOrder(res.data.order);
    } catch (error) {
      console.error('❌ Error fetching order:', error);
      Alert.alert('Error', 'Failed to load order details');
    } finally {
      setLoading(false);
    }
  };

  const getStatusLabel = status => {
    const map = {
      placed: 'Placed',
      confirmed: 'Confirmed',
      preparing: 'Preparing',
      ready_for_pickup: 'Ready for Pickup',
      rider_assigned: 'Assigned to You',
      picked_up: 'Picked Up',
      on_the_way: 'On the Way',
      delivered: 'Delivered',
      cancelled: 'Cancelled',
      rejected: 'Rejected',
    };
    return map[status] || status;
  };

  // ─── Track Handlers ──────────────────────────────────────
  const handleTrackVendor = () => {
    const vendorLocation = order?.vendor?.address?.location;
    const coords = getCoordinates(vendorLocation);
    if (!coords) {
      Alert.alert('Info', 'Vendor location not available');
      return;
    }
    const url = `https://www.google.com/maps/dir/?api=1&destination=${coords.latitude},${coords.longitude}&travelmode=driving`;
    Alert.alert(
      '📍 Vendor Location',
      `Lat: ${coords.latitude}\nLng: ${coords.longitude}\n\nOpen in Google Maps?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Open', onPress: () => Linking.openURL(url) },
      ],
    );
  };

  const handleTrackCustomer = () => {
    const customerLocation = order?.deliveryAddress?.location;
    const coords = getCoordinates(customerLocation);
    if (!coords) {
      Alert.alert('Info', 'Customer delivery location not available');
      return;
    }
    const url = `https://www.google.com/maps/dir/?api=1&destination=${coords.latitude},${coords.longitude}&travelmode=driving`;
    Alert.alert(
      '📍 Customer Location',
      `Lat: ${coords.latitude}\nLng: ${coords.longitude}\n\nOpen in Google Maps?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Open', onPress: () => Linking.openURL(url) },
      ],
    );
  };

  // ─── OTP Submit ──────────────────────────────────────────
  const submitOTP = async () => {
    if (otp.length !== 6) {
      Alert.alert('Error', 'Please enter a valid 6-digit OTP');
      return;
    }
    try {
      await riderCompleteOrderWithOTP({ orderId: order._id, otp });
      Alert.alert('Success', 'Order delivered successfully!');
      setShowOTPModal(false);
      setOtp('');
      navigation.goBack();
    } catch (error) {
      const msg =
        error.response?.data?.message || 'Invalid OTP or server error';
      Alert.alert('Error', msg);
    }
  };

  // ─── Helper: Progress percentage ─────────────────────────
  const getProgress = status => {
    const map = {
      placed: 10,
      confirmed: 25,
      preparing: 40,
      ready_for_pickup: 55,
      rider_assigned: 65,
      picked_up: 80,
      on_the_way: 90,
      delivered: 100,
      cancelled: 0,
      rejected: 0,
    };
    return map[status] || 0;
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </SafeAreaView>
    );
  }

  if (!order) return null;

  const statusColor = STATUS_COLORS[order.status] || COLORS.muted;
  const progress = getProgress(order.status);
  const isActive = !['delivered', 'cancelled', 'rejected'].includes(
    order.status,
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />

      {/* ─── Header with Gradient ───────────────────────────── */}
      <LinearGradient
        colors={[COLORS.primary, COLORS.primaryDark]}
        style={styles.headerGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
      >
        <View style={styles.headerContent}>
          <Pressable onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Ionicons name="chevron-back" size={28} color="#fff" />
          </Pressable>
          <Text style={styles.headerTitle}>Order Details</Text>
          <View style={{ width: 40 }} />
        </View>
        <View style={styles.headerStatus}>
          <Text style={styles.headerOrderId}>#{order.orderNumber}</Text>
          <View
            style={[
              styles.headerStatusBadge,
              { backgroundColor: statusColor + '30' },
            ]}
          >
            <Text style={[styles.headerStatusText, { color: statusColor }]}>
              {getStatusLabel(order.status)}
            </Text>
          </View>
        </View>
      </LinearGradient>

      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* ─── Progress Bar ──────────────────────────────────── */}
        {isActive && (
          <View style={styles.progressContainer}>
            <View style={styles.progressTrack}>
              <View style={[styles.progressFill, { width: `${progress}%` }]} />
            </View>
            <Text style={styles.progressLabel}>{progress}%</Text>
          </View>
        )}

        {/* ─── Vendor Card ──────────────────────────────────── */}
        <View style={styles.vendorCard}>
          <View style={styles.vendorRow}>
            <View style={styles.vendorImageContainer}>
              {order.vendor?.logo ? (
                <Image
                  source={{ uri: getImageUrl(order.vendor.logo) }}
                  style={styles.vendorImage}
                />
              ) : (
                <View style={styles.vendorPlaceholder}>
                  <Ionicons
                    name="storefront"
                    size={28}
                    color={COLORS.primary}
                  />
                </View>
              )}
            </View>
            <View style={styles.vendorInfo}>
              <Text style={styles.vendorName}>
                {order.vendor?.businessName || 'Vendor'}
              </Text>
              <Text style={styles.vendorAddress} numberOfLines={1}>
                {order.vendor?.address?.addressLine || ''}
              </Text>
            </View>
          </View>
        </View>

        {/* ─── Delivery Address Card ─────────────────────────── */}
        <View style={styles.infoCard}>
          <View style={styles.cardHeaderRow}>
            <Ionicons
              name="location-outline"
              size={20}
              color={COLORS.primary}
            />
            <Text style={styles.cardLabel}>Delivery Address</Text>
          </View>
          <Text style={styles.cardValue}>
            {order.deliveryAddress?.name || 'Customer'}
          </Text>
          <Text style={styles.cardSubtext}>
            {order.deliveryAddress?.addressLine || ''}
            {order.deliveryAddress?.landmark
              ? `, ${order.deliveryAddress.landmark}`
              : ''}
          </Text>
          <Text style={styles.cardSubtext}>
            {order.deliveryAddress?.city}, {order.deliveryAddress?.state} -{' '}
            {order.deliveryAddress?.pincode}
          </Text>
          {order.deliveryAddress?.phone && (
            <Text style={styles.cardPhone}>
              📞 {order.deliveryAddress.phone}
            </Text>
          )}
        </View>

        {/* ─── Pickup Code (if applicable) ──────────────────── */}
        {order.pickupCode && (
          <View style={styles.pickupCard}>
            <Text style={styles.pickupLabel}>Pickup Code</Text>
            <Text style={styles.pickupCode}>{order.pickupCode}</Text>
          </View>
        )}

        {/* ─── Items Card ────────────────────────────────────── */}
        <View style={styles.infoCard}>
          <View style={styles.cardHeaderRow}>
            <Ionicons
              name="fast-food-outline"
              size={20}
              color={COLORS.primary}
            />
            <Text style={styles.cardLabel}>Order Items</Text>
          </View>
          {order.items.map((item, idx) => {
            const itemImage =
              getImageUrl(item.image) || getImageUrl(item.product?.image);
            return (
              <View key={idx} style={styles.itemRow}>
                <View style={styles.itemImageContainer}>
                  {itemImage ? (
                    <Image
                      source={{ uri: itemImage }}
                      style={styles.itemThumb}
                    />
                  ) : (
                    <View style={styles.itemPlaceholder}>
                      <Ionicons
                        name="restaurant-outline"
                        size={18}
                        color={COLORS.lightMuted}
                      />
                    </View>
                  )}
                </View>
                <View style={styles.itemDetails}>
                  <Text style={styles.itemName} numberOfLines={1}>
                    {item.quantity}× {item.name}
                  </Text>
                  {item.variant?.name && (
                    <Text style={styles.itemVariant}>
                      {item.variant.name}: {item.variant.value}
                    </Text>
                  )}
                </View>
                <Text style={styles.itemPrice}>₹{item.totalPrice}</Text>
              </View>
            );
          })}
          <View style={styles.divider} />
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>
              ₹{order.pricing?.grandTotal || 0}
            </Text>
          </View>
        </View>

        {/* ─── Complete Delivery Button ──────────────────────── */}
        {['picked_up', 'on_the_way'].includes(order.status) && (
          <LinearGradient
            colors={[COLORS.success, '#059669']}
            style={styles.deliverBtnGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <Pressable
              style={styles.deliverBtn}
              onPress={() => setShowOTPModal(true)}
            >
              <Ionicons
                name="checkmark-circle-outline"
                size={28}
                color="#fff"
              />
              <Text style={styles.deliverBtnText}>Complete Delivery</Text>
            </Pressable>
          </LinearGradient>
        )}

        {/* ─── Track Buttons ─────────────────────────────────── */}
        <View style={styles.trackButtons}>
          <Pressable
            style={[styles.trackBtn, styles.trackVendorBtn]}
            onPress={handleTrackVendor}
          >
            <Ionicons name="storefront-outline" size={22} color="#fff" />
            <Text style={styles.trackBtnText}>Vendor</Text>
          </Pressable>
          <Pressable
            style={[styles.trackBtn, styles.trackCustomerBtn]}
            onPress={handleTrackCustomer}
          >
            <Ionicons name="location-outline" size={22} color="#fff" />
            <Text style={styles.trackBtnText}>Customer</Text>
          </Pressable>
        </View>
        <View style={{ height: 30 }} />
      </ScrollView>

      {/* ─── OTP Modal ────────────────────────────────────────── */}
      <Modal
        visible={showOTPModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowOTPModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <LinearGradient
              colors={[COLORS.primary, COLORS.primaryDark]}
              style={styles.modalHeader}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Text style={styles.modalTitle}>Enter Delivery OTP</Text>
            </LinearGradient>
            <Text style={styles.modalSubtitle}>
              Ask customer for the 6-digit OTP sent to their phone
            </Text>
            <TextInput
              style={styles.otpInput}
              keyboardType="number-pad"
              maxLength={6}
              value={otp}
              onChangeText={setOtp}
              placeholder="Enter OTP"
              autoFocus
              placeholderTextColor={COLORS.lightMuted}
            />
            <View style={styles.modalButtons}>
              <Pressable
                style={[styles.modalBtn, styles.cancelBtn]}
                onPress={() => {
                  setShowOTPModal(false);
                  setOtp('');
                }}
              >
                <Text style={styles.cancelText}>Cancel</Text>
              </Pressable>
              <Pressable
                style={[styles.modalBtn, styles.submitBtn]}
                onPress={submitOTP}
              >
                <Text style={styles.submitText}>Verify & Deliver</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.background },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  // ─── Header ──────────────────────────────────────────────
  headerGradient: {
    paddingTop: 12,
    paddingBottom: 16,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 6,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  backBtn: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: 0.5,
  },
  headerStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginTop: 10,
  },
  headerOrderId: {
    fontSize: 20,
    fontWeight: '900',
    color: '#fff',
    letterSpacing: 0.5,
  },
  headerStatusBadge: {
    paddingHorizontal: 14,
    paddingVertical: 4,
    borderRadius: 20,
  },
  headerStatusText: {
    fontSize: 13,
    fontWeight: '700',
    textTransform: 'capitalize',
  },

  container: { flex: 1, paddingHorizontal: 16, paddingTop: 16 },

  // ─── Progress ────────────────────────────────────────────
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  progressTrack: {
    flex: 1,
    height: 8,
    backgroundColor: '#e2e8f0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: COLORS.primary,
    borderRadius: 4,
  },
  progressLabel: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.primary,
    marginLeft: 12,
    width: 40,
    textAlign: 'right',
  },

  // ─── Vendor Card ─────────────────────────────────────────
  vendorCard: {
    backgroundColor: COLORS.white,
    borderRadius: 20,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 3,
  },
  vendorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  vendorImageContainer: {
    width: 56,
    height: 56,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#f1f5f9',
  },
  vendorImage: {
    width: '100%',
    height: '100%',
  },
  vendorPlaceholder: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fef0ea',
  },
  vendorInfo: {
    flex: 1,
  },
  vendorName: {
    fontSize: 17,
    fontWeight: '800',
    color: COLORS.title,
  },
  vendorAddress: {
    fontSize: 13,
    color: COLORS.muted,
    marginTop: 2,
  },

  // ─── Info Card ───────────────────────────────────────────
  infoCard: {
    backgroundColor: COLORS.white,
    borderRadius: 20,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 3,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  cardLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.muted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  cardValue: {
    fontSize: 17,
    fontWeight: '700',
    color: COLORS.title,
  },
  cardSubtext: {
    fontSize: 14,
    color: COLORS.text,
    marginTop: 2,
  },
  cardPhone: {
    fontSize: 14,
    color: COLORS.info,
    fontWeight: '600',
    marginTop: 4,
  },

  // ─── Pickup Code ─────────────────────────────────────────
  pickupCard: {
    backgroundColor: '#fef0ea',
    borderRadius: 16,
    padding: 14,
    marginBottom: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#fde0d0',
  },
  pickupLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.muted,
  },
  pickupCode: {
    fontSize: 20,
    fontWeight: '900',
    color: COLORS.primary,
    letterSpacing: 2,
  },

  // ─── Items ──────────────────────────────────────────────
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    gap: 12,
  },
  itemImageContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#f8fafc',
  },
  itemThumb: {
    width: '100%',
    height: '100%',
  },
  itemPlaceholder: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  itemDetails: {
    flex: 1,
  },
  itemName: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.title,
  },
  itemVariant: {
    fontSize: 12,
    color: COLORS.muted,
    marginTop: 1,
  },
  itemPrice: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.title,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: 8,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
  },
  totalValue: {
    fontSize: 22,
    fontWeight: '900',
    color: COLORS.primary,
  },

  // ─── Deliver Button ──────────────────────────────────────
  deliverBtnGradient: {
    borderRadius: 16,
    marginBottom: 16,
    overflow: 'hidden',
    shadowColor: COLORS.success,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
  },
  deliverBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    gap: 10,
  },
  deliverBtnText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: 0.5,
  },

  // ─── Track Buttons ──────────────────────────────────────
  trackButtons: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  trackBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 16,
    gap: 8,
  },
  trackVendorBtn: {
    backgroundColor: COLORS.primary,
  },
  trackCustomerBtn: {
    backgroundColor: COLORS.success,
  },
  trackBtnText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
  },

  // ─── Modal ──────────────────────────────────────────────
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 28,
    width: '88%',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.3,
    shadowRadius: 30,
    elevation: 20,
  },
  modalHeader: {
    paddingVertical: 18,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#fff',
    letterSpacing: 0.5,
  },
  modalSubtitle: {
    fontSize: 14,
    color: COLORS.muted,
    textAlign: 'center',
    paddingHorizontal: 20,
    marginTop: 16,
    marginBottom: 20,
  },
  otpInput: {
    marginHorizontal: 20,
    height: 56,
    borderWidth: 2,
    borderColor: COLORS.border,
    borderRadius: 14,
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
    letterSpacing: 10,
    color: COLORS.title,
    backgroundColor: '#f8fafc',
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  modalBtn: {
    flex: 1,
    height: 50,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelBtn: {
    backgroundColor: '#f1f5f9',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  submitBtn: {
    backgroundColor: COLORS.primary,
  },
  cancelText: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
  },
  submitText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
});
