import React, { useState, useEffect } from 'react';
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
  Image,
  Modal,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import ImagePicker from 'react-native-image-crop-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  getRiderProfile,
  updateRiderProfile,
  riderUploadDocument,
} from '../../api/riderApi';

const COLORS = {
  primary: '#f25a22',
  primarySoft: '#FFF2EC',
  primaryDark: '#cc3f0a',
  background: '#F8FAFC',
  cardBg: '#FFFFFF',
  title: '#0F172A',
  text: '#334155',
  muted: '#64748B',
  border: '#E2E8F0',
  inputBg: '#F8FAFC',
  disabledBg: '#F1F5F9',
  shadowColor: '#0F172A',
};

// ─── Helper: Build absolute image URL ─────────────────────
const API_BASE = 'http://10.200.227.211:9000'; // Without /api/2026

const getImageUrl = path => {
  if (!path) return null;
  if (path.startsWith('http')) return path;
  // Remove leading slash to avoid double slash
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;
  return `${API_BASE}/${cleanPath}`;
};

export default function RiderEditProfileScreen({ navigation }) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [pickerModalVisible, setPickerModalVisible] = useState(false);
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    profileImage: null,
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await getRiderProfile();
      const rider = res.data.rider;
      setForm({
        firstName: rider.firstName || '',
        lastName: rider.lastName || '',
        phone: rider.phone || '',
        email: rider.email || '',
        profileImage: getImageUrl(rider.profileImage), // ✅ fixed
      });
    } catch (error) {
      Alert.alert('Error', 'Failed to load profile details');
    } finally {
      setLoading(false);
    }
  };

  // ─── Image Picker Logic ───────────────────────────────────
  const handleImagePick = source => {
    setPickerModalVisible(false);

    const pickerOptions = {
      width: 500,
      height: 500,
      cropping: true,
      cropperCircleOverlay: true,
      mediaType: 'photo',
      compressImageQuality: 0.85,
    };

    const pickerAction =
      source === 'camera'
        ? ImagePicker.openCamera(pickerOptions)
        : ImagePicker.openPicker(pickerOptions);

    pickerAction
      .then(async image => {
        await uploadProfileImage(image);
      })
      .catch(err => {
        if (err.code === 'E_PICKER_CANCELLED') return;
        Alert.alert('Error', 'Image pick failed: ' + err.message);
      });
  };

  const uploadProfileImage = async image => {
    const fileObject = {
      uri: image.path,
      type: image.mime || image.type || 'image/jpeg',
      name: 'profile_photo.jpg',
    };

    console.log('📤 Uploading file:', fileObject);

    try {
      setUploadingImage(true);

      const formData = new FormData();
      formData.append('document', fileObject);
      // ✅ Use 'profile_photo' now that it's valid
      formData.append('type', 'profile_photo');

      const token = await AsyncStorage.getItem('riderToken');
      const baseUrl = 'http://10.200.227.211:9000/api/2026';

      const response = await fetch(`${baseUrl}/rider/documents/upload`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      const responseText = await response.text();
      console.log('📥 Server response:', responseText);

      if (response.ok) {
        let json;
        try {
          json = JSON.parse(responseText);
        } catch (e) {
          json = {};
        }
        const fileUrl =
          json?.data?.document?.fileUrl ||
          json?.data?.fileUrl ||
          json?.fileUrl ||
          json?.data?.url ||
          json?.url;

        if (fileUrl) {
          const absoluteUrl = getImageUrl(fileUrl);
          setForm(prev => ({ ...prev, profileImage: absoluteUrl }));
          Alert.alert('✅ Success', 'Profile photo updated!');
        } else {
          Alert.alert(
            'ℹ️ Info',
            'Image uploaded but URL missing. Refetching...',
          );
          await fetchProfile();
        }
      } else {
        Alert.alert('Upload Failed', `Server error: ${responseText}`);
      }
    } catch (error) {
      console.error('❌ Upload error:', error);
      Alert.alert('Upload Failed', 'Could not upload photo. Please try again.');
    } finally {
      setUploadingImage(false);
    }
  };

  // ─── Save Changes Logic ───────────────────────────────────
  const handleSave = async () => {
    if (!form.firstName.trim()) {
      Alert.alert('Validation Error', 'First name cannot be empty');
      return;
    }
    try {
      setSaving(true);
      // We send the absolute URL to backend – it will store as is.
      const payload = {
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        phone: form.phone.trim(),
        email: form.email.trim(),
        profileImage: form.profileImage,
      };
      await updateRiderProfile(payload);
      Alert.alert('Success', 'Your profile has been updated!');
      navigation.goBack();
    } catch (error) {
      Alert.alert('Error', 'Failed to update profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Fetching Profile...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />

      {/* ─── Top Header Navigation ────────────────────── */}
      <View style={styles.navBar}>
        <Pressable
          onPress={() => navigation.goBack()}
          style={({ pressed }) => [
            styles.iconButton,
            pressed && styles.buttonPressed,
          ]}
        >
          <Ionicons name="arrow-back" size={22} color={COLORS.title} />
        </Pressable>
        <Text style={styles.navTitle}>Edit Profile</Text>
        <View style={styles.placeholderIcon} />
      </View>

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ─── Avatar Header Card ──────────────────────── */}
        <View style={styles.avatarCard}>
          <View style={styles.avatarWrapper}>
            {form.profileImage ? (
              <Image
                source={{ uri: form.profileImage }}
                style={styles.avatar}
                resizeMode="cover"
              />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Ionicons name="person" size={56} color={COLORS.muted} />
              </View>
            )}

            {uploadingImage && (
              <View style={styles.avatarOverlay}>
                <ActivityIndicator size="small" color="#FFFFFF" />
              </View>
            )}

            <Pressable
              style={({ pressed }) => [
                styles.cameraBadge,
                pressed && styles.buttonPressed,
              ]}
              onPress={() => setPickerModalVisible(true)}
            >
              <Ionicons name="camera" size={18} color="#FFFFFF" />
            </Pressable>
          </View>

          <Text style={styles.avatarNameText}>
            {form.firstName
              ? `${form.firstName} ${form.lastName}`
              : 'Rider Partner'}
          </Text>
          <Text style={styles.avatarHintText}>
            Tap camera badge to replace photo
          </Text>
        </View>

        {/* ─── Form Inputs Section ─────────────────────── */}
        <View style={styles.formCard}>
          <Text style={styles.sectionHeaderTitle}>Personal Information</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>First Name</Text>
            <View style={styles.inputContainer}>
              <Ionicons
                name="person-outline"
                size={20}
                color={COLORS.muted}
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.input}
                value={form.firstName}
                onChangeText={t => setForm({ ...form, firstName: t })}
                placeholder="Enter first name"
                placeholderTextColor={COLORS.muted}
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Last Name</Text>
            <View style={styles.inputContainer}>
              <Ionicons
                name="person-outline"
                size={20}
                color={COLORS.muted}
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.input}
                value={form.lastName}
                onChangeText={t => setForm({ ...form, lastName: t })}
                placeholder="Enter last name"
                placeholderTextColor={COLORS.muted}
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Phone Number</Text>
            <View style={[styles.inputContainer, styles.disabledContainer]}>
              <Ionicons
                name="call-outline"
                size={20}
                color={COLORS.muted}
                style={styles.inputIcon}
              />
              <TextInput
                style={[styles.input, styles.disabledText]}
                value={form.phone}
                editable={false}
              />
              <Ionicons name="lock-closed" size={16} color={COLORS.muted} />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email Address</Text>
            <View style={[styles.inputContainer, styles.disabledContainer]}>
              <Ionicons
                name="mail-outline"
                size={20}
                color={COLORS.muted}
                style={styles.inputIcon}
              />
              <TextInput
                style={[styles.input, styles.disabledText]}
                value={form.email}
                editable={false}
              />
              <Ionicons name="lock-closed" size={16} color={COLORS.muted} />
            </View>
          </View>
        </View>

        {/* ─── Save CTA Button ─────────────────────────── */}
        <Pressable
          style={({ pressed }) => [
            styles.saveButton,
            saving && styles.disabledButton,
            pressed && styles.buttonPressed,
          ]}
          onPress={handleSave}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator color="#FFFFFF" size="small" />
          ) : (
            <Text style={styles.saveText}>Save Changes</Text>
          )}
        </Pressable>
      </ScrollView>

      {/* ─── Image Picker Modal ─────────────────────────── */}
      <Modal
        visible={pickerModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setPickerModalVisible(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setPickerModalVisible(false)}
        >
          <View style={styles.modalCard}>
            <View style={styles.modalHandle} />
            <Text style={styles.modalTitle}>Update Profile Photo</Text>
            <Text style={styles.modalSubTitle}>
              Select a source to choose your profile picture
            </Text>

            <View style={styles.modalButtonRow}>
              <Pressable
                style={({ pressed }) => [
                  styles.modalOptionBtn,
                  pressed && styles.buttonPressed,
                ]}
                onPress={() => handleImagePick('camera')}
              >
                <View style={styles.optionIconContainer}>
                  <Ionicons
                    name="camera-outline"
                    size={26}
                    color={COLORS.primary}
                  />
                </View>
                <Text style={styles.modalOptionText}>Camera</Text>
              </Pressable>

              <Pressable
                style={({ pressed }) => [
                  styles.modalOptionBtn,
                  pressed && styles.buttonPressed,
                ]}
                onPress={() => handleImagePick('gallery')}
              >
                <View style={styles.optionIconContainer}>
                  <Ionicons
                    name="images-outline"
                    size={26}
                    color={COLORS.primary}
                  />
                </View>
                <Text style={styles.modalOptionText}>Gallery</Text>
              </Pressable>
            </View>
          </View>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}

