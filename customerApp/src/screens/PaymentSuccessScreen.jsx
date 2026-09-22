import React, { useEffect, useMemo, useRef, useState } from 'react';

import {
  Animated,
  Easing,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import Ionicons from '@react-native-vector-icons/ionicons';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAppUI } from '../context/AppUIContext';

export default function PaymentSuccessScreen({ navigation, route }) {
  const { clearCart } = useAppUI();

  // ─── Get real order data from route ──────────────────────
  const order = route.params?.order;
  const amount = route.params?.amount || 0;
  const paymentMethod = route.params?.paymentMethod;

  const [completed, setCompleted] = useState(false);

  const rotateValue = useRef(new Animated.Value(0)).current;
  const loaderOpacity = useRef(new Animated.Value(1)).current;
  const tickScale = useRef(new Animated.Value(0)).current;
  const contentOpacity = useRef(new Animated.Value(0)).current;

  // Use real order number if available, otherwise generate fallback
  const orderId =
    order?.orderNumber || order?._id || `KJ${Date.now().toString().slice(-8)}`;

  // ─── If no order data, something went wrong ─────────────
  if (!order) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          <Text style={styles.title}>Something went wrong</Text>
          <Text style={styles.subtitle}>Order details not found.</Text>
        </View>
      </SafeAreaView>
    );
  }

  useEffect(() => {
    const rotation = Animated.loop(
      Animated.timing(rotateValue, {
        toValue: 1,
        duration: 850,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    );

    rotation.start();

    const processingTimer = setTimeout(
      () => {
        rotation.stop();

        Animated.sequence([
          Animated.timing(loaderOpacity, {
            toValue: 0,
            duration: 180,
            useNativeDriver: true,
          }),
          Animated.spring(tickScale, {
            toValue: 1,
            damping: 8,
            stiffness: 180,
            mass: 0.7,
            useNativeDriver: true,
          }),
          Animated.timing(contentOpacity, {
            toValue: 1,
            duration: 350,
            useNativeDriver: true,
          }),
        ]).start(() => {
          setCompleted(true);
          // ─── Clear cart only if this was a cart order ────
          // The cart is cleared in PaymentMethodScreen after API success.
          // We'll clear it here just in case.
          clearCart?.();
        });
      },
      paymentMethod?.type === 'cod' ? 1100 : 2200,
    );

    const navigationTimer = setTimeout(
      () => {
        // ─── Navigate to TrackOrder with the real order ───
        navigation.reset({
          index: 0,
          routes: [
            {
              name: 'MainTabs',
              params: {
                screen: 'TrackOrder',
                params: {
                  order: order,
                },
              },
            },
          ],
        });
      },
      paymentMethod?.type === 'cod' ? 3600 : 4700,
    );

    return () => {
      rotation.stop();
      clearTimeout(processingTimer);
      clearTimeout(navigationTimer);
    };
  }, []);

  const spin = rotateValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const isCod = paymentMethod?.type === 'cod';

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#fffaf7" />

      <View style={styles.container}>
        <View style={styles.animationArea}>
          <Animated.View
            style={[
              styles.loader,
              {
                opacity: loaderOpacity,
                transform: [{ rotate: spin }],
              },
            ]}
          >
            <View style={styles.loaderGap} />
          </Animated.View>

          <Animated.View
            style={[
              styles.successCircle,
              {
                transform: [{ scale: tickScale }],
              },
            ]}
          >
            <Ionicons name="checkmark" size={48} color="#ffffff" />
          </Animated.View>
        </View>

        <Animated.View style={{ opacity: contentOpacity }}>
          <Text style={styles.title}>
            {isCod ? 'Order confirmed' : 'Payment successful'}
          </Text>

          <Text style={styles.subtitle}>
            {isCod
              ? 'Cash on delivery order successfully place ho gaya.'
              : `${
                  paymentMethod?.title || 'Selected method'
                } se ₹${amount.toFixed(0)} payment complete ho gaya.`}
          </Text>

          <View style={styles.orderCard}>
            <View style={styles.orderRow}>
              <Text style={styles.orderLabel}>Order ID</Text>
              <Text style={styles.orderValue}>{orderId}</Text>
            </View>

            <View style={styles.divider} />

            <View style={styles.orderRow}>
              <Text style={styles.orderLabel}>Status</Text>

              <View style={styles.statusBadge}>
                <View style={styles.statusDot} />
                <Text style={styles.statusText}>Confirmed</Text>
              </View>
            </View>
          </View>

          <Text style={styles.redirectText}>
            {completed
              ? 'Taking you to the tracking screen...'
              : 'Confirming your order...'}
          </Text>
        </Animated.View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fffaf7',
  },
  container: {
    flex: 1,
    paddingHorizontal: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  animationArea: {
    width: 130,
    height: 130,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loader: {
    position: 'absolute',
    width: 104,
    height: 104,
    borderRadius: 52,
    borderWidth: 9,
    borderColor: '#ffd6c4',
    borderTopColor: '#ff5a1f',
    borderRightColor: '#ff5a1f',
  },
  loaderGap: {
    width: 1,
    height: 1,
  },
  successCircle: {
    position: 'absolute',
    width: 104,
    height: 104,
    borderRadius: 52,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#16a34a',
    shadowColor: '#16a34a',
    shadowOffset: {
      width: 0,
      height: 12,
    },
    shadowOpacity: 0.24,
    shadowRadius: 18,
    elevation: 10,
  },
  title: {
    marginTop: 22,
    color: '#171717',
    fontSize: 24,
    fontWeight: '900',
    textAlign: 'center',
  },
  subtitle: {
    maxWidth: 310,
    marginTop: 10,
    color: '#8f8f98',
    fontSize: 11,
    lineHeight: 18,
    textAlign: 'center',
  },
  orderCard: {
    width: '100%',
    minWidth: 310,
    marginTop: 28,
    padding: 16,
    borderRadius: 21,
    borderWidth: 1,
    borderColor: '#eee5df',
    backgroundColor: '#ffffff',
  },
  orderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  orderLabel: {
    color: '#8f8f98',
    fontSize: 9,
    fontWeight: '700',
  },
  orderValue: {
    color: '#171717',
    fontSize: 10,
    fontWeight: '900',
  },
  divider: {
    height: 1,
    marginVertical: 14,
    backgroundColor: '#eee5df',
  },
  statusBadge: {
    paddingHorizontal: 9,
    paddingVertical: 6,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 10,
    backgroundColor: '#ecfdf3',
  },
  statusDot: {
    width: 7,
    height: 7,
    marginRight: 5,
    borderRadius: 4,
    backgroundColor: '#16a34a',
  },
  statusText: {
    color: '#15803d',
    fontSize: 8,
    fontWeight: '900',
  },
  redirectText: {
    marginTop: 18,
    color: '#a8a29e',
    fontSize: 8.5,
    textAlign: 'center',
  },
});
