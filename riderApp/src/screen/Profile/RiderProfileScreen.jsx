import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  StatusBar,
  ActivityIndicator,
  RefreshControl,
  Alert,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import LinearGradient from 'react-native-linear-gradient';
import { getRiderProfile, clearToken } from '../../api/riderApi';

const COLORS = {
  primary: '#FF6B35',
  primaryDark: '#E55A2B',
  primaryLight: '#FFF0EA',
  background: '#FFF8F5',
  white: '#FFFFFF',
  title: '#0F172A',
  text: '#334155',
  muted: '#64748B',
  lightMuted: '#94A3B8',
  border: '#E2E8F0',
  success: '#10B981',
  successBg: '#D1FAE5',
  warning: '#F59E0B',
  danger: '#EF4444',
  dangerBg: '#FEE2E2',
};

const MENU_GROUPS = [
  {
    title: 'Account Settings',
    items: [
      {
        key: 'personal',
        label: 'Personal Information',
        subLabel: 'Edit your name, phone & email',
        icon: 'person-outline',
        iconBg: '#E0F2FE',
        iconColor: '#0284C7',
        screen: 'RiderEditProfile',
      },
      {
        key: 'documents',
        label: 'My Documents',
        subLabel: 'Driving license, RC & Aadhaar',
        icon: 'document-text-outline',
        iconBg: '#EDE9FE',
        iconColor: '#7C3AED',
        screen: 'RiderBankDetails',
        screenParams: { tab: 'documents' },
      },
      {
        key: 'bank',
        label: 'Bank Details',
        subLabel: 'Payout UPI & bank account',
        icon: 'card-outline',
        iconBg: '#DCFCE7',
        iconColor: '#16A34A',
        screen: 'RiderBankDetails',
        screenParams: { tab: 'bank' },
      },
    ],
  },
  {
    title: 'Preferences',
    items: [
      {
        key: 'settings',
        label: 'App Settings',
        subLabel: 'Notifications & order alerts',
        icon: 'settings-outline',
        iconBg: '#FEF3C7',
        iconColor: '#D97706',
        screen: 'RiderSettings',
      },
    ],
  },
];

