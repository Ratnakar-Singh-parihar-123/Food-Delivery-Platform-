// navigation/AppNavigator.js
import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Dimensions,
  Platform,
} from 'react-native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Ionicons from '@react-native-vector-icons/ionicons';
import { SafeAreaView } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';

// ─── AUTH SCREENS ─────────────────────────────────────────
import SplashScreen from '../screen/SplashScreen/SplashScreen';
import AuthScreen from '../screen/auth/AuthScreen';
import CreateProfileScreen from '../screen/auth/CreateProfileScreen';
import PendingApprovalScreen from '../screen/auth/PendingApprovalScreen';

// ─── PARTNER TABS ─────────────────────────────────────────
import HomeScreen from '../screen/home/HomeScreen';
import OrdersScreen from '../screen/orders/OrdersScreen';
import MenuScreen from '../screen/orders/MenuScreen';
import TiffinScreen from '../screen/orders/TiffinScreen';
import ProfileScreen from '../screen/profile/ProfileScreen';
import SubscriptionDetailScreen from '../screen/orders/SubscriptionDetailScreen';

// ─── DETAIL SCREENS (PUSH) ───────────────────────────────
import OrderDetailScreen from '../screen/orders/OrderDetailScreen';
import AllOrdersScreen from '../screen/orders/AllOrdersScreen';
import MenuItemDetailScreen from '../screen/orders/MenuItemDetailScreen';
import KitchenProfileScreen from '../screen/profile/KitchenProfileScreen';
import WorkingHoursScreen from '../screen/profile/WorkingHoursScreen';
import BankDetailsScreen from '../screen/profile/BankDetailsScreen';
import NotificationsScreen from '../screen/profile/NotificationsScreen';
import HelpSupportScreen from '../screen/profile/HelpSupportScreen';
import AboutScreen from '../screen/profile/AboutScreen';
import EarningsScreen from '../screen/profile/EarningsScreen';

import { getToken, getUserData, getApproved } from '../utils/storage';
import { COLORS } from '../constants/colors';

const { width } = Dimensions.get('window');
const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

