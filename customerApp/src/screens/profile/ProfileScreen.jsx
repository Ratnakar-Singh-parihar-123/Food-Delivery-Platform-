import React, { useState, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import {
  Image,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Ionicons from '@react-native-vector-icons/ionicons';
import { getCustomerProfile, logoutCustomer } from '../../api/customerApi';

const COLORS = {
  primary: '#ff5a1f',
  background: '#fffaf7',
  white: '#ffffff',
  title: '#171717',
  muted: '#8f8f98',
  border: '#eee5df',
  soft: '#fff0e9',
};

const STATIC_BASE = 'https://myfoodmitra-ecosystem.onrender.com';
const DEFAULT_IMAGE =
  'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=300&q=80';

const QUICK_ACTIONS = [
  {
    route: 'Addresses',
    icon: 'location-outline',
    label: 'Addresses',
    subtitle: 'Saved locations',
  },
  {
    route: 'Payments',
    icon: 'card-outline',
    label: 'Payments',
    subtitle: 'Cards & UPI',
  },
  {
    route: 'Coupons',
    icon: 'ticket-outline',
    label: 'Coupons',
    subtitle: 'Available offers',
  },
  {
    route: 'Favourites',
    icon: 'heart-outline',
    label: 'Favourites',
    subtitle: 'Saved dishes',
  },
];

const MENU_ITEMS = [
  {
    route: 'PersonalInformation',
    icon: 'person-circle-outline',
    label: 'Personal information',
    subtitle: 'Name, email, phone aur profile photo',
  },
  {
    route: 'Notifications',
    icon: 'notifications-outline',
    label: 'Notifications',
    subtitle: 'Order aur offer alerts',
  },
  {
    route: 'PrivacySecurity',
    icon: 'shield-checkmark-outline',
    label: 'Privacy & security',
    subtitle: 'Account safety controls',
  },
  {
    route: 'HelpSupport',
    icon: 'headset-outline',
    label: 'Help & support',
    subtitle: 'Humse baat karein',
  },
  {
    route: 'AboutFoodMitra',
    icon: 'information-circle-outline',
    label: 'About FoodMitra',
    subtitle: 'Version 1.0.0',
  },
];

export default function ProfileScreen({ navigation }) {
  const [profile, setProfile] = useState({
    name: '',
    phone: '',
    image: DEFAULT_IMAGE,
  });
  const [loading, setLoading] = useState(true);

  const fetchProfile = useCallback(async () => {
    try {
      setLoading(true);
      const response = await getCustomerProfile();
      const customer = response.data.customer;
      const fullName = `${customer.firstName || ''} ${
        customer.lastName || ''
      }`.trim();

      let imageUrl = DEFAULT_IMAGE;
      if (customer.profileImage) {
        if (customer.profileImage.startsWith('http')) {
          imageUrl = customer.profileImage;
        } else {
          const path = customer.profileImage.startsWith('/')
            ? customer.profileImage
            : `/${customer.profileImage}`;
          imageUrl = `${STATIC_BASE}${path}`;
        }
      }

      setProfile({
        name: fullName || 'Customer',
        phone: customer.phone || '+91 ••••••••',
        image: imageUrl,
      });
    } catch (error) {
      // Fallback dummy data
      setProfile({
        name: 'Ratnakar Singh',
        phone: '+91 98••••••45',
        image: DEFAULT_IMAGE,
      });
    } finally {
      setLoading(false);
    }
  }, []);

  // ── Logout ──
  const handleLogout = async () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            try {
              // Call logout API
              await logoutCustomer();
            } catch (error) {
              console.warn('Logout API error:', error);
            } finally {
              // Clear token and navigate to login
              await AsyncStorage.removeItem('customerToken');
              navigation.reset({
                index: 0,
                routes: [{ name: 'PhoneLogin' }],
              });
            }
          },
        },
      ],
      { cancelable: true },
    );
  };

  // ── Refresh profile on focus ──
  useFocusEffect(
    useCallback(() => {
      fetchProfile();
    }, [fetchProfile]),
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View
          style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}
        >
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.header}>
          <View>
            <Text style={styles.eyebrow}>MY FoodMitra</Text>
            <Text style={styles.heading}>Profile</Text>
          </View>

          <View style={styles.headerActions}>
            <Pressable
              onPress={() => navigation.navigate('Settings')}
              style={styles.settingsButton}
            >
              <Ionicons
                name="settings-outline"
                size={21}
                color={COLORS.title}
              />
            </Pressable>
            <Pressable onPress={handleLogout} style={styles.logoutButton}>
              <Ionicons
                name="log-out-outline"
                size={21}
                color={COLORS.primary}
              />
            </Pressable>
          </View>
        </View>

        <Pressable
          onPress={() => navigation.navigate('PersonalInformation')}
          style={styles.heroCard}
        >
          <View style={styles.heroGlowOne} />
          <View style={styles.heroGlowTwo} />

          <View style={styles.heroTop}>
            <View style={styles.avatarWrapper}>
              <Image
                source={{ uri: profile.image }}
                style={styles.avatar}
                onError={() =>
                  setProfile(prev => ({ ...prev, image: DEFAULT_IMAGE }))
                }
              />
              <View style={styles.onlineDot} />
            </View>

            <View style={styles.userContent}>
              <Text style={styles.userName}>{profile.name}</Text>
              <Text style={styles.userPhone}>{profile.phone}</Text>

              <View style={styles.verifiedPill}>
                <Ionicons name="checkmark-circle" size={13} color="#ffffff" />
                <Text style={styles.verifiedText}>Verified customer</Text>
              </View>
            </View>

            <View style={styles.editProfileButton}>
              <Ionicons name="create-outline" size={17} color="#ffffff" />
            </View>
          </View>

          <View style={styles.heroDivider} />

          <View style={styles.heroStats}>
            <HeroStat value="24" label="Orders" />
            <HeroStat value="₹1,240" label="Saved" />
            <HeroStat value="450" label="Coins" />
          </View>
        </Pressable>

        <SectionTitle
          title="Quick actions"
          subtitle="Manage Everything in One Place"
        />

        <View style={styles.quickGrid}>
          {QUICK_ACTIONS.map(item => (
            <Pressable
              key={item.route}
              onPress={() => navigation.navigate(item.route)}
              style={({ pressed }) => [
                styles.quickCard,
                pressed && styles.pressed,
              ]}
            >
              <View style={styles.quickIcon}>
                <Ionicons name={item.icon} size={21} color={COLORS.primary} />
              </View>

              <View style={styles.quickTextWrap}>
                <Text style={styles.quickLabel}>{item.label}</Text>
                <Text style={styles.quickSubtitle}>{item.subtitle}</Text>
              </View>

              <Ionicons name="arrow-forward" size={16} color="#c7c1bd" />
            </Pressable>
          ))}
        </View>

        <SectionTitle
          title="Account & support"
          subtitle="Profile & App Preferences
