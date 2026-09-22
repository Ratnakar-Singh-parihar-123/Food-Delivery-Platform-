// screens/PopularFoodsNearScreen.jsx
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  Image,
  FlatList,
  StyleSheet,
  StatusBar,
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity,
  Dimensions,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from '@react-native-vector-icons/ionicons';
import { useAppUI } from '../../context/AppUIContext';
import { getNearbyPopularFoods } from '../../api/customerApi';

const { width } = Dimensions.get('window');
const COLORS = {
  primary: '#ff5a1f',
  primaryLight: '#fff0e9',
  background: '#f8f4f0',
  white: '#ffffff',
  title: '#171717',
  text: '#374151',
  muted: '#8b929f',
  border: '#eee5df',
  success: '#15803d',
  danger: '#ef4444',
};

const STATIC_BASE = 'https://myfoodmitra-ecosystem.onrender.com';

const buildImageUrl = path => {
  if (!path) return null;
  if (path.startsWith('http')) return path;
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${STATIC_BASE}${cleanPath}`;
};

// Helper to get location name from context or fallback
const getLocationDisplay = coords => {
  if (!coords) return 'Your Location';
  return `${coords.lat?.toFixed(2)}, ${coords.lng?.toFixed(2)}`; // Could be replaced with reverse geocode
};

export default function PopularFoodsNearScreen({ navigation, route }) {
  const { locationCoords: contextCoords } = useAppUI();
  const routeCoords = route.params?.coords;
  const locationCoords = routeCoords || contextCoords;

  const [popularFoods, setPopularFoods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  // Animation for fade-in
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const fetchPopularFoods = async () => {
    if (!locationCoords) {
      setError('Location not available. Please enable location services.');
      setLoading(false);
      return;
    }

    try {
      setError('');
      const res = await getNearbyPopularFoods({
        lat: locationCoords.lat,
        lng: locationCoords.lng,
        radius: 10,
        limit: 30,
      });

      const foods = res.data?.popularFoods || [];
      setPopularFoods(foods);
      if (foods.length === 0) {
        setError('No popular foods found nearby.');
      }
    } catch (err) {
      console.error('Popular foods error:', err);
      setError('Failed to load popular foods. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
      // Start fade animation after data loads
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }).start();
    }
  };

  useEffect(() => {
    fetchPopularFoods();
  }, [locationCoords]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchPopularFoods();
  };

  const renderItem = ({ item, index }) => {
    const menuItem = item.menuItem || {};
    const vendor = item.vendor || {};

    const imageUrl = buildImageUrl(menuItem.image);
    const vendorImage = buildImageUrl(vendor.profileImage);
    const distance = item.distance
      ? `${item.distance.toFixed(1)} km`
      : 'Nearby';

    // Determine if item is popular (maybe based on orders count or rating, but we don't have)
    const isPopular = index < 3; // Show "Popular" badge for first 3 items

    return (
      <Animated.View
        style={[
          styles.cardWrapper,
          {
            opacity: fadeAnim,
            transform: [
              {
                translateY: fadeAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [20, 0],
                }),
              },
            ],
          },
        ]}
      >
        <TouchableOpacity
          style={styles.card}
          onPress={() =>
            navigation.navigate('ItemDetail', {
              item: menuItem,
              vendorId: menuItem.vendorId || vendor._id,
            })
          }
          activeOpacity={0.8}
        >
          <View style={styles.imageWrapper}>
            {imageUrl ? (
              <Image source={{ uri: imageUrl }} style={styles.image} />
            ) : (
              <View style={styles.placeholderImage}>
                <Text style={styles.placeholderText}>
                  {menuItem.name?.charAt(0) || 'F'}
                </Text>
              </View>
            )}
            {/* Gradient overlay for better text visibility */}
            <View style={styles.imageOverlay} />
            {/* Distance badge */}
            <View style={styles.distanceBadge}>
              <Ionicons name="location" size={12} color="#fff" />
              <Text style={styles.distanceText}>{distance}</Text>
            </View>
            {/* Popular badge */}
            {isPopular && (
              <View style={styles.popularBadge}>
                <Ionicons name="flame" size={12} color="#fff" />
                <Text style={styles.popularBadgeText}>Popular</Text>
              </View>
            )}
          </View>

          <View style={styles.cardContent}>
            <View style={styles.topRow}>
              <Text style={styles.itemName} numberOfLines={1}>
                {menuItem.name || 'Item'}
              </Text>
              <Text style={styles.price}>₹{menuItem.price || 0}</Text>
            </View>

            <View style={styles.vendorRow}>
              {vendorImage ? (
                <Image
                  source={{ uri: vendorImage }}
                  style={styles.vendorAvatar}
                />
              ) : (
                <View style={styles.vendorAvatarPlaceholder}>
                  <Text style={styles.vendorInitial}>
                    {vendor.businessName?.charAt(0) || 'R'}
                  </Text>
                </View>
              )}
              <Text style={styles.vendorName} numberOfLines={1}>
                {vendor.businessName || 'Restaurant'}
              </Text>
              {menuItem.isVeg !== undefined && (
                <View
                  style={[
                    styles.vegBadge,
                    menuItem.isVeg
                      ? { backgroundColor: '#22c55e' }
                      : { backgroundColor: '#ef4444' },
                  ]}
                >
                  <Text style={styles.vegBadgeText}>
                    {menuItem.isVeg ? 'Veg' : 'Non-Veg'}
                  </Text>
                </View>
              )}
            </View>
          </View>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>
            Finding popular foods near you...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error && popularFoods.length === 0) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={24} color={COLORS.title} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Popular Foods</Text>
          <View style={{ width: 40 }} />
        </View>
        <View style={styles.center}>
          <View style={styles.errorIconContainer}>
            <Ionicons name="alert-circle-outline" size={48} color="#ef4444" />
          </View>
          <Text style={styles.errorTitle}>Oops! Something went wrong</Text>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={fetchPopularFoods}
          >
            <Text style={styles.retryButtonText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color={COLORS.title} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Popular Foods</Text>
        <TouchableOpacity style={styles.locationButton}>
          <Ionicons name="location-outline" size={20} color={COLORS.primary} />
        </TouchableOpacity>
      </View>

      <FlatList
        data={popularFoods}
        renderItem={renderItem}
        keyExtractor={(item, index) => item._id || index.toString()}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[COLORS.primary]}
            tintColor={COLORS.primary}
          />
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons
              name="restaurant-outline"
              size={64}
              color={COLORS.muted}
            />
            <Text style={styles.emptyTitle}>No popular foods nearby</Text>
            <Text style={styles.emptyText}>
              Try adjusting your location or check back later.
            </Text>
          </View>
        }
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 15,
    fontWeight: '500',
    color: COLORS.muted,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  errorIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#fee2e2',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.title,
    marginBottom: 8,
  },
  errorText: {
    fontSize: 14,
    color: COLORS.muted,
    textAlign: 'center',
    marginBottom: 24,
  },
  retryButton: {
    paddingHorizontal: 32,
    paddingVertical: 12,
    backgroundColor: COLORS.primary,
    borderRadius: 30,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
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
    padding: 4,
    width: 40,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.title,
    letterSpacing: -0.5,
  },
  locationButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  list: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 30,
  },
  cardWrapper: {
    marginBottom: 16,
  },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 6,
  },
  imageWrapper: {
    position: 'relative',
    height: 200,
    backgroundColor: '#f0e6e0',
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  placeholderImage: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#e5d9d0',
  },
  placeholderText: {
    fontSize: 48,
    fontWeight: '900',
    color: '#d4c4b8',
  },
  imageOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.08)',
  },
  distanceBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    backdropFilter: 'blur(4px)',
  },
  distanceText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '700',
    marginLeft: 4,
  },
  popularBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 3,
  },
  popularBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '800',
    marginLeft: 4,
  },
  cardContent: {
    padding: 14,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  itemName: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.title,
    flex: 1,
    marginRight: 8,
  },
  price: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.primary,
  },
  vendorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  vendorAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    marginRight: 8,
    backgroundColor: '#e5d9d0',
  },
  vendorAvatarPlaceholder: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#f0e6e0',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  vendorInitial: {
    fontSize: 10,
    fontWeight: '800',
    color: COLORS.primary,
  },
  vendorName: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.muted,
    flex: 1,
  },
  vegBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    marginLeft: 8,
  },
  vegBadgeText: {
    color: '#fff',
    fontSize: 8,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  empty: {
    paddingTop: 80,
    alignItems: 'center',
  },
  emptyTitle: {
    marginTop: 16,
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.title,
  },
  emptyText: {
    marginTop: 6,
    fontSize: 14,
    color: COLORS.muted,
    textAlign: 'center',
  },
});
