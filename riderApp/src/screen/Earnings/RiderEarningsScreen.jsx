import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  StatusBar,
  ActivityIndicator,
  RefreshControl,
  Alert,
  Modal,
  TextInput,
  Dimensions,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import LinearGradient from 'react-native-linear-gradient';

import { getRiderEarnings, requestWithdrawal } from '../../api/riderApi';

const { width } = Dimensions.get('window');

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
  warning: '#F59E0B',
  warningBg: '#FEF3C7',
  cardShadow: 'rgba(0,0,0,0.04)',
};

export default function RiderEarningsScreen({ navigation }) {
  const [earnings, setEarnings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawLoading, setWithdrawLoading] = useState(false);

  const fetchEarnings = useCallback(async () => {
    try {
      setLoading(true);
      const res = await getRiderEarnings();
      setEarnings(res.data);
    } catch (error) {
      console.error('Earnings fetch error:', error);
      Alert.alert('Error', 'Failed to load earnings');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchEarnings();
  }, [fetchEarnings]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchEarnings();
  };

  const handleWithdraw = async () => {
    const amount = parseFloat(withdrawAmount);
    if (!amount || amount <= 0) {
      Alert.alert('Error', 'Please enter a valid amount');
      return;
    }
    if (amount > (earnings?.availableBalance || 0)) {
      Alert.alert('Error', 'Insufficient balance');
      return;
    }
    try {
      setWithdrawLoading(true);
      await requestWithdrawal({ amount });
      Alert.alert('Success', 'Withdrawal request submitted successfully!');
      setShowWithdrawModal(false);
      setWithdrawAmount('');
      fetchEarnings();
    } catch (error) {
      Alert.alert(
        'Error',
        error.response?.data?.message || 'Failed to request withdrawal',
      );
    } finally {
      setWithdrawLoading(false);
    }
  };

  const selectQuickAmount = val => {
    if (val === 'MAX') {
      setWithdrawAmount(String(earnings?.availableBalance || 0));
    } else {
      setWithdrawAmount(String(val));
    }
  };

  if (loading && !refreshing) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
      <ScrollView
        style={styles.container}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={COLORS.primary}
          />
        }
      >
        {/* Navigation Bar */}
        <View style={styles.headerRow}>
          <Pressable
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={22} color={COLORS.title} />
          </Pressable>
          <Text style={styles.headerTitle}>Earnings Dashboard</Text>
          <View style={{ width: 40 }} />
        </View>

        {/* Main Wallet Card */}
        <LinearGradient
          colors={['#1E293B', '#0F172A']}
          style={styles.walletCard}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.walletTopRow}>
            <View style={styles.walletLabelBadge}>
              <Ionicons
                name="wallet-outline"
                size={14}
                color={COLORS.primary}
              />
              <Text style={styles.walletLabelText}>TOTAL EARNINGS</Text>
            </View>
            <Ionicons name="sparkles" size={20} color="#F59E0B" />
          </View>

          <Text style={styles.balanceValue}>₹{earnings?.total || 0}</Text>

          <View style={styles.divider} />

          <View style={styles.walletBottomRow}>
            <View>
              <Text style={styles.availBalanceLabel}>Available Balance</Text>
              <Text style={styles.availBalanceValue}>
                ₹{earnings?.availableBalance || 0}
              </Text>
            </View>

            <Pressable
              style={[
                styles.withdrawBtn,
                !earnings?.availableBalance && styles.disabledWithdrawBtn,
              ]}
              onPress={() => setShowWithdrawModal(true)}
              disabled={!earnings?.availableBalance}
            >
              <LinearGradient
                colors={
                  earnings?.availableBalance
                    ? [COLORS.primary, COLORS.primaryDark]
                    : ['#64748B', '#475569']
                }
                style={styles.withdrawGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <Text style={styles.withdrawBtnText}>Withdraw</Text>
                <Ionicons name="arrow-forward" size={16} color="#FFF" />
              </LinearGradient>
            </Pressable>
          </View>
        </LinearGradient>

        {/* Earnings Stats Row */}
        <Text style={styles.sectionTitle}>Overview</Text>
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <View style={[styles.statIconBg, { backgroundColor: '#E0F2FE' }]}>
              <Ionicons name="today-outline" size={18} color="#0284C7" />
            </View>
            <Text style={styles.statValue}>₹{earnings?.today || 0}</Text>
            <Text style={styles.statLabel}>Today</Text>
          </View>

          <View style={styles.statCard}>
            <View style={[styles.statIconBg, { backgroundColor: '#EDE9FE' }]}>
              <Ionicons name="calendar-outline" size={18} color="#7C3AED" />
            </View>
            <Text style={styles.statValue}>₹{earnings?.thisWeek || 0}</Text>
            <Text style={styles.statLabel}>This Week</Text>
          </View>

          <View style={styles.statCard}>
            <View style={[styles.statIconBg, { backgroundColor: '#DCFCE7' }]}>
              <Ionicons name="stats-chart-outline" size={18} color="#16A34A" />
            </View>
            <Text style={styles.statValue}>₹{earnings?.thisMonth || 0}</Text>
            <Text style={styles.statLabel}>This Month</Text>
          </View>
        </View>

        {/* Withdrawal History Section */}
        <View style={styles.historySection}>
          <View style={styles.historyHeaderRow}>
            <Text style={styles.historyTitle}>Withdrawal History</Text>
            <Ionicons name="time-outline" size={18} color={COLORS.muted} />
          </View>

          {earnings?.withdrawals?.length > 0 ? (
            earnings.withdrawals.map(item => {
              const isCompleted = item.status === 'completed';
              return (
                <View key={item._id} style={styles.historyItem}>
                  <View style={styles.historyLeft}>
                    <View
                      style={[
                        styles.transIconCircle,
                        {
                          backgroundColor: isCompleted
                            ? COLORS.successBg
                            : COLORS.warningBg,
                        },
                      ]}
                    >
                      <Ionicons
                        name={
                          isCompleted ? 'arrow-down-outline' : 'time-outline'
                        }
                        size={18}
                        color={isCompleted ? COLORS.success : COLORS.warning}
                      />
                    </View>
                    <View>
                      <Text style={styles.historyAmount}>- ₹{item.amount}</Text>
                      <Text style={styles.historyDate}>
                        {new Date(item.createdAt).toLocaleDateString('en-IN', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </Text>
                    </View>
                  </View>

                  <View
                    style={[
                      styles.historyStatusBadge,
                      {
                        backgroundColor: isCompleted
                          ? COLORS.successBg
                          : COLORS.warningBg,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.historyStatusText,
                        {
                          color: isCompleted ? COLORS.success : COLORS.warning,
                        },
                      ]}
                    >
                      {item.status || 'Pending'}
                    </Text>
                  </View>
                </View>
              );
            })
          ) : (
            <View style={styles.emptyHistoryState}>
              <View style={styles.emptyIconCircle}>
                <Ionicons
                  name="receipt-outline"
                  size={32}
                  color={COLORS.lightMuted}
                />
              </View>
              <Text style={styles.emptyText}>No Withdrawals Yet</Text>
              <Text style={styles.emptySubtext}>
                Your payout history and transfer logs will show up here.
              </Text>
            </View>
          )}
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Withdrawal Bottom Sheet Modal */}
      <Modal visible={showWithdrawModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.bottomSheetContent}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>Withdraw Funds</Text>
                <Text style={styles.modalSubTitle}>
                  Transfer directly to your linked bank account
                </Text>
              </View>
              <Pressable
                onPress={() => setShowWithdrawModal(false)}
                style={styles.modalCloseBtn}
              >
                <Ionicons name="close" size={20} color={COLORS.title} />
              </Pressable>
            </View>

            <View style={styles.availCard}>
              <Text style={styles.availCardLabel}>Available for Transfer</Text>
              <Text style={styles.availCardAmount}>
                ₹{earnings?.availableBalance || 0}
              </Text>
            </View>

            {/* Amount Input */}
            <View style={styles.inputContainer}>
              <Text style={styles.currencyPrefix}>₹</Text>
              <TextInput
                style={styles.input}
                placeholder="0"
                placeholderTextColor={COLORS.lightMuted}
                keyboardType="numeric"
                value={withdrawAmount}
                onChangeText={setWithdrawAmount}
              />
            </View>

            {/* Quick Chips */}
            <View style={styles.quickChipsRow}>
              {[500, 1000, 2000, 'MAX'].map(chip => (
                <Pressable
                  key={chip}
                  style={styles.chipBtn}
                  onPress={() => selectQuickAmount(chip)}
                >
                  <Text style={styles.chipText}>
                    {chip === 'MAX' ? 'MAX' : `+₹${chip}`}
                  </Text>
                </Pressable>
              ))}
            </View>

            {/* Submit Action */}
            <Pressable
              style={[
                styles.modalWithdrawBtn,
                withdrawLoading && styles.disabledBtn,
              ]}
              onPress={handleWithdraw}
              disabled={withdrawLoading}
            >
              <LinearGradient
                colors={[COLORS.primary, COLORS.primaryDark]}
                style={styles.modalGradientBtn}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                {withdrawLoading ? (
                  <ActivityIndicator color="#FFF" />
                ) : (
                  <>
                    <Text style={styles.modalWithdrawText}>Request Payout</Text>
                    <Ionicons name="checkmark-circle" size={20} color="#FFF" />
                  </>
                )}
              </LinearGradient>
            </Pressable>
          </View>
        </View>
      </Modal>
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

  /* Wallet Card */
  walletCard: {
    borderRadius: 24,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 8,
  },
  walletTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  walletLabelBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  walletLabelText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#FFF',
    letterSpacing: 0.5,
  },
  balanceValue: {
    fontSize: 38,
    fontWeight: '900',
    color: '#FFF',
    marginTop: 12,
    letterSpacing: -0.5,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    marginVertical: 16,
  },
  walletBottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  availBalanceLabel: {
    fontSize: 12,
    color: COLORS.lightMuted,
    fontWeight: '600',
  },
  availBalanceValue: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFF',
    marginTop: 2,
  },
  withdrawBtn: {
    borderRadius: 14,
    overflow: 'hidden',
  },
  disabledWithdrawBtn: {
    opacity: 0.6,
  },
  withdrawGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  withdrawBtnText: {
    color: '#FFF',
    fontWeight: '800',
    fontSize: 14,
  },

  /* Stats Section */
  sectionTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: COLORS.title,
    marginBottom: 12,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderRadius: 18,
    padding: 14,
    alignItems: 'flex-start',
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 2,
  },
  statIconBg: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  statValue: { fontSize: 18, fontWeight: '900', color: COLORS.title },
  statLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.muted,
    marginTop: 2,
  },

  /* History Section */
  historySection: {
    backgroundColor: COLORS.white,
    borderRadius: 22,
    padding: 18,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  historyHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  historyTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.title,
  },
  historyItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  historyLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  transIconCircle: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  historyAmount: { fontSize: 15, fontWeight: '800', color: COLORS.title },
  historyDate: { fontSize: 12, color: COLORS.muted, marginTop: 2 },
  historyStatusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  historyStatusText: {
    fontSize: 11,
    fontWeight: '800',
    textTransform: 'capitalize',
  },

  /* Empty History */
  emptyHistoryState: {
    alignItems: 'center',
    paddingVertical: 30,
  },
  emptyIconCircle: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  emptyText: { fontSize: 15, fontWeight: '800', color: COLORS.title },
  emptySubtext: {
    fontSize: 12,
    color: COLORS.muted,
    textAlign: 'center',
    marginTop: 4,
  },

  /* Modal Bottom Sheet */
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    justifyContent: 'flex-end',
  },
  bottomSheetContent: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 20,
    paddingBottom: Platform.OS === 'ios' ? 40 : 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  modalTitle: { fontSize: 20, fontWeight: '900', color: COLORS.title },
  modalSubTitle: { fontSize: 12, color: COLORS.muted, marginTop: 2 },
  modalCloseBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  availCard: {
    backgroundColor: COLORS.primaryLight,
    padding: 14,
    borderRadius: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  availCardLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.primaryDark,
  },
  availCardAmount: {
    fontSize: 18,
    fontWeight: '900',
    color: COLORS.primaryDark,
  },

  /* Input */
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: COLORS.primary,
    borderRadius: 18,
    paddingHorizontal: 16,
    backgroundColor: '#FFF',
    marginBottom: 12,
    height: 56,
  },
  currencyPrefix: {
    fontSize: 24,
    fontWeight: '900',
    color: COLORS.title,
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 24,
    fontWeight: '800',
    color: COLORS.title,
  },

  /* Chips */
  quickChipsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 20,
  },
  chipBtn: {
    flex: 1,
    backgroundColor: '#F1F5F9',
    paddingVertical: 8,
    borderRadius: 12,
    alignItems: 'center',
  },
  chipText: { fontSize: 12, fontWeight: '800', color: COLORS.text },

  /* Modal Action Button */
  modalWithdrawBtn: {
    borderRadius: 18,
    overflow: 'hidden',
  },
  modalGradientBtn: {
    height: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  disabledBtn: { opacity: 0.6 },
  modalWithdrawText: { color: '#FFF', fontSize: 16, fontWeight: '800' },
});
