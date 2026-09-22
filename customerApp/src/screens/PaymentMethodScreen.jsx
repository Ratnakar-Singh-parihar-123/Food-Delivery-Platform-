// screens/PaymentMethodScreen.jsx
import React, { useEffect, useMemo, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from '@react-native-vector-icons/ionicons';
import { useNavigation, useRoute } from '@react-navigation/native';
import ScreenHeader from '../components/ScreenHeader';
import { useAppUI } from '../context/AppUIContext';
import { placeOrder } from '../api/customerApi';

const WALLETS = [
  {
    id: 'wallet-phonepe',
    type: 'wallet',
    title: 'PhonePe',
    subtitle: 'Linked mobile account',
    icon: 'phone-portrait-outline',
  },
  {
    id: 'wallet-gpay',
    type: 'wallet',
    title: 'Google Pay',
    subtitle: 'Linked mobile account',
    icon: 'logo-google',
  },
  {
    id: 'wallet-paytm',
    type: 'wallet',
    title: 'Paytm',
    subtitle: 'Linked mobile account',
    icon: 'wallet-outline',
  },
];

const COD_METHOD = {
  id: 'cod',
  type: 'cod',
  title: 'Cash on delivery',
  subtitle: 'Pay when your order arrives',
  icon: 'cash-outline',
};

export default function PaymentMethodScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { savedPayments = [], cartItems: contextCartItems = [] } = useAppUI();

  // ─── Get params from route ──────────────────────────────
  const {
    amount = 0,
    itemTotal = 0,
    deliveryCharge = 0,
    platformFee = 0,
    items = [],
    deliveryAddress = null,
    vendorId = null,
    directOrder = false,
  } = route.params || {};

  const [placingOrder, setPlacingOrder] = useState(false);

  const availableMethods = useMemo(() => {
    const saved = [...savedPayments]
      .filter(payment => payment.type !== 'cod')
      .sort((a, b) => Number(b.isPrimary) - Number(a.isPrimary));

    return [...saved, ...WALLETS, COD_METHOD];
  }, [savedPayments]);

  const defaultMethodId = useMemo(
    () =>
      availableMethods.find(method => method.isPrimary)?.id ||
      availableMethods[0]?.id ||
      null,
    [availableMethods],
  );

  const [selectedId, setSelectedId] = useState(defaultMethodId);

  useEffect(() => {
    const selectedStillExists = availableMethods.some(
      method => method.id === selectedId,
    );
    if (!selectedStillExists) {
      setSelectedId(defaultMethodId);
    }
  }, [availableMethods, defaultMethodId, selectedId]);

  const selectedMethod = useMemo(
    () => availableMethods.find(method => method.id === selectedId),
    [availableMethods, selectedId],
  );

  const savedMethods = useMemo(
    () =>
      availableMethods.filter(method => ['card', 'upi'].includes(method.type)),
    [availableMethods],
  );

  const wallets = useMemo(
    () => availableMethods.filter(method => method.type === 'wallet'),
    [availableMethods],
  );

  const cod = useMemo(
    () => availableMethods.find(method => method.type === 'cod'),
    [availableMethods],
  );

  // ─── Handle Continue ──────────────────────────────────────
  const handleContinue = async () => {
    if (!selectedMethod) {
      Alert.alert('Error', 'Please select a payment method');
      return;
    }

    if (!vendorId) {
      Alert.alert(
        'Error',
        'Vendor information missing. Please go back and try again.',
      );
      return;
    }

    if (!deliveryAddress) {
      Alert.alert(
        'Error',
        'Delivery address missing. Please go back and try again.',
      );
      return;
    }

    // ─── Validate address fields ──────────────────────────
    if (
      !deliveryAddress.addressLine ||
      !deliveryAddress.city ||
      !deliveryAddress.state ||
      !deliveryAddress.pincode
    ) {
      Alert.alert(
        'Error',
        'Delivery address is incomplete. Please update your address.',
      );
      return;
    }

    setPlacingOrder(true);

    try {
      // ─── Map payment method to valid enum value ──────────
      let paymentMethodValue;
      if (selectedMethod.type === 'cod') {
        paymentMethodValue = 'cash';
      } else if (selectedMethod.type === 'card') {
        paymentMethodValue = 'card';
      } else if (selectedMethod.type === 'upi') {
        paymentMethodValue = 'upi';
      } else if (selectedMethod.type === 'wallet') {
        paymentMethodValue = 'wallet';
      } else {
        paymentMethodValue = 'cash'; // fallback
      }

      // ─── Build payload ──────────────────────────────────
      const payload = {
        vendorId: vendorId,
        items: items.map(it => ({
          productId: it.id || it._id,
          quantity: it.quantity || 1,
          variant: it.variant || {},
          addons: it.addons || [],
        })),
        deliveryAddress: {
          name: deliveryAddress.fullName || deliveryAddress.name || 'Customer',
          addressLine: deliveryAddress.addressLine,
          city: deliveryAddress.city,
          state: deliveryAddress.state,
          pincode: deliveryAddress.pincode,
          phone: deliveryAddress.phone || '',
          location: {
            type: 'Point',
            coordinates: [
              deliveryAddress.longitude || 0,
              deliveryAddress.latitude || 0,
            ],
          },
        },
        paymentMethod: paymentMethodValue,
        customerNote: '',
      };

      // ─── Debug log ───────────────────────────────────────
      console.log('📦 Order payload:', JSON.stringify(payload, null, 2));

      const response = await placeOrder(payload);
      console.log('✅ Order response:', response);

      if (response.success) {
        // Navigate to payment success with order data
        navigation.navigate('PaymentSuccess', {
          order: response.data.order,
          amount: amount,
          paymentMethod: selectedMethod,
        });
      } else {
        Alert.alert('Error', response.message || 'Failed to place order');
      }
    } catch (error) {
      console.error('❌ Order placement error:', error);

      // ─── Extract meaningful error message ──────────────
      let errorMsg = 'Could not place order. Please try again.';
      if (error.response) {
        // Server responded with error
        const serverData = error.response.data;
        console.log('Server response:', serverData);
        if (serverData.message) {
          errorMsg = serverData.message;
        } else if (serverData.errors) {
          // Mongoose validation errors
          const errFields = Object.keys(serverData.errors).join(', ');
          errorMsg = `Missing or invalid fields: ${errFields}`;
        } else {
          errorMsg = `Server error: ${error.response.status}`;
        }
      } else if (error.request) {
        // No response from server
        errorMsg = 'No response from server. Check your internet connection.';
      } else {
        // Request setup error
        errorMsg = error.message || errorMsg;
      }

      Alert.alert('Error', errorMsg);
    } finally {
      setPlacingOrder(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#fffaf7" />

      <ScreenHeader
        navigation={navigation}
        title="Payment method"
        subtitle="Choose how you want to pay"
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        {savedMethods.length ? (
          <PaymentSection title="Saved payment methods">
            {savedMethods.map((method, index) => (
              <PaymentOption
                key={method.id}
                method={method}
                selected={selectedId === method.id}
                isLast={index === savedMethods.length - 1}
                onPress={() => setSelectedId(method.id)}
              />
            ))}
          </PaymentSection>
        ) : (
          <View style={styles.emptySavedCard}>
            <View style={styles.emptySavedIcon}>
              <Ionicons name="card-outline" size={22} color="#ff5a1f" />
            </View>
            <View style={styles.emptySavedContent}>
              <Text style={styles.emptySavedTitle}>No saved card or UPI</Text>
              <Text style={styles.emptySavedText}>
                Payments screen se card ya UPI add kar sakte hain.
              </Text>
            </View>
          </View>
        )}

        <PaymentSection title="Wallets and linked accounts">
          {wallets.map((method, index) => (
            <PaymentOption
              key={method.id}
              method={method}
              selected={selectedId === method.id}
              isLast={index === wallets.length - 1}
              onPress={() => setSelectedId(method.id)}
            />
          ))}
        </PaymentSection>

        {cod ? (
          <PaymentSection title="Pay on delivery">
            <PaymentOption
              method={cod}
              selected={selectedId === cod.id}
              isLast
              onPress={() => setSelectedId(cod.id)}
            />
          </PaymentSection>
        ) : null}

        <View style={styles.secureNote}>
          <Ionicons name="shield-checkmark-outline" size={18} color="#15803d" />
          <Text style={styles.secureText}>
            Payment details encrypted aur securely handled hain.
          </Text>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <View>
          <Text style={styles.amount}>₹{amount.toFixed(0)}</Text>
          <Text style={styles.amountLabel}>TOTAL PAYABLE</Text>
        </View>

        <Pressable
          disabled={!selectedMethod || placingOrder}
          onPress={handleContinue}
          style={({ pressed }) => [
            styles.payButton,
            (!selectedMethod || placingOrder) && styles.payButtonDisabled,
            pressed && selectedMethod && styles.pressed,
          ]}
        >
          {placingOrder ? (
            <ActivityIndicator color="#ffffff" size="small" />
          ) : (
            <>
              <Text style={styles.payButtonText}>
                {selectedMethod?.type === 'cod'
                  ? 'Place COD order'
                  : `Pay ₹${amount.toFixed(0)}`}
              </Text>
              <Ionicons name="arrow-forward" size={19} color="#ffffff" />
            </>
          )}
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

// ─── Helper Components ──────────────────────────────────────

function PaymentSection({ title, children }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.sectionCard}>{children}</View>
    </View>
  );
}

function PaymentOption({ method, selected, isLast = false, onPress }) {
  const subtitle =
    method.type === 'card'
      ? `•••• ${method.cardNumber || '----'}  •  Expires ${
          method.expiry || '--/--'
        }`
      : method.type === 'upi'
      ? method.upiId || 'UPI ID'
      : method.subtitle;

  const iconColor = selected
    ? '#ffffff'
    : method.type === 'cod'
    ? '#15803d'
    : '#ff5a1f';

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.option,
        isLast && styles.optionLast,
        selected && styles.optionSelected,
        pressed && styles.optionPressed,
      ]}
    >
      <View
        style={[
          styles.optionIcon,
          method.type === 'cod' && styles.codIcon,
          selected && styles.optionIconSelected,
        ]}
      >
        <Ionicons
          name={method.icon || 'card-outline'}
          size={21}
          color={iconColor}
        />
      </View>

      <View style={styles.optionContent}>
        <View style={styles.optionTitleRow}>
          <Text style={styles.optionTitle}>{method.title}</Text>
          {method.isPrimary ? (
            <View style={styles.primaryBadge}>
              <Text style={styles.primaryText}>PRIMARY</Text>
            </View>
          ) : null}
        </View>

        <Text style={styles.optionSubtitle}>{subtitle}</Text>
      </View>

      <View style={[styles.radio, selected && styles.radioSelected]}>
        {selected ? <View style={styles.radioDot} /> : null}
      </View>
    </Pressable>
  );
}

