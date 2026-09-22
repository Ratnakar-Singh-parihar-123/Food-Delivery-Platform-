// screens/partner/HelpSupportScreen.js
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  StatusBar,
  TextInput,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from '@react-native-vector-icons/ionicons';
import { COLORS } from '../../constants/colors';

const FAQ = [
  { q: 'How do I change my menu?', a: 'Go to Menu tab and edit your dishes.' },
  {
    q: 'What should I do if I cannot accept orders?',
    a: 'Toggle your status to offline.',
  },
  {
    q: 'How are earnings calculated?',
    a: 'Earnings are based on completed orders.',
  },
];

const HelpSupportScreen = ({ navigation }) => {
  const [expanded, setExpanded] = useState(null);

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={COLORS.title} />
        </Pressable>
        <Text style={styles.headerTitle}>Help & Support</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <Text style={styles.sectionTitle}>Frequently Asked Questions</Text>
        {FAQ.map((item, idx) => (
          <View key={idx} style={styles.faqCard}>
            <Pressable
              style={styles.faqHeader}
              onPress={() => setExpanded(expanded === idx ? null : idx)}
            >
              <Text style={styles.faqQuestion}>{item.q}</Text>
              <Ionicons
                name={expanded === idx ? 'chevron-up' : 'chevron-down'}
                size={20}
                color={COLORS.primary}
              />
            </Pressable>
            {expanded === idx && <Text style={styles.faqAnswer}>{item.a}</Text>}
          </View>
        ))}

        <View style={styles.contactCard}>
          <Text style={styles.contactTitle}>Still need help?</Text>
          <Text style={styles.contactSub}>
            Our support team is here for you.
          </Text>
          <Pressable
            style={styles.contactBtn}
            onPress={() => Alert.alert('Contact Support', 'support@tiffin.com')}
          >
            <Ionicons name="mail-outline" size={18} color={COLORS.white} />
            <Text style={styles.contactBtnText}>Email Us</Text>
          </Pressable>
          <Pressable
            style={[styles.contactBtn, { backgroundColor: '#22c55e' }]}
            onPress={() => Alert.alert('Call', '+91 98765 43210')}
          >
            <Ionicons name="call-outline" size={18} color={COLORS.white} />
            <Text style={styles.contactBtnText}>Call Us</Text>
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
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.title,
    marginBottom: 12,
  },
  faqCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 14,
    marginBottom: 10,
  },
  faqHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  faqQuestion: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.title,
    flex: 1,
  },
  faqAnswer: { marginTop: 8, fontSize: 13, color: COLORS.text, lineHeight: 20 },
  contactCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    marginTop: 10,
    marginBottom: 20,
  },
  contactTitle: { fontSize: 18, fontWeight: '700', color: COLORS.title },
  contactSub: {
    fontSize: 13,
    color: COLORS.muted,
    marginTop: 2,
    marginBottom: 12,
  },
  contactBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 30,
    marginTop: 6,
    gap: 6,
    width: '100%',
    justifyContent: 'center',
  },
  contactBtnText: { color: COLORS.white, fontWeight: '700', fontSize: 14 },
});

export default HelpSupportScreen;
