import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  StatusBar,
  ActivityIndicator,
  Alert,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import Geolocation from '@react-native-community/geolocation';

const { width, height } = Dimensions.get('window');
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

export default function RiderTrackMapScreen({ navigation, route }) {
  const { vendorCoords, customerCoords, orderId, vendorName } =
    route.params || {};
  const [userLocation, setUserLocation] = useState(null);
  const [loading, setLoading] = useState(true);
  const mapRef = useRef(null);

  useEffect(() => {
    // Get current rider location
    Geolocation.getCurrentPosition(
      pos => {
        const { latitude, longitude } = pos.coords;
        setUserLocation({ latitude, longitude });
        setLoading(false);
        // Fit markers after map loads
        setTimeout(() => fitMarkers(), 500);
      },
      error => {
        console.warn('Location error:', error);
        setLoading(false);
        // Use fallback if no location
        fitMarkers();
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 },
    );
  }, []);

  const fitMarkers = () => {
    const coords = [];
    if (vendorCoords && vendorCoords.length === 2) {
      coords.push({ latitude: vendorCoords[1], longitude: vendorCoords[0] });
    }
    if (customerCoords && customerCoords.length === 2) {
      coords.push({
        latitude: customerCoords[1],
        longitude: customerCoords[0],
      });
    }
    if (userLocation) {
      coords.push(userLocation);
    }
    if (coords.length > 0 && mapRef.current) {
      mapRef.current.fitToCoordinates(coords, {
        edgePadding: { top: 50, right: 50, bottom: 50, left: 50 },
        animated: true,
      });
    }
  };

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
      <View style={styles.container}>
        {/* Back Button */}
        <Pressable
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Ionicons name="chevron-back" size={28} color={COLORS.title} />
        </Pressable>

        {/* Map */}
        <MapView
          ref={mapRef}
          provider={PROVIDER_GOOGLE}
          style={styles.map}
          initialRegion={{
            latitude: vendorCoords?.[1] || 28.6139,
            longitude: vendorCoords?.[0] || 77.209,
            latitudeDelta: 0.05,
            longitudeDelta: 0.05,
          }}
          showsUserLocation={true}
          showsMyLocationButton={true}
          onMapReady={fitMarkers}
        >
          {/* Vendor Marker */}
          {vendorCoords && vendorCoords.length === 2 && (
            <Marker
              coordinate={{
                latitude: vendorCoords[1],
                longitude: vendorCoords[0],
              }}
              title={vendorName || 'Vendor'}
              description="Pickup location"
              pinColor={COLORS.primary}
            >
              <View style={[styles.marker, styles.vendorMarker]}>
                <Ionicons name="storefront" size={20} color="#fff" />
              </View>
            </Marker>
          )}

          {/* Customer Marker */}
          {customerCoords && customerCoords.length === 2 && (
            <Marker
              coordinate={{
                latitude: customerCoords[1],
                longitude: customerCoords[0],
              }}
              title="Customer"
              description="Delivery location"
              pinColor={COLORS.success}
            >
              <View style={[styles.marker, styles.customerMarker]}>
                <Ionicons name="person" size={20} color="#fff" />
              </View>
            </Marker>
          )}
        </MapView>

        {/* Info Panel */}
        <View style={styles.infoPanel}>
          <Text style={styles.infoTitle}>
            Order #{orderId?.slice(-6) || 'N/A'}
          </Text>
          <View style={styles.infoRow}>
            <View style={styles.infoItem}>
              <Ionicons
                name="storefront-outline"
                size={16}
                color={COLORS.primary}
              />
              <Text style={styles.infoText}>{vendorName || 'Vendor'}</Text>
            </View>
            <View style={styles.infoItem}>
              <Ionicons
                name="location-outline"
                size={16}
                color={COLORS.success}
              />
              <Text style={styles.infoText}>Customer</Text>
            </View>
          </View>
          <Pressable style={styles.refreshBtn} onPress={fitMarkers}>
            <Ionicons name="refresh" size={20} color={COLORS.primary} />
            <Text style={styles.refreshText}>Fit Map</Text>
          </Pressable>
        </View>
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
  container: { flex: 1 },
  backButton: {
    position: 'absolute',
    top: 40,
    left: 16,
    zIndex: 10,
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  map: {
    width: width,
    height: height,
  },
  marker: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  vendorMarker: {
    backgroundColor: COLORS.primary,
  },
  customerMarker: {
    backgroundColor: COLORS.success,
  },
  infoPanel: {
    position: 'absolute',
    bottom: 40,
    left: 16,
    right: 16,
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 8,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.title,
    marginBottom: 8,
  },
  infoRow: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 10,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  infoText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
  },
  refreshBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: '#f1f5f9',
  },
  refreshText: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.primary,
  },
});
