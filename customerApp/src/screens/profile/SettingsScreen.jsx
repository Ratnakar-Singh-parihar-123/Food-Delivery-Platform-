import React, { useState } from 'react';
import { ScrollView, StatusBar, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import ScreenHeader from '../../components/ScreenHeader';
import SettingRow from '../../components/SettingRow';
import { useAppUI } from '../../context/AppUIContext';

export default function SettingsScreen({ navigation }) {
  const { showFloatingCart, setShowFloatingCart } = useAppUI();

  const [darkMode, setDarkMode] = useState(false);
  const [autoPlayVideos, setAutoPlayVideos] = useState(true);
  const [useLocation, setUseLocation] = useState(true);

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFDFB" />

      {/* Screen Header Component */}
      <ScreenHeader
        navigation={navigation}
        title="Settings"
        subtitle="Personalize your app experience"
      />

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Section 1: Preferences */}
        <Text style={styles.sectionTitle}>App Preferences</Text>
        <View style={styles.card}>
          <SettingRow
            icon="cart-outline"
            label="Floating Cart Bar"
            subtitle="Display quick cart bar on main navigation tabs"
            switchValue={showFloatingCart}
            onSwitchChange={setShowFloatingCart}
          />

          <View style={styles.divider} />

          <SettingRow
            icon="moon-outline"
            label="Dark Appearance"
            subtitle="Switch to dark theme for lower night glare"
            switchValue={darkMode}
            onSwitchChange={setDarkMode}
          />

          <View style={styles.divider} />

          <SettingRow
            icon="play-circle-outline"
            label="Auto-Play Videos"
            subtitle="Play food previews automatically on feed"
            switchValue={autoPlayVideos}
            onSwitchChange={setAutoPlayVideos}
          />

          <View style={styles.divider} />

          <SettingRow
            icon="navigate-outline"
            label="Precise Location"
            subtitle="Used for accurate delivery time estimates"
            switchValue={useLocation}
            onSwitchChange={setUseLocation}
          />
        </View>

        {/* Section 2: General & Maintenance */}
        <Text style={styles.sectionTitle}>General & System</Text>
        <View style={styles.card}>
          <SettingRow
            icon="language-outline"
            label="App Language"
            subtitle="English / Hindi"
            onPress={() => {}}
          />

          <View style={styles.divider} />

          <SettingRow
            icon="trash-bin-outline"
            label="Clear Cache"
            subtitle="Free up storage space by removing temp files"
            onPress={() => {}}
          />
        </View>

        {/* App Version Info Footer */}
        <View style={styles.footerContainer}>
          <Text style={styles.versionText}>FoodDash v2.4.0</Text>
          <Text style={styles.copyrightText}>
            Crafted for great food lovers
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// ── Refined Styles ──
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFDFB',
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 40,
  },

  // Category Labels
  sectionTitle: {
    marginBottom: 10,
    marginTop: 14,
    marginLeft: 4,
    color: '#64748B',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },

  // Settings Outer Card Container
  card: {
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 10,
    elevation: 2,
    overflow: 'hidden',
  },

  // Divider Line Between Rows
  divider: {
    height: 1,
    marginLeft: 62,
    backgroundColor: '#F1F5F9',
  },

  // Footer Details
  footerContainer: {
    alignItems: 'center',
    marginTop: 36,
    marginBottom: 20,
  },
  versionText: {
    color: '#94A3B8',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.4,
  },
  copyrightText: {
    marginTop: 4,
    color: '#CBD5E1',
    fontSize: 11,
    fontWeight: '500',
  },
});
