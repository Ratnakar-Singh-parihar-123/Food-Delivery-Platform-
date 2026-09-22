import React, { useEffect, useRef } from 'react';
import {
  Animated,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
  Dimensions,
} from 'react-native';
import Ionicons from '@react-native-vector-icons/ionicons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useOrderBadge } from '../context/OrderBadgeContext.jsx';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const PRIMARY = '#ff5a1f';
const PRIMARY_LIGHT = '#fff0e9';

const TAB_CONFIG = {
  Home: { label: 'Home', activeIcon: 'home', inactiveIcon: 'home-outline' },
  Search: {
    label: 'Search',
    activeIcon: 'search',
    inactiveIcon: 'search-outline',
  },
  Orders: {
    label: 'Orders',
    activeIcon: 'receipt',
    inactiveIcon: 'receipt-outline',
  },
  Profile: {
    label: 'Profile',
    activeIcon: 'person',
    inactiveIcon: 'person-outline',
  },
};

function TabItem({ route, active, onPress, onLongPress, badge }) {
  const config = TAB_CONFIG[route.name];

  const pressScale = useRef(new Animated.Value(1)).current;
  const progress = useRef(new Animated.Value(active ? 1 : 0)).current;
  const iconScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.spring(progress, {
      toValue: active ? 1 : 0,
      tension: 100,
      friction: 10,
      useNativeDriver: true,
    }).start();

    if (active) {
      Animated.spring(iconScale, {
        toValue: 1.15,
        tension: 200,
        friction: 8,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.spring(iconScale, {
        toValue: 1,
        tension: 200,
        friction: 8,
        useNativeDriver: true,
      }).start();
    }
  }, [active, progress, iconScale]);

  const translateY = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -3],
  });
  const pillScale = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [0.7, 1],
  });
  const labelOpacity = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [0.6, 1],
  });

  const handlePressIn = () => {
    Animated.spring(pressScale, {
      toValue: 0.92,
      useNativeDriver: true,
    }).start();
  };
  const handlePressOut = () => {
    Animated.spring(pressScale, { toValue: 1, useNativeDriver: true }).start();
  };

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected: active }}
      onPress={onPress}
      onLongPress={onLongPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={styles.tabButton}
    >
      <Animated.View
        style={[styles.tabContent, { transform: [{ scale: pressScale }] }]}
      >
        <Animated.View
          pointerEvents="none"
          style={[
            styles.activePill,
            {
              opacity: progress,
              transform: [{ scale: pillScale }],
            },
          ]}
        />

        <Animated.View
          style={[styles.iconWrapper, { transform: [{ translateY }] }]}
        >
          <Animated.View style={{ transform: [{ scale: iconScale }] }}>
            <Ionicons
              name={active ? config.activeIcon : config.inactiveIcon}
              size={22}
              color={active ? '#ffffff' : '#9ca3af'}
            />
          </Animated.View>

          {badge > 0 && (
            <Animated.View
              style={[
                styles.badge,
                {
                  transform: [
                    {
                      scale: progress.interpolate({
                        inputRange: [0, 1],
                        outputRange: [1, 1.1],
                      }),
                    },
                  ],
                },
              ]}
            >
              <Text style={styles.badgeText}>{badge > 9 ? '9+' : badge}</Text>
            </Animated.View>
          )}
        </Animated.View>

        <Animated.Text
          style={[
            styles.label,
            active && styles.activeLabel,
            { opacity: labelOpacity },
          ]}
        >
          {config.label}
        </Animated.Text>

        <Animated.View
          style={[
            styles.indicator,
            {
              opacity: progress,
              transform: [{ scaleX: progress }],
            },
          ]}
        />
      </Animated.View>
    </Pressable>
  );
}

export default function BottomTabBar({ state, navigation }) {
  const insets = useSafeAreaInsets();
  const { badgeCount, fetchActiveOrdersCount } = useOrderBadge();

  useEffect(() => {
    fetchActiveOrdersCount();
  }, []);

  return (
    <View style={[styles.wrapper, { bottom: Math.max(insets.bottom, 10) }]}>
      <View style={styles.navigation}>
        {state.routes.map((route, index) => {
          const active = state.index === index;
          const isOrdersTab = route.name === 'Orders';

          const handlePress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });
            if (!active && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          const handleLongPress = () => {
            navigation.emit({ type: 'tabLongPress', target: route.key });
          };

          return (
            <TabItem
              key={route.key}
              route={route}
              active={active}
              onPress={handlePress}
              onLongPress={handleLongPress}
              badge={isOrdersTab ? badgeCount : 0}
            />
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    left: 14,
    right: 14,
    shadowColor: '#111827',
    shadowOffset: {
      width: 0,
      height: 12,
    },
    shadowOpacity: Platform.OS === 'ios' ? 0.15 : 0.25,
    shadowRadius: 24,
    elevation: 20,
  },
  navigation: {
    height: 78,
    paddingHorizontal: 8,
    flexDirection: 'row',
    alignItems: 'center',
    overflow: 'hidden',
    borderRadius: 29,
    borderWidth: 1,
    borderColor: 'rgba(255,90,31,0.08)',
    backgroundColor: 'rgba(255,255,255,0.96)',
    // subtle inner shadow via backdrop (not natively supported, but we keep the translucent bg)
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 4,
  },
  tabButton: {
    flex: 1,
  },
  tabContent: {
    height: 68,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activePill: {
    position: 'absolute',
    top: 5,
    width: 48,
    height: 42,
    borderRadius: 16,
    backgroundColor: PRIMARY,
    shadowColor: PRIMARY,
    shadowOffset: {
      width: 0,
      height: 7,
    },
    shadowOpacity: 0.3,
    shadowRadius: 11,
    elevation: 7,
  },
  iconWrapper: {
    width: 38,
    height: 34,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: {
    position: 'absolute',
    top: -3,
    right: -3,
    minWidth: 18,
    height: 18,
    paddingHorizontal: 4,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 9,
    borderWidth: 2,
    borderColor: '#ffffff',
    backgroundColor: '#ef4444',
  },
  badgeText: {
    color: '#ffffff',
    fontSize: 8,
    fontWeight: '900',
  },
  label: {
    marginTop: 2,
    color: '#9ca3af',
    fontSize: 9.5,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  activeLabel: {
    color: PRIMARY,
    fontWeight: '900',
  },
  indicator: {
    width: 18,
    height: 3,
    marginTop: 4,
    borderRadius: 2,
    backgroundColor: PRIMARY,
  },
});
