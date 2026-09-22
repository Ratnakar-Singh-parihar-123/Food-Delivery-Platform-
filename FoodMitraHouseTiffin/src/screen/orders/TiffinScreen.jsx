// screens/partner/TiffinScreen.js
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
  StatusBar,
  Image,
  RefreshControl,
  Animated,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from '@react-native-vector-icons/ionicons';
import LinearGradient from 'react-native-linear-gradient';
import { COLORS } from '../../constants/colors';

const { width } = Dimensions.get('window');

// ─── DUMMY DATA WITH RELIABLE AVATARS ────────────────────
const DUMMY_SUBSCRIPTIONS = [
  {
    id: 'S1',
    customer: 'Rahul Sharma',
    avatar:
      'https://ui-avatars.com/api/?name=Rahul+Sharma&background=random&size=80',
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
  },
  {
    id: 'S2',
    customer: 'Priya Patel',
    avatar:
      'https://ui-avatars.com/api/?name=Priya+Patel&background=random&size=80',
    plan: 'Monthly',
    meals: 'Dinner',
    status: 'active',
    nextDelivery: 'Tomorrow, 8:00 PM',
    mealsCount: 30,
    total: '₹2400',
    startDate: '15 Jul 2026',
    endDate: '14 Aug 2026',
    deliveryAddress: '45, New Colony, Indore',
    phone: '+91 98765 43211',
    deliveryDays: ['All days'],
    mealsList: ['Thali', 'Biryani', 'Chapati'],
  },
  {
    id: 'S3',
    customer: 'Amit Singh',
    avatar:
      'https://ui-avatars.com/api/?name=Amit+Singh&background=random&size=80',
    plan: 'Daily',
    meals: 'Lunch',
    status: 'paused',
    nextDelivery: 'Paused until 25 Aug',
    mealsCount: 0,
    total: '₹0',
    startDate: '01 Jun 2026',
    endDate: '30 Jun 2026',
    deliveryAddress: '78, Saket Nagar, Indore',
    phone: '+91 98765 43212',
    deliveryDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
    mealsList: ['Thali', 'Dal Rice'],
  },
  {
    id: 'S4',
    customer: 'Kavita Reddy',
    avatar:
      'https://ui-avatars.com/api/?name=Kavita+Reddy&background=random&size=80',
    plan: 'Weekly',
    meals: 'Lunch + Dinner',
    status: 'active',
    nextDelivery: 'Today, 1:00 PM',
    mealsCount: 7,
    total: '₹840',
    startDate: '20 Jul 2026',
    endDate: '20 Aug 2026',
    deliveryAddress: '12, Vijay Nagar, Indore',
    phone: '+91 98765 43213',
    deliveryDays: ['Mon', 'Wed', 'Fri'],
    mealsList: ['Special Thali', 'Biryani'],
  },
  {
    id: 'S5',
    customer: 'Mohan Kumar',
    avatar:
      'https://ui-avatars.com/api/?name=Mohan+Kumar&background=random&size=80',
    plan: 'Monthly',
    meals: 'Dinner',
    status: 'completed',
    nextDelivery: 'Completed on 15 Aug',
    mealsCount: 28,
    total: '₹2240',
    startDate: '15 Jul 2026',
    endDate: '14 Aug 2026',
    deliveryAddress: '34, Bhanwar Kuwa, Indore',
    phone: '+91 98765 43214',
    deliveryDays: ['All days'],
    mealsList: ['Thali', 'Chapati'],
  },
];

const TAB_DATA = [
  { id: 'Active', label: 'Active', icon: 'checkmark-circle-outline' },
  { id: 'Paused', label: 'Paused', icon: 'pause-outline' },
  { id: 'History', label: 'History', icon: 'time-outline' },
];

