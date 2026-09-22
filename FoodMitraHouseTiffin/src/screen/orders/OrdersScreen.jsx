// screens/partner/OrdersScreen.js
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
  StatusBar,
  Image,
  TextInput,
  RefreshControl,
  Animated,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from '@react-native-vector-icons/ionicons';
import LinearGradient from 'react-native-linear-gradient';
import { COLORS } from '../../constants/colors';

const { width } = Dimensions.get('window');

// ─── TAB CONFIG ───────────────────────────────────────────
const TAB_DATA = [
  { id: 'Active', label: 'Active', icon: 'time-outline' },
  { id: 'Upcoming', label: 'Upcoming', icon: 'calendar-outline' },
  { id: 'Completed', label: 'Completed', icon: 'checkmark-done-outline' },
  { id: 'Cancelled', label: 'Cancelled', icon: 'close-outline' },
];

// ─── DUMMY ORDERS ─────────────────────────────────────────
const DUMMY_ORDERS = {
  Active: [
    {
      id: 'ORD-001',
      customer: 'Rajesh Kumar',
      avatar: 'https://ui-avatars.com/api/?name=Rajesh+Kumar&background=random',
      items: '2 x Thali + 1 x Chai',
      time: '10:30 AM',
      status: 'preparing',
      total: '₹240',
      address: '123, MG Road, Indore',
    },
    {
      id: 'ORD-002',
      customer: 'Priya Sharma',
      avatar: 'https://ui-avatars.com/api/?name=Priya+Sharma&background=random',
      items: '1 x Dal Rice + 2 Chapati',
      time: '11:15 AM',
      status: 'ready',
      total: '₹180',
      address: '45, New Colony, Indore',
    },
  ],
  Upcoming: [
    {
      id: 'ORD-003',
      customer: 'Amit Singh',
      avatar: 'https://ui-avatars.com/api/?name=Amit+Singh&background=random',
      items: '3 x Veg Biryani',
      time: '12:30 PM',
      status: 'upcoming',
      total: '₹450',
      address: '78, Saket Nagar, Indore',
    },
  ],
  Completed: [
    {
      id: 'ORD-004',
      customer: 'Kavita Patel',
      avatar: 'https://ui-avatars.com/api/?name=Kavita+Patel&background=random',
      items: '2 x Paneer Thali',
      time: 'Yesterday, 8:00 PM',
      status: 'delivered',
      total: '₹320',
      address: '12, Vijay Nagar, Indore',
    },
    {
      id: 'ORD-006',
      customer: 'Suresh Yadav',
      avatar: 'https://ui-avatars.com/api/?name=Suresh+Yadav&background=random',
      items: '1 x Special Thali',
      time: 'Yesterday, 1:30 PM',
      status: 'delivered',
      total: '₹160',
      address: '56, Scheme No. 78, Indore',
    },
  ],
  Cancelled: [
    {
      id: 'ORD-005',
      customer: 'Mohan Verma',
      avatar: 'https://ui-avatars.com/api/?name=Mohan+Verma&background=random',
      items: '1 x Chicken Biryani',
      time: '2 days ago',
      status: 'cancelled',
      total: '₹220',
      address: '34, Bhanwar Kuwa, Indore',
    },
  ],
};

const STATUS_COLORS = {
  preparing: '#f59e0b',
  ready: '#3b82f6',
  upcoming: '#8b5cf6',
  delivered: '#22c55e',
  cancelled: '#ef4444',
};

const STATUS_ICONS = {
  preparing: 'time',
  ready: 'checkmark-circle',
  upcoming: 'calendar',
  delivered: 'checkmark-done',
  cancelled: 'close-circle',
};

