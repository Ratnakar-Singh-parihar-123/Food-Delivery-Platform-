// screens/partner/BankDetailsScreen.js
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  Pressable,
  StatusBar,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from '@react-native-vector-icons/ionicons';
import { COLORS } from '../../constants/colors';

const BankDetailsScreen = ({ navigation }) => {
  const [bank, setBank] = useState({
    accountHolder: 'Rajesh Kumar',
    bankName: 'State Bank of India',
    accountNumber: '1234567890',
    ifsc: 'SBIN0001234',
    upi: 'rajesh@upi',
  });

  const handleSave = () => {
    Alert.alert('Success', 'Bank details updated!');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={COLORS.title} />
        </Pressable>
        <Text style={styles.headerTitle}>Bank / UPI</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.card}>
          <View style={styles.field}>
            <Text style={styles.label}>Account Holder Name</Text>
            <TextInput
              style={styles.input}
              value={bank.accountHolder}
              onChangeText={text => setBank({ ...bank, accountHolder: text })}
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Bank Name</Text>
            <TextInput
              style={styles.input}
              value={bank.bankName}
              onChangeText={text => setBank({ ...bank, bankName: text })}
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Account Number</Text>
            <TextInput
              style={styles.input}
              value={bank.accountNumber}
              onChangeText={text => setBank({ ...bank, accountNumber: text })}
              keyboardType="numeric"
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>IFSC Code</Text>
            <TextInput
              style={styles.input}
              value={bank.ifsc}
              onChangeText={text => setBank({ ...bank, ifsc: text })}
              autoCapitalize="characters"
            />
          </View>

          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>OR</Text>
            <View style={styles.dividerLine} />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>UPI ID</Text>
            <TextInput
              style={styles.input}
              value={bank.upi}
              onChangeText={text => setBank({ ...bank, upi: text })}
              placeholder="e.g. name@upi"
            />
          </View>

          <Pressable style={styles.saveBtn} onPress={handleSave}>
            <Text style={styles.saveText}>Save Details</Text>
          </Pressable>
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
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
    marginBottom: 20,
  },
  field: { marginBottom: 14 },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 4,
  },
  input: {
    height: 46,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 10,
    paddingHorizontal: 12,
    fontSize: 14,
    backgroundColor: '#faf8f7',
  },
  divider: { flexDirection: 'row', alignItems: 'center', marginVertical: 12 },
  dividerLine: { flex: 1, height: 1, backgroundColor: '#e5e7eb' },
  dividerText: { paddingHorizontal: 12, color: COLORS.muted, fontSize: 12 },
  saveBtn: {
    backgroundColor: COLORS.primary,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  saveText: { color: COLORS.white, fontSize: 16, fontWeight: '700' },
});

export default BankDetailsScreen;
