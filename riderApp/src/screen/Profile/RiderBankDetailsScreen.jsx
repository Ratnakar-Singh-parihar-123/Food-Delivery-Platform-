import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Pressable,
  StatusBar,
  ActivityIndicator,
  Alert,
  ScrollView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import LinearGradient from 'react-native-linear-gradient';
import { getBankDetails, addBankDetails } from '../../api/riderApi';

const COLORS = {
  primary: '#FF6B35',
  primaryDark: '#E55A2B',
  primaryLight: '#FFF0EA',
  background: '#FFF8F5',
  white: '#FFFFFF',
  title: '#0F172A',
  text: '#334155',
  muted: '#64748B',
  lightMuted: '#94A3B8',
  border: '#E2E8F0',
  success: '#10B981',
  successBg: '#D1FAE5',
  cardBg: '#1E293B',
};

export default function RiderBankDetailsScreen({ navigation }) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('bank'); // 'bank' or 'upi'
  const [focusedInput, setFocusedInput] = useState(null);

  const [form, setForm] = useState({
    accountHolderName: '',
    accountNumber: '',
    ifscCode: '',
    bankName: '',
    upiId: '',
  });

  useEffect(() => {
    fetchBankDetails();
  }, []);

  const fetchBankDetails = async () => {
    try {
      setLoading(true);
      const res = await getBankDetails();
      if (res?.data) {
        setForm({
          accountHolderName: res.data.accountHolderName || '',
          accountNumber: res.data.accountNumber || '',
          ifscCode: res.data.ifscCode || '',
          bankName: res.data.bankName || '',
          upiId: res.data.upiId || '',
        });
      }
    } catch (error) {
      console.warn('Bank details not found');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (activeTab === 'bank') {
      const { accountHolderName, accountNumber, ifscCode, bankName } = form;
      if (!accountHolderName || !accountNumber || !ifscCode || !bankName) {
        Alert.alert(
          'Incomplete Form',
          'Please fill all required bank account fields.',
        );
        return;
      }
    } else {
      if (!form.upiId) {
        Alert.alert(
          'Incomplete Form',
          'Please enter a valid UPI ID for instant payout.',
        );
        return;
      }
    }

    try {
      setSaving(true);
      await addBankDetails(form);
      Alert.alert('Success', 'Bank payout details updated successfully!');
      navigation.goBack();
    } catch (error) {
      Alert.alert(
        'Update Failed',
        error.response?.data?.message || 'Failed to save bank details',
      );
    } finally {
      setSaving(false);
    }
  };

  const maskAccountNumber = accNo => {
    if (!accNo || accNo.length < 4) return '•••• •••• ••••';
    return `•••• •••• ${accNo.slice(-4)}`;
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Navigation Bar */}
        <View style={styles.headerRow}>
          <Pressable
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={22} color={COLORS.title} />
          </Pressable>
          <Text style={styles.headerTitle}>Payout Settings</Text>
          <View style={{ width: 40 }} />
        </View>

        {/* Live Virtual Bank Card Preview */}
        <LinearGradient
          colors={['#1E293B', '#0F172A']}
          style={styles.virtualCard}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.cardHeader}>
            <View style={styles.chipIcon}>
              <Ionicons
                name="hardware-chip-outline"
                size={28}
                color="#F59E0B"
              />
            </View>
            <Text style={styles.bankNameText}>
              {form.bankName ? form.bankName.toUpperCase() : 'YOUR BANK'}
            </Text>
          </View>

          <Text style={styles.cardNumberText}>
            {maskAccountNumber(form.accountNumber)}
          </Text>

          <View style={styles.cardFooter}>
            <View>
              <Text style={styles.cardLabel}>ACCOUNT HOLDER</Text>
              <Text style={styles.cardHolderText} numberOfLines={1}>
                {form.accountHolderName
                  ? form.accountHolderName.toUpperCase()
                  : 'RIDER NAME'}
              </Text>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={styles.cardLabel}>IFSC CODE</Text>
              <Text style={styles.cardIfscText}>
                {form.ifscCode ? form.ifscCode.toUpperCase() : 'IFSC0000'}
              </Text>
            </View>
          </View>
        </LinearGradient>

        {/* Tab Switcher */}
        <View style={styles.tabBar}>
          <Pressable
            style={[
              styles.tabItem,
              activeTab === 'bank' && styles.activeTabItem,
            ]}
            onPress={() => setActiveTab('bank')}
          >
            <Ionicons
              name="card-outline"
              size={18}
              color={activeTab === 'bank' ? COLORS.primary : COLORS.muted}
            />
            <Text
              style={[
                styles.tabText,
                activeTab === 'bank' && styles.activeTabText,
              ]}
            >
              Bank Account
            </Text>
          </Pressable>

          <Pressable
            style={[
              styles.tabItem,
              activeTab === 'upi' && styles.activeTabItem,
            ]}
            onPress={() => setActiveTab('upi')}
          >
            <Ionicons
              name="qr-code-outline"
              size={18}
              color={activeTab === 'upi' ? COLORS.primary : COLORS.muted}
            />
            <Text
              style={[
                styles.tabText,
                activeTab === 'upi' && styles.activeTabText,
              ]}
            >
              Instant UPI
            </Text>
          </Pressable>
        </View>

        {/* Form Container */}
        <View style={styles.formContainer}>
          {activeTab === 'bank' ? (
            <>
              {/* Account Holder Name */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Account Holder Name *</Text>
                <View
                  style={[
                    styles.inputWrapper,
                    focusedInput === 'name' && styles.focusedInputWrapper,
                  ]}
                >
                  <Ionicons
                    name="person-outline"
                    size={20}
                    color={COLORS.muted}
                  />
                  <TextInput
                    style={styles.input}
                    value={form.accountHolderName}
                    onFocus={() => setFocusedInput('name')}
                    onBlur={() => setFocusedInput(null)}
                    onChangeText={t =>
                      setForm({ ...form, accountHolderName: t })
                    }
                    placeholder="e.g. Rahul Sharma"
                    placeholderTextColor={COLORS.lightMuted}
                  />
                </View>
              </View>

              {/* Account Number */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Account Number *</Text>
                <View
                  style={[
                    styles.inputWrapper,
                    focusedInput === 'accNo' && styles.focusedInputWrapper,
                  ]}
                >
                  <Ionicons
                    name="keypad-outline"
                    size={20}
                    color={COLORS.muted}
                  />
                  <TextInput
                    style={styles.input}
                    value={form.accountNumber}
                    onFocus={() => setFocusedInput('accNo')}
                    onBlur={() => setFocusedInput(null)}
                    onChangeText={t => setForm({ ...form, accountNumber: t })}
                    placeholder="e.g. 01234567890"
                    placeholderTextColor={COLORS.lightMuted}
                    keyboardType="number-pad"
                  />
                </View>
              </View>

              {/* IFSC Code */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>IFSC Code *</Text>
                <View
                  style={[
                    styles.inputWrapper,
                    focusedInput === 'ifsc' && styles.focusedInputWrapper,
                  ]}
                >
                  <Ionicons
                    name="business-outline"
                    size={20}
                    color={COLORS.muted}
                  />
                  <TextInput
                    style={styles.input}
                    value={form.ifscCode}
                    onFocus={() => setFocusedInput('ifsc')}
                    onBlur={() => setFocusedInput(null)}
                    onChangeText={t =>
                      setForm({ ...form, ifscCode: t.toUpperCase() })
                    }
                    placeholder="e.g. SBIN0001234"
                    placeholderTextColor={COLORS.lightMuted}
                    autoCapitalize="characters"
                  />
                </View>
              </View>

              {/* Bank Name */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Bank Name *</Text>
                <View
                  style={[
                    styles.inputWrapper,
                    focusedInput === 'bank' && styles.focusedInputWrapper,
                  ]}
                >
                  <Ionicons
                    name="location-outline"
                    size={20}
                    color={COLORS.muted}
                  />
                  <TextInput
                    style={styles.input}
                    value={form.bankName}
                    onFocus={() => setFocusedInput('bank')}
                    onBlur={() => setFocusedInput(null)}
                    onChangeText={t => setForm({ ...form, bankName: t })}
                    placeholder="e.g. State Bank of India"
                    placeholderTextColor={COLORS.lightMuted}
                  />
                </View>
              </View>
            </>
          ) : (
            /* UPI ID Form */
            <View style={styles.inputGroup}>
              <Text style={styles.label}>VPA / UPI ID *</Text>
              <View
                style={[
                  styles.inputWrapper,
                  focusedInput === 'upi' && styles.focusedInputWrapper,
                ]}
              >
                <Ionicons name="at-outline" size={20} color={COLORS.muted} />
                <TextInput
                  style={styles.input}
                  value={form.upiId}
                  onFocus={() => setFocusedInput('upi')}
                  onBlur={() => setFocusedInput(null)}
                  onChangeText={t => setForm({ ...form, upiId: t })}
                  placeholder="e.g. 9876543210@paytm / name@okaxis"
                  placeholderTextColor={COLORS.lightMuted}
                  autoCapitalize="none"
                />
              </View>
              <Text style={styles.helperText}>
                Weekly and daily earnings will be automatically credited to this
                UPI ID.
              </Text>
            </View>
          )}

          {/* Security Assurance Badge */}
          <View style={styles.securityBadge}>
            <Ionicons
              name="shield-checkmark"
              size={20}
              color={COLORS.success}
            />
            <Text style={styles.securityText}>
              256-bit encrypted & secure payout gateway integration.
            </Text>
          </View>

          {/* Save Button */}
          <Pressable
            style={[styles.saveBtnContainer, saving && styles.disabledBtn]}
            onPress={handleSave}
            disabled={saving}
          >
            <LinearGradient
              colors={[COLORS.primary, COLORS.primaryDark]}
              style={styles.saveGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              {saving ? (
                <ActivityIndicator color="#FFF" />
              ) : (
                <>
                  <Text style={styles.saveText}>Save Payout Details</Text>
                  <Ionicons name="checkmark-circle" size={20} color="#FFF" />
                </>
              )}
            </LinearGradient>
          </Pressable>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.background },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  container: { flex: 1, paddingHorizontal: 18, paddingTop: 8 },

  /* Header */
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.title,
  },

  /* Virtual Card Preview */
  virtualCard: {
    borderRadius: 22,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 14,
    elevation: 8,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  chipIcon: {
    opacity: 0.9,
  },
  bankNameText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#FFF',
    letterSpacing: 1,
  },
  cardNumberText: {
    fontSize: 20,
    fontWeight: '800',
    color: '#FFF',
    letterSpacing: 2,
    marginBottom: 24,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  cardLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: COLORS.lightMuted,
    letterSpacing: 0.8,
    marginBottom: 2,
  },
  cardHolderText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#FFF',
    maxWidth: 160,
  },
  cardIfscText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#FFF',
  },

  /* Tab Bar */
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#F1F5F9',
    borderRadius: 16,
    padding: 4,
    marginBottom: 18,
  },
  tabItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 12,
  },
  activeTabItem: {
    backgroundColor: COLORS.white,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  tabText: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.muted,
  },
  activeTabText: {
    color: COLORS.primary,
  },

  /* Form Container */
  formContainer: {
    backgroundColor: COLORS.white,
    borderRadius: 22,
    padding: 18,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 2,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.title,
    marginBottom: 6,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    height: 52,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    borderRadius: 14,
    paddingHorizontal: 14,
    backgroundColor: '#F8FAFC',
  },
  focusedInputWrapper: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.white,
  },
  input: {
    flex: 1,
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.title,
  },
  helperText: {
    fontSize: 11,
    color: COLORS.muted,
    marginTop: 6,
    lineHeight: 16,
  },

  /* Security Badge */
  securityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: COLORS.successBg,
    padding: 12,
    borderRadius: 14,
    marginVertical: 10,
  },
  securityText: {
    flex: 1,
    fontSize: 12,
    fontWeight: '700',
    color: '#065F46',
  },

  /* Save CTA */
  saveBtnContainer: {
    borderRadius: 16,
    overflow: 'hidden',
    marginTop: 10,
  },
  saveGradient: {
    height: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  disabledBtn: {
    opacity: 0.6,
  },
  saveText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '800',
  },
});
