// screens/partner/AboutScreen.js
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  StatusBar,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from '@react-native-vector-icons/ionicons';
import { COLORS } from '../../constants/colors';

const AboutScreen = ({ navigation }) => {
  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={COLORS.title} />
        </Pressable>
        <Text style={styles.headerTitle}>About</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.container}>
        <View style={styles.card}>
          <Image
            source={require('../../assets/logo.png')}
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={styles.appName}>Tiffin Partner</Text>
          <Text style={styles.version}>Version 2.0.0</Text>
          <Text style={styles.description}>
            Tiffin Partner helps you manage your tiffin service seamlessly.
            Accept orders, manage menu, track earnings, and grow your business.
          </Text>

          <View style={styles.divider} />

          <View style={styles.infoRow}>
            <Ionicons
              name="business-outline"
              size={18}
              color={COLORS.primary}
            />
            <Text style={styles.infoText}>Made with ❤️ in India</Text>
          </View>
          <View style={styles.infoRow}>
            <Ionicons name="mail-outline" size={18} color={COLORS.primary} />
            <Text style={styles.infoText}>support@tiffin.com</Text>
          </View>
          <View style={styles.infoRow}>
            <Ionicons name="globe-outline" size={18} color={COLORS.primary} />
            <Text style={styles.infoText}>www.tiffin.com</Text>
          </View>
        </View>
      </View>
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
  container: { flex: 1, paddingHorizontal: 16, justifyContent: 'center' },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  logo: { width: 80, height: 80, marginBottom: 12 },
  appName: { fontSize: 22, fontWeight: '900', color: COLORS.title },
  version: { fontSize: 13, color: COLORS.muted, marginTop: 2 },
  description: {
    fontSize: 14,
    color: COLORS.text,
    textAlign: 'center',
    marginTop: 12,
    lineHeight: 22,
  },
  divider: {
    width: '80%',
    height: 1,
    backgroundColor: '#e5e7eb',
    marginVertical: 16,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    gap: 8,
  },
  infoText: { fontSize: 14, color: COLORS.text },
});

export default AboutScreen;
