// screens/PersonalInformationScreen.js
import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  View,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import {
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import Ionicons from '@react-native-vector-icons/ionicons';
import { launchImageLibrary } from 'react-native-image-picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import {
  getCustomerProfile,
  updateCustomerProfile,
  uploadCustomerImage,
} from '../../api/customerApi';

// ─── CONSTANTS ──────────────────────────────────────────────
const COLORS = {
  primary: '#FF5A1F',
  primaryDark: '#E94A0D',
  background: '#FCF9F7',
  white: '#FFFFFF',
  title: '#1C1C1E',
  text: '#3A3A3C',
  muted: '#8E8E93',
  border: '#E5E5EA',
  soft: '#FFF0E9',
  success: '#34C759',
  successSoft: '#E8F9ED',
  successBorder: '#B7F0C8',
  danger: '#FF3B30',
  dangerSoft: '#FFEBEA',
  dangerBorder: '#FFC7C4',
  info: '#007AFF',
  infoSoft: '#E3F0FF',
  infoBorder: '#B8D4FF',
  dark: '#1C1C1E',
};

const STATIC_BASE = 'https://myfoodmitra-ecosystem.onrender.com';
const DEFAULT_AVATAR =
  'https://ui-avatars.com/api/?name=User&background=FF5A1F&color=fff&size=120';

const buildImageUrl = path => {
  if (!path) return DEFAULT_AVATAR;
  if (path.startsWith('http')) return path;
  const clean = path.startsWith('/') ? path : `/${path}`;
  return `${STATIC_BASE}${clean}`;
};

// ─── DATE HELPER ─────────────────────────────────────────────
const formatDate = dateString => {
  if (!dateString) return '';
  const date = new Date(dateString);
  if (!isNaN(date)) {
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  }
  // already in "DD Month YYYY"? return as is
  const parts = dateString.split(' ');
  if (parts.length === 3 && !isNaN(parts[0]) && parts[2].length === 4) {
    return dateString;
  }
  return '';
};

const parseDateForPicker = displayDate => {
  let date = new Date();
  if (!displayDate) return date;
  const parsed = new Date(displayDate);
  if (!isNaN(parsed)) return parsed;
  // try "DD Month YYYY"
  const parts = displayDate.split(' ');
  if (parts.length === 3) {
    const months = {
      January: 0,
      February: 1,
      March: 2,
      April: 3,
      May: 4,
      June: 5,
      July: 6,
      August: 7,
      September: 8,
      October: 9,
      November: 10,
      December: 11,
    };
    const month = months[parts[1]];
    if (month !== undefined) {
      return new Date(parseInt(parts[2]), month, parseInt(parts[0]));
    }
  }
  return date;
};

// ─── PHONE CLEANER ────────────────────────────────────────────
const cleanPhone = phone => {
  if (!phone) return '';
  const digits = phone.replace(/\D/g, '');
  // If more than 10 digits, take the last 10 (handles +91 prefix)
  return digits.length > 10 ? digits.slice(-10) : digits;
};

