import React, { useEffect, useMemo, useRef, useState } from 'react';

import {
  Animated,
  Easing,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import Ionicons from '@react-native-vector-icons/ionicons';
import {
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';

import ScreenHeader from '../../components/ScreenHeader';
import { useAppUI } from '../../context/AppUIContext';

const COLORS = {
  primary: '#ff5a1f',
  primaryDark: '#e9470d',
  background: '#fff',
  white: '#ffffff',
  title: '#171717',
  text: '#4b4542',
  muted: '#8f8f98',
  border: '#eee5df',
  soft: '#fff0e9',
  success: '#15803d',
  successSoft: '#ecfdf3',
  danger: '#dc2626',
  dangerSoft: '#fff1f2',
  warning: '#f59e0b',
};

const INITIAL_FAVOURITES = [
  {
    id: 'butter-chicken',
    emoji: '🍛',
    name: 'Butter Chicken',
    restaurant: 'Punjab Tadka',
    description: 'Creamy tomato gravy with tender chicken',
    price: 289,
    originalPrice: 349,
    rating: '4.7',
    deliveryTime: '25–30 min',
    type: 'nonveg',
    offer: '20% OFF',
  },
  {
    id: 'paneer-tikka',
    emoji: '🥘',
    name: 'Paneer Tikka',
    restaurant: 'Desi Junction',
    description: 'Smoky paneer cubes with mint chutney',
    price: 229,
    originalPrice: 279,
    rating: '4.6',
    deliveryTime: '20–25 min',
    type: 'veg',
    offer: '15% OFF',
  },
  {
    id: 'biryani',
    emoji: '🍚',
    name: 'Hyderabadi Biryani',
    restaurant: 'Biryani House',
    description: 'Aromatic basmati rice with rich spices',
    price: 249,
    originalPrice: 319,
    rating: '4.8',
    deliveryTime: '30–35 min',
    type: 'nonveg',
    offer: '₹70 OFF',
  },
];

export default function FavouritesScreen({ navigation }) {
  const insets = useSafeAreaInsets();

  const { addToCart, cartItems, decreaseCartItem, removeFromCart } = useAppUI();

  const [favourites, setFavourites] = useState(INITIAL_FAVOURITES);
  const [toast, setToast] = useState({
    visible: false,
    title: '',
    message: '',
    type: 'success',
  });

  const toastTranslateY = useRef(new Animated.Value(-120)).current;
  const toastOpacity = useRef(new Animated.Value(0)).current;
  const toastTimer = useRef(null);

  useEffect(() => {
    return () => {
      if (toastTimer.current) {
        clearTimeout(toastTimer.current);
      }
    };
  }, []);

  const totalCartCount = useMemo(
    () =>
      cartItems.reduce((total, item) => total + Number(item.quantity || 0), 0),
    [cartItems],
  );

  const getQuantity = itemId => {
    const cartItem = cartItems.find(item => item.id === itemId);

    return cartItem?.quantity || 0;
  };

  const showToast = ({ title, message, type = 'success' }) => {
    if (toastTimer.current) {
      clearTimeout(toastTimer.current);
    }

    setToast({
      visible: true,
      title,
      message,
      type,
    });

    toastTranslateY.setValue(-120);
    toastOpacity.setValue(0);

    Animated.parallel([
      Animated.spring(toastTranslateY, {
        toValue: 0,
        damping: 12,
        stiffness: 155,
        mass: 0.8,
        useNativeDriver: true,
      }),

      Animated.timing(toastOpacity, {
        toValue: 1,
        duration: 220,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
    ]).start();

    toastTimer.current = setTimeout(() => {
      hideToast();
    }, 2500);
  };

  const hideToast = () => {
    if (toastTimer.current) {
      clearTimeout(toastTimer.current);
      toastTimer.current = null;
    }

    Animated.parallel([
      Animated.timing(toastTranslateY, {
        toValue: -120,
        duration: 220,
        easing: Easing.in(Easing.cubic),
        useNativeDriver: true,
      }),

      Animated.timing(toastOpacity, {
        toValue: 0,
        duration: 180,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setToast(current => ({
        ...current,
        visible: false,
      }));
    });
  };

  const handleAdd = item => {
    const previousQuantity = getQuantity(item.id);

    addToCart(item);

    showToast({
      title: previousQuantity > 0 ? 'Quantity updated' : 'Added to cart',
      message: `${item.name} cart mein add ho gaya.`,
      type: 'success',
    });
  };

  const handleDecrease = item => {
    const currentQuantity = getQuantity(item.id);

    if (currentQuantity <= 1) {
      removeFromCart(item.id);

      showToast({
        title: 'Removed from cart',
        message: `${item.name} cart se remove ho gaya.`,
        type: 'danger',
      });

      return;
    }

    decreaseCartItem(item.id);

    showToast({
      title: 'Quantity updated',
      message: `${item.name} ki quantity kam ho gayi.`,
      type: 'info',
    });
  };

  const removeFavourite = item => {
    setFavourites(current =>
      current.filter(favourite => favourite.id !== item.id),
    );

    showToast({
      title: 'Removed from favourites',
      message: `${item.name} favourites se hata diya gaya.`,
      type: 'danger',
    });
  };

  const handleClearFavourites = () => {
    setFavourites([]);

    showToast({
      title: 'Favourites cleared',
      message: 'Sabhi favourite items remove ho gaye.',
      type: 'danger',
    });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />

      <ScreenHeader
        navigation={navigation}
        title="Favourites"
        subtitle="Aapke favourite dishes aur restaurants"
        rightIcon={favourites.length ? 'trash-outline' : undefined}
        onRightPress={handleClearFavourites}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        <View style={styles.summaryCard}>
          <View style={styles.summaryGlowOne} />
          <View style={styles.summaryGlowTwo} />

          <View style={styles.summaryIcon}>
            <Ionicons name="heart" size={24} color={COLORS.white} />
          </View>

          <View style={styles.summaryContent}>
            <Text style={styles.summaryEyebrow}>YOUR COLLECTION</Text>

            <Text style={styles.summaryTitle}>
              {favourites.length} favourite{' '}
              {favourites.length === 1 ? 'dish' : 'dishes'}
            </Text>

            <Text style={styles.summarySubtitle}>
              Pasandida food ek tap mein cart mein add karein
            </Text>
          </View>

          <View style={styles.cartCountBadge}>
            <Ionicons name="cart-outline" size={17} color={COLORS.primary} />

            <Text style={styles.cartCountText}>{totalCartCount}</Text>
          </View>
        </View>

        <View style={styles.sectionHeader}>
          <View>
            <Text style={styles.sectionTitle}>Saved dishes</Text>

            <Text style={styles.sectionSubtitle}>
              Add, remove aur quantity manage karein
            </Text>
          </View>

          {favourites.length ? (
            <View style={styles.liveBadge}>
              <View style={styles.liveDot} />
              <Text style={styles.liveText}>AVAILABLE</Text>
            </View>
          ) : null}
        </View>

        {favourites.length === 0 ? (
          <View style={styles.emptyState}>
            <View style={styles.emptyIcon}>
              <Ionicons name="heart-outline" size={38} color={COLORS.primary} />
            </View>

            <Text style={styles.emptyTitle}>No favourites yet</Text>

            <Text style={styles.emptyText}>
              Restaurants aur dishes par heart press karke unhe yahan save
              karein.
            </Text>

            <Pressable
              onPress={() => navigation.navigate('Home')}
              style={({ pressed }) => [
                styles.exploreButton,
                pressed && styles.pressed,
              ]}
            >
              <Text style={styles.exploreButtonText}>Explore food</Text>

              <Ionicons name="arrow-forward" size={18} color={COLORS.white} />
            </Pressable>
          </View>
        ) : (
          favourites.map(item => {
            const quantity = getQuantity(item.id);

            return (
              <View key={item.id} style={styles.card}>
                <View style={styles.foodImage}>
                  <View style={styles.offerBadge}>
                    <Text style={styles.offerText}>{item.offer}</Text>
                  </View>

                  <Text style={styles.emoji}>{item.emoji}</Text>

                  <Pressable
                    onPress={() => removeFavourite(item)}
                    style={({ pressed }) => [
                      styles.heartButton,
                      pressed && styles.heartButtonPressed,
                    ]}
                  >
                    <Ionicons name="heart" size={17} color={COLORS.danger} />
                  </Pressable>
                </View>

                <View style={styles.info}>
                  <View style={styles.titleRow}>
                    <View
                      style={[
                        styles.foodType,
                        item.type === 'veg'
                          ? styles.vegBorder
                          : styles.nonVegBorder,
                      ]}
                    >
                      <View
                        style={[
                          styles.foodTypeDot,
                          item.type === 'veg'
                            ? styles.vegDot
                            : styles.nonVegDot,
                        ]}
                      />
                    </View>

                    <Text style={styles.name} numberOfLines={1}>
                      {item.name}
                    </Text>
                  </View>

                  <View style={styles.restaurantRow}>
                    <Ionicons
                      name="restaurant-outline"
                      size={12}
                      color={COLORS.muted}
                    />

                    <Text style={styles.restaurant} numberOfLines={1}>
                      {item.restaurant}
                    </Text>
                  </View>

                  <Text style={styles.description} numberOfLines={2}>
                    {item.description}
                  </Text>

                  <View style={styles.meta}>
                    <View style={styles.ratingBadge}>
                      <Ionicons name="star" size={11} color={COLORS.white} />

                      <Text style={styles.rating}>{item.rating}</Text>
                    </View>

                    <View style={styles.metaDivider} />

                    <Ionicons
                      name="time-outline"
                      size={12}
                      color={COLORS.muted}
                    />

                    <Text style={styles.deliveryTime}>{item.deliveryTime}</Text>
                  </View>

                  <View style={styles.bottomRow}>
                    <View style={styles.priceWrapper}>
                      <Text style={styles.price}>₹{item.price}</Text>

                      <Text style={styles.originalPrice}>
                        ₹{item.originalPrice}
                      </Text>
                    </View>

                    {quantity === 0 ? (
                      <Pressable
                        onPress={() => handleAdd(item)}
                        style={({ pressed }) => [
                          styles.addButton,
                          pressed && styles.addButtonPressed,
                        ]}
                      >
                        <Text style={styles.addButtonText}>ADD</Text>

                        <Ionicons name="add" size={17} color={COLORS.primary} />
                      </Pressable>
                    ) : (
                      <View style={styles.quantityContainer}>
                        <Pressable
                          onPress={() => handleDecrease(item)}
                          style={({ pressed }) => [
                            styles.quantityButton,
                            pressed && styles.quantityPressed,
                          ]}
                        >
                          <Ionicons
                            name="remove"
                            size={17}
                            color={COLORS.primary}
                          />
                        </Pressable>

                        <View style={styles.quantityValue}>
                          <Text style={styles.quantityText}>{quantity}</Text>
                        </View>

                        <Pressable
                          onPress={() => handleAdd(item)}
                          style={({ pressed }) => [
                            styles.quantityButton,
                            pressed && styles.quantityPressed,
                          ]}
                        >
                          <Ionicons
                            name="add"
                            size={17}
                            color={COLORS.primary}
                          />
                        </Pressable>
                      </View>
                    )}
                  </View>
                </View>
              </View>
            );
          })
        )}
      </ScrollView>

      {toast.visible ? (
        <Animated.View
          style={[
            styles.toastWrapper,
            {
              top: insets.top + 10,
              opacity: toastOpacity,
              transform: [
                {
                  translateY: toastTranslateY,
                },
              ],
            },
          ]}
        >
          <View
            style={[
              styles.toast,
              toast.type === 'danger' && styles.toastDanger,
              toast.type === 'info' && styles.toastInfo,
            ]}
          >
            <View
              style={[
                styles.toastIcon,
                toast.type === 'danger' && styles.toastIconDanger,
                toast.type === 'info' && styles.toastIconInfo,
              ]}
            >
              <Ionicons
                name={
                  toast.type === 'danger'
                    ? 'trash-outline'
                    : toast.type === 'info'
                    ? 'information-circle-outline'
                    : 'checkmark-circle-outline'
                }
                size={21}
                color={
                  toast.type === 'danger'
                    ? COLORS.danger
                    : toast.type === 'info'
                    ? '#2563eb'
                    : COLORS.success
                }
              />
            </View>

            <View style={styles.toastContent}>
              <Text style={styles.toastTitle}>{toast.title}</Text>

              <Text style={styles.toastMessage} numberOfLines={2}>
                {toast.message}
              </Text>
            </View>

            <Pressable
              onPress={hideToast}
              hitSlop={10}
              style={({ pressed }) => [
                styles.toastClose,
                pressed && styles.toastClosePressed,
              ]}
            >
              <Ionicons name="close" size={19} color={COLORS.text} />
            </Pressable>
          </View>
        </Animated.View>
      ) : null}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  content: {
    paddingHorizontal: 18,
    paddingTop: 12,
    paddingBottom: 160,
  },

  summaryCard: {
    minHeight: 112,
    padding: 17,
    overflow: 'hidden',
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 27,
    backgroundColor: COLORS.title,

    shadowColor: COLORS.title,
    shadowOffset: {
      width: 0,
      height: 12,
    },
    shadowOpacity: 0.18,
    shadowRadius: 20,
    elevation: 7,
  },

  summaryGlowOne: {
    position: 'absolute',
    top: -65,
    right: -30,
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: 'rgba(255,90,31,0.32)',
  },

  summaryGlowTwo: {
    position: 'absolute',
    left: -65,
    bottom: -90,
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },

  summaryIcon: {
    width: 54,
    height: 54,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
  },

  summaryContent: {
    flex: 1,
    marginLeft: 13,
  },

  summaryEyebrow: {
    color: COLORS.primary,
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 1,
  },

  summaryTitle: {
    marginTop: 5,
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '900',
  },

  summarySubtitle: {
    marginTop: 5,
    color: 'rgba(255,255,255,0.58)',
    fontSize: 8.5,
    lineHeight: 13,
  },

  cartCountBadge: {
    minWidth: 45,
    height: 45,
    paddingHorizontal: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 15,
    backgroundColor: COLORS.white,
  },

  cartCountText: {
    marginLeft: 4,
    color: COLORS.primary,
    fontSize: 12,
    fontWeight: '900',
  },

  sectionHeader: {
    marginTop: 25,
    marginBottom: 13,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  sectionTitle: {
    color: COLORS.title,
    fontSize: 17,
    fontWeight: '900',
  },

  sectionSubtitle: {
    marginTop: 4,
    color: COLORS.muted,
    fontSize: 9,
  },

  liveBadge: {
    paddingHorizontal: 9,
    paddingVertical: 6,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 10,
    backgroundColor: COLORS.successSoft,
  },

  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.success,
  },

  liveText: {
    marginLeft: 5,
    color: COLORS.success,
    fontSize: 7.5,
    fontWeight: '900',
  },

  card: {
    minHeight: 152,
    marginBottom: 14,
    padding: 12,
    flexDirection: 'row',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.white,

    shadowColor: '#7c2d12',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.05,
    shadowRadius: 14,
    elevation: 3,
  },

  foodImage: {
    position: 'relative',
    width: 108,
    minHeight: 128,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 21,
    backgroundColor: COLORS.soft,
  },

  emoji: {
    fontSize: 51,
  },

  offerBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    zIndex: 2,
    paddingHorizontal: 7,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: COLORS.primary,
  },

  offerText: {
    color: COLORS.white,
    fontSize: 7,
    fontWeight: '900',
  },

  heartButton: {
    position: 'absolute',
    right: 8,
    bottom: 8,
    width: 34,
    height: 34,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    backgroundColor: COLORS.white,

    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
  },

  heartButtonPressed: {
    opacity: 0.75,
    transform: [{ scale: 0.92 }],
  },

  info: {
    flex: 1,
    marginLeft: 12,
  },

  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  foodType: {
    width: 15,
    height: 15,
    marginRight: 7,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.4,
  },

  vegBorder: {
    borderColor: COLORS.success,
  },

  nonVegBorder: {
    borderColor: '#b91c1c',
  },

  foodTypeDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },

  vegDot: {
    backgroundColor: COLORS.success,
  },

  nonVegDot: {
    backgroundColor: '#b91c1c',
  },

  name: {
    flex: 1,
    color: COLORS.title,
    fontSize: 13,
    fontWeight: '900',
  },

  restaurantRow: {
    marginTop: 7,
    flexDirection: 'row',
    alignItems: 'center',
  },

  restaurant: {
    flex: 1,
    marginLeft: 5,
    color: COLORS.muted,
    fontSize: 9,
    fontWeight: '600',
  },

  description: {
    marginTop: 7,
    color: '#827a76',
    fontSize: 8.5,
    lineHeight: 13,
  },

  meta: {
    marginTop: 9,
    flexDirection: 'row',
    alignItems: 'center',
  },

  ratingBadge: {
    paddingHorizontal: 6,
    paddingVertical: 4,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 7,
    backgroundColor: COLORS.success,
  },

  rating: {
    marginLeft: 3,
    color: COLORS.white,
    fontSize: 7.5,
    fontWeight: '900',
  },

  metaDivider: {
    width: 3,
    height: 3,
    marginHorizontal: 7,
    borderRadius: 2,
    backgroundColor: '#d2cbc6',
  },

  deliveryTime: {
    marginLeft: 4,
    color: COLORS.muted,
    fontSize: 8,
    fontWeight: '700',
  },

  bottomRow: {
    marginTop: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  priceWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  price: {
    color: COLORS.title,
    fontSize: 12,
    fontWeight: '900',
  },

  originalPrice: {
    marginLeft: 6,
    color: COLORS.muted,
    fontSize: 8.5,
    textDecorationLine: 'line-through',
  },

  addButton: {
    minWidth: 68,
    height: 37,
    paddingHorizontal: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    borderWidth: 1.3,
    borderColor: '#ffb99c',
    backgroundColor: '#fff7f2',
  },

  addButtonPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.95 }],
  },

  addButtonText: {
    marginRight: 3,
    color: COLORS.primary,
    fontSize: 9.5,
    fontWeight: '900',
  },

  quantityContainer: {
    height: 37,
    flexDirection: 'row',
    alignItems: 'center',
    overflow: 'hidden',
    borderRadius: 12,
    borderWidth: 1.3,
    borderColor: '#ffb99c',
    backgroundColor: '#fff7f2',
  },

  quantityButton: {
    width: 34,
    height: 35,
    alignItems: 'center',
    justifyContent: 'center',
  },

  quantityPressed: {
    backgroundColor: '#ffe6da',
  },

  quantityValue: {
    minWidth: 27,
    height: 35,
    alignItems: 'center',
    justifyContent: 'center',
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: '#ffd7c5',
  },

  quantityText: {
    color: COLORS.primary,
    fontSize: 10,
    fontWeight: '900',
  },

  emptyState: {
    marginTop: 20,
    paddingVertical: 70,
    alignItems: 'center',
    borderRadius: 27,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.white,
  },

  emptyIcon: {
    width: 82,
    height: 82,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.soft,
  },

  emptyTitle: {
    marginTop: 18,
    color: COLORS.title,
    fontSize: 17,
    fontWeight: '900',
  },

  emptyText: {
    maxWidth: 270,
    marginTop: 8,
    color: COLORS.muted,
    fontSize: 10,
    lineHeight: 16,
    textAlign: 'center',
  },

  exploreButton: {
    height: 50,
    marginTop: 20,
    paddingHorizontal: 18,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    backgroundColor: COLORS.primary,
  },

  exploreButtonText: {
    marginRight: 9,
    color: COLORS.white,
    fontSize: 11,
    fontWeight: '900',
  },

  toastWrapper: {
    position: 'absolute',
    left: 15,
    right: 15,
    zIndex: 999,
    elevation: 30,
  },

  toast: {
    minHeight: 72,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#bbf7d0',
    backgroundColor: COLORS.white,

    shadowColor: '#171717',
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.18,
    shadowRadius: 18,
    elevation: 15,
  },

  toastDanger: {
    borderColor: '#fecaca',
  },

  toastInfo: {
    borderColor: '#bfdbfe',
  },

  toastIcon: {
    width: 43,
    height: 43,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.successSoft,
  },

  toastIconDanger: {
    backgroundColor: COLORS.dangerSoft,
  },

  toastIconInfo: {
    backgroundColor: '#eff6ff',
  },

  toastContent: {
    flex: 1,
    marginLeft: 11,
  },

  toastTitle: {
    color: COLORS.title,
    fontSize: 11.5,
    fontWeight: '900',
  },

  toastMessage: {
    marginTop: 4,
    color: COLORS.muted,
    fontSize: 8.5,
    lineHeight: 13,
  },

  toastClose: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f7f4f2',
  },

  toastClosePressed: {
    opacity: 0.7,
    transform: [{ scale: 0.94 }],
  },

  pressed: {
    opacity: 0.8,
    transform: [{ scale: 0.97 }],
  },
});
