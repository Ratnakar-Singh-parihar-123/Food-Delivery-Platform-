import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  Easing,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  View,
  Alert,
  Linking,
  FlatList,
} from 'react-native';
import axios from 'axios';
import Ionicons from '@react-native-vector-icons/ionicons';
import { CommonActions } from '@react-navigation/native';
import {
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import Geolocation from '@react-native-community/geolocation';
import { PERMISSIONS, request, check, RESULTS } from 'react-native-permissions';

import ScreenHeader from '../../components/ScreenHeader';
import {
  getAddresses,
  addAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress,
} from '../../api/addressApi';
import { getCustomerProfile } from '../../api/customerApi';

const COLORS = {
  primary: '#ff5a1f',
  background: '#fffaf7',
  white: '#ffffff',
  title: '#171717',
  text: '#3f3f46',
  muted: '#8f8f98',
  border: '#eee5df',
  soft: '#fff0e9',
  success: '#15803d',
  successSoft: '#ecfdf3',
  danger: '#dc2626',
  dangerSoft: '#fff1f2',
  info: '#2563eb',
  infoSoft: '#eff6ff',
};

const EMPTY_FORM = {
  label: 'Home',
  fullName: '',
  phone: '',
  house: '',
  area: '',
  landmark: '',
  city: '',
  state: '',
  pincode: '',
  coordinates: null,
};

const ADDRESS_TYPES = [
  { id: 'Home', icon: 'home-outline' },
  { id: 'Office', icon: 'business-outline' },
  { id: 'Other', icon: 'location-outline' },
];

export default function AddressesScreen({ navigation, route }) {
  const insets = useSafeAreaInsets();
  const selectMode = route.params?.selectMode || false;

  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [editingId, setEditingId] = useState(null);
  const [isFetchingLocation, setIsFetchingLocation] = useState(false);
  const [customerProfile, setCustomerProfile] = useState(null);
  const [selectedAddressId, setSelectedAddressId] = useState(null);

  const [toast, setToast] = useState({
    visible: false,
    title: '',
    message: '',
    type: 'success',
  });

  const modalTranslateY = useRef(new Animated.Value(-700)).current;
  const backdropOpacity = useRef(new Animated.Value(0)).current;
  const toastTranslateY = useRef(new Animated.Value(-120)).current;
  const toastOpacity = useRef(new Animated.Value(0)).current;
  const toastTimer = useRef(null);

  const modalTitle = editingId ? 'Edit address' : 'Add new address';

  // ─── Toast helpers ───────────────────────────────────────
  const showToast = ({ title, message, type = 'success' }) => {
    if (toastTimer.current) clearTimeout(toastTimer.current);

    toastTranslateY.stopAnimation();
    toastOpacity.stopAnimation();
    toastTranslateY.setValue(-120);
    toastOpacity.setValue(0);

    setToast({ visible: true, title, message, type });

    requestAnimationFrame(() => {
      Animated.parallel([
        Animated.spring(toastTranslateY, {
          toValue: 0,
          damping: 13,
          stiffness: 170,
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

    toastTimer.current = setTimeout(() => {
      hideToast();
    }, 3000);
  };

  const hideToast = () => {
    if (toastTimer.current) clearTimeout(toastTimer.current);

    Animated.parallel([
      Animated.timing(toastTranslateY, {
        toValue: -120,
        duration: 230,
        easing: Easing.in(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(toastOpacity, {
        toValue: 0,
        duration: 180,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setToast(current => ({ ...current, visible: false }));
    });
  };

  // ─── Modal animations ────────────────────────────────────
  const openModalAnimation = () => {
    modalTranslateY.setValue(-700);
    backdropOpacity.setValue(0);
    setModalVisible(true);

    requestAnimationFrame(() => {
      Animated.parallel([
        Animated.timing(backdropOpacity, {
          toValue: 1,
          duration: 220,
          useNativeDriver: true,
        }),
        Animated.spring(modalTranslateY, {
          toValue: 0,
          damping: 13,
          stiffness: 155,
          mass: 0.8,
          useNativeDriver: true,
        }),
      ]).start();
    });
  };

  const closeModal = callback => {
    Animated.parallel([
      Animated.timing(backdropOpacity, {
        toValue: 0,
        duration: 180,
        useNativeDriver: true,
      }),
      Animated.timing(modalTranslateY, {
        toValue: -700,
        duration: 260,
        easing: Easing.in(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start(() => {
      setModalVisible(false);
      setEditingId(null);
      setForm(EMPTY_FORM);
      setErrors({});
      modalTranslateY.setValue(-700);
      backdropOpacity.setValue(0);
      if (typeof callback === 'function') setTimeout(callback, 80);
    });
  };

  // ─── Fetch customer profile ──────────────────────────────
  const fetchCustomerProfile = async () => {
    try {
      const response = await getCustomerProfile();
      const customer = response.data.customer;
      setCustomerProfile(customer);
      setForm(prev => ({
        ...prev,
        fullName: `${customer.firstName || ''} ${
          customer.lastName || ''
        }`.trim(),
        phone: customer.phone || '',
      }));
    } catch (error) {
      console.warn('Failed to load customer profile');
    }
  };

  // ─── Fetch addresses from API ────────────────────────────
  const fetchAddresses = async () => {
    try {
      setLoading(true);
      const response = await getAddresses();
      const transformed = response.data.map(addr => {
        let coordinates = null;
        if (addr.location?.coordinates) {
          const [lng, lat] = addr.location.coordinates;
          coordinates = { latitude: lat, longitude: lng };
        }
        return {
          id: addr._id,
          label: addr.label.charAt(0).toUpperCase() + addr.label.slice(1),
          icon:
            addr.label === 'home'
              ? 'home-outline'
              : addr.label === 'work'
              ? 'business-outline'
              : 'location-outline',
          fullName: addr.name,
          phone: addr.phone,
          house: addr.addressLine,
          area: addr.landmark || '',
          landmark: '',
          city: addr.city,
          state: addr.state,
          pincode: addr.pincode,
          isDefault: addr.isDefault,
          coordinates,
        };
      });
      setAddresses(transformed);
    } catch (error) {
      showToast({
        title: 'Error',
        message: error.response?.data?.message || 'Failed to load addresses',
        type: 'danger',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomerProfile();
    fetchAddresses();
  }, []);

  // ─── Form helpers ────────────────────────────────────────
  const updateForm = (field, value) => {
    setForm(current => ({ ...current, [field]: value }));
    setErrors(current => ({ ...current, [field]: '' }));
  };

  const validateForm = () => {
    const nextErrors = {};
    if (!form.fullName.trim()) nextErrors.fullName = 'Full name required hai.';
    if (form.phone.length !== 10)
      nextErrors.phone = 'Valid 10-digit mobile number enter karein.';
    if (!form.house.trim())
      nextErrors.house = 'House, flat ya building required hai.';
    if (!form.area.trim()) nextErrors.area = 'Area ya locality required hai.';
    if (!form.city.trim()) nextErrors.city = 'City required hai.';
    if (!form.state.trim()) nextErrors.state = 'State required hai.';
    if (form.pincode.length !== 6)
      nextErrors.pincode = 'Valid 6-digit pincode enter karein.';
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  // ─── Modal open/close ────────────────────────────────────
  const openAddModal = () => {
    setEditingId(null);
    setForm({
      ...EMPTY_FORM,
      fullName: `${customerProfile?.firstName || ''} ${
        customerProfile?.lastName || ''
      }`.trim(),
      phone: customerProfile?.phone || '',
    });
    setErrors({});
    openModalAnimation();
  };

  const openEditModal = address => {
    setEditingId(address.id);
    setForm({
      label: address.label,
      fullName: address.fullName,
      phone: address.phone,
      house: address.house,
      area: address.area,
      landmark: address.landmark,
      city: address.city,
      state: address.state,
      pincode: address.pincode,
      coordinates: address.coordinates,
    });
    setErrors({});
    openModalAnimation();
  };

  // ─── Enhanced Reverse Geocode with colony, area, city, state, pincode ──
  const fetchAddressFromCoords = async (latitude, longitude) => {
    // Try Google Maps first
    try {
      const API_KEY = 'AIzaSyB77k6QiCy-MuwibOycyCksSAM4nbGnNAg';
      const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${API_KEY}`;
      const response = await axios.get(url);

      if (response.data.status === 'OK' && response.data.results.length > 0) {
        const result = response.data.results[0];
        const components = result.address_components;
        let city = '',
          state = '',
          pincode = '',
          area = '',
          colony = '',
          street = '',
          landmark = '',
          house = '';

        components.forEach(comp => {
          const types = comp.types;
          if (types.includes('locality')) city = comp.long_name;
          if (types.includes('administrative_area_level_1'))
            state = comp.long_name;
          if (types.includes('postal_code')) pincode = comp.long_name;
          if (types.includes('sublocality_level_1')) area = comp.long_name;
          if (types.includes('sublocality_level_2')) colony = comp.long_name;
          if (types.includes('route')) street = comp.long_name;
          if (types.includes('point_of_interest')) landmark = comp.long_name;
          if (types.includes('street_number')) house = comp.long_name;
        });

        // Fallbacks
        if (!area && colony) area = colony;
        if (!area && !colony) area = street || '';
        if (!landmark && street) landmark = street;
        if (!landmark && !street && area) landmark = area;

        // Combine colony and area if both exist and differ
        let fullArea = area;
        if (colony && area && colony !== area) {
          fullArea = `${colony}, ${area}`;
        } else if (colony && !area) {
          fullArea = colony;
        }

        const fullAddress = [house, street, colony, area, city, state, pincode]
          .filter(Boolean)
          .join(', ');

        return {
          city,
          state,
          pincode,
          area: fullArea,
          colony,
          street,
          landmark,
          house,
          display: fullAddress,
        };
      }
    } catch (error) {
      console.warn('Google geocode error:', error);
    }

    // ─── Fallback: Nominatim ────────────────────────────────
    try {
      const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`;
      const response = await axios.get(url, {
        headers: { 'User-Agent': 'FoodMitra/1.0 (https://FoodMitra.in)' },
        timeout: 10000,
      });
      const address = response.data.address;
      if (address) {
        const city = address.city || address.town || address.village || '';
        const state = address.state || '';
        const pincode = address.postcode || '';
        const area =
          address.suburb || address.neighbourhood || address.hamlet || '';
        const colony = address.suburb || address.neighbourhood || '';
        const road = address.road || '';
        const landmark = address.public_building || address.tourism || '';
        const house = address.house_number || '';

        let fullArea = area;
        if (colony && area && colony !== area) {
          fullArea = `${colony}, ${area}`;
        } else if (colony && !area) {
          fullArea = colony;
        } else if (!area && road) {
          fullArea = road;
        }

        const display = [house, road, colony, area, city, state, pincode]
          .filter(Boolean)
          .join(', ');

        return {
          city,
          state,
          pincode,
          area: fullArea,
          colony,
          street: road,
          landmark: landmark || road || fullArea,
          house,
          display,
        };
      }
    } catch (error) {
      console.warn('Nominatim error:', error);
    }
    return null;
  };

  // ─── Request permission ─────────────────────────────────
  const requestLocationPermission = async () => {
    try {
      const permission =
        Platform.OS === 'ios'
          ? PERMISSIONS.IOS.LOCATION_WHEN_IN_USE
          : PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION;

      const status = await check(permission);
      if (status === RESULTS.GRANTED) return true;
      if (status === RESULTS.DENIED) {
        const result = await request(permission);
        return result === RESULTS.GRANTED;
      }
      if (status === RESULTS.BLOCKED) {
        Alert.alert(
          'Location Permission',
          'Please enable location from settings.',
          [
            { text: 'Cancel', style: 'cancel' },
            {
              text: 'Open Settings',
              onPress: () => {
                try {
                  Linking.openSettings();
                } catch (e) {
                  console.error('Cannot open settings:', e);
                }
              },
            },
          ],
        );
        return false;
      }
      return false;
    } catch (error) {
      console.error('Permission error:', error);
      return false;
    }
  };

  // ─── Get current location with reverse geocoding ──────────
  const getCurrentLocation = async () => {
    try {
      const hasPermission = await requestLocationPermission();
      if (!hasPermission) {
        showToast({
          title: 'Permission denied',
          message: 'Location access required.',
          type: 'danger',
        });
        return;
      }

      if (!Geolocation) {
        showToast({
          title: 'Error',
          message: 'Location service unavailable.',
          type: 'danger',
        });
        return;
      }

      setIsFetchingLocation(true);

      Geolocation.getCurrentPosition(
        async position => {
          try {
            const { latitude, longitude } = position.coords;
            // Update coordinates
            setForm(prev => ({
              ...prev,
              coordinates: { latitude, longitude },
            }));

            // Reverse geocode
            const addressData = await fetchAddressFromCoords(
              latitude,
              longitude,
            );
            if (addressData) {
              setForm(prev => ({
                ...prev,
                city: addressData.city || prev.city,
                state: addressData.state || prev.state,
                pincode: addressData.pincode || prev.pincode,
                area: addressData.area || prev.area,
                landmark: addressData.landmark || prev.landmark,
                // house is intentionally NOT auto-filled (manual entry)
              }));
              showToast({
                title: 'Address filled',
                message: 'City, state, area and pincode auto‑filled.',
                type: 'success',
              });
            } else {
              showToast({
                title: 'Location captured',
                message: `Lat: ${latitude.toFixed(4)}, Lng: ${longitude.toFixed(
                  4,
                )}\nPlease fill address manually.`,
                type: 'info',
              });
            }
          } catch (e) {
            console.error('Location processing error:', e);
            showToast({
              title: 'Error',
              message: 'Failed to process location.',
              type: 'danger',
            });
          } finally {
            setIsFetchingLocation(false);
          }
        },
        error => {
          console.warn('Geolocation error:', error);
          let msg = 'Unable to fetch location. ';
          if (error.code === 1) msg += 'Permission denied.';
          else if (error.code === 2) msg += 'GPS is off.';
          else if (error.code === 3) msg += 'Timeout.';
          else msg += error.message || 'Unknown error.';
          showToast({ title: 'Location error', message: msg, type: 'danger' });
          setIsFetchingLocation(false);
        },
        { enableHighAccuracy: true, timeout: 20000 },
      );
    } catch (e) {
      console.error('getCurrentLocation error:', e);
      setIsFetchingLocation(false);
      showToast({
        title: 'Error',
        message: 'Something went wrong.',
        type: 'danger',
      });
    }
  };

  // ─── Save address ────────────────────────────────────────
  const handleSaveAddress = async () => {
    if (!validateForm()) return;

    // Map label to backend enum
    const labelMap = {
      Home: 'home',
      Office: 'work',
      Other: 'other',
    };
    const backendLabel = labelMap[form.label] || 'home';

    const payload = {
      label: backendLabel,
      name: form.fullName.trim(),
      phone: form.phone.trim(),
      addressLine: form.house.trim(),
      landmark: form.area.trim(),
      city: form.city.trim(),
      state: form.state.trim(),
      pincode: form.pincode.trim(),
    };

    if (form.coordinates) {
      payload.location = {
        coordinates: [form.coordinates.longitude, form.coordinates.latitude],
      };
    }

    try {
      if (editingId) {
        await updateAddress(editingId, payload);
      } else {
        await addAddress(payload);
      }
      await fetchAddresses();
      closeModal(() => {
        showToast({
          title: editingId ? 'Address updated' : 'Address saved',
          message: 'Your address has been saved successfully.',
          type: 'success',
        });
      });
    } catch (error) {
      console.error('Save address error:', error);
      showToast({
        title: 'Error',
        message: error.response?.data?.message || 'Failed to save address',
        type: 'danger',
      });
    }
  };

  // ─── Set default address ─────────────────────────────────
  const setDefault = async addressId => {
    try {
      await setDefaultAddress(addressId);
      await fetchAddresses();
      showToast({
        title: 'Default updated',
        message: 'Primary address changed successfully.',
        type: 'info',
      });
    } catch (error) {
      showToast({
        title: 'Error',
        message: error.response?.data?.message || 'Failed to update default',
        type: 'danger',
      });
    }
  };

  // ─── Remove address ──────────────────────────────────────
  const removeAddress = async addressId => {
    try {
      await deleteAddress(addressId);
      await fetchAddresses();
      showToast({
        title: 'Address removed',
        message: 'Address deleted successfully.',
        type: 'danger',
      });
    } catch (error) {
      showToast({
        title: 'Error',
        message: error.response?.data?.message || 'Failed to delete address',
        type: 'danger',
      });
    }
  };

  // ─── SELECT ADDRESS (FIXED) ───────────────────────────────

  // ... inside your component

  // ... inside your component

  const handleSelectAddress = address => {
    if (!address) {
      showToast({
        title: 'Error',
        message: 'Please select a valid address.',
        type: 'info',
      });
      return;
    }

    // Navigate to Checkout using the parent navigator
    const parent = navigation.getParent();
    if (parent) {
      parent.navigate('Checkout', { selectedAddress: address });
    } else {
      navigation.navigate('Checkout', { selectedAddress: address });
    }
  };

  // ─── Toast theme ─────────────────────────────────────────
  const toastTheme = useMemo(() => {
    if (toast.type === 'danger') {
      return {
        icon: 'trash-outline',
        iconColor: COLORS.danger,
        iconBackground: COLORS.dangerSoft,
        borderColor: '#fecaca',
      };
    }
    if (toast.type === 'info') {
      return {
        icon: 'information-circle-outline',
        iconColor: COLORS.info,
        iconBackground: COLORS.infoSoft,
        borderColor: '#bfdbfe',
      };
    }
    return {
      icon: 'checkmark-circle-outline',
      iconColor: COLORS.success,
      iconBackground: COLORS.successSoft,
      borderColor: '#bbf7d0',
    };
  }, [toast.type]);

  // ─── Render address item ─────────────────────────────────
  const renderAddressItem = ({ item: address }) => {
    const isSelected = selectedAddressId === address.id;
    const isDefault = address.isDefault;

    return (
      <Pressable
        onPress={() => {
          if (selectMode) {
            setSelectedAddressId(address.id);
            // Optionally auto-select without footer button:
            // handleSelectAddress(address);
          }
        }}
        style={({ pressed }) => [
          styles.addressCard,
          isDefault && styles.defaultAddressCard,
          isSelected && styles.selectedAddressCard,
          pressed && styles.pressed,
        ]}
      >
        {isDefault && <View style={styles.defaultTopLine} />}
        {isSelected && (
          <View style={styles.selectedOverlay}>
            <Ionicons
              name="checkmark-circle"
              size={28}
              color={COLORS.primary}
            />
          </View>
        )}
        <View style={styles.addressTop}>
          <View
            style={[styles.addressIcon, isDefault && styles.defaultAddressIcon]}
          >
            <Ionicons name={address.icon} size={21} color={COLORS.primary} />
          </View>
          <View style={styles.addressContent}>
            <View style={styles.addressTitleRow}>
              <Text style={styles.addressTitle}>{address.label}</Text>
              {isDefault && (
                <View style={styles.defaultBadge}>
                  <Ionicons
                    name="checkmark-circle"
                    size={12}
                    color={COLORS.success}
                  />
                  <Text style={styles.defaultBadgeText}>Default</Text>
                </View>
              )}
              {isSelected && selectMode && (
                <View style={styles.selectedBadge}>
                  <Ionicons name="checkmark" size={12} color={COLORS.white} />
                  <Text style={styles.selectedBadgeText}>Selected</Text>
                </View>
              )}
            </View>
            <Text style={styles.personName}>
              {address.fullName} • {address.phone}
            </Text>
            <Text style={styles.addressText}>
              {address.house}, {address.area}, {address.city}, {address.state} -{' '}
              {address.pincode}
            </Text>
            {address.coordinates && (
              <Text style={styles.coordText}>
                📍 {address.coordinates.latitude.toFixed(4)},{' '}
                {address.coordinates.longitude.toFixed(4)}
              </Text>
            )}
          </View>
        </View>

        {!selectMode && (
          <>
            <View style={styles.cardDivider} />
            <View style={styles.addressActions}>
              {!isDefault ? (
                <Pressable
                  onPress={() => setDefault(address.id)}
                  style={({ pressed }) => [
                    styles.actionButton,
                    pressed && styles.pressed,
                  ]}
                >
                  <Ionicons
                    name="checkmark-circle-outline"
                    size={16}
                    color={COLORS.primary}
                  />
                  <Text style={styles.actionText}>Set default</Text>
                </Pressable>
              ) : (
                <View style={styles.defaultActionPlaceholder}>
                  <Ionicons
                    name="shield-checkmark-outline"
                    size={16}
                    color={COLORS.success}
                  />
                  <Text style={styles.defaultActionText}>Primary address</Text>
                </View>
              )}

              <View style={styles.actionRight}>
                <Pressable
                  onPress={() => openEditModal(address)}
                  style={({ pressed }) => [
                    styles.iconButton,
                    pressed && styles.pressed,
                  ]}
                >
                  <Ionicons
                    name="create-outline"
                    size={18}
                    color={COLORS.title}
                  />
                </Pressable>
                <Pressable
                  onPress={() => removeAddress(address.id)}
                  style={({ pressed }) => [
                    styles.iconButton,
                    styles.deleteButton,
                    pressed && styles.pressed,
                  ]}
                >
                  <Ionicons
                    name="trash-outline"
                    size={18}
                    color={COLORS.danger}
                  />
                </Pressable>
              </View>
            </View>
          </>
        )}
      </Pressable>
    );
  };

  // ─── Loading state ────────────────────────────────────────
  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <ScreenHeader
          navigation={navigation}
          title="Saved addresses"
          subtitle="Loading your addresses..."
        />
        <View
          style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}
        >
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      </SafeAreaView>
    );
  }

  // ─── Render ──────────────────────────────────────────────
  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />

      <ScreenHeader
        navigation={navigation}
        title={selectMode ? 'Select address' : 'Saved addresses'}
        subtitle={
          selectMode
            ? 'Choose a delivery address'
            : `${addresses.length} delivery locations saved`
        }
        rightComponent={
          selectMode ? (
            <Pressable
              onPress={() => navigation.goBack()}
              style={styles.cancelButton}
            >
              <Text style={styles.cancelText}>Cancel</Text>
            </Pressable>
          ) : undefined
        }
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        {!selectMode && (
          <View style={styles.heroCard}>
            <View style={styles.heroGlowOne} />
            <View style={styles.heroGlowTwo} />
            <View style={styles.heroIcon}>
              <Ionicons
                name="navigate-outline"
                size={24}
                color={COLORS.white}
              />
            </View>
            <View style={styles.heroContent}>
              <Text style={styles.heroTitle}>Make Your Delivery Faster</Text>
              <Text style={styles.heroText}>
                Save an accurate address so your delivery partner can reach you
                faster.
              </Text>
            </View>
            <View style={styles.addressCount}>
              <Text style={styles.addressCountNumber}>{addresses.length}</Text>
              <Text style={styles.addressCountLabel}>SAVED</Text>
            </View>
          </View>
        )}

        <View style={styles.sectionHeader}>
          <View>
            <Text style={styles.sectionTitle}>Your locations</Text>
            <Text style={styles.sectionSubtitle}>
              {selectMode
                ? 'Tap to select a delivery address'
                : 'Make Your Delivery Faster'}
            </Text>
          </View>
          {addresses.length > 0 && !selectMode && (
            <View style={styles.secureBadge}>
              <Ionicons
                name="shield-checkmark"
                size={13}
                color={COLORS.success}
              />
              <Text style={styles.secureBadgeText}>SECURE</Text>
            </View>
          )}
        </View>

        {addresses.length === 0 ? (
          <View style={styles.emptyState}>
            <View style={styles.emptyIcon}>
              <Ionicons
                name="location-outline"
                size={38}
                color={COLORS.primary}
              />
            </View>
            <Text style={styles.emptyTitle}>No saved address</Text>
            <Text style={styles.emptyText}>
              {selectMode
                ? 'Please add an address first.'
                : 'Apna pehla delivery address add karein.'}
            </Text>
          </View>
        ) : (
          <FlatList
            data={addresses}
            renderItem={renderAddressItem}
            keyExtractor={item => item.id}
            showsVerticalScrollIndicator={false}
            scrollEnabled={false}
            contentContainerStyle={styles.addressList}
          />
        )}

        {!selectMode && (
          <Pressable
            onPress={openAddModal}
            style={({ pressed }) => [
              styles.addAddressButton,
              pressed && styles.addAddressButtonPressed,
            ]}
          >
            <View style={styles.addIcon}>
              <Ionicons name="add" size={22} color={COLORS.primary} />
            </View>
            <View style={styles.addButtonContent}>
              <Text style={styles.addAddressText}>Add new address</Text>
              <Text style={styles.addAddressSubtitle}>
                Save a New Delivery Location
              </Text>
            </View>
            <Ionicons name="arrow-forward" size={19} color={COLORS.white} />
          </Pressable>
        )}
      </ScrollView>

      {selectMode && addresses.length > 0 && (
        <View style={[styles.fixedFooter, { paddingBottom: insets.bottom }]}>
          <Pressable
            onPress={() => {
              const selected = addresses.find(a => a.id === selectedAddressId);
              handleSelectAddress(selected);
            }}
            style={({ pressed }) => [
              styles.selectButton,
              pressed && styles.selectButtonPressed,
              !selectedAddressId && styles.selectButtonDisabled,
            ]}
            disabled={!selectedAddressId}
          >
            <Text style={styles.selectButtonText}>
              {selectedAddressId ? 'Select Address' : 'Choose an address'}
            </Text>
          </Pressable>
        </View>
      )}

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
          <View style={[styles.toast, { borderColor: toastTheme.borderColor }]}>
            <View
              style={[
                styles.toastIcon,
                { backgroundColor: toastTheme.iconBackground },
              ]}
            >
              <Ionicons
                name={toastTheme.icon}
                size={22}
                color={toastTheme.iconColor}
              />
            </View>
            <View style={styles.toastContent}>
              <Text style={styles.toastTitle}>{toast.title}</Text>
              <Text style={styles.toastMessage} numberOfLines={2}>
                {toast.message}
              </Text>
            </View>
            <Pressable
              onPress={hideToast}
              hitSlop={10}
              style={({ pressed }) => [
                styles.toastCloseButton,
                pressed && styles.toastClosePressed,
              ]}
            >
              <Ionicons name="close" size={19} color={COLORS.text} />
            </Pressable>
          </View>
        </Animated.View>
      )}

      <Modal
        visible={modalVisible}
        transparent
        statusBarTranslucent
        animationType="none"
        onRequestClose={() => closeModal()}
      >
        <KeyboardAvoidingView
          style={styles.modalRoot}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <Animated.View
            style={[styles.backdrop, { opacity: backdropOpacity }]}
          >
            <Pressable
              style={StyleSheet.absoluteFill}
              onPress={() => closeModal()}
            />
          </Animated.View>

          <Animated.View
            style={[
              styles.modalCard,
              { transform: [{ translateY: modalTranslateY }] },
            ]}
          >
            <SafeAreaView style={styles.modalSafeArea} edges={['top']}>
              <View style={styles.modalHeader}>
                <View>
                  <Text style={styles.modalEyebrow}>DELIVERY LOCATION</Text>
                  <Text style={styles.modalTitle}>{modalTitle}</Text>
                </View>
                <Pressable
                  onPress={() => closeModal()}
                  style={styles.closeButton}
                >
                  <Ionicons name="close" size={21} color={COLORS.title} />
                </Pressable>
              </View>

              <ScrollView
                style={styles.modalBody}
                contentContainerStyle={styles.modalContentWrapper}
                keyboardShouldPersistTaps="handled"
              >
                <Text style={styles.sectionLabel}>Address type</Text>
                <View style={styles.typeRow}>
                  {ADDRESS_TYPES.map(type => {
                    const selected = form.label === type.id;
                    return (
                      <Pressable
                        key={type.id}
                        onPress={() => updateForm('label', type.id)}
                        style={[
                          styles.typeButton,
                          selected && styles.typeButtonSelected,
                        ]}
                      >
                        <Ionicons
                          name={type.icon}
                          size={18}
                          color={selected ? COLORS.white : COLORS.primary}
                        />
                        <Text
                          style={[
                            styles.typeText,
                            selected && styles.typeTextSelected,
                          ]}
                        >
                          {type.id}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>

                <FormInput
                  icon="person-outline"
                  label="Full name"
                  placeholder="Receiver ka full name"
                  value={form.fullName}
                  error={errors.fullName}
                  autoCapitalize="words"
                  onChangeText={value => updateForm('fullName', value)}
                  editable={false}
                />

                <FormInput
                  icon="call-outline"
                  label="Mobile number"
                  placeholder="10-digit mobile number"
                  value={form.phone}
                  error={errors.phone}
                  keyboardType="number-pad"
                  maxLength={10}
                  onChangeText={value =>
                    updateForm('phone', value.replace(/[^0-9]/g, ''))
                  }
                  editable={false}
                />

                <FormInput
                  icon="home-outline"
                  label="House / flat / building"
                  placeholder="House no., flat ya building"
                  value={form.house}
                  error={errors.house}
                  onChangeText={value => updateForm('house', value)}
                />

                <FormInput
                  icon="map-outline"
                  label="Area / locality"
                  placeholder="Area, street ya locality"
                  value={form.area}
                  error={errors.area}
                  onChangeText={value => updateForm('area', value)}
                />

                <FormInput
                  icon="flag-outline"
                  label="Landmark (optional)"
                  placeholder="Nearby landmark"
                  value={form.landmark}
                  error={errors.landmark}
                  onChangeText={value => updateForm('landmark', value)}
                />

                <View style={styles.twoColumnRow}>
                  <View style={styles.halfField}>
                    <FormInput
                      icon="business-outline"
                      label="City"
                      placeholder="City"
                      value={form.city}
                      error={errors.city}
                      onChangeText={value => updateForm('city', value)}
                    />
                  </View>
                  <View style={styles.halfField}>
                    <FormInput
                      icon="map-outline"
                      label="State"
                      placeholder="State"
                      value={form.state}
                      error={errors.state}
                      onChangeText={value => updateForm('state', value)}
                    />
                  </View>
                </View>

                <FormInput
                  icon="pin-outline"
                  label="Pincode"
                  placeholder="6-digit pincode"
                  value={form.pincode}
                  error={errors.pincode}
                  keyboardType="number-pad"
                  maxLength={6}
                  onChangeText={value =>
                    updateForm('pincode', value.replace(/[^0-9]/g, ''))
                  }
                />

                <Pressable
                  onPress={getCurrentLocation}
                  disabled={isFetchingLocation}
                  style={({ pressed }) => [
                    styles.locationButton,
                    pressed && styles.pressed,
                  ]}
                >
                  <Ionicons
                    name="location-outline"
                    size={20}
                    color={COLORS.primary}
                  />
                  <Text style={styles.locationButtonText}>
                    {isFetchingLocation
                      ? 'Getting location...'
                      : form.coordinates
                      ? `📍 ${form.coordinates.latitude.toFixed(
                          4,
                        )}, ${form.coordinates.longitude.toFixed(4)}`
                      : 'Use current location'}
                  </Text>
                  {form.coordinates && (
                    <Pressable
                      onPress={() => updateForm('coordinates', null)}
                      hitSlop={10}
                    >
                      <Ionicons name="close-circle" size={18} color="#9ca3af" />
                    </Pressable>
                  )}
                </Pressable>

                <View style={styles.coordRow}>
                  <View style={styles.halfField}>
                    <Text style={styles.fieldLabel}>Latitude (optional)</Text>
                    <TextInput
                      style={styles.manualInput}
                      placeholder="e.g. 22.7196"
                      keyboardType="numeric"
                      value={form.coordinates?.latitude?.toString() || ''}
                      onChangeText={value => {
                        const lat = parseFloat(value);
                        if (!isNaN(lat)) {
                          updateForm('coordinates', {
                            ...form.coordinates,
                            latitude: lat,
                          });
                        }
                      }}
                    />
                  </View>
                  <View style={styles.halfField}>
                    <Text style={styles.fieldLabel}>Longitude (optional)</Text>
                    <TextInput
                      style={styles.manualInput}
                      placeholder="e.g. 75.8577"
                      keyboardType="numeric"
                      value={form.coordinates?.longitude?.toString() || ''}
                      onChangeText={value => {
                        const lng = parseFloat(value);
                        if (!isNaN(lng)) {
                          updateForm('coordinates', {
                            ...form.coordinates,
                            longitude: lng,
                          });
                        }
                      }}
                    />
                  </View>
                </View>

                <View style={{ height: 20 }} />
              </ScrollView>

              <View style={styles.modalFooter}>
                <Pressable
                  onPress={handleSaveAddress}
                  style={({ pressed }) => [
                    styles.saveButton,
                    pressed && styles.saveButtonPressed,
                  ]}
                >
                  <Text style={styles.saveButtonText}>
                    {editingId ? 'Update address' : 'Save address'}
                  </Text>
                  <View style={styles.saveIcon}>
                    <Ionicons
                      name="checkmark"
                      size={20}
                      color={COLORS.primary}
                    />
                  </View>
                </Pressable>
              </View>
            </SafeAreaView>
          </Animated.View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}

// ─── FormInput component ──────────────────────────────────
function FormInput({
  icon,
  label,
  error,
  style,
  editable = true,
  ...inputProps
}) {
  return (
    <View style={[styles.fieldWrapper, style]}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <View
        style={[
          styles.inputContainer,
          error && styles.inputContainerError,
          !editable && styles.inputDisabled,
        ]}
      >
        <View style={styles.inputIcon}>
          <Ionicons
            name={icon}
            size={18}
            color={error ? COLORS.danger : COLORS.primary}
          />
        </View>
        <TextInput
          {...inputProps}
          style={[styles.input, !editable && styles.inputDisabledText]}
          placeholderTextColor="#aaa1a0"
          selectionColor={COLORS.primary}
          editable={editable}
        />
      </View>
      {error && (
        <View style={styles.errorRow}>
          <Ionicons
            name="alert-circle-outline"
            size={14}
            color={COLORS.danger}
          />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}
    </View>
  );
}

// ─── Styles ────────────────────────────────────────────────
const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.background },
  content: { paddingHorizontal: 18, paddingTop: 12, paddingBottom: 130 },

  heroCard: {
    minHeight: 112,
    padding: 16,
    overflow: 'hidden',
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 25,
    backgroundColor: COLORS.title,
    shadowColor: COLORS.title,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.17,
    shadowRadius: 18,
    elevation: 7,
  },
  heroGlowOne: {
    position: 'absolute',
    top: -65,
    right: -25,
    width: 155,
    height: 155,
    borderRadius: 78,
    backgroundColor: 'rgba(255,90,31,0.32)',
  },
  heroGlowTwo: {
    position: 'absolute',
    left: -70,
    bottom: -90,
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  heroIcon: {
    width: 50,
    height: 50,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
  },
  heroContent: { flex: 1, marginLeft: 12 },
  heroTitle: { color: COLORS.white, fontSize: 13, fontWeight: '900' },
  heroText: {
    marginTop: 5,
    color: 'rgba(255,255,255,0.6)',
    fontSize: 9,
    lineHeight: 14,
  },
  addressCount: {
    minWidth: 48,
    height: 48,
    paddingHorizontal: 7,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 15,
    backgroundColor: COLORS.white,
  },
  addressCountNumber: {
    color: COLORS.primary,
    fontSize: 15,
    fontWeight: '900',
  },
  addressCountLabel: {
    marginTop: 1,
    color: COLORS.muted,
    fontSize: 6.5,
    fontWeight: '900',
  },

  sectionHeader: {
    marginTop: 24,
    marginBottom: 13,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionTitle: { color: COLORS.title, fontSize: 17, fontWeight: '900' },
  sectionSubtitle: { marginTop: 4, color: COLORS.muted, fontSize: 9 },
  secureBadge: {
    paddingHorizontal: 9,
    paddingVertical: 6,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 10,
    backgroundColor: COLORS.successSoft,
  },
  secureBadgeText: {
    marginLeft: 4,
    color: COLORS.success,
    fontSize: 7.5,
    fontWeight: '900',
  },

  addressList: { gap: 13, paddingBottom: 8 },
  addressCard: {
    position: 'relative',
    overflow: 'hidden',
    padding: 15,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.white,
    shadowColor: '#7c2d12',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.06,
    shadowRadius: 14,
    elevation: 3,
  },
  defaultAddressCard: { borderColor: '#bbf7d0' },
  selectedAddressCard: {
    borderColor: COLORS.primary,
    borderWidth: 2,
    backgroundColor: '#fff8f4',
  },
  defaultTopLine: {
    position: 'absolute',
    top: 0,
    left: 24,
    right: 24,
    height: 3,
    borderBottomLeftRadius: 3,
    borderBottomRightRadius: 3,
    backgroundColor: COLORS.success,
  },
  selectedOverlay: {
    position: 'absolute',
    top: 12,
    right: 12,
    zIndex: 5,
    backgroundColor: COLORS.white,
    borderRadius: 20,
    padding: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  addressTop: { flexDirection: 'row' },
  addressIcon: {
    width: 48,
    height: 48,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.soft,
  },
  defaultAddressIcon: { backgroundColor: '#fff5ef' },
  addressContent: { flex: 1, marginLeft: 12 },
  addressTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  addressTitle: { color: COLORS.title, fontSize: 13, fontWeight: '900' },
  defaultBadge: {
    marginLeft: 9,
    paddingHorizontal: 7,
    paddingVertical: 4,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 8,
    backgroundColor: COLORS.successSoft,
  },
  defaultBadgeText: {
    marginLeft: 3,
    color: COLORS.success,
    fontSize: 7.5,
    fontWeight: '900',
  },
  selectedBadge: {
    marginLeft: 9,
    paddingHorizontal: 7,
    paddingVertical: 4,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 8,
    backgroundColor: COLORS.primary,
  },
  selectedBadgeText: {
    marginLeft: 3,
    color: COLORS.white,
    fontSize: 7.5,
    fontWeight: '900',
  },
  personName: {
    marginTop: 7,
    color: COLORS.text,
    fontSize: 9.5,
    fontWeight: '700',
  },
  addressText: {
    marginTop: 6,
    color: COLORS.muted,
    fontSize: 9.5,
    lineHeight: 15,
  },

  cardDivider: { height: 1, marginVertical: 14, backgroundColor: '#f2eeeb' },
  addressActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  actionButton: {
    paddingHorizontal: 10,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 11,
    backgroundColor: COLORS.soft,
  },
  actionText: {
    marginLeft: 5,
    color: COLORS.primary,
    fontSize: 8.5,
    fontWeight: '900',
  },
  defaultActionPlaceholder: { flexDirection: 'row', alignItems: 'center' },
  defaultActionText: {
    marginLeft: 5,
    color: COLORS.success,
    fontSize: 8.5,
    fontWeight: '800',
  },
  actionRight: { flexDirection: 'row', gap: 8 },
  iconButton: {
    width: 38,
    height: 38,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.white,
  },
  deleteButton: { borderColor: '#fecaca', backgroundColor: '#fff7f7' },

  addAddressButton: {
    minHeight: 66,
    marginTop: 18,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 21,
    backgroundColor: COLORS.primary,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.22,
    shadowRadius: 15,
    elevation: 7,
  },
  addAddressButtonPressed: { opacity: 0.9, transform: [{ scale: 0.985 }] },
  addIcon: {
    width: 40,
    height: 40,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.white,
  },
  addButtonContent: { flex: 1, marginLeft: 11 },
  addAddressText: { color: COLORS.white, fontSize: 13, fontWeight: '900' },
  addAddressSubtitle: {
    marginTop: 4,
    color: 'rgba(255,255,255,0.67)',
    fontSize: 8.5,
  },

  emptyState: {
    paddingVertical: 75,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 25,
    backgroundColor: COLORS.white,
  },
  emptyIcon: {
    width: 82,
    height: 82,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.soft,
  },
  emptyTitle: {
    marginTop: 18,
    color: COLORS.title,
    fontSize: 17,
    fontWeight: '900',
  },
  emptyText: { marginTop: 7, color: COLORS.muted, fontSize: 10 },

  pressed: { opacity: 0.76, transform: [{ scale: 0.97 }] },

  toastWrapper: {
    position: 'absolute',
    left: 15,
    right: 15,
    zIndex: 999,
    elevation: 30,
  },
  toast: {
    minHeight: 72,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 20,
    backgroundColor: COLORS.white,
    shadowColor: '#171717',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.18,
    shadowRadius: 18,
    elevation: 15,
  },
  toastIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  toastContent: { flex: 1, marginLeft: 11 },
  toastTitle: { color: COLORS.title, fontSize: 11.5, fontWeight: '900' },
  toastMessage: {
    marginTop: 4,
    color: COLORS.muted,
    fontSize: 8.5,
    lineHeight: 13,
  },
  toastCloseButton: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f7f4f2',
  },
  toastClosePressed: { opacity: 0.7, transform: [{ scale: 0.94 }] },

  modalRoot: { flex: 1, justifyContent: 'flex-start' },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(23,23,23,0.48)',
  },
  modalCard: {
    height: '92%',
    overflow: 'hidden',
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    backgroundColor: COLORS.background,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.25,
    shadowRadius: 24,
    elevation: 20,
  },
  modalSafeArea: { flex: 1, backgroundColor: COLORS.background },
  modalBody: {
    flex: 1,
    paddingHorizontal: 18,
    paddingTop: 18,
    paddingBottom: 10,
  },
  modalContentWrapper: { paddingBottom: 40 },

  modalFooter: {
    flexShrink: 0,
    paddingHorizontal: 18,
    paddingTop: 12,
    paddingBottom: Platform.OS === 'ios' ? 14 : 18,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    backgroundColor: COLORS.background,
    elevation: 10,
  },

  modalHeader: {
    paddingHorizontal: 18,
    paddingTop: 12,
    paddingBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  modalEyebrow: {
    color: COLORS.primary,
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 1,
  },
  modalTitle: {
    marginTop: 4,
    color: COLORS.title,
    fontSize: 20,
    fontWeight: '900',
  },
  closeButton: {
    width: 42,
    height: 42,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.white,
  },

  sectionLabel: {
    marginBottom: 10,
    color: COLORS.title,
    fontSize: 11,
    fontWeight: '900',
  },
  typeRow: { marginBottom: 20, flexDirection: 'row', gap: 10 },
  typeButton: {
    flex: 1,
    height: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#ffd6c4',
    backgroundColor: COLORS.soft,
  },
  typeButtonSelected: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primary,
  },
  typeText: {
    marginLeft: 6,
    color: COLORS.primary,
    fontSize: 10,
    fontWeight: '900',
  },
  typeTextSelected: { color: COLORS.white },

  fieldWrapper: { marginBottom: 15 },
  fieldLabel: {
    marginBottom: 8,
    color: COLORS.text,
    fontSize: 9.5,
    fontWeight: '800',
  },
  inputContainer: {
    height: 57,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 17,
    borderWidth: 1.3,
    borderColor: COLORS.border,
    backgroundColor: COLORS.white,
  },
  inputContainerError: { borderColor: '#ef4444', backgroundColor: '#fff7f7' },
  inputIcon: {
    width: 34,
    height: 34,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.soft,
  },
  input: {
    flex: 1,
    marginLeft: 10,
    color: COLORS.title,
    fontSize: 11.5,
    fontWeight: '700',
  },
  errorRow: {
    marginTop: 6,
    marginLeft: 4,
    flexDirection: 'row',
    alignItems: 'center',
  },
  errorText: {
    marginLeft: 5,
    color: COLORS.danger,
    fontSize: 8.5,
    fontWeight: '700',
  },

  twoColumnRow: { flexDirection: 'row', gap: 10 },
  halfField: { flex: 1 },

  saveButton: {
    height: 60,
    paddingHorizontal: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
    backgroundColor: COLORS.primary,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.22,
    shadowRadius: 14,
    elevation: 8,
  },
  saveButtonPressed: { opacity: 0.9, transform: [{ scale: 0.985 }] },
  saveButtonText: { color: COLORS.white, fontSize: 13, fontWeight: '900' },
  saveIcon: {
    position: 'absolute',
    right: 13,
    width: 36,
    height: 36,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.white,
  },

  coordText: {
    marginTop: 4,
    color: COLORS.muted,
    fontSize: 8.5,
    fontFamily: 'monospace',
  },
  locationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: '#f9fafb',
    marginBottom: 10,
  },
  locationButtonText: {
    marginLeft: 8,
    color: COLORS.text,
    fontSize: 12,
    fontWeight: '600',
  },
  coordRow: { flexDirection: 'row', gap: 10, marginBottom: 10 },
  manualInput: {
    height: 57,
    paddingHorizontal: 12,
    borderRadius: 17,
    borderWidth: 1.3,
    borderColor: COLORS.border,
    backgroundColor: COLORS.white,
    color: COLORS.title,
    fontSize: 11.5,
    fontWeight: '700',
  },

  inputDisabled: { backgroundColor: '#f3f4f6', borderColor: '#e5e7eb' },
  inputDisabledText: { color: '#6b7280' },

  // ─── Selection mode UI ──────────────────────────────────
  cancelButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  cancelText: {
    color: COLORS.primary,
    fontSize: 14,
    fontWeight: '700',
  },
  fixedFooter: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 18,
    paddingTop: 12,
    backgroundColor: COLORS.background,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
  },
  selectButton: {
    height: 56,
    borderRadius: 16,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 6,
  },
  selectButtonPressed: { opacity: 0.9, transform: [{ scale: 0.98 }] },
  selectButtonDisabled: { opacity: 0.5 },
  selectButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '800',
  },
});