// ─── MAIN COMPONENT ──────────────────────────────────────────
export default function PersonalInformationScreen({ navigation }) {
  const insets = useSafeAreaInsets();

  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    birthday: '',
    gender: '',
    image: DEFAULT_AVATAR,
  });
  const [errors, setErrors] = useState({});
  const [isSelectingImage, setIsSelectingImage] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [originalImage, setOriginalImage] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [tempDate, setTempDate] = useState(new Date());

  const [toast, setToast] = useState({
    visible: false,
    title: '',
    message: '',
    type: 'success',
  });
  const toastTranslateY = useRef(new Animated.Value(-130)).current;
  const toastOpacity = useRef(new Animated.Value(0)).current;
  const toastTimer = useRef(null);

  useEffect(() => {
    fetchProfile();
    return () => {
      if (toastTimer.current) clearTimeout(toastTimer.current);
    };
  }, []);

  // ─── FETCH PROFILE ──────────────────────────────────────────
  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await getCustomerProfile();
      const customer = response.data.customer;
      console.log('Profile data:', customer);

      const fullName = `${customer.firstName || ''} ${
        customer.lastName || ''
      }`.trim();
      const imageUrl = buildImageUrl(customer.profileImage);

      setForm({
        name: fullName,
        email: customer.email || '',
        phone: cleanPhone(customer.phone || ''), // ✅ +91 हटाकर सिर्फ 10 डिजिट
        birthday: formatDate(customer.dateOfBirth),
        gender: customer.gender || '',
        image: imageUrl,
      });
      setOriginalImage(imageUrl);
    } catch (error) {
      console.warn('Using fallback data');
      setForm({
        name: 'Ratnakar Singh',
        email: 'ratnakar@foodmitra.in',
        phone: '9876543245',
        birthday: '12 August 1997',
        gender: 'Male',
        image: DEFAULT_AVATAR,
      });
      setOriginalImage(DEFAULT_AVATAR);
    } finally {
      setLoading(false);
    }
  };

  // ─── HELPERS ────────────────────────────────────────────────
  const updateField = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
    setErrors(prev => ({ ...prev, [field]: '' }));
  };

  const showToast = ({ title, message, type = 'success' }) => {
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTranslateY.stopAnimation();
    toastOpacity.stopAnimation();
    toastTranslateY.setValue(-130);
    toastOpacity.setValue(0);

    setToast({ visible: true, title, message, type });
    requestAnimationFrame(() => {
      Animated.parallel([
        Animated.spring(toastTranslateY, {
          toValue: 0,
          damping: 14,
          stiffness: 175,
          mass: 0.8,
          useNativeDriver: true,
        }),
        Animated.timing(toastOpacity, {
          toValue: 1,
          duration: 220,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
      ]).start();
    });
    toastTimer.current = setTimeout(hideToast, 2700);
  };

  const hideToast = () => {
    if (toastTimer.current) {
      clearTimeout(toastTimer.current);
      toastTimer.current = null;
    }
    Animated.parallel([
      Animated.timing(toastTranslateY, {
        toValue: -130,
        duration: 230,
        easing: Easing.in(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(toastOpacity, {
        toValue: 0,
        duration: 180,
        useNativeDriver: true,
      }),
    ]).start(() => setToast(prev => ({ ...prev, visible: false })));
  };

  // ─── IMAGE PICKER ────────────────────────────────────────────
  const chooseImage = async () => {
    if (!isEditing) {
      showToast({
        title: 'Edit mode on karein',
        message: 'Image change karne ke liye pehle Edit karein.',
        type: 'info',
      });
      return;
    }
    if (isSelectingImage) return;
    try {
      setIsSelectingImage(true);
      const result = await launchImageLibrary({
        mediaType: 'photo',
        quality: 0.8,
        selectionLimit: 1,
      });
      if (result.didCancel) return;
      if (result.errorCode) {
        showToast({
          title: 'Image select nahi hui',
          message: result.errorMessage || 'Please try again.',
          type: 'danger',
        });
        return;
      }
      const uri = result.assets?.[0]?.uri;
      if (!uri) {
        showToast({
          title: 'Invalid image',
          message: 'Image load nahi hui.',
          type: 'danger',
        });
        return;
      }
      updateField('image', uri);
      showToast({
        title: 'Photo updated',
        message: 'New profile photo selected.',
        type: 'success',
      });
    } catch (error) {
      showToast({
        title: 'Error',
        message: 'Gallery open nahi ho saki.',
        type: 'danger',
      });
    } finally {
      setIsSelectingImage(false);
    }
  };

  // ─── DATE PICKER ─────────────────────────────────────────────
  const showDatePickerModal = () => {
    if (!isEditing) return;
    setTempDate(parseDateForPicker(form.birthday));
    setShowDatePicker(true);
  };

  const onDateChange = (event, selectedDate) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (selectedDate) {
      const formatted = selectedDate.toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      });
      updateField('birthday', formatted);
    }
  };

  // ─── VALIDATION ──────────────────────────────────────────────
  const validate = () => {
    const errors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!form.name.trim()) errors.name = 'Full name required.';
    else if (form.name.trim().length < 3)
      errors.name = 'At least 3 characters.';
    if (!form.email.trim()) errors.email = 'Email required.';
    else if (!emailRegex.test(form.email.trim()))
      errors.email = 'Valid email required.';
    if (!form.phone.trim()) errors.phone = 'Phone required.';
    else if (!/^[6-9]\d{9}$/.test(form.phone.trim()))
      errors.phone = '10-digit mobile number.';
    if (!form.birthday.trim()) errors.birthday = 'Birthday required.';
    if (!form.gender.trim()) errors.gender = 'Gender required.';
    setErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // ─── SAVE ────────────────────────────────────────────────────
  const handleSave = async () => {
    if (!validate()) {
      showToast({
        title: 'Please check fields',
        message: 'Highlighted fields need correction.',
        type: 'danger',
      });
      return;
    }
    try {
      setSaving(true);
      const nameParts = form.name.trim().split(' ');
      const firstName = nameParts[0];
      const lastName = nameParts.slice(1).join(' ') || '';

      let dateOfBirth = null;
      if (form.birthday) {
        const parts = form.birthday.split(' ');
        if (parts.length === 3) {
          const months = {
            January: 0,
            February: 1,
            March: 2,
            April: 3,
            May: 4,
            June: 5,
            July: 6,
            August: 7,
            September: 8,
            October: 9,
            November: 10,
            December: 11,
          };
          const month = months[parts[1]];
          if (month !== undefined) {
            const d = new Date(parseInt(parts[2]), month, parseInt(parts[0]));
            dateOfBirth = d.toISOString();
          }
        } else {
          const d = new Date(form.birthday);
          if (!isNaN(d)) dateOfBirth = d.toISOString();
        }
      }

      const payload = {
        firstName,
        lastName,
        email: form.email.trim().toLowerCase(),
        phone: form.phone.trim(),
        gender: form.gender.trim(),
        dateOfBirth,
      };

      await updateCustomerProfile(payload);

      // upload image if changed
      if (form.image !== originalImage && form.image !== DEFAULT_AVATAR) {
        const formData = new FormData();
        formData.append('profileImage', {
          uri: form.image,
          type: 'image/jpeg',
          name: 'profile.jpg',
        });
        const uploadRes = await uploadCustomerImage(formData);
        const newUrl = buildImageUrl(uploadRes.data.profileImage);
        setForm(prev => ({ ...prev, image: newUrl }));
        setOriginalImage(newUrl);
      } else {
        setOriginalImage(form.image);
      }

      showToast({
        title: 'Profile updated',
        message: 'Changes saved successfully.',
        type: 'success',
      });
      setIsEditing(false);
    } catch (error) {
      showToast({
        title: 'Update failed',
        message: error.response?.data?.message || error.message,
        type: 'danger',
      });
    } finally {
      setSaving(false);
    }
  };

  const toggleEdit = () => {
    setIsEditing(!isEditing);
    if (isEditing) setErrors({});
  };

  // ─── TOAST THEME ─────────────────────────────────────────────
  const getToastTheme = () => {
    const map = {
      danger: {
        icon: 'alert-circle',
        iconColor: COLORS.danger,
        bg: COLORS.dangerSoft,
        border: COLORS.dangerBorder,
      },
      info: {
        icon: 'information-circle',
        iconColor: COLORS.info,
        bg: COLORS.infoSoft,
        border: COLORS.infoBorder,
      },
      success: {
        icon: 'checkmark-circle',
        iconColor: COLORS.success,
        bg: COLORS.successSoft,
        border: COLORS.successBorder,
      },
    };
    return map[toast.type] || map.success;
  };

  // ─── LOADING ──────────────────────────────────────────────────
  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loader}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loaderText}>Loading profile...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const toastTheme = getToastTheme();

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />

      {/* Header */}
      <View style={styles.header}>
        <Pressable
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Ionicons name="chevron-back" size={28} color={COLORS.title} />
        </Pressable>
        <View style={styles.headerTitleWrapper}>
          <Text style={styles.headerTitle}>Personal Information</Text>
          <Text style={styles.headerSubtitle}>Manage your profile details</Text>
        </View>
        <Pressable onPress={toggleEdit} style={styles.editToggle}>
          <Ionicons
            name={isEditing ? 'close' : 'create-outline'}
            size={24}
            color={COLORS.primary}
          />
        </Pressable>
      </View>

      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
        >
          {/* Profile Hero */}
          <View style={styles.hero}>
            <View style={styles.heroGradient}>
              <View style={styles.heroGlow} />
            </View>
            <View style={styles.avatarSection}>
              <View style={styles.avatarOuter}>
                <View style={styles.avatarWrapper}>
                  <Image source={{ uri: form.image }} style={styles.avatar} />
                </View>
                <Pressable
                  onPress={chooseImage}
                  disabled={!isEditing || isSelectingImage}
                  style={({ pressed }) => [
                    styles.cameraButton,
                    pressed && styles.cameraPressed,
                    (!isEditing || isSelectingImage) && styles.cameraDisabled,
                  ]}
                >
                  <Ionicons
                    name={isSelectingImage ? 'hourglass' : 'camera'}
                    size={20}
                    color={COLORS.white}
                  />
                </Pressable>
              </View>
              <Text style={styles.heroName}>{form.name || 'Your Name'}</Text>
              <Text style={styles.heroSub}>
                {isEditing
                  ? 'Tap camera to change photo'
                  : 'Enable edit to change photo'}
              </Text>
            </View>
          </View>

          {/* Form Card */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>Basic Details</Text>
              <View style={styles.badge}>
                <Ionicons
                  name="shield-checkmark"
                  size={14}
                  color={COLORS.success}
                />
                <Text style={styles.badgeText}>PRIVATE</Text>
              </View>
            </View>

            <InputField
              icon="person"
              label="Full Name"
              value={form.name}
              error={errors.name}
              editable={isEditing}
              onChangeText={v => updateField('name', v)}
              autoCapitalize="words"
            />

            <InputField
              icon="mail"
              label="Email Address"
              value={form.email}
              error={errors.email}
              editable={isEditing}
              onChangeText={v => updateField('email', v)}
              keyboardType="email-address"
              autoCapitalize="none"
            />

            <InputField
              icon="call"
              label="Mobile Number"
              value={form.phone}
              error={errors.phone}
              editable={isEditing}
              onChangeText={v => updateField('phone', v.replace(/[^0-9]/g, ''))}
              keyboardType="number-pad"
              maxLength={10}
            />

            <InputField
              icon="calendar"
              label="Birthday"
              value={form.birthday}
              error={errors.birthday}
              editable={false}
              onPress={showDatePickerModal}
              trailingIcon="calendar"
              isDate
            />

            <InputField
              icon="people"
              label="Gender"
              value={form.gender}
              error={errors.gender}
              editable={isEditing}
              onChangeText={v => updateField('gender', v)}
              autoCapitalize="words"
              noBorderBottom
            />
          </View>

          {/* Privacy Note */}
          <View style={styles.privacyBox}>
            <Ionicons name="lock-closed" size={20} color={COLORS.success} />
            <Text style={styles.privacyText}>
              Your personal data is secure and will never be shared publicly.
            </Text>
          </View>

          {/* Save Button */}
          {isEditing && (
            <Pressable
              onPress={handleSave}
              disabled={saving}
              style={({ pressed }) => [
                styles.saveButton,
                pressed && styles.savePressed,
                saving && styles.saveDisabled,
              ]}
            >
              <View>
                <Text style={styles.saveTitle}>
                  {saving ? 'Saving...' : 'Save Changes'}
                </Text>
                <Text style={styles.saveSub}>
                  {saving ? 'Updating your profile' : 'Update your information'}
                </Text>
              </View>
              <View style={styles.saveIcon}>
                {saving ? (
                  <ActivityIndicator size="small" color={COLORS.primary} />
                ) : (
                  <Ionicons name="checkmark" size={22} color={COLORS.primary} />
                )}
              </View>
            </Pressable>
          )}
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Date Picker */}
      {showDatePicker && (
        <DateTimePicker
          value={tempDate}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={onDateChange}
        />
      )}

      {/* Toast */}
      {toast.visible && (
        <Animated.View
          pointerEvents="box-none"
          style={[
            styles.toastWrapper,
            {
              top: insets.top + 10,
              opacity: toastOpacity,
              transform: [{ translateY: toastTranslateY }],
            },
          ]}
        >
          <View style={[styles.toast, { borderColor: toastTheme.border }]}>
            <View
              style={[styles.toastIcon, { backgroundColor: toastTheme.bg }]}
            >
              <Ionicons
                name={toastTheme.icon}
                size={22}
                color={toastTheme.iconColor}
              />
            </View>
            <View style={styles.toastContent}>
              <Text style={styles.toastTitle}>{toast.title}</Text>
              <Text style={styles.toastMessage}>{toast.message}</Text>
            </View>
            <Pressable onPress={hideToast} style={styles.toastClose}>
              <Ionicons name="close" size={20} color={COLORS.muted} />
            </Pressable>
          </View>
        </Animated.View>
      )}
    </SafeAreaView>
  );
}

