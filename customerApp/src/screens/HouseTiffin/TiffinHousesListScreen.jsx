import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  Pressable,
  TextInput,
  ActivityIndicator,
  RefreshControl,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from '@react-native-vector-icons/ionicons';
import { getNearbyTiffinHouses } from '../../api/vendorApi';

const COLORS = {
  primary: '#ff5a1f',
  background: '#fcf9f7',
  white: '#ffffff',
  title: '#171717',
  text: '#3f3f46',
  muted: '#8f8f98',
  border: '#eee5df',
  success: '#15803d',
};

const STATIC_BASE = 'https://myfoodmitra-ecosystem.onrender.com';
const DEFAULT_AVATAR =
  'https://ui-avatars.com/api/?name=Tiffin&background=ff5a1f&color=fff&size=100';

const buildImageUrl = path => {
  if (!path) return DEFAULT_AVATAR;
  if (path.startsWith('http')) return path;
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${STATIC_BASE}${cleanPath}`;
};

const TiffinHousesListScreen = ({ navigation, route }) => {
  // ─── Get params from route ────────────────────────────
  const { lat, lng } = route.params || {};
  console.log('📍 Received route params:', { lat, lng });

  const [tiffinHouses, setTiffinHouses] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState(null);

  // ─── Check if coordinates are valid ─────────────────────
  const hasValidCoords =
    lat !== undefined && lng !== undefined && !isNaN(lat) && !isNaN(lng);

  const fetchTiffinHouses = async (latitude, longitude) => {
    try {
      setError(null);
      setLoading(true);

      const params = {
        lat: latitude,
        lng: longitude,
        radius: 50,
        sortBy: 'distance',
        limit: 50,
      };
      console.log('📤 Sending API params:', params);

      const response = await getNearbyTiffinHouses(params);
      console.log('📦 Full API response:', JSON.stringify(response, null, 2));

      // ✅ Correct path: response.data.data.vendors
      const vendors = response?.data?.data?.vendors || [];
      console.log(`✅ Found ${vendors.length} tiffin vendors`);

      if (vendors.length === 0) {
        setTiffinHouses([]);
        setFilteredData([]);
        setLoading(false);
        return;
      }

      const formatted = vendors.map(v => ({
        id: v._id || v.id,
        name: v.businessName || v.name || 'Tiffin House',
        cuisine: v.businessType || 'Tiffin House',
        image: buildImageUrl(v.profileImage || v.image),
        rating: v.rating || 0,
        ratingCount: v.totalRatings || 0,
        distance: v.distance ? `${v.distance.toFixed(1)} km` : 'Nearby',
        time: v.averagePreparationTime
          ? `${v.averagePreparationTime} min`
          : '30 min',
        deliveryFee: v.minimumOrderAmount > 0 ? 'Free' : '₹1',
        promoted: v.rating > 4.5,
      }));

      console.log('🖼️ First item image URL:', formatted[0]?.image);

      setTiffinHouses(formatted);
      setFilteredData(formatted);
    } catch (err) {
      console.error('❌ Error fetching tiffin houses:', err);
      if (err.message === 'Network Error' || err.code === 'ECONNABORTED') {
        setError('Network error. Please check your internet connection.');
      } else {
        setError('Failed to load tiffin houses. Please try again.');
      }
      setTiffinHouses([]);
      setFilteredData([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // ─── Effect ──────────────────────────────────────────────
  useEffect(() => {
    if (hasValidCoords) {
      fetchTiffinHouses(lat, lng);
    } else {
      setLoading(false);
      setError('Location not available. Please enable location services.');
    }
  }, [lat, lng]);

  const onRefresh = () => {
    setRefreshing(true);
    if (hasValidCoords) {
      fetchTiffinHouses(lat, lng);
    } else {
      setRefreshing(false);
    }
  };

  const handleSearch = text => {
    setSearchQuery(text);
    if (text.trim() === '') {
      setFilteredData(tiffinHouses);
    } else {
      const filtered = tiffinHouses.filter(
        item =>
          item.name.toLowerCase().includes(text.toLowerCase()) ||
          item.cuisine.toLowerCase().includes(text.toLowerCase()),
      );
      setFilteredData(filtered);
    }
  };

  const handleRetry = () => {
    if (hasValidCoords) {
      fetchTiffinHouses(lat, lng);
    }
  };

  // ─── Render functions ────────────────────────────────────

  const renderItem = ({ item }) => (
    <Pressable
      style={styles.card}
      onPress={() => navigation.navigate('VendorDetail', { vendorId: item.id })}
    >
      <Image source={{ uri: item.image }} style={styles.cardImage} />
      <View style={styles.cardContent}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardName} numberOfLines={1}>
            {item.name}
          </Text>
          <View style={styles.ratingContainer}>
            <Ionicons name="star" size={12} color="#FFB800" />
            <Text style={styles.ratingText}>{item.rating.toFixed(1)}</Text>
          </View>
        </View>
        <Text style={styles.cardCuisine} numberOfLines={1}>
          {item.cuisine}
        </Text>
        <View style={styles.cardMeta}>
          <View style={styles.metaItem}>
            <Ionicons name="location-outline" size={12} color={COLORS.muted} />
            <Text style={styles.metaText}>{item.distance}</Text>
          </View>
          <View style={styles.metaDot} />
          <Text style={styles.metaText}>{item.time}</Text>
          <View style={styles.metaDot} />
          <Text style={styles.metaText}>{item.deliveryFee} delivery</Text>
        </View>
        <Pressable
          style={styles.viewMenuButton}
          onPress={() =>
            navigation.navigate('VendorDetail', { vendorId: item.id })
          }
        >
          <Text style={styles.viewMenuText}>View Menu</Text>
          <Ionicons name="chevron-forward" size={14} color={COLORS.primary} />
        </Pressable>
      </View>
    </Pressable>
  );

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="restaurant-outline" size={48} color={COLORS.muted} />
      <Text style={styles.emptyTitle}>No Tiffin Houses Found</Text>
      <Text style={styles.emptyText}>
        {searchQuery
          ? 'Try adjusting your search.'
          : 'No tiffin houses available in this area.'}
      </Text>
      <Pressable
        style={styles.homeButton}
        onPress={() => navigation.navigate('Home')}
      >
        <Text style={styles.homeButtonText}>Go to Home</Text>
      </Pressable>
    </View>
  );

  const renderError = () => (
    <View style={styles.errorContainer}>
      <Ionicons name="wifi-outline" size={48} color="#ef4444" />
      <Text style={styles.errorTitle}>Error</Text>
      <Text style={styles.errorText}>{error}</Text>
      <Pressable style={styles.retryButton} onPress={handleRetry}>
        <Text style={styles.retryButtonText}>Retry</Text>
      </Pressable>
    </View>
  );

  // ─── Loading state ────────────────────────────────────────
  if (loading && !refreshing) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loaderText}>Loading tiffin houses...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar
          barStyle="dark-content"
          backgroundColor={COLORS.background}
        />
        <View style={styles.container}>
          <View style={styles.header}>
            <Pressable
              onPress={() => navigation.goBack()}
              style={styles.backButton}
            >
              <Ionicons name="arrow-back" size={24} color={COLORS.title} />
            </Pressable>
            <Text style={styles.headerTitle}>Tiffin Houses</Text>
            <View style={{ width: 40 }} />
          </View>
          {renderError()}
        </View>
      </SafeAreaView>
    );
  }

  // ─── Main render ─────────────────────────────────────────
  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
      <View style={styles.container}>
        <View style={styles.header}>
          <Pressable
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={24} color={COLORS.title} />
          </Pressable>
          <Text style={styles.headerTitle}>Tiffin Houses</Text>
          <View style={{ width: 40 }} />
        </View>

        <View style={styles.searchContainer}>
          <Ionicons name="search" size={18} color={COLORS.muted} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search tiffin houses..."
            placeholderTextColor="#9ca3af"
            value={searchQuery}
            onChangeText={handleSearch}
          />
          {searchQuery.length > 0 && (
            <Pressable onPress={() => handleSearch('')}>
              <Ionicons name="close-circle" size={18} color={COLORS.muted} />
            </Pressable>
          )}
        </View>

        <FlatList
          data={filteredData}
          keyExtractor={item => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={renderEmpty}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[COLORS.primary]}
              tintColor={COLORS.primary}
            />
          }
        />
      </View>
    </SafeAreaView>
  );
};

// ─── Styles ──────────────────────────────────────────────────
const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.background },
  container: { flex: 1, paddingHorizontal: 16 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  backButton: { padding: 4 },
  headerTitle: { fontSize: 18, fontWeight: '900', color: COLORS.title },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 12,
  },
  searchInput: { flex: 1, marginLeft: 8, fontSize: 14, color: COLORS.title },
  listContent: { paddingBottom: 20 },
  card: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 10,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  cardImage: {
    width: 80,
    height: 80,
    borderRadius: 12,
    backgroundColor: '#e5e7eb',
  },
  cardContent: { flex: 1, marginLeft: 12, justifyContent: 'space-between' },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardName: { fontSize: 15, fontWeight: '700', color: COLORS.title, flex: 1 },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0fdf4',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 12,
  },
  ratingText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.success,
    marginLeft: 2,
  },
  cardCuisine: { fontSize: 12, color: COLORS.muted, marginTop: 2 },
  cardMeta: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  metaItem: { flexDirection: 'row', alignItems: 'center' },
  metaText: { fontSize: 11, color: COLORS.muted, marginLeft: 3 },
  metaDot: {
    width: 3,
    height: 3,
    borderRadius: 2,
    backgroundColor: '#d1d5db',
    marginHorizontal: 6,
  },
  viewMenuButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    marginTop: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: '#fff0e9',
  },
  viewMenuText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.primary,
    marginRight: 2,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.title,
    marginTop: 12,
  },
  emptyText: {
    fontSize: 13,
    color: COLORS.muted,
    marginTop: 4,
    textAlign: 'center',
  },
  homeButton: {
    marginTop: 16,
    paddingHorizontal: 24,
    paddingVertical: 10,
    backgroundColor: COLORS.primary,
    borderRadius: 12,
  },
  homeButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 14,
  },
  loaderContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loaderText: { marginTop: 10, fontSize: 14, color: COLORS.muted },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 30,
  },
  errorTitle: {
    marginTop: 12,
    fontSize: 18,
    fontWeight: '700',
    color: '#ef4444',
  },
  errorText: {
    marginTop: 6,
    fontSize: 14,
    color: COLORS.muted,
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 20,
    paddingHorizontal: 28,
    paddingVertical: 10,
    backgroundColor: COLORS.primary,
    borderRadius: 12,
  },
  retryButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 14,
  },
});

export default TiffinHousesListScreen;
