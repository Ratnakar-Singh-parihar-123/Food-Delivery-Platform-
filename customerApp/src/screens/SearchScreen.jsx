// screens/SearchScreen.js
import React, { useMemo, useState, useEffect, useRef } from 'react';
import {
  FlatList,
  Image,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  View,
  Modal,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from '@react-native-vector-icons/ionicons';
import { useAppUI } from '../context/AppUIContext';
import { search } from '../api/customerApi';
import { foodCategories } from '../data/homeData';

const COLORS = {
  primary: '#ff5a1f',
  primaryDark: '#e9470d',
  background: '#fffaf7',
  white: '#ffffff',
  title: '#171717',
  text: '#3f3f46',
  muted: '#8f8f98',
  border: '#eee5df',
  soft: '#fff0e9',
  success: '#15803d',
};

const STATIC_BASE = 'https://myfoodmitra-ecosystem.onrender.com';

const buildImageUrl = path => {
  if (!path) return null;
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${STATIC_BASE}${cleanPath}`;
};

const popularSearches = [
  'Biryani',
  'Pizza',
  'Burger',
  'North Indian',
  'Healthy',
  'Desserts',
];

export default function SearchScreen({ navigation }) {
  const { locationCoords } = useAppUI();
  const [searchValue, setSearchValue] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [foodType, setFoodType] = useState('both');
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [error, setError] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const searchTimeout = useRef(null);
  const scrollViewRef = useRef(null);
  const flatListRef = useRef(null);

  // ─── Perform search ──────────────────────────────────────
  const performSearch = async (query, foodTypeFilter = foodType) => {
    if (!query.trim() && !selectedCategory) {
      setResults(null);
      setError('');
      return;
    }

    try {
      setLoading(true);
      setError('');

      let apiFoodType = foodTypeFilter;
      if (foodTypeFilter === 'nonveg') apiFoodType = 'non-veg';
      else if (foodTypeFilter === 'veg') apiFoodType = 'veg';
      else apiFoodType = 'both';

      const params = {
        q: query.trim() || selectedCategory?.name || '',
        foodType: apiFoodType,
        limit: 30,
      };

      if (
        locationCoords &&
        typeof locationCoords.lat === 'number' &&
        typeof locationCoords.lng === 'number'
      ) {
        params.lat = locationCoords.lat;
        params.lng = locationCoords.lng;
      }

      const response = await search(params);
      if (response.success) {
        setResults(response.data);
        if (
          !response.data.vendors.length &&
          !response.data.items.length &&
          !response.data.categories.length
        ) {
          setError('No results found. Try searching something else.');
        } else {
          setError('');
        }
      }
    } catch (err) {
      console.error('Search error:', err);
      setError('Failed to search. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // ─── Debounced search ─────────────────────────────────────
  useEffect(() => {
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    if (searchValue.trim() || selectedCategory) {
      searchTimeout.current = setTimeout(() => {
        performSearch(searchValue, foodType);
      }, 500);
    } else {
      setResults(null);
      setError('');
    }
    return () => clearTimeout(searchTimeout.current);
  }, [searchValue, selectedCategory, foodType]);

  // ─── Handlers ─────────────────────────────────────────────
  const handleFilterSelect = type => {
    setFoodType(type);
    setShowFilterModal(false);
    if (searchValue.trim() || selectedCategory) {
      performSearch(searchValue, type);
    }
  };

  const chooseCategory = item => {
    setSelectedCategory(item);
    setSearchValue(item.name); // input में category name show होगा
  };

  const handlePopularSearch = term => {
    setSelectedCategory(null);
    setSearchValue(term);
  };

  const clearSearch = () => {
    setSearchValue('');
    setSelectedCategory(null);
    setResults(null);
    setError('');
  };

  const onRefresh = () => {
    setRefreshing(true);
    clearSearch();
    setFoodType('both');
    // scroll to top
    if (scrollViewRef.current) {
      scrollViewRef.current.scrollTo({ y: 0, animated: true });
    }
    if (flatListRef.current) {
      flatListRef.current.scrollToOffset({ offset: 0, animated: true });
    }
    setRefreshing(false);
  };

  const openRestaurant = vendor => {
    navigation.navigate('VendorDetail', { vendorId: vendor._id });
  };

  const openItem = item => {
    navigation.navigate('ItemDetail', { item });
  };

  // ─── Render helpers ──────────────────────────────────────
  const renderVendor = ({ item }) => {
    const imageUrl = buildImageUrl(item.profileImage);
    return (
      <Pressable
        onPress={() => openRestaurant(item)}
        style={({ pressed }) => [
          styles.restaurantCard,
          pressed && styles.pressed,
        ]}
      >
        {imageUrl ? (
          <Image
            source={{ uri: imageUrl }}
            style={styles.restaurantImage}
            onError={e => {
              e.target.source = { uri: 'https://via.placeholder.com/90x96' };
            }}
          />
        ) : (
          <View style={[styles.restaurantImage, styles.imagePlaceholder]}>
            <Text style={styles.placeholderText}>
              {item.businessName?.charAt(0) || 'R'}
            </Text>
          </View>
        )}
        <View style={styles.restaurantContent}>
          <View style={styles.restaurantTopRow}>
            <Text numberOfLines={1} style={styles.restaurantName}>
              {item.businessName}
            </Text>
            {item.rating && (
              <View style={styles.ratingBadge}>
                <Text style={styles.ratingText}>{item.rating.toFixed(1)}</Text>
                <Ionicons name="star" size={9} color={COLORS.white} />
              </View>
            )}
          </View>
          <Text numberOfLines={1} style={styles.cuisineText}>
            {item.cuisine || 'Restaurant'}
          </Text>
          <View style={styles.restaurantMeta}>
            {item.distance && (
              <Meta icon="location-outline" text={`${item.distance} km`} />
            )}
            <View style={styles.metaDot} />
            <Meta icon="time-outline" text="30-40 min" />
          </View>
          {item.foodType && (
            <View style={styles.offerRow}>
              <View style={styles.offerIcon}>
                <Ionicons
                  name="leaf-outline"
                  size={11}
                  color={COLORS.primary}
                />
              </View>
              <Text numberOfLines={1} style={styles.offerText}>
                {item.foodType === 'veg' ? 'Pure Veg' : 'Non-Veg Available'}
              </Text>
            </View>
          )}
        </View>
        <Ionicons name="chevron-forward" size={16} color="#c9c2bd" />
      </Pressable>
    );
  };

  const renderItem = ({ item }) => {
    const imageUrl = buildImageUrl(item.image);
    return (
      <Pressable
        onPress={() => openItem(item)}
        style={({ pressed }) => [
          styles.restaurantCard,
          pressed && styles.pressed,
        ]}
      >
        {imageUrl ? (
          <Image
            source={{ uri: imageUrl }}
            style={styles.restaurantImage}
            onError={e => {
              e.target.source = { uri: 'https://via.placeholder.com/90x96' };
            }}
          />
        ) : (
          <View style={[styles.restaurantImage, styles.imagePlaceholder]}>
            <Text style={styles.placeholderText}>
              {item.name?.charAt(0) || 'F'}
            </Text>
          </View>
        )}
        <View style={styles.restaurantContent}>
          <View style={styles.restaurantTopRow}>
            <Text numberOfLines={1} style={styles.restaurantName}>
              {item.name}
            </Text>
            {item.isVeg !== undefined && (
              <View
                style={[
                  styles.vegBadge,
                  item.isVeg
                    ? { backgroundColor: '#22c55e' }
                    : { backgroundColor: '#ef4444' },
                ]}
              >
                <Text style={styles.vegBadgeText}>
                  {item.isVeg ? 'Veg' : 'Non-Veg'}
                </Text>
              </View>
            )}
          </View>
          <Text numberOfLines={1} style={styles.cuisineText}>
            {item.vendor?.businessName || 'Vendor'}
          </Text>
          <View style={styles.restaurantMeta}>
            <Meta icon="pricetag-outline" text={`₹${item.price}`} />
            {item.distance && (
              <>
                <View style={styles.metaDot} />
                <Meta icon="location-outline" text={`${item.distance} km`} />
              </>
            )}
          </View>
        </View>
        <Ionicons name="chevron-forward" size={16} color="#c9c2bd" />
      </Pressable>
    );
  };

  const renderCategory = ({ item }) => {
    const active = selectedCategory?.id === item.id;
    return (
      <Pressable
        onPress={() => chooseCategory(item)}
        style={({ pressed }) => [
          styles.categoryCard,
          active && styles.activeCategoryCard,
          pressed && styles.pressed,
        ]}
      >
        <Image source={{ uri: item.image }} style={styles.categoryImage} />
        <View style={styles.categoryOverlay} />
        <View style={styles.categoryLabelRow}>
          <Text numberOfLines={1} style={styles.categoryText}>
            {item.name}
          </Text>
          <View
            style={[styles.categoryArrow, active && styles.categoryArrowActive]}
          >
            <Ionicons
              name={active ? 'checkmark' : 'arrow-forward'}
              size={12}
              color={COLORS.white}
            />
          </View>
        </View>
      </Pressable>
    );
  };

  // ─── Main render ─────────────────────────────────────────
  const hasActiveSearch = Boolean(searchValue.trim() || selectedCategory);
  const hasResults =
    results && (results.vendors?.length > 0 || results.items?.length > 0);
  const combinedResults = [
    ...(results?.vendors || []),
    ...(results?.items || []),
  ];

  // ─── Initial View (no search) ────────────────────────────
  const renderInitialView = () => (
    <ScrollView
      ref={scrollViewRef}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
      contentContainerStyle={styles.scrollContent}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          colors={[COLORS.primary]}
          tintColor={COLORS.primary}
        />
      }
    >
      {/* Popular searches */}
      <View style={styles.sectionHeader}>
        <View>
          <Text style={styles.sectionTitle}>Popular Searches</Text>
          <Text style={styles.sectionSubtitle}>
            What people are ordering the most
          </Text>
        </View>
        <View style={styles.trendingIcon}>
          <Ionicons name="trending-up" size={16} color={COLORS.primary} />
        </View>
      </View>

      <View style={styles.popularWrapper}>
        {popularSearches.map(item => (
          <Pressable
            key={item}
            onPress={() => handlePopularSearch(item)}
            style={({ pressed }) => [
              styles.popularChip,
              pressed && styles.pressed,
            ]}
          >
            <Ionicons name="search-outline" size={13} color={COLORS.primary} />
            <Text style={styles.popularText}>{item}</Text>
          </Pressable>
        ))}
      </View>

      {/* Categories */}
      <View style={styles.sectionHeader}>
        <View>
          <Text style={styles.sectionTitle}>Browse Categories</Text>
          <Text style={styles.sectionSubtitle}>Choose based on your mood</Text>
        </View>
      </View>

      <FlatList
        data={foodCategories}
        keyExtractor={item => String(item.id)}
        renderItem={renderCategory}
        numColumns={2}
        scrollEnabled={false}
        columnWrapperStyle={styles.categoryRow}
      />

      {/* Smart Pick Card */}
      <View style={styles.smartCard}>
        <View style={styles.smartGlow} />

        <View style={styles.smartIcon}>
          <Ionicons name="sparkles" size={18} color={COLORS.white} />
        </View>

        <View style={styles.smartContent}>
          <Text style={styles.smartEyebrow}>FOODMITRA SMART PICK</Text>

          <Text style={styles.smartTitle}>Not sure what to eat?</Text>

          <Text style={styles.smartText}>
            Tell us your mood, and we'll choose the perfect meal for you.
          </Text>
        </View>

        <Pressable style={styles.smartArrow}>
          <Ionicons name="arrow-forward" size={16} color={COLORS.white} />
        </Pressable>
      </View>
    </ScrollView>
  );

  // ─── Results View (search active) ────────────────────────
  const renderResultsView = () => (
    <View style={styles.resultsWrapper}>
      <View style={styles.resultHeader}>
        <View>
          <Text style={styles.resultTitle}>
            {selectedCategory?.name || `Results for “${searchValue}”`}
          </Text>
          <Text style={styles.resultSubtitle}>
            {error ||
              (combinedResults.length > 0
                ? `${combinedResults.length} results found`
                : '')}
          </Text>
        </View>
        <Pressable onPress={clearSearch} style={styles.clearButton}>
          <Text style={styles.clearButtonText}>Clear</Text>
        </Pressable>
      </View>

      {error && !combinedResults.length ? (
        <View style={styles.emptyState}>
          <Ionicons name="search-outline" size={44} color={COLORS.muted} />
          <Text style={styles.emptyTitle}>No results found</Text>
          <Text style={styles.emptyText}>Try adjusting your search</Text>
        </View>
      ) : (
        <FlatList
          ref={flatListRef}
          data={combinedResults}
          keyExtractor={(item, index) => item._id || item.id || String(index)}
          renderItem={({ item }) => {
            if (item.businessName) {
              return renderVendor({ item });
            } else {
              return renderItem({ item });
            }
          }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={styles.resultsList}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[COLORS.primary]}
              tintColor={COLORS.primary}
            />
          }
        />
      )}
    </View>
  );

  // ─── Final render ─────────────────────────────────────────
  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />

      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.headerLabel}>DISCOVER SOMETHING TASTY</Text>
            <Text style={styles.headerTitle}>Search food</Text>
          </View>
          <Pressable style={styles.voiceButton}>
            <Ionicons name="mic-outline" size={20} color={COLORS.white} />
          </Pressable>
        </View>

        {/* Search Input */}
        <View style={styles.searchContainer}>
          <View style={styles.searchIcon}>
            <Ionicons name="search" size={19} color={COLORS.primary} />
          </View>
          <TextInput
            value={searchValue}
            onChangeText={text => {
              setSearchValue(text);
              // अगर user manually टाइप कर रहा है तो selectedCategory clear करें
              if (selectedCategory) setSelectedCategory(null);
            }}
            placeholder="Dish, restaurant ya cuisine search karein"
            placeholderTextColor="#9ca3af"
            returnKeyType="search"
            style={styles.searchInput}
          />
          {searchValue ? (
            <Pressable onPress={clearSearch}>
              <Ionicons name="close-circle" size={20} color="#a8a29e" />
            </Pressable>
          ) : (
            <Pressable
              onPress={() => setShowFilterModal(true)}
              style={styles.filterButton}
            >
              <Ionicons name="options-outline" size={17} color={COLORS.white} />
            </Pressable>
          )}
        </View>

        {/* Food Type Indicator */}
        {foodType !== 'both' && (
          <View style={styles.foodTypeChip}>
            <Text style={styles.foodTypeChipText}>
              {foodType === 'veg' ? '🌱 Vegetarian' : '🍗 Non-Vegetarian'}
            </Text>
            <Pressable onPress={() => handleFilterSelect('both')}>
              <Ionicons name="close-circle" size={15} color={COLORS.primary} />
            </Pressable>
          </View>
        )}

        {/* Results / Content */}
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={COLORS.primary} />
            <Text style={styles.loadingText}>Searching...</Text>
          </View>
        ) : hasActiveSearch ? (
          renderResultsView()
        ) : (
          renderInitialView()
        )}
      </View>

      {/* Filter Modal */}
      <Modal
        visible={showFilterModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowFilterModal(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setShowFilterModal(false)}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Filter by Food Type</Text>
              <Pressable onPress={() => setShowFilterModal(false)}>
                <Ionicons name="close" size={22} color={COLORS.title} />
              </Pressable>
            </View>
            {['both', 'veg', 'nonveg'].map(type => (
              <TouchableOpacity
                key={type}
                style={[
                  styles.filterOption,
                  foodType === type && styles.filterOptionActive,
                ]}
                onPress={() => handleFilterSelect(type)}
              >
                <Text
                  style={[
                    styles.filterOptionText,
                    foodType === type && styles.filterOptionTextActive,
                  ]}
                >
                  {type === 'both'
                    ? '🌿 All (Veg & Non-Veg)'
                    : type === 'veg'
                    ? '🌱 Vegetarian'
                    : '🍗 Non-Vegetarian'}
                </Text>
                {foodType === type && (
                  <Ionicons
                    name="checkmark-circle"
                    size={18}
                    color={COLORS.primary}
                  />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}

// ─── Helper ──────────────────────────────────────────────────
function Meta({ icon, text }) {
  return (
    <View style={styles.metaItem}>
      <Ionicons name={icon} size={12} color={COLORS.muted} />
      <Text style={styles.metaText}>{text}</Text>
    </View>
  );
}

// ─── Styles (यही पुराने हैं, कोई बदलाव नहीं) ──────────────
const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.background },
  container: { flex: 1 },
  header: {
    paddingHorizontal: 16,
    paddingTop: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerLabel: {
    color: COLORS.primary,
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 0.8,
  },
  headerTitle: {
    marginTop: 3,
    color: COLORS.title,
    fontSize: 24,
    fontWeight: '900',
    letterSpacing: -0.7,
  },
  voiceButton: {
    width: 42,
    height: 42,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.title,
    shadowColor: COLORS.title,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 5,
  },
  searchContainer: {
    height: 54,
    marginTop: 16,
    marginHorizontal: 16,
    paddingHorizontal: 8,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.white,
    shadowColor: '#7c2d12',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.06,
    shadowRadius: 14,
    elevation: 4,
  },
  searchIcon: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.soft,
  },
  searchInput: {
    flex: 1,
    marginHorizontal: 9,
    color: COLORS.title,
    fontSize: 12,
    fontWeight: '600',
  },
  filterButton: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
  },
  foodTypeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    marginTop: 8,
    marginHorizontal: 16,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
    backgroundColor: COLORS.soft,
    gap: 6,
  },
  foodTypeChipText: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.primary,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 40,
  },
  loadingText: {
    marginTop: 8,
    color: COLORS.muted,
    fontSize: 13,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 100,
  },
  sectionHeader: {
    marginTop: 24,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionTitle: {
    color: COLORS.title,
    fontSize: 16,
    fontWeight: '900',
  },
  sectionSubtitle: {
    marginTop: 3,
    color: COLORS.muted,
    fontSize: 9,
  },
  trendingIcon: {
    width: 34,
    height: 34,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.soft,
  },
  popularWrapper: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  popularChip: {
    paddingHorizontal: 11,
    paddingVertical: 9,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.white,
  },
  popularText: {
    marginLeft: 5,
    color: COLORS.text,
    fontSize: 10,
    fontWeight: '800',
  },
  categoryRow: {
    justifyContent: 'space-between',
  },
  categoryCard: {
    width: '48%',
    height: 120,
    marginBottom: 12,
    overflow: 'hidden',
    borderRadius: 20,
    backgroundColor: COLORS.white,
  },
  activeCategoryCard: {
    borderWidth: 3,
    borderColor: COLORS.primary,
  },
  categoryImage: {
    width: '100%',
    height: '100%',
  },
  categoryOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.30)',
  },
  categoryLabelRow: {
    position: 'absolute',
    left: 10,
    right: 10,
    bottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryText: {
    flex: 1,
    color: COLORS.white,
    fontSize: 13,
    fontWeight: '900',
  },
  categoryArrow: {
    width: 24,
    height: 24,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.22)',
  },
  categoryArrowActive: {
    backgroundColor: COLORS.primary,
  },
  smartCard: {
    minHeight: 130,
    marginTop: 14,
    padding: 14,
    overflow: 'hidden',
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 22,
    backgroundColor: COLORS.title,
  },
  smartGlow: {
    position: 'absolute',
    width: 110,
    height: 110,
    right: -30,
    top: -40,
    borderRadius: 55,
    backgroundColor: 'rgba(255,90,31,0.20)',
  },
  smartIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
  },
  smartContent: {
    flex: 1,
    marginLeft: 10,
  },
  smartEyebrow: {
    color: '#ffb494',
    fontSize: 7,
    fontWeight: '900',
    letterSpacing: 0.7,
  },
  smartTitle: {
    marginTop: 4,
    color: COLORS.white,
    fontSize: 13,
    fontWeight: '900',
  },
  smartText: {
    marginTop: 3,
    color: 'rgba(255,255,255,0.66)',
    fontSize: 9,
    lineHeight: 13,
  },
  smartArrow: {
    width: 34,
    height: 34,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
  },
  resultsWrapper: {
    flex: 1,
    paddingHorizontal: 16,
  },
  resultHeader: {
    marginTop: 20,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  resultTitle: {
    color: COLORS.title,
    fontSize: 15,
    fontWeight: '900',
  },
  resultSubtitle: {
    marginTop: 3,
    color: COLORS.muted,
    fontSize: 9,
  },
  clearButton: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    backgroundColor: COLORS.soft,
  },
  clearButtonText: {
    color: COLORS.primary,
    fontSize: 9,
    fontWeight: '900',
  },
  resultsList: {
    paddingBottom: 100,
    gap: 10,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 50,
  },
  emptyTitle: {
    marginTop: 10,
    fontSize: 17,
    fontWeight: '700',
    color: COLORS.title,
  },
  emptyText: {
    marginTop: 5,
    fontSize: 13,
    color: COLORS.muted,
  },
  restaurantCard: {
    minHeight: 110,
    padding: 8,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.white,
    shadowColor: '#7c2d12',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 3,
  },
  restaurantImage: {
    width: 90,
    height: 96,
    borderRadius: 14,
  },
  imagePlaceholder: {
    backgroundColor: '#f0e6e0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderText: {
    fontSize: 36,
    fontWeight: '900',
    color: '#d4c4b8',
  },
  restaurantContent: {
    flex: 1,
    marginLeft: 10,
    marginRight: 5,
  },
  restaurantTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  restaurantName: {
    flex: 1,
    color: COLORS.title,
    fontSize: 12.5,
    fontWeight: '900',
  },
  ratingBadge: {
    paddingHorizontal: 5,
    paddingVertical: 4,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 7,
    backgroundColor: COLORS.success,
  },
  ratingText: {
    marginRight: 2,
    color: COLORS.white,
    fontSize: 8.5,
    fontWeight: '900',
  },
  vegBadge: {
    paddingHorizontal: 5,
    paddingVertical: 3,
    borderRadius: 5,
  },
  vegBadgeText: {
    color: COLORS.white,
    fontSize: 7,
    fontWeight: '800',
  },
  cuisineText: {
    marginTop: 4,
    color: COLORS.muted,
    fontSize: 9,
  },
  restaurantMeta: {
    marginTop: 7,
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaText: {
    marginLeft: 2,
    color: COLORS.muted,
    fontSize: 8,
    fontWeight: '600',
  },
  metaDot: {
    width: 3,
    height: 3,
    marginHorizontal: 5,
    borderRadius: 2,
    backgroundColor: '#d1d5db',
  },
  offerRow: {
    marginTop: 7,
    flexDirection: 'row',
    alignItems: 'center',
  },
  offerIcon: {
    width: 22,
    height: 22,
    borderRadius: 7,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.soft,
  },
  offerText: {
    flex: 1,
    marginLeft: 5,
    color: COLORS.primary,
    fontSize: 8.5,
    fontWeight: '900',
  },
  pressed: {
    opacity: 0.82,
    transform: [{ scale: 0.97 }],
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: COLORS.white,
    borderRadius: 22,
    padding: 18,
    width: '90%',
    maxWidth: 340,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '900',
    color: COLORS.title,
  },
  filterOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 8,
  },
  filterOptionActive: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.soft,
  },
  filterOptionText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.text,
  },
  filterOptionTextActive: {
    color: COLORS.primary,
    fontWeight: '700',
  },
});