// ─── COMPACT SUBSCRIPTION CARD ──────────────────────────
const SubscriptionCard = ({ item, onAction, onPress }) => {
  const statusColor =
    item.status === 'active'
      ? COLORS.success
      : item.status === 'paused'
      ? '#f59e0b'
      : '#9ca3af';

  const statusIcon =
    item.status === 'active'
      ? 'checkmark-circle'
      : item.status === 'paused'
      ? 'pause'
      : 'checkmark-done';

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

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <Pressable
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={() => onPress(item)}
        style={styles.cardWrapper}
      >
        <View style={styles.card}>
          {/* Row 1: Avatar + Customer + Status */}
          <View style={styles.cardHeader}>
            <Image source={{ uri: item.avatar }} style={styles.avatar} />
            <View style={styles.customerInfo}>
              <Text style={styles.customerName} numberOfLines={1}>
                {item.customer}
              </Text>
              <Text style={styles.planDetails}>
                {item.plan} · {item.meals}
              </Text>
            </View>
            <View
              style={[styles.statusBadge, { backgroundColor: statusColor }]}
            >
              <Ionicons name={statusIcon} size={10} color={COLORS.white} />
              <Text style={styles.statusText}>{item.status}</Text>
            </View>
          </View>

          {/* Row 2: Compact details in a single line */}
          <View style={styles.detailRowCompact}>
            <View style={styles.detailItem}>
              <Ionicons
                name="calendar-outline"
                size={12}
                color={COLORS.muted}
              />
              <Text style={styles.detailTextCompact} numberOfLines={1}>
                {item.nextDelivery}
              </Text>
            </View>
            <View style={styles.detailItem}>
              <Ionicons
                name="restaurant-outline"
                size={12}
                color={COLORS.muted}
              />
              <Text style={styles.detailTextCompact}>
                {item.mealsCount} meals
              </Text>
            </View>
            <View style={styles.detailItem}>
              <Ionicons name="cash-outline" size={12} color={COLORS.muted} />
              <Text style={styles.detailTextCompact}>{item.total}</Text>
            </View>
          </View>

          {/* Row 3: Action buttons */}
          <View style={styles.cardFooter}>
            {item.status === 'active' && (
              <Pressable
                style={[styles.actionBtn, { backgroundColor: '#f59e0b' }]}
                onPress={() => onAction('pause', item.id)}
              >
                <Ionicons name="pause" size={12} color={COLORS.white} />
                <Text style={styles.actionText}>Pause</Text>
              </Pressable>
            )}
            {item.status === 'paused' && (
              <Pressable
                style={[styles.actionBtn, { backgroundColor: COLORS.success }]}
                onPress={() => onAction('resume', item.id)}
              >
                <Ionicons name="play" size={12} color={COLORS.white} />
                <Text style={styles.actionText}>Resume</Text>
              </Pressable>
            )}
            <Pressable
              style={[styles.actionBtn, { backgroundColor: COLORS.primary }]}
              onPress={() => onAction('view', item.id)}
            >
              <Ionicons name="eye-outline" size={12} color={COLORS.white} />
              <Text style={styles.actionText}>View</Text>
            </Pressable>
          </View>
        </View>
      </Pressable>
    </Animated.View>
  );
};

