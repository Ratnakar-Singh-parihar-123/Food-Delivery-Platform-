import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  Animated,
  Easing,
  Image,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import LinearGradient from 'react-native-linear-gradient';
import ImagePicker from 'react-native-image-crop-picker';
// Make sure to import your get profile/document fetch API if available
import {
  riderCompleteProfile,
  riderUploadDocument,
  getRiderProfile,
} from '../../api/riderApi';

const COLORS = {
  primary: '#FF6B35',
  primaryDark: '#E55A2B',
  primaryLight: '#FFF0EA',
  background: '#FFF8F5',
  white: '#FFFFFF',
  title: '#0F172A',
  text: '#334155',
  muted: '#64748B',
  lightMuted: '#94A3B8',
  border: '#E2E8F0',
  success: '#10B981',
  danger: '#EF4444',
  dangerBg: '#FEF2F2',
};

const VEHICLE_TYPES = [
  { key: 'bike', label: 'Motorbike', icon: 'bicycle-outline' },
  { key: 'scooter', label: 'Scooter', icon: 'speedometer-outline' },
  { key: 'ev_bike', label: 'EV Bike', icon: 'flash-outline' },
];

export default function RiderCreateProfileScreen({ navigation, route }) {
  const { riderId, phone } = route.params || {};

  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    vehicleType: 'bike',
    vehicleNumber: '',
  });

  // Photo URL/Path state
  const [profileImage, setProfileImage] = useState(null);
  const [focusedInput, setFocusedInput] = useState(null);
  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [error, setError] = useState('');
  const [pickerModalVisible, setPickerModalVisible] = useState(false);

  // Screen entrance animations
  const screenOpacity = useRef(new Animated.Value(0)).current;
  const slideUp = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    // 1. Entrance animation
    Animated.parallel([
      Animated.timing(screenOpacity, {
        toValue: 1,
        duration: 500,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.spring(slideUp, {
        toValue: 0,
        tension: 40,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();

    // 2. Fetch existing profile data if riderId is present
    if (riderId && typeof getRiderProfile === 'function') {
      fetchExistingProfile();
    }
  }, [riderId]);

  // Remove the parameter:
  const fetchExistingProfile = async () => {
    try {
      const res = await getRiderProfile(); // no riderId
      if (res?.data?.rider) {
        const rider = res.data.rider;
        setForm({
          firstName: rider.firstName || '',
          lastName: rider.lastName || '',
          email: rider.email || '',
          vehicleType: rider.vehicle?.type || 'bike',
          vehicleNumber: rider.vehicle?.number || '',
        });
        if (rider.profilePicture) {
          setProfileImage(rider.profilePicture);
        }
      }
    } catch (err) {
      console.log('Profile fetch error:', err);
    }
  };

  // Handle Profile Picture Selection (Camera / Gallery)
  const handleImagePick = source => {
    setPickerModalVisible(false);

    const pickerOptions = {
      width: 400,
      height: 400,
      cropping: true,
      cropperCircleOverlay: true,
      mediaType: 'photo',
      compressImageQuality: 0.8,
    };

    const pickerAction =
      source === 'camera'
        ? ImagePicker.openCamera(pickerOptions)
        : ImagePicker.openPicker(pickerOptions);

    pickerAction
      .then(async image => {
        // Direct local preview dikhane ke liye path set karein
        const imageUri = image.path;
        setProfileImage(imageUri);
        uploadProfileImage(image);
      })
      .catch(err => {
        if (err.code === 'E_PICKER_CANCELLED') return;
        setError('Image pick failed: ' + err.message);
      });
  };

  // Upload Profile Image API
  const uploadProfileImage = async image => {
    if (!riderId) return;

    const formData = new FormData();
    formData.append('document', {
      uri:
        Platform.OS === 'android'
          ? image.path
          : image.path.replace('file://', ''),
      type: image.mime || 'image/jpeg',
      name: 'profile_photo.jpg',
    });
    formData.append('type', 'profile_photo');
    formData.append('riderId', riderId);

    try {
      setUploadingImage(true);
      setError('');
      const res = await riderUploadDocument(formData);
      // Agar backend naya response URL deta hai toh update karein
      if (res?.data?.imageUrl) {
        setProfileImage(res.data.imageUrl);
      }
    } catch (err) {
      console.warn('Profile image upload failed:', err);
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = async () => {
    const { firstName, lastName, email, vehicleType, vehicleNumber } = form;
    if (!firstName || !email) {
      setError('Please fill all required fields.');
      return;
    }

    try {
      setLoading(true);
      setError('');
      await riderCompleteProfile({
        riderId,
        firstName,
        lastName,
        email,
        vehicleType,
        vehicleNumber,
        profileImage,
      });
      navigation.navigate('RiderUploadDocuments', { riderId });
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboard}
      >
        <Animated.View
          style={[
            styles.container,
            { opacity: screenOpacity, transform: [{ translateY: slideUp }] },
          ]}
        >
          {/* Header Bar */}
          <View style={styles.headerRow}>
            <Pressable
              onPress={() => navigation.goBack()}
              style={styles.backButton}
            >
              <Ionicons name="arrow-back" size={22} color={COLORS.title} />
            </Pressable>
            <Text style={styles.headerTitle}>Rider Onboarding</Text>
            <View style={{ width: 40 }} />
          </View>

          <ScrollView showsVerticalScrollIndicator={false} style={styles.form}>
            {/* Title Section */}
            <View style={styles.header}>
              <Text style={styles.heading}>Create Your Profile</Text>
              <Text style={styles.subheading}>
                Provide your basic personal & vehicle details
              </Text>
            </View>

            {/* Profile Picture Section */}
            <View style={styles.avatarSection}>
              <View style={styles.avatarContainer}>
                {profileImage ? (
                  <Image
                    source={{ uri: profileImage }}
                    style={styles.avatar}
                    resizeMode="cover"
                  />
                ) : (
                  <View style={styles.avatarPlaceholder}>
                    <Ionicons
                      name="person"
                      size={50}
                      color={COLORS.lightMuted}
                    />
                  </View>
                )}

                {uploadingImage && (
                  <View style={styles.avatarOverlay}>
                    <ActivityIndicator size="small" color="#FFF" />
                  </View>
                )}

                <Pressable
                  style={styles.cameraBadge}
                  onPress={() => setPickerModalVisible(true)}
                >
                  <Ionicons name="camera" size={18} color="#FFF" />
                </Pressable>
              </View>
              <Text style={styles.avatarText}>
                {profileImage
                  ? 'Tap camera icon to change'
                  : 'Upload Profile Photo *'}
              </Text>
            </View>

            {/* First Name */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>First Name *</Text>
              <View
                style={[
                  styles.inputWrapper,
                  focusedInput === 'firstName' && styles.focusedInputWrapper,
                ]}
              >
                <Ionicons
                  name="person-outline"
                  size={20}
                  color={COLORS.muted}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Enter first name"
                  placeholderTextColor={COLORS.lightMuted}
                  value={form.firstName}
                  onFocus={() => setFocusedInput('firstName')}
                  onBlur={() => setFocusedInput(null)}
                  onChangeText={t => setForm({ ...form, firstName: t })}
                />
              </View>
            </View>

            {/* Last Name */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Last Name</Text>
              <View
                style={[
                  styles.inputWrapper,
                  focusedInput === 'lastName' && styles.focusedInputWrapper,
                ]}
              >
                <Ionicons
                  name="person-outline"
                  size={20}
                  color={COLORS.muted}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Enter last name"
                  placeholderTextColor={COLORS.lightMuted}
                  value={form.lastName}
                  onFocus={() => setFocusedInput('lastName')}
                  onBlur={() => setFocusedInput(null)}
                  onChangeText={t => setForm({ ...form, lastName: t })}
                />
              </View>
            </View>

            {/* Email Address */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email Address *</Text>
              <View
                style={[
                  styles.inputWrapper,
                  focusedInput === 'email' && styles.focusedInputWrapper,
                ]}
              >
                <Ionicons name="mail-outline" size={20} color={COLORS.muted} />
                <TextInput
                  style={styles.input}
                  placeholder="Enter email address"
                  placeholderTextColor={COLORS.lightMuted}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  value={form.email}
                  onFocus={() => setFocusedInput('email')}
                  onBlur={() => setFocusedInput(null)}
                  onChangeText={t => setForm({ ...form, email: t })}
                />
              </View>
            </View>

            {/* Vehicle Selection */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Select Vehicle Type</Text>
              <View style={styles.vehicleGrid}>
                {VEHICLE_TYPES.map(v => {
                  const isActive = form.vehicleType === v.key;
                  return (
                    <Pressable
                      key={v.key}
                      style={[
                        styles.vehicleCard,
                        isActive && styles.vehicleCardActive,
                      ]}
                      onPress={() => setForm({ ...form, vehicleType: v.key })}
                    >
                      <Ionicons
                        name={v.icon}
                        size={22}
                        color={isActive ? COLORS.primary : COLORS.muted}
                      />
                      <Text
                        style={[
                          styles.vehicleCardText,
                          isActive && styles.vehicleCardTextActive,
                        ]}
                      >
                        {v.label}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>

            {/* Vehicle Number */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Vehicle Plate Number</Text>
              <View
                style={[
                  styles.inputWrapper,
                  focusedInput === 'vehicleNumber' &&
                    styles.focusedInputWrapper,
                ]}
              >
                <Ionicons
                  name="car-sport-outline"
                  size={20}
                  color={COLORS.muted}
                />
                <TextInput
                  style={styles.input}
                  placeholder="e.g. HR26AB1234"
                  placeholderTextColor={COLORS.lightMuted}
                  autoCapitalize="characters"
                  value={form.vehicleNumber}
                  onFocus={() => setFocusedInput('vehicleNumber')}
                  onBlur={() => setFocusedInput(null)}
                  onChangeText={t =>
                    setForm({ ...form, vehicleNumber: t.toUpperCase() })
                  }
                />
              </View>
            </View>

            {/* Error Message */}
            {error ? (
              <View style={styles.errorWrapper}>
                <Ionicons name="alert-circle" size={18} color={COLORS.danger} />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : null}

            {/* Save & Continue Button */}
            <Pressable
              style={[styles.continueButton, loading && styles.disabled]}
              onPress={handleSubmit}
              disabled={loading}
            >
              <LinearGradient
                colors={[COLORS.primary, COLORS.primaryDark]}
                style={styles.gradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                {loading ? (
                  <ActivityIndicator color="#FFF" size="small" />
                ) : (
                  <>
                    <Text style={styles.continueText}>Save & Proceed</Text>
                    <Ionicons name="arrow-forward" size={20} color="#FFF" />
                  </>
                )}
              </LinearGradient>
            </Pressable>

            <View style={{ height: 30 }} />
          </ScrollView>
        </Animated.View>
      </KeyboardAvoidingView>

      {/* Image Picker Modal */}
      <Modal
        visible={pickerModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setPickerModalVisible(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setPickerModalVisible(false)}
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Upload Profile Photo</Text>
            <Text style={styles.modalSubTitle}>
              Take a photo or choose one from gallery
            </Text>

            <View style={styles.modalButtonRow}>
              <Pressable
                style={styles.modalOptionBtn}
                onPress={() => handleImagePick('camera')}
              >
                <Ionicons
                  name="camera-outline"
                  size={28}
                  color={COLORS.primary}
                />
                <Text style={styles.modalOptionText}>Camera</Text>
              </Pressable>

              <Pressable
                style={styles.modalOptionBtn}
                onPress={() => handleImagePick('gallery')}
              >
                <Ionicons
                  name="images-outline"
                  size={28}
                  color={COLORS.primary}
                />
                <Text style={styles.modalOptionText}>Gallery</Text>
              </Pressable>
            </View>
          </View>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.background },
  keyboard: { flex: 1 },
  container: { flex: 1, paddingHorizontal: 18, paddingTop: 8 },

  /* Header Bar */
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.title,
  },

  /* Titles */
  header: { marginBottom: 16 },
  heading: {
    fontSize: 24,
    fontWeight: '900',
    color: COLORS.title,
    letterSpacing: -0.3,
  },
  subheading: { marginTop: 4, fontSize: 13, color: COLORS.muted },
  form: { flex: 1 },

  /* Avatar Picker */
  avatarSection: {
    alignItems: 'center',
    marginBottom: 20,
  },
  avatarContainer: {
    position: 'relative',
    width: 104,
    height: 104,
  },
  avatar: {
    width: 104,
    height: 104,
    borderRadius: 52,
    borderWidth: 3,
    borderColor: COLORS.primary,
    backgroundColor: '#E2E8F0',
  },
  avatarPlaceholder: {
    width: 104,
    height: 104,
    borderRadius: 52,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: COLORS.border,
  },
  avatarOverlay: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 52,
    backgroundColor: 'rgba(0,0,0,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cameraBadge: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: COLORS.white,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  avatarText: {
    marginTop: 8,
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.muted,
  },

  /* Input Fields */
  inputGroup: { marginBottom: 16 },
  label: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.title,
    marginBottom: 6,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    height: 52,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    borderRadius: 14,
    paddingHorizontal: 14,
    backgroundColor: COLORS.white,
  },
  focusedInputWrapper: {
    borderColor: COLORS.primary,
  },
  input: {
    flex: 1,
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.title,
  },

  /* Vehicle Selection Cards */
  vehicleGrid: {
    flexDirection: 'row',
    gap: 10,
  },
  vehicleCard: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    backgroundColor: COLORS.white,
    gap: 4,
  },
  vehicleCardActive: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primaryLight,
  },
  vehicleCardText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.muted,
  },
  vehicleCardTextActive: {
    color: COLORS.primary,
  },

  /* Errors */
  errorWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 14,
    backgroundColor: COLORS.dangerBg,
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.danger,
  },
  errorText: {
    color: COLORS.danger,
    fontSize: 13,
    fontWeight: '700',
    flex: 1,
  },

  /* Submit CTA Button */
  continueButton: {
    height: 52,
    borderRadius: 16,
    overflow: 'hidden',
    marginTop: 10,
  },
  gradient: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  continueText: { color: '#FFF', fontSize: 16, fontWeight: '800' },
  disabled: { opacity: 0.6 },

  /* Modal */
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
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
  },
  modalButtonRow: {
    flexDirection: 'row',
    gap: 14,
    marginBottom: 10,
  },
  modalOptionBtn: {
    flex: 1,
    backgroundColor: COLORS.background,
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: 8,
  },
  modalOptionText: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.title,
  },
});
