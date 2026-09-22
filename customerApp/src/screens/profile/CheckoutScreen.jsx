import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  StatusBar,
  Pressable,
  TouchableOpacity,
} from 'react-native';
import Ionicons from '@react-native-vector-icons/ionicons';
import { useFocusEffect } from '@react-navigation/native';

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
  shadow: 'rgba(0,0,0,0.06)',
};

export default function CheckoutScreen({ navigation, route }) {
  const [selectedAddress, setSelectedAddress] = useState(null);

  // ─── Listen for address selection from Addresses screen ──
  useEffect(() => {
    if (route.params?.selectedAddress) {
      setSelectedAddress(route.params.selectedAddress);
      // Clear param to avoid re‑applying on subsequent renders
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

  // ─── Extract order data from route params (from Cart) ──
  const { amount = 0, deliveryFee = 0, platformFee = 0 } = route.params || {};
  const grandTotal = amount + deliveryFee + platformFee;

  const openAddressSelection = () => {
    navigation.navigate('Addresses', { selectMode: true });
  };

  const renderAddressSection = () => {
    if (!selectedAddress) {
      return (
        <TouchableOpacity
          style={styles.addressCard}
          onPress={openAddressSelection}
          activeOpacity={0.7}
        >
          <View style={styles.addressIcon}>
            <Ionicons
              name="location-outline"
              size={24}
              color={COLORS.primary}
            />
          </View>
          <View style={styles.addressContent}>
            <Text style={styles.addressLabel}>Add delivery address</Text>
            <Text style={styles.addressHint}>
              Tap to add a new address or select a saved one
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={COLORS.muted} />
        </TouchableOpacity>
      );
    }

    return (
      <TouchableOpacity
        style={[styles.addressCard, styles.addressCardSelected]}
        onPress={openAddressSelection}
        activeOpacity={0.7}
      >
        <View style={styles.addressIcon}>
          <Ionicons name="home-outline" size={24} color={COLORS.success} />
        </View>
        <View style={styles.addressContent}>
          <Text style={styles.addressLabel}>{selectedAddress.fullName}</Text>
          <Text style={styles.addressText} numberOfLines={2}>
            {selectedAddress.address}
          </Text>
          <View style={styles.addressMeta}>
            <Text style={styles.addressMetaText}>
              {selectedAddress.city}, {selectedAddress.state}
            </Text>
          </View>
        </View>
        <View style={styles.addressActions}>
          <Ionicons name="checkmark-circle" size={20} color={COLORS.success} />
          <Ionicons name="chevron-forward" size={20} color={COLORS.muted} />
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />

      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} hitSlop={12}>
          <Ionicons name="arrow-back" size={24} color={COLORS.title} />
        </Pressable>
        <Text style={styles.headerTitle}>Checkout</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        {/* Address Section */}
        <View style={styles.sectionLabel}>
          <Ionicons name="location-outline" size={18} color={COLORS.primary} />
          <Text style={styles.sectionTitle}>Delivery address</Text>
        </View>
        {renderAddressSection()}

        {/* Order Summary */}
        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>Order Summary</Text>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Subtotal</Text>
            <Text style={styles.summaryValue}>₹{amount}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Delivery fee</Text>
            <Text style={styles.summaryValue}>₹{deliveryFee}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Platform fee</Text>
            <Text style={styles.summaryValue}>₹{platformFee}</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.summaryRow}>
            <Text style={styles.summaryTotal}>Total</Text>
            <Text style={styles.summaryTotalValue}>₹{grandTotal}</Text>
          </View>
        </View>

        {/* Place Order Button */}
        <TouchableOpacity
          style={[
            styles.placeOrderButton,
            !selectedAddress && styles.placeOrderDisabled,
          ]}
          onPress={() => {
            if (selectedAddress) {
              // Proceed to payment or order confirmation
              navigation.navigate('PaymentMethod', {
                address: selectedAddress,
                amount,
                deliveryFee,
                platformFee,
              });
            }
          }}
          disabled={!selectedAddress}
          activeOpacity={0.7}
        >
          <Text style={styles.placeOrderText}>
            {selectedAddress ? 'Place Order' : 'Add address to continue'}
          </Text>
          <Ionicons
            name={selectedAddress ? 'arrow-forward' : 'location-outline'}
            size={20}
            color={COLORS.white}
          />
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Styles ──────────────────────────────────────────────

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingVertical: 12,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.title,
  },
  content: {
    padding: 18,
    paddingBottom: 40,
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
    marginBottom: 20,
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
    fontSize: 13,
    color: COLORS.text,
    marginTop: 2,
    lineHeight: 18,
  },
  addressMeta: {
    marginTop: 4,
  },
  addressMetaText: {
    fontSize: 11,
    color: COLORS.muted,
  },
  addressActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  summaryCard: {
    backgroundColor: COLORS.white,
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
    marginBottom: 20,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.title,
    marginBottom: 12,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  summaryLabel: {
    fontSize: 13,
    color: COLORS.muted,
  },
  summaryValue: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.text,
  },
  summaryTotal: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.title,
  },
  summaryTotalValue: {
    fontSize: 17,
    fontWeight: '800',
    color: COLORS.primary,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: 10,
  },
  placeOrderButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    borderRadius: 30,
    paddingVertical: 16,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 6,
  },
  placeOrderDisabled: {
    backgroundColor: '#D1D5DB',
    shadowOpacity: 0,
  },
  placeOrderText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '800',
    marginRight: 8,
  },
});
