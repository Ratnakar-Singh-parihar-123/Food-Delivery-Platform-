// OrderDetailsModal.js
import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  TextInput,
  Alert,
  Image,
} from 'react-native';
import { format } from 'date-fns';
import Ionicons from '@react-native-vector-icons/ionicons';
import { cancelOrder } from '../../src/api/customerApi';

const COLORS = {
  primary: '#ff5a1f',
  background: '#fffaf7',
  white: '#ffffff',
  title: '#171717',
  text: '#3f3f46',
  muted: '#8f8f98',
  border: '#eee5df',
  soft: '#fff0e9',
  success: '#15803d',
  danger: '#dc2626',
};

const STATIC_BASE = 'https://myfoodmitra-ecosystem.onrender.com';

// ─── Build image URL ─────────────────────────────────────
const buildImageUrl = imagePath => {
  if (!imagePath) return null;
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }
  const path = imagePath.startsWith('/') ? imagePath : `/${imagePath}`;
  return `${STATIC_BASE}${path}`;
};

// ─── Status mapping ──────────────────────────────────────
const STATUS_MAP = {
  placed: { label: 'Placed', color: '#f59e0b' },
  confirmed: { label: 'Confirmed', color: '#3b82f6' },
  preparing: { label: 'Preparing', color: '#8b5cf6' },
  ready_for_pickup: { label: 'Ready', color: '#22c55e' },
  rider_assigned: { label: 'Rider Assigned', color: '#06b6d4' },
  picked_up: { label: 'Picked Up', color: '#f97316' },
  on_the_way: { label: 'On the Way', color: '#f59e0b' },
  delivered: { label: 'Delivered', color: '#15803d' },
  cancelled: { label: 'Cancelled', color: '#dc2626' },
  rejected: { label: 'Rejected', color: '#6b7280' },
};

const getStatusInfo = status => STATUS_MAP[status] || STATUS_MAP.placed;

