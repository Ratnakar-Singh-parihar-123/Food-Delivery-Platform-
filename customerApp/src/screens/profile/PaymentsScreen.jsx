import React, { useMemo, useRef, useState } from 'react';

import {
  Animated,
  Easing,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import Ionicons from '@react-native-vector-icons/ionicons';
import { SafeAreaView } from 'react-native-safe-area-context';

import ScreenHeader from '../../components/ScreenHeader';

const COLORS = {
  primary: '#ff5a1f',
  primaryDark: '#e9470d',
  background: '#fffaf7',
  white: '#ffffff',
  title: '#171717',
  text: '#3f3f46',
  muted: '#8f8f98',
  border: '#eee5df',
  soft: '#fff0e9',
  success: '#15803d',
  danger: '#dc2626',
  dark: '#171717',
};

const PAYMENT_TYPES = [
  {
    id: 'upi',
    title: 'UPI',
    subtitle: 'Google Pay, PhonePe, Paytm',
    icon: 'phone-portrait-outline',
  },
  {
    id: 'card',
    title: 'Card',
    subtitle: 'Credit or debit card',
    icon: 'card-outline',
  },
];

const EMPTY_UPI_FORM = {
  upiId: '',
  holderName: '',
};

const EMPTY_CARD_FORM = {
  cardNumber: '',
  holderName: '',
  expiry: '',
  cvv: '',
};

export default function PaymentsScreen({ navigation }) {
  const [payments, setPayments] = useState([
    {
      id: 'upi-1',
      type: 'upi',
      title: 'UPI',
      upiId: 'ratnakar@upi',
      icon: 'phone-portrait-outline',
      isPrimary: true,
      isFixed: false,
    },
    {
      id: 'card-1',
      type: 'card',
      title: 'HDFC Bank',
      cardNumber: '4242',
      holderName: 'Ratnakar Singh',
      expiry: '08/29',
      icon: 'card-outline',
      isPrimary: false,
      isFixed: false,
    },
    {
      id: 'cod',
      type: 'cod',
      title: 'Cash on delivery',
      subtitle: 'Pay when your order arrives',
      icon: 'cash-outline',
      isPrimary: false,
      isFixed: true,
    },
  ]);

  const [modalVisible, setModalVisible] = useState(false);
  const [paymentType, setPaymentType] = useState('upi');

  const [upiForm, setUpiForm] = useState(EMPTY_UPI_FORM);
  const [cardForm, setCardForm] = useState(EMPTY_CARD_FORM);

  const [errors, setErrors] = useState({});
  const [editingId, setEditingId] = useState(null);

  const modalTranslateY = useRef(new Animated.Value(-600)).current;
  const backdropOpacity = useRef(new Animated.Value(0)).current;

  const modalTitle = editingId ? 'Edit payment method' : 'Add payment method';

  const selectedPaymentType = useMemo(
    () => PAYMENT_TYPES.find(type => type.id === paymentType),
    [paymentType],
  );

  const openModalAnimation = () => {
    setModalVisible(true);

    requestAnimationFrame(() => {
      Animated.parallel([
        Animated.timing(backdropOpacity, {
          toValue: 1,
          duration: 220,
          useNativeDriver: true,
        }),

        Animated.spring(modalTranslateY, {
          toValue: 0,
          damping: 12,
          stiffness: 150,
          mass: 0.8,
          useNativeDriver: true,
        }),
      ]).start();
    });
  };

  const openAddModal = () => {
    setEditingId(null);
    setPaymentType('upi');
    setUpiForm(EMPTY_UPI_FORM);
    setCardForm(EMPTY_CARD_FORM);
    setErrors({});

    openModalAnimation();
  };

  const openEditModal = payment => {
    if (payment.isFixed || payment.type === 'cod') {
      return;
    }

    setEditingId(payment.id);
    setPaymentType(payment.type);
    setErrors({});

    if (payment.type === 'upi') {
      setUpiForm({
        upiId: payment.upiId || '',
        holderName: payment.holderName || '',
      });

      setCardForm(EMPTY_CARD_FORM);
    }

    if (payment.type === 'card') {
      setCardForm({
        cardNumber: payment.fullCardNumber || payment.cardNumber || '',
        holderName: payment.holderName || '',
        expiry: payment.expiry || '',
        cvv: '',
      });

      setUpiForm(EMPTY_UPI_FORM);
    }

    openModalAnimation();
  };

  const closeModal = () => {
    Animated.parallel([
      Animated.timing(backdropOpacity, {
        toValue: 0,
        duration: 180,
        useNativeDriver: true,
      }),

      Animated.timing(modalTranslateY, {
        toValue: -600,
        duration: 260,
        easing: Easing.in(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start(() => {
      setModalVisible(false);
      setEditingId(null);
      setErrors({});
      setUpiForm(EMPTY_UPI_FORM);
      setCardForm(EMPTY_CARD_FORM);

      backdropOpacity.setValue(0);
      modalTranslateY.setValue(-600);
    });
  };

  const updateUpiForm = (field, value) => {
    setUpiForm(current => ({
      ...current,
      [field]: value,
    }));

    setErrors(current => ({
      ...current,
      [field]: '',
    }));
  };

  const updateCardForm = (field, value) => {
    setCardForm(current => ({
      ...current,
      [field]: value,
    }));

    setErrors(current => ({
      ...current,
      [field]: '',
    }));
  };

  const formatCardNumber = value => {
    const cleaned = value.replace(/[^0-9]/g, '').slice(0, 16);

    return cleaned.replace(/(.{4})/g, '$1 ').trim();
  };

  const formatExpiry = value => {
    const cleaned = value.replace(/[^0-9]/g, '').slice(0, 4);

    if (cleaned.length <= 2) {
      return cleaned;
    }

    return `${cleaned.slice(0, 2)}/${cleaned.slice(2)}`;
  };

  const validateUpi = () => {
    const nextErrors = {};

    const upiRegex = /^[a-zA-Z0-9.\-_]{2,}@[a-zA-Z]{2,}$/;

    if (!upiForm.holderName.trim()) {
      nextErrors.holderName = 'Account holder name required hai.';
    }

    if (!upiForm.upiId.trim()) {
      nextErrors.upiId = 'UPI ID required hai.';
    } else if (!upiRegex.test(upiForm.upiId.trim())) {
      nextErrors.upiId = 'Valid UPI ID enter karein.';
    }

    setErrors(nextErrors);

    return Object.keys(nextErrors).length === 0;
  };

  const validateCard = () => {
    const nextErrors = {};

    const cleanCardNumber = cardForm.cardNumber.replace(/[^0-9]/g, '');

    if (!cardForm.holderName.trim()) {
      nextErrors.holderName = 'Card holder name required hai.';
    }

    if (cleanCardNumber.length !== 16) {
      nextErrors.cardNumber = 'Valid 16-digit card number enter karein.';
    }

    if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(cardForm.expiry)) {
      nextErrors.expiry = 'Valid expiry MM/YY format mein enter karein.';
    }

    if (!editingId && cardForm.cvv.length !== 3) {
      nextErrors.cvv = 'Valid 3-digit CVV enter karein.';
    }

    setErrors(nextErrors);

    return Object.keys(nextErrors).length === 0;
  };

  const handleSavePayment = () => {
    if (paymentType === 'upi') {
      if (!validateUpi()) {
        return;
      }

      const paymentData = {
        type: 'upi',
        title: 'UPI',
        upiId: upiForm.upiId.trim(),
        holderName: upiForm.holderName.trim(),
        icon: 'phone-portrait-outline',
      };

      savePayment(paymentData);
      return;
    }

    if (paymentType === 'card') {
      if (!validateCard()) {
        return;
      }

      const cleanCardNumber = cardForm.cardNumber.replace(/[^0-9]/g, '');

      const paymentData = {
        type: 'card',
        title: detectCardName(cleanCardNumber),
        fullCardNumber: cleanCardNumber,
        cardNumber: cleanCardNumber.slice(-4),
        holderName: cardForm.holderName.trim(),
        expiry: cardForm.expiry,
        icon: 'card-outline',
      };

      savePayment(paymentData);
    }
  };

  const savePayment = paymentData => {
    if (editingId) {
      setPayments(current =>
        current.map(payment =>
          payment.id === editingId
            ? {
                ...payment,
                ...paymentData,
              }
            : payment,
        ),
      );
    } else {
      const newPayment = {
        id: `${paymentData.type}-${Date.now()}`,
        ...paymentData,
        isPrimary:
          payments.filter(payment => payment.type !== 'cod').length === 0,
        isFixed: false,
      };

      setPayments(current => {
        const codIndex = current.findIndex(payment => payment.type === 'cod');

        if (codIndex === -1) {
          return [...current, newPayment];
        }

        const next = [...current];
        next.splice(codIndex, 0, newPayment);

        return next;
      });
    }

    closeModal();
  };

  const detectCardName = cardNumber => {
    if (cardNumber.startsWith('4')) {
      return 'Visa Card';
    }

    if (
      cardNumber.startsWith('51') ||
      cardNumber.startsWith('52') ||
      cardNumber.startsWith('53') ||
      cardNumber.startsWith('54') ||
      cardNumber.startsWith('55')
    ) {
      return 'Mastercard';
    }

    if (cardNumber.startsWith('60')) {
      return 'RuPay Card';
    }

    return 'Bank Card';
  };

  const setPrimaryPayment = paymentId => {
    setPayments(current =>
      current.map(payment => ({
        ...payment,
        isPrimary: payment.id === paymentId,
      })),
    );
  };

  const removePayment = paymentId => {
    setPayments(current => {
      const targetPayment = current.find(payment => payment.id === paymentId);

      if (!targetPayment || targetPayment.isFixed) {
        return current;
      }

      const nextPayments = current.filter(payment => payment.id !== paymentId);

      if (targetPayment.isPrimary) {
        const firstSelectableIndex = nextPayments.findIndex(
          payment => payment.type !== 'cod',
        );

        if (firstSelectableIndex !== -1) {
          nextPayments[firstSelectableIndex] = {
            ...nextPayments[firstSelectableIndex],
            isPrimary: true,
          };
        }
      }

      return nextPayments;
    });
  };

  const getPaymentSubtitle = payment => {
    if (payment.type === 'upi') {
      return payment.upiId;
    }

    if (payment.type === 'card') {
      return `•••• •••• •••• ${payment.cardNumber}  •  Expires ${payment.expiry}`;
    }

    return payment.subtitle;
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />

      <ScreenHeader
        navigation={navigation}
        title="Payments"
        subtitle={`${payments.length} payment methods available`}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        <View style={styles.walletCard}>
          <View style={styles.walletGlowOne} />
          <View style={styles.walletGlowTwo} />

          <View style={styles.walletTop}>
            <View style={styles.walletIcon}>
              <Ionicons name="wallet-outline" size={23} color={COLORS.white} />
            </View>

            <View style={styles.walletContent}>
              <Text style={styles.walletLabel}>FoodMitra Wallet</Text>
              <Text style={styles.walletBalance}>₹250.00</Text>
            </View>

            <Pressable style={styles.addMoneyButton}>
              <Ionicons name="add" size={16} color={COLORS.primary} />

              <Text style={styles.addMoneyText}>Add money</Text>
            </Pressable>
          </View>

          <View style={styles.walletDivider} />

          <View style={styles.walletInfo}>
            <Ionicons
              name="shield-checkmark-outline"
              size={15}
              color="rgba(255,255,255,0.75)"
            />

            <Text style={styles.walletInfoText}>
              Secure payments powered by FoodMitra
            </Text>
          </View>
        </View>

        <View style={styles.sectionHeader}>
          <View>
            <Text style={styles.sectionTitle}>Saved methods</Text>

            <Text style={styles.sectionSubtitle}>
              Checkout ke time payment method select karein
            </Text>
          </View>

          <View style={styles.secureBadge}>
            <Ionicons name="lock-closed" size={13} color={COLORS.success} />

            <Text style={styles.secureBadgeText}>SECURE</Text>
          </View>
        </View>

        <View style={styles.paymentList}>
          {payments.map(payment => (
            <View key={payment.id} style={styles.paymentCard}>
              <View style={styles.paymentTop}>
                <View
                  style={[
                    styles.paymentIcon,
                    payment.type === 'cod' && styles.paymentIconCash,
                  ]}
                >
                  <Ionicons
                    name={payment.icon}
                    size={22}
                    color={
                      payment.type === 'cod' ? COLORS.success : COLORS.primary
                    }
                  />
                </View>

                <View style={styles.paymentContent}>
                  <View style={styles.paymentTitleRow}>
                    <Text style={styles.paymentTitle}>{payment.title}</Text>

                    {payment.isPrimary ? (
                      <View style={styles.primaryBadge}>
                        <Ionicons
                          name="checkmark-circle"
                          size={12}
                          color={COLORS.success}
                        />

                        <Text style={styles.primaryBadgeText}>Primary</Text>
                      </View>
                    ) : null}
                  </View>

                  <Text style={styles.paymentSubtitle}>
                    {getPaymentSubtitle(payment)}
                  </Text>

                  {payment.holderName ? (
                    <Text style={styles.holderName}>{payment.holderName}</Text>
                  ) : null}
                </View>
              </View>

              <View style={styles.paymentDivider} />

              <View style={styles.paymentActions}>
                {!payment.isPrimary && payment.type !== 'cod' ? (
                  <Pressable
                    onPress={() => setPrimaryPayment(payment.id)}
                    style={({ pressed }) => [
                      styles.primaryButton,
                      pressed && styles.pressed,
                    ]}
                  >
                    <Ionicons
                      name="checkmark-circle-outline"
                      size={16}
                      color={COLORS.primary}
                    />

                    <Text style={styles.primaryButtonText}>Set primary</Text>
                  </Pressable>
                ) : (
                  <View style={styles.paymentStatus}>
                    <Ionicons
                      name={
                        payment.type === 'cod'
                          ? 'cash-outline'
                          : 'shield-checkmark-outline'
                      }
                      size={15}
                      color={
                        payment.type === 'cod' ? COLORS.success : COLORS.success
                      }
                    />

                    <Text style={styles.paymentStatusText}>
                      {payment.type === 'cod'
                        ? 'Available on eligible orders'
                        : 'Preferred method'}
                    </Text>
                  </View>
                )}

                {!payment.isFixed ? (
                  <View style={styles.actionRight}>
                    <Pressable
                      onPress={() => openEditModal(payment)}
                      style={({ pressed }) => [
                        styles.iconButton,
                        pressed && styles.pressed,
                      ]}
                    >
                      <Ionicons
                        name="create-outline"
                        size={18}
                        color={COLORS.title}
                      />
                    </Pressable>

                    <Pressable
                      onPress={() => removePayment(payment.id)}
                      style={({ pressed }) => [
                        styles.iconButton,
                        styles.deleteButton,
                        pressed && styles.pressed,
                      ]}
                    >
                      <Ionicons
                        name="trash-outline"
                        size={18}
                        color={COLORS.danger}
                      />
                    </Pressable>
                  </View>
                ) : null}
              </View>
            </View>
          ))}
        </View>

        <Pressable
          onPress={openAddModal}
          style={({ pressed }) => [
            styles.addPaymentButton,
            pressed && styles.addPaymentButtonPressed,
          ]}
        >
          <View style={styles.addPaymentIcon}>
            <Ionicons name="add" size={22} color={COLORS.primary} />
          </View>

          <View style={styles.addPaymentContent}>
            <Text style={styles.addPaymentTitle}>Add payment method</Text>

            <Text style={styles.addPaymentSubtitle}>
              UPI ya card securely save karein
            </Text>
          </View>

          <Ionicons name="arrow-forward" size={19} color={COLORS.white} />
        </Pressable>

        <View style={styles.securityNote}>
          <Ionicons
            name="shield-checkmark-outline"
            size={20}
            color={COLORS.success}
          />

          <Text style={styles.securityNoteText}>
            FoodMitra aapka complete card number ya CVV publicly display nahi
            karta.
          </Text>
        </View>
      </ScrollView>

      <Modal
        visible={modalVisible}
        transparent
        animationType="none"
        statusBarTranslucent
        onRequestClose={closeModal}
      >
        <KeyboardAvoidingView
          style={styles.modalRoot}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <Animated.View
            style={[
              styles.backdrop,
              {
                opacity: backdropOpacity,
              },
            ]}
          >
            <Pressable style={StyleSheet.absoluteFill} onPress={closeModal} />
          </Animated.View>

          <Animated.View
            style={[
              styles.modalCard,
              {
                transform: [
                  {
                    translateY: modalTranslateY,
                  },
                ],
              },
            ]}
          >
            <SafeAreaView style={styles.modalSafeArea} edges={['top']}>
              <View style={styles.modalHeader}>
                <View>
                  <Text style={styles.modalEyebrow}>SECURE PAYMENT</Text>

                  <Text style={styles.modalTitle}>{modalTitle}</Text>
                </View>

                <Pressable onPress={closeModal} style={styles.closeButton}>
                  <Ionicons name="close" size={21} color={COLORS.title} />
                </Pressable>
              </View>

              <ScrollView
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.modalContent}
              >
                {!editingId ? (
                  <>
                    <Text style={styles.fieldSectionTitle}>
                      Select payment type
                    </Text>

                    <View style={styles.paymentTypeRow}>
                      {PAYMENT_TYPES.map(type => {
                        const selected = paymentType === type.id;

                        return (
                          <Pressable
                            key={type.id}
                            onPress={() => {
                              setPaymentType(type.id);
                              setErrors({});
                            }}
                            style={[
                              styles.paymentTypeButton,
                              selected && styles.paymentTypeButtonSelected,
                            ]}
                          >
                            <View
                              style={[
                                styles.paymentTypeIcon,
                                selected && styles.paymentTypeIconSelected,
                              ]}
                            >
                              <Ionicons
                                name={type.icon}
                                size={21}
                                color={selected ? COLORS.white : COLORS.primary}
                              />
                            </View>

                            <Text
                              style={[
                                styles.paymentTypeTitle,
                                selected && styles.paymentTypeTitleSelected,
                              ]}
                            >
                              {type.title}
                            </Text>

                            <Text
                              style={[
                                styles.paymentTypeSubtitle,
                                selected && styles.paymentTypeSubtitleSelected,
                              ]}
                            >
                              {type.subtitle}
                            </Text>
                          </Pressable>
                        );
                      })}
                    </View>
                  </>
                ) : null}

                <View style={styles.selectedTypeCard}>
                  <View style={styles.selectedTypeIcon}>
                    <Ionicons
                      name={selectedPaymentType?.icon}
                      size={21}
                      color={COLORS.primary}
                    />
                  </View>

                  <View>
                    <Text style={styles.selectedTypeLabel}>
                      {selectedPaymentType?.title}
                    </Text>

                    <Text style={styles.selectedTypeSubtitle}>
                      {selectedPaymentType?.subtitle}
                    </Text>
                  </View>
                </View>

                {paymentType === 'upi' ? (
                  <>
                    <FormInput
                      icon="person-outline"
                      label="Account holder name"
                      placeholder="UPI account holder name"
                      value={upiForm.holderName}
                      error={errors.holderName}
                      autoCapitalize="words"
                      onChangeText={value => updateUpiForm('holderName', value)}
                    />

                    <FormInput
                      icon="at-outline"
                      label="UPI ID"
                      placeholder="example@upi"
                      value={upiForm.upiId}
                      error={errors.upiId}
                      autoCapitalize="none"
                      keyboardType="email-address"
                      onChangeText={value =>
                        updateUpiForm('upiId', value.replace(/\s/g, ''))
                      }
                    />

                    <View style={styles.infoBox}>
                      <Ionicons
                        name="information-circle-outline"
                        size={18}
                        color={COLORS.primary}
                      />

                      <Text style={styles.infoBoxText}>
                        UPI ID verify karne ke baad payment method save hoga.
                      </Text>
                    </View>
                  </>
                ) : (
                  <>
                    <FormInput
                      icon="person-outline"
                      label="Card holder name"
                      placeholder="Name as shown on card"
                      value={cardForm.holderName}
                      error={errors.holderName}
                      autoCapitalize="characters"
                      onChangeText={value =>
                        updateCardForm('holderName', value)
                      }
                    />

                    <FormInput
                      icon="card-outline"
                      label="Card number"
                      placeholder="0000 0000 0000 0000"
                      value={cardForm.cardNumber}
                      error={errors.cardNumber}
                      keyboardType="number-pad"
                      maxLength={19}
                      onChangeText={value =>
                        updateCardForm('cardNumber', formatCardNumber(value))
                      }
                    />

                    <View style={styles.twoColumnRow}>
                      <View style={styles.halfField}>
                        <FormInput
                          icon="calendar-outline"
                          label="Expiry"
                          placeholder="MM/YY"
                          value={cardForm.expiry}
                          error={errors.expiry}
                          keyboardType="number-pad"
                          maxLength={5}
                          onChangeText={value =>
                            updateCardForm('expiry', formatExpiry(value))
                          }
                        />
                      </View>

                      <View style={styles.halfField}>
                        <FormInput
                          icon="lock-closed-outline"
                          label="CVV"
                          placeholder="•••"
                          value={cardForm.cvv}
                          error={errors.cvv}
                          keyboardType="number-pad"
                          maxLength={3}
                          secureTextEntry
                          onChangeText={value =>
                            updateCardForm('cvv', value.replace(/[^0-9]/g, ''))
                          }
                        />
                      </View>
                    </View>

                    <View style={styles.infoBox}>
                      <Ionicons
                        name="lock-closed-outline"
                        size={17}
                        color={COLORS.success}
                      />

                      <Text style={styles.infoBoxText}>
                        CVV sirf verification ke liye use hoga aur save nahi
                        kiya jayega.
                      </Text>
                    </View>
                  </>
                )}

                <Pressable
                  onPress={handleSavePayment}
                  style={({ pressed }) => [
                    styles.saveButton,
                    pressed && styles.saveButtonPressed,
                  ]}
                >
                  <Text style={styles.saveButtonText}>
                    {editingId
                      ? 'Update payment method'
                      : 'Save payment method'}
                  </Text>

                  <View style={styles.saveIcon}>
                    <Ionicons
                      name="checkmark"
                      size={20}
                      color={COLORS.primary}
                    />
                  </View>
                </Pressable>
              </ScrollView>
            </SafeAreaView>
          </Animated.View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}

function FormInput({ icon, label, error, style, ...inputProps }) {
  return (
    <View style={[styles.fieldWrapper, style]}>
      <Text style={styles.fieldLabel}>{label}</Text>

      <View
        style={[styles.inputContainer, error && styles.inputContainerError]}
      >
        <View style={styles.inputIcon}>
          <Ionicons
            name={icon}
            size={18}
            color={error ? COLORS.danger : COLORS.primary}
          />
        </View>

        <TextInput
          {...inputProps}
          style={styles.input}
          placeholderTextColor="#aaa1a0"
          selectionColor={COLORS.primary}
        />
      </View>

      {error ? (
        <View style={styles.errorRow}>
          <Ionicons
            name="alert-circle-outline"
            size={14}
            color={COLORS.danger}
          />

          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : null}
    </View>
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
    paddingBottom: 130,
  },

  walletCard: {
    padding: 17,
    overflow: 'hidden',
    borderRadius: 26,
    backgroundColor: COLORS.dark,
    shadowColor: COLORS.dark,
    shadowOffset: {
      width: 0,
      height: 12,
    },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 8,
  },

  walletGlowOne: {
    position: 'absolute',
    top: -60,
    right: -25,
    width: 155,
    height: 155,
    borderRadius: 78,
    backgroundColor: 'rgba(255,90,31,0.35)',
  },

  walletGlowTwo: {
    position: 'absolute',
    left: -60,
    bottom: -85,
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },

  walletTop: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  walletIcon: {
    width: 50,
    height: 50,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
  },

  walletContent: {
    flex: 1,
    marginLeft: 12,
  },

  walletLabel: {
    color: 'rgba(255,255,255,0.58)',
    fontSize: 9,
    fontWeight: '700',
  },

  walletBalance: {
    marginTop: 4,
    color: COLORS.white,
    fontSize: 20,
    fontWeight: '900',
  },

  addMoneyButton: {
    paddingHorizontal: 11,
    paddingVertical: 9,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 13,
    backgroundColor: COLORS.white,
  },

  addMoneyText: {
    marginLeft: 4,
    color: COLORS.primary,
    fontSize: 9,
    fontWeight: '900',
  },

  walletDivider: {
    height: 1,
    marginVertical: 15,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },

  walletInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  walletInfoText: {
    marginLeft: 7,
    color: 'rgba(255,255,255,0.55)',
    fontSize: 8.5,
    fontWeight: '600',
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

  secureBadge: {
    paddingHorizontal: 9,
    paddingVertical: 6,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 10,
    backgroundColor: '#ecfdf3',
  },

  secureBadgeText: {
    marginLeft: 4,
    color: COLORS.success,
    fontSize: 7.5,
    fontWeight: '900',
  },

  paymentList: {
    gap: 13,
  },

  paymentCard: {
    padding: 15,
    borderRadius: 23,
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

  paymentTop: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  paymentIcon: {
    width: 49,
    height: 49,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.soft,
  },

  paymentIconCash: {
    backgroundColor: '#ecfdf3',
  },

  paymentContent: {
    flex: 1,
    marginLeft: 12,
  },

  paymentTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  paymentTitle: {
    color: COLORS.title,
    fontSize: 12.5,
    fontWeight: '900',
  },

  primaryBadge: {
    marginLeft: 8,
    paddingHorizontal: 7,
    paddingVertical: 4,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 8,
    backgroundColor: '#ecfdf3',
  },

  primaryBadgeText: {
    marginLeft: 3,
    color: COLORS.success,
    fontSize: 7.5,
    fontWeight: '900',
  },

  paymentSubtitle: {
    marginTop: 6,
    color: COLORS.muted,
    fontSize: 9.5,
    lineHeight: 14,
  },

  holderName: {
    marginTop: 5,
    color: COLORS.text,
    fontSize: 8.5,
    fontWeight: '700',
  },

  paymentDivider: {
    height: 1,
    marginVertical: 14,
    backgroundColor: '#f2eeeb',
  },

  paymentActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  primaryButton: {
    paddingHorizontal: 10,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 11,
    backgroundColor: COLORS.soft,
  },

  primaryButtonText: {
    marginLeft: 5,
    color: COLORS.primary,
    fontSize: 8.5,
    fontWeight: '900',
  },

  paymentStatus: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  paymentStatusText: {
    marginLeft: 5,
    color: COLORS.success,
    fontSize: 8.5,
    fontWeight: '800',
  },

  actionRight: {
    flexDirection: 'row',
    gap: 8,
  },

  iconButton: {
    width: 38,
    height: 38,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.white,
  },

  deleteButton: {
    borderColor: '#fecaca',
    backgroundColor: '#fff7f7',
  },

  addPaymentButton: {
    minHeight: 66,
    marginTop: 18,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 21,
    backgroundColor: COLORS.primary,
    shadowColor: COLORS.primary,
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.22,
    shadowRadius: 14,
    elevation: 7,
  },

  addPaymentButtonPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.985 }],
  },

  addPaymentIcon: {
    width: 40,
    height: 40,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.white,
  },

  addPaymentContent: {
    flex: 1,
    marginLeft: 11,
  },

  addPaymentTitle: {
    color: COLORS.white,
    fontSize: 12.5,
    fontWeight: '900',
  },

  addPaymentSubtitle: {
    marginTop: 4,
    color: 'rgba(255,255,255,0.65)',
    fontSize: 8.5,
  },

  securityNote: {
    marginTop: 17,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 17,
    borderWidth: 1,
    borderColor: '#bbf7d0',
    backgroundColor: '#f0fdf4',
  },

  securityNoteText: {
    flex: 1,
    marginLeft: 9,
    color: '#477051',
    fontSize: 8.5,
    lineHeight: 13,
  },

  pressed: {
    opacity: 0.76,
    transform: [{ scale: 0.97 }],
  },

  modalRoot: {
    flex: 1,
    justifyContent: 'flex-start',
  },

  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(23,23,23,0.48)',
  },

  modalCard: {
    maxHeight: '92%',
    overflow: 'hidden',
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    backgroundColor: COLORS.background,
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 16,
    },
    shadowOpacity: 0.25,
    shadowRadius: 24,
    elevation: 20,
  },

  modalSafeArea: {
    backgroundColor: COLORS.background,
  },

  modalHeader: {
    paddingHorizontal: 18,
    paddingTop: 12,
    paddingBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },

  modalEyebrow: {
    color: COLORS.primary,
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 1,
  },

  modalTitle: {
    marginTop: 4,
    color: COLORS.title,
    fontSize: 20,
    fontWeight: '900',
  },

  closeButton: {
    width: 42,
    height: 42,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.white,
  },

  modalContent: {
    paddingHorizontal: 18,
    paddingTop: 18,
    paddingBottom: 40,
  },

  fieldSectionTitle: {
    marginBottom: 11,
    color: COLORS.title,
    fontSize: 11,
    fontWeight: '900',
  },

  paymentTypeRow: {
    marginBottom: 18,
    flexDirection: 'row',
    gap: 11,
  },

  paymentTypeButton: {
    flex: 1,
    minHeight: 116,
    padding: 13,
    borderRadius: 19,
    borderWidth: 1,
    borderColor: '#ffd6c4',
    backgroundColor: COLORS.soft,
  },

  paymentTypeButtonSelected: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primary,
  },

  paymentTypeIcon: {
    width: 39,
    height: 39,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.white,
  },

  paymentTypeIconSelected: {
    backgroundColor: 'rgba(255,255,255,0.17)',
  },

  paymentTypeTitle: {
    marginTop: 10,
    color: COLORS.title,
    fontSize: 12,
    fontWeight: '900',
  },

  paymentTypeTitleSelected: {
    color: COLORS.white,
  },

  paymentTypeSubtitle: {
    marginTop: 5,
    color: COLORS.muted,
    fontSize: 8,
    lineHeight: 12,
  },

  paymentTypeSubtitleSelected: {
    color: 'rgba(255,255,255,0.68)',
  },

  selectedTypeCard: {
    marginBottom: 18,
    padding: 13,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 17,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.white,
  },

  selectedTypeIcon: {
    width: 40,
    height: 40,
    marginRight: 10,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.soft,
  },

  selectedTypeLabel: {
    color: COLORS.title,
    fontSize: 11,
    fontWeight: '900',
  },

  selectedTypeSubtitle: {
    marginTop: 4,
    color: COLORS.muted,
    fontSize: 8.5,
  },

  fieldWrapper: {
    marginBottom: 15,
  },

  fieldLabel: {
    marginBottom: 8,
    color: COLORS.text,
    fontSize: 9.5,
    fontWeight: '800',
  },

  inputContainer: {
    height: 57,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 17,
    borderWidth: 1.3,
    borderColor: COLORS.border,
    backgroundColor: COLORS.white,
  },

  inputContainerError: {
    borderColor: '#ef4444',
    backgroundColor: '#fff7f7',
  },

  inputIcon: {
    width: 34,
    height: 34,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.soft,
  },

  input: {
    flex: 1,
    marginLeft: 10,
    color: COLORS.title,
    fontSize: 11.5,
    fontWeight: '700',
  },

  errorRow: {
    marginTop: 6,
    marginLeft: 4,
    flexDirection: 'row',
    alignItems: 'center',
  },

  errorText: {
    marginLeft: 5,
    color: COLORS.danger,
    fontSize: 8.5,
    fontWeight: '700',
  },

  twoColumnRow: {
    flexDirection: 'row',
    gap: 10,
  },

  halfField: {
    flex: 1,
  },

  infoBox: {
    marginBottom: 17,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#ffd6c4',
    backgroundColor: '#fff5ef',
  },

  infoBoxText: {
    flex: 1,
    marginLeft: 8,
    color: COLORS.muted,
    fontSize: 8.5,
    lineHeight: 13,
  },

  saveButton: {
    height: 60,
    marginTop: 5,
    paddingHorizontal: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
    backgroundColor: COLORS.primary,
    shadowColor: COLORS.primary,
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.22,
    shadowRadius: 14,
    elevation: 8,
  },

  saveButtonPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.985 }],
  },

  saveButtonText: {
    color: COLORS.white,
    fontSize: 13,
    fontWeight: '900',
  },

  saveIcon: {
    position: 'absolute',
    right: 13,
    width: 36,
    height: 36,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.white,
  },
});
