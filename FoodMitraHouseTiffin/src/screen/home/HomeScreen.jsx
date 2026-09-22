// screens/partner/HomeScreen.js
import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  RefreshControl,
  StatusBar,
  Switch,
  Image,
  Dimensions,
  FlatList,
  Animated,
  Easing,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from '@react-native-vector-icons/ionicons';
import LinearGradient from 'react-native-linear-gradient';
import { COLORS } from '../../constants/colors';

const { width } = Dimensions.get('window');

// ─── DUMMY DATA ────────────────────────────────────────────
const DUMMY_BANNER = {
  id: 'b1',
  image:
    'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=800&q=80',
  title: 'Tiffin Special',
  subtitle: 'Get 20% off on weekly subscriptions',
};

const DUMMY_NEW_ORDERS = [
  {
    id: '1',
    customer: 'Rajesh Kumar',
    items: '2 x Thali + 1 x Dal Rice',
    time: '5 min ago',
    image:
      'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=200&q=80',
  },
  {
    id: '2',
    customer: 'Priya Sharma',
    items: '1 x Paneer Sabzi + 3 Chapati',
    time: '12 min ago',
    image:
      'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=200&q=80',
  },
  {
    id: '3',
    customer: 'Amit Singh',
    items: '2 x Veg Biryani',
    time: '25 min ago',
    image:
      'https://images.unsplash.com/photo-1589302168068-964664d93dc0?auto=format&fit=crop&w=200&q=80',
  },
];

const DUMMY_MENU = [
  { id: 'm1', name: 'Thali', icon: '🍛' },
  { id: 'm2', name: 'Dal Rice', icon: '🍚' },
  { id: 'm3', name: 'Paneer', icon: '🧀' },
  { id: 'm4', name: 'Chapati', icon: '🫓' },
  { id: 'm5', name: 'Biryani', icon: '🍗' },
];

const DUMMY_STATS = [
  { label: 'Rating', value: '4.8 ⭐', icon: 'star' },
  { label: 'Orders Today', value: '12', icon: 'receipt' },
  { label: 'Completion', value: '98%', icon: 'checkmark-circle' },
];

// ─── SKELETON COMPONENT WITH SHIMMER ──────────────────────
const Shimmer = ({ style }) => {
  const shimmerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(shimmerAnim, {
          toValue: 1,
          duration: 1200,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
        Animated.timing(shimmerAnim, {
          toValue: 0,
          duration: 1200,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
      ]),
    ).start();
  }, []);

  const translateX = shimmerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-width, width],
  });

  return (
    <View style={[styles.skeletonCard, style]}>
      <Animated.View
        style={[
          styles.shimmerLayer,
          {
            transform: [{ translateX }],
          },
        ]}
      />
    </View>
  );
};