// ─── CUSTOM TAB BAR – PREMIUM GLASS-MORPHISM DESIGN ──────
const CustomTabBar = ({ state, descriptors, navigation }) => {
  const translateX = useRef(new Animated.Value(0)).current;

  const containerPadding = 16;
  const tabBarWidth = width - containerPadding * 2;
  const numTabs = state.routes.length;
  const itemWidth = tabBarWidth / numTabs;
  const pillWidth = itemWidth - 24; // sleeker pill
  const pillLeftOffset = (itemWidth - pillWidth) / 2;

  useEffect(() => {
    Animated.spring(translateX, {
      toValue: state.index * itemWidth + pillLeftOffset,
      useNativeDriver: true,
      tension: 60,
      friction: 12,
    }).start();
  }, [state.index, itemWidth, pillLeftOffset]);

  return (
    <SafeAreaView edges={['bottom']} style={styles.tabContainer}>
      <View style={styles.tabBarWrapper}>
        {/* Glass effect – semi-transparent background */}
        {Platform.OS === 'ios' && (
          <View style={[StyleSheet.absoluteFill, styles.blurFallback]} />
        )}
        <View style={styles.tabBar}>
          {/* Animated pill with gradient */}
          <Animated.View
            style={[
              styles.pillBackground,
              {
                width: pillWidth,
                transform: [{ translateX }],
              },
            ]}
          >
            <LinearGradient
              colors={[COLORS.primary, COLORS.primaryDark]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.pillGradient}
            />
          </Animated.View>

          {state.routes.map((route, index) => {
            const { options } = descriptors[route.key];
            const label =
              options.tabBarLabel !== undefined
                ? options.tabBarLabel
                : options.title !== undefined
                ? options.title
                : route.name;

            const isFocused = state.index === index;

            const onPress = () => {
              const event = navigation.emit({
                type: 'tabPress',
                target: route.key,
                canPreventDefault: true,
              });

              if (!isFocused && !event.defaultPrevented) {
                navigation.navigate(route.name);
              }
            };

            let iconName;
            if (route.name === 'Home')
              iconName = isFocused ? 'home' : 'home-outline';
            else if (route.name === 'Orders')
              iconName = isFocused ? 'list' : 'list-outline';
            else if (route.name === 'Menu')
              iconName = isFocused ? 'fast-food' : 'fast-food-outline';
            else if (route.name === 'Tiffin')
              iconName = isFocused ? 'calendar' : 'calendar-outline';
            else if (route.name === 'Profile')
              iconName = isFocused ? 'person' : 'person-outline';

            return (
              <TouchableOpacity
                key={route.key}
                onPress={onPress}
                onLongPress={() =>
                  navigation.emit({ type: 'tabLongPress', target: route.key })
                }
                style={styles.tabItem}
                activeOpacity={0.7}
              >
                <View style={styles.iconWrapper}>
                  <Ionicons
                    name={iconName}
                    size={24}
                    color={isFocused ? COLORS.white : COLORS.muted}
                  />
                </View>
                <Text
                  style={[
                    styles.tabLabel,
                    { color: isFocused ? COLORS.white : COLORS.muted },
                  ]}
                >
                  {label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    </SafeAreaView>
  );
};

// ─── TAB BAR STYLES ──────────────────────────────────────
const styles = StyleSheet.create({
  tabContainer: {
    backgroundColor: 'transparent',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 16,
    paddingBottom: 10,
  },
  tabBarWrapper: {
    borderRadius: 32,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 12,
    backgroundColor:
      Platform.OS === 'ios' ? 'rgba(255,255,255,0.7)' : COLORS.white,
    borderWidth: Platform.OS === 'ios' ? 0 : 1,
    borderColor: COLORS.border,
  },
  blurFallback: {
    backgroundColor: 'rgba(255,255,255,0.3)',
    // For real blur, install react-native-blur and replace with <BlurView>
  },
  tabBar: {
    flexDirection: 'row',
    height: 64,
    backgroundColor: 'transparent',
    position: 'relative',
    overflow: 'visible',
  },
  pillBackground: {
    position: 'absolute',
    top: 6,
    bottom: 6,
    left: 0,
    borderRadius: 26,
    overflow: 'hidden',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 8,
  },
  pillGradient: {
    flex: 1,
    borderRadius: 26,
  },
  tabItem: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 4,
    zIndex: 2,
  },
  iconWrapper: {
    justifyContent: 'center',
    alignItems: 'center',
    height: 28,
  },
  tabLabel: {
    fontSize: 10,
    fontWeight: '700',
    marginTop: 2,
    letterSpacing: 0.3,
  },
});

// ─── PARTNER TABS NAVIGATOR ──────────────────────────────
const PartnerTabs = () => (
  <Tab.Navigator
    tabBar={props => <CustomTabBar {...props} />}
    screenOptions={{ headerShown: false }}
  >
    <Tab.Screen name="Home" component={HomeScreen} />
    <Tab.Screen name="Orders" component={OrdersScreen} />
    <Tab.Screen name="Menu" component={MenuScreen} />
    <Tab.Screen name="Tiffin" component={TiffinScreen} />
    <Tab.Screen name="Profile" component={ProfileScreen} />
  </Tab.Navigator>
);

// ─── ROOT NAVIGATOR ──────────────────────────────────────
const AppNavigator = () => {
  const [loading, setLoading] = useState(true);
  const [initialRoute, setInitialRoute] = useState('Splash');

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = await getToken();
        if (token) {
          const user = await getUserData();
          const approved = await getApproved();
          if (user && approved) {
            setInitialRoute('PartnerTabs');
          } else if (user && !approved) {
            setInitialRoute('PendingApproval');
          } else {
            setInitialRoute('Auth');
          }
        } else {
          setInitialRoute('Auth');
        }
      } catch (error) {
        console.warn('Auth check error:', error);
        setInitialRoute('Auth');
      } finally {
        setLoading(false);
      }
    };
    checkAuth();
  }, []);

  if (loading) return <SplashScreen />;

  return (
    <Stack.Navigator
      screenOptions={{ headerShown: false }}
      initialRouteName={initialRoute}
    >
      {/* Auth flow */}
      <Stack.Screen name="Splash" component={SplashScreen} />
      <Stack.Screen name="Auth" component={AuthScreen} />
      <Stack.Screen name="CreateProfile" component={CreateProfileScreen} />
      <Stack.Screen name="PendingApproval" component={PendingApprovalScreen} />

      {/* Main app */}
      <Stack.Screen name="PartnerTabs" component={PartnerTabs} />

      {/* Detail screens (push from tabs) */}
      <Stack.Screen name="OrderDetail" component={OrderDetailScreen} />
      <Stack.Screen name="AllOrders" component={AllOrdersScreen} />
      <Stack.Screen name="MenuItemDetail" component={MenuItemDetailScreen} />
      <Stack.Screen
        name="SubscriptionDetail"
        component={SubscriptionDetailScreen}
      />

      {/* Profile-related screens */}
      <Stack.Screen name="KitchenProfile" component={KitchenProfileScreen} />
      <Stack.Screen name="WorkingHours" component={WorkingHoursScreen} />
      <Stack.Screen name="BankDetails" component={BankDetailsScreen} />
      <Stack.Screen name="Notifications" component={NotificationsScreen} />
      <Stack.Screen name="HelpSupport" component={HelpSupportScreen} />
      <Stack.Screen name="About" component={AboutScreen} />
      <Stack.Screen name="Earnings" component={EarningsScreen} />
    </Stack.Navigator>
  );
};

export default AppNavigator;