// ─── ORDER CARD COMPONENT ────────────────────────────────
const OrderCard = ({ item, activeTab, navigation }) => {
  const statusColor = STATUS_COLORS[item.status] || COLORS.muted;
  const statusIcon = STATUS_ICONS[item.status] || 'help-circle';
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.97,
      useNativeDriver: true,
      tension: 150,
      friction: 15,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      tension: 150,
      friction: 15,
    }).start();
  };

  const handlePress = () => {
    navigation.navigate('OrderDetail', { order: item });
  };

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <Pressable
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={handlePress}
        style={({ pressed }) => [
          styles.orderCard,
          pressed && styles.orderCardPressed,
        ]}
      >
        {/* Header: Order ID + Status */}
        <View style={styles.orderHeader}>
          <Text style={styles.orderId}>{item.id}</Text>
          <View style={[styles.statusBadge, { backgroundColor: statusColor }]}>
            <Ionicons name={statusIcon} size={12} color={COLORS.white} />
            <Text style={styles.statusText}>{item.status}</Text>
          </View>
        </View>

        {/* Body: Customer + Items */}
        <View style={styles.orderBody}>
          <Image source={{ uri: item.avatar }} style={styles.avatar} />
          <View style={styles.orderInfo}>
            <Text style={styles.customer}>{item.customer}</Text>
            <Text style={styles.items}>{item.items}</Text>
            <View style={styles.metaRow}>
              <Ionicons
                name="location-outline"
                size={14}
                color={COLORS.muted}
              />
              <Text style={styles.address} numberOfLines={1}>
                {item.address}
              </Text>
            </View>
          </View>
        </View>

        {/* Footer: Time + Total + Actions */}
        <View style={styles.orderFooter}>
          <View style={styles.footerLeft}>
            <Ionicons name="time-outline" size={14} color={COLORS.muted} />
            <Text style={styles.time}>{item.time}</Text>
            <View style={styles.divider} />
            <Text style={styles.total}>{item.total}</Text>
          </View>
          {activeTab === 'Active' && (
            <View style={styles.actionButtons}>
              <Pressable
                style={[styles.actionBtn, { backgroundColor: COLORS.success }]}
                onPress={() => alert(`Mark ${item.id} as ready`)}
              >
                <Text style={styles.actionText}>Ready</Text>
              </Pressable>
              <Pressable
                style={[styles.actionBtn, { backgroundColor: '#ef4444' }]}
                onPress={() => alert(`Cancel ${item.id}`)}
              >
                <Text style={styles.actionText}>Cancel</Text>
              </Pressable>
            </View>
          )}
          {activeTab === 'Upcoming' && (
            <Pressable
              style={[styles.actionBtn, { backgroundColor: COLORS.primary }]}
              onPress={() => alert(`Start preparing ${item.id}`)}
            >
              <Text style={styles.actionText}>Start</Text>
            </Pressable>
          )}
        </View>
      </Pressable>
    </Animated.View>
  );
};