// ─── Styles ──────────────────────────────────────────────────

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fffaf7',
  },
  content: {
    paddingHorizontal: 18,
    paddingTop: 10,
    paddingBottom: 135,
  },
  section: {
    marginBottom: 18,
  },
  sectionTitle: {
    marginBottom: 10,
    color: '#171717',
    fontSize: 12,
    fontWeight: '900',
  },
  sectionCard: {
    overflow: 'hidden',
    borderRadius: 22,
    borderWidth: 1,
    borderColor: '#eee5df',
    backgroundColor: '#ffffff',
  },
  option: {
    minHeight: 78,
    paddingHorizontal: 13,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#eee5df',
  },
  optionLast: {
    borderBottomWidth: 0,
  },
  optionSelected: {
    backgroundColor: '#fff5ef',
  },
  optionPressed: {
    opacity: 0.82,
  },
  optionIcon: {
    width: 44,
    height: 44,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff0e9',
  },
  optionIconSelected: {
    backgroundColor: '#ff5a1f',
  },
  codIcon: {
    backgroundColor: '#ecfdf3',
  },
  optionContent: {
    flex: 1,
    marginLeft: 11,
  },
  optionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  optionTitle: {
    color: '#171717',
    fontSize: 11.5,
    fontWeight: '900',
  },
  optionSubtitle: {
    marginTop: 5,
    color: '#8f8f98',
    fontSize: 8.8,
    lineHeight: 13,
  },
  primaryBadge: {
    marginLeft: 7,
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 7,
    backgroundColor: '#ecfdf3',
  },
  primaryText: {
    color: '#15803d',
    fontSize: 6.8,
    fontWeight: '900',
  },
  radio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#d6d3d1',
  },
  radioSelected: {
    borderColor: '#ff5a1f',
  },
  radioDot: {
    width: 11,
    height: 11,
    borderRadius: 6,
    backgroundColor: '#ff5a1f',
  },
  emptySavedCard: {
    marginBottom: 18,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#ffd6c4',
    backgroundColor: '#fff5ef',
  },
  emptySavedIcon: {
    width: 44,
    height: 44,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff',
  },
  emptySavedContent: {
    flex: 1,
    marginLeft: 11,
  },
  emptySavedTitle: {
    color: '#171717',
    fontSize: 11,
    fontWeight: '900',
  },
  emptySavedText: {
    marginTop: 4,
    color: '#8f8f98',
    fontSize: 8.5,
    lineHeight: 13,
  },
  secureNote: {
    padding: 13,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 17,
    borderWidth: 1,
    borderColor: '#bbf7d0',
    backgroundColor: '#f0fdf4',
  },
  secureText: {
    flex: 1,
    marginLeft: 8,
    color: '#477051',
    fontSize: 8.5,
    lineHeight: 13,
  },
  footer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    minHeight: 92,
    paddingHorizontal: 18,
    paddingTop: 12,
    paddingBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#eee5df',
    backgroundColor: '#ffffff',
  },
  amount: {
    color: '#171717',
    fontSize: 17,
    fontWeight: '900',
  },
  amountLabel: {
    marginTop: 3,
    color: '#8f8f98',
    fontSize: 7,
    fontWeight: '800',
  },
  payButton: {
    flex: 1,
    height: 58,
    marginLeft: 18,
    paddingHorizontal: 17,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 19,
    backgroundColor: '#ff5a1f',
  },
  payButtonDisabled: {
    opacity: 0.45,
  },
  payButtonText: {
    color: '#ffffff',
    fontSize: 11.5,
    fontWeight: '900',
  },
  pressed: {
    opacity: 0.9,
    transform: [{ scale: 0.985 }],
  },
});
