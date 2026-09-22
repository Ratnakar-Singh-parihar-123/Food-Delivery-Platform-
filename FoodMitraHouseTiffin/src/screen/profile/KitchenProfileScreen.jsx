// screens/partner/KitchenProfileScreen.js
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  Pressable,
  StatusBar,
  Image,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from '@react-native-vector-icons/ionicons';
import LinearGradient from 'react-native-linear-gradient';
import { COLORS } from '../../constants/colors';

const KitchenProfileScreen = ({ navigation }) => {
  const [profile, setProfile] = useState({
    kitchenName: 'Tiffin House',
    ownerName: 'Rajesh Kumar',
    email: 'rajesh@tiffin.com',
    phone: '+91 98765 43210',
    address: '123, MG Road, Indore',
    city: 'Indore',
    pincode: '452001',
    description: 'We serve authentic homely meals with love.',
  });

  const handleSave = () => {
    Alert.alert('Success', 'Profile updated successfully!');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={COLORS.title} />
        </Pressable>
        <Text style={styles.headerTitle}>Kitchen Profile</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.card}>
          <View style={styles.avatarContainer}>
            <Image
              source={{
                uri: 'https://ui-avatars.com/api/?name=Tiffin+House&background=ff5a1f&color=fff&size=200',
              }}
              style={styles.avatar}
            />
            <Pressable style={styles.editPhotoBtn}>
              <Ionicons name="camera" size={16} color={COLORS.white} />
            </Pressable>
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Kitchen Name</Text>
            <TextInput
              style={styles.input}
              value={profile.kitchenName}
              onChangeText={text =>
                setProfile({ ...profile, kitchenName: text })
              }
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Owner Name</Text>
            <TextInput
              style={styles.input}
              value={profile.ownerName}
              onChangeText={text => setProfile({ ...profile, ownerName: text })}
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              value={profile.email}
              onChangeText={text => setProfile({ ...profile, email: text })}
              keyboardType="email-address"
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Phone</Text>
            <TextInput
              style={styles.input}
              value={profile.phone}
              onChangeText={text => setProfile({ ...profile, phone: text })}
              keyboardType="phone-pad"
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Address</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={profile.address}
              onChangeText={text => setProfile({ ...profile, address: text })}
              multiline
              numberOfLines={3}
            />
          </View>

          <View style={styles.row}>
            <View style={[styles.field, { flex: 1, marginRight: 8 }]}>
              <Text style={styles.label}>City</Text>
              <TextInput
                style={styles.input}
                value={profile.city}
                onChangeText={text => setProfile({ ...profile, city: text })}
              />
            </View>
            <View style={[styles.field, { flex: 1 }]}>
              <Text style={styles.label}>Pincode</Text>
              <TextInput
                style={styles.input}
                value={profile.pincode}
                onChangeText={text => setProfile({ ...profile, pincode: text })}
                keyboardType="numeric"
              />
            </View>
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Description</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={profile.description}
              onChangeText={text =>
                setProfile({ ...profile, description: text })
              }
              multiline
              numberOfLines={4}
              placeholder="Tell customers about your kitchen..."
            />
          </View>

          <Pressable style={styles.saveBtn} onPress={handleSave}>
            <LinearGradient
              colors={[COLORS.primary, COLORS.primaryDark]}
              style={styles.saveGradient}
            >
              <Text style={styles.saveText}>Save Changes</Text>
            </LinearGradient>
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
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
    marginBottom: 20,
  },
  avatarContainer: {
    alignItems: 'center',
    marginBottom: 16,
    position: 'relative',
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  editPhotoBtn: {
    position: 'absolute',
    bottom: 0,
    right: '35%',
    backgroundColor: COLORS.primary,
    padding: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.white,
  },
  field: { marginBottom: 14 },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 4,
  },
  input: {
    height: 46,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 10,
    paddingHorizontal: 12,
    fontSize: 14,
    backgroundColor: '#faf8f7',
  },
  textArea: { height: 80, textAlignVertical: 'top', paddingTop: 10 },
  row: { flexDirection: 'row' },
  saveBtn: { marginTop: 8, borderRadius: 12, overflow: 'hidden' },
  saveGradient: { paddingVertical: 14, alignItems: 'center' },
  saveText: { color: COLORS.white, fontSize: 16, fontWeight: '700' },
});

export default KitchenProfileScreen;