export default function RiderProfileScreen({ navigation }) {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchProfile = useCallback(async () => {
    try {
      setLoading(true);
      const res = await getRiderProfile();
      setProfile(res.data.rider);
    } catch (error) {
      console.error('Profile fetch error:', error);
      Alert.alert('Error', 'Failed to load profile');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchProfile();
  };

  const getInitials = () => {
    if (!profile) return 'R';
    return `${profile.firstName?.[0] || ''}${
      profile.lastName?.[0] || ''
    }`.toUpperCase();
  };

  const handleLogout = async () => {
    Alert.alert('Logout', 'Are you sure you want to log out of your account?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: async () => {
          await clearToken();
          navigation.reset({ index: 0, routes: [{ name: 'RiderWelcome' }] });
        },
      },
    ]);
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
      <StatusBar
        barStyle="light-content"
        backgroundColor={COLORS.primaryDark}
      />
      <ScrollView
        style={styles.container}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={COLORS.primary}
          />
        }
      >
        {/* Header Hero Section */}
        <LinearGradient
          colors={[COLORS.primary, COLORS.primaryDark]}
          style={styles.headerGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.topHeaderNav}>
            <Text style={styles.headerTitle}>Rider Profile</Text>
            <View style={styles.activePill}>
              <View style={styles.onlineDot} />
              <Text style={styles.activePillText}>Verified</Text>
            </View>
          </View>

          <View style={styles.headerContent}>
            {/* Avatar Circle with Badge */}
            <View style={styles.avatarWrapper}>
              <View style={styles.avatarContainer}>
                <Text style={styles.avatarText}>{getInitials()}</Text>
              </View>
              <View style={styles.ratingBadge}>
                <Ionicons name="star" size={12} color="#FFF" />
                <Text style={styles.ratingText}>
                  {profile?.rating?.average || '5.0'}
                </Text>
              </View>
            </View>

            {/* Rider Identity */}
            <Text style={styles.name}>
              {profile?.firstName} {profile?.lastName}
            </Text>
            <Text style={styles.phone}>
              {profile?.phone || '+91 9876543210'}
            </Text>
            <Text style={styles.email}>
              {profile?.email || 'rider@partner.com'}
            </Text>
          </View>
        </LinearGradient>

        {/* Floating Quick Stats Card */}
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <View style={[styles.statIconBg, { backgroundColor: '#E0F2FE' }]}>
              <Ionicons name="bicycle-outline" size={18} color="#0284C7" />
            </View>
            <Text style={styles.statValue}>
              {profile?.stats?.completedDeliveries || 0}
            </Text>
            <Text style={styles.statLabel}>Deliveries</Text>
          </View>

          <View style={styles.statDivider} />

          <View style={styles.statItem}>
            <View style={[styles.statIconBg, { backgroundColor: '#DCFCE7' }]}>
              <Ionicons name="wallet-outline" size={18} color="#16A34A" />
            </View>
            <Text style={styles.statValue}>
              ₹{profile?.earnings?.total || 0}
            </Text>
            <Text style={styles.statLabel}>Earnings</Text>
          </View>

          <View style={styles.statDivider} />

          <View style={styles.statItem}>
            <View style={[styles.statIconBg, { backgroundColor: '#FEF3C7' }]}>
              <Ionicons name="star-outline" size={18} color="#D97706" />
            </View>
            <Text style={styles.statValue}>
              {profile?.rating?.average || '0.0'}
            </Text>
            <Text style={styles.statLabel}>Rating</Text>
          </View>
        </View>

        {/* Menu Groups */}
        {MENU_GROUPS.map((group, groupIdx) => (
          <View key={groupIdx} style={styles.menuGroup}>
            <Text style={styles.groupTitle}>{group.title}</Text>
            <View style={styles.menuCard}>
              {group.items.map((item, index) => {
                const isLast = index === group.items.length - 1;
                return (
                  <Pressable
                    key={item.key}
                    style={({ pressed }) => [
                      styles.menuItem,
                      !isLast && styles.menuItemBorder,
                      pressed && styles.menuItemPressed,
                    ]}
                    onPress={() =>
                      navigation.navigate(item.screen, item.screenParams)
                    }
                  >
                    <View style={styles.menuLeft}>
                      <View
                        style={[
                          styles.menuIconBg,
                          { backgroundColor: item.iconBg },
                        ]}
                      >
                        <Ionicons
                          name={item.icon}
                          size={20}
                          color={item.iconColor}
                        />
                      </View>
                      <View>
                        <Text style={styles.menuLabel}>{item.label}</Text>
                        <Text style={styles.menuSubLabel}>{item.subLabel}</Text>
                      </View>
                    </View>
                    <Ionicons
                      name="chevron-forward"
                      size={18}
                      color={COLORS.lightMuted}
                    />
                  </Pressable>
                );
              })}
            </View>
          </View>
        ))}

        {/* Logout Action */}
        <Pressable
          style={({ pressed }) => [
            styles.logoutButton,
            pressed && { opacity: 0.8 },
          ]}
          onPress={handleLogout}
        >
          <View style={styles.logoutIconCircle}>
            <Ionicons name="log-out-outline" size={20} color={COLORS.danger} />
          </View>
          <Text style={styles.logoutText}>Log Out Account</Text>
        </Pressable>

        <Text style={styles.versionText}>App Version 2.4.0 (Rider Build)</Text>
        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.primaryDark },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  container: { flex: 1, backgroundColor: COLORS.background },

  /* Header Section */
  headerGradient: {
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 10 : 20,
    paddingBottom: 40,
    borderBottomLeftRadius: 36,
    borderBottomRightRadius: 36,
  },
  topHeaderNav: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  activePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
  },
  onlineDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.success,
  },
  activePillText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  headerContent: {
    alignItems: 'center',
  },
  avatarWrapper: {
    position: 'relative',
    marginBottom: 12,
  },
  avatarContainer: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 4,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  avatarText: {
    fontSize: 34,
    fontWeight: '900',
    color: COLORS.primary,
  },
  ratingBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    backgroundColor: '#F59E0B',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  ratingText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '900',
  },
  name: {
    fontSize: 22,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: -0.3,
  },
  phone: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    opacity: 0.9,
    marginTop: 2,
  },
  email: {
    fontSize: 13,
    fontWeight: '500',
    color: '#FFFFFF',
    opacity: 0.75,
    marginTop: 1,
  },

  /* Floating Stats Card */
  statsRow: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    marginHorizontal: 18,
    marginTop: -26,
    paddingVertical: 16,
    paddingHorizontal: 8,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 4,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statIconBg: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '900',
    color: COLORS.title,
  },
  statLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.muted,
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: '60%',
    alignSelf: 'center',
    backgroundColor: COLORS.border,
  },

  /* Menu Section */
  menuGroup: {
    marginTop: 22,
    paddingHorizontal: 18,
  },
  groupTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.muted,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 10,
    marginLeft: 4,
  },
  menuCard: {
    backgroundColor: COLORS.white,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.02,
    shadowRadius: 8,
    elevation: 2,
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  menuItemPressed: {
    backgroundColor: '#F8FAFC',
  },
  menuItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  menuLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  menuIconBg: {
    width: 40,
    height: 40,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuLabel: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.title,
  },
  menuSubLabel: {
    fontSize: 11,
    fontWeight: '500',
    color: COLORS.muted,
    marginTop: 2,
  },

  /* Logout Button */
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    marginHorizontal: 18,
    marginTop: 26,
    paddingVertical: 14,
    backgroundColor: COLORS.dangerBg,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.2)',
  },
  logoutIconCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoutText: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.danger,
  },
  versionText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.lightMuted,
    textAlign: 'center',
    marginTop: 16,
  },
});
