// OrdersScreen.js
import React, { useMemo, useState, useCallback } from 'react';
import {
  Image,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
  RefreshControl,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from '@react-native-vector-icons/ionicons';
import { useFocusEffect } from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';
import OrderDetailsModal from './OrderDetailsModal';
import {
  getCustomerOrders,
  reorder,
  cancelOrder,
} from '../../src/api/customerApi';
import { useAppUI } from '../context/AppUIContext';
import { useOrderBadge } from '../context/OrderBadgeContext.jsx'; // ✅ import

const COLORS = {
  primary: '#ff5a1f',
  background: '#fffaf7',
  white: '#ffffff',
  title: '#171717',
  text: '#374151',
  muted: '#8b929f',
  border: '#eee5df',
  success: '#15803d',
  danger: '#dc2626',
  soft: '#fff0e9',
};

const STATIC_BASE = 'https://myfoodmitra-ecosystem.onrender.com';

const buildImageUrl = imagePath => {
  if (!imagePath) return null;
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }
  const path = imagePath.startsWith('/') ? imagePath : `/${imagePath}`;
  return `${STATIC_BASE}${path}`;
};

export default function OrdersScreen({ navigation }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [detailsVisible, setDetailsVisible] = useState(false);
  const [selectedType, setSelectedType] = useState('Current');
  const [refreshing, setRefreshing] = useState(false);

  // ✅ Get badge updater
  const { fetchActiveOrdersCount } = useOrderBadge();

  // ─── Fetch orders ──────────────────────────────────────
  const fetchOrders = useCallback(async () => {
    try {
      setError('');
      const response = await getCustomerOrders();
      setOrders(response.data.orders || []);
      // ✅ Update badge count after fetching orders
      await fetchActiveOrdersCount();
    } catch (err) {
      console.error('Failed to fetch orders:', err);
      setError(err?.response?.data?.message || 'Failed to load orders');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [fetchActiveOrdersCount]);

  useFocusEffect(
    useCallback(() => {
      fetchOrders();
    }, [fetchOrders]),
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchOrders();
  };

  // ─── Filters ────────────────────────────────────────────
  const currentOrders = useMemo(
    () =>
      orders.filter(
        o =>
          o.status !== 'delivered' &&
          o.status !== 'cancelled' &&
          o.status !== 'rejected',
      ),
    [orders],
  );

  const pastOrders = useMemo(
    () =>
      orders.filter(
        o =>
          o.status === 'delivered' ||
          o.status === 'cancelled' ||
          o.status === 'rejected',
      ),
    [orders],
  );

  const visibleOrders = selectedType === 'Current' ? currentOrders : pastOrders;

  const openOrderDetails = order => {
    setSelectedOrder(order);
    setDetailsVisible(true);
  };

  const closeOrderDetails = () => {
    setDetailsVisible(false);
  };

  const openTrackOrder = order => {
    navigation.navigate('TrackOrder', { order });
  };

  // ─── Reorder ────────────────────────────────────────────
  const handleReorder = async orderId => {
    try {
      await reorder(orderId);
      await fetchOrders();
      closeOrderDetails();
      Alert.alert('Success', 'Order placed again!');
    } catch (err) {
      Alert.alert('Error', 'Failed to reorder. Please try again.');
    }
  };

  // ─── Cancel ─────────────────────────────────────────────
  const handleCancelOrder = async (orderId, reason) => {
    try {
      await cancelOrder(orderId, reason);
      await fetchOrders();
      closeOrderDetails();
    } catch (err) {
      Alert.alert('Error', 'Failed to cancel order. Please try again.');
    }
  };

  // ─── Loading ────────────────────────────────────────────
  if (loading && !refreshing) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          <View style={styles.header}>
            <View>
              <Text style={styles.headerLabel}>YOUR FOOD JOURNEY</Text>
              <Text style={styles.headerTitle}>My orders</Text>
            </View>
            <Pressable style={styles.helpButton}>
              <Ionicons
                name="headset-outline"
                size={21}
                color={COLORS.primary}
              />
            </Pressable>
          </View>
          <View style={styles.centerLoading}>
            <ActivityIndicator size="large" color={COLORS.primary} />
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />

      <View style={styles.container}>
        {/* ─── Header ─── */}
        <View style={styles.header}>
          <View>
            <Text style={styles.headerLabel}>YOUR FOOD JOURNEY</Text>
            <Text style={styles.headerTitle}>My orders</Text>
          </View>
          <Pressable style={styles.helpButton}>
            <Ionicons name="headset-outline" size={21} color={COLORS.primary} />
          </Pressable>
        </View>

        {/* ─── Summary Card ─── */}
        <View style={styles.summaryCard}>
          <View>
            <Text style={styles.summaryLabel}>THIS MONTH</Text>
            <Text style={styles.summaryValue}>{orders.length} orders</Text>
          </View>
          <View style={styles.summaryDivider} />
          <View>
            <Text style={styles.summaryLabel}>YOU SAVED</Text>
            <Text style={styles.summaryValue}>₹0</Text>
          </View>
          <View style={styles.summaryIcon}>
            <Ionicons name="sparkles" size={20} color={COLORS.primary} />
          </View>
        </View>

        {/* ─── Tabs ─── */}
        <View style={styles.tabSwitcher}>
          {['Current', 'Past orders'].map(type => {
            const active = selectedType === type;
            const count =
              type === 'Current' ? currentOrders.length : pastOrders.length;
            return (
              <Pressable
                key={type}
                onPress={() => setSelectedType(type)}
                style={[
                  styles.switchButton,
                  active && styles.switchButtonActive,
                ]}
              >
                <Text
                  style={[styles.switchText, active && styles.switchTextActive]}
                >
                  {type}
                </Text>
                {count > 0 && (
                  <View
                    style={[
                      styles.switchBadge,
                      active && styles.switchBadgeActive,
                    ]}
                  >
                    <Text
                      style={[
                        styles.switchBadgeText,
                        active && styles.switchBadgeTextActive,
                      ]}
                    >
                      {count}
                    </Text>
                  </View>
                )}
              </Pressable>
            );
          })}
        </View>

        {/* ─── Orders List ─── */}
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          {visibleOrders.length > 0 ? (
            visibleOrders.map(order => (
              <OrderCard
                key={order._id}
                order={order}
                onViewDetails={() => openOrderDetails(order)}
                onTrack={() => openTrackOrder(order)}
                onReorder={() => handleReorder(order._id)}
              />
            ))
          ) : (
            <View style={styles.emptyState}>
              <View style={styles.emptyIllustration}>
                <Ionicons
                  name="bag-handle-outline"
                  size={54}
                  color={COLORS.primary}
                />
              </View>
              <Text style={styles.emptyTitle}>
                No {selectedType.toLowerCase()} orders
              </Text>
              <Text style={styles.emptyText}>
                {selectedType === 'Current'
                  ? "You don't have any active orders right now."
                  : 'Your past orders will appear here.'}
              </Text>
              <Pressable
                onPress={() => navigation.navigate('Home')}
                style={styles.exploreButton}
              >
                <Text style={styles.exploreButtonText}>
                  Explore restaurants
                </Text>
                <Ionicons name="arrow-forward" size={16} color={COLORS.white} />
              </Pressable>
            </View>
          )}
        </ScrollView>

        {/* ─── Details Modal ─── */}
        <OrderDetailsModal
          visible={detailsVisible}
          order={selectedOrder}
          onClose={closeOrderDetails}
          onTrack={() => {
            closeOrderDetails();
            if (selectedOrder) openTrackOrder(selectedOrder);
          }}
          onReorder={() => {
            if (selectedOrder) handleReorder(selectedOrder._id);
          }}
          onCancel={handleCancelOrder}
        />
      </View>
    </SafeAreaView>
  );
}

// ─── Order Card ────────────────────────────────────────────
function OrderCard({ order, onViewDetails, onTrack, onReorder }) {
  const isActive =
    order.status !== 'delivered' &&
    order.status !== 'cancelled' &&
    order.status !== 'rejected';
  const isDelivered = order.status === 'delivered';
  const statusDisplay = order.status?.replace(/_/g, ' ') || order.status;
  const statusColor = isActive
    ? '#f59e0b'
    : isDelivered
    ? '#15803d'
    : '#dc2626';

  const firstItem = order.items?.[0];
  const itemImageUrl = firstItem?.image ? buildImageUrl(firstItem.image) : null;
  const hasImage = itemImageUrl !== null;

  const itemsString =
    order.items?.map(i => `${i.name} × ${i.quantity}`).join(', ') || '';

  const date = new Date(order.createdAt);
  const dateStr = date.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
  });
  const timeStr = date.toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <View style={styles.orderCard}>
      <View style={styles.imageWrapper}>
        {hasImage ? (
          <Image source={{ uri: itemImageUrl }} style={styles.coverImage} />
        ) : (
          <View style={styles.placeholderImage}>
            <Text style={styles.placeholderText}>
              {firstItem?.name?.charAt(0) || 'F'}
            </Text>
          </View>
        )}
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.55)']}
          style={styles.gradientOverlay}
        />
        <View
          style={[styles.statusBadge, { backgroundColor: `${statusColor}E8` }]}
        >
          <View style={[styles.statusDot, { backgroundColor: COLORS.white }]} />
          <Text style={styles.statusText}>{statusDisplay}</Text>
        </View>
        <View style={styles.orderIdBadge}>
          <Text style={styles.orderIdText}>
            #{order.orderNumber || order._id.slice(-6)}
          </Text>
        </View>
        <View style={styles.vendorNameOverlay}>
          <Text style={styles.vendorNameText}>
            {order.vendor?.businessName || 'Restaurant'}
          </Text>
        </View>
      </View>

      <View style={styles.orderBody}>
        <View style={styles.orderHeader}>
          <View style={styles.restaurantContent}>
            <Text style={styles.orderItems} numberOfLines={1}>
              {itemsString || `${order.items?.length || 0} items`}
            </Text>
          </View>
          <Text style={styles.orderAmount}>
            ₹{order.pricing?.grandTotal || 0}
          </Text>
        </View>

        <View style={styles.orderMetaRow}>
          <View style={styles.orderMetaItem}>
            <Ionicons name="calendar-outline" size={14} color={COLORS.muted} />
            <Text style={styles.orderMetaText}>
              {dateStr}, {timeStr}
            </Text>
          </View>
          {isActive && order.estimatedDeliveryAt && (
            <View style={styles.etaBadge}>
              <Ionicons name="time-outline" size={13} color={COLORS.primary} />
              <Text style={styles.etaText}>
                {new Date(order.estimatedDeliveryAt).toLocaleTimeString(
                  'en-IN',
                  { hour: '2-digit', minute: '2-digit' },
                )}
              </Text>
            </View>
          )}
        </View>

        {isActive && (
          <View style={styles.progressContainer}>
            <View style={styles.progressTrack}>
              <View style={[styles.progressBar, { width: '50%' }]} />
            </View>
            <Text style={styles.progressLabel}>{statusDisplay}</Text>
          </View>
        )}

        <View style={styles.actionRow}>
          <Pressable onPress={onViewDetails} style={styles.secondaryButton}>
            <Ionicons name="receipt-outline" size={16} color={COLORS.primary} />
            <Text style={styles.secondaryButtonText}>Details</Text>
          </Pressable>

          {isActive ? (
            <Pressable onPress={onTrack} style={styles.primaryButton}>
              <Text style={styles.primaryButtonText}>Track</Text>
              <Ionicons name="navigate" size={15} color={COLORS.white} />
            </Pressable>
          ) : isDelivered ? (
            <Pressable onPress={onReorder} style={styles.primaryButton}>
              <Text style={styles.primaryButtonText}>Reorder</Text>
              <Ionicons name="refresh" size={15} color={COLORS.white} />
            </Pressable>
          ) : null}
        </View>
      </View>
    </View>
  );
}

