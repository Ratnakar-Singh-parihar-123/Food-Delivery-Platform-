import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  StatusBar,
  Animated,
  Easing,
  ActivityIndicator,
  RefreshControl,
  Alert,
  PermissionsAndroid,
  Platform,
  Dimensions,
  Modal,
  FlatList,
  Vibration,
  Image,
  Linking, // ✅ Added missing import
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import LinearGradient from 'react-native-linear-gradient';
import Geolocation from '@react-native-community/geolocation';
import Sound from 'react-native-sound';
import io from 'socket.io-client';

import {
  getRiderProfile,
  toggleRiderOnline,
  getNearbyOrders,
  updateRiderLocation,
  riderAcceptOrder,
  riderRejectOrder,
} from '../../api/riderApi';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width - 40;
const SOCKET_URL = 'http://10.200.227.211:9000';
const MAX_ORDERS = 10;

// ─── Base URL for images ──────────────────────────────────
const BASE_URL = 'http://10.200.227.211:9000';

const getImageUrl = url => {
  if (!url) return null;
  if (url.startsWith('http')) return url;
  if (url.startsWith('/')) return BASE_URL + url;
  return BASE_URL + '/' + url;
};

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
  danger: '#EF4444',
  warning: '#F59E0B',
  info: '#3B82F6',
};

const STATUS_CONFIG = {
  ready_for_pickup: {
    label: 'Ready to Pick',
    color: '#059669',
    bg: '#D1FAE5',
    icon: 'bag-handle-outline',
  },
  rider_assigned: {
    label: 'Assigned',
    color: '#0284C7',
    bg: '#E0F2FE',
    icon: 'bicycle-outline',
  },
  picked_up: {
    label: 'Picked Up',
    color: '#D97706',
    bg: '#FEF3C7',
    icon: 'cube-outline',
  },
  on_the_way: {
    label: 'On The Way',
    color: '#FF6B35',
    bg: '#FFF0EA',
    icon: 'navigate-outline',
  },
  delivered: {
    label: 'Delivered',
    color: '#16A34A',
    bg: '#DCFCE7',
    icon: 'checkmark-done-circle-outline',
  },
  cancelled: {
    label: 'Cancelled',
    color: '#DC2626',
    bg: '#FEE2E2',
    icon: 'close-circle-outline',
  },
  rejected: {
    label: 'Rejected',
    color: '#475569',
    bg: '#F1F5F9',
    icon: 'ban-outline',
  },
};

const bannerData = [
  {
    id: '1',
    title: '🚀 High Demand Zone!',
    subtitle: 'Earn up to 20% extra bonus per delivery',
    image: 'https://picsum.photos/seed/offer1/600/200',
    bgColor: '#FFF3EB',
  },
  {
    id: '2',
    title: '🏆 Top Rider Rewards',
    subtitle: 'Complete 15 rides today to unlock bonus',
    image: 'https://picsum.photos/seed/offer2/600/200',
    bgColor: '#E0F2FE',
  },
  {
    id: '3',
    title: '📢 Safety First',
    subtitle: 'Wear your helmet and follow speed limits',
    image: 'https://picsum.photos/seed/offer3/600/200',
    bgColor: '#FCE4EC',
  },
];