// ── STYLES ────────────────────────────────────────────────
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.muted,
  },
  navBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: COLORS.background,
  },
  navTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.title,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: COLORS.cardBg,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  placeholderIcon: {
    width: 40,
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 32,
    gap: 16,
  },

  /* Avatar Section */
  avatarCard: {
    backgroundColor: COLORS.cardBg,
    borderRadius: 20,
    paddingVertical: 24,
    paddingHorizontal: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: COLORS.shadowColor,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 10,
    elevation: 2,
  },
  avatarWrapper: {
    position: 'relative',
    width: 110,
    height: 110,
    marginBottom: 12,
  },
  avatar: {
    width: 110,
    height: 110,
    borderRadius: 55,
    borderWidth: 3,
    borderColor: COLORS.primarySoft,
  },
  avatarPlaceholder: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: COLORS.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  avatarOverlay: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 55,
    backgroundColor: 'rgba(15, 23, 42, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cameraBadge: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: COLORS.cardBg,
    shadowColor: COLORS.shadowColor,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
  avatarNameText: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.title,
    marginBottom: 2,
  },
  avatarHintText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.muted,
  },

  /* Form Section */
  formCard: {
    backgroundColor: COLORS.cardBg,
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: COLORS.shadowColor,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 10,
    elevation: 2,
  },
  sectionHeaderTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.title,
    marginBottom: 18,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 6,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 52,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 14,
    paddingHorizontal: 14,
    backgroundColor: COLORS.inputBg,
  },
  disabledContainer: {
    backgroundColor: COLORS.disabledBg,
    borderColor: COLORS.border,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.title,
    paddingVertical: 0,
  },
  disabledText: {
    color: COLORS.muted,
  },

  /* CTA Button */
  saveButton: {
    height: 54,
    borderRadius: 16,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 5,
    marginTop: 8,
  },
  saveText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 0.2,
  },
  disabledButton: {
    opacity: 0.65,
  },
  buttonPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.98 }],
  },

  /* Modal Styles */
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.5)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: COLORS.cardBg,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 24,
    paddingBottom: 36,
  },
  modalHandle: {
    width: 38,
    height: 5,
    backgroundColor: COLORS.border,
    borderRadius: 3,
    alignSelf: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.title,
  },
  modalSubTitle: {
    fontSize: 13,
    color: COLORS.muted,
    marginTop: 4,
    marginBottom: 20,
    fontWeight: '500',
  },
  modalButtonRow: {
    flexDirection: 'row',
    gap: 12,
  },
  modalOptionBtn: {
    flex: 1,
    backgroundColor: COLORS.inputBg,
    borderRadius: 18,
    paddingVertical: 18,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: 8,
  },
  optionIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalOptionText: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.title,
  },
});