// ─── REUSABLE INPUT ──────────────────────────────────────────
function InputField({
  icon,
  label,
  value,
  error,
  editable,
  onChangeText,
  onPress,
  isDate,
  trailingIcon,
  noBorderBottom,
  ...rest
}) {
  const Wrapper = isDate ? TouchableOpacity : View;
  return (
    <Wrapper
      activeOpacity={isDate ? 0.7 : 1}
      onPress={isDate ? onPress : undefined}
      style={[styles.inputWrapper, !noBorderBottom && styles.inputBorder]}
    >
      <View style={[styles.inputIcon, error && styles.inputIconError]}>
        <Ionicons
          name={icon}
          size={20}
          color={error ? COLORS.danger : COLORS.primary}
        />
      </View>
      <View style={styles.inputContent}>
        <Text style={styles.inputLabel}>{label}</Text>
        {isDate ? (
          <TouchableOpacity
            onPress={onPress}
            disabled={!editable}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.inputValue,
                error && styles.inputValueError,
                !editable && styles.inputDisabled,
              ]}
            >
              {value || 'Select date'}
            </Text>
          </TouchableOpacity>
        ) : (
          <TextInput
            style={[
              styles.inputValue,
              error && styles.inputValueError,
              !editable && styles.inputDisabled,
            ]}
            value={value}
            onChangeText={onChangeText}
            editable={editable}
            placeholderTextColor="#ccc"
            {...rest}
          />
        )}
        {error && (
          <View style={styles.errorRow}>
            <Ionicons name="alert-circle" size={14} color={COLORS.danger} />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}
      </View>
      {trailingIcon && (
        <Ionicons
          name={trailingIcon}
          size={22}
          color={COLORS.muted}
          style={{ marginLeft: 8 }}
        />
      )}
    </Wrapper>
  );
}

