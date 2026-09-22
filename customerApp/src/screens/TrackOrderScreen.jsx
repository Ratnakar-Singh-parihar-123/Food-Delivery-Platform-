// screens/TrackOrderScreen.js
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  Image,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Dimensions,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from '@react-native-vector-icons/ionicons';
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from 'react-native-maps';
import { format } from 'date-fns';
import { getOrderDetails, cancelOrder } from '../api/customerApi';
import { socket } from '../services/socket.js';

const { width, height } = Dimensions.get('window');

const PRIMARY = '#ff5a1f';
const DARK = '#161616';
const MUTED = '#8a8a93';
const BACKGROUND = '#f7f7f8';

const STATUS_STEPS = [
  { id: 'placed', label: 'Order placed', icon: 'checkmark' },
  { id: 'confirmed', label: 'Confirmed', icon: 'checkmark' },
  { id: 'preparing', label: 'Preparing', icon: 'restaurant-outline' },
  {
    id: 'ready_for_pickup',
    label: 'Ready for pickup',
    icon: 'restaurant-outline',
  },
  { id: 'rider_assigned', label: 'Rider assigned', icon: 'bicycle-outline' },
  { id: 'picked_up', label: 'Picked up', icon: 'bicycle-outline' },
  { id: 'on_the_way', label: 'On the way', icon: 'bicycle-outline' },
  { id: 'delivered', label: 'Delivered', icon: 'home-outline' },
];

const STATUS_INDEX_MAP = Object.fromEntries(
  STATUS_STEPS.map((s, i) => [s.id, i]),
);

