import React from 'react';

import { ScrollView, StatusBar, StyleSheet, Text, View } from 'react-native';

import Ionicons from '@react-native-vector-icons/ionicons';
import { SafeAreaView } from 'react-native-safe-area-context';

import ScreenHeader from '../../components/ScreenHeader';
import SettingRow from '../../components/SettingRow';

export default function AboutKhaoJiScreen({ navigation }) {
  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#fffaf7" />

      <ScreenHeader
        navigation={navigation}
        title="About FoodMitra"
        subtitle="Dil se desi, doorstep tak"
      />

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.hero}>
          <View style={styles.logo}>
            <Ionicons name="restaurant" size={36} color="#ffffff" />
          </View>
          <Text style={styles.brand}>FoodMitra.in</Text>
          <Text style={styles.version}>Version 1.0.0</Text>
          <Text style={styles.description}>
            FoodMitra aapko nearby restaurants, local flavours aur fast delivery
            ke saath connect karta hai.
          </Text>
        </View>

        <View style={styles.card}>
          <SettingRow
            icon="document-text-outline"
            label="Terms & conditions"
            onPress={() => {}}
          />
          <View style={styles.divider} />
          <SettingRow
            icon="shield-checkmark-outline"
            label="Privacy policy"
            onPress={() => {}}
          />
          <View style={styles.divider} />
          <SettingRow
            icon="star-outline"
            label="Rate FoodMitra"
            onPress={() => {}}
          />
          <View style={styles.divider} />
          <SettingRow
            icon="share-social-outline"
            label="Share FoodMitra"
            onPress={() => {}}
          />
        </View>

        <Text style={styles.footer}>
          Made with ❤️ for food lovers in India.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#fffaf7' },
  content: { padding: 18, paddingBottom: 100 },
  hero: {
    padding: 24,
    alignItems: 'center',
    borderRadius: 28,
    backgroundColor: '#171717',
  },
  logo: {
    width: 76,
    height: 76,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ff5a1f',
  },
  brand: {
    marginTop: 16,
    color: '#ffffff',
    fontSize: 24,
    fontWeight: '900',
  },
  version: {
    marginTop: 5,
    color: 'rgba(255,255,255,0.5)',
    fontSize: 9,
  },
  description: {
    maxWidth: 290,
    marginTop: 14,
    color: 'rgba(255,255,255,0.68)',
    fontSize: 10.5,
    lineHeight: 17,
    textAlign: 'center',
  },
  card: {
    marginTop: 18,
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
  footer: {
    marginTop: 24,
    color: '#8f8f98',
    fontSize: 9.5,
    textAlign: 'center',
  },
});
