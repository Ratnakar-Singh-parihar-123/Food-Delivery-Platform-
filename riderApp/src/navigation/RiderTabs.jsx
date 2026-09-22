import React, { useRef, useEffect } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {
  View,
  StyleSheet,
  Platform,
  Animated,
  Text,
  Pressable,
  Dimensions,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';

import RiderHomeScreen from '../screen/home/RiderHomeScreen';
import RiderOrdersScreen from '../screen/Orders/RiderOrdersScreen';
import RiderEarningsScreen from '../screen/Earnings/RiderEarningsScreen';
import RiderProfileScreen from '../screen/Profile/RiderProfileScreen';

const Tab = createBottomTabNavigator();
const { width } = Dimensions.get('window');

const COLORS = {
  primary: '#FF6B35',
  primaryDark: '#E55A2B',
  primaryLight: '#FFF0EA',
  title: '#0F172A',
  muted: '#94A3B8',
  white: '#FFFFFF',
  badgeBg: '#EF4444',
  shadow: 'rgba(255, 107, 53, 0.25)',
};

// Animated Tab Item
const CustomTabItem = ({ state, descriptors, navigation }) => {
  return (
    <View style={styles.tabContainer}>
      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];
        const isFocused = state.index === index;

        const scaleAnim = useRef(
          new Animated.Value(isFocused ? 1 : 0.85),
        ).current;
        const translateYAnim = useRef(
          new Animated.Value(isFocused ? -4 : 0),
        ).current;

        useEffect(() => {
          Animated.parallel([
            Animated.spring(scaleAnim, {
              toValue: isFocused ? 1 : 0.85,
              friction: 5,
              tension: 50,
              useNativeDriver: true,
            }),
            Animated.spring(translateYAnim, {
              toValue: isFocused ? -4 : 0,
              friction: 6,
              tension: 60,
              useNativeDriver: true,
            }),
          ]).start();
        }, [isFocused]);

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

        let iconName = 'home-outline';
        let label = 'Home';
        let badgeCount = 0;

        if (route.name === 'Home') {
          iconName = isFocused ? 'grid' : 'grid-outline';
          label = 'Home';
        } else if (route.name === 'Orders') {
          iconName = isFocused ? 'bicycle' : 'bicycle-outline';
          label = 'Orders';
          badgeCount = 3; // Example Badge Count
        } else if (route.name === 'Earnings') {
          iconName = isFocused ? 'wallet' : 'wallet-outline';
          label = 'Earnings';
        } else if (route.name === 'Profile') {
          iconName = isFocused ? 'person' : 'person-outline';
          label = 'Profile';
        }

        return (
          <Pressable
            key={route.key}
            onPress={onPress}
            style={styles.tabButton}
            android_ripple={{ color: 'transparent' }}
          >
            <Animated.View
              style={[
                styles.iconWrapper,
                {
                  transform: [
                    { scale: scaleAnim },
                    { translateY: translateYAnim },
                  ],
                },
              ]}
            >
              {isFocused ? (
                <LinearGradient
                  colors={[COLORS.primary, COLORS.primaryDark]}
                  style={styles.activeGradientPill}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <Ionicons name={iconName} size={20} color="#FFF" />
                  <Text style={styles.activeLabelText}>{label}</Text>
                </LinearGradient>
              ) : (
                <View style={styles.inactiveIconBox}>
                  <Ionicons name={iconName} size={22} color={COLORS.muted} />
                  <Text style={styles.inactiveLabelText}>{label}</Text>
                </View>
              )}

              {/* Order Badge Indicator */}
              {badgeCount > 0 && (
                <View style={styles.badgeContainer}>
                  <Text style={styles.badgeText}>{badgeCount}</Text>
                </View>
              )}
            </Animated.View>
          </Pressable>
        );
      })}
    </View>
  );
};

export default function RiderTabs() {
  return (
    <Tab.Navigator
      tabBar={props => <CustomTabItem {...props} />}
      screenOptions={{
        headerShown: false,
        tabBarHideOnKeyboard: true,
      }}
    >
      <Tab.Screen name="Home" component={RiderHomeScreen} />
      <Tab.Screen name="Orders" component={RiderOrdersScreen} />
      <Tab.Screen name="Earnings" component={RiderEarningsScreen} />
      <Tab.Screen name="Profile" component={RiderProfileScreen} />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  tabContainer: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 24 : 16,
    left: 16,
    right: 16,
    height: 68,
    backgroundColor: '#FFFFFF',
    borderRadius: 34,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: 8,
    borderWidth: 1,
    borderColor: 'rgba(226, 232, 240, 0.8)',
    ...Platform.select({
      ios: {
        shadowColor: '#0F172A',
        shadowOffset: { width: 0, height: 12 },
        shadowOpacity: 0.1,
        shadowRadius: 20,
      },
      android: {
        elevation: 10,
      },
    }),
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
  },
  iconWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },

  /* Active State Pill */
  activeGradientPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 22,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 4,
  },
  activeLabelText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.2,
  },

  /* Inactive State */
  inactiveIconBox: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
  },
  inactiveLabelText: {
    color: COLORS.muted,
    fontSize: 10,
    fontWeight: '600',
    marginTop: 2,
  },

  /* Notification Badge */
  badgeContainer: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: COLORS.badgeBg,
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
    borderWidth: 2,
    borderColor: '#FFFFFF',
    shadowColor: COLORS.badgeBg,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 4,
    elevation: 4,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '900',
  },
});
