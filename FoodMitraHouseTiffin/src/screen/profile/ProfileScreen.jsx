// screens/partner/ProfileScreen.js
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  StatusBar,
  Alert,
  Image,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from '@react-native-vector-icons/ionicons';
import LinearGradient from 'react-native-linear-gradient';
import { COLORS } from '../../constants/colors';
import { clearAll } from '../../utils/storage';

const COVER_IMAGE =
  'https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=800&q=80';
const AVATAR_URL =
  'https://ui-avatars.com/api/?name=Tiffin+House&background=ff5a1f&color=fff&size=200';

const STATS = [
  { label: 'Rating', value: '4.8 ⭐', icon: 'star' },
  { label: 'Orders', value: '1,234', icon: 'receipt' },
  { label: 'Earnings', value: '₹45.2K', icon: 'cash' },
];

const MENU_SECTIONS = [
  {
    title: 'Account',
    items: [
      {
        icon: 'storefront',
        label: 'Kitchen Profile',
        screen: 'KitchenProfile',
      },
      { icon: 'time', label: 'Working Hours', screen: 'WorkingHours' },
      { icon: 'location', label: 'Service Area', screen: 'ServiceArea' },
      { icon: 'cash', label: 'Total Earnings', screen: 'Earnings' }, // ✅ NEW
    ],
  },
  {
    title: 'Settings',
    items: [
      { icon: 'card', label: 'Bank / UPI', screen: 'BankDetails' },
      { icon: 'document-text', label: 'Documents', screen: 'Documents' },
      {
        icon: 'notifications',
        label: 'Notifications',
        screen: 'Notifications',
      },
    ],
  },
  {
    title: 'Support',
    items: [
      { icon: 'help-circle', label: 'Help & Support', screen: 'HelpSupport' },
      { icon: 'information-circle', label: 'About', screen: 'About' },
    ],
  },
];

const ProfileScreen = ({ navigation }) => {
  const [refreshing, setRefreshing] = useState(false);

  const handleLogout = async () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: async () => {
          await clearAll();
          // ✅ Reset navigation stack to Auth
          navigation.reset({
            index: 0,
            routes: [{ name: 'Auth' }],
          });
        },
      },
    ]);
  };

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1200);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar
        barStyle="light-content"
        backgroundColor="transparent"
        translucent
      />
      <ScrollView
        style={styles.container}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[COLORS.primary]}
            tintColor={COLORS.primary}
          />
        }
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        {/* Cover & Avatar */}
        <View style={styles.coverContainer}>
          <Image source={{ uri: COVER_IMAGE }} style={styles.coverImage} />
          <LinearGradient
            colors={['rgba(0,0,0,0.1)', 'rgba(0,0,0,0.6)']}
            style={styles.coverGradient}
          />
          <View style={styles.avatarWrapper}>
            <Image source={{ uri: AVATAR_URL }} style={styles.avatar} />
            <Pressable
              style={styles.editAvatarBtn}
              onPress={() => alert('Change photo')}
            >
              <Ionicons name="camera" size={14} color={COLORS.white} />
            </Pressable>
          </View>
        </View>

        {/* Profile Info */}
        <View style={styles.profileInfo}>
          <Text style={styles.profileName}>Tiffin House</Text>
          <Text style={styles.profileSub}>⭐ 4.8 · 120 ratings</Text>
          <View style={styles.statsRow}>
            {STATS.map((stat, idx) => (
              <View key={idx} style={styles.statItem}>
                <Text style={styles.statValue}>{stat.value}</Text>
                <Text style={styles.statLabel}>{stat.label}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Menu Sections */}
        {MENU_SECTIONS.map((section, idx) => (
          <View key={idx} style={styles.section}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            {section.items.map((item, itemIdx) => (
              <Pressable
                key={itemIdx}
                style={[
                  styles.menuItem,
                  itemIdx === section.items.length - 1 && styles.menuItemLast,
                ]}
                onPress={() => navigation.navigate(item.screen)}
              >
                <View style={styles.menuIconWrapper}>
                  <Ionicons name={item.icon} size={22} color={COLORS.primary} />
                </View>
                <Text style={styles.menuLabel}>{item.label}</Text>
                <Ionicons
                  name="chevron-forward"
                  size={18}
                  color={COLORS.muted}
                />
              </Pressable>
            ))}
          </View>
        ))}

        {/* Logout */}
        <Pressable style={styles.logoutBtn} onPress={handleLogout}>
          <View
            style={[styles.menuIconWrapper, { backgroundColor: '#fecaca' }]}
          >
            <Ionicons name="log-out-outline" size={22} color="#ef4444" />
          </View>
          <Text style={styles.logoutText}>Logout</Text>
          <Ionicons name="chevron-forward" size={18} color={COLORS.muted} />
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.background, paddingBottom: 45 },
  container: { flex: 1 },

  // ─── COVER & AVATAR ──────────────────────────────────────
  coverContainer: {
    height: 200,
    position: 'relative',
  },
  coverImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  coverGradient: {
    ...StyleSheet.absoluteFillObject,
  },
  avatarWrapper: {
    position: 'absolute',
    bottom: -48,
    left: '50%',
    transform: [{ translateX: -48 }],
    alignItems: 'center',
  },
  avatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
    borderWidth: 4,
    borderColor: COLORS.white,
    backgroundColor: COLORS.white,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
  editAvatarBtn: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.white,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },

  // ─── PROFILE INFO ──────────────────────────────────────
  profileInfo: {
    marginTop: 60,
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  profileName: {
    fontSize: 22,
    fontWeight: '900',
    color: COLORS.title,
    marginBottom: 2,
  },
  profileSub: {
    fontSize: 13,
    color: COLORS.muted,
    marginBottom: 12,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    backgroundColor: COLORS.white,
    borderRadius: 14,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.title,
  },
  statLabel: {
    fontSize: 11,
    color: COLORS.muted,
    marginTop: 2,
  },

  // ─── MENU SECTIONS ──────────────────────────────────────
  section: {
    marginTop: 24,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.muted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f3f5',
    backgroundColor: COLORS.white,
    paddingHorizontal: 12,
    borderRadius: 0,
  },
  menuItemLast: {
    borderBottomWidth: 0,
  },
  menuIconWrapper: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.soft,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  menuLabel: {
    flex: 1,
    fontSize: 15,
    fontWeight: '500',
    color: COLORS.text,
  },

  // ─── LOGOUT ──────────────────────────────────────────────
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    marginTop: 24,
    marginHorizontal: 16,
    borderTopWidth: 1,
    borderTopColor: '#f1f3f5',
    paddingHorizontal: 12,
    backgroundColor: COLORS.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  logoutText: {
    flex: 1,
    color: '#ef4444',
    fontSize: 15,
    fontWeight: '600',
    marginLeft: 12,
  },
});

export default ProfileScreen;
