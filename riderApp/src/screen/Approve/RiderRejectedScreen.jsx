import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Easing,
  StatusBar,
  Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';

const COLORS = {
  danger: '#ef4444',
  background: '#fef9f5',
  title: '#1a1a2e',
  text: '#4a4a5a',
  muted: '#8a8a9a',
};

export default function RiderRejectedScreen({ navigation, route }) {
  const { rejectionReason = 'Not specified' } = route.params || {};
  const scale = useRef(new Animated.Value(0.5)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scale, {
        toValue: 1,
        tension: 40,
        friction: 6,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 1,
        duration: 500,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
      <View style={styles.container}>
        <Animated.View
          style={[styles.iconWrapper, { transform: [{ scale }], opacity }]}
        >
          <View style={styles.iconCircle}>
            <Ionicons name="close-circle" size={70} color={COLORS.danger} />
          </View>
        </Animated.View>
        <Text style={styles.heading}>Application Rejected</Text>
        <Text style={styles.subheading}>
          We're sorry, your application was not approved.
        </Text>
        <View style={styles.reasonBox}>
          <Text style={styles.reasonLabel}>Reason:</Text>
          <Text style={styles.reasonText}>{rejectionReason}</Text>
        </View>
        <Text style={styles.helpText}>
          If you believe this is a mistake, please contact support.
        </Text>
        <Pressable
          style={styles.supportButton}
          onPress={() => navigation.navigate('RiderSupport')}
        >
          <Text style={styles.supportText}>Contact Support</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.background },
  container: {
    flex: 1,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWrapper: { marginBottom: 30 },
  iconCircle: {
    width: 140,
    height: 140,
    borderRadius: 70,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff5f5',
    borderWidth: 1.5,
    borderColor: COLORS.danger,
  },
  heading: {
    fontSize: 28,
    fontWeight: '900',
    color: COLORS.title,
    letterSpacing: -0.5,
    textAlign: 'center',
  },
  subheading: {
    marginTop: 8,
    fontSize: 16,
    color: COLORS.text,
    textAlign: 'center',
    lineHeight: 22,
  },
  reasonBox: {
    marginTop: 24,
    width: '100%',
    backgroundColor: '#fff5f5',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.danger,
  },
  reasonLabel: { fontSize: 14, fontWeight: '700', color: COLORS.text },
  reasonText: {
    marginTop: 4,
    fontSize: 14,
    color: COLORS.text,
    lineHeight: 20,
  },
  helpText: {
    marginTop: 20,
    fontSize: 14,
    color: COLORS.muted,
    textAlign: 'center',
  },
  supportButton: {
    marginTop: 24,
    paddingVertical: 14,
    paddingHorizontal: 40,
    borderRadius: 30,
    backgroundColor: COLORS.danger,
  },
  supportText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
