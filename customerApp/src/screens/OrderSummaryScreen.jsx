// screens/OrderSummaryScreen.jsx
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from '@react-native-vector-icons/ionicons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useAppUI } from '../context/AppUIContext';

const COLORS = {
  primary: '#FF5A1F',
  background: '#F8F9FC',
  white: '#FFFFFF',
  title: '#1A1A2E',
  text: '#2D2D3F',
  muted: '#8E8EA0',
  border: '#EAEAEF',
  success: '#22C55E',
  shadow: 'rgba(0,0,0,0.06)',
};

const STATIC_BASE = 'https://myfoodmitra-ecosystem.onrender.com';

const buildImageUrl = path => {
  if (!path) return null;
  if (path.startsWith('http')) return path;
  const clean = path.startsWith('/') ? path : `/${path}`;
  return `${STATIC_BASE}${clean}`;
};

export default function OrderSummaryScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { items, deliveryAddress, directOrder, vendorId } = route.params || {};
  const { cartItems, cartTotal } = useAppUI();

  // Use passed items or fallback to cart
  const orderItems = items || cartItems;
  const itemTotal = orderItems.reduce(
    (sum, it) => sum + it.price * (it.quantity || 1),
    0,
  );

  // Delivery charge (mock – replace with actual calculation)
  const deliveryCharge = 1;
  const platformFee = 1;
  const grandTotal = itemTotal + deliveryCharge + platformFee;

  const handleProceedToPayment = () => {
    navigation.navigate('PaymentMethod', {
      amount: grandTotal,
      itemTotal,
      deliveryCharge,
      platformFee,
      items: orderItems,
      deliveryAddress,
      vendorId: vendorId || orderItems[0]?.vendorId,
      directOrder: directOrder || false,
    });
  };

  const handleItemPress = item => {
    // Navigate to ItemDetail with the item data
    navigation.navigate('ItemDetail', {
      item,
      vendorId: item.vendorId || vendorId,
    });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={COLORS.title} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Order Summary</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.addressCard}>
          <View style={styles.addressIcon}>
            <Ionicons name="location" size={20} color={COLORS.primary} />
          </View>
          <View style={styles.addressContent}>
            <Text style={styles.addressLabel}>Delivery Address</Text>
            <Text style={styles.addressText}>
              {deliveryAddress?.addressLine}, {deliveryAddress?.city},{' '}
              {deliveryAddress?.state} - {deliveryAddress?.pincode}
            </Text>
          </View>
        </View>

        <View style={styles.itemsCard}>
          <Text style={styles.sectionTitle}>Items</Text>
          {orderItems.map((it, idx) => {
            const imageUrl = buildImageUrl(it.image);
            return (
              <TouchableOpacity
                key={idx}
                style={styles.itemRow}
                onPress={() => handleItemPress(it)}
                activeOpacity={0.7}
              >
                <View style={styles.itemLeft}>
                  {imageUrl ? (
                    <Image
                      source={{ uri: imageUrl }}
                      style={styles.itemImage}
                    />
                  ) : (
                    <View style={[styles.itemImage, styles.imagePlaceholder]}>
                      <Ionicons name="fast-food" size={20} color="#ccc" />
                    </View>
                  )}
                  <View style={styles.itemInfo}>
                    <Text style={styles.itemName}>
                      {it.quantity || 1}× {it.name}
                    </Text>
                    {it.vendorName && (
                      <Text style={styles.itemVendor}>{it.vendorName}</Text>
                    )}
                  </View>
                </View>
                <Text style={styles.itemPrice}>
                  ₹{(it.price * (it.quantity || 1)).toFixed(0)}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={styles.breakdownCard}>
          <Text style={styles.sectionTitle}>Bill Breakdown</Text>
          <BreakdownRow label="Item Total" value={`₹${itemTotal.toFixed(0)}`} />
          <BreakdownRow label="Delivery Charge" value={`₹${deliveryCharge}`} />
          <BreakdownRow label="Platform Fee" value={`₹${platformFee}`} />
          <View style={styles.divider} />
          <BreakdownRow
            label="Grand Total"
            value={`₹${grandTotal.toFixed(0)}`}
            bold
          />
        </View>

        <TouchableOpacity
          style={styles.payButton}
          onPress={handleProceedToPayment}
        >
          <Text style={styles.payButtonText}>
            Proceed to Payment • ₹{grandTotal.toFixed(0)}
          </Text>
          <Ionicons name="arrow-forward" size={20} color="#fff" />
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

function BreakdownRow({ label, value, bold }) {
  return (
    <View style={[styles.breakdownRow, bold && styles.breakdownRowBold]}>
      <Text style={[styles.breakdownLabel, bold && styles.breakdownLabelBold]}>
        {label}
      </Text>
      <Text style={[styles.breakdownValue, bold && styles.breakdownValueBold]}>
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerTitle: { fontSize: 18, fontWeight: '800', color: COLORS.title },
  content: { padding: 16, paddingBottom: 40 },
  addressCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 16,
  },
  addressIcon: { marginRight: 12 },
  addressContent: { flex: 1 },
  addressLabel: { fontSize: 12, fontWeight: '700', color: COLORS.muted },
  addressText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.title,
    marginTop: 4,
  },
  itemsCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.title,
    marginBottom: 12,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F5',
  },
  itemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  itemImage: {
    width: 50,
    height: 50,
    borderRadius: 10,
    marginRight: 12,
    backgroundColor: '#f0f0f0',
  },
  imagePlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemInfo: { flex: 1 },
  itemName: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.title,
  },
  itemVendor: {
    fontSize: 11,
    color: COLORS.muted,
    marginTop: 2,
  },
  itemPrice: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.title,
    marginLeft: 8,
  },
  breakdownCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 16,
  },
  breakdownRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  breakdownRowBold: { paddingVertical: 10 },
  breakdownLabel: { fontSize: 13, color: COLORS.muted },
  breakdownLabelBold: { fontWeight: '700', color: COLORS.title },
  breakdownValue: { fontSize: 13, fontWeight: '600', color: COLORS.title },
  breakdownValueBold: {
    fontSize: 16,
    fontWeight: '900',
    color: COLORS.primary,
  },
  divider: { height: 1, backgroundColor: COLORS.border, marginVertical: 6 },
  payButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    paddingVertical: 16,
    borderRadius: 30,
    marginTop: 10,
  },
  payButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '800',
    marginRight: 8,
  },
});
