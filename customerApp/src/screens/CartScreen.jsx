// screens/CartScreen.js
import React, { useState, useEffect } from 'react';
import {
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Image,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from '@react-native-vector-icons/ionicons';
import { useFocusEffect } from '@react-navigation/native';
import ScreenHeader from '../components/ScreenHeader';
import { useAppUI } from '../context/AppUIContext';

const BASE_URL = 'https://myfoodmitra-ecosystem.onrender.com';
const COLORS = {
  primary: '#FF5A1F',
  primaryLight: '#FF8A5C',
  primaryDark: '#E04A1A',
  background: '#F8F9FC',
  white: '#FFFFFF',
  title: '#1A1A2E',
  text: '#2D2D3F',
  muted: '#8E8EA0',
  border: '#EAEAEF',
  soft: '#FFF0EA',
  success: '#22C55E',
  shadow: 'rgba(0,0,0,0.08)',
  cardBg: '#FFFFFF',
};

const buildImageUrl = path => {
  if (!path) return null;
  if (path.startsWith('http')) return path;
  const clean = path.startsWith('/') ? path : `/${path}`;
  return `${BASE_URL}${clean}`;
};

export default function CartScreen({ navigation, route }) {
  const { addToCart, cartItems, cartTotal, clearCart, decreaseCartItem } =
    useAppUI();

  const [selectedAddress, setSelectedAddress] = useState(null);

  useEffect(() => {
    if (route.params?.selectedAddress) {
      setSelectedAddress(route.params.selectedAddress);
      navigation.setParams({ selectedAddress: undefined });
    }
  }, [route.params?.selectedAddress]);

  useFocusEffect(
    React.useCallback(() => {
      if (route.params?.selectedAddress) {
        setSelectedAddress(route.params.selectedAddress);
        navigation.setParams({ selectedAddress: undefined });
      }
    }, [route.params?.selectedAddress]),
  );

  const deliveryFee = cartItems.length ? 1 : 0;
  const platformFee = cartItems.length ? 1 : 0;
  const grandTotal = cartTotal + deliveryFee + platformFee;

  const openAddressSelection = () => {
    navigation.navigate('SelectAddress', { selectMode: true });
  };

  const handleCheckout = () => {
    if (!cartItems.length) {
      Alert.alert('Cart Empty', 'Please add items to your cart.');
      return;
    }
    if (!selectedAddress) {
      Alert.alert('Address Required', 'Please select a delivery address.');
      return;
    }
    navigation.navigate('OrderSummary', {
      items: cartItems,
      deliveryAddress: selectedAddress,
      directOrder: false,
      vendorId: cartItems[0]?.vendorId,
    });
  };

  const handleItemPress = item => {
    navigation.navigate('ItemDetail', {
      item,
      vendorId: item.vendorId || cartItems[0]?.vendorId,
    });
  };

  const renderItem = (item, index) => {
    const imageUrl = buildImageUrl(item.image);
    return (
      <TouchableOpacity
        key={item.id || index}
        style={styles.itemRow}
        activeOpacity={0.7}
        onPress={() => handleItemPress(item)}
      >
        <View style={styles.itemImageWrapper}>
          {imageUrl ? (
            <Image
              source={{ uri: imageUrl }}
              style={styles.itemImage}
              resizeMode="cover"
            />
          ) : (
            <View style={styles.emojiPlaceholder}>
              <Text style={styles.emoji}>🍽️</Text>
            </View>
          )}
        </View>
        <View style={styles.itemDetails}>
          <Text style={styles.itemName} numberOfLines={1}>
            {item.name}
          </Text>
          <Text style={styles.itemRestaurant} numberOfLines={1}>
            {item.vendorName || item.restaurant || 'Restaurant'}
          </Text>
          <Text style={styles.itemPrice}>₹{item.price}</Text>
        </View>
        <View style={styles.counter}>
          <Pressable
            onPress={() => decreaseCartItem(item.id)}
            style={styles.counterButton}
          >
            <Ionicons name="remove" size={16} color={COLORS.primary} />
          </Pressable>
          <Text style={styles.quantity}>{item.quantity}</Text>
          <Pressable
            onPress={() => addToCart(item)}
            style={styles.counterButton}
          >
            <Ionicons name="add" size={16} color={COLORS.primary} />
          </Pressable>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />

      <ScreenHeader
        navigation={navigation}
        title="Your Cart"
        subtitle={`${cartItems.length} items`}
        rightIcon={cartItems.length ? 'trash-outline' : undefined}
        onRightPress={clearCart}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {!cartItems.length ? (
          <View style={styles.empty}>
            <View style={styles.emptyIcon}>
              <Ionicons name="cart-outline" size={40} color={COLORS.primary} />
            </View>
            <Text style={styles.emptyTitle}>Cart is empty</Text>
            <Text style={styles.emptyText}>
              Add your favourite dishes from restaurants near you.
            </Text>
          </View>
        ) : (
          <>
            {/* Restaurant Summary */}
            <View style={styles.restaurantCard}>
              <View style={styles.restaurantIcon}>
                <Ionicons name="restaurant" size={22} color="#fff" />
              </View>
              <View style={styles.restaurantInfo}>
                <Text style={styles.restaurantName}>Your Order</Text>
                <Text style={styles.restaurantMeta}>
                  {cartItems.length} items · Est. 30–35 min
                </Text>
              </View>
              <View style={styles.restaurantBadge}>
                <Text style={styles.restaurantBadgeText}>
                  ₹{cartTotal.toFixed(0)}
                </Text>
              </View>
            </View>

            {/* Items List */}
            <View style={styles.itemsCard}>
              {cartItems.map((item, index) => (
                <React.Fragment key={item.id || index}>
                  {renderItem(item, index)}
                  {index < cartItems.length - 1 && (
                    <View style={styles.divider} />
                  )}
                </React.Fragment>
              ))}
            </View>

            {/* Bill Details */}
            <View style={styles.billCard}>
              <Text style={styles.billTitle}>Bill Summary</Text>
              <BillRow label="Item Total" value={`₹${cartTotal.toFixed(0)}`} />
              <BillRow label="Delivery Fee" value={`₹${deliveryFee}`} />
              <BillRow label="Platform Fee" value={`₹${platformFee}`} />
              <View style={styles.billDivider} />
              <BillRow label="Total" value={`₹${grandTotal.toFixed(0)}`} bold />
            </View>

            {/* Address Selection */}
            <View style={styles.addressSection}>
              <View style={styles.sectionLabel}>
                <Ionicons
                  name="location-outline"
                  size={18}
                  color={COLORS.primary}
                />
                <Text style={styles.sectionTitle}>Delivery Address</Text>
              </View>

              <TouchableOpacity
                style={[
                  styles.addressCard,
                  selectedAddress && styles.addressCardSelected,
                ]}
                activeOpacity={0.8}
                onPress={openAddressSelection}
              >
                <View style={styles.addressIcon}>
                  <Ionicons name="location" size={22} color={COLORS.primary} />
                </View>
                <View style={styles.addressContent}>
                  {selectedAddress ? (
                    <>
                      <Text style={styles.addressLabel}>
                        {selectedAddress.label || 'Home'}
                      </Text>
                      <Text style={styles.addressText} numberOfLines={2}>
                        {selectedAddress.addressLine}, {selectedAddress.city},{' '}
                        {selectedAddress.state} - {selectedAddress.pincode}
                      </Text>
                    </>
                  ) : (
                    <>
                      <Text style={styles.addressLabel}>
                        Add delivery address
                      </Text>
                      <Text style={styles.addressHint}>Tap to select</Text>
                    </>
                  )}
                </View>
                <Ionicons
                  name="chevron-forward"
                  size={20}
                  color={COLORS.muted}
                />
              </TouchableOpacity>
            </View>
          </>
        )}
        {/* Extra bottom padding for fixed button */}
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Fixed Checkout Button */}
      {cartItems.length > 0 && (
        <View style={styles.footer}>
          <TouchableOpacity
            style={[
              styles.checkoutButton,
              !selectedAddress && styles.checkoutButtonDisabled,
            ]}
            onPress={handleCheckout}
            disabled={!selectedAddress}
          >
            <View style={styles.checkoutLeft}>
              <Text style={styles.checkoutLabel}>Total Amount</Text>
              <Text style={styles.checkoutPrice}>₹{grandTotal.toFixed(0)}</Text>
            </View>
            <View style={styles.checkoutRight}>
              <Text style={styles.checkoutText}>
                {selectedAddress ? 'Proceed to Pay' : 'Select Address'}
              </Text>
              <Ionicons name="arrow-forward" size={20} color="#fff" />
            </View>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}

// ─── Helper ──────────────────────────────────────────────────
function BillRow({ label, value, bold }) {
  return (
    <View style={styles.billRow}>
      <Text style={[styles.billLabel, bold && styles.billBold]}>{label}</Text>
      <Text style={[styles.billValue, bold && styles.billBold]}>{value}</Text>
    </View>
  );
}

// ─── Styles ──────────────────────────────────────────────────
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 40,
  },
  empty: {
    paddingTop: 80,
    alignItems: 'center',
  },
  emptyIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.soft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyTitle: {
    marginTop: 20,
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.title,
  },
  emptyText: {
    maxWidth: 260,
    marginTop: 8,
    fontSize: 14,
    color: COLORS.muted,
    textAlign: 'center',
    lineHeight: 20,
  },
  restaurantCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.title,
    borderRadius: 20,
    padding: 14,
    marginBottom: 16,
    shadowColor: COLORS.title,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 6,
  },
  restaurantIcon: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  restaurantInfo: {
    flex: 1,
    marginLeft: 12,
  },
  restaurantName: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '800',
  },
  restaurantMeta: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 12,
    marginTop: 2,
  },
  restaurantBadge: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  restaurantBadgeText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },
  itemsCard: {
    backgroundColor: COLORS.white,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 4,
    marginBottom: 20,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
  },
  itemImageWrapper: {
    width: 56,
    height: 56,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: COLORS.soft,
  },
  itemImage: {
    width: '100%',
    height: '100%',
  },
  emojiPlaceholder: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emoji: {
    fontSize: 28,
  },
  itemDetails: {
    flex: 1,
    marginLeft: 12,
  },
  itemName: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.title,
  },
  itemRestaurant: {
    fontSize: 11,
    color: COLORS.muted,
    marginTop: 2,
  },
  itemPrice: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.primary,
    marginTop: 4,
  },
  counter: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 14,
    backgroundColor: COLORS.soft,
    overflow: 'hidden',
  },
  counterButton: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quantity: {
    minWidth: 24,
    textAlign: 'center',
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.title,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginHorizontal: 8,
  },
  addressSection: {
    marginBottom: 20,
  },
  sectionLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.title,
    marginLeft: 8,
  },
  addressCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  addressCardSelected: {
    borderColor: COLORS.success,
    backgroundColor: '#F0FDF4',
  },
  addressIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: COLORS.soft,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  addressContent: {
    flex: 1,
  },
  addressLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.title,
  },
  addressHint: {
    fontSize: 12,
    color: COLORS.muted,
    marginTop: 2,
  },
  addressText: {
    fontSize: 12,
    color: COLORS.text,
    marginTop: 2,
    lineHeight: 16,
  },
  billCard: {
    backgroundColor: COLORS.white,
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 20,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  billTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.title,
    marginBottom: 14,
  },
  billRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  billLabel: {
    fontSize: 13,
    color: COLORS.muted,
  },
  billValue: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.title,
  },
  billBold: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.title,
  },
  billDivider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: 12,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    backgroundColor: COLORS.background,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 8,
  },
  checkoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.primary,
    borderRadius: 30,
    paddingHorizontal: 20,
    paddingVertical: 16,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 14,
    elevation: 8,
  },
  checkoutButtonDisabled: {
    backgroundColor: '#D1D5DB',
    shadowOpacity: 0,
  },
  checkoutLeft: {
    flexDirection: 'column',
  },
  checkoutLabel: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.8)',
    fontWeight: '600',
  },
  checkoutPrice: {
    fontSize: 18,
    fontWeight: '800',
    color: '#fff',
    marginTop: 2,
  },
  checkoutRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkoutText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#fff',
    marginRight: 8,
  },
});