export default function TrackOrderScreen({ navigation, route }) {
  const { order: initialOrder } = route.params || {};
  const orderId = initialOrder?._id || initialOrder?.id;

  const [order, setOrder] = useState(initialOrder || null);
  const [loading, setLoading] = useState(!initialOrder);
  const [cancelled, setCancelled] = useState(false);
  const [riderLocation, setRiderLocation] = useState(null);
  const pollInterval = useRef(null);

  // ─── Socket listeners ──────────────────────────────────
  useEffect(() => {
    if (!orderId) return;

    if (!socket) {
      console.warn('⚠️ Socket unavailable – using polling only');
      fetchOrderDetails();
      return;
    }

    socket.emit('join-order', orderId);

    // Order status updates
    const onOrderUpdate = updatedOrder => {
      setOrder(updatedOrder);
      if (
        ['delivered', 'cancelled', 'rejected'].includes(updatedOrder.status)
      ) {
        if (pollInterval.current) clearInterval(pollInterval.current);
      }
    };
    socket.on('order:updated', onOrderUpdate);

    // Rider location updates
    const onRiderLocation = data => {
      if (data?.latitude && data?.longitude) {
        setRiderLocation({
          latitude: data.latitude,
          longitude: data.longitude,
        });
      }
    };
    socket.on('rider:location', onRiderLocation);

    return () => {
      socket.off('order:updated', onOrderUpdate);
      socket.off('rider:location', onRiderLocation);
      socket.emit('leave-order', orderId);
    };
  }, [orderId]);

  // ─── Polling fallback ──────────────────────────────────
  useEffect(() => {
    if (orderId) {
      fetchOrderDetails();
      pollInterval.current = setInterval(fetchOrderDetails, 10000);
    }
    return () => {
      if (pollInterval.current) clearInterval(pollInterval.current);
    };
  }, [orderId]);

  const fetchOrderDetails = async () => {
    if (!orderId) return;
    try {
      const res = await getOrderDetails(orderId);
      const updated = res.data.order;
      setOrder(updated);
      if (['delivered', 'cancelled', 'rejected'].includes(updated.status)) {
        if (pollInterval.current) clearInterval(pollInterval.current);
      }
    } catch (error) {
      console.warn('Polling fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  // ─── Cancel order ──────────────────────────────────────
  const handleCancel = async () => {
    Alert.alert(
      'Cancel order?',
      'Are you sure you want to cancel this order?',
      [
        { text: 'Keep order', style: 'cancel' },
        {
          text: 'Cancel order',
          style: 'destructive',
          onPress: async () => {
            try {
              await cancelOrder(orderId, 'Customer cancelled');
              setCancelled(true);
              Alert.alert('Cancelled', 'Order has been cancelled.');
              fetchOrderDetails();
            } catch (error) {
              Alert.alert('Error', 'Could not cancel order.');
            }
          },
        },
      ],
    );
  };

  // ─── Loading ────────────────────────────────────────────
  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loader}>
          <ActivityIndicator size="large" color={PRIMARY} />
        </View>
      </SafeAreaView>
    );
  }

  if (!order) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loader}>
          <Text>Order not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  const statusIndex = STATUS_INDEX_MAP[order.status] ?? 0;
  const activeStep = Math.min(statusIndex, STATUS_STEPS.length - 1);
  const isActive =
    order.status !== 'delivered' &&
    order.status !== 'cancelled' &&
    order.status !== 'rejected';
  const canCancel =
    isActive && (order.status === 'placed' || order.status === 'confirmed');

  // ─── Map coordinates ───────────────────────────────────
  const vendorCoords = order.vendor?.address?.location?.coordinates || [
    75.8937, 22.7533,
  ];
  const customerCoords = order.deliveryAddress?.location?.coordinates || [
    75.8958, 22.7441,
  ];
  const [vendorLng, vendorLat] = vendorCoords;
  const [customerLng, customerLat] = customerCoords;

  // Use real rider location if available, else simulate
  let riderLat, riderLng;
  if (riderLocation) {
    riderLat = riderLocation.latitude;
    riderLng = riderLocation.longitude;
  } else {
    riderLat = (vendorLat + customerLat) / 2 + (Math.random() - 0.5) * 0.005;
    riderLng = (vendorLng + customerLng) / 2 + (Math.random() - 0.5) * 0.005;
  }

  const mapRegion = {
    latitude: (vendorLat + customerLat) / 2,
    longitude: (vendorLng + customerLng) / 2,
    latitudeDelta: 0.03,
    longitudeDelta: 0.03,
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />

      <View style={styles.container}>
        <View style={styles.mapContainer}>
          <MapView
            provider={PROVIDER_GOOGLE}
            style={{ flex: 1, backgroundColor: 'red' }}
            region={mapRegion}
            showsUserLocation={false}
            showsMyLocationButton={false}
          >
            <Marker coordinate={{ latitude: vendorLat, longitude: vendorLng }}>
              <View style={styles.restaurantMarker}>
                <Ionicons name="restaurant" size={18} color="#ffffff" />
              </View>
            </Marker>

            <Marker
              coordinate={{ latitude: customerLat, longitude: customerLng }}
            >
              <View style={styles.customerMarker}>
                <Ionicons name="home" size={18} color="#ffffff" />
              </View>
            </Marker>

            {isActive && (
              <>
                <Marker
                  coordinate={{ latitude: riderLat, longitude: riderLng }}
                >
                  <View style={styles.riderMarker}>
                    <Ionicons name="bicycle" size={20} color="#ffffff" />
                  </View>
                </Marker>

                <Polyline
                  coordinates={[
                    { latitude: vendorLat, longitude: vendorLng },
                    { latitude: riderLat, longitude: riderLng },
                    { latitude: customerLat, longitude: customerLng },
                  ]}
                  strokeWidth={5}
                  strokeColor={PRIMARY}
                />
              </>
            )}
          </MapView>

          <View style={styles.mapFade} />

          {/* Top Header Overlay */}
          <View style={styles.topHeader}>
            <Pressable
              onPress={() => navigation.goBack()}
              style={styles.headerButton}
            >
              <Ionicons name="arrow-back" size={21} color={DARK} />
            </Pressable>
            <View style={styles.headerCenter}>
              <Text style={styles.headerTitle}>Track order</Text>
              <Text style={styles.headerSubtitle}>#{order.orderNumber}</Text>
            </View>
            <Pressable style={styles.headerButton}>
              <Ionicons name="headset-outline" size={21} color={PRIMARY} />
            </Pressable>
          </View>

          {isActive && (
            <View style={styles.mapStatus}>
              <View style={styles.mapStatusIcon}>
                <Ionicons name="bicycle" size={18} color="#ffffff" />
              </View>
              <View style={styles.mapStatusContent}>
                <Text style={styles.mapStatusTitle}>
                  {order.status === 'placed'
                    ? 'Order placed'
                    : order.status === 'confirmed'
                    ? 'Order confirmed'
                    : order.status === 'preparing'
                    ? 'Preparing your food'
                    : order.status === 'ready_for_pickup'
                    ? 'Ready for pickup'
                    : order.status === 'rider_assigned'
                    ? 'Rider assigned'
                    : order.status === 'picked_up'
                    ? 'Picked up'
                    : order.status === 'on_the_way'
                    ? 'On the way'
                    : 'Status'}
                </Text>
                <Text style={styles.mapStatusSubtitle}>
                  Updated {format(new Date(order.updatedAt), 'hh:mm a')}
                </Text>
              </View>
              <View style={styles.liveBadge}>
                <View style={styles.liveDot} />
                <Text style={styles.liveText}>LIVE</Text>
              </View>
            </View>
          )}
        </View>

        {/* Bottom Sheet – unchanged */}
        <View style={styles.bottomSheet}>
          <View style={styles.sheetHandle} />
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.sheetContent}
          >
            {/* ... rest of bottom sheet (unchanged) ... */}
            {!isActive ? (
              <DeliveryDone order={order} />
            ) : (
              <>
                <View style={styles.deliverySummary}>
                  <View>
                    <Text style={styles.summaryLabel}>ARRIVING IN</Text>
                    <Text style={styles.summaryTime}>
                      {order.estimatedDeliveryAt
                        ? format(new Date(order.estimatedDeliveryAt), 'hh:mm a')
                        : '30 min'}
                    </Text>
                    <Text style={styles.summarySubtitle}>
                      Estimated delivery
                    </Text>
                  </View>
                  <View style={styles.summaryIcon}>
                    <Ionicons name="time-outline" size={27} color={PRIMARY} />
                  </View>
                </View>

                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>Order status</Text>
                  <Text style={styles.sectionAction}>Live updates</Text>
                </View>

                <View style={styles.timelineCard}>
                  {STATUS_STEPS.slice(0, 7).map((step, index) => {
                    const isCompleted = index < activeStep;
                    const isActiveStep = index === activeStep;
                    const isLast = index === 6;
                    return (
                      <View key={step.id} style={styles.timelineRow}>
                        <View style={styles.timelineLeft}>
                          <View
                            style={[
                              styles.stepCircle,
                              isCompleted && styles.stepCircleCompleted,
                              isActiveStep && styles.stepCircleActive,
                            ]}
                          >
                            <Ionicons
                              name={isCompleted ? 'checkmark' : step.icon}
                              size={16}
                              color={
                                isCompleted || isActiveStep
                                  ? '#ffffff'
                                  : '#a3a3aa'
                              }
                            />
                          </View>
                          {!isLast && (
                            <View
                              style={[
                                styles.timelineLine,
                                isCompleted && styles.timelineLineCompleted,
                              ]}
                            />
                          )}
                        </View>
                        <View style={styles.stepContent}>
                          <View style={styles.stepTitleRow}>
                            <Text
                              style={[
                                styles.stepTitle,
                                (isCompleted || isActiveStep) &&
                                  styles.stepTitleActive,
                              ]}
                            >
                              {step.label}
                            </Text>
                            {isActiveStep && (
                              <View style={styles.currentBadge}>
                                <Text style={styles.currentBadgeText}>
                                  CURRENT
                                </Text>
                              </View>
                            )}
                          </View>
                        </View>
                      </View>
                    );
                  })}
                </View>

                {order.rider && (
                  <>
                    <View style={styles.sectionHeader}>
                      <Text style={styles.sectionTitle}>Delivery partner</Text>
                    </View>
                    <View style={styles.riderCard}>
                      <Image
                        source={{
                          uri:
                            order.rider.profileImage ||
                            'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80',
                        }}
                        style={styles.riderImage}
                      />
                      <View style={styles.riderContent}>
                        <Text style={styles.riderName}>
                          {order.rider.firstName} {order.rider.lastName}
                        </Text>
                        <View style={styles.ratingRow}>
                          <Ionicons name="star" size={13} color="#f59e0b" />
                          <Text style={styles.ratingText}>
                            4.8 · 320 deliveries
                          </Text>
                        </View>
                      </View>
                      <Pressable style={styles.riderAction}>
                        <Ionicons
                          name="call-outline"
                          size={19}
                          color={PRIMARY}
                        />
                      </Pressable>
                      <Pressable style={styles.riderAction}>
                        <Ionicons
                          name="chatbubble-ellipses-outline"
                          size={19}
                          color={PRIMARY}
                        />
                      </Pressable>
                    </View>
                  </>
                )}

                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>Delivery route</Text>
                </View>

                <View style={styles.addressCard}>
                  <AddressItem
                    color="#7c3aed"
                    icon="restaurant-outline"
                    label="Restaurant"
                    value={order.vendor?.businessName || 'Restaurant'}
                  />
                  <View style={styles.addressConnector} />
                  <AddressItem
                    color={PRIMARY}
                    icon="home-outline"
                    label="Delivering to"
                    value={order.deliveryAddress?.addressLine || 'Address'}
                  />
                </View>

                <View style={styles.orderInfoCard}>
                  <InfoRow
                    label="Order amount"
                    value={`₹${order.pricing?.grandTotal || 0}`}
                  />
                  <View style={styles.divider} />
                  <InfoRow
                    label="Payment"
                    value={order.payment?.method || 'Cash'}
                  />
                </View>

                {canCancel && (
                  <Pressable onPress={handleCancel} style={styles.cancelButton}>
                    <Ionicons
                      name="close-circle-outline"
                      size={19}
                      color="#dc2626"
                    />
                    <Text style={styles.cancelButtonText}>Cancel order</Text>
                  </Pressable>
                )}
              </>
            )}
          </ScrollView>
        </View>
      </View>
    </SafeAreaView>
  );
}

