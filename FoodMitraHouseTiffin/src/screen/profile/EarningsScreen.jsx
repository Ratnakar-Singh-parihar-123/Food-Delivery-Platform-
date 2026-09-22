// screens/partner/EarningsScreen.js
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  StatusBar,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from '@react-native-vector-icons/ionicons';
import LinearGradient from 'react-native-linear-gradient';
import { COLORS } from '../../constants/colors';

// ─── DUMMY DATA ────────────────────────────────────────────
const EARNINGS_SUMMARY = {
  total: '₹45,240',
  today: '₹1,245',
  week: '₹8,430',
  month: '₹32,180',
};

const TRANSACTIONS = [
  {
    id: '1',
    order: 'ORD-007',
    customer: 'Priya Sharma',
    amount: '₹240',
    date: 'Today, 2:30 PM',
    status: 'completed',
  },
  {
    id: '2',
    order: 'ORD-006',
    customer: 'Rajesh Kumar',
    amount: '₹180',
    date: 'Today, 1:00 PM',
    status: 'completed',
  },
  {
    id: '3',
    order: 'ORD-005',
    customer: 'Amit Singh',
    amount: '₹450',
    date: 'Yesterday, 8:00 PM',
    status: 'pending',
  },
  {
    id: '4',
    order: 'ORD-004',
    customer: 'Kavita Patel',
    amount: '₹320',
    date: 'Yesterday, 7:30 PM',
    status: 'completed',
  },
  {
    id: '5',
    order: 'ORD-003',
    customer: 'Suresh Yadav',
    amount: '₹160',
    date: '2 days ago',
    status: 'completed',
  },
  {
    id: '6',
    order: 'ORD-002',
    customer: 'Mohan Verma',
    amount: '₹220',
    date: '3 days ago',
    status: 'refunded',
  },
];

const EarningsScreen = ({ navigation }) => {
  const renderTransaction = ({ item }) => {
    const statusColor =
      item.status === 'completed'
        ? COLORS.success
        : item.status === 'pending'
        ? '#f59e0b'
        : '#ef4444';

    return (
      <View style={styles.transactionCard}>
        <View style={styles.transLeft}>
          <Text style={styles.transOrder}>{item.order}</Text>
          <Text style={styles.transCustomer}>{item.customer}</Text>
          <Text style={styles.transDate}>{item.date}</Text>
        </View>
        <View style={styles.transRight}>
          <Text style={styles.transAmount}>{item.amount}</Text>
          <View style={[styles.statusBadge, { backgroundColor: statusColor }]}>
            <Text style={styles.statusText}>{item.status}</Text>
          </View>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={COLORS.title} />
        </Pressable>
        <Text style={styles.headerTitle}>Total Earnings</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Total Earnings Card */}
        <LinearGradient
          colors={[COLORS.primary, COLORS.primaryDark]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.totalCard}
        >
          <Text style={styles.totalLabel}>Total Earnings</Text>
          <Text style={styles.totalAmount}>{EARNINGS_SUMMARY.total}</Text>
          <View style={styles.summaryRow}>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryValue}>{EARNINGS_SUMMARY.today}</Text>
              <Text style={styles.summaryLabel}>Today</Text>
            </View>
            <View style={styles.summaryDivider} />
            <View style={styles.summaryItem}>
              <Text style={styles.summaryValue}>{EARNINGS_SUMMARY.week}</Text>
              <Text style={styles.summaryLabel}>This Week</Text>
            </View>
            <View style={styles.summaryDivider} />
            <View style={styles.summaryItem}>
              <Text style={styles.summaryValue}>{EARNINGS_SUMMARY.month}</Text>
              <Text style={styles.summaryLabel}>This Month</Text>
            </View>
          </View>
        </LinearGradient>

        {/* Transaction History */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Transaction History</Text>
          <FlatList
            data={TRANSACTIONS}
            keyExtractor={item => item.id}
            renderItem={renderTransaction}
            scrollEnabled={false}
            contentContainerStyle={{ paddingBottom: 20 }}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backBtn: { padding: 4 },
  headerTitle: { fontSize: 20, fontWeight: '900', color: COLORS.title },
  container: { flex: 1, paddingHorizontal: 16 },

  // ─── TOTAL EARNINGS CARD ──────────────────────────────
  totalCard: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 6,
  },
  totalLabel: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14,
    fontWeight: '500',
  },
  totalAmount: {
    color: COLORS.white,
    fontSize: 32,
    fontWeight: '900',
    marginTop: 4,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.15)',
  },
  summaryItem: { alignItems: 'center' },
  summaryValue: { color: COLORS.white, fontSize: 18, fontWeight: '700' },
  summaryLabel: { color: 'rgba(255,255,255,0.7)', fontSize: 11, marginTop: 2 },
  summaryDivider: { width: 1, backgroundColor: 'rgba(255,255,255,0.2)' },

  // ─── SECTION ──────────────────────────────────────────────
  section: { flex: 1 },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.title,
    marginBottom: 12,
  },

  // ─── TRANSACTION CARD ────────────────────────────────────
  transactionCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  transLeft: { flex: 1 },
  transOrder: { fontSize: 14, fontWeight: '700', color: COLORS.title },
  transCustomer: { fontSize: 13, color: COLORS.text, marginTop: 2 },
  transDate: { fontSize: 11, color: COLORS.muted, marginTop: 2 },
  transRight: { alignItems: 'flex-end' },
  transAmount: { fontSize: 16, fontWeight: '800', color: COLORS.primary },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    marginTop: 4,
  },
  statusText: {
    color: COLORS.white,
    fontSize: 9,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
});

export default EarningsScreen;