// ─── MAIN SCREEN ──────────────────────────────────────────
const HomeScreen = ({ navigation }) => {
  const [isOnline, setIsOnline] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [banner] = useState(DUMMY_BANNER);
  const [newOrders, setNewOrders] = useState([]);
  const [menuItems] = useState(DUMMY_MENU);
  const [stats] = useState(DUMMY_STATS);
  const [profileName] = useState('Tiffin House');

  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;
  const earningsAnim = useRef(new Animated.Value(0)).current;

  // ─── SIMULATE API FETCH ──────────────────────────────────
  const fetchData = () => {
    setLoading(true);
    setTimeout(() => {
      setNewOrders(DUMMY_NEW_ORDERS);
      setLoading(false);
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 40,
          friction: 8,
          useNativeDriver: true,
        }),
        Animated.timing(earningsAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
      ]).start();
    }, 1500);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fadeAnim.setValue(0);
    scaleAnim.setValue(0.95);
    setTimeout(() => {
      setNewOrders(DUMMY_NEW_ORDERS);
      setRefreshing(false);
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 40,
          friction: 8,
          useNativeDriver: true,
        }),
      ]).start();
    }, 1500);
  };

  // ─── HANDLERS ────────────────────────────────────────────
  const handleAccept = id => {
    alert(`Order ${id} accepted!`);
    setNewOrders(prev => prev.filter(order => order.id !== id));
  };

  const handleReject = id => {
    alert(`Order ${id} rejected.`);
    setNewOrders(prev => prev.filter(order => order.id !== id));
  };

  // ─── RENDER FUNCTIONS ────────────────────────────────────
  const renderHeader = () => (
    <View style={styles.header}>
      <View style={styles.headerLeft}>
        <Image
          source={{
            uri: 'https://ui-avatars.com/api/?name=Tiffin+House&background=ff5a1f&color=fff&size=100',
          }}
          style={styles.avatar}
        />
        <View style={styles.headerText}>
          <Text style={styles.greeting}>Good Morning 👋</Text>
          <Text style={styles.kitchenName}>{profileName}</Text>
        </View>
      </View>
      <View style={styles.headerRight}>
        <Pressable
          style={({ pressed }) => [
            styles.iconButton,
            pressed && styles.iconPressed,
          ]}
          onPress={() => navigation.navigate('Notifications')}
        >
          <Ionicons
            name="notifications-outline"
            size={22}
            color={COLORS.title}
          />
          <View style={styles.notifDot} />
        </Pressable>
        <Pressable
          style={({ pressed }) => [
            styles.iconButton,
            pressed && styles.iconPressed,
          ]}
          onPress={() => navigation.navigate('KitchenProfile')}
        >
          <Ionicons name="person-outline" size={22} color={COLORS.title} />
        </Pressable>
      </View>
    </View>
  );

  const renderStatusToggle = () => (
    <LinearGradient
      colors={[
        isOnline ? COLORS.success : '#ef4444',
        isOnline ? '#22c55e' : '#dc2626',
      ]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 0 }}
      style={styles.statusCard}
    >
      <View style={styles.statusRow}>
        <View style={styles.statusIconWrapper}>
          <Ionicons name="radio-button-on" size={24} color={COLORS.white} />
        </View>
        <View>
          <Text style={[styles.statusLabel, { color: COLORS.white }]}>
            {isOnline ? 'Online' : 'Offline'}
          </Text>
          <Text style={[styles.statusSub, { color: 'rgba(255,255,255,0.85)' }]}>
            {isOnline ? 'Accepting orders' : 'Not accepting orders'}
          </Text>
        </View>
        <Switch
          trackColor={{
            false: 'rgba(255,255,255,0.3)',
            true: 'rgba(255,255,255,0.4)',
          }}
          thumbColor={isOnline ? COLORS.white : '#f4f3f4'}
          onValueChange={() => setIsOnline(!isOnline)}
          value={isOnline}
          style={{ marginLeft: 'auto' }}
        />
      </View>
    </LinearGradient>
  );

  const renderBanner = () => (
    <Pressable
      style={({ pressed }) => [
        styles.bannerCard,
        pressed && styles.bannerPressed,
      ]}
      onPress={() => alert('Banner pressed!')}
    >
      <Image source={{ uri: banner.image }} style={styles.bannerImage} />
      <LinearGradient
        colors={['transparent', 'rgba(0,0,0,0.7)']}
        style={styles.bannerGradient}
      />
      <View style={styles.bannerOverlay}>
        <View style={styles.bannerTextContainer}>
          <Text style={styles.bannerTitle}>{banner.title}</Text>
          <Text style={styles.bannerSubtitle}>{banner.subtitle}</Text>
        </View>
        <View style={styles.bannerCta}>
          <Text style={styles.bannerCtaText}>View Offer</Text>
          <Ionicons name="arrow-forward" size={14} color={COLORS.white} />
        </View>
      </View>
    </Pressable>
  );

  const renderEarnings = () => (
    <Animated.View
      style={[
        styles.earningsCard,
        {
          opacity: earningsAnim,
          transform: [
            {
              scale: earningsAnim.interpolate({
                inputRange: [0, 0.5, 1],
                outputRange: [0.8, 1.05, 1],
              }),
            },
          ],
        },
      ]}
    >
      <LinearGradient
        colors={[COLORS.primary, COLORS.primaryDark]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.earningsGradient}
      >
        <View style={styles.earningsRow}>
          <View>
            <Text style={styles.earningsLabel}>Today's Earnings</Text>
            <Text style={styles.earningsAmount}>₹1,245</Text>
            <View style={styles.earningsGrowth}>
              <Ionicons name="trending-up" size={14} color={COLORS.white} />
              <Text style={styles.earningsGrowthText}>+12% from yesterday</Text>
            </View>
          </View>
          <View style={styles.orderCount}>
            <Ionicons name="receipt" size={18} color={COLORS.white} />
            <Text style={styles.orderCountValue}>12</Text>
            <Text style={styles.orderCountLabel}>Orders</Text>
          </View>
        </View>
      </LinearGradient>
    </Animated.View>
  );

  const renderStats = () => (
    <View style={styles.statsContainer}>
      {stats.map((stat, idx) => (
        <Pressable
          key={idx}
          style={({ pressed }) => [
            styles.statItem,
            pressed && styles.statPressed,
          ]}
          onPress={() => alert(`${stat.label}: ${stat.value}`)}
        >
          <View style={styles.statIconBg}>
            <Ionicons name={stat.icon} size={18} color={COLORS.primary} />
          </View>
          <Text style={styles.statValue}>{stat.value}</Text>
          <Text style={styles.statLabel}>{stat.label}</Text>
        </Pressable>
      ))}
    </View>
  );

  const renderOrder = ({ item }) => (
    <Pressable
      style={({ pressed }) => [
        styles.orderCardWrapper,
        pressed && styles.orderPressed,
      ]}
      onPress={() => navigation.navigate('OrderDetail', { order: item })}
    >
      <View style={styles.orderCard}>
        <Image source={{ uri: item.image }} style={styles.orderImage} />
        <View style={styles.orderContent}>
          <View style={styles.orderHeader}>
            <Text style={styles.orderCustomer}>{item.customer}</Text>
            <Text style={styles.orderTime}>{item.time}</Text>
          </View>
          <Text style={styles.orderItems}>{item.items}</Text>
          <View style={styles.orderActions}>
            <Pressable
              style={[styles.actionBtn, { backgroundColor: COLORS.success }]}
              onPress={() => handleAccept(item.id)}
            >
              <Text style={styles.actionText}>Accept</Text>
            </Pressable>
            <Pressable
              style={[styles.actionBtn, { backgroundColor: '#ef4444' }]}
              onPress={() => handleReject(item.id)}
            >
              <Text style={styles.actionText}>Reject</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Pressable>
  );

  const renderMenuChip = ({ item }) => (
    <View style={styles.menuChip}>
      <Text style={styles.menuChipIcon}>{item.icon}</Text>
      <Text style={styles.menuChipText}>{item.name}</Text>
    </View>
  );

  const renderSkeleton = () => (
    <View style={styles.skeletonContainer}>
      <Shimmer style={styles.skeletonStatus} />
      <Shimmer style={styles.skeletonBanner} />
      <Shimmer style={styles.skeletonEarnings} />
      <Shimmer style={styles.skeletonStats} />
      <Shimmer style={styles.skeletonOrders} />
      <Shimmer style={styles.skeletonMenu} />
    </View>
  );

  // ─── MAIN RENDER ─────────────────────────────────────────
  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
      <ScrollView
        style={styles.container}
        contentContainerStyle={{ paddingBottom: 80 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[COLORS.primary]}
            tintColor={COLORS.primary}
            progressBackgroundColor={COLORS.white}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        {renderHeader()}

        {loading ? (
          renderSkeleton()
        ) : (
          <Animated.View
            style={{ opacity: fadeAnim, transform: [{ scale: scaleAnim }] }}
          >
            {/* Status Toggle */}
            {renderStatusToggle()}

            {/* Banner */}
            {renderBanner()}

            {/* Earnings */}
            {renderEarnings()}

            {/* Stats */}
            {renderStats()}

            {/* New Orders Section */}
            {newOrders.length > 0 && (
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>🆕 New Orders</Text>
                  <Pressable
                    style={({ pressed }) => [
                      styles.seeAllBtn,
                      pressed && styles.seeAllPressed,
                    ]}
                    onPress={() => navigation.navigate('AllOrders')}
                  >
                    <Text style={styles.seeAllText}>See All</Text>
                    <Ionicons
                      name="chevron-forward"
                      size={14}
                      color={COLORS.primary}
                    />
                  </Pressable>
                </View>
                <FlatList
                  data={newOrders}
                  renderItem={renderOrder}
                  keyExtractor={item => item.id}
                  scrollEnabled={false}
                />
              </View>
            )}

            {/* Today's Menu */}
            {/* Today's Menu */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>🍽️ Today's Menu</Text>
                <Pressable
                  style={({ pressed }) => [
                    styles.seeAllBtn,
                    pressed && styles.seeAllPressed,
                  ]}
                  onPress={() => navigation.navigate('Menu')} // 👈 Changed here
                >
                  <Text style={styles.seeAllText}>Manage</Text>
                  <Ionicons
                    name="chevron-forward"
                    size={14}
                    color={COLORS.primary}
                  />
                </Pressable>
              </View>
              <FlatList
                data={menuItems}
                renderItem={renderMenuChip}
                keyExtractor={item => item.id}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.menuList}
              />
            </View>
          </Animated.View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

// ─── STYLES ──────────────────────────────────────────────
const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.background },
  container: { flex: 1, paddingHorizontal: 16, paddingTop: 8 },

  // ─── HEADER ──────────────────────────────────────────────
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  headerText: {
    marginLeft: 12,
  },
  greeting: {
    fontSize: 12,
    color: COLORS.muted,
    fontWeight: '500',
  },
  kitchenName: {
    fontSize: 18,
    fontWeight: '900',
    color: COLORS.title,
    marginTop: 1,
  },
  headerRight: {
    flexDirection: 'row',
    gap: 8,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  iconPressed: {
    transform: [{ scale: 0.92 }],
  },
  notifDot: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ef4444',
    borderWidth: 1,
    borderColor: COLORS.white,
  },

  // ─── STATUS TOGGLE ──────────────────────────────────────
  statusCard: {
    borderRadius: 16,
    padding: 14,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusIconWrapper: {
    marginRight: 10,
  },
  statusLabel: {
    fontSize: 16,
    fontWeight: '700',
  },
  statusSub: {
    fontSize: 11,
    marginTop: 1,
  },

  // ─── BANNER ──────────────────────────────────────────────
  bannerCard: {
    height: 150,
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 16,
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  bannerPressed: {
    transform: [{ scale: 0.98 }],
  },
  bannerImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  bannerGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '60%',
  },
  bannerOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  bannerTextContainer: {
    flex: 1,
  },
  bannerTitle: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: '900',
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  bannerSubtitle: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 11,
    marginTop: 2,
  },
  bannerCta: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 30,
    marginLeft: 10,
  },
  bannerCtaText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: '700',
    marginRight: 4,
  },

  // ─── EARNINGS ────────────────────────────────────────────
  earningsCard: {
    borderRadius: 16,
    marginBottom: 16,
    overflow: 'hidden',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 6,
  },
  earningsGradient: {
    padding: 18,
  },
  earningsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  earningsLabel: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 13,
    fontWeight: '500',
  },
  earningsAmount: {
    color: COLORS.white,
    fontSize: 28,
    fontWeight: '900',
    marginTop: 2,
  },
  earningsGrowth: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  earningsGrowthText: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 11,
    marginLeft: 4,
  },
  orderCount: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.18)',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 14,
    minWidth: 72,
  },
  orderCountValue: {
    color: COLORS.white,
    fontSize: 22,
    fontWeight: '900',
  },
  orderCountLabel: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 10,
    fontWeight: '600',
  },

  // ─── STATS ──────────────────────────────────────────────
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: COLORS.white,
    borderRadius: 16,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  statItem: {
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  statPressed: {
    transform: [{ scale: 0.92 }],
  },
  statIconBg: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.soft,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.title,
    marginTop: 2,
  },
  statLabel: {
    fontSize: 10,
    color: COLORS.muted,
    fontWeight: '500',
    marginTop: 1,
  },

  // ─── SECTION ─────────────────────────────────────────────
  section: {
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.title,
  },
  seeAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  seeAllPressed: {
    opacity: 0.7,
  },
  seeAllText: {
    color: COLORS.primary,
    fontSize: 12,
    fontWeight: '700',
    marginRight: 2,
  },

  // ─── ORDER CARD ──────────────────────────────────────────
  orderCardWrapper: {
    marginBottom: 10,
  },
  orderPressed: {
    transform: [{ scale: 0.98 }],
  },
  orderCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  orderImage: {
    width: 60,
    height: 60,
    borderRadius: 12,
    marginRight: 12,
    backgroundColor: '#f0ece8',
  },
  orderContent: {
    flex: 1,
    justifyContent: 'space-between',
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  orderCustomer: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.title,
  },
  orderTime: {
    fontSize: 11,
    color: COLORS.muted,
  },
  orderItems: {
    fontSize: 13,
    color: COLORS.text,
    marginVertical: 2,
  },
  orderActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
    marginTop: 4,
  },
  actionBtn: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
  },
  actionText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: '700',
  },

  // ─── MENU CHIPS ──────────────────────────────────────────
  menuList: {
    paddingVertical: 4,
  },
  menuChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 30,
    paddingHorizontal: 14,
    paddingVertical: 8,
    marginRight: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  menuChipIcon: {
    fontSize: 16,
    marginRight: 6,
  },
  menuChipText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.text,
  },

  // ─── SKELETON LOADING ────────────────────────────────────
  skeletonContainer: {
    marginTop: 8,
  },
  skeletonCard: {
    backgroundColor: '#e5e7eb',
    borderRadius: 16,
    marginBottom: 16,
    height: 70,
    overflow: 'hidden',
  },
  shimmerLayer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255,255,255,0.6)',
    width: width * 1.5,
    transform: [{ skewX: '-20deg' }],
  },
  skeletonStatus: { height: 64 },
  skeletonBanner: { height: 150 },
  skeletonEarnings: { height: 100 },
  skeletonStats: { height: 80 },
  skeletonOrders: { height: 200 },
  skeletonMenu: { height: 60 },
});

export default HomeScreen;
