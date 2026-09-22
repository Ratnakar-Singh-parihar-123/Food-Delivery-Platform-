import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  StatusBar,
  SafeAreaView,
  Dimensions,
  ActivityIndicator,
  Alert,
} from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useNavigation, useRoute } from '@react-navigation/native';

const { width, height } = Dimensions.get('window');

const COLORS = {
  primary: '#f25a22',
  white: '#ffffff',
  title: '#1a1a2e',
  text: '#4a4a5a',
  border: '#e8e4e0',
  success: '#16a34a',
  danger: '#ef4444',
  background: '#fef9f5',
};

export default function RiderTrackMap() {
  const navigation = useNavigation();
  const route = useRoute();
  const mapRef = useRef(null);

  // ─── Extract params ──────────────────────────────────
  let { vendorCoords, customerCoords, orderId, vendorName } =
    route.params || {};

  // ─── Helper: को भी object में बदलें ──────────────────
  const normalizeCoords = coords => {
    if (!coords) return null;
    // अगर पहले से object है { latitude, longitude }
    if (coords.latitude !== undefined && coords.longitude !== undefined) {
      return coords;
    }
    // अगर array है [longitude, latitude]
    if (Array.isArray(coords) && coords.length === 2) {
      return { latitude: coords[1], longitude: coords[0] };
    }
    // अगर object है { lat, lng }
    if (coords.lat !== undefined && coords.lng !== undefined) {
      return { latitude: coords.lat, longitude: coords.lng };
    }
    return null;
  };

  const vendor = normalizeCoords(vendorCoords);
  const customer = normalizeCoords(customerCoords);

  const hasVendor = !!vendor;
  const hasCustomer = !!customer;

  const [region, setRegion] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // ─── Debug Alert ──────────────────────────────────
    Alert.alert(
      '📍 Received Coords',
      `Vendor: ${JSON.stringify(vendor)}\nCustomer: ${JSON.stringify(
        customer,
      )}`,
      [{ text: 'OK' }],
    );

    if (!hasVendor && !hasCustomer) {
      Alert.alert('Error', 'No location data available');
      navigation.goBack();
      return;
    }

    let centerLat, centerLng;
    if (hasVendor && hasCustomer) {
      centerLat = (vendor.latitude + customer.latitude) / 2;
      centerLng = (vendor.longitude + customer.longitude) / 2;
    } else if (hasVendor) {
      centerLat = vendor.latitude;
      centerLng = vendor.longitude;
    } else {
      centerLat = customer.latitude;
      centerLng = customer.longitude;
    }

    const latitudeDelta = hasVendor && hasCustomer ? 0.02 : 0.01;
    const longitudeDelta = hasVendor && hasCustomer ? 0.02 : 0.01;

    setRegion({
      latitude: centerLat,
      longitude: centerLng,
      latitudeDelta,
      longitudeDelta,
    });

    setLoading(false);
  }, []);

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
      <View style={styles.header}>
        <Pressable
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Ionicons name="chevron-back" size={28} color={COLORS.title} />
        </Pressable>
        <Text style={styles.headerTitle}>Track Location</Text>
        <View style={{ width: 44 }} />
      </View>

      <View style={styles.mapContainer}>
        {region && (
          <MapView
            ref={mapRef}
            provider={PROVIDER_GOOGLE}
            style={styles.map}
            initialRegion={region}
            showsUserLocation={false}
            showsMyLocationButton={false}
            showsCompass={false}
          >
            {hasVendor && (
              <Marker
                coordinate={{
                  latitude: vendor.latitude,
                  longitude: vendor.longitude,
                }}
                title={vendorName || 'Vendor'}
                description="Pickup location"
              >
                <View style={styles.markerVendor}>
                  <Ionicons name="storefront" size={24} color="#fff" />
                </View>
              </Marker>
            )}
            {hasCustomer && (
              <Marker
                coordinate={{
                  latitude: customer.latitude,
                  longitude: customer.longitude,
                }}
                title="Customer"
                description="Delivery location"
              >
                <View style={styles.markerCustomer}>
                  <Ionicons name="person" size={24} color="#fff" />
                </View>
              </Marker>
            )}
          </MapView>
        )}
      </View>

      <View style={styles.infoCard}>
        <Text style={styles.orderId}>Order #{orderId?.slice(-6) || 'N/A'}</Text>
        <View style={styles.infoRow}>
          <View style={styles.dotVendor} />
          <Text style={styles.infoText}>{vendorName || 'Vendor'} – Pickup</Text>
        </View>
        {hasCustomer && (
          <View style={styles.infoRow}>
            <View style={styles.dotCustomer} />
            <Text style={styles.infoText}>Customer – Delivery</Text>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.background },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: { fontSize: 18, fontWeight: '700', color: COLORS.title },
  mapContainer: { flex: 1, backgroundColor: '#e8e4e0' },
  map: { width: '100%', height: '100%' },
  markerVendor: {
    backgroundColor: COLORS.primary,
    padding: 8,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#fff',
  },
  markerCustomer: {
    backgroundColor: COLORS.success,
    padding: 8,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#fff',
  },
  infoCard: {
    backgroundColor: COLORS.white,
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
  },
  orderId: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.title,
    marginBottom: 8,
  },
  infoRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  dotVendor: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: COLORS.primary,
    marginRight: 10,
  },
  dotCustomer: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: COLORS.success,
    marginRight: 10,
  },
  infoText: { fontSize: 14, color: COLORS.text },
});