// ─── Styles ──────────────────────────────────────────────────
const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.background },
  container: { flex: 1 },
  centerLoading: { flex: 1, justifyContent: 'center', alignItems: 'center' },

  header: {
    paddingHorizontal: 18,
    paddingTop: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerLabel: {
    color: COLORS.primary,
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1,
  },
  headerTitle: {
    marginTop: 4,
    color: COLORS.title,
    fontSize: 28,
    fontWeight: '900',
  },
  helpButton: {
    width: 44,
    height: 44,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.white,
  },

  summaryCard: {
    marginTop: 20,
    marginHorizontal: 18,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 22,
    backgroundColor: '#171717',
  },
  summaryLabel: {
    color: 'rgba(255,255,255,0.55)',
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 0.8,
  },
  summaryValue: {
    marginTop: 5,
    color: COLORS.white,
    fontSize: 14,
    fontWeight: '900',
  },
  summaryDivider: {
    width: 1,
    height: 36,
    marginHorizontal: 20,
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
  summaryIcon: {
    width: 42,
    height: 42,
    marginLeft: 'auto',
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff0e9',
  },

  tabSwitcher: {
    height: 51,
    marginTop: 18,
    marginHorizontal: 18,
    padding: 5,
    flexDirection: 'row',
    borderRadius: 17,
    backgroundColor: '#f4ebe6',
  },
  switchButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 13,
  },
  switchButtonActive: {
    backgroundColor: COLORS.white,
    shadowColor: '#7c2d12',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.08,
    shadowRadius: 9,
    elevation: 3,
  },
  switchText: {
    color: COLORS.muted,
    fontSize: 11,
    fontWeight: '800',
  },
  switchTextActive: {
    color: COLORS.primary,
  },
  switchBadge: {
    minWidth: 18,
    height: 18,
    marginLeft: 6,
    paddingHorizontal: 4,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 9,
    backgroundColor: '#ddd4cf',
  },
  switchBadgeActive: {
    backgroundColor: '#fff0e9',
  },
  switchBadgeText: {
    color: COLORS.muted,
    fontSize: 8,
    fontWeight: '900',
  },
  switchBadgeTextActive: {
    color: COLORS.primary,
  },

  scrollContent: {
    padding: 18,
    paddingBottom: 125,
    gap: 18,
  },

  orderCard: {
    overflow: 'hidden',
    borderRadius: 25,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.white,
    shadowColor: '#7c2d12',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 18,
    elevation: 6,
  },

  imageWrapper: {
    height: 160,
    position: 'relative',
  },
  coverImage: {
    width: '100%',
    height: '100%',
  },
  placeholderImage: {
    width: '100%',
    height: '100%',
    backgroundColor: '#f0e6e0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderText: {
    fontSize: 48,
    fontWeight: '900',
    color: '#d4c4b8',
  },
  gradientOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '60%',
  },
  vendorNameOverlay: {
    position: 'absolute',
    bottom: 14,
    left: 14,
    right: 14,
  },
  vendorNameText: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: '900',
    textShadowColor: 'rgba(0,0,0,0.4)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },

  statusBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    paddingHorizontal: 9,
    paddingVertical: 7,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 10,
  },
  statusDot: {
    width: 6,
    height: 6,
    marginRight: 5,
    borderRadius: 3,
  },
  statusText: {
    color: COLORS.white,
    fontSize: 8.5,
    fontWeight: '900',
  },

  orderIdBadge: {
    position: 'absolute',
    right: 12,
    top: 12,
    paddingHorizontal: 9,
    paddingVertical: 6,
    borderRadius: 9,
    backgroundColor: 'rgba(255,255,255,0.94)',
  },
  orderIdText: {
    color: COLORS.title,
    fontSize: 8.5,
    fontWeight: '900',
  },

  orderBody: {
    padding: 15,
  },

  orderHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  restaurantContent: {
    flex: 1,
    marginRight: 10,
  },
  orderItems: {
    color: COLORS.text,
    fontSize: 13,
    fontWeight: '600',
  },
  orderAmount: {
    color: COLORS.primary,
    fontSize: 17,
    fontWeight: '900',
  },

  orderMetaRow: {
    marginTop: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  orderMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  orderMetaText: {
    marginLeft: 5,
    color: COLORS.muted,
    fontSize: 9,
    fontWeight: '600',
  },
  etaBadge: {
    paddingHorizontal: 8,
    paddingVertical: 6,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 10,
    backgroundColor: '#fff0e9',
  },
  etaText: {
    marginLeft: 4,
    color: COLORS.primary,
    fontSize: 8.5,
    fontWeight: '900',
  },

  progressContainer: {
    marginTop: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  progressTrack: {
    flex: 1,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#e5e7eb',
  },
  progressBar: {
    height: '100%',
    borderRadius: 2,
    backgroundColor: COLORS.primary,
  },
  progressLabel: {
    color: COLORS.muted,
    fontSize: 9,
    fontWeight: '700',
  },

  actionRow: {
    marginTop: 14,
    flexDirection: 'row',
    gap: 9,
  },
  secondaryButton: {
    flex: 1,
    height: 43,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 13,
    borderWidth: 1,
    borderColor: '#ffd3bf',
    backgroundColor: '#fff7f3',
  },
  secondaryButtonText: {
    marginLeft: 5,
    color: COLORS.primary,
    fontSize: 9,
    fontWeight: '900',
  },
  primaryButton: {
    flex: 1,
    height: 43,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 13,
    backgroundColor: COLORS.primary,
  },
  primaryButtonText: {
    marginRight: 5,
    color: COLORS.white,
    fontSize: 9,
    fontWeight: '900',
  },

  emptyState: {
    paddingTop: 85,
    alignItems: 'center',
  },
  emptyIllustration: {
    width: 120,
    height: 120,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff0e9',
  },
  emptyTitle: {
    marginTop: 21,
    color: COLORS.title,
    fontSize: 18,
    fontWeight: '900',
  },
  emptyText: {
    maxWidth: 260,
    marginTop: 7,
    color: COLORS.muted,
    fontSize: 11,
    lineHeight: 17,
    textAlign: 'center',
  },
  exploreButton: {
    marginTop: 20,
    paddingHorizontal: 17,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 14,
    backgroundColor: COLORS.primary,
  },
  exploreButtonText: {
    marginRight: 7,
    color: COLORS.white,
    fontSize: 10.5,
    fontWeight: '900',
  },
});
