import React, { useState } from 'react';

import {
  ScrollView,
  StatusBar,
  StyleSheet,
  View,
} from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';

import ScreenHeader from '../../components/ScreenHeader';
import SettingRow from '../../components/SettingRow';

export default function NotificationsScreen({ navigation }) {
  const [orderUpdates, setOrderUpdates] = useState(true);
  const [offers, setOffers] = useState(true);
  const [sms, setSms] = useState(false);
  const [email, setEmail] = useState(false);

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#fffaf7" />

      <ScreenHeader
        navigation={navigation}
        title="Notifications"
        subtitle="Alerts ko apne hisaab se control karein"
      />

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.card}>
          <SettingRow
            icon="receipt-outline"
            label="Order updates"
            subtitle="Order confirmed, prepared aur delivered alerts"
            switchValue={orderUpdates}
            onSwitchChange={setOrderUpdates}
          />
          <View style={styles.divider} />
          <SettingRow
            icon="pricetag-outline"
            label="Offers & discounts"
            subtitle="Coupons aur restaurant deals"
            switchValue={offers}
            onSwitchChange={setOffers}
          />
          <View style={styles.divider} />
          <SettingRow
            icon="chatbubble-outline"
            label="SMS updates"
            subtitle="Important alerts by SMS"
            switchValue={sms}
            onSwitchChange={setSms}
          />
          <View style={styles.divider} />
          <SettingRow
            icon="mail-outline"
            label="Email updates"
            subtitle="Receipts aur monthly updates"
            switchValue={email}
            onSwitchChange={setEmail}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#fffaf7' },
  content: { padding: 18 },
  card: {
    overflow: 'hidden',
    borderRadius: 22,
    borderWidth: 1,
    borderColor: '#eee5df',
  },
  divider: {
    height: 1,
    marginLeft: 68,
    backgroundColor: '#f2eeeb',
  },
});
