import React from 'react';

import {
  ScrollView,
  StatusBar,
  StyleSheet,
  View,
} from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';

import ScreenHeader from '../../components/ScreenHeader';
import SettingRow from '../../components/SettingRow';

export default function HelpSupportScreen({ navigation }) {
  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#fffaf7" />

      <ScreenHeader
        navigation={navigation}
        title="Help & support"
        subtitle="Hum aapki madad ke liye yahan hain"
      />

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.card}>
          <SettingRow
            icon="receipt-outline"
            label="Order related help"
            subtitle="Current ya previous order ke liye support"
            onPress={() => {}}
          />
          <View style={styles.divider} />
          <SettingRow
            icon="chatbubbles-outline"
            label="Chat with support"
            subtitle="Support executive se baat karein"
            onPress={() => {}}
          />
          <View style={styles.divider} />
          <SettingRow
            icon="call-outline"
            label="Call us"
            subtitle="10:00 AM se 10:00 PM tak"
            onPress={() => {}}
          />
          <View style={styles.divider} />
          <SettingRow
            icon="help-circle-outline"
            label="Frequently asked questions"
            subtitle="Common questions ke quick answers"
            onPress={() => {}}
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
