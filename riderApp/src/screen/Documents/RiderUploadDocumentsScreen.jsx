import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  StatusBar,
  Animated,
  Easing,
  Alert,
  Image,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import LinearGradient from 'react-native-linear-gradient';
import ImagePicker from 'react-native-image-crop-picker';
import { riderUploadDocument, riderSubmitDocuments } from '../../api/riderApi';

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
  successBg: '#ECFDF5',
  danger: '#EF4444',
  dangerBg: '#FEF2F2',
  cardBg: '#FFFFFF',
};

const REQUIRED_DOCS = [
  {
    key: 'aadhaar_front',
    label: 'Identity Card (Front)',
    subtitle: 'Front side with clear photo & ID details',
    icon: 'id-card-outline',
  },
  {
    key: 'aadhaar_back',
    label: 'Identity Card (Back)',
    subtitle: 'Back side showing full address details',
    icon: 'card-outline',
  },
  {
    key: 'license',
    label: 'Driving License',
    subtitle: 'Valid government issued driving permit',
    icon: 'car-sport-outline',
  },
  {
    key: 'vehicle_rc',
    label: 'Vehicle Registration (RC)',
    subtitle: 'Official registration certificate of vehicle',
    icon: 'document-text-outline',
  },
];

export default function RiderUploadDocumentsScreen({ navigation, route }) {
  const { riderId } = route.params || {};
  const [docs, setDocs] = useState({});
  const [uploadingDocKey, setUploadingDocKey] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [selectedDocKey, setSelectedDocKey] = useState(null);
  const [pickerModalVisible, setPickerModalVisible] = useState(false);

  const isPickerAvailable = typeof ImagePicker?.openPicker === 'function';

  // Animations
  const screenOpacity = useRef(new Animated.Value(0)).current;
  const slideUp = useRef(new Animated.Value(30)).current;

  useEffect(() => {
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

    if (!isPickerAvailable) {
      setError('Image picker module not found. Please install dependencies.');
    }
  }, []);

  const openPickerModal = docKey => {
    if (!riderId) {
      Alert.alert('Error', 'Rider ID missing. Please go back and restart.');
      return;
    }
    setSelectedDocKey(docKey);
    setPickerModalVisible(true);
  };

  const handleImagePick = source => {
    setPickerModalVisible(false);
    if (!selectedDocKey) return;

    const pickerAction =
      source === 'camera'
        ? ImagePicker.openCamera({
            mediaType: 'photo',
            quality: 0.8,
            compressImageQuality: 0.8,
          })
        : ImagePicker.openPicker({
            mediaType: 'photo',
            quality: 0.8,
            compressImageQuality: 0.8,
          });

    pickerAction
      .then(async image => {
        uploadDocumentApi(selectedDocKey, image);
      })
      .catch(err => {
        if (err.code === 'E_PICKER_CANCELLED') return;
        setError('Image selection cancelled or failed.');
      });
  };

  const uploadDocumentApi = async (type, image) => {
    const formData = new FormData();
    formData.append('document', {
      uri: image.path,
      type: image.mime || 'image/jpeg',
      name: `${type}.jpg`,
    });
    formData.append('type', type);
    formData.append('riderId', riderId);

    try {
      setUploadingDocKey(type);
      setError('');
      await riderUploadDocument(formData);
      setDocs(prev => ({ ...prev, [type]: image.path }));
    } catch (err) {
      setError(
        err.response?.data?.message || 'Upload failed. Please try again.',
      );
    } finally {
      setUploadingDocKey(null);
    }
  };

  const handleSubmit = async () => {
    const allUploaded = REQUIRED_DOCS.every(d => docs[d.key]);
    if (!allUploaded) {
      setError('Please upload all required KYC documents to proceed.');
      return;
    }
    try {
      setSubmitting(true);
      setError('');
      await riderSubmitDocuments({ riderId });
      navigation.replace('RiderPendingApproval', { riderId });
    } catch (err) {
      setError(
        err.response?.data?.message || 'Submission failed. Please try again.',
      );
    } finally {
      setSubmitting(false);
    }
  };

  const completedCount = REQUIRED_DOCS.filter(d => docs[d.key]).length;
  const progressPercent = (completedCount / REQUIRED_DOCS.length) * 100;
  const allUploaded = completedCount === REQUIRED_DOCS.length;

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
      <Animated.View
        style={[
          styles.container,
          { opacity: screenOpacity, transform: [{ translateY: slideUp }] },
        ]}
      >
        {/* Navigation Bar */}
        <View style={styles.headerRow}>
          <Pressable
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={22} color={COLORS.title} />
          </Pressable>
          <Text style={styles.headerTitle}>KYC Verification</Text>
          <View style={{ width: 40 }} />
        </View>

        {/* Header Description & Progress Card */}
        <View style={styles.progressCard}>
          <View style={styles.progressHeader}>
            <View>
              <Text style={styles.heading}>Document Upload</Text>
              <Text style={styles.subheading}>
                Upload official documents for instant approval
              </Text>
            </View>
            <View style={styles.badgeCount}>
              <Text style={styles.badgeText}>
                {completedCount}/{REQUIRED_DOCS.length}
              </Text>
            </View>
          </View>

          {/* Progress Bar */}
          <View style={styles.progressBarTrack}>
            <View
              style={[styles.progressBarFill, { width: `${progressPercent}%` }]}
            />
          </View>
        </View>

        {/* Error Notification */}
        {error ? (
          <View style={styles.errorWrapper}>
            <Ionicons name="alert-circle" size={20} color={COLORS.danger} />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : null}

        {/* Document Cards List */}
        <ScrollView style={styles.list} showsVerticalScrollIndicator={false}>
          {REQUIRED_DOCS.map(item => {
            const isUploaded = Boolean(docs[item.key]);
            const isUploading = uploadingDocKey === item.key;

            return (
              <View
                key={item.key}
                style={[styles.docCard, isUploaded && styles.docCardUploaded]}
              >
                <View style={styles.docCardContent}>
                  {/* Left Thumbnail or Icon */}
                  {isUploaded ? (
                    <Image
                      source={{ uri: docs[item.key] }}
                      style={styles.previewImage}
                    />
                  ) : (
                    <View style={styles.iconContainer}>
                      <Ionicons
                        name={item.icon}
                        size={24}
                        color={COLORS.primary}
                      />
                    </View>
                  )}

                  {/* Title & Subtitle */}
                  <View style={styles.docTextContainer}>
                    <Text style={styles.docLabel}>{item.label}</Text>
                    <Text style={styles.docSubtitle}>{item.subtitle}</Text>
                  </View>
                </View>

                {/* Right Upload CTA Button */}
                <View style={styles.actionRow}>
                  {isUploading ? (
                    <ActivityIndicator size="small" color={COLORS.primary} />
                  ) : isUploaded ? (
                    <View style={styles.statusBadge}>
                      <Ionicons
                        name="checkmark-circle"
                        size={18}
                        color={COLORS.success}
                      />
                      <Text style={styles.statusText}>Uploaded</Text>
                      <Pressable
                        onPress={() => openPickerModal(item.key)}
                        style={styles.reuploadBtn}
                      >
                        <Text style={styles.reuploadText}>Change</Text>
                      </Pressable>
                    </View>
                  ) : (
                    <Pressable
                      style={styles.uploadButton}
                      onPress={() => openPickerModal(item.key)}
                      disabled={Boolean(uploadingDocKey)}
                    >
                      <Ionicons
                        name="cloud-upload-outline"
                        size={18}
                        color="#FFF"
                      />
                      <Text style={styles.uploadText}>Upload</Text>
                    </Pressable>
                  )}
                </View>
              </View>
            );
          })}

          {/* Security Note */}
          <View style={styles.securityBadge}>
            <Ionicons
              name="shield-checkmark"
              size={20}
              color={COLORS.success}
            />
            <Text style={styles.securityText}>
              Your documents are encrypted & stored securely as per regulatory
              guidelines.
            </Text>
          </View>

          <View style={styles.spacer} />
        </ScrollView>

        {/* Submit CTA Button */}
        <Pressable
          style={[
            styles.submitButton,
            (!allUploaded || submitting) && styles.disabled,
          ]}
          onPress={handleSubmit}
          disabled={!allUploaded || submitting}
        >
          <LinearGradient
            colors={[COLORS.primary, COLORS.primaryDark]}
            style={styles.gradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            {submitting ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <>
                <Text style={styles.submitText}>Submit for Verification</Text>
                <Ionicons name="arrow-forward" size={20} color="#FFF" />
              </>
            )}
          </LinearGradient>
        </Pressable>
      </Animated.View>

      {/* Image Source Chooser Modal */}
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
            <Text style={styles.modalTitle}>Choose Source</Text>
            <Text style={styles.modalSubTitle}>
              Select where to import your document image from
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
                <Text style={styles.modalOptionText}>Take Photo</Text>
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
                <Text style={styles.modalOptionText}>Browse Gallery</Text>
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
  container: {
    flex: 1,
    paddingHorizontal: 18,
    paddingTop: 8,
  },

  /* Header */
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
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

  /* Progress Card */
  progressCard: {
    backgroundColor: COLORS.white,
    borderRadius: 20,
    padding: 18,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 2,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 14,
  },
  heading: {
    fontSize: 20,
    fontWeight: '900',
    color: COLORS.title,
    letterSpacing: -0.3,
  },
  subheading: {
    marginTop: 4,
    fontSize: 13,
    color: COLORS.muted,
    fontWeight: '500',
  },
  badgeCount: {
    backgroundColor: COLORS.primaryLight,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  badgeText: {
    color: COLORS.primary,
    fontSize: 13,
    fontWeight: '800',
  },
  progressBarTrack: {
    height: 8,
    backgroundColor: '#F1F5F9',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: COLORS.primary,
    borderRadius: 4,
  },

  /* List */
  list: { flex: 1 },
  docCard: {
    backgroundColor: COLORS.white,
    borderRadius: 18,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.02,
    shadowRadius: 6,
    elevation: 1,
  },
  docCardUploaded: {
    borderColor: COLORS.success,
    backgroundColor: '#FAFFFD',
  },
  docCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginBottom: 12,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  previewImage: {
    width: 48,
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  docTextContainer: { flex: 1 },
  docLabel: { fontSize: 15, fontWeight: '800', color: COLORS.title },
  docSubtitle: { fontSize: 12, color: COLORS.muted, marginTop: 2 },

  actionRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  uploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: COLORS.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
  },
  uploadText: { color: '#FFF', fontWeight: '800', fontSize: 13 },

  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flex: 1,
    justifyContent: 'space-between',
  },
  statusText: {
    color: COLORS.success,
    fontWeight: '800',
    fontSize: 13,
    flex: 1,
  },
  reuploadBtn: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    backgroundColor: COLORS.primaryLight,
    borderRadius: 8,
  },
  reuploadText: {
    color: COLORS.primary,
    fontWeight: '700',
    fontSize: 12,
  },

  /* Errors & Badges */
  errorWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
    backgroundColor: COLORS.dangerBg,
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.danger,
    gap: 8,
  },
  errorText: {
    color: COLORS.danger,
    fontSize: 13,
    fontWeight: '700',
    flex: 1,
  },
  securityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: COLORS.successBg,
    padding: 12,
    borderRadius: 14,
    marginVertical: 10,
  },
  securityText: {
    flex: 1,
    fontSize: 12,
    fontWeight: '700',
    color: '#065F46',
  },

  /* Submit Button */
  submitButton: {
    height: 52,
    borderRadius: 16,
    overflow: 'hidden',
    marginVertical: 12,
  },
  gradient: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  submitText: { color: '#FFF', fontSize: 16, fontWeight: '800' },
  disabled: { opacity: 0.5 },
  spacer: { height: 20 },

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
