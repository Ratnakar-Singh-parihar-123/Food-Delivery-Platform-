// screens/partner/NotificationsScreen.js
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from '@react-native-vector-icons/ionicons';
import { COLORS } from '../../constants/colors';

const DUMMY_NOTIFICATIONS = [
  {
    id: '1',
    title: 'New Order #ORD-007',
    message: 'You have a new order from Priya Sharma.',
    time: '2 min ago',
    read: false,
  },
  {
    id: '2',
    title: 'Payment Received',
    message: '₹240 credited to your account.',
    time: '1 hour ago',
    read: false,
  },
  {
    id: '3',
    title: 'Subscription Paused',
    message: 'Amit Singh paused his subscription.',
    time: '3 hours ago',
    read: true,
  },
  {
    id: '4',
    title: 'Weekly Report',
    message: 'You earned ₹1,245 this week.',
    time: '1 day ago',
    read: true,
  },
];

const NotificationsScreen = ({ navigation }) => {
  const [notifications, setNotifications] = useState(DUMMY_NOTIFICATIONS);

  const markAsRead = id => {
    setNotifications(prev =>
      prev.map(item => (item.id === id ? { ...item, read: true } : item)),
    );
  };

  const renderItem = ({ item }) => (
    <Pressable
      style={[styles.notifCard, item.read && styles.readCard]}
      onPress={() => markAsRead(item.id)}
    >
      <View style={styles.notifContent}>
        <Text style={styles.notifTitle}>{item.title}</Text>
        <Text style={styles.notifMessage}>{item.message}</Text>
        <Text style={styles.notifTime}>{item.time}</Text>
      </View>
      {!item.read && <View style={styles.unreadDot} />}
    </Pressable>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={COLORS.title} />
        </Pressable>
        <Text style={styles.headerTitle}>Notifications</Text>
        <Pressable onPress={() => alert('Mark all read')}>
          <Text style={styles.markAllText}>Mark all</Text>
        </Pressable>
      </View>

      <FlatList
        data={notifications}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No notifications</Text>
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backBtn: { padding: 4 },
  headerTitle: { fontSize: 20, fontWeight: '900', color: COLORS.title },
  markAllText: { color: COLORS.primary, fontSize: 13, fontWeight: '600' },
  listContent: { paddingHorizontal: 16, paddingBottom: 20 },
  notifCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  readCard: { opacity: 0.6 },
  notifContent: { flex: 1 },
  notifTitle: { fontSize: 15, fontWeight: '700', color: COLORS.title },
  notifMessage: { fontSize: 13, color: COLORS.text, marginTop: 2 },
  notifTime: { fontSize: 11, color: COLORS.muted, marginTop: 4 },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.primary,
    marginLeft: 8,
  },
  emptyText: { textAlign: 'center', marginTop: 40, color: COLORS.muted },
});

export default NotificationsScreen;
