import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  StatusBar,
  Alert,
  Switch,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { clearToken } from '../../api/riderApi';

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

export default function RiderSettingsScreen({ navigation }) {
  const [notifications, setNotifications] = React.useState(true);
  const [sound, setSound] = React.useState(true);
  const [vibration, setVibration] = React.useState(true);

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: async () => {
          await clearToken();
          navigation.reset({ index: 0, routes: [{ name: 'RiderWelcome' }] });
        },
      },
    ]);
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

        <Text style={styles.pageTitle}>Settings</Text>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Preferences</Text>

          <View style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <Ionicons
                name="notifications-outline"
                size={24}
                color={COLORS.primary}
              />
              <Text style={styles.settingLabel}>Notifications</Text>
            </View>
            <Switch
              value={notifications}
              onValueChange={setNotifications}
              trackColor={{ false: '#d1d5db', true: COLORS.primary }}
            />
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <Ionicons
                name="volume-high-outline"
                size={24}
                color={COLORS.primary}
              />
              <Text style={styles.settingLabel}>Sound Alerts</Text>
            </View>
            <Switch
              value={sound}
              onValueChange={setSound}
              trackColor={{ false: '#d1d5db', true: COLORS.primary }}
            />
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <Ionicons
                name="phone-portrait-outline"
                size={24}
                color={COLORS.primary}
              />
              <Text style={styles.settingLabel}>Vibration</Text>
            </View>
            <Switch
              value={vibration}
              onValueChange={setVibration}
              trackColor={{ false: '#d1d5db', true: COLORS.primary }}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>
          <Pressable
            style={styles.settingItem}
            onPress={() => navigation.navigate('RiderEditProfile')}
          >
            <View style={styles.settingLeft}>
              <Ionicons
                name="person-outline"
                size={24}
                color={COLORS.primary}
              />
              <Text style={styles.settingLabel}>Edit Profile</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={COLORS.muted} />
          </Pressable>

          <Pressable
            style={styles.settingItem}
            onPress={() => navigation.navigate('RiderChangePassword')}
          >
            <View style={styles.settingLeft}>
              <Ionicons
                name="lock-closed-outline"
                size={24}
                color={COLORS.primary}
              />
              <Text style={styles.settingLabel}>Change Password</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={COLORS.muted} />
          </Pressable>

          <Pressable style={styles.settingItem} onPress={handleLogout}>
            <View style={styles.settingLeft}>
              <Ionicons
                name="log-out-outline"
                size={24}
                color={COLORS.danger}
              />
              <Text style={[styles.settingLabel, { color: COLORS.danger }]}>
                Logout
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={COLORS.muted} />
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
  section: {
    backgroundColor: COLORS.white,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.muted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
    paddingTop: 8,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  // For the last item in a section, override borderBottomWidth where needed by
  // applying an additional style (e.g. styles.settingItemLast) on that element.
  settingItemLast: {
    borderBottomWidth: 0,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.title,
  },
});
