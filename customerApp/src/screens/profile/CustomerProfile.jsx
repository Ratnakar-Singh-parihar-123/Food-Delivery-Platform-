import React, { useState, useEffect, useRef } from 'react';
import {
  ScrollView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Platform,
  StatusBar,
  Alert,
  Image,
  ActivityIndicator,
  Modal,
  TouchableWithoutFeedback,
  FlatList,
  Animated,
  Easing,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { launchImageLibrary } from 'react-native-image-picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import {
  getCustomerProfile,
  updateCustomerProfile,
  uploadCustomerImage,
  deleteCustomerImage,
  skipCustomerProfile,
} from '../../api/customerApi';

// ── Server base for static files (images) ──
const STATIC_BASE = 'https://myfoodmitra-ecosystem.onrender.com'; // no trailing slash

const CustomerProfile = ({ navigation }) => {
  // ── State ──
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [profileCompleted, setProfileCompleted] = useState(false);
  const [gender, setGender] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState(null);
  const [profileImage, setProfileImage] = useState(null);

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [originalData, setOriginalData] = useState({});

  // Modal visibility
  const [genderModalVisible, setGenderModalVisible] = useState(false);
  const [datePickerVisible, setDatePickerVisible] = useState(false);
  const [tempDate, setTempDate] = useState(new Date());

  // ── Animations ──
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const buttonScale = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    const checkProfile = async () => {
      try {
        const response = await getCustomerProfile();
        if (response.data.customer?.profileCompleted) {
          navigation.replace('MainTabs');
        }
      } catch (_) {}
    };
    checkProfile();
  }, []);

  useEffect(() => {
    if (profileCompleted) {
      navigation.replace('MainTabs');
    }
  }, [profileCompleted]);
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 700,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 750,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const genderOptions = [
    { label: 'Male', value: 'male' },
    { label: 'Female', value: 'female' },
    { label: 'Other', value: 'other' },
    { label: 'Clear', value: '' },
  ];

  // ── Fetch Profile ──
  const fetchProfile = async () => {
    try {
      setFetching(true);
      const response = await getCustomerProfile();
      const customer = response.data.customer;
      setFirstName(customer.firstName || '');
      setLastName(customer.lastName || '');
      setEmail(customer.email || '');
      setPhone(customer.phone || '');
      setGender(customer.gender || '');
      setDateOfBirth(
        customer.dateOfBirth ? new Date(customer.dateOfBirth) : null,
      );
      // ✅ Set profileCompleted flag
      setProfileCompleted(customer.profileCompleted || false);

      // Build full image URL
      let imageUrl = null;
      if (customer.profileImage) {
        if (customer.profileImage.startsWith('http')) {
          imageUrl = customer.profileImage;
        } else {
          const path = customer.profileImage.startsWith('/')
            ? customer.profileImage
            : `/${customer.profileImage}`;
          imageUrl = `${STATIC_BASE}${path}`;
        }
      }
      setProfileImage(imageUrl);
      setOriginalData(customer);
    } catch (error) {
      Alert.alert('Error', 'Failed to load profile. Please try again.');
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  // ── Navigate to MainTabs ──
  const goToHome = () => {
    navigation.replace('MainTabs');
  };

  // ── Update Profile (no alert on success) ──
  const handleUpdate = async () => {
    if (!firstName.trim() || !lastName.trim()) {
      Alert.alert('Incomplete', 'First and last name are required.');
      return;
    }

    // ─── Email validation ──────────────────────────────────
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim() || !emailRegex.test(email.trim())) {
      Alert.alert('Invalid Email', 'Please enter a valid email address.');
      return;
    }

    // ─── Phone validation ──────────────────────────────────
    if (phone.trim().length !== 10) {
      Alert.alert(
        'Invalid Phone',
        'Please enter a valid 10-digit phone number.',
      );
      return;
    }

    try {
      setLoading(true);
      const payload = {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim().toLowerCase(),
        phone: phone.trim(),
        gender,
        dateOfBirth: dateOfBirth ? dateOfBirth.toISOString() : null,
      };
      await updateCustomerProfile(payload);
      navigation.reset({ index: 0, routes: [{ name: 'MainTabs' }] });
    } catch (error) {
      Alert.alert(
        'Update Failed',
        error.response?.data?.message || error.message,
      );
    } finally {
      setLoading(false);
    }
  };

  // ── Image Picker ──
  const pickImage = () => {
    launchImageLibrary(
      { mediaType: 'photo', includeBase64: false, quality: 0.7 },
      async response => {
        if (response.didCancel) return;
        if (response.errorCode) {
          Alert.alert('Error', response.errorMessage || 'Image picker error');
          return;
        }
        const asset = response.assets[0];
        if (!asset) return;
        // Show local image optimistically
        setProfileImage(asset.uri);
        await uploadImage(asset);
      },
    );
  };

  // ── Upload Image ──
  const uploadImage = async asset => {
    try {
      setUploading(true);
      const formData = new FormData();
      formData.append('profileImage', {
        uri: asset.uri,
        type: asset.type || 'image/jpeg',
        name: asset.fileName || 'profile.jpg',
      });
      const response = await uploadCustomerImage(formData);
      let newImageUrl =
        response.data?.profileImage || response.data?.data?.profileImage;
      if (newImageUrl) {
        if (!newImageUrl.startsWith('http')) {
          const path = newImageUrl.startsWith('/')
            ? newImageUrl
            : `/${newImageUrl}`;
          newImageUrl = `${STATIC_BASE}${path}`;
        }
        setProfileImage(newImageUrl);
        // No alert on success – just show a subtle toast or nothing
      } else {
        // Keep optimistic update
      }
    } catch (error) {
      Alert.alert(
        'Upload Failed',
        error.response?.data?.message || error.message,
      );
      // Revert to original
      const originalUrl = originalData.profileImage
        ? originalData.profileImage.startsWith('http')
          ? originalData.profileImage
          : `${STATIC_BASE}${originalData.profileImage}`
        : null;
      setProfileImage(originalUrl);
    } finally {
      setUploading(false);
    }
  };

  // ── Delete Image ──
  const handleDeleteImage = () => {
    Alert.alert(
      'Remove Photo',
      'Are you sure you want to remove your profile picture?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            try {
              setUploading(true);
              await deleteCustomerImage();
              setProfileImage(null);
              // No alert on success
            } catch (error) {
              Alert.alert(
                'Error',
                error.response?.data?.message || error.message,
              );
            } finally {
              setUploading(false);
            }
          },
        },
      ],
    );
  };

  // ── Gender Picker ──
  const selectGender = value => {
    setGender(value);
    setGenderModalVisible(false);
  };

  // ── Date Picker ──
  const onDateChange = (event, selectedDate) => {
    setDatePickerVisible(Platform.OS === 'ios');
    if (selectedDate) {
      setDateOfBirth(selectedDate);
    }
  };

  const showDatePicker = () => {
    setTempDate(dateOfBirth || new Date());
    setDatePickerVisible(true);
  };

  // ── Button press animation ──
  const animateButton = pressed => {
    Animated.spring(buttonScale, {
      toValue: pressed ? 0.96 : 1,
      useNativeDriver: true,
    }).start();
  };

  // ── Loading State ──
  if (fetching) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FF6B35" />
          <Text style={styles.loadingText}>Loading profile...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFF8F5" />
      <LinearGradient colors={['#FFF8F5', '#FFF0EA']} style={styles.gradientBg}>
        <Animated.View
          style={[
            styles.container,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContainer}
            showsVerticalScrollIndicator={false}
          >
            {/* Status Bar */}
            <View style={styles.statusBar}>
              <Text style={styles.stepText}>Step 1 of 1</Text>
              <View style={styles.dotsContainer}>
                <View style={[styles.dot, styles.dotActive]} />
                <View style={styles.dot} />
                <View style={styles.dot} />
                <View style={styles.dot} />
              </View>
            </View>

            {/* Avatar */}
            <View style={styles.profileSection}>
              <TouchableOpacity
                onPress={pickImage}
                onLongPress={profileImage ? handleDeleteImage : null}
                activeOpacity={0.8}
                disabled={uploading}
              >
                <View style={styles.avatarWrapper}>
                  {profileImage ? (
                    <Image
                      source={{ uri: profileImage }}
                      style={styles.avatarImage}
                      onError={() => setProfileImage(null)}
                    />
                  ) : (
                    <View style={styles.avatarPlaceholder}>
                      <Icon name="person" size={70} color="#d4c5b8" />
                    </View>
                  )}
                  {uploading && (
                    <View style={styles.uploadingOverlay}>
                      <ActivityIndicator size="small" color="#FFF" />
                    </View>
                  )}
                  <View style={styles.cameraButton}>
                    <Icon name="photo-camera" size={20} color="#FFF" />
                  </View>
                </View>
              </TouchableOpacity>
              <Text style={styles.avatarHint}>
                {profileImage ? 'Long press to remove' : 'Tap to add photo'}
              </Text>
            </View>

            {/* Heading */}
            <View style={styles.headingSection}>
              <Text style={styles.headingTitle}>Complete Your Profile</Text>
              <Text style={styles.headingSubtitle}>
                Let's personalize your account
              </Text>
            </View>

            {/* Form */}
            <View style={styles.formSection}>
              <InputCard
                icon="person"
                placeholder="Enter your first name"
                value={firstName}
                onChangeText={setFirstName}
              />
              <InputCard
                icon="person-outline"
                placeholder="Enter your last name"
                value={lastName}
                onChangeText={setLastName}
              />
              <InputCard
                icon="phone"
                placeholder="Phone Number"
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
              />
              <InputCard
                icon="email"
                placeholder="Enter your email address"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
              />
              <InputCard
                icon="wc"
                placeholder="Gender"
                value={
                  gender ? gender.charAt(0).toUpperCase() + gender.slice(1) : ''
                }
                trailingIcon="expand-more"
                editable={false}
                onPress={() => setGenderModalVisible(true)}
              />
              <InputCard
                icon="calendar-today"
                placeholder="Date of Birth"
                value={dateOfBirth ? dateOfBirth.toLocaleDateString() : ''}
                trailingIcon="event"
                editable={false}
                onPress={showDatePicker}
              />
            </View>

            {/* Actions */}
            <View style={styles.actionSection}>
              <Animated.View style={{ transform: [{ scale: buttonScale }] }}>
                <TouchableOpacity
                  style={styles.primaryButton}
                  onPress={handleUpdate}
                  activeOpacity={0.8}
                  disabled={loading}
                  onPressIn={() => animateButton(true)}
                  onPressOut={() => animateButton(false)}
                >
                  <LinearGradient
                    colors={['#FF6B35', '#E05A2A']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.gradientButton}
                  >
                    {loading ? (
                      <ActivityIndicator size="small" color="#FFF" />
                    ) : (
                      <>
                        <Text style={styles.continueText}>Continue</Text>
                        <View style={styles.iconCircle}>
                          <Icon name="arrow-forward" size={20} color="#FFF" />
                        </View>
                      </>
                    )}
                  </LinearGradient>
                </TouchableOpacity>
              </Animated.View>

              <TouchableOpacity
                style={styles.skipButton}
                onPress={async () => {
                  try {
                    await skipCustomerProfile(); // API call

                    navigation.reset({
                      index: 0,
                      routes: [{ name: 'MainTabs' }],
                    });
                  } catch (error) {
                    Alert.alert(
                      'Error',
                      error.response?.data?.message || 'Something went wrong',
                    );
                  }
                }}
              >
                <Text style={styles.skipText}>Skip for now</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </Animated.View>
      </LinearGradient>

      {/* ── Gender Picker Modal ── */}
      <Modal
        visible={genderModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setGenderModalVisible(false)}
      >
        <TouchableWithoutFeedback onPress={() => setGenderModalVisible(false)}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback>
              <View style={styles.modalContent}>
                <View style={styles.modalHandle} />
                <Text style={styles.modalTitle}>Select Gender</Text>
                <FlatList
                  data={genderOptions}
                  keyExtractor={item => item.value}
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      style={styles.modalItem}
                      onPress={() => selectGender(item.value)}
                    >
                      <Text style={styles.modalItemText}>{item.label}</Text>
                      {gender === item.value && (
                        <Icon name="check" size={22} color="#FF6B35" />
                      )}
                    </TouchableOpacity>
                  )}
                />
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      {/* ── Date Picker ── */}
      {datePickerVisible && (
        <DateTimePicker
          value={tempDate}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={onDateChange}
        />
      )}
    </SafeAreaView>
  );
};

