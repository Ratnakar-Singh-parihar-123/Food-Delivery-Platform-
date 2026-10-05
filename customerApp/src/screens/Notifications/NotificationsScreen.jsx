import React, { useCallback, useEffect, useRef, useState } from 'react';

import {
  ActivityIndicator,
  Animated,
  Dimensions,
  FlatList,
  Modal,
  Pressable,
  RefreshControl,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';

import Ionicons from 'react-native-vector-icons/Ionicons';

import ScreenHeader from '../../components/ScreenHeader';

import {
  getCustomerNotifications,
  markAllNotificationsAsRead,
  markNotificationAsRead,
} from '../../api/notificationsApi';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

const COLORS = {
  primary: '#f97316',
  primaryDark: '#ea580c',
  background: '#fffaf7',
  white: '#ffffff',
  text: '#18181b',
  secondaryText: '#71717a',
  muted: '#a1a1aa',
  border: '#f1e9e3',
  lightOrange: '#fff1e8',
  unreadBg: '#fff8f3',
  unreadBorder: '#fde4d3',
  red: '#ef4444',
  green: '#16a34a',
  blue: '#2563eb',
  purple: '#7c3aed',
  softGray: '#f4f4f5',
};

const TYPE_CONFIG = {
  general: {
    icon: 'notifications-outline',
    label: 'General',
    color: '#6366f1',
    background: '#eef2ff',
  },

  promotion: {
    icon: 'megaphone-outline',
    label: 'Promotion',
    color: '#ea580c',
    background: '#fff7ed',
  },

  offer: {
    icon: 'pricetag-outline',
    label: 'Offer',
    color: '#16a34a',
    background: '#f0fdf4',
  },

  system: {
    icon: 'settings-outline',
    label: 'System',
    color: '#2563eb',
    background: '#eff6ff',
  },

  warning: {
    icon: 'warning-outline',
    label: 'Important',
    color: '#dc2626',
    background: '#fef2f2',
  },
};

const PRIORITY_CONFIG = {
  low: { label: 'Low', color: '#71717a' },
  normal: { label: 'Normal', color: '#2563eb' },
  high: { label: 'High', color: '#ea580c' },
  urgent: { label: 'Urgent', color: '#dc2626' },
};

const getTypeConfig = type => TYPE_CONFIG[type] || TYPE_CONFIG.general;

const getPriorityConfig = priority =>
  PRIORITY_CONFIG[priority] || PRIORITY_CONFIG.normal;

const formatNotificationDate = date => {
  if (!date) return '';

  const notificationDate = new Date(date);

  if (Number.isNaN(notificationDate.getTime())) {
    return '';
  }

  const now = new Date();
  const diff = now.getTime() - notificationDate.getTime();

  const minutes = Math.floor(diff / (1000 * 60));
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;

  return notificationDate.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

const getDiscountText = offer => {
  if (!offer) return '';

  const { discountType, discountValue } = offer;

  if (!discountValue || discountType === 'none') return '';

  if (discountType === 'percentage') return `${discountValue}% OFF`;
  if (discountType === 'flat') return `₹${discountValue} OFF`;

  return '';
};

export default function NotificationsScreen({ navigation }) {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  const slideAnim = useRef(new Animated.Value(SCREEN_HEIGHT)).current;

  const fetchNotifications = useCallback(async () => {
    try {
      const response = await getCustomerNotifications();
      const notificationData = response?.data?.notifications || [];
      setNotifications(notificationData);
    } catch (error) {
      console.log(
        'Get customer notifications error:',
        error?.response?.data || error,
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchNotifications();
  };

  const unreadCount = notifications.filter(item => !item.isRead).length;

  const openNotification = async notification => {
    setSelectedNotification(notification);
    setModalVisible(true);

    Animated.spring(slideAnim, {
      toValue: 0,
      useNativeDriver: true,
      tension: 65,
      friction: 11,
    }).start();

    if (!notification.isRead) {
      try {
        await markNotificationAsRead(notification._id);

        setNotifications(previous =>
          previous.map(item =>
            item._id === notification._id ? { ...item, isRead: true } : item,
          ),
        );

        setSelectedNotification(previous =>
          previous ? { ...previous, isRead: true } : previous,
        );
      } catch (error) {
        console.log(
          'Mark notification read error:',
          error?.response?.data || error,
        );
      }
    }
  };

  const closeNotification = () => {
    Animated.timing(slideAnim, {
      toValue: SCREEN_HEIGHT,
      duration: 250,
      useNativeDriver: true,
    }).start(() => {
      setModalVisible(false);
      setSelectedNotification(null);
    });
  };

  const handleMarkAllRead = async () => {
    const unreadNotifications = notifications.filter(item => !item.isRead);

    if (!unreadNotifications.length) return;

    const ids = unreadNotifications.map(item => item._id).filter(Boolean);

    try {
      await markAllNotificationsAsRead(ids);

      setNotifications(previous =>
        previous.map(item => ({ ...item, isRead: true })),
      );
    } catch (error) {
      console.log(
        'Mark all notifications read error:',
        error?.response?.data || error,
      );
    }
  };

  const renderNotification = ({ item }) => {
    const typeConfig = getTypeConfig(item.type);
    const discountText = getDiscountText(item.offer);

    return (
      <Pressable
        onPress={() => openNotification(item)}
        style={({ pressed }) => [
          styles.card,
          !item.isRead && styles.cardUnread,
          pressed && styles.cardPressed,
        ]}
      >
        <View style={styles.iconWrap}>
          <View
            style={[styles.iconBox, { backgroundColor: typeConfig.background }]}
          >
            <Ionicons
              name={typeConfig.icon}
              size={20}
              color={typeConfig.color}
            />
          </View>

          {!item.isRead && <View style={styles.unreadDot} />}
        </View>

        <View style={styles.cardBody}>
          <View style={styles.cardTopRow}>
            <Text
              numberOfLines={1}
              style={[styles.cardTitle, !item.isRead && styles.cardTitleUnread]}
            >
              {item.title || 'Notification'}
            </Text>

            <Text style={styles.cardTime}>
              {formatNotificationDate(item.createdAt)}
            </Text>
          </View>

          <Text numberOfLines={2} style={styles.cardMessage}>
            {item.message || ''}
          </Text>

          <View style={styles.cardBottomRow}>
            <View
              style={[
                styles.typePill,
                { backgroundColor: typeConfig.background },
              ]}
            >
              <Text style={[styles.typePillText, { color: typeConfig.color }]}>
                {typeConfig.label}
              </Text>
            </View>

            {discountText ? (
              <View style={styles.offerPill}>
                <Ionicons
                  name="pricetag"
                  size={11}
                  color={COLORS.primaryDark}
                />
                <Text style={styles.offerPillText}>{discountText}</Text>
              </View>
            ) : null}
          </View>
        </View>
      </Pressable>
    );
  };

  const renderEmpty = () => {
    if (loading) return null;

    return (
      <View style={styles.emptyContainer}>
        <View style={styles.emptyIcon}>
          <Ionicons
            name="notifications-off-outline"
            size={40}
            color={COLORS.primary}
          />
        </View>

        <Text style={styles.emptyTitle}>No notifications yet</Text>

        <Text style={styles.emptyMessage}>
          Admin aur restaurants ki important updates yahan dikhayi dengi.
        </Text>
      </View>
    );
  };

  const selectedTypeConfig = getTypeConfig(selectedNotification?.type);
  const selectedPriorityConfig = getPriorityConfig(
    selectedNotification?.priority,
  );
  const selectedDiscountText = getDiscountText(selectedNotification?.offer);

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />

      <ScreenHeader
        navigation={navigation}
        title="Notifications"
        subtitle={
          unreadCount > 0
            ? `${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}`
            : "You're all caught up"
        }
      />

      <View style={styles.headerRow}>
        <View style={styles.headerLeft}>
          <View style={styles.headerIcon}>
            <Ionicons name="notifications" size={16} color={COLORS.primary} />
          </View>
          <Text style={styles.headerTitle}>Your Updates</Text>
        </View>

        {unreadCount > 0 && (
          <Pressable
            onPress={handleMarkAllRead}
            style={({ pressed }) => [
              styles.markAllButton,
              pressed && { opacity: 0.7 },
            ]}
          >
            <Ionicons
              name="checkmark-done"
              size={15}
              color={COLORS.primaryDark}
            />
            <Text style={styles.markAllText}>Mark all read</Text>
          </Pressable>
        )}
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Loading notifications...</Text>
        </View>
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={(item, index) => item?._id || `notification-${index}`}
          renderItem={renderNotification}
          contentContainerStyle={[
            styles.listContent,
            notifications.length === 0 && styles.emptyListContent,
          ]}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor={COLORS.primary}
              colors={[COLORS.primary]}
            />
          }
          ListEmptyComponent={renderEmpty}
        />
      )}

      <Modal
        visible={modalVisible}
        transparent
        animationType="none"
        onRequestClose={closeNotification}
      >
        <View style={styles.modalRoot}>
          <Pressable style={styles.modalBackdrop} onPress={closeNotification} />

          <Animated.View
            style={[styles.sheet, { transform: [{ translateY: slideAnim }] }]}
          >
            <View style={styles.sheetHandle} />

            <View style={styles.sheetHeader}>
              <View
                style={[
                  styles.sheetIconBox,
                  { backgroundColor: selectedTypeConfig.background },
                ]}
              >
                <Ionicons
                  name={selectedTypeConfig.icon}
                  size={19}
                  color={selectedTypeConfig.color}
                />
              </View>

              <View style={styles.sheetHeaderText}>
                <Text style={styles.sheetTitle}>Notification Details</Text>
                <Text style={styles.sheetSubtitle}>
                  {formatNotificationDate(selectedNotification?.createdAt)}
                </Text>
              </View>

              <Pressable
                onPress={closeNotification}
                style={styles.sheetClose}
                hitSlop={8}
              >
                <Ionicons name="close" size={19} color={COLORS.text} />
              </Pressable>
            </View>

            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.detailContent}
            >
              {selectedNotification ? (
                <>
                  <View
                    style={[
                      styles.detailBadge,
                      { backgroundColor: selectedTypeConfig.background },
                    ]}
                  >
                    <Ionicons
                      name={selectedTypeConfig.icon}
                      size={14}
                      color={selectedTypeConfig.color}
                    />
                    <Text
                      style={[
                        styles.detailBadgeText,
                        { color: selectedTypeConfig.color },
                      ]}
                    >
                      {selectedTypeConfig.label}
                    </Text>
                  </View>

                  <Text style={styles.detailTitle}>
                    {selectedNotification.title || 'Notification'}
                  </Text>

                  <Text style={styles.detailMessage}>
                    {selectedNotification.message || 'No message available.'}
                  </Text>

                  <View style={styles.infoCard}>
                    <View style={styles.infoRow}>
                      <Text style={styles.infoLabel}>Priority</Text>
                      <View
                        style={[
                          styles.priorityPill,
                          {
                            backgroundColor: `${selectedPriorityConfig.color}15`,
                          },
                        ]}
                      >
                        <Text
                          style={[
                            styles.priorityPillText,
                            { color: selectedPriorityConfig.color },
                          ]}
                        >
                          {selectedPriorityConfig.label}
                        </Text>
                      </View>
                    </View>

                    <View style={styles.infoDivider} />

                    <View style={styles.infoRow}>
                      <Text style={styles.infoLabel}>Status</Text>
                      <View style={styles.readStatus}>
                        <Ionicons
                          name="checkmark-circle"
                          size={16}
                          color={COLORS.green}
                        />
                        <Text style={styles.readStatusText}>Read</Text>
                      </View>
                    </View>

                    <View style={styles.infoDivider} />

                    <View style={styles.infoRow}>
                      <Text style={styles.infoLabel}>Received</Text>
                      <Text style={styles.infoValue}>
                        {selectedNotification.createdAt
                          ? new Date(
                              selectedNotification.createdAt,
                            ).toLocaleString('en-IN', {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })
                          : '—'}
                      </Text>
                    </View>
                  </View>

                  {selectedDiscountText ? (
                    <View style={styles.offerCard}>
                      <View style={styles.offerIconBox}>
                        <Ionicons
                          name="pricetag"
                          size={20}
                          color={COLORS.primary}
                        />
                      </View>

                      <View style={styles.offerBody}>
                        <Text style={styles.offerTitle}>Special Offer</Text>
                        <Text style={styles.offerDiscount}>
                          {selectedDiscountText}
                        </Text>

                        {selectedNotification.offer?.couponCode ? (
                          <View style={styles.couponBox}>
                            <Text style={styles.couponLabel}>COUPON</Text>
                            <Text style={styles.couponCode}>
                              {selectedNotification.offer.couponCode}
                            </Text>
                          </View>
                        ) : null}
                      </View>
                    </View>
                  ) : null}

                  {selectedNotification.action?.label ? (
                    <View style={styles.actionCard}>
                      <View style={styles.actionIconBox}>
                        <Ionicons
                          name="arrow-forward-circle"
                          size={22}
                          color={COLORS.primary}
                        />
                      </View>

                      <View style={styles.actionBody}>
                        <Text style={styles.actionTitle}>Available Action</Text>
                        <Text style={styles.actionLabel}>
                          {selectedNotification.action.label}
                        </Text>
                      </View>
                    </View>
                  ) : null}
                </>
              ) : null}
            </ScrollView>

            <View style={styles.sheetFooter}>
              <Pressable
                onPress={closeNotification}
                style={({ pressed }) => [
                  styles.doneButton,
                  pressed && styles.doneButtonPressed,
                ]}
              >
                <Text style={styles.doneButtonText}>Done</Text>
              </Pressable>
            </View>
          </Animated.View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  /* ---------- Header row ---------- */
  headerRow: {
    paddingHorizontal: 18,
    paddingTop: 4,
    paddingBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  headerIcon: {
    width: 30,
    height: 30,
    borderRadius: 10,
    backgroundColor: COLORS.lightOrange,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 9,
  },

  headerTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.text,
  },

  markAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 7,
    paddingHorizontal: 11,
    borderRadius: 999,
    backgroundColor: COLORS.lightOrange,
  },

  markAllText: {
    marginLeft: 5,
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.primaryDark,
  },

  /* ---------- List ---------- */
  listContent: {
    paddingHorizontal: 18,
    paddingBottom: 30,
  },

  emptyListContent: {
    flexGrow: 1,
  },

  /* ---------- Card ---------- */
  card: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 14,
    marginBottom: 11,

    shadowColor: '#b08968',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 2,
  },

  cardUnread: {
    backgroundColor: COLORS.unreadBg,
    borderColor: COLORS.unreadBorder,
  },

  cardPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.99 }],
  },

  iconWrap: {
    position: 'relative',
    marginRight: 12,
  },

  iconBox: {
    width: 42,
    height: 42,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },

  unreadDot: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 11,
    height: 11,
    borderRadius: 6,
    backgroundColor: COLORS.primary,
    borderWidth: 2,
    borderColor: COLORS.white,
  },

  cardBody: {
    flex: 1,
    minWidth: 0,
  },

  cardTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  cardTitle: {
    flex: 1,
    fontSize: 14.5,
    fontWeight: '700',
    color: COLORS.text,
  },

  cardTitleUnread: {
    fontWeight: '900',
  },

  cardTime: {
    marginLeft: 8,
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.muted,
  },

  cardMessage: {
    marginTop: 5,
    fontSize: 13,
    lineHeight: 19,
    color: COLORS.secondaryText,
  },

  cardBottomRow: {
    marginTop: 10,
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },

  typePill: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 7,
  },

  typePillText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.2,
  },

  offerPill: {
    marginLeft: 8,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 7,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: '#fed7aa',
  },

  offerPillText: {
    marginLeft: 4,
    fontSize: 10,
    fontWeight: '900',
    color: COLORS.primaryDark,
  },

  /* ---------- Loading / Empty ---------- */
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },

  loadingText: {
    marginTop: 10,
    fontSize: 13,
    color: COLORS.secondaryText,
  },

  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },

  emptyIcon: {
    width: 84,
    height: 84,
    borderRadius: 28,
    backgroundColor: COLORS.lightOrange,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 18,
  },

  emptyTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.text,
  },

  emptyMessage: {
    marginTop: 8,
    fontSize: 13,
    lineHeight: 20,
    textAlign: 'center',
    color: COLORS.secondaryText,
  },

  /* ---------- Modal ---------- */
  modalRoot: {
    flex: 1,
    justifyContent: 'flex-end',
  },

  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.45)',
  },

  sheet: {
    height: SCREEN_HEIGHT * 0.88,
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
    overflow: 'hidden',
  },

  sheetHandle: {
    width: 40,
    height: 4,
    borderRadius: 4,
    backgroundColor: '#e4e4e7',
    alignSelf: 'center',
    marginTop: 10,
    marginBottom: 6,
  },

  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#f6f1ec',
  },

  sheetIconBox: {
    width: 40,
    height: 40,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 11,
  },

  sheetHeaderText: {
    flex: 1,
  },

  sheetTitle: {
    fontSize: 15.5,
    fontWeight: '800',
    color: COLORS.text,
  },

  sheetSubtitle: {
    marginTop: 2,
    fontSize: 11,
    color: COLORS.muted,
  },

  sheetClose: {
    width: 34,
    height: 34,
    borderRadius: 12,
    backgroundColor: COLORS.softGray,
    alignItems: 'center',
    justifyContent: 'center',
  },

  detailContent: {
    padding: 18,
    paddingBottom: 28,
  },

  detailBadge: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    marginBottom: 12,
  },

  detailBadgeText: {
    marginLeft: 5,
    fontSize: 11,
    fontWeight: '800',
  },

  detailTitle: {
    fontSize: 22,
    lineHeight: 29,
    fontWeight: '900',
    color: COLORS.text,
  },

  detailMessage: {
    marginTop: 10,
    fontSize: 14.5,
    lineHeight: 22,
    color: COLORS.secondaryText,
  },

  infoCard: {
    marginTop: 18,
    backgroundColor: COLORS.background,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 15,
  },

  infoRow: {
    minHeight: 50,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  infoLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.secondaryText,
  },

  infoValue: {
    maxWidth: '65%',
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.text,
    textAlign: 'right',
  },

  infoDivider: {
    height: 1,
    backgroundColor: '#f0e8e2',
  },

  priorityPill: {
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 7,
  },

  priorityPillText: {
    fontSize: 11,
    fontWeight: '800',
  },

  readStatus: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  readStatusText: {
    marginLeft: 5,
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.green,
  },

  offerCard: {
    marginTop: 14,
    padding: 14,
    borderRadius: 18,
    backgroundColor: '#fff7ed',
    borderWidth: 1,
    borderColor: '#fed7aa',
    flexDirection: 'row',
  },

  offerIconBox: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },

  offerBody: {
    flex: 1,
  },

  offerTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.secondaryText,
  },

  offerDiscount: {
    marginTop: 2,
    fontSize: 19,
    fontWeight: '900',
    color: COLORS.primaryDark,
  },

  couponBox: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 8,
    backgroundColor: COLORS.white,
  },

  couponLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: COLORS.muted,
    marginRight: 7,
  },

  couponCode: {
    fontSize: 11,
    fontWeight: '900',
    color: COLORS.text,
    letterSpacing: 0.5,
  },

  actionCard: {
    marginTop: 14,
    padding: 14,
    borderRadius: 18,
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
    flexDirection: 'row',
    alignItems: 'center',
  },

  actionIconBox: {
    marginRight: 12,
  },

  actionBody: {
    flex: 1,
  },

  actionTitle: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.muted,
  },

  actionLabel: {
    marginTop: 3,
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.text,
  },

  sheetFooter: {
    paddingHorizontal: 18,
    paddingTop: 12,
    paddingBottom: 22,
    borderTopWidth: 1,
    borderTopColor: '#f6f1ec',
    backgroundColor: COLORS.white,
  },

  doneButton: {
    height: 52,
    borderRadius: 16,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },

  doneButtonPressed: {
    backgroundColor: COLORS.primaryDark,
  },

  doneButtonText: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.white,
  },
});
