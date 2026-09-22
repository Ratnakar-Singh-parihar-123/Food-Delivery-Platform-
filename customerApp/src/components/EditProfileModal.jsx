import React, { useEffect, useRef, useState } from 'react';

import {
  Animated,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import Ionicons from '@react-native-vector-icons/ionicons';

const COLORS = {
  primary: '#ff5a1f',
  background: '#fffaf7',
  white: '#ffffff',
  title: '#171717',
  muted: '#8f8f98',
  border: '#eee5df',
  soft: '#fff0e9',
};

export default function EditProfileModal({
  visible,
  profile,
  onClose,
  onSave,
}) {
  const translateY = useRef(new Animated.Value(-520)).current;
  const backdropOpacity = useRef(new Animated.Value(0)).current;

  const [form, setForm] = useState(profile);

  useEffect(() => {
    if (visible) {
      setForm(profile);

      Animated.parallel([
        Animated.spring(translateY, {
          toValue: 0,
          tension: 72,
          friction: 10,
          useNativeDriver: true,
        }),
        Animated.timing(backdropOpacity, {
          toValue: 1,
          duration: 220,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible, profile, backdropOpacity, translateY]);

  const close = () => {
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: -520,
        duration: 220,
        useNativeDriver: true,
      }),
      Animated.timing(backdropOpacity, {
        toValue: 0,
        duration: 180,
        useNativeDriver: true,
      }),
    ]).start(onClose);
  };

  const updateField = (key, value) => {
    setForm(current => ({ ...current, [key]: value }));
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      statusBarTranslucent
      onRequestClose={close}
    >
      <KeyboardAvoidingView
        style={styles.root}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <Animated.View style={[styles.backdrop, { opacity: backdropOpacity }]}>
          <Pressable onPress={close} style={StyleSheet.absoluteFill} />
        </Animated.View>

        <Animated.View
          style={[
            styles.card,
            {
              transform: [{ translateY }],
            },
          ]}
        >
          <View style={styles.handle} />

          <View style={styles.header}>
            <View>
              <Text style={styles.eyebrow}>EDIT PROFILE</Text>
              <Text style={styles.title}>Personal details</Text>
              <Text style={styles.subtitle}>
                Apni profile information update karein
              </Text>
            </View>

            <Pressable onPress={close} style={styles.closeButton}>
              <Ionicons name="close" size={21} color={COLORS.title} />
            </Pressable>
          </View>

          <Field
            icon="person-outline"
            label="Full name"
            value={form?.name || ''}
            onChangeText={value => updateField('name', value)}
          />

          <Field
            icon="call-outline"
            label="Mobile number"
            value={form?.phone || ''}
            onChangeText={value => updateField('phone', value)}
            keyboardType="phone-pad"
          />

          <Field
            icon="mail-outline"
            label="Email address"
            value={form?.email || ''}
            onChangeText={value => updateField('email', value)}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <View style={styles.actionRow}>
            <Pressable onPress={close} style={styles.cancelButton}>
              <Text style={styles.cancelText}>Cancel</Text>
            </Pressable>

            <Pressable onPress={() => onSave(form)} style={styles.saveButton}>
              <Text style={styles.saveText}>Save changes</Text>
              <Ionicons name="checkmark" size={17} color={COLORS.white} />
            </Pressable>
          </View>
        </Animated.View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

function Field({ icon, label, ...inputProps }) {
  return (
    <View style={styles.field}>
      <View style={styles.fieldIcon}>
        <Ionicons name={icon} size={19} color={COLORS.primary} />
      </View>

      <View style={styles.fieldContent}>
        <Text style={styles.fieldLabel}>{label}</Text>
        <TextInput
          {...inputProps}
          placeholderTextColor={COLORS.muted}
          style={styles.input}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(23,23,23,0.55)',
  },
  card: {
    paddingHorizontal: 18,
    paddingBottom: 24,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    backgroundColor: COLORS.background,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 15 },
    shadowOpacity: 0.25,
    shadowRadius: 25,
    elevation: 20,
  },
  handle: {
    width: 46,
    height: 5,
    marginTop: 10,
    alignSelf: 'center',
    borderRadius: 3,
    backgroundColor: '#ded6d1',
  },
  header: {
    marginTop: 18,
    marginBottom: 18,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  eyebrow: {
    color: COLORS.primary,
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1,
  },
  title: { marginTop: 4, color: COLORS.title, fontSize: 21, fontWeight: '900' },
  subtitle: { marginTop: 5, color: COLORS.muted, fontSize: 9.5 },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.white,
  },
  field: {
    minHeight: 66,
    marginBottom: 11,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.white,
  },
  fieldIcon: {
    width: 40,
    height: 40,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.soft,
  },
  fieldContent: { flex: 1, marginLeft: 11 },
  fieldLabel: { color: COLORS.muted, fontSize: 8.5, fontWeight: '700' },
  input: {
    marginTop: 1,
    paddingVertical: 2,
    color: COLORS.title,
    fontSize: 12,
    fontWeight: '800',
  },
  actionRow: { marginTop: 8, flexDirection: 'row', gap: 10 },
  cancelButton: {
    flex: 1,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#ffd6c4',
    backgroundColor: '#fff5f0',
  },
  cancelText: { color: COLORS.primary, fontSize: 10.5, fontWeight: '900' },
  saveButton: {
    flex: 1.3,
    height: 50,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
    backgroundColor: COLORS.primary,
  },
  saveText: {
    marginRight: 6,
    color: COLORS.white,
    fontSize: 10.5,
    fontWeight: '900',
  },
});