export default function OrderDetailsModal({
  visible,
  order,
  onClose,
  onTrack,
  onReorder,
  onCancel,
}) {
  const translateY = useRef(new Animated.Value(-760)).current;
  const backdropOpacity = useRef(new Animated.Value(0)).current;
  const [cancelReason, setCancelReason] = useState('');
  const [showCancelModal, setShowCancelModal] = useState(false);

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(translateY, {
          toValue: 0,
          tension: 72,
          friction: 10,
          useNativeDriver: true,
        }),
        Animated.timing(backdropOpacity, {
          toValue: 1,
          duration: 220,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  const handleClose = () => {
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: -760,
        duration: 230,
        useNativeDriver: true,
      }),
      Animated.timing(backdropOpacity, {
        toValue: 0,
        duration: 190,
        useNativeDriver: true,
      }),
    ]).start(onClose);
  };

  if (!order) return null;

  const statusInfo = getStatusInfo(order.status);
  const isActive =
    order.status !== 'delivered' &&
    order.status !== 'cancelled' &&
    order.status !== 'rejected';
  const canCancel =
    isActive && (order.status === 'placed' || order.status === 'confirmed');

  const handleCancelOrder = async () => {
    if (!cancelReason.trim()) {
      Alert.alert('Error', 'Please provide a reason for cancellation.');
      return;
    }
    try {
      await cancelOrder(order._id, cancelReason.trim());
      Alert.alert('Success', 'Order cancelled successfully.');
      setShowCancelModal(false);
      setCancelReason('');
      if (onCancel) onCancel();
    } catch (error) {
      Alert.alert('Error', 'Failed to cancel order. Please try again.');
      console.error(error);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      statusBarTranslucent
      animationType="none"
      onRequestClose={handleClose}
    >
      <View style={styles.root}>
        <Animated.View style={[styles.backdrop, { opacity: backdropOpacity }]}>
          <Pressable onPress={handleClose} style={StyleSheet.absoluteFill} />
        </Animated.View>

        <Animated.View
          style={[styles.modalCard, { transform: [{ translateY }] }]}
        >
          <View style={styles.handle} />

          <View style={styles.header}>
            <View style={styles.headerText}>
              <Text style={styles.eyebrow}>ORDER DETAILS</Text>
              <Text numberOfLines={1} style={styles.title}>
                {order.vendor?.businessName || 'Restaurant'}
              </Text>
              <Text style={styles.orderId}>#{order.orderNumber}</Text>
            </View>
            <Pressable onPress={handleClose} style={styles.closeButton}>
              <Ionicons name="close" size={21} color={COLORS.title} />
            </Pressable>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            <View style={styles.statusHero}>
              <View style={styles.statusGlow} />
              <View
                style={[
                  styles.statusIcon,
                  { backgroundColor: statusInfo.color },
                ]}
              >
                <Ionicons
                  name={
                    isActive
                      ? 'restaurant-outline'
                      : order.status === 'delivered'
                      ? 'checkmark-circle-outline'
                      : 'close-circle-outline'
                  }
                  size={24}
                  color={COLORS.white}
                />
              </View>
              <View style={styles.statusContent}>
                <Text style={styles.statusLabel}>CURRENT STATUS</Text>
                <Text style={styles.statusValue}>{statusInfo.label}</Text>
                <Text style={styles.statusDate}>
                  {format(new Date(order.createdAt), 'dd MMM, hh:mm a')}
                </Text>
              </View>
              <View style={styles.amountWrap}>
                <Text style={styles.amountLabel}>PAID</Text>
                <Text style={styles.amount}>
                  ₹{order.pricing?.grandTotal || 0}
                </Text>
              </View>
            </View>

            <SectionLabel title="Your items" icon="fast-food-outline" />
            <View style={styles.card}>
              {order.items?.map((item, index) => (
                <React.Fragment key={item.product?._id || index}>
                  <View style={styles.itemRow}>
                    <Image
                      source={{
                        uri:
                          buildImageUrl(item.image) ||
                          'https://via.placeholder.com/40',
                      }}
                      style={styles.itemImage}
                    />
                    <View style={styles.quantity}>
                      <Text style={styles.quantityText}>{item.quantity}×</Text>
                    </View>
                    <View style={styles.itemContent}>
                      <Text style={styles.itemName}>{item.name}</Text>
                      {item.variant && Object.keys(item.variant).length > 0 && (
                        <Text style={styles.itemType}>
                          {Object.entries(item.variant)
                            .map(([k, v]) => `${k}: ${v}`)
                            .join(', ')}
                        </Text>
                      )}
                    </View>
                    <Text style={styles.itemPrice}>₹{item.totalPrice}</Text>
                  </View>
                  {index < order.items.length - 1 && (
                    <View style={styles.rowDivider} />
                  )}
                </React.Fragment>
              ))}
            </View>

            <SectionLabel title="Bill details" icon="receipt-outline" />
            <View style={styles.card}>
              <BillRow
                label="Item total"
                value={`₹${order.pricing?.itemTotal || 0}`}
              />
              <BillRow
                label="Delivery fee"
                value={`₹${order.pricing?.deliveryCharge || 0}`}
              />
              <BillRow
                label="Platform fee"
                value={`₹${order.pricing?.platformFee || 0}`}
              />
              {order.pricing?.discount > 0 && (
                <BillRow
                  label="Discount"
                  value={`-₹${order.pricing.discount}`}
                  success
                />
              )}
              <View style={styles.billDivider} />
              <BillRow
                label="Total paid"
                value={`₹${order.pricing?.grandTotal || 0}`}
                strong
              />
            </View>

            <SectionLabel title="Delivery address" icon="location-outline" />
            <View style={styles.addressCard}>
              <View style={styles.addressIcon}>
                <Ionicons
                  name="home-outline"
                  size={20}
                  color={COLORS.primary}
                />
              </View>
              <View style={styles.addressContent}>
                <Text style={styles.addressType}>Delivery</Text>
                <Text style={styles.addressText}>
                  {order.deliveryAddress?.addressLine}
                  {order.deliveryAddress?.city &&
                    `, ${order.deliveryAddress.city}`}
                  {order.deliveryAddress?.state &&
                    `, ${order.deliveryAddress.state}`}
                  {order.deliveryAddress?.pincode &&
                    ` - ${order.deliveryAddress.pincode}`}
                </Text>
                {order.deliveryAddress?.phone && (
                  <Text style={styles.addressPhone}>
                    📞 {order.deliveryAddress.phone}
                  </Text>
                )}
              </View>
              <Ionicons
                name="checkmark-circle"
                size={19}
                color={COLORS.success}
              />
            </View>

            <View style={styles.buttonRow}>
              {canCancel && (
                <Pressable
                  onPress={() => setShowCancelModal(true)}
                  style={[styles.supportButton, { borderColor: COLORS.danger }]}
                >
                  <Ionicons
                    name="close-circle-outline"
                    size={17}
                    color={COLORS.danger}
                  />
                  <Text style={[styles.supportText, { color: COLORS.danger }]}>
                    Cancel
                  </Text>
                </Pressable>
              )}
              <Pressable style={styles.supportButton}>
                <Ionicons
                  name="headset-outline"
                  size={17}
                  color={COLORS.primary}
                />
                <Text style={styles.supportText}>Need help</Text>
              </Pressable>
              <Pressable
                onPress={isActive ? onTrack : onReorder}
                style={styles.primaryButton}
              >
                <Text style={styles.primaryButtonText}>
                  {isActive ? 'Track order' : 'Reorder'}
                </Text>
                <Ionicons
                  name={isActive ? 'navigate' : 'refresh'}
                  size={16}
                  color={COLORS.white}
                />
              </Pressable>
            </View>
          </ScrollView>
        </Animated.View>
      </View>

      {/* ─── Cancel Reason Modal ────────────────────────── */}
      <Modal visible={showCancelModal} transparent animationType="slide">
        <View style={styles.cancelModalBackdrop}>
          <View style={styles.cancelModalCard}>
            <Text style={styles.cancelModalTitle}>Cancel Order</Text>
            <Text style={styles.cancelModalSub}>
              Please tell us why you're cancelling this order.
            </Text>
            <TextInput
              style={styles.cancelInput}
              placeholder="e.g., Changed my mind, Delivery time too long..."
              multiline
              numberOfLines={3}
              value={cancelReason}
              onChangeText={setCancelReason}
            />
            <View style={styles.cancelButtonRow}>
              <Pressable
                onPress={() => setShowCancelModal(false)}
                style={[styles.cancelButton, styles.cancelButtonSecondary]}
              >
                <Text style={styles.cancelButtonText}>Go back</Text>
              </Pressable>
              <Pressable
                onPress={handleCancelOrder}
                style={[styles.cancelButton, styles.cancelButtonPrimary]}
              >
                <Text
                  style={[styles.cancelButtonText, { color: COLORS.white }]}
                >
                  Confirm Cancel
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </Modal>
  );
}