"
        />

        <View style={styles.menuCard}>
          {MENU_ITEMS.map((item, index) => (
            <React.Fragment key={item.route}>
              <Pressable
                onPress={() => navigation.navigate(item.route)}
                style={({ pressed }) => [
                  styles.menuItem,
                  pressed && styles.menuItemPressed,
                ]}
              >
                <View style={styles.menuIcon}>
                  <Ionicons name={item.icon} size={20} color={COLORS.primary} />
                </View>

                <View style={styles.menuContent}>
                  <Text style={styles.menuLabel}>{item.label}</Text>
                  <Text style={styles.menuSubtitle}>{item.subtitle}</Text>
                </View>

                <Ionicons name="chevron-forward" size={18} color="#c7c1bd" />
              </Pressable>

              {index < MENU_ITEMS.length - 1 ? (
                <View style={styles.menuDivider} />
              ) : null}
            </React.Fragment>
          ))}
        </View>

        {/* ─── Logout Card ──────────────────────────────────── */}
        <Pressable onPress={handleLogout} style={styles.logoutCard}>
          <View style={styles.logoutIcon}>
            <Ionicons name="log-out-outline" size={21} color="#ffffff" />
          </View>

          <View style={styles.logoutContent}>
            <Text style={styles.logoutTitle}>Logout</Text>
            <Text style={styles.logoutSubtitle}>Sign out of your account</Text>
          </View>

          <Ionicons name="chevron-forward" size={19} color={COLORS.primary} />
        </Pressable>

        <Text style={styles.footerText}>
          FoodMitra.in • Good food, good mood
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

function HeroStat({ value, label }) {
  return (
    <View style={styles.heroStat}>
      <Text style={styles.heroStatValue}>{value}</Text>
      <Text style={styles.heroStatLabel}>{label}</Text>
    </View>
  );
}

function SectionTitle({ title, subtitle }) {
  return (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <Text style={styles.sectionSubtitle}>{subtitle}</Text>
    </View>
  );
}

