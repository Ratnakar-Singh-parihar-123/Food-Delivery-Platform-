import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  ImageBackground,
  Pressable,
  StyleSheet,
  StatusBar,
  Dimensions,
  ActivityIndicator,
  TouchableOpacity,
  TextInput,
  RefreshControl,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from '@react-native-vector-icons/ionicons';
import { getNearbyVendors } from '../../api/vendorApi';

const { width } = Dimensions.get('window');

const COLORS = {
  primary: '#ff5a1f',
  background: '#fffaf7',
  white: '#ffffff',
  title: '#171717',
  text: '#374151',
  muted: '#8b929f',
  border: '#eee5df',
  success: '#15803d',
};

// ─── Inlined image URL builder ──────────────────────────────
const buildImageUrl = imagePath => {
  if (!imagePath) return null;
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }
  const baseUrl = 'https://myfoodmitra-ecosystem.onrender.com'; // ⚠️ CHANGE THIS
  return `${baseUrl}${imagePath.startsWith('/') ? '' : '/'}${imagePath}`;
};

const FALLBACK_IMAGE =
  'https://via.placeholder.com/400x200/ff5a1f/ffffff?text=Food';

export default function NearbyVendorsScreen({ navigation, route }) {
  const { lat, lng } = route.params || {};
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [sortBy, setSortBy] = useState('distance');
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const searchTimeout = useRef(null);

  // ─── Debounce search ──────────────────────────────────────
  useEffect(() => {
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 300);
    return () => clearTimeout(searchTimeout.current);
  }, [searchQuery]);

  // ─── Fetch vendors ────────────────────────────────────────
  const fetchVendors = async (pageNum = 1, refresh = false) => {
    if (!lat || !lng) {
      setLoading(false);
      setRefreshing(false);
      return;
    }

    try {
      if (refresh) setRefreshing(true);
      else if (pageNum === 1) setLoading(true);

      const response = await getNearbyVendors({
        lat,
        lng,
        radius: 5,
        sortBy,
        limit: 10,
        page: pageNum,
      });

      const data = response?.data || {};
      const vendorList = data.vendors || [];
      const pagination = data.pagination || {};

      const formatted = vendorList.map(v => ({
        id: v._id || v.id || Math.random().toString(),
        name: v.businessName || 'Unknown Vendor',
        cuisine: v.businessType || 'Restaurant',
        image: buildImageUrl(v.profileImage) || FALLBACK_IMAGE,
        rating: v.rating || 0,
        ratingCount: v.totalRatings || 0,
        distance:
          v.distance !== undefined ? `${v.distance.toFixed(1)} km` : 'Nearby',
        priceForTwo: `₹${v.minimumOrderAmount || 100} for two`,
        time: `${v.averagePreparationTime || 20} min`,
        offer: v.isOnline ? 'Online' : 'Closed',
        deliveryFee: v.minimumOrderAmount > 0 ? 'Free' : '₹29',
        promoted: (v.rating || 0) > 4.5,
      }));

      if (pageNum === 1) {
        setVendors(formatted);
      } else {
        setVendors(prev => [...prev, ...formatted]);
      }

      setTotalPages(pagination.pages || 1);
      setPage(pageNum);
    } catch (error) {
      console.error('Failed to fetch vendors:', error);
      Alert.alert('Error', 'Unable to load vendors. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchVendors(1);
  }, [sortBy, lat, lng]);

  const handleRefresh = () => {
    fetchVendors(1, true);
  };

  const handleLoadMore = () => {
    if (page < totalPages && !loading && !refreshing) {
      fetchVendors(page + 1);
    }
  };

  // ─── Filter vendors locally ──────────────────────────────
  const filteredVendors = vendors.filter(v =>
    v.name.toLowerCase().includes(debouncedQuery.toLowerCase()),
  );

  // ─── Render vendor card (compact & polished) ─────────────
  const renderVendor = ({ item }) => (
    <Pressable
      style={({ pressed }) => [
        styles.vendorCard,
        pressed && styles.vendorPressed,
      ]}
      onPress={() => navigation.navigate('VendorDetail', { vendorId: item.id })}
    >
      <ImageBackground
        source={{ uri: item.image }}
        style={styles.vendorImage}
        imageStyle={styles.vendorImageStyle}
      >
        <View style={styles.vendorImageOverlay} />
        {item.promoted && (
          <View style={styles.promotedBadge}>
            <Ionicons name="megaphone" size={8} color={COLORS.white} />
            <Text style={styles.promotedText}>PROMOTED</Text>
          </View>
        )}
        <View style={styles.offerTag}>
          <Ionicons name="pricetag" size={10} color={COLORS.white} />
          <Text numberOfLines={1} style={styles.offerTagText}>
            {item.offer}
          </Text>
        </View>
        <View style={styles.timeBadge}>
          <Ionicons name="time-outline" size={11} color={COLORS.title} />
          <Text style={styles.timeBadgeText}>{item.time}</Text>
        </View>
      </ImageBackground>
      <View style={styles.vendorBody}>
        <View style={styles.vendorHeadingRow}>
          <View style={styles.vendorTitleWrapper}>
            <Text numberOfLines={1} style={styles.vendorName}>
              {item.name}
            </Text>
            <Text numberOfLines={1} style={styles.vendorCuisine}>
              {item.cuisine}
            </Text>
          </View>
          <View style={styles.ratingBadge}>
            <Text style={styles.ratingText}>{item.rating}</Text>
            <Ionicons name="star" size={8} color={COLORS.white} />
          </View>
        </View>
        <View style={styles.vendorMetaRow}>
          <View style={styles.metaItem}>
            <Ionicons name="location-outline" size={12} color={COLORS.muted} />
            <Text style={styles.metaText}>{item.distance}</Text>
          </View>
          <View style={styles.metaDot} />
          <Text style={styles.metaText}>{item.priceForTwo}</Text>
          <View style={styles.metaDot} />
          <Text style={styles.metaText}>{item.ratingCount} ratings</Text>
        </View>
      </View>
    </Pressable>
  );

  // ─── Loading state ──────────────────────────────────────────
  if (loading && vendors.length === 0) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <Pressable onPress={() => navigation.goBack()} hitSlop={12}>
            <Ionicons name="arrow-back" size={24} color={COLORS.title} />
          </Pressable>
          <Text style={styles.headerTitle}>Nearby Vendors</Text>
          <View style={{ width: 24 }} />
        </View>
        <View
          style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}
        >
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      </SafeAreaView>
    );
  }

  // ─── No location ────────────────────────────────────────────
  if (!lat || !lng) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <Pressable onPress={() => navigation.goBack()} hitSlop={12}>
            <Ionicons name="arrow-back" size={24} color={COLORS.title} />
          </Pressable>
          <Text style={styles.headerTitle}>Nearby Vendors</Text>
          <View style={{ width: 24 }} />
        </View>
        <View
          style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}
        >
          <Ionicons name="location-outline" size={48} color={COLORS.muted} />
          <Text style={styles.emptyText}>Location not available</Text>
          <Text style={{ color: COLORS.muted, marginTop: 6, fontSize: 14 }}>
            Please enable location services.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  // ─── Main render ────────────────────────────────────────────
  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} hitSlop={12}>
          <Ionicons name="arrow-back" size={24} color={COLORS.title} />
        </Pressable>
        <Text style={styles.headerTitle}>Nearby Vendors</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.controls}>
        <View style={styles.searchWrapper}>
          <Ionicons name="search" size={16} color={COLORS.muted} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by name..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <Pressable onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={16} color={COLORS.muted} />
            </Pressable>
          )}
        </View>
        <TouchableOpacity
          style={styles.sortButton}
          onPress={() =>
            setSortBy(sortBy === 'distance' ? 'rating' : 'distance')
          }
        >
          <Ionicons
            name={sortBy === 'distance' ? 'swap-vertical' : 'star-outline'}
            size={16}
            color={COLORS.primary}
          />
          <Text style={styles.sortButtonText}>
            {sortBy === 'distance' ? 'Distance' : 'Rating'}
          </Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={filteredVendors}
        keyExtractor={item => item.id}
        renderItem={renderVendor}
        contentContainerStyle={styles.listContent}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.3}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        ListFooterComponent={
          loading && vendors.length > 0 ? (
            <ActivityIndicator
              style={{ marginVertical: 20 }}
              color={COLORS.primary}
            />
          ) : null
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons
              name="restaurant-outline"
              size={48}
              color={COLORS.muted}
            />
            <Text style={styles.emptyText}>
              {searchQuery ? 'No matching vendors' : 'No vendors found nearby'}
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────
const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerTitle: { fontSize: 17, fontWeight: '900', color: COLORS.title },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 8,
  },
  searchWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    paddingHorizontal: 10,
    height: 40,
  },
  searchInput: {
    flex: 1,
    marginLeft: 6,
    fontSize: 13,
    color: COLORS.title,
    padding: 0,
  },
  sortButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 40,
    gap: 4,
  },
  sortButtonText: { fontSize: 12, fontWeight: '700', color: COLORS.primary },
  listContent: { paddingHorizontal: 16, paddingBottom: 30, gap: 12 },
  vendorCard: {
    backgroundColor: COLORS.white,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: 'hidden',
    shadowColor: '#7c2d12',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 4,
  },
  vendorPressed: { opacity: 0.95, transform: [{ scale: 0.99 }] },
  vendorImage: { height: 150 },
  vendorImageStyle: { borderTopLeftRadius: 20, borderTopRightRadius: 20 },
  vendorImageOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.10)',
  },
  promotedBadge: {
    position: 'absolute',
    top: 10,
    left: 10,
    paddingHorizontal: 8,
    paddingVertical: 4,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 8,
    backgroundColor: 'rgba(17,24,39,0.75)',
  },
  promotedText: {
    marginLeft: 3,
    color: COLORS.white,
    fontSize: 6,
    fontWeight: '900',
    letterSpacing: 0.6,
  },
  offerTag: {
    position: 'absolute',
    left: 10,
    bottom: 10,
    maxWidth: '55%',
    paddingHorizontal: 8,
    paddingVertical: 5,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 8,
    backgroundColor: '#2563eb',
  },
  offerTagText: {
    flexShrink: 1,
    marginLeft: 4,
    color: COLORS.white,
    fontSize: 7.5,
    fontWeight: '900',
  },
  timeBadge: {
    position: 'absolute',
    right: 10,
    bottom: 10,
    paddingHorizontal: 8,
    paddingVertical: 5,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.92)',
  },
  timeBadgeText: {
    marginLeft: 3,
    color: COLORS.title,
    fontSize: 8,
    fontWeight: '800',
  },
  vendorBody: { padding: 12 },
  vendorHeadingRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  vendorTitleWrapper: { flex: 1, marginRight: 8 },
  vendorName: { fontSize: 15, fontWeight: '900', color: COLORS.title },
  vendorCuisine: {
    marginTop: 3,
    fontSize: 10,
    fontWeight: '500',
    color: COLORS.muted,
  },
  ratingBadge: {
    paddingHorizontal: 6,
    paddingVertical: 4,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 8,
    backgroundColor: COLORS.success,
  },
  ratingText: {
    marginRight: 2,
    color: COLORS.white,
    fontSize: 9,
    fontWeight: '900',
  },
  vendorMetaRow: {
    marginTop: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaItem: { flexDirection: 'row', alignItems: 'center' },
  metaText: {
    marginLeft: 2,
    color: COLORS.muted,
    fontSize: 9,
    fontWeight: '600',
  },
  metaDot: {
    width: 3,
    height: 3,
    marginHorizontal: 6,
    borderRadius: 2,
    backgroundColor: '#d1d5db',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    marginTop: 12,
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.muted,
  },
});
