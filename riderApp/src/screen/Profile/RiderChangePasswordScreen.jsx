import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Pressable,
  StatusBar,
  ActivityIndicator,
  Alert,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { changeRiderPassword } from '../../api/riderApi';

const COLORS = {
  primary: '#f25a22',
  background: '#fef9f5',
  white: '#ffffff',
  title: '#1a1a2e',
  text: '#4a4a5a',
  muted: '#8a8a9a',
  border: '#e8e4e0',
  success: '#16a34a',
  danger: '#ef4444',
};

export default function RiderChangePasswordScreen({ navigation }) {
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleSubmit = async () => {
    if (!oldPassword || !newPassword || !confirmPassword) {
      Alert.alert('Error', 'All fields are required');
      return;
    }
    if (newPassword.length < 8) {
      Alert.alert('Error', 'New password must be at least 8 characters');
      return;
    }
    if (newPassword !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    try {
      setLoading(true);
      await changeRiderPassword({
        currentPassword: oldPassword,
        newPassword,
      });
      Alert.alert('Success', 'Password changed successfully');
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
      navigation.goBack();
    } catch (error) {
      Alert.alert(
        'Error',
        error.response?.data?.message || 'Failed to change password',
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
      <ScrollView style={styles.container}>
        <Pressable
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Ionicons name="chevron-back" size={28} color={COLORS.title} />
          <Text style={styles.backText}>Back</Text>
        </Pressable>

        <Text style={styles.pageTitle}>Change Password</Text>

        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Current Password</Text>
            <View style={styles.passwordWrapper}>
              <TextInput
                style={styles.input}
                secureTextEntry={!showOld}
                value={oldPassword}
                onChangeText={setOldPassword}
                placeholder="Enter current password"
              />
              <Pressable
                onPress={() => setShowOld(!showOld)}
                style={styles.eyeButton}
              >
                <Ionicons
                  name={showOld ? 'eye-off' : 'eye'}
                  size={24}
                  color={COLORS.muted}
                />
              </Pressable>
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>New Password</Text>
            <View style={styles.passwordWrapper}>
              <TextInput
                style={styles.input}
                secureTextEntry={!showNew}
                value={newPassword}
                onChangeText={setNewPassword}
                placeholder="Enter new password (min 8 chars)"
              />
              <Pressable
                onPress={() => setShowNew(!showNew)}
                style={styles.eyeButton}
              >
                <Ionicons
                  name={showNew ? 'eye-off' : 'eye'}
                  size={24}
                  color={COLORS.muted}
                />
              </Pressable>
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Confirm New Password</Text>
            <View style={styles.passwordWrapper}>
              <TextInput
                style={styles.input}
                secureTextEntry={!showConfirm}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                placeholder="Re-enter new password"
              />
              <Pressable
                onPress={() => setShowConfirm(!showConfirm)}
                style={styles.eyeButton}
              >
                <Ionicons
                  name={showConfirm ? 'eye-off' : 'eye'}
                  size={24}
                  color={COLORS.muted}
                />
              </Pressable>
            </View>
          </View>

          <Pressable
            style={[styles.saveButton, loading && styles.disabledButton]}
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Text style={styles.saveText}>Update Password</Text>
            )}
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.background },
  container: { flex: 1, paddingHorizontal: 16, paddingTop: 8 },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 12,
  },
  backText: { fontSize: 16, fontWeight: '700', color: COLORS.title },
  pageTitle: {
    fontSize: 28,
    fontWeight: '900',
    color: COLORS.title,
    letterSpacing: -0.5,
    marginBottom: 20,
  },
  form: {
    backgroundColor: COLORS.white,
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 3,
  },
  inputGroup: { marginBottom: 16 },
  label: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 6,
  },
  passwordWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    backgroundColor: '#f8f4f0',
  },
  input: { flex: 1, height: 50, paddingHorizontal: 14, fontSize: 16 },
  eyeButton: { paddingHorizontal: 14 },
  saveButton: {
    height: 50,
    borderRadius: 16,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  disabledButton: { opacity: 0.6 },
  saveText: { color: '#fff', fontSize: 17, fontWeight: '800' },
});