// ─── Helper Components (unchanged) ──────────────────────

function AddressItem({ color, icon, label, value }) {
  return (
    <View style={styles.addressItem}>
      <View style={[styles.addressIcon, { backgroundColor: `${color}15` }]}>
        <Ionicons name={icon} size={19} color={color} />
      </View>
      <View style={styles.addressContent}>
        <Text style={styles.addressLabel}>{label}</Text>
        <Text style={styles.addressValue}>{value}</Text>
      </View>
    </View>
  );
}

function InfoRow({ label, value }) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
}

function DeliveryDone({ order }) {
  return (
    <View style={styles.deliveredState}>
      <View style={styles.deliveredIcon}>
        <Ionicons name="checkmark-circle" size={40} color="#16a34a" />
      </View>
      <Text style={styles.deliveredTitle}>Order delivered</Text>
      <Text style={styles.deliveredSub}>
        {order.status === 'cancelled' || order.status === 'rejected'
          ? 'Order has been cancelled.'
          : 'Your order has been successfully delivered. Enjoy your meal!'}
      </Text>
    </View>
  );
}

// ─── Styles ──────────────────────────────────────────────────
const styles = StyleSheet.create({
  // ... keep all existing styles (they are unchanged) ...
  safeArea: { flex: 1, backgroundColor: '#ffffff' },
  container: { flex: 1, backgroundColor: BACKGROUND },
  loader: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  mapContainer: {
    height: '55%',
    overflow: 'hidden',
    backgroundColor: '#e5e7eb',
  },
  map: { ...StyleSheet.absoluteFillObject },
  mapFade: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 75,
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
  topHeader: {
    position: 'absolute',
    top: 14,
    left: 14,
    right: 14,
    height: 64,
    paddingHorizontal: 10,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.97)',
    shadowColor: '#111827',
    shadowOffset: { width: 0, height: 7 },
    shadowOpacity: 0.13,
    shadowRadius: 15,
    elevation: 9,
    zIndex: 20,
  },
  headerButton: {
    width: 43,
    height: 43,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f4f4f5',
  },
  headerCenter: { flex: 1, marginHorizontal: 12 },
  headerTitle: { color: DARK, fontSize: 15, fontWeight: '900' },
  headerSubtitle: {
    marginTop: 3,
    color: MUTED,
    fontSize: 9,
    fontWeight: '700',
  },
  mapStatus: {
    position: 'absolute',
    left: 16,
    right: 16,
    bottom: 18,
    minHeight: 67,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 21,
    backgroundColor: 'rgba(255,255,255,0.98)',
    shadowColor: '#111827',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.13,
    shadowRadius: 13,
    elevation: 8,
    zIndex: 20,
  },
  mapStatusIcon: {
    width: 42,
    height: 42,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: PRIMARY,
  },
  mapStatusContent: { flex: 1, marginLeft: 10 },
  mapStatusTitle: { color: DARK, fontSize: 11, fontWeight: '900' },
  mapStatusSubtitle: { marginTop: 4, color: MUTED, fontSize: 8 },
  liveBadge: {
    paddingHorizontal: 8,
    paddingVertical: 6,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 10,
    backgroundColor: '#ecfdf3',
  },
  liveDot: {
    width: 6,
    height: 6,
    marginRight: 5,
    borderRadius: 3,
    backgroundColor: '#16a34a',
  },
  liveText: { color: '#15803d', fontSize: 7, fontWeight: '900' },
  restaurantMarker: {
    width: 42,
    height: 42,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#ffffff',
    backgroundColor: '#7c3aed',
    elevation: 6,
  },
  customerMarker: {
    width: 42,
    height: 42,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#ffffff',
    backgroundColor: DARK,
    elevation: 6,
  },
  riderMarker: {
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#ffffff',
    backgroundColor: PRIMARY,
    elevation: 7,
  },
  bottomSheet: {
    flex: 1,
    marginTop: -12,
    overflow: 'hidden',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    backgroundColor: '#ffffff',
    shadowColor: '#111827',
    shadowOffset: { width: 0, height: -6 },
    shadowOpacity: 0.1,
    shadowRadius: 18,
    elevation: 18,
  },
  sheetHandle: {
    width: 44,
    height: 5,
    marginTop: 10,
    marginBottom: 6,
    alignSelf: 'center',
    borderRadius: 3,
    backgroundColor: '#dedede',
  },
  sheetContent: { paddingHorizontal: 18, paddingTop: 10, paddingBottom: 35 },
  deliverySummary: {
    padding: 17,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 23,
    borderWidth: 1,
    borderColor: '#ffe1d2',
    backgroundColor: '#fff7f2',
  },
  summaryLabel: {
    color: PRIMARY,
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 1,
  },
  summaryTime: { marginTop: 3, color: DARK, fontSize: 25, fontWeight: '900' },
  summarySubtitle: { marginTop: 4, color: MUTED, fontSize: 8.5 },
  summaryIcon: {
    width: 52,
    height: 52,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff',
  },
  sectionHeader: {
    marginTop: 22,
    marginBottom: 11,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionTitle: { color: DARK, fontSize: 13, fontWeight: '900' },
  sectionAction: { color: PRIMARY, fontSize: 8, fontWeight: '800' },
  timelineCard: {
    paddingHorizontal: 15,
    paddingVertical: 17,
    borderRadius: 23,
    borderWidth: 1,
    borderColor: '#ece7e4',
    backgroundColor: '#ffffff',
  },
  timelineRow: { minHeight: 67, flexDirection: 'row' },
  timelineLeft: { width: 39, alignItems: 'center' },
  stepCircle: {
    width: 32,
    height: 32,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f1f1f3',
  },
  stepCircleCompleted: { backgroundColor: '#16a34a' },
  stepCircleActive: { backgroundColor: PRIMARY },
  timelineLine: {
    flex: 1,
    width: 2,
    marginVertical: 4,
    backgroundColor: '#e5e7eb',
  },
  timelineLineCompleted: { backgroundColor: '#86efac' },
  stepContent: { flex: 1, paddingTop: 3, paddingLeft: 9 },
  stepTitleRow: { flexDirection: 'row', alignItems: 'center' },
  stepTitle: { color: '#a3a3aa', fontSize: 10.5, fontWeight: '800' },
  stepTitleActive: { color: DARK, fontWeight: '900' },
  currentBadge: {
    marginLeft: 8,
    paddingHorizontal: 7,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: '#fff0e9',
  },
  currentBadgeText: { color: PRIMARY, fontSize: 6, fontWeight: '900' },
  riderCard: {
    padding: 13,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 21,
    borderWidth: 1,
    borderColor: '#ece7e4',
    backgroundColor: '#ffffff',
  },
  riderImage: {
    width: 52,
    height: 52,
    borderRadius: 17,
    backgroundColor: '#e5e7eb',
  },
  riderContent: { flex: 1, marginLeft: 11 },
  riderName: { color: DARK, fontSize: 12, fontWeight: '900' },
  ratingRow: { marginTop: 6, flexDirection: 'row', alignItems: 'center' },
  ratingText: { marginLeft: 5, color: MUTED, fontSize: 8.5 },
  riderAction: {
    width: 40,
    height: 40,
    marginLeft: 7,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff0e9',
  },
  addressCard: {
    padding: 15,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: '#ece7e4',
    backgroundColor: '#ffffff',
  },
  addressItem: { flexDirection: 'row', alignItems: 'center' },
  addressIcon: {
    width: 43,
    height: 43,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addressContent: { flex: 1, marginLeft: 11 },
  addressLabel: { color: MUTED, fontSize: 8, fontWeight: '700' },
  addressValue: {
    marginTop: 4,
    color: DARK,
    fontSize: 9.5,
    fontWeight: '800',
    lineHeight: 14,
  },
  addressConnector: {
    width: 2,
    height: 22,
    marginLeft: 21,
    marginVertical: 4,
    backgroundColor: '#e5e7eb',
  },
  orderInfoCard: {
    marginTop: 16,
    padding: 15,
    borderRadius: 20,
    backgroundColor: '#f8f8f9',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  infoLabel: { color: MUTED, fontSize: 9, fontWeight: '700' },
  infoValue: { color: DARK, fontSize: 9.5, fontWeight: '900' },
  divider: { height: 1, marginVertical: 13, backgroundColor: '#e5e7eb' },
  cancelButton: {
    height: 50,
    marginTop: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 17,
    borderWidth: 1,
    borderColor: '#fecaca',
    backgroundColor: '#fff7f7',
  },
  cancelButtonText: {
    marginLeft: 7,
    color: '#dc2626',
    fontSize: 10,
    fontWeight: '900',
  },
  deliveredState: { paddingVertical: 40, alignItems: 'center' },
  deliveredIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#dcfce7',
  },
  deliveredTitle: {
    marginTop: 18,
    color: DARK,
    fontSize: 21,
    fontWeight: '900',
  },
  deliveredSub: {
    maxWidth: 285,
    marginTop: 9,
    color: MUTED,
    fontSize: 10,
    lineHeight: 17,
    textAlign: 'center',
  },
});