// ── Styles ──
const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.background },
  scrollContent: { paddingHorizontal: 18, paddingTop: 14, paddingBottom: 150 },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerActions: {
    flexDirection: 'row',
    gap: 10,
  },
  settingsButton: {
    width: 44,
    height: 44,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.white,
  },
  logoutButton: {
    width: 44,
    height: 44,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#ffd6c4',
    backgroundColor: '#fff3ed',
  },
  eyebrow: {
    color: COLORS.primary,
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1,
  },
  heading: {
    marginTop: 4,
    color: COLORS.title,
    fontSize: 29,
    fontWeight: '900',
    letterSpacing: -0.9,
  },

  heroCard: {
    marginTop: 22,
    padding: 17,
    overflow: 'hidden',
    borderRadius: 27,
    backgroundColor: COLORS.title,
    shadowColor: COLORS.title,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 8,
  },
  heroGlowOne: {
    position: 'absolute',
    top: -55,
    right: -25,
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: 'rgba(255,90,31,0.30)',
  },
  heroGlowTwo: {
    position: 'absolute',
    left: -50,
    bottom: -70,
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  heroTop: { flexDirection: 'row', alignItems: 'center' },
  avatarWrapper: {
    width: 72,
    height: 72,
    padding: 3,
    borderRadius: 24,
    backgroundColor: COLORS.primary,
  },
  avatar: { width: '100%', height: '100%', borderRadius: 21 },
  onlineDot: {
    position: 'absolute',
    right: -2,
    bottom: -2,
    width: 17,
    height: 17,
    borderRadius: 9,
    borderWidth: 3,
    borderColor: COLORS.title,
    backgroundColor: '#22c55e',
  },
  userContent: { flex: 1, marginLeft: 13 },
  userName: { color: COLORS.white, fontSize: 17, fontWeight: '900' },
  userPhone: {
    marginTop: 5,
    color: 'rgba(255,255,255,0.62)',
    fontSize: 10,
    fontWeight: '600',
  },
  verifiedPill: {
    alignSelf: 'flex-start',
    marginTop: 8,
    paddingHorizontal: 8,
    paddingVertical: 5,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 10,
    backgroundColor: 'rgba(255,90,31,0.88)',
  },
  verifiedText: {
    marginLeft: 4,
    color: '#ffffff',
    fontSize: 8,
    fontWeight: '800',
  },
  editProfileButton: {
    width: 40,
    height: 40,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
  },
  heroDivider: {
    height: 1,
    marginVertical: 16,
    backgroundColor: 'rgba(255,255,255,0.10)',
  },
  heroStats: { flexDirection: 'row' },
  heroStat: { flex: 1, alignItems: 'center' },
  heroStatValue: { color: '#ffffff', fontSize: 14, fontWeight: '900' },
  heroStatLabel: {
    marginTop: 3,
    color: 'rgba(255,255,255,0.50)',
    fontSize: 8.5,
  },

  sectionHeader: { marginTop: 27, marginBottom: 13 },
  sectionTitle: { color: COLORS.title, fontSize: 17, fontWeight: '900' },
  sectionSubtitle: { marginTop: 4, color: COLORS.muted, fontSize: 9.5 },

  quickGrid: { gap: 11 },
  quickCard: {
    minHeight: 72,
    paddingHorizontal: 13,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 19,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.white,
  },
  quickIcon: {
    width: 42,
    height: 42,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.soft,
  },
  quickTextWrap: { flex: 1, marginLeft: 11 },
  quickLabel: { color: COLORS.title, fontSize: 11.5, fontWeight: '900' },
  quickSubtitle: { marginTop: 3, color: COLORS.muted, fontSize: 8.5 },

  menuCard: {
    overflow: 'hidden',
    borderRadius: 21,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.white,
  },
  menuItem: {
    minHeight: 72,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuItemPressed: { backgroundColor: '#fff8f4' },
  menuIcon: {
    width: 40,
    height: 40,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.soft,
  },
  menuContent: { flex: 1, marginLeft: 11 },
  menuLabel: { color: COLORS.title, fontSize: 11.5, fontWeight: '900' },
  menuSubtitle: { marginTop: 4, color: COLORS.muted, fontSize: 8.5 },
  menuDivider: { height: 1, marginLeft: 65, backgroundColor: '#f2eeeb' },

  // ─── Logout Card ────────────────────────────────────────
  logoutCard: {
    marginTop: 18,
    padding: 15,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#ffd6c4',
    backgroundColor: '#fff3ed',
  },
  logoutIcon: {
    width: 45,
    height: 45,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
  },
  logoutContent: {
    flex: 1,
    marginHorizontal: 11,
  },
  logoutTitle: {
    color: COLORS.title,
    fontSize: 11.5,
    fontWeight: '900',
  },
  logoutSubtitle: {
    marginTop: 4,
    color: COLORS.muted,
    fontSize: 8.5,
    lineHeight: 13,
  },

  footerText: {
    marginTop: 24,
    color: COLORS.muted,
    fontSize: 9,
    textAlign: 'center',
  },
  pressed: { opacity: 0.78, transform: [{ scale: 0.98 }] },
});
