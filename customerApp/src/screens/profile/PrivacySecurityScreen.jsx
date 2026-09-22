import React from 'react';

import { ScrollView, StatusBar, StyleSheet, View } from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';

import ScreenHeader from '../../components/ScreenHeader';
import SettingRow from '../../components/SettingRow';

export default function PrivacySecurityScreen({ navigation }) {
  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#fffaf7" />

      <ScreenHeader
        navigation={navigation}
        title="Privacy & security"
        subtitle="Account aur personal data controls"
      />

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.card}>
          <SettingRow
            icon="key-outline"
            label="Change login number"
            subtitle="Account ke registered mobile number ko update karein"
            onPress={() => {}}
          />
          <View style={styles.divider} />
          <SettingRow
            icon="lock-closed-outline"
            label="App lock"
            subtitle="Biometric ya device lock enable karein"
            onPress={() => {}}
          />
          <View style={styles.divider} />
          <SettingRow
            icon="document-text-outline"
            label="Download my data"
            subtitle="FoodMitra account data ki copy request karein"
            onPress={() => {}}
          />
          <View style={styles.divider} />
          <SettingRow
            icon="trash-outline"
            label="Delete account"
            subtitle="Account permanently delete karein"
            onPress={() => {}}
            danger
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