// ─── STYLES ──────────────────────────────────────────────────
const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.background },
  loader: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loaderText: { marginTop: 12, color: COLORS.muted, fontSize: 14 },

  // ─── Header ────────────────────────────────────────────────
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: COLORS.background,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backButton: { padding: 4, marginRight: 12 },
  headerTitleWrapper: { flex: 1 },
  headerTitle: { fontSize: 18, fontWeight: '900', color: COLORS.title },
  headerSubtitle: { fontSize: 10, color: COLORS.muted, marginTop: 2 },
  editToggle: {
    padding: 8,
    borderRadius: 30,
    backgroundColor: COLORS.soft,
    marginLeft: 8,
  },

  // ─── Keyboard ──────────────────────────────────────────────
  keyboardView: { flex: 1 },
  content: { paddingHorizontal: 16, paddingBottom: 120 },

  // ─── Hero ──────────────────────────────────────────────────
  hero: {
    borderRadius: 28,
    overflow: 'hidden',
    backgroundColor: COLORS.dark,
    marginBottom: 24,
  },
  heroGradient: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#2C2C2E',
  },
  heroGlow: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(255,90,31,0.3)',
    right: -60,
    top: -60,
  },
  avatarSection: { paddingVertical: 30, alignItems: 'center' },
  avatarOuter: { position: 'relative' },
  avatarWrapper: {
    width: 110,
    height: 110,
    borderRadius: 55,
    borderWidth: 3,
    borderColor: COLORS.white,
    overflow: 'hidden',
  },
  avatar: { width: '100%', height: '100%' },
  cameraButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: COLORS.dark,
  },
  cameraPressed: { opacity: 0.8, transform: [{ scale: 0.92 }] },
  cameraDisabled: { opacity: 0.5 },
  heroName: {
    marginTop: 16,
    fontSize: 18,
    fontWeight: '900',
    color: COLORS.white,
  },
  heroSub: { marginTop: 4, fontSize: 12, color: 'rgba(255,255,255,0.6)' },

  // ─── Form Card ─────────────────────────────────────────────
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F0EDEA',
  },
  cardTitle: { fontSize: 16, fontWeight: '700', color: COLORS.title },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: COLORS.successSoft,
    borderRadius: 20,
  },
  badgeText: {
    marginLeft: 4,
    fontSize: 9,
    fontWeight: '700',
    color: COLORS.success,
  },

  // ─── Input ──────────────────────────────────────────────────
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: COLORS.white,
  },
  inputBorder: { borderBottomWidth: 1, borderBottomColor: '#F0EDEA' },
  inputIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.soft,
  },
  inputIconError: { backgroundColor: COLORS.dangerSoft },
  inputContent: { flex: 1, marginLeft: 12 },
  inputLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.muted,
    letterSpacing: 0.5,
  },
  inputValue: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.title,
    paddingVertical: 6,
    paddingHorizontal: 0,
  },
  inputValueError: { color: COLORS.danger },
  inputDisabled: { color: COLORS.muted },
  errorRow: { flexDirection: 'row', alignItems: 'center', marginTop: 2 },
  errorText: {
    marginLeft: 4,
    fontSize: 10,
    color: COLORS.danger,
    fontWeight: '600',
  },

  // ─── Privacy ──────────────────────────────────────────────
  privacyBox: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 16,
    backgroundColor: COLORS.successSoft,
    borderWidth: 1,
    borderColor: COLORS.successBorder,
    marginTop: 16,
  },
  privacyText: {
    flex: 1,
    marginLeft: 10,
    fontSize: 11,
    color: '#477051',
    lineHeight: 16,
  },

  // ─── Save Button ──────────────────────────────────────────
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingVertical: 16,
    borderRadius: 24,
    backgroundColor: COLORS.primary,
    marginTop: 20,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 6,
  },
  savePressed: { opacity: 0.9, transform: [{ scale: 0.98 }] },
  saveDisabled: { opacity: 0.6 },
  saveTitle: { color: COLORS.white, fontSize: 16, fontWeight: '900' },
  saveSub: { color: 'rgba(255,255,255,0.7)', fontSize: 10, marginTop: 2 },
  saveIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // ─── Toast ─────────────────────────────────────────────────
  toastWrapper: { position: 'absolute', left: 16, right: 16, zIndex: 999 },
  toast: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 18,
    borderWidth: 1,
    backgroundColor: COLORS.white,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 10,
  },
  toastIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  toastContent: { flex: 1, marginLeft: 12 },
  toastTitle: { fontSize: 14, fontWeight: '800', color: COLORS.title },
  toastMessage: { fontSize: 10, color: COLORS.muted, marginTop: 2 },
  toastClose: { padding: 6 },
});
