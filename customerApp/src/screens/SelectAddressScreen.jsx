// screens/SelectAddressScreen.jsx
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from '@react-native-vector-icons/ionicons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useAppUI } from '../context/AppUIContext';
import { getAddresses } from '../api/customerApi';

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

export default function SelectAddressScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { item, directOrder } = route.params || {};
  const { cartItems, cartTotal } = useAppUI();

  const [addresses, setAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const orderItems = directOrder ? [item] : cartItems;
  const totalAmount = directOrder
    ? item?.totalPrice || item?.price * (item?.quantity || 1) || 0
    : cartTotal;

  useEffect(() => {
    fetchAddresses();
  }, []);

  const fetchAddresses = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await getAddresses();

      let list = [];
      if (res.data?.addresses) list = res.data.addresses;
      else if (res.addresses) list = res.addresses;
      else if (Array.isArray(res.data)) list = res.data;
      else if (Array.isArray(res)) list = res;
      else {
        for (const key of ['addresses', 'data', 'items', 'results']) {
          if (res[key] && Array.isArray(res[key])) {
            list = res[key];
            break;
          }
        }
      }

      const normalized = list.map(addr => ({
        _id: addr._id || addr.id,
        fullName: addr.name || addr.fullName || addr.customerName || '',
        addressLine: addr.addressLine || addr.address || addr.line1 || '',
        city: addr.city || '',
        state: addr.state || '',
        pincode: addr.pincode || addr.postalCode || '',
        phone: addr.phone || addr.phoneNumber || '',
        latitude:
          addr.latitude || addr.lat || addr.location?.coordinates?.[1] || 0,
        longitude:
          addr.longitude || addr.lng || addr.location?.coordinates?.[0] || 0,
        isDefault: addr.isDefault || false,
        label: addr.label || 'Home',
      }));

      setAddresses(normalized);
      if (normalized.length > 0) {
        const defaultAddr = normalized.find(a => a.isDefault) || normalized[0];
        setSelectedAddress(defaultAddr);
      }
    } catch (error) {
      console.error('Fetch addresses error:', error);
      setError('Could not load addresses. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectAddress = address => {
    setSelectedAddress(address);
  };

  const handleAddNewAddress = () => {
    navigation.navigate('Addresses', { selectMode: false });
  };

  const handleProceedToSummary = () => {
    if (!selectedAddress) {
      Alert.alert('Error', 'Please select a delivery address');
      return;
    }

    navigation.navigate('OrderSummary', {
      items: orderItems,
      deliveryAddress: selectedAddress,
      directOrder,
      vendorId: directOrder ? item?.vendorId : cartItems[0]?.vendorId,
    });
  };

  const handleItemPress = item => {
    navigation.navigate('ItemDetail', {
      item,
      vendorId: item.vendorId || cartItems[0]?.vendorId,
    });
  };

  const renderItemSummary = () => (
    <View style={styles.summaryCard}>
      <Text style={styles.summaryTitle}>
        {directOrder ? 'Item' : 'Cart Items'}
      </Text>
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
                <Image source={{ uri: imageUrl }} style={styles.itemImage} />
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
      <View style={styles.summaryDivider} />
      <View style={styles.summaryTotalRow}>
        <Text style={styles.summaryTotalLabel}>Total</Text>
        <Text style={styles.summaryTotalValue}>₹{totalAmount.toFixed(0)}</Text>
      </View>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={COLORS.title} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Select Address</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {renderItemSummary()}

        <View style={styles.addressSection}>
          <Text style={styles.sectionLabel}>Delivery Address</Text>
          {error ? (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
              <TouchableOpacity
                onPress={fetchAddresses}
                style={styles.retryButton}
              >
                <Text style={styles.retryButtonText}>Retry</Text>
              </TouchableOpacity>
            </View>
          ) : addresses.length === 0 ? (
            <View style={styles.emptyAddress}>
              <Text style={styles.emptyText}>No saved addresses</Text>
            </View>
          ) : (
            addresses.map(addr => (
              <TouchableOpacity
                key={addr._id}
                style={[
                  styles.addressCard,
                  selectedAddress?._id === addr._id &&
                    styles.addressCardSelected,
                ]}
                onPress={() => handleSelectAddress(addr)}
              >
                <View style={styles.addressIcon}>
                  <Ionicons
                    name="location-outline"
                    size={22}
                    color={
                      selectedAddress?._id === addr._id
                        ? COLORS.success
                        : COLORS.muted
                    }
                  />
                </View>
                <View style={styles.addressContent}>
                  <Text style={styles.addressName}>
                    {addr.fullName || 'Unknown'}
                  </Text>
                  <Text style={styles.addressText} numberOfLines={2}>
                    {addr.addressLine}, {addr.city}, {addr.state} -{' '}
                    {addr.pincode}
                  </Text>
                </View>
                {selectedAddress?._id === addr._id && (
                  <Ionicons
                    name="checkmark-circle"
                    size={20}
                    color={COLORS.success}
                  />
                )}
              </TouchableOpacity>
            ))
          )}
          <TouchableOpacity
            style={styles.addAddressButton}
            onPress={handleAddNewAddress}
          >
            <Ionicons
              name="add-circle-outline"
              size={22}
              color={COLORS.primary}
            />
            <Text style={styles.addAddressText}>Add new address</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={[
            styles.proceedButton,
            !selectedAddress && styles.proceedButtonDisabled,
          ]}
          onPress={handleProceedToSummary}
          disabled={!selectedAddress}
        >
          <Text style={styles.proceedButtonText}>
            Proceed to Summary • ₹{totalAmount.toFixed(0)}
          </Text>
          <Ionicons name="arrow-forward" size={20} color="#fff" />
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
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
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },

  // ─── Item Summary Card ──────────────────────────────────
  summaryCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  summaryTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.title,
    marginBottom: 10,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F5',
  },
  itemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  itemImage: {
    width: 44,
    height: 44,
    borderRadius: 10,
    marginRight: 10,
    backgroundColor: '#f0f0f0',
  },
  imagePlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemInfo: { flex: 1 },
  itemName: { fontSize: 13, fontWeight: '600', color: COLORS.title },
  itemVendor: { fontSize: 11, color: COLORS.muted, marginTop: 2 },
  itemPrice: { fontSize: 13, fontWeight: '700', color: COLORS.title },
  summaryDivider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: 8,
  },
  summaryTotalRow: { flexDirection: 'row', justifyContent: 'space-between' },
  summaryTotalLabel: { fontSize: 15, fontWeight: '700', color: COLORS.title },
  summaryTotalValue: { fontSize: 16, fontWeight: '900', color: COLORS.primary },

  // ─── Address ──────────────────────────────────────────────
  addressSection: { marginBottom: 20 },
  sectionLabel: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.title,
    marginBottom: 12,
  },
  addressCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 8,
  },
  addressCardSelected: {
    borderColor: COLORS.success,
    backgroundColor: '#F0FDF4',
  },
  addressIcon: { marginRight: 12 },
  addressContent: { flex: 1 },
  addressName: { fontSize: 14, fontWeight: '700', color: COLORS.title },
  addressText: { fontSize: 12, color: COLORS.muted, marginTop: 2 },
  emptyAddress: {
    padding: 20,
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  emptyText: { color: COLORS.muted, fontSize: 14 },
  addAddressButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    marginTop: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    backgroundColor: COLORS.white,
  },
  addAddressText: {
    color: COLORS.primary,
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  errorContainer: {
    padding: 20,
    alignItems: 'center',
    backgroundColor: '#FEE2E2',
    borderRadius: 12,
    marginBottom: 8,
  },
  errorText: { color: '#DC2626', fontSize: 14, textAlign: 'center' },
  retryButton: {
    marginTop: 10,
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: COLORS.primary,
    borderRadius: 8,
  },
  retryButtonText: { color: '#fff', fontWeight: '600' },

  // ─── Proceed Button ──────────────────────────────────────
  proceedButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    paddingVertical: 16,
    borderRadius: 30,
    marginTop: 10,
  },
  proceedButtonDisabled: { backgroundColor: '#D1D5DB' },
  proceedButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '800',
    marginRight: 8,
  },
});
