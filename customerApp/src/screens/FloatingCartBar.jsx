import React, { useEffect, useRef } from 'react';

import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';

import Ionicons from '@react-native-vector-icons/ionicons';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Image } from 'react-native';
import { useAppUI } from '../context/AppUIContext';

export default function FloatingCartBar() {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const BASE_URL = 'https://myfoodmitra-ecosystem.onrender.com';
  const { cartCount, cartItems, cartTotal, showFloatingCart } = useAppUI();

  const translateY = useRef(new Animated.Value(120)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  const shouldShow = showFloatingCart && cartCount > 0;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(translateY, {
        toValue: shouldShow ? 0 : 120,
        damping: 11,
        stiffness: 150,
        mass: 0.75,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: shouldShow ? 1 : 0,
        duration: shouldShow ? 220 : 160,
        useNativeDriver: true,
      }),
    ]).start();
  }, [opacity, shouldShow, translateY]);

  const previewImages = cartItems.slice(0, 3);

  return (
    <Animated.View
      pointerEvents={shouldShow ? 'auto' : 'none'}
      style={[
        styles.wrapper,
        {
          bottom: 82 + Math.max(insets.bottom, 6),
          opacity,
          transform: [{ translateY }],
        },
      ]}
    >
      <Pressable
        onPress={() => navigation.navigate('Cart')}
        style={({ pressed }) => [styles.container, pressed && styles.pressed]}
      >
        <View style={styles.previewGroup}>
          {previewImages.map((item, index) => (
            <View
              key={item._id || item.id}
              style={[
                styles.previewCircle,
                {
                  marginLeft: index === 0 ? 0 : -10,
                  zIndex: previewImages.length - index,
                },
              ]}
            >
              {item.image ? (
                <Image
                  source={{ uri: `${BASE_URL}${item.image}` }}
                  style={styles.previewImage}
                  resizeMode="cover"
                />
              ) : (
                <Text style={styles.previewEmoji}>🍽️</Text>
              )}
            </View>
          ))}
        </View>

        <View style={styles.content}>
          <Text style={styles.title}>
            {cartCount} {cartCount === 1 ? 'item' : 'items'} added
          </Text>
          <Text style={styles.subtitle}>
            ₹{cartTotal.toFixed(0)} • View cart
          </Text>
        </View>

        <View style={styles.arrow}>
          <Ionicons name="arrow-forward" size={19} color="#ff5a1f" />
        </View>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    left: 15,
    right: 15,
    zIndex: 100,
  },
  container: {
    minHeight: 65,
    paddingHorizontal: 13,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 22,
    backgroundColor: '#ff5f00',
    shadowColor: '#171717',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.28,
    shadowRadius: 20,
    elevation: 14,
  },
  pressed: {
    opacity: 0.94,
    transform: [{ scale: 0.99 }],
  },
  previewGroup: {
    minWidth: 58,
    flexDirection: 'row',
    alignItems: 'center',
  },
  previewCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#171717',
    backgroundColor: '#fff2eb',
  },
  previewEmoji: {
    fontSize: 18,
  },
  content: {
    flex: 1,
    marginLeft: 9,
  },
  title: {
    color: '#ffffff',
    fontSize: 12.5,
    fontWeight: '900',
  },
  subtitle: {
    marginTop: 4,
    color: 'rgba(255,255,255,0.62)',
    fontSize: 9.5,
    fontWeight: '600',
  },
  arrow: {
    width: 38,
    height: 38,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff',
  },
  previewImage: {
    width: 36,
    height: 36,
    borderRadius: 18,
  },
});