// ─── Helper Components ──────────────────────────────────
function SectionLabel({ title, icon }) {
  return (
    <View style={styles.sectionLabel}>
      <View style={styles.sectionIcon}>
        <Ionicons name={icon} size={15} color={COLORS.primary} />
      </View>
      <Text style={styles.sectionTitle}>{title}</Text>
    </View>
  );
}

function BillRow({ label, value, success, strong }) {
  return (
    <View style={styles.billRow}>
      <Text style={[styles.billLabel, strong && styles.strongText]}>
        {label}
      </Text>
      <Text
        style={[
          styles.billValue,
          success && styles.successText,
          strong && styles.strongText,
        ]}
      >
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(23,23,23,0.58)',
  },
  modalCard: {
    maxHeight: '92%',
    paddingHorizontal: 18,
    paddingBottom: 18,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    backgroundColor: COLORS.background,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 15 },
    shadowOpacity: 0.25,
    shadowRadius: 25,
    elevation: 20,
  },
  handle: {
    width: 45,
    height: 5,
    marginTop: 10,
    alignSelf: 'center',
    borderRadius: 3,
    backgroundColor: '#ded6d1',
  },
  header: {
    marginTop: 17,
    marginBottom: 17,
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  headerText: { flex: 1, marginRight: 12 },
  eyebrow: {
    color: COLORS.primary,
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1,
  },
  title: { marginTop: 5, color: COLORS.title, fontSize: 21, fontWeight: '900' },
  orderId: {
    marginTop: 4,
    color: COLORS.muted,
    fontSize: 10,
    fontWeight: '700',
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.white,
  },
  scrollContent: { paddingBottom: 12 },
  statusHero: {
    minHeight: 95,
    padding: 14,
    overflow: 'hidden',
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 22,
    backgroundColor: COLORS.title,
  },
  statusGlow: {
    position: 'absolute',
    right: -35,
    top: -45,
    width: 130,
    height: 130,
    borderRadius: 65,
    backgroundColor: 'rgba(255,90,31,0.25)',
  },
  statusIcon: {
    width: 50,
    height: 50,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusContent: { flex: 1, marginLeft: 11 },
  statusLabel: {
    color: 'rgba(255,255,255,0.48)',
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 0.7,
  },
  statusValue: {
    marginTop: 4,
    color: COLORS.white,
    fontSize: 14,
    fontWeight: '900',
  },
  statusDate: { marginTop: 4, color: 'rgba(255,255,255,0.58)', fontSize: 8.5 },
  amountWrap: { alignItems: 'flex-end' },
  amountLabel: {
    color: 'rgba(255,255,255,0.48)',
    fontSize: 7.5,
    fontWeight: '900',
  },
  amount: {
    marginTop: 4,
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '900',
  },
  sectionLabel: {
    marginTop: 20,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  sectionIcon: {
    width: 30,
    height: 30,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.soft,
  },
  sectionTitle: {
    marginLeft: 8,
    color: COLORS.title,
    fontSize: 13,
    fontWeight: '900',
  },
  card: {
    padding: 14,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.white,
  },
  itemRow: { minHeight: 56, flexDirection: 'row', alignItems: 'center' },
  itemImage: {
    width: 40,
    height: 40,
    borderRadius: 10,
    marginRight: 8,
    backgroundColor: '#f0e6e0',
  },
  quantity: {
    width: 31,
    height: 31,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.soft,
    marginRight: 8,
  },
  quantityText: { color: COLORS.primary, fontSize: 10, fontWeight: '900' },
  itemContent: { flex: 1, marginLeft: 4 },
  itemName: { color: COLORS.title, fontSize: 11, fontWeight: '900' },
  itemType: { marginTop: 3, color: COLORS.muted, fontSize: 8.5 },
  itemPrice: { color: COLORS.title, fontSize: 11, fontWeight: '900' },
  rowDivider: { height: 1, marginLeft: 41, backgroundColor: '#f2eeeb' },
  billRow: {
    marginBottom: 11,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  billLabel: { color: '#6b7280', fontSize: 10 },
  billValue: { color: COLORS.text, fontSize: 10, fontWeight: '700' },
  successText: { color: COLORS.success },
  strongText: { color: COLORS.title, fontSize: 12, fontWeight: '900' },
  billDivider: { height: 1, marginBottom: 12, backgroundColor: '#f1f3f5' },
  addressCard: {
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.white,
  },
  addressIcon: {
    width: 43,
    height: 43,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.soft,
  },
  addressContent: { flex: 1, marginLeft: 11, marginRight: 8 },
  addressType: { color: COLORS.title, fontSize: 11, fontWeight: '900' },
  addressText: {
    marginTop: 4,
    color: '#6b7280',
    fontSize: 9.5,
    lineHeight: 15,
  },
  addressPhone: {
    marginTop: 4,
    color: COLORS.primary,
    fontSize: 9.5,
    fontWeight: '600',
  },
  buttonRow: { marginTop: 22, flexDirection: 'row', gap: 10 },
  supportButton: {
    flex: 1,
    height: 49,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#ffd3bf',
    backgroundColor: '#fff6f1',
  },
  supportText: {
    marginLeft: 6,
    color: COLORS.primary,
    fontSize: 10,
    fontWeight: '900',
  },
  primaryButton: {
    flex: 1.15,
    height: 49,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
    backgroundColor: COLORS.primary,
  },
  primaryButtonText: {
    marginRight: 6,
    color: COLORS.white,
    fontSize: 10,
    fontWeight: '900',
  },
  cancelModalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  cancelModalCard: {
    width: '100%',
    backgroundColor: COLORS.white,
    borderRadius: 24,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  cancelModalTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: COLORS.title,
    marginBottom: 8,
  },
  cancelModalSub: {
    fontSize: 14,
    color: COLORS.muted,
    marginBottom: 16,
  },
  cancelInput: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 16,
    padding: 12,
    minHeight: 80,
    textAlignVertical: 'top',
    fontSize: 14,
  },
  cancelButtonRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: 'center',
  },
  cancelButtonSecondary: {
    backgroundColor: '#f3f4f6',
  },
  cancelButtonPrimary: {
    backgroundColor: COLORS.danger,
  },
  cancelButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.title,
  },
});