export default function RiderHomeScreen({ navigation }) {
  // ─── State ──────────────────────────────────────────────
  const [profile, setProfile] = useState(null);
  const [isOnline, setIsOnline] = useState(false);
  const [nearbyOrders, setNearbyOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [location, setLocation] = useState(null);
  const [address, setAddress] = useState('Fetching location...');
  const [addressLoading, setAddressLoading] = useState(false);
  const [todayStats, setTodayStats] = useState({
    deliveries: 0,
    earnings: 0,
    rating: 0,
  });

  const [newOrder, setNewOrder] = useState(null);
  const [showOrderPopup, setShowOrderPopup] = useState(false);

  // ─── Animations & Refs ────────────────────────────────────
  const topSlide = useRef(new Animated.Value(-500)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideUp = useRef(new Animated.Value(20)).current;

  const previousOrderIds = useRef(new Set());
  const soundRef = useRef(null);
  const vibrationIntervalRef = useRef(null);
  const socketRef = useRef(null);
  const pollIntervalRef = useRef(null);

  // ─── Helper: Sort by latest createdAt and limit ──────
  const sortAndLimitOrders = useCallback(orders => {
    if (!orders || orders.length === 0) return [];
    const sorted = [...orders].sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
    );
    return sorted.slice(0, MAX_ORDERS);
  }, []);

  // ─── Ringtone ──────────────────────────────────────────
  const playRingtone = () => {
    try {
      if (soundRef.current) {
        soundRef.current.release();
        soundRef.current = null;
      }
      const fileName =
        Platform.OS === 'android' ? 'new_order' : 'new_order.mp3';
      const newSound = new Sound(fileName, Sound.MAIN_BUNDLE, error => {
        if (error) {
          Vibration.vibrate(1000);
          return;
        }
        newSound.setNumberOfLoops(-1);
        newSound.play();
      });
      soundRef.current = newSound;
    } catch (e) {
      Vibration.vibrate(1000);
    }
    if (vibrationIntervalRef.current)
      clearInterval(vibrationIntervalRef.current);
    Vibration.vibrate(500);
    vibrationIntervalRef.current = setInterval(() => {
      Vibration.vibrate(500);
    }, 2000);
  };

  const stopRingtone = () => {
    if (soundRef.current) {
      soundRef.current.stop(() => {
        soundRef.current.release();
        soundRef.current = null;
      });
    }
    if (vibrationIntervalRef.current) {
      clearInterval(vibrationIntervalRef.current);
      vibrationIntervalRef.current = null;
    }
    Vibration.cancel();
  };

  // ─── Reverse Geocoding ────────────────────────────────────
  const reverseGeocode = async (lat, lng) => {
    try {
      setAddressLoading(true);
      const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`;
      const response = await fetch(url, {
        headers: { 'User-Agent': 'FoodMitra Delivery Partner/1.0' },
      });
      const data = await response.json();
      if (data && data.display_name) return data.display_name;
      return `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
    } catch {
      return `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
    } finally {
      setAddressLoading(false);
    }
  };

  // ─── Location ──────────────────────────────────────────
  const requestLocationPermission = async () => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      } catch {
        return false;
      }
    }
    return true;
  };

  const getCurrentLocation = async () => {
    const hasPermission = await requestLocationPermission();
    if (!hasPermission) {
      setAddress('Location permission denied');
      const mock = { latitude: 28.6139, longitude: 77.209 };
      setLocation(mock);
      updateRiderLocation(mock).catch(() => {});
      return;
    }
    const isGeolocationAvailable =
      Geolocation && typeof Geolocation.getCurrentPosition === 'function';
    if (!isGeolocationAvailable) {
      const mock = { latitude: 28.6139, longitude: 77.209 };
      setLocation(mock);
      const addr = await reverseGeocode(mock.latitude, mock.longitude);
      setAddress(addr);
      updateRiderLocation(mock).catch(() => {});
      return;
    }
    Geolocation.getCurrentPosition(
      async pos => {
        const { latitude, longitude } = pos.coords;
        setLocation({ latitude, longitude });
        const addr = await reverseGeocode(latitude, longitude);
        setAddress(addr);
        updateRiderLocation({ latitude, longitude }).catch(() => {});
      },
      async () => {
        const mock = { latitude: 28.6139, longitude: 77.209 };
        setLocation(mock);
        setAddress('Unable to fetch live address');
        updateRiderLocation(mock).catch(() => {});
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 },
    );
  };

  // ─── Fetch Data ──────────────────────────────────────────
  const fetchData = async () => {
    try {
      setLoading(true);
      const profileRes = await getRiderProfile();
      setProfile(profileRes.data.rider);
      setIsOnline(profileRes.data.rider.isOnline || false);

      const ordersRes = await getNearbyOrders();
      const orders = ordersRes.data.orders || [];
      const sortedLimited = sortAndLimitOrders(orders);
      setNearbyOrders(sortedLimited);
      sortedLimited.forEach(o => previousOrderIds.current.add(o._id));

      setTodayStats({
        deliveries: 8,
        earnings: 640,
        rating: 4.9,
      });
    } catch (error) {
      console.error('Fetch Home Error:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // ─── Popup ─────────────────────────────────────────────
  const triggerNewOrderPopup = order => {
    setNewOrder(order);
    setShowOrderPopup(true);
    playRingtone();
    topSlide.setValue(-500);
    Animated.timing(topSlide, {
      toValue: 0,
      duration: 350,
      easing: Easing.out(Easing.quad),
      useNativeDriver: true,
    }).start();
  };

  const closePopup = () => {
    stopRingtone();
    Animated.timing(topSlide, {
      toValue: -500,
      duration: 250,
      easing: Easing.in(Easing.quad),
      useNativeDriver: true,
    }).start(() => {
      setShowOrderPopup(false);
      setNewOrder(null);
    });
  };

  // ─── Polling ────────────────────────────────────────────
  const checkForNewOrders = async () => {
    if (!isOnline) return;
    try {
      const ordersRes = await getNearbyOrders();
      const orders = ordersRes.data.orders || [];
      const sortedLimited = sortAndLimitOrders(orders);

      const newOrders = sortedLimited.filter(
        o => !previousOrderIds.current.has(o._id),
      );
      if (newOrders.length > 0) {
        const firstNew = newOrders[0];
        triggerNewOrderPopup(firstNew);
        newOrders.forEach(o => previousOrderIds.current.add(o._id));
      }
      setNearbyOrders(sortedLimited);
    } catch (error) {
      console.warn('Polling error:', error);
    }
  };

  // ─── Effects ─────────────────────────────────────────────
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.spring(slideUp, {
        toValue: 0,
        tension: 50,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();

    getCurrentLocation();
    fetchData();

    pollIntervalRef.current = setInterval(checkForNewOrders, 5000);

    if (isOnline) {
      const socket = io(SOCKET_URL, {
        transports: ['websocket'],
        reconnection: true,
      });
      socketRef.current = socket;

      socket.on('new_ready_order', order => {
        if (!previousOrderIds.current.has(order._id)) {
          setNearbyOrders(prev => {
            const updated = [order, ...prev];
            const sortedLimited = sortAndLimitOrders(updated);
            const currentIds = new Set(sortedLimited.map(o => o._id));
            previousOrderIds.current.forEach(id => {
              if (!currentIds.has(id)) previousOrderIds.current.delete(id);
            });
            previousOrderIds.current.add(order._id);
            return sortedLimited;
          });
          triggerNewOrderPopup(order);
        }
      });

      socket.on('connect_error', err => {
        console.warn('Socket connection error:', err);
      });
    }

    return () => {
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
      stopRingtone();
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, [isOnline]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    getCurrentLocation();
  };

  // ─── Order Actions ───────────────────────────────────────
  const handleToggleOnline = async () => {
    try {
      const newStatus = !isOnline;
      await toggleRiderOnline({ isOnline: newStatus });
      setIsOnline(newStatus);
    } catch (error) {
      Alert.alert('Status Error', 'Could not update online status.');
    }
  };

  const handleAcceptOrder = async orderId => {
    try {
      await riderAcceptOrder({ orderId });
      setNearbyOrders(prev => {
        const filtered = prev.filter(o => o._id !== orderId);
        previousOrderIds.current.delete(orderId);
        return filtered;
      });
      closePopup();
      Alert.alert('Order Accepted!', 'Navigating to pickup details.');
    } catch (error) {
      Alert.alert('Error', 'Failed to accept order.');
    }
  };

  const handleRejectOrder = async orderId => {
    try {
      await riderRejectOrder({ orderId, reason: 'Rider unavailable' });
      setNearbyOrders(prev => {
        const filtered = prev.filter(o => o._id !== orderId);
        previousOrderIds.current.delete(orderId);
        return filtered;
      });
      closePopup();
    } catch (error) {
      Alert.alert('Error', 'Failed to reject order.');
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning ☀️';
    if (hour < 17) return 'Good Afternoon 🌤️';
    return 'Good Evening 🌙';
  };

  // ─── Render Banner ──────────────────────────────────────
  const renderBannerItem = ({ item }) => (
    <View style={[styles.bannerCard, { backgroundColor: item.bgColor }]}>
      <Image
        source={{ uri: item.image }}
        style={styles.bannerImage}
        resizeMode="cover"
      />
      <LinearGradient
        colors={['transparent', 'rgba(15, 23, 42, 0.75)']}
        style={styles.bannerOverlay}
      >
        <View style={styles.bannerContent}>
          <Text style={styles.bannerTitle}>{item.title}</Text>
          <Text style={styles.bannerSubtitle}>{item.subtitle}</Text>
        </View>
      </LinearGradient>
    </View>
  );

  // ─── Render Order Card ──────────────────────────────────
  const renderOrderCard = order => {
    const statusMeta = STATUS_CONFIG[order.status] || {
      label: order.status?.replace(/_/g, ' ') || 'Order',
      color: COLORS.muted,
      bg: '#F1F5F9',
      icon: 'receipt-outline',
    };

    const firstItem = order.items?.[0];
    const imageUri =
      getImageUrl(firstItem?.image) ||
      getImageUrl(firstItem?.foodItem?.image) ||
      getImageUrl(order.vendor?.logo) ||
      null;

    const totalItems = order.items?.length || 0;
    const distance = order.distance
      ? `${order.distance.toFixed(1)} km`
      : '1.5 km';

    return (
      <Pressable
        key={order._id}
        style={styles.orderCard}
        onPress={() =>
          navigation.navigate('RiderOrderDetails', { orderId: order._id })
        }
      >
        <View style={styles.orderCardInner}>
          {/* Left: Image */}
          <View style={styles.orderImageContainer}>
            {imageUri ? (
              <Image source={{ uri: imageUri }} style={styles.orderImage} />
            ) : (
              <View style={styles.orderImagePlaceholder}>
                <Ionicons
                  name="fast-food-outline"
                  size={28}
                  color={COLORS.lightMuted}
                />
              </View>
            )}
            {totalItems > 1 && (
              <View style={styles.orderItemCountBadge}>
                <Text style={styles.orderItemCountText}>+{totalItems - 1}</Text>
              </View>
            )}
          </View>

          {/* Right: Details */}
          <View style={styles.orderInfo}>
            <View style={styles.orderHeaderRow}>
              <Text style={styles.orderId}>#{order.orderNumber || '0000'}</Text>
              <View
                style={[
                  styles.orderStatusBadge,
                  { backgroundColor: statusMeta.bg },
                ]}
              >
                <Ionicons
                  name={statusMeta.icon}
                  size={12}
                  color={statusMeta.color}
                />
                <Text
                  style={[styles.orderStatusText, { color: statusMeta.color }]}
                >
                  {statusMeta.label}
                </Text>
              </View>
            </View>

            <Text style={styles.orderVendorName} numberOfLines={1}>
              {order.vendor?.businessName || 'FoodMitra Partner'}
            </Text>

            <Text style={styles.orderItemsSummary} numberOfLines={1}>
              {firstItem
                ? `${firstItem.quantity}x ${firstItem.name || 'Item'}`
                : 'Multiple items'}
              {totalItems > 1 ? ` +${totalItems - 1} more` : ''}
            </Text>

            <View style={styles.orderMetaRow}>
              <View style={styles.orderMetaItem}>
                <Ionicons
                  name="navigate-outline"
                  size={14}
                  color={COLORS.muted}
                />
                <Text style={styles.orderMetaText}>{distance}</Text>
              </View>
              <View style={styles.orderMetaItem}>
                <Ionicons name="cash-outline" size={14} color={COLORS.muted} />
                <Text style={styles.orderMetaText}>
                  ₹{order.pricing?.grandTotal || 0}
                </Text>
              </View>
            </View>

            <View style={styles.orderActionRow}>
              <Pressable
                style={[styles.orderActionBtn, styles.orderRejectBtn]}
                onPress={() => handleRejectOrder(order._id)}
              >
                <Text style={styles.orderRejectText}>Decline</Text>
              </Pressable>
              <Pressable
                style={[styles.orderActionBtn, styles.orderAcceptBtn]}
                onPress={() => handleAcceptOrder(order._id)}
              >
                <LinearGradient
                  colors={[COLORS.primary, COLORS.primaryDark]}
                  style={styles.orderAcceptGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                >
                  <Text style={styles.orderAcceptText}>Accept</Text>
                </LinearGradient>
              </Pressable>
            </View>
          </View>
        </View>
      </Pressable>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
      <Animated.View
        style={[
          styles.container,
          { opacity: fadeAnim, transform: [{ translateY: slideUp }] },
        ]}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={COLORS.primary}
            />
          }
        >
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <LinearGradient
                colors={[COLORS.primary, COLORS.primaryDark]}
                style={styles.avatar}
              >
                <Text style={styles.avatarText}>
                  {profile?.firstName?.[0] || 'R'}
                </Text>
              </LinearGradient>
              <View>
                <Text style={styles.greeting}>{getGreeting()}</Text>
                <Text style={styles.riderName}>
                  {profile?.firstName} {profile?.lastName}
                </Text>
              </View>
            </View>

            <Pressable
              style={[
                styles.onlineToggle,
                isOnline && styles.onlineToggleActive,
              ]}
              onPress={handleToggleOnline}
            >
              <View style={[styles.dot, isOnline && styles.dotActive]} />
              <Text
                style={[styles.toggleText, isOnline && styles.toggleTextActive]}
              >
                {isOnline ? 'ONLINE' : 'OFFLINE'}
              </Text>
            </Pressable>
          </View>

          {/* Location */}
          <View style={styles.locationCard}>
            <View style={styles.locationIconBg}>
              <Ionicons name="location" size={18} color={COLORS.primary} />
            </View>
            <View style={styles.locationInfo}>
              <Text style={styles.locationLabel}>CURRENT LOCATION</Text>
              <Text style={styles.locationText} numberOfLines={1}>
                {addressLoading ? 'Updating address...' : address}
              </Text>
            </View>
            <Pressable
              onPress={getCurrentLocation}
              style={styles.refreshLocation}
              disabled={addressLoading}
            >
              <Ionicons
                name="refresh-outline"
                size={18}
                color={COLORS.primary}
              />
            </Pressable>
          </View>

          {/* Banners */}
          <View style={styles.bannerContainer}>
            <FlatList
              data={bannerData}
              renderItem={renderBannerItem}
              keyExtractor={item => item.id}
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              snapToInterval={CARD_WIDTH + 10}
              decelerationRate="fast"
            />
          </View>

          {/* Stats */}
          <View style={styles.statsRow}>
            <LinearGradient
              colors={['#FFF5EF', '#FFFFFF']}
              style={styles.statCard}
            >
              <Ionicons name="bicycle" size={24} color={COLORS.primary} />
              <Text style={styles.statValue}>{todayStats.deliveries}</Text>
              <Text style={styles.statLabel}>Deliveries</Text>
            </LinearGradient>
            <LinearGradient
              colors={['#F0FDF4', '#FFFFFF']}
              style={styles.statCard}
            >
              <Ionicons
                name="wallet-outline"
                size={24}
                color={COLORS.success}
              />
              <Text style={styles.statValue}>₹{todayStats.earnings}</Text>
              <Text style={styles.statLabel}>Earnings</Text>
            </LinearGradient>
            <LinearGradient
              colors={['#FEFCE8', '#FFFFFF']}
              style={styles.statCard}
            >
              <Ionicons name="star" size={24} color="#EAB308" />
              <Text style={styles.statValue}>{todayStats.rating}</Text>
              <Text style={styles.statLabel}>Rating</Text>
            </LinearGradient>
          </View>

          {/* Nearby Orders List */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Nearby Orders</Text>
            <Pressable onPress={() => navigation.navigate('Orders')}>
              <Text style={styles.sectionAction}>View All</Text>
            </Pressable>
          </View>

          {nearbyOrders.length === 0 ? (
            <View style={styles.emptyState}>
              <View style={styles.emptyIconCircle}>
                <Ionicons
                  name="cube-outline"
                  size={42}
                  color={COLORS.lightMuted}
                />
              </View>
              <Text style={styles.emptyText}>No Orders Available</Text>
              <Text style={styles.emptySubtext}>
                Stay online! New orders will pop up automatically.
              </Text>
            </View>
          ) : (
            nearbyOrders.map(order => renderOrderCard(order))
          )}
          <View style={{ height: 40 }} />
        </ScrollView>
      </Animated.View>

      {/* ─── NEW ORDER POPUP (Premium) ─────────────────── */}
      {showOrderPopup && newOrder && (
        <Modal transparent visible={showOrderPopup} animationType="none">
          <View style={styles.modalOverlay}>
            <Animated.View
              style={[
                styles.modalContainer,
                { transform: [{ translateY: topSlide }] },
              ]}
            >
              <LinearGradient
                colors={['#FFFFFF', '#FFFAF8']}
                style={styles.modalContent}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                {/* Header */}
                <View style={styles.modalHeader}>
                  <LinearGradient
                    colors={[COLORS.primary, COLORS.primaryDark]}
                    style={styles.modalAlertBadge}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                  >
                    <Ionicons name="flash" size={14} color="#FFF" />
                    <Text style={styles.modalAlertText}>NEW ORDER</Text>
                  </LinearGradient>
                  <Pressable onPress={closePopup} style={styles.modalCloseBtn}>
                    <Ionicons name="close" size={22} color={COLORS.title} />
                  </Pressable>
                </View>

                {/* ─── Image (First Item Image or Vendor Logo) ─── */}
                <View style={styles.modalImageContainer}>
                  {(() => {
                    const firstItem = newOrder.items?.[0];
                    const imageUrl =
                      getImageUrl(firstItem?.image) ||
                      getImageUrl(firstItem?.foodItem?.image) ||
                      getImageUrl(newOrder.vendor?.logo);
                    return imageUrl ? (
                      <Image
                        source={{ uri: imageUrl }}
                        style={styles.modalImage}
                      />
                    ) : (
                      <View style={styles.modalImagePlaceholder}>
                        <Ionicons
                          name="fast-food-outline"
                          size={40}
                          color={COLORS.lightMuted}
                        />
                      </View>
                    );
                  })()}
                  <View style={styles.modalItemCount}>
                    <Text style={styles.modalItemCountText}>
                      {newOrder.items?.length || 1} Items
                    </Text>
                  </View>
                </View>

                {/* Main Info */}
                <View style={styles.modalMainInfo}>
                  <Text style={styles.modalOrderTitle}>
                    Order #{newOrder.orderNumber || '0000'}
                  </Text>
                  <Text style={styles.modalVendorName}>
                    {newOrder.vendor?.businessName || 'FoodMitra Restaurant'}
                  </Text>
                  <Text style={styles.modalItemsSummary} numberOfLines={2}>
                    {newOrder.items
                      ?.map(i => `${i.quantity}x ${i.name}`)
                      .join(', ')}
                  </Text>

                  {/* ─── Pickup Code ────────────────────────────── */}
                  {newOrder.pickupCode && (
                    <View style={styles.modalPickupRow}>
                      <Ionicons
                        name="key-outline"
                        size={16}
                        color={COLORS.primary}
                      />
                      <Text style={styles.modalPickupText}>
                        Pickup Code:{' '}
                        <Text style={{ fontWeight: '900' }}>
                          {newOrder.pickupCode}
                        </Text>
                      </Text>
                    </View>
                  )}

                  <View style={styles.modalMetaRow}>
                    <View style={styles.modalMetaChip}>
                      <Ionicons
                        name="navigate-outline"
                        size={14}
                        color={COLORS.muted}
                      />
                      <Text style={styles.modalMetaText}>
                        {newOrder.distance
                          ? `${newOrder.distance.toFixed(1)} km`
                          : '1.8 km'}{' '}
                        away
                      </Text>
                    </View>
                    <View style={styles.modalMetaChip}>
                      <Ionicons
                        name="cash-outline"
                        size={14}
                        color={COLORS.muted}
                      />
                      <Text style={styles.modalMetaText}>
                        ₹{newOrder.pricing?.grandTotal || 0}
                      </Text>
                    </View>
                  </View>
                </View>

                {/* ─── Full Address (with Google Maps Link) ─── */}
                <Pressable
                  style={styles.modalAddressContainer}
                  onPress={() => {
                    const loc = newOrder.deliveryAddress?.location;
                    if (loc?.coordinates) {
                      const [lng, lat] = loc.coordinates;
                      const url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
                      Linking.openURL(url).catch(() =>
                        Alert.alert('Error', 'Unable to open maps'),
                      );
                    } else {
                      Alert.alert('Info', 'Location not available');
                    }
                  }}
                >
                  <Ionicons
                    name="location-outline"
                    size={20}
                    color={COLORS.primary}
                  />
                  <View style={styles.modalAddressTextContainer}>
                    <Text style={styles.modalAddressLine} numberOfLines={1}>
                      {newOrder.deliveryAddress?.addressLine ||
                        'Customer address'}
                    </Text>
                    {(newOrder.deliveryAddress?.landmark ||
                      newOrder.deliveryAddress?.city) && (
                      <Text style={styles.modalAddressSub} numberOfLines={1}>
                        {[
                          newOrder.deliveryAddress?.landmark,
                          newOrder.deliveryAddress?.city,
                          newOrder.deliveryAddress?.pincode,
                        ]
                          .filter(Boolean)
                          .join(', ')}
                      </Text>
                    )}
                  </View>
                  <Ionicons
                    name="chevron-forward"
                    size={18}
                    color={COLORS.muted}
                  />
                </Pressable>

                {/* Actions */}
                <View style={styles.modalActionRow}>
                  <Pressable
                    style={[styles.modalActionBtn, styles.modalRejectBtn]}
                    onPress={() => handleRejectOrder(newOrder._id)}
                  >
                    <Text style={styles.modalRejectText}>Decline</Text>
                  </Pressable>
                  <Pressable
                    style={[styles.modalActionBtn, styles.modalAcceptBtn]}
                    onPress={() => handleAcceptOrder(newOrder._id)}
                  >
                    <LinearGradient
                      colors={[COLORS.primary, COLORS.primaryDark]}
                      style={styles.modalAcceptGradient}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                    >
                      <Text style={styles.modalAcceptText}>Accept Order</Text>
                      <Ionicons
                        name="arrow-forward-circle"
                        size={20}
                        color="#FFF"
                      />
                    </LinearGradient>
                  </Pressable>
                </View>
              </LinearGradient>
            </Animated.View>
          </View>
        </Modal>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.background, paddingBottom: 30 },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  container: { flex: 1, paddingHorizontal: 16, paddingTop: 12 },

  /* Header */
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
  },
  avatarText: { fontSize: 20, fontWeight: '800', color: '#FFF' },
  greeting: { fontSize: 12, color: COLORS.muted, fontWeight: '600' },
  riderName: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.title,
    letterSpacing: -0.3,
  },
  onlineToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    backgroundColor: COLORS.white,
  },
  onlineToggleActive: {
    borderColor: COLORS.success,
    backgroundColor: '#F0FDF4',
  },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: COLORS.muted },
  dotActive: { backgroundColor: COLORS.success },
  toggleText: { fontSize: 11, fontWeight: '800', color: COLORS.muted },
  toggleTextActive: { color: COLORS.success },

  /* Location */
  locationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  locationIconBg: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: '#FFF0EA',
    alignItems: 'center',
    justifyContent: 'center',
  },
  locationInfo: { flex: 1, marginLeft: 10 },
  locationLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: COLORS.muted,
    letterSpacing: 0.8,
  },
  locationText: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.title,
    marginTop: 1,
  },
  refreshLocation: { padding: 4 },

  /* Banners */
  bannerContainer: { marginBottom: 20 },
  bannerCard: {
    borderRadius: 18,
    width: CARD_WIDTH,
    height: 120,
    marginRight: 10,
    overflow: 'hidden',
    position: 'relative',
  },
  bannerImage: { width: '100%', height: '100%' },
  bannerOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '100%',
    justifyContent: 'flex-end',
  },
  bannerContent: { padding: 14 },
  bannerTitle: { fontSize: 18, fontWeight: '800', color: '#FFF' },
  bannerSubtitle: {
    fontSize: 12,
    fontWeight: '500',
    color: 'rgba(255,255,255,0.85)',
    marginTop: 2,
  },

  /* Stats */
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  statValue: {
    marginTop: 6,
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.title,
  },
  statLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.muted,
    marginTop: 2,
  },

  /* Section */
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: { fontSize: 18, fontWeight: '800', color: COLORS.title },
  sectionAction: { fontSize: 13, fontWeight: '700', color: COLORS.primary },

  /* Empty */
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 36,
    backgroundColor: COLORS.white,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  emptyIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  emptyText: { fontSize: 15, fontWeight: '700', color: COLORS.title },
  emptySubtext: {
    fontSize: 12,
    color: COLORS.muted,
    marginTop: 4,
    textAlign: 'center',
    paddingHorizontal: 20,
  },

  /* ─── Order Card ─────────────────────────────────────── */
  orderCard: {
    backgroundColor: COLORS.white,
    borderRadius: 20,
    padding: 12,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 3,
  },
  orderCardInner: {
    flexDirection: 'row',
    gap: 14,
  },
  orderImageContainer: {
    position: 'relative',
    width: 80,
    height: 80,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#F8FAFC',
  },
  orderImage: {
    width: '100%',
    height: '100%',
  },
  orderImagePlaceholder: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  orderItemCountBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: 'rgba(15, 23, 42, 0.8)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderTopLeftRadius: 8,
  },
  orderItemCountText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#FFF',
  },
  orderInfo: {
    flex: 1,
    justifyContent: 'space-between',
  },
  orderHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  orderId: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.title,
  },
  orderStatusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  orderStatusText: {
    fontSize: 10,
    fontWeight: '800',
  },
  orderVendorName: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.title,
    marginTop: 2,
  },
  orderItemsSummary: {
    fontSize: 13,
    color: COLORS.text,
    fontWeight: '500',
    marginTop: 1,
  },
  orderMetaRow: {
    flexDirection: 'row',
    gap: 14,
    marginTop: 4,
  },
  orderMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  orderMetaText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.muted,
  },
  orderActionRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 6,
  },
  orderActionBtn: {
    flex: 1,
    height: 36,
    borderRadius: 10,
    overflow: 'hidden',
  },
  orderRejectBtn: {
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  orderRejectText: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.text,
  },
  orderAcceptGradient: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  orderAcceptText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#FFF',
  },

  /* ─── POPUP MODAL ────────────────────────────────────── */
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingTop: Platform.OS === 'ios' ? 50 : 30,
  },
  modalContainer: {
    width: width - 28,
  },
  modalContent: {
    borderRadius: 28,
    padding: 20,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 107, 53, 0.3)',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.25,
    shadowRadius: 24,
    elevation: 12,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modalAlertBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  modalAlertText: {
    fontSize: 11,
    fontWeight: '900',
    color: '#FFF',
    letterSpacing: 0.8,
  },
  modalCloseBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalImageContainer: {
    alignItems: 'center',
    marginTop: 12,
    marginBottom: 8,
    position: 'relative',
  },
  modalImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 2,
    borderColor: '#FFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  modalImagePlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFF',
  },
  modalItemCount: {
    position: 'absolute',
    bottom: 0,
    right: width / 2 - 50,
    backgroundColor: COLORS.primary,
    paddingHorizontal: 10,
    paddingVertical: 2,
    borderRadius: 12,
  },
  modalItemCountText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#FFF',
  },
  modalMainInfo: {
    alignItems: 'center',
    marginVertical: 8,
  },
  modalOrderTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: COLORS.title,
  },
  modalVendorName: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
    marginTop: 2,
  },
  modalItemsSummary: {
    fontSize: 14,
    color: COLORS.muted,
    fontWeight: '500',
    textAlign: 'center',
    marginTop: 2,
  },
  modalMetaRow: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 6,
  },
  modalMetaChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  modalMetaText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.muted,
  },
  modalAddressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 14,
    marginTop: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  modalAddressTextContainer: {
    flex: 1,
  },
  modalAddressLine: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.title,
  },
  modalAddressSub: {
    fontSize: 12,
    color: COLORS.muted,
    marginTop: 1,
  },
  modalActionRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
  modalActionBtn: {
    flex: 1,
    height: 50,
    borderRadius: 16,
    overflow: 'hidden',
  },
  modalRejectBtn: {
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  modalRejectText: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.text,
  },
  modalAcceptGradient: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  modalAcceptText: {
    fontSize: 16,
    fontWeight: '900',
    color: '#FFF',
    letterSpacing: 0.2,
  },
});