// ── Reusable Input Card ──
const InputCard = ({
  icon,
  placeholder,
  value,
  onChangeText,
  trailingIcon,
  editable = true,
  keyboardType = 'default',
  onPress,
}) => {
  return (
    <TouchableOpacity
      activeOpacity={editable ? 1 : 0.7}
      onPress={onPress}
      disabled={editable}
    >
      <View style={styles.inputCard}>
        <Icon name={icon} size={24} color="#FF6B35" style={styles.cardIcon} />
        <TextInput
          style={styles.textInput}
          placeholder={placeholder}
          placeholderTextColor="rgba(0,0,0,0.3)"
          value={value}
          onChangeText={onChangeText}
          editable={editable}
          keyboardType={keyboardType}
          selectTextOnFocus={editable}
        />
        {trailingIcon && (
          <Icon name={trailingIcon} size={22} color="rgba(0,0,0,0.25)" />
        )}
      </View>
    </TouchableOpacity>
  );
};

// ── Styles ──
const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FFF8F5' },
  gradientBg: { flex: 1 },
  container: { flex: 1 },
  scrollContainer: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingVertical: 32,
    justifyContent: 'space-between',
  },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#6b7280',
    fontWeight: '500',
  },
  statusBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 32,
  },
  stepText: {
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 0.5,
    color: 'rgba(0,0,0,0.35)',
    textTransform: 'uppercase',
  },
  dotsContainer: { flexDirection: 'row' },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FF6B35',
    opacity: 0.25,
    marginLeft: 6,
  },
  dotActive: { width: 28, borderRadius: 4, opacity: 1, marginLeft: 0 },
  profileSection: { alignItems: 'center', marginBottom: 28 },
  avatarWrapper: { width: 120, height: 120 },
  avatarPlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#f5ebe5',
    borderWidth: 3,
    borderColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#FF6B35',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.12,
        shadowRadius: 20,
      },
      android: { elevation: 6 },
    }),
  },
  avatarImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    borderColor: '#FFF',
  },
  uploadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.4)',
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cameraButton: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FF6B35',
    borderWidth: 2,
    borderColor: '#FFF8F5',
    justifyContent: 'center',
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#FF6B35',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.25,
        shadowRadius: 10,
      },
      android: { elevation: 6 },
    }),
  },
  avatarHint: {
    marginTop: 8,
    fontSize: 12,
    color: '#9ca3af',
    fontWeight: '500',
  },
  headingSection: { alignItems: 'center', marginBottom: 28 },
  headingTitle: {
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: -0.3,
    color: '#1a1410',
    marginBottom: 4,
  },
  headingSubtitle: {
    fontSize: 16,
    fontWeight: '400',
    color: 'rgba(0,0,0,0.5)',
    letterSpacing: 0.2,
  },
  formSection: { flex: 1, marginBottom: 24 },
  inputCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingHorizontal: 16,
    height: 62,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.6)',
    ...Platform.select({
      ios: {
        shadowColor: 'rgba(0,0,0,0.04)',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.4,
        shadowRadius: 16,
      },
      android: { elevation: 4 },
    }),
  },
  cardIcon: { marginRight: 14, opacity: 0.7 },
  textInput: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
    color: '#1a1410',
    paddingVertical: 0,
    padding: 0,
  },
  actionSection: { paddingTop: 8 },
  primaryButton: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 14,
    ...Platform.select({
      ios: {
        shadowColor: '#FF6B35',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.25,
        shadowRadius: 20,
      },
      android: { elevation: 8 },
    }),
  },
  gradientButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 62,
    paddingHorizontal: 24,
  },
  continueText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.2,
  },
  iconCircle: {
    position: 'absolute',
    right: 18,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  skipButton: { alignItems: 'center', paddingVertical: 8 },
  skipText: {
    fontSize: 15,
    fontWeight: '500',
    color: 'rgba(0,0,0,0.3)',
    textDecorationLine: 'underline',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  modalContent: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 32,
    maxHeight: '50%',
  },
  modalHandle: {
    width: 40,
    height: 4,
    backgroundColor: '#DDD',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1a1410',
    marginBottom: 16,
  },
  modalItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  modalItemText: { fontSize: 16, color: '#1a1410', fontWeight: '500' },
});

export default CustomerProfile;
