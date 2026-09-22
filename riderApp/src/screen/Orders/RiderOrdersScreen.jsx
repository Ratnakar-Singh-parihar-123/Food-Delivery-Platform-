import React, { useEffect, useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  StatusBar,
  ActivityIndicator,
  RefreshControl,
  Pressable,
  Image,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import LinearGradient from 'react-native-linear-gradient';
import { getRiderOrders } from '../../api/riderApi';

const { width } = Dimensions.get('window');

const COLORS = {
  primary: '#FF6B35',
  primaryDark: '#E55A2B',
  primaryLight: '#FFF0EA',
  background: '#F8FAFC',
  white: '#FFFFFF',
  title: '#0F172A',
  text: '#334155',
  muted: '#64748B',
  lightMuted: '#94A3B8',
  border: '#E2E8F0',
  success: '#16A34A',
  warning: '#F59E0B',
  danger: '#EF4444',
};

const STATUS_CONFIG = {
  placed: {
    label: 'Placed',
    color: '#F59E0B',
    bg: '#FEF3C7',
    icon: 'time-outline',
    progress: 10,
  },
  confirmed: {
    label: 'Confirmed',
    color: '#2563EB',
    bg: '#DBEAFE',
    icon: 'checkmark-circle-outline',
    progress: 25,
  },
  preparing: {
    label: 'Preparing',
    color: '#7C3AED',
    bg: '#EDE9FE',
    icon: 'restaurant-outline',
    progress: 40,
  },
  ready_for_pickup: {
    label: 'Ready for Pickup',
    color: '#059669',
    bg: '#D1FAE5',
    icon: 'bag-handle-outline',
    progress: 55,
  },
  rider_assigned: {
    label: 'Assigned to You',
    color: '#0284C7',
    bg: '#E0F2FE',
    icon: 'bicycle-outline',
    progress: 65,
  },
  picked_up: {
    label: 'Picked Up',
    color: '#D97706',
    bg: '#FEF3C7',
    icon: 'cube-outline',
    progress: 80,
  },
  on_the_way: {
    label: 'On The Way',
    color: '#FF6B35',
    bg: '#FFF0EA',
    icon: 'navigate-outline',
    progress: 90,
  },
  delivered: {
    label: 'Delivered',
    color: '#16A34A',
    bg: '#DCFCE7',
    icon: 'checkmark-done-circle-outline',
    progress: 100,
  },
  cancelled: {
    label: 'Cancelled',
    color: '#DC2626',
    bg: '#FEE2E2',
    icon: 'close-circle-outline',
    progress: 0,
  },
  rejected: {
    label: 'Rejected',
    color: '#475569',
    bg: '#F1F5F9',
    icon: 'ban-outline',
    progress: 0,
  },
};

// ─── Helper: Image URL with base URL ─────────────────────
const BASE_URL = 'http://10.200.227.211:9000'; // अपने server URL से replace करें
const getImageUrl = url => {
  if (!url) return null;
  if (url.startsWith('http')) return url;
  if (url.startsWith('/')) return BASE_URL + url;
  return BASE_URL + '/' + url;
};

export default function RiderOrdersScreen({ navigation }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('active'); // 'active' | 'history'

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      const res = await getRiderOrders();
      setOrders(res.data.orders || []);
    } catch (error) {
      console.error('Orders fetch error:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchOrders();
  };

  const filteredOrders = useMemo(() => {
    return orders.filter(order => {
      const isCompleted = ['delivered', 'cancelled', 'rejected'].includes(
        order.status,
      );
      return activeTab === 'history' ? isCompleted : !isCompleted;
    });
  }, [orders, activeTab]);

  const renderItem = ({ item }) => {
    const statusMeta = STATUS_CONFIG[item.status] || {
      label: item.status?.replace(/_/g, ' ') || 'Order',
      color: COLORS.primary,
      bg: COLORS.primaryLight,
      icon: 'receipt-outline',
      progress: 50,
    };

    const firstItem = item.items?.[0];
    const imageUri =
      getImageUrl(firstItem?.image) ||
      getImageUrl(firstItem?.foodItem?.image) ||
      getImageUrl(item.vendor?.logo) ||
      null;

    const totalItemsCount = item.items?.length || 0;
    const isActive = !['delivered', 'cancelled', 'rejected'].includes(
      item.status,
    );
    const progressWidth = statusMeta.progress || 0;

    return (
      <Pressable
        style={styles.orderCard}
        onPress={() =>
          navigation.navigate('RiderOrderDetails', { orderId: item._id })
        }
      >
        {/* ─── Card Header ────────────────────────────────── */}
        <View style={styles.cardHeader}>
          <View style={styles.orderNumberBadge}>
            <Text style={styles.orderId}>#{item.orderNumber || '0000'}</Text>
          </View>

          <View
            style={[styles.statusBadge, { backgroundColor: statusMeta.bg }]}
          >
            <Ionicons
              name={statusMeta.icon}
              size={13}
              color={statusMeta.color}
            />
            <Text style={[styles.statusText, { color: statusMeta.color }]}>
              {statusMeta.label}
            </Text>
          </View>
        </View>

        {/* ─── Body: Image + Details ────────────────────── */}
        <View style={styles.cardBody}>
          <View style={styles.imageContainer}>
            {imageUri ? (
              <Image
                source={{ uri: imageUri }}
                style={styles.itemImage}
                resizeMode="cover"
              />
            ) : (
              <View style={styles.placeholderImage}>
                <Ionicons
                  name="fast-food-outline"
                  size={28}
                  color={COLORS.lightMuted}
                />
              </View>
            )}
            {totalItemsCount > 1 && (
              <View style={styles.itemCountOverlay}>
                <Text style={styles.itemCountText}>+{totalItemsCount - 1}</Text>
              </View>
            )}
          </View>

          <View style={styles.detailsContainer}>
            <Text style={styles.vendorName} numberOfLines={1}>
              {item.vendor?.businessName || 'FoodMitra Partner'}
            </Text>

            <Text style={styles.itemsSummary} numberOfLines={1}>
              {firstItem
                ? `${firstItem.quantity}x ${firstItem.name || 'Item'}`
                : 'Multiple items'}
              {totalItemsCount > 1 ? ` +${totalItemsCount - 1} more` : ''}
            </Text>

            <View style={styles.metaRow}>
              <View style={styles.metaItem}>
                <Ionicons
                  name="location-outline"
                  size={14}
                  color={COLORS.muted}
                />
                <Text style={styles.metaText} numberOfLines={1}>
                  {item.deliveryAddress?.addressLine || 'Customer address'}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* ─── Progress Bar (Active orders) ────────────── */}
        {isActive && (
          <View style={styles.progressContainer}>
            <View style={styles.progressTrack}>
              <View
                style={[
                  styles.progressFill,
                  { width: `${progressWidth}%` },
                  progressWidth >= 80 && styles.progressNearComplete,
                ]}
              />
            </View>
            <Text style={styles.progressLabel}>{statusMeta.label}</Text>
          </View>
        )}

        {/* ─── Footer ────────────────────────────────────── */}
        <View style={styles.cardFooter}>
          <View style={styles.timeContainer}>
            <Ionicons name="time-outline" size={14} color={COLORS.lightMuted} />
            <Text style={styles.timeText}>
              {new Date(item.createdAt).toLocaleDateString('en-IN', {
                day: '2-digit',
                month: 'short',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </Text>
          </View>

          <View style={styles.footerRight}>
            <Text style={styles.priceText}>
              ₹{item.pricing?.grandTotal || 0}
            </Text>
            <Pressable
              style={styles.actionBtn}
              onPress={() =>
                navigation.navigate('RiderOrderDetails', { orderId: item._id })
              }
            >
              <Text style={styles.actionBtnText}>View</Text>
              <Ionicons
                name="chevron-forward"
                size={14}
                color={COLORS.primary}
              />
            </Pressable>
          </View>
        </View>
      </Pressable>
    );
  };

  if (loading && !refreshing) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
      <View style={styles.container}>
        {/* ─── Header ────────────────────────────────────── */}
        <View style={styles.headerRow}>
          <Text style={styles.pageTitle}>My Deliveries</Text>
          <LinearGradient
            colors={[COLORS.primary, COLORS.primaryDark]}
            style={styles.totalBadge}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <Text style={styles.totalBadgeText}>
              {filteredOrders.length} Orders
            </Text>
          </LinearGradient>
        </View>

        {/* ─── Tabs ──────────────────────────────────────── */}
        <View style={styles.tabContainer}>
          <Pressable
            style={[
              styles.tabBtn,
              activeTab === 'active' && styles.activeTabBtn,
            ]}
            onPress={() => setActiveTab('active')}
          >
            <LinearGradient
              colors={
                activeTab === 'active'
                  ? [COLORS.primary, COLORS.primaryDark]
                  : ['transparent', 'transparent']
              }
              style={styles.tabGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Text
                style={[
                  styles.tabText,
                  activeTab === 'active' && styles.activeTabText,
                ]}
              >
                Active Rides
              </Text>
            </LinearGradient>
          </Pressable>

          <Pressable
            style={[
              styles.tabBtn,
              activeTab === 'history' && styles.activeTabBtn,
            ]}
            onPress={() => setActiveTab('history')}
          >
            <LinearGradient
              colors={
                activeTab === 'history'
                  ? [COLORS.primary, COLORS.primaryDark]
                  : ['transparent', 'transparent']
              }
              style={styles.tabGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Text
                style={[
                  styles.tabText,
                  activeTab === 'history' && styles.activeTabText,
                ]}
              >
                History
              </Text>
            </LinearGradient>
          </Pressable>
        </View>

        {/* ─── Orders List ──────────────────────────────── */}
        <FlatList
          data={filteredOrders}
          renderItem={renderItem}
          keyExtractor={item => item._id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={COLORS.primary}
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <View style={styles.emptyIconCircle}>
                <Ionicons
                  name={
                    activeTab === 'active'
                      ? 'bicycle-outline'
                      : 'receipt-outline'
                  }
                  size={48}
                  color={COLORS.lightMuted}
                />
              </View>
              <Text style={styles.emptyText}>
                {activeTab === 'active'
                  ? 'No Active Orders'
                  : 'No Order History'}
              </Text>
              <Text style={styles.emptySubtext}>
                {activeTab === 'active'
                  ? 'Orders you accept will appear here for easy tracking.'
                  : 'Delivered and cancelled orders will be listed here.'}
              </Text>
            </View>
          }
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 12,
  },

  /* Header */
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  pageTitle: {
    fontSize: 28,
    fontWeight: '900',
    color: COLORS.title,
    letterSpacing: -0.5,
  },
  totalBadge: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  totalBadgeText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#FFF',
  },

  /* Tabs */
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#F1F5F9',
    borderRadius: 14,
    padding: 4,
    marginBottom: 16,
  },
  tabBtn: {
    flex: 1,
    borderRadius: 10,
    overflow: 'hidden',
  },
  tabGradient: {
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.muted,
  },
  activeTabText: {
    color: '#FFF',
  },

  /* Card */
  orderCard: {
    backgroundColor: COLORS.white,
    borderRadius: 20,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.04,
    shadowRadius: 12,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  orderNumberBadge: {
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  orderId: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.title,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '800',
  },

  /* Body */
  cardBody: {
    flexDirection: 'row',
    gap: 14,
    alignItems: 'center',
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  imageContainer: {
    position: 'relative',
    width: 72,
    height: 72,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#F8FAFC',
  },
  itemImage: {
    width: '100%',
    height: '100%',
  },
  placeholderImage: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  itemCountOverlay: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: 'rgba(15, 23, 42, 0.8)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderTopLeftRadius: 8,
  },
  itemCountText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#FFF',
  },

  detailsContainer: {
    flex: 1,
  },
  vendorName: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.title,
  },
  itemsSummary: {
    fontSize: 13,
    color: COLORS.text,
    fontWeight: '600',
    marginTop: 2,
  },
  metaRow: {
    marginTop: 6,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 12,
    color: COLORS.muted,
    fontWeight: '500',
    flex: 1,
  },

  /* Progress Bar */
  progressContainer: {
    marginTop: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  progressTrack: {
    flex: 1,
    height: 6,
    backgroundColor: '#F1F5F9',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: COLORS.primary,
    borderRadius: 3,
  },
  progressNearComplete: {
    backgroundColor: COLORS.success,
  },
  progressLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.muted,
    width: 60,
    textAlign: 'right',
  },

  /* Footer */
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    marginTop: 4,
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  timeText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.lightMuted,
  },
  footerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  priceText: {
    fontSize: 18,
    fontWeight: '900',
    color: COLORS.title,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    backgroundColor: COLORS.primaryLight,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 10,
  },
  actionBtnText: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.primary,
  },

  /* Empty State */
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    backgroundColor: COLORS.white,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginTop: 10,
  },
  emptyIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.title,
  },
  emptySubtext: {
    fontSize: 14,
    color: COLORS.muted,
    textAlign: 'center',
    marginTop: 6,
    paddingHorizontal: 30,
  },
});