// ─── MAIN SCREEN ──────────────────────────────────────────
const OrdersScreen = ({ navigation }) => {
  const [activeTab, setActiveTab] = useState('Active');
  const [searchQuery, setSearchQuery] = useState('');
  const [orders, setOrders] = useState(DUMMY_ORDERS);
  const [filteredOrders, setFilteredOrders] = useState(
    DUMMY_ORDERS[activeTab] || [],
  );
  const [refreshing, setRefreshing] = useState(false);

  // Animation for tab indicator
  const translateX = useRef(new Animated.Value(0)).current;

  // Update filtered orders when tab or search changes
  useEffect(() => {
    const currentOrders = orders[activeTab] || [];
    if (searchQuery.trim()) {
      const filtered = currentOrders.filter(
        order =>
          order.customer.toLowerCase().includes(searchQuery.toLowerCase()) ||
          order.items.toLowerCase().includes(searchQuery.toLowerCase()) ||
          order.id.toLowerCase().includes(searchQuery.toLowerCase()),
      );
      setFilteredOrders(filtered);
    } else {
      setFilteredOrders(currentOrders);
    }
  }, [activeTab, searchQuery, orders]);

  // ─── PULL‑TO‑REFRESH ─────────────────────────────────────
  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => {
      setOrders(DUMMY_ORDERS);
      setRefreshing(false);
    }, 1500);
  };

  // ─── RENDER: EMPTY STATE ────────────────────────────────
  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="clipboard-outline" size={60} color={COLORS.muted} />
      <Text style={styles.emptyTitle}>No orders here</Text>
      <Text style={styles.emptySubtitle}>
        {activeTab === 'Active'
          ? 'You have no active orders right now.'
          : activeTab === 'Upcoming'
          ? 'No upcoming orders scheduled.'
          : activeTab === 'Completed'
          ? 'Your completed orders will appear here.'
          : 'No cancelled orders.'}
      </Text>
    </View>
  );

  // ─── RENDER: TABS ────────────────────────────────────────
  const renderTabs = () => {
    const tabWidth = width / TAB_DATA.length - 16;
    return (
      <View style={styles.tabContainer}>
        {TAB_DATA.map((tab, index) => {
          const isActive = activeTab === tab.id;
          const count = (orders[tab.id] || []).length;
          return (
            <Pressable
              key={tab.id}
              style={[styles.tab, isActive && styles.activeTab]}
              onPress={() => {
                setActiveTab(tab.id);
                // Animate indicator
                Animated.spring(translateX, {
                  toValue: index * (width / TAB_DATA.length),
                  useNativeDriver: true,
                  tension: 50,
                  friction: 12,
                }).start();
              }}
            >
              <Ionicons
                name={tab.icon}
                size={16}
                color={isActive ? COLORS.white : COLORS.muted}
              />
              <Text style={[styles.tabText, isActive && styles.activeTabText]}>
                {tab.label}
              </Text>
              {count > 0 && (
                <View style={styles.tabBadge}>
                  <Text style={styles.tabBadgeText}>{count}</Text>
                </View>
              )}
            </Pressable>
          );
        })}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Orders</Text>
          <Pressable
            style={styles.filterButton}
            onPress={() => alert('Search / Filter')}
          >
            <Ionicons name="search-outline" size={22} color={COLORS.title} />
          </Pressable>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={18} color={COLORS.muted} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search orders..."
            placeholderTextColor="#9ca3af"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <Pressable onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={18} color={COLORS.muted} />
            </Pressable>
          )}
        </View>

        {/* Tabs */}
        {renderTabs()}

        {/* Orders List with Pull‑to‑Refresh */}
        <FlatList
          data={filteredOrders}
          keyExtractor={item => item.id}
          renderItem={({ item }) => (
            <OrderCard
              item={item}
              activeTab={activeTab}
              navigation={navigation}
            />
          )}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={renderEmpty}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[COLORS.primary]}
              tintColor={COLORS.primary}
            />
          }
        />
      </View>
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
  headerTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: COLORS.title,
  },
  filterButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },

  // ─── SEARCH ──────────────────────────────────────────────
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 14,
    color: COLORS.title,
    paddingVertical: 4,
  },

  // ─── TABS ─────────────────────────────────────────────────
  tabContainer: {
    flexDirection: 'row',
    marginBottom: 16,
    gap: 8,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
    backgroundColor: '#f0ece8',
    gap: 4,
  },
  activeTab: {
    backgroundColor: COLORS.primary,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
  },
  tabText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.text,
  },
  activeTabText: {
    color: COLORS.white,
  },
  tabBadge: {
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 10,
    paddingHorizontal: 5,
    paddingVertical: 1,
    minWidth: 18,
    alignItems: 'center',
  },
  tabBadgeText: {
    color: COLORS.white,
    fontSize: 9,
    fontWeight: '700',
  },

  // ─── ORDER CARD ──────────────────────────────────────────
  listContent: {
    paddingBottom: 80,
  },
  orderCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  orderCardPressed: {
    opacity: 0.8,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  orderId: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.muted,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  statusText: {
    color: COLORS.white,
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
  },

  orderBody: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 12,
    backgroundColor: '#f0ece8',
  },
  orderInfo: {
    flex: 1,
  },
  customer: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.title,
  },
  items: {
    fontSize: 13,
    color: COLORS.text,
    marginTop: 2,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  address: {
    fontSize: 11,
    color: COLORS.muted,
    marginLeft: 4,
    flex: 1,
  },

  orderFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#f1f3f5',
    paddingTop: 10,
  },
  footerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  time: {
    fontSize: 12,
    color: COLORS.muted,
  },
  divider: {
    width: 1,
    height: 16,
    backgroundColor: '#e5e7eb',
  },
  total: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.primary,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  actionBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  actionText: {
    color: COLORS.white,
    fontSize: 11,
    fontWeight: '700',
  },

  // ─── EMPTY STATE ─────────────────────────────────────────
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.title,
    marginTop: 12,
  },
  emptySubtitle: {
    fontSize: 13,
    color: COLORS.muted,
    marginTop: 4,
    textAlign: 'center',
  },
});

export default OrdersScreen;