// ─── MAIN SCREEN ──────────────────────────────────────────
const TiffinScreen = ({ navigation }) => {
  const [activeTab, setActiveTab] = useState('Active');
  const [subscriptions, setSubscriptions] = useState(DUMMY_SUBSCRIPTIONS);
  const [filteredData, setFilteredData] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    let filtered;
    if (activeTab === 'Active') {
      filtered = subscriptions.filter(s => s.status === 'active');
    } else if (activeTab === 'Paused') {
      filtered = subscriptions.filter(s => s.status === 'paused');
    } else {
      filtered = subscriptions.filter(s => s.status === 'completed');
    }
    setFilteredData(filtered);
  }, [activeTab, subscriptions]);

  // ─── HANDLERS ────────────────────────────────────────────
  const handleAction = (action, id) => {
    if (action === 'pause') {
      setSubscriptions(prev =>
        prev.map(item =>
          item.id === id ? { ...item, status: 'paused' } : item,
        ),
      );
      alert(`Subscription ${id} paused`);
    } else if (action === 'resume') {
      setSubscriptions(prev =>
        prev.map(item =>
          item.id === id ? { ...item, status: 'active' } : item,
        ),
      );
      alert(`Subscription ${id} resumed`);
    } else if (action === 'view') {
      const item = subscriptions.find(s => s.id === id);
      if (item)
        navigation.navigate('SubscriptionDetail', { subscription: item });
    }
  };

  const handleCardPress = item => {
    navigation.navigate('SubscriptionDetail', { subscription: item });
  };

  // ─── PULL‑TO‑REFRESH ─────────────────────────────────────
  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => {
      setSubscriptions(DUMMY_SUBSCRIPTIONS);
      setRefreshing(false);
    }, 1200);
  };

  // ─── RENDER TABS (SLIM) ──────────────────────────────────
  const renderTabs = () => (
    <View style={styles.tabContainer}>
      {TAB_DATA.map(tab => {
        const isActive = activeTab === tab.id;
        const count = subscriptions.filter(s =>
          tab.id === 'Active'
            ? s.status === 'active'
            : tab.id === 'Paused'
            ? s.status === 'paused'
            : s.status === 'completed',
        ).length;

        return (
          <Pressable
            key={tab.id}
            style={[styles.tab, isActive && styles.activeTab]}
            onPress={() => setActiveTab(tab.id)}
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
              <View
                style={[styles.tabBadge, isActive && styles.activeTabBadge]}
              >
                <Text
                  style={[
                    styles.tabBadgeText,
                    isActive && styles.activeTabBadgeText,
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
  );

  // ─── EMPTY STATE ─────────────────────────────────────────
  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="calendar-outline" size={48} color={COLORS.muted} />
      <Text style={styles.emptyTitle}>No subscriptions</Text>
      <Text style={styles.emptySubtitle}>
        {activeTab === 'Active'
          ? 'You have no active subscriptions.'
          : activeTab === 'Paused'
          ? 'No paused subscriptions.'
          : 'No completed subscriptions yet.'}
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Tiffin Management</Text>
          <Pressable
            style={styles.manageButton}
            onPress={() => alert('Manage subscriptions')}
          >
            <Ionicons name="options-outline" size={22} color={COLORS.title} />
          </Pressable>
        </View>

        {/* Tabs */}
        {renderTabs()}

        {/* List */}
        <FlatList
          data={filteredData}
          keyExtractor={item => item.id}
          renderItem={({ item }) => (
            <SubscriptionCard
              item={item}
              onAction={handleAction}
              onPress={handleCardPress}
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
  manageButton: {
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

  // ─── TABS (SLIM) ─────────────────────────────────────────
  tabContainer: {
    flexDirection: 'row',
    marginBottom: 14,
    gap: 8,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    backgroundColor: '#f0ece8',
    gap: 4,
    height: 34,
  },
  activeTab: {
    backgroundColor: COLORS.primary,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
  },
  tabText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.text,
  },
  activeTabText: {
    color: COLORS.white,
  },
  tabBadge: {
    backgroundColor: 'rgba(0,0,0,0.06)',
    borderRadius: 10,
    paddingHorizontal: 5,
    minWidth: 18,
    alignItems: 'center',
    paddingVertical: 1,
  },
  activeTabBadge: {
    backgroundColor: 'rgba(255,255,255,0.25)',
  },
  tabBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.text,
  },
  activeTabBadgeText: {
    color: COLORS.white,
  },

  // ─── CARD (COMPACT) ──────────────────────────────────────
  listContent: {
    paddingBottom: 80,
  },
  cardWrapper: {
    marginBottom: 10,
  },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#f0ece8',
    marginRight: 10,
  },
  customerInfo: {
    flex: 1,
  },
  customerName: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.title,
  },
  planDetails: {
    fontSize: 11,
    color: COLORS.muted,
    marginTop: 0,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    gap: 2,
  },
  statusText: {
    color: COLORS.white,
    fontSize: 8,
    fontWeight: '700',
    textTransform: 'uppercase',
  },

  detailRowCompact: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
    paddingVertical: 4,
    borderTopWidth: 1,
    borderTopColor: '#f1f3f5',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f3f5',
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  detailTextCompact: {
    fontSize: 11,
    color: COLORS.text,
  },

  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 6,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 16,
    gap: 3,
  },
  actionText: {
    color: COLORS.white,
    fontSize: 10,
    fontWeight: '700',
  },

  // ─── EMPTY STATE ─────────────────────────────────────────
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.title,
    marginTop: 8,
  },
  emptySubtitle: {
    fontSize: 12,
    color: COLORS.muted,
    marginTop: 2,
    textAlign: 'center',
  },
});

export default TiffinScreen;
