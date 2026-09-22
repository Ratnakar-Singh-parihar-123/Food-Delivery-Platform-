import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  Dimensions,
  FlatList,
  Image,
  ImageBackground,
  Modal,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  View,
  Alert,
  Linking,
  Platform,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import SkeletonPlaceholder from 'react-native-skeleton-placeholder';
import Ionicons from '@react-native-vector-icons/ionicons';
import axios from 'axios';
import LinearGradient from 'react-native-linear-gradient';
import Geolocation from '@react-native-community/geolocation';
import { PERMISSIONS, request, check, RESULTS } from 'react-native-permissions';
import {
  search,
  getNearbyPopularFoods,
  getExploreCategories,
  getFoodCategories,
  getFastDeliveryVendors,
  getVendorsWithFilters,
} from '../api/customerApi';
import { quickFilters } from '../data/homeData';
import { getCustomerProfile, getBanners } from '../api/customerApi';
import { getNearbyVendors } from '../api/vendorApi';

const { width } = Dimensions.get('window');

const COLORS = {
  primary: '#ff5a1f',
  primaryDark: '#e9470d',
  background: '#fcf9f7',
  white: '#ffffff',
  title: '#171717',
  text: '#3f3f46',
  muted: '#8f8f98',
  border: '#eee5df',
  soft: '#fff0e9',
  success: '#15803d',
  cardShadow: '#7c2d12',
};

const STATIC_BASE = 'http://10.200.227.211:9000'; //
const DEFAULT_AVATAR =
  'https://ui-avatars.com/api/?name=User&background=ff5a1f&color=fff&size=100';

// ─── AI Recommendation ──────────────────────────────
const aiRecommendation = {
  title: 'AI Suggests',
  subtitle: 'Based on your cravings',
  image:
    'https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=900&q=85',
  description: 'Try our new Butter Chicken Pizza – a fusion delight!',
  cta: 'Explore now',
};

// ─── Helper ──────────────────────────────────────────────
const buildImageUrl = path => {
  if (!path) return DEFAULT_AVATAR;
  if (path.startsWith('http')) return path;
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${STATIC_BASE}${cleanPath}`;
};

// ─── Reverse Geocode ──────────────────────────────────────
const fetchAddressFromCoords = async (latitude, longitude) => {
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
        colony = '';
      components.forEach(comp => {
        const types = comp.types;
        if (types.includes('locality')) city = comp.long_name;
        if (types.includes('administrative_area_level_1'))
          state = comp.long_name;
        if (types.includes('postal_code')) pincode = comp.long_name;
        if (types.includes('sublocality_level_1')) area = comp.long_name;
        if (types.includes('sublocality_level_2')) colony = comp.long_name;
      });
      let display = '';
      if (colony) display += colony + ', ';
      if (area) display += area + ', ';
      if (city) display += city;
      if (!city && state) display += state;
      if (pincode) display += ' - ' + pincode;
      if (!display || display.trim() === '') {
        display = result.formatted_address || '';
      }
      return { city, state, pincode, area, colony, display };
    }
  } catch (error) {
    console.warn('Google geocode error:', error);
  }
  try {
    const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`;
    const response = await axios.get(url, {
      headers: {
        'User-Agent':
          'FoodMitra/1.0 (https://myfoodmitra-ecosystem.onrender.com)',
      },
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
      const display = [colony, area, city, state, pincode]
        .filter(Boolean)
        .join(', ');
      return { city, state, pincode, area, colony, display };
    }
  } catch (error) {
    console.warn('Nominatim error:', error);
  }
  return null;
};

// ─── Location permission helper ──────────────────────────
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
        'Please enable location from settings to get accurate delivery address.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Open Settings', onPress: () => Linking.openSettings() },
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

// ─── Get current position as Promise ──────────────────────
const getCurrentPosition = () =>
  new Promise((resolve, reject) => {
    Geolocation.getCurrentPosition(
      position => resolve(position),
      error => reject(error),
      {
        enableHighAccuracy: false,
        timeout: 5000,
        maximumAge: 50000,
      },
    );
  });

export default function CustomerHomeScreen({ navigation }) {
  const [filterVisible, setFilterVisible] = useState(false);
  const [banners, setBanners] = useState([]);
  const [bannersLoading, setBannersLoading] = useState(true);
  const [foodType, setFoodType] = useState('all');
  const [searchValue, setSearchValue] = useState('');
  const [selectedFilter, setSelectedFilter] = useState(null);
  const [favoriteRestaurants, setFavoriteRestaurants] = useState([]);
  const [currentOfferIndex, setCurrentOfferIndex] = useState(0);
  const [isAutoScrolling, setIsAutoScrolling] = useState(true);
  const [loading, setLoading] = useState(true);
  const [searchResults, setSearchResults] = useState(null);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState('');
  const [exploreCategories, setExploreCategories] = useState([]);
  const [profile, setProfile] = useState({
    name: 'Customer',
    avatar: DEFAULT_AVATAR,
  });
  const [deliveryLocation, setDeliveryLocation] = useState(
    'Vijay Nagar, Indore',
  );
  const [isFetchingLocation, setIsFetchingLocation] = useState(false);
  const [locationCoords, setLocationCoords] = useState(null);
  const [nearbyVendors, setNearbyVendors] = useState([]);
  const [nearbyLoading, setNearbyLoading] = useState(true);
  const [selectedChip, setSelectedChip] = useState(null);
  const [nearbyPopularFoods, setNearbyPopularFoods] = useState([]);
  const [popularFoodsLoading, setPopularFoodsLoading] = useState(false);

  // ─── NEW: Tiffin Houses state ──────────────────────────
  const [tiffinHouses, setTiffinHouses] = useState([]);
  const [tiffinLoading, setTiffinLoading] = useState(false);

  // ─── REAL DATA STATES ─────────────────────────────────
  const [foodCategories, setFoodCategories] = useState([]);
  const [fastDeliveryVendors, setFastDeliveryVendors] = useState([]);
  const [filteredVendors, setFilteredVendors] = useState([]);
  const [appliedFilter, setAppliedFilter] = useState(null);

  // ─── REFRESH STATE ──────────────────────────────────────
  const [refreshing, setRefreshing] = useState(false);

  // ─── Animations ──────────────────────────────────────────
  const screenOpacity = useRef(new Animated.Value(0)).current;
  const screenTranslateY = useRef(new Animated.Value(24)).current;
  const translateY = useRef(new Animated.Value(-1000)).current;
  const backdropOpacity = useRef(new Animated.Value(0)).current;
  const contentOpacity = useRef(new Animated.Value(0)).current;
  const offersRef = useRef(null);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(screenOpacity, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.spring(screenTranslateY, {
        toValue: 0,
        tension: 55,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  useEffect(() => {
    let interval;
    if (isAutoScrolling && banners.length > 0) {
      interval = setInterval(() => {
        const nextIndex = (currentOfferIndex + 1) % banners.length;
        setCurrentOfferIndex(nextIndex);
        offersRef.current?.scrollToIndex({ index: nextIndex, animated: true });
      }, 4000);
    }
    return () => clearInterval(interval);
  }, [currentOfferIndex, isAutoScrolling, banners.length]);

  useEffect(() => {
    if (filterVisible) {
      Animated.parallel([
        Animated.spring(translateY, {
          toValue: 0,
          tension: 72,
          friction: 10,
          useNativeDriver: true,
        }),
        Animated.timing(backdropOpacity, {
          toValue: 1,
          duration: 220,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [filterVisible]);

  // ─── SEARCH ──────────────────────────────────────────────
  useEffect(() => {
    const handler = setTimeout(() => {
      if (searchValue.trim()) {
        performSearch(searchValue.trim());
      } else {
        setSearchResults(null);
        setSearchError('');
      }
    }, 500);
    return () => clearTimeout(handler);
  }, [searchValue, foodType, locationCoords]);

  // ─── FETCH FUNCTIONS ────────────────────────────────────

  const fetchFoodCategories = async () => {
    try {
      const res = await getFoodCategories();
      if (res.success) setFoodCategories(res.data);
    } catch (error) {
      console.warn('Food categories error:', error);
    }
  };

  const fetchFastDelivery = async () => {
    try {
      const res = await getFastDeliveryVendors(10);
      if (res.success) {
        const formatted = res.data.map(v => ({
          id: v._id,
          name: v.businessName,
          time: `${v.averagePreparationTime || 15} min`,
          rating: v.rating || 4.0,
          image: buildImageUrl(v.profileImage),
        }));
        setFastDeliveryVendors(formatted);
      }
    } catch (error) {
      console.warn('Fast delivery error:', error);
    }
  };

  const applyFilter = async filterType => {
    setAppliedFilter(filterType);
    let params = {};
    switch (filterType) {
      case 'fast':
        params.maxTime = 30;
        break;
      case 'top':
        params.minRating = 4.0;
        break;
      case 'veg':
        params.isVeg = true;
        break;
      default:
        params = {};
        break;
    }
    try {
      const res = await getVendorsWithFilters(params);
      if (res.success) {
        const formatted = res.data.map(v => ({
          id: v._id,
          name: v.businessName,
          cuisine: v.businessType || 'Restaurant',
          image: buildImageUrl(v.profileImage),
          rating: v.rating || 0,
          ratingCount: v.totalRatings || 0,
          distance: 'Nearby',
          priceForTwo: v.minimumOrderAmount
            ? `₹${v.minimumOrderAmount} for two`
            : '₹1 for two',
          time: `${v.averagePreparationTime || 25} min`,
          offer: 'Online',
          deliveryFee: v.minimumOrderAmount > 0 ? 'Free' : '₹1',
          promoted: v.rating > 4.5,
          badge: v.rating > 4.5 ? 'trending' : 'free_delivery',
        }));
        setFilteredVendors(formatted);
      }
    } catch (error) {
      console.warn('Filter error:', error);
    }
  };

  const fetchExploreData = async () => {
    try {
      const response = await getExploreCategories();
      if (response.success) {
        setExploreCategories(response.data.slice(0, 4));
      }
    } catch (error) {
      console.warn('Explore fetch error:', error);
    }
  };

  const performSearch = async query => {
    try {
      setSearchLoading(true);
      setSearchError('');
      const params = {
        q: query,
        foodType: foodType === 'all' ? 'both' : foodType,
        limit: 30,
      };
      if (locationCoords) {
        params.lat = locationCoords.lat;
        params.lng = locationCoords.lng;
      }
      const response = await search(params);
      if (response.success) {
        setSearchResults(response.data);
        const total =
          (response.data.vendors?.length || 0) +
          (response.data.items?.length || 0);
        if (total === 0 && !response.data.categories?.length) {
          setSearchError('No results found. Try a different search.');
        }
      }
    } catch (err) {
      console.error('Search error:', err);
      setSearchError('Failed to search. Please try again.');
    } finally {
      setSearchLoading(false);
    }
  };

  const clearSearch = () => {
    setSearchValue('');
    setSearchResults(null);
    setSearchError('');
  };

  const isSearchActive = Boolean(searchValue.trim() || searchResults);

  // ─── NEW: Fetch Tiffin Houses ──────────────────────────
  const fetchTiffinHouses = async (lat, lng) => {
    try {
      setTiffinLoading(true);
      const response = await getNearbyVendors({
        lat,
        lng,
        radius: 10,
        sortBy: 'distance',
        limit: 10,
        businessType: 'Tiffin', // assuming backend supports this filter
      });
      const formatted = response.data.vendors.map(v => ({
        id: v._id,
        name: v.businessName,
        cuisine: v.businessType || 'Tiffin House',
        image: buildImageUrl(v.profileImage),
        rating: v.rating || 0,
        ratingCount: v.totalRatings || 0,
        distance: v.distance ? `${v.distance.toFixed(1)} km` : 'Nearby',
        time: v.averagePreparationTime
          ? `${v.averagePreparationTime} min`
          : '25 min',
        offer: v.isOnline ? 'Online' : 'Closed',
        deliveryFee: v.minimumOrderAmount > 0 ? 'Free' : '₹1',
        promoted: v.rating > 4.5,
        badge:
          (v.rating > 4.5 ? 'trending' : v.rating > 4.0 ? 'new' : null) ||
          'free_delivery',
      }));
      setTiffinHouses(formatted);
    } catch (error) {
      console.warn('Failed to fetch tiffin houses:', error);
      setTiffinHouses([]);
    } finally {
      setTiffinLoading(false);
    }
  };

  // ─── Render Search Results ──────────────────────────────
  const renderSearchResults = () => {
    if (searchLoading) {
      return (
        <View style={styles.searchLoadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.searchLoadingText}>Searching...</Text>
        </View>
      );
    }

    if (searchError) {
      return (
        <View style={styles.searchEmptyContainer}>
          <Ionicons name="search-outline" size={52} color={COLORS.muted} />
          <Text style={styles.searchEmptyTitle}>No results</Text>
          <Text style={styles.searchEmptyText}>{searchError}</Text>
        </View>
      );
    }

    if (!searchResults) return null;

    const { vendors = [], items = [], categories = [] } = searchResults;

    const renderVendorCard = vendor => (
      <Pressable
        key={vendor._id}
        style={styles.searchResultCard}
        onPress={() =>
          navigation.navigate('VendorDetail', { vendorId: vendor._id })
        }
      >
        <Image
          source={{ uri: buildImageUrl(vendor.profileImage) }}
          style={styles.searchResultImage}
          defaultSource={require('../assets/logo/foodmitra.png')}
        />
        <View style={styles.searchResultContent}>
          <Text style={styles.searchResultTitle}>{vendor.businessName}</Text>
          <Text style={styles.searchResultSubtitle}>{vendor.businessType}</Text>
          <View style={styles.searchResultMetaRow}>
            <Text style={styles.searchResultMeta}>
              ⭐ {vendor.rating || 'New'}
            </Text>
            <Text style={styles.searchResultMeta}>
              {vendor.distance ? `${vendor.distance.toFixed(1)} km` : 'Nearby'}
            </Text>
          </View>
        </View>
        <Ionicons name="chevron-forward" size={20} color={COLORS.muted} />
      </Pressable>
    );

    const renderItemCard = item => {
      const vendorName = item.vendor?.businessName || 'Vendor';
      return (
        <Pressable
          key={item._id}
          style={styles.searchResultCard}
          onPress={() =>
            navigation.navigate('ItemDetail', {
              item,
              vendorId: item.vendorId,
            })
          }
        >
          <Image
            source={{ uri: buildImageUrl(item.image) }}
            style={styles.searchResultImage}
            defaultSource={require('../assets/logo/foodmitra.png')}
          />
          <View style={styles.searchResultContent}>
            <Text style={styles.searchResultTitle}>{item.name}</Text>
            <Text style={styles.searchResultSubtitle}>{vendorName}</Text>
            <View style={styles.searchResultMetaRow}>
              <Text style={styles.searchResultPrice}>₹{item.price}</Text>
              {item.isVeg !== undefined && (
                <View
                  style={[
                    styles.vegBadge,
                    { backgroundColor: item.isVeg ? '#16a34a' : '#ef4444' },
                  ]}
                >
                  <Text style={styles.vegBadgeText}>
                    {item.isVeg ? 'VEG' : 'NON-VEG'}
                  </Text>
                </View>
              )}
            </View>
          </View>
        </Pressable>
      );
    };

    const renderCategoryChip = cat => {
      const imageUrl = buildImageUrl(cat.image);
      return (
        <Pressable
          key={cat._id}
          style={styles.searchCategoryChip}
          onPress={() => {
            setSearchValue(cat.title);
            setSelectedFilter(null);
          }}
        >
          {imageUrl ? (
            <Image
              source={{ uri: imageUrl }}
              style={styles.searchCategoryChipImage}
            />
          ) : (
            <View style={styles.searchCategoryChipImagePlaceholder}>
              <Ionicons
                name="restaurant-outline"
                size={16}
                color={COLORS.primary}
              />
            </View>
          )}
          <Text style={styles.searchCategoryChipText}>{cat.title}</Text>
        </Pressable>
      );
    };
    return (
      <View style={styles.searchResultsContainer}>
        {categories.length > 0 && (
          <>
            <Text style={styles.searchSectionTitle}>Categories</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.searchCategorySection}
            >
              {categories.map(renderCategoryChip)}
            </ScrollView>
          </>
        )}

        {vendors.length > 0 && (
          <>
            <Text style={styles.searchSectionTitle}>Restaurants</Text>
            {vendors.map(renderVendorCard)}
          </>
        )}

        {items.length > 0 && (
          <>
            <Text style={styles.searchSectionTitle}>Dishes</Text>
            {items.map(renderItemCard)}
          </>
        )}

        {vendors.length === 0 &&
          items.length === 0 &&
          categories.length === 0 && (
            <View style={styles.searchEmptyContainer}>
              <Ionicons name="search-outline" size={52} color={COLORS.muted} />
              <Text style={styles.searchEmptyTitle}>No results</Text>
              <Text style={styles.searchEmptyText}>
                Try adjusting your search or filters.
              </Text>
            </View>
          )}
      </View>
    );
  };

  // ─── Fetch nearby popular foods ─────────────────────────
  // const fetchNearbyPopularFoods = async (lat, lng) => {
  //   try {
  //     setPopularFoodsLoading(true);
  //     const response = await getNearbyPopularFoods({
  //       lat,
  //       lng,
  //       radius: 10,
  //       limit: 10,
  //     });
  //     const foods = response.data?.popularFoods || [];
  //     setNearbyPopularFoods(foods);
  //   } catch (error) {
  //     console.error('Failed to fetch popular foods:', error);
  //     setNearbyPopularFoods([]);
  //   } finally {
  //     setPopularFoodsLoading(false);
  //   }
  // };
  const fetchNearbyPopularFoods = async (lat, lng) => {
    try {
      setPopularFoodsLoading(true);
      const response = await getNearbyPopularFoods({
        lat,
        lng,
        radius: 10,
        limit: 10,
      });
      // Try to extract foods from various possible structures
      const foods =
        response.data?.popularFoods ||
        response.data?.data?.popularFoods ||
        response.data?.foods ||
        [];
      setNearbyPopularFoods(foods);
    } catch (error) {
      console.error('Failed to fetch popular foods:', error);
      setNearbyPopularFoods([]);
    } finally {
      setPopularFoodsLoading(false);
    }
  };

  // ─── Fetch nearby vendors ──────────────────────────────
  // const fetchNearbyVendors = async (lat, lng) => {
  //   try {
  //     setNearbyLoading(true);
  //     const response = await getNearbyVendors({
  //       lat,
  //       lng,
  //       radius: 10,
  //       sortBy: 'distance',
  //       limit: 8,
  //     });
  //     console.log(response.data.vendors);
  //     const formatted = response.data.vendors.map(v => ({
  //       id: v._id,
  //       name: v.businessName,
  //       cuisine: v.businessType || 'Restaurant',
  //       image: buildImageUrl(v.profileImage),
  //       rating: v.rating || 0,
  //       ratingCount: v.totalRatings || 0,
  //       distance: v.distance ? `${v.distance.toFixed(1)} km` : 'Nearby',
  //       priceForTwo: v.minimumOrderAmount
  //         ? `₹${v.minimumOrderAmount} for two`
  //         : '₹1 for two',
  //       time: v.averagePreparationTime
  //         ? `${v.averagePreparationTime} min`
  //         : '25 min',
  //       offer: v.isOnline ? 'Online' : 'Closed',
  //       deliveryFee: v.minimumOrderAmount > 0 ? 'Free' : '₹1',
  //       promoted: v.rating > 4.5,
  //       badge:
  //         (v.rating > 4.5 ? 'trending' : v.rating > 4.0 ? 'new' : null) ||
  //         'free_delivery',
  //     }));
  //     setNearbyVendors(formatted);
  //   } catch (error) {
  //     console.warn('Failed to fetch nearby vendors:', error);
  //   } finally {
  //     setNearbyLoading(false);
  //   }
  // };
  const fetchNearbyVendors = async (lat, lng) => {
    try {
      setNearbyLoading(true);
      const response = await getNearbyVendors({
        lat,
        lng,
        radius: 10,
        sortBy: 'distance',
        limit: 8,
      });
      // Extract vendors
      const vendorsRaw =
        response.data?.vendors || response.data?.data?.vendors || [];
      // Your mapping remains the same, but ensure fields exist
      const formatted = vendorsRaw.map(v => ({
        id: v._id || v.id,
        name: v.businessName || v.name || 'Unknown',
        cuisine: v.businessType || v.cuisine || 'Restaurant',
        image: buildImageUrl(v.profileImage || v.image),
        rating: v.rating || 0,
        ratingCount: v.totalRatings || 0,
        distance: v.distance ? `${v.distance.toFixed(1)} km` : 'Nearby',
        priceForTwo: v.minimumOrderAmount
          ? `₹${v.minimumOrderAmount} for two`
          : '₹1 for two',
        time: v.averagePreparationTime
          ? `${v.averagePreparationTime} min`
          : '25 min',
        offer: v.isOnline ? 'Online' : 'Closed',
        deliveryFee: v.minimumOrderAmount > 0 ? 'Free' : '₹1',
        promoted: v.rating > 4.5,
        badge:
          (v.rating > 4.5 ? 'trending' : v.rating > 4.0 ? 'new' : null) ||
          'free_delivery',
      }));
      setNearbyVendors(formatted);
    } catch (error) {
      console.warn('Failed to fetch nearby vendors:', error);
      setNearbyVendors([]);
    } finally {
      setNearbyLoading(false);
    }
  };
  // ─── Fetch banners ──────────────────────────────────────
  const fetchBanners = async () => {
    try {
      setBannersLoading(true);
      const response = await getBanners('customer');
      const bannersData =
        response.data?.data?.banners || response.data?.banners || [];
      setBanners(bannersData);
    } catch (error) {
      console.warn('Banner fetch error:', error);
    } finally {
      setBannersLoading(false);
    }
  };

  // ─── INIT ────────────────────────────────────────────────
  useEffect(() => {
    const init = async () => {
      try {
        // 1. Profile
        const profileRes = await getCustomerProfile();
        const customer = profileRes.data.customer;
        const fullName =
          `${customer.firstName || ''} ${customer.lastName || ''}`.trim() ||
          'Customer';
        setProfile({
          name: fullName,
          avatar: buildImageUrl(customer.profileImage),
        });

        // 2. Location & dependent data
        const hasPermission = await requestLocationPermission();
        if (hasPermission) {
          setIsFetchingLocation(true);
          try {
            const position = await getCurrentPosition();
            const { latitude, longitude } = position.coords;
            setLocationCoords({ lat: latitude, lng: longitude });
            const addr = await fetchAddressFromCoords(latitude, longitude);
            if (addr && addr.display) {
              setDeliveryLocation(addr.display);
            } else if (addr && addr.city) {
              const loc = addr.area ? `${addr.area}, ${addr.city}` : addr.city;
              setDeliveryLocation(loc);
            }
            await Promise.all([
              fetchNearbyVendors(latitude, longitude),
              fetchNearbyPopularFoods(latitude, longitude),
              fetchTiffinHouses(latitude, longitude), // NEW
            ]);
          } catch (locationError) {
            console.warn('Location error:', locationError);
          } finally {
            setIsFetchingLocation(false);
          }
        } else {
          setIsFetchingLocation(false);
          setNearbyLoading(false);
          setPopularFoodsLoading(false);
          setTiffinLoading(false);
        }

        // 3. Banners, Explore, and real data
        await Promise.all([
          fetchBanners(),
          fetchExploreData(),
          fetchFoodCategories(),
          fetchFastDelivery(),
        ]);
      } catch (error) {
        console.warn('Init error:', error);
        setNearbyLoading(false);
        setPopularFoodsLoading(false);
        setTiffinLoading(false);
      } finally {
        setLoading(false);
        Animated.timing(contentOpacity, {
          toValue: 1,
          duration: 350,
          useNativeDriver: true,
        }).start();
      }
    };
    init();
  }, []);

  // ─── REFRESH HANDLER ──────────────────────────────────────
  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      const profileRes = await getCustomerProfile();
      const customer = profileRes.data.customer;
      const fullName =
        `${customer.firstName || ''} ${customer.lastName || ''}`.trim() ||
        'Customer';
      setProfile({
        name: fullName,
        avatar: buildImageUrl(customer.profileImage),
      });

      await Promise.all([
        fetchBanners(),
        fetchExploreData(),
        fetchFoodCategories(),
        fetchFastDelivery(),
      ]);

      const hasPermission = await requestLocationPermission();
      if (hasPermission) {
        try {
          const position = await getCurrentPosition();
          const { latitude, longitude } = position.coords;
          setLocationCoords({ lat: latitude, lng: longitude });
          const addr = await fetchAddressFromCoords(latitude, longitude);
          if (addr && addr.display) {
            setDeliveryLocation(addr.display);
          } else if (addr && addr.city) {
            const loc = addr.area ? `${addr.area}, ${addr.city}` : addr.city;
            setDeliveryLocation(loc);
          }
          await Promise.all([
            fetchNearbyVendors(latitude, longitude),
            fetchNearbyPopularFoods(latitude, longitude),
            fetchTiffinHouses(latitude, longitude), // NEW
          ]);
        } catch (error) {
          console.warn('Refresh location error:', error);
        }
      }
    } catch (error) {
      console.warn('Refresh error:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const handleCloseModal = () => {
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: -1000,
        duration: 230,
        useNativeDriver: true,
      }),
      Animated.timing(backdropOpacity, {
        toValue: 0,
        duration: 190,
        useNativeDriver: true,
      }),
    ]).start(() => setFilterVisible(false));
  };

  const toggleFavorite = restaurantId => {
    setFavoriteRestaurants(current => {
      if (current.includes(restaurantId)) {
        return current.filter(id => id !== restaurantId);
      }
      return [...current, restaurantId];
    });
  };

  // ─── SKELETON COMPONENTS (unchanged) ──────────────────
  const SkeletonCategories = () => (
    <SkeletonPlaceholder borderRadius={12}>
      <View style={{ flexDirection: 'row', paddingHorizontal: 16 }}>
        {[1, 2, 3, 4, 5].map((_, idx) => (
          <View key={idx} style={{ marginRight: 12, alignItems: 'center' }}>
            <View style={{ width: 64, height: 64, borderRadius: 22 }} />
            <View
              style={{ width: 54, height: 10, marginTop: 8, borderRadius: 5 }}
            />
          </View>
        ))}
      </View>
    </SkeletonPlaceholder>
  );

  const SkeletonPopularFoods = () => (
    <SkeletonPlaceholder borderRadius={12}>
      <View
        style={{ flexDirection: 'row', paddingHorizontal: 16, paddingTop: 8 }}
      >
        {[1, 2, 3].map((_, i) => (
          <View
            key={i}
            style={{
              width: 120,
              marginRight: 10,
              borderRadius: 14,
              overflow: 'hidden',
            }}
          >
            <View style={{ height: 80 }} />
            <View style={{ padding: 8 }}>
              <View style={{ width: '80%', height: 12, borderRadius: 5 }} />
              <View
                style={{
                  width: '60%',
                  height: 10,
                  marginTop: 3,
                  borderRadius: 5,
                }}
              />
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  marginTop: 5,
                }}
              >
                <View style={{ width: 36, height: 10, borderRadius: 5 }} />
                <View style={{ width: 28, height: 10, borderRadius: 5 }} />
              </View>
            </View>
          </View>
        ))}
      </View>
    </SkeletonPlaceholder>
  );

  const SkeletonExplore = () => (
    <SkeletonPlaceholder borderRadius={12}>
      <View
        style={{ flexDirection: 'row', paddingHorizontal: 16, paddingTop: 8 }}
      >
        {[1, 2, 3].map((_, i) => (
          <View
            key={i}
            style={{ width: 90, marginRight: 10, alignItems: 'center' }}
          >
            <View style={{ width: 56, height: 56, borderRadius: 18 }} />
            <View
              style={{ width: 44, height: 10, marginTop: 5, borderRadius: 5 }}
            />
          </View>
        ))}
      </View>
    </SkeletonPlaceholder>
  );

  const SkeletonFastDelivery = () => (
    <SkeletonPlaceholder borderRadius={12}>
      <View
        style={{ flexDirection: 'row', paddingHorizontal: 16, paddingTop: 8 }}
      >
        {[1, 2, 3].map((_, i) => (
          <View
            key={i}
            style={{
              width: 140,
              marginRight: 10,
              borderRadius: 14,
              overflow: 'hidden',
            }}
          >
            <View style={{ height: 70 }} />
            <View style={{ padding: 8 }}>
              <View style={{ width: '70%', height: 12, borderRadius: 5 }} />
              <View
                style={{
                  flexDirection: 'row',
                  marginTop: 3,
                  gap: 5,
                }}
              >
                <View style={{ width: 34, height: 10, borderRadius: 5 }} />
                <View style={{ width: 26, height: 10, borderRadius: 5 }} />
              </View>
            </View>
          </View>
        ))}
      </View>
    </SkeletonPlaceholder>
  );

  const SkeletonAICard = () => (
    <SkeletonPlaceholder borderRadius={12}>
      <View
        style={{
          marginHorizontal: 16,
          marginTop: 20,
          height: 150,
          borderRadius: 22,
        }}
      />
    </SkeletonPlaceholder>
  );

  const renderSkeleton = () => (
    <Animated.View style={{ opacity: 1 }}>
      <View style={styles.greetingSection}>
        <View>
          <View
            style={[
              styles.greeting,
              {
                width: 100,
                height: 12,
                backgroundColor: '#e5e7eb',
                borderRadius: 5,
              },
            ]}
          />
          <View
            style={{
              marginTop: 5,
              width: 160,
              height: 24,
              backgroundColor: '#e5e7eb',
              borderRadius: 5,
            }}
          />
        </View>
        <View
          style={{
            width: 68,
            height: 68,
            borderRadius: 34,
            backgroundColor: '#e5e7eb',
          }}
        />
      </View>

      <View style={styles.searchContainer}>
        <View
          style={[styles.searchIconWrapper, { backgroundColor: '#e5e7eb' }]}
        />
        <View
          style={{
            flex: 1,
            marginHorizontal: 10,
            height: 18,
            backgroundColor: '#e5e7eb',
            borderRadius: 5,
          }}
        />
        <View
          style={[styles.searchFilterButton, { backgroundColor: '#e5e7eb' }]}
        />
      </View>

      <View style={styles.filterList}>
        {[1, 2, 3, 4].map((_, i) => (
          <View
            key={i}
            style={{
              height: 34,
              width: 64,
              borderRadius: 12,
              backgroundColor: '#e5e7eb',
              marginRight: 8,
            }}
          />
        ))}
      </View>

      <View style={{ paddingHorizontal: 16, paddingTop: 18 }}>
        <View
          style={{
            height: 180,
            borderRadius: 24,
            backgroundColor: '#e5e7eb',
          }}
        />
      </View>

      <SkeletonCategories />
      <SkeletonPopularFoods />
      <SkeletonExplore />

      <View style={{ paddingHorizontal: 16, paddingTop: 16 }}>
        {[1, 2].map((_, idx) => (
          <View
            key={idx}
            style={{
              marginBottom: 16,
              borderRadius: 22,
              overflow: 'hidden',
              backgroundColor: '#e5e7eb',
              height: 300,
            }}
          />
        ))}
      </View>

      <SkeletonFastDelivery />
      <SkeletonAICard />
    </Animated.View>
  );

  // ─── RENDERERS ──────────────────────────────────────────

  const renderCategory = ({ item }) => (
    <Pressable
      style={({ pressed }) => [styles.categoryItem, pressed && styles.pressed]}
      onPress={() =>
        navigation.navigate('CategoryItems', {
          categoryId: item._id,
          categoryName: item.name,
        })
      }
    >
      <View style={styles.categoryImageWrapper}>
        {item.image ? (
          <Image
            source={{ uri: buildImageUrl(item.image) }}
            style={styles.categoryImage}
          />
        ) : (
          <View
            style={[
              styles.categoryImage,
              {
                backgroundColor: '#f0ece8',
                justifyContent: 'center',
                alignItems: 'center',
              },
            ]}
          >
            <Text style={{ fontSize: 32 }}>{item.icon || '🍽️'}</Text>
          </View>
        )}
        <View style={styles.categoryImageBorder} />
      </View>
      <Text numberOfLines={1} style={styles.categoryName}>
        {item.name}
      </Text>
    </Pressable>
  );

  const renderBanner = ({ item }) => {
    const imageUrl = item.image?.startsWith('http')
      ? item.image
      : `${STATIC_BASE}${item.image}`;
    return (
      <Pressable
        style={({ pressed }) => [
          styles.offerCardWrapper,
          pressed && styles.offerPressed,
        ]}
        onPress={() => {
          if (item.action?.url)
            Linking.openURL(item.action.url).catch(() => {});
        }}
      >
        <ImageBackground
          source={{ uri: imageUrl }}
          style={styles.offerImage}
          imageStyle={styles.offerImageStyle}
        >
          <View style={styles.offerOverlay} />
          <View style={styles.offerContent}>
            <View style={styles.offerEyebrowWrapper}>
              <Ionicons name="flash" size={10} color={COLORS.primary} />
              <Text style={styles.offerEyebrow}>{item.type || 'Offer'}</Text>
            </View>
            <Text style={styles.offerTitle}>{item.title}</Text>
            <Text style={styles.offerSubtitle}>{item.subtitle || ''}</Text>
            <View style={styles.offerBottomRow}>
              {item.couponCode && (
                <View style={styles.couponCode}>
                  <Text style={styles.couponCodeLabel}>USE</Text>
                  <Text style={styles.couponCodeText}>{item.couponCode}</Text>
                </View>
              )}
              <View style={styles.offerArrow}>
                <Ionicons name="arrow-forward" size={16} color={COLORS.white} />
              </View>
            </View>
          </View>
        </ImageBackground>
      </Pressable>
    );
  };

  const renderSearchChip = ({ item }) => {
    const isSelected = selectedChip === item.id;
    return (
      <Pressable
        style={({ pressed }) => [
          styles.searchChip,
          isSelected && styles.searchChipActive,
          pressed && styles.searchChipPressed,
        ]}
        onPress={() => {
          setSelectedChip(isSelected ? null : item.id);
          setSearchValue(isSelected ? '' : item.label);
        }}
      >
        <Text style={styles.searchChipIcon}>{item.icon}</Text>
        <Text
          style={[
            styles.searchChipLabel,
            isSelected && styles.searchChipLabelActive,
          ]}
        >
          {item.label}
        </Text>
      </Pressable>
    );
  };

  const getBadge = badgeType => {
    const badges = {
      trending: { label: 'Trending', icon: '🔥', bg: '#f97316' },
      new: { label: 'New', icon: '🆕', bg: '#3b82f6' },
      free_delivery: { label: 'Free Delivery', icon: '🚚', bg: '#22c55e' },
      bestseller: { label: 'Bestseller', icon: '⭐', bg: '#8b5cf6' },
    };
    return badges[badgeType] || null;
  };

  const renderRestaurant = restaurant => {
    const favorite = favoriteRestaurants.includes(restaurant.id);
    const badgeConfig = getBadge(restaurant.badge);
    const isPromoted = restaurant.promoted;

    return (
      <Pressable
        key={restaurant.id}
        style={({ pressed }) => [
          styles.restaurantCard,
          pressed && styles.restaurantPressed,
        ]}
        onPress={() => {
          navigation.navigate('VendorDetail', { vendorId: restaurant.id });
        }}
      >
        <ImageBackground
          source={{ uri: restaurant.image }}
          style={styles.restaurantImage}
          imageStyle={styles.restaurantImageStyle}
        >
          <LinearGradient
            colors={['rgba(0,0,0,0.01)', 'rgba(0,0,0,0.6)']}
            style={styles.imageGradient}
          />
          <View style={styles.restaurantImageOverlay} />

          <View style={styles.badgeContainer}>
            {isPromoted && (
              <View style={[styles.promotedBadge, styles.badgeSpacing]}>
                <Ionicons name="megaphone" size={9} color={COLORS.white} />
                <Text style={styles.promotedText}>PROMOTED</Text>
              </View>
            )}
            {badgeConfig && !isPromoted && (
              <View
                style={[
                  styles.badge,
                  { backgroundColor: badgeConfig.bg },
                  styles.badgeSpacing,
                ]}
              >
                <Text style={styles.badgeText}>
                  {badgeConfig.icon} {badgeConfig.label}
                </Text>
              </View>
            )}
            {isPromoted && badgeConfig && (
              <View
                style={[
                  styles.badge,
                  { backgroundColor: badgeConfig.bg },
                  styles.badgeSpacing,
                ]}
              >
                <Text style={styles.badgeText}>
                  {badgeConfig.icon} {badgeConfig.label}
                </Text>
              </View>
            )}
          </View>

          <Pressable
            onPress={() => toggleFavorite(restaurant.id)}
            hitSlop={10}
            style={({ pressed }) => [
              styles.favoriteButton,
              pressed && styles.favoritePressed,
            ]}
          >
            <Ionicons
              name={favorite ? 'heart' : 'heart-outline'}
              size={20}
              color={favorite ? '#ef4444' : COLORS.white}
            />
          </Pressable>

          <View style={styles.offerTag}>
            <Ionicons name="pricetag" size={10} color={COLORS.white} />
            <Text numberOfLines={1} style={styles.offerTagText}>
              {restaurant.offer}
            </Text>
          </View>
          <View style={styles.timeBadge}>
            <Ionicons name="time-outline" size={11} color={COLORS.title} />
            <Text style={styles.timeBadgeText}>{restaurant.time}</Text>
          </View>
        </ImageBackground>

        <View style={styles.restaurantBody}>
          <View style={styles.restaurantHeadingRow}>
            <View style={styles.restaurantTitleWrapper}>
              <Text numberOfLines={1} style={styles.restaurantName}>
                {restaurant.name}
              </Text>
              <Text numberOfLines={1} style={styles.restaurantCuisine}>
                {restaurant.cuisine}
              </Text>
            </View>
            <View style={styles.ratingBadge}>
              <Text style={styles.ratingText}>
                {restaurant.rating.toFixed(1)}
              </Text>
              <Ionicons name="star" size={10} color={COLORS.white} />
            </View>
          </View>

          <View style={styles.restaurantMetaRow}>
            <View style={styles.metaItem}>
              <Ionicons
                name="location-outline"
                size={12}
                color={COLORS.muted}
              />
              <Text style={styles.metaText}>{restaurant.distance}</Text>
            </View>
            <View style={styles.metaDot} />
            <Text style={styles.metaText}>{restaurant.priceForTwo}</Text>
            <View style={styles.metaDot} />
            <Text style={styles.metaText}>
              {restaurant.ratingCount} ratings
            </Text>
          </View>

          <View style={styles.restaurantDivider} />

          <View style={styles.restaurantFooter}>
            <View style={styles.deliveryInformation}>
              <View style={styles.deliveryIcon}>
                <Ionicons
                  name="bicycle-outline"
                  size={14}
                  color={COLORS.primary}
                />
              </View>
              <View>
                <Text style={styles.deliveryLabel}>Delivery</Text>
                <Text style={styles.deliveryValue}>
                  {restaurant.deliveryFee}
                </Text>
              </View>
            </View>
            <Pressable style={styles.menuButton}>
              <Text style={styles.menuButtonText}>View menu</Text>
              <Ionicons
                name="chevron-forward"
                size={13}
                color={COLORS.primary}
              />
            </Pressable>
          </View>
        </View>
      </Pressable>
    );
  };

  const renderPopularFood = ({ item }) => {
    const food = item.menuItem || item;
    const vendor = item.vendor || {};

    const vendorId =
      vendor._id || food?.vendorId || food?.vendor?._id || item?.vendorId;

    const imageUrl = buildImageUrl(food?.image);
    const vendorName = vendor?.businessName || food?.vendorName || 'Restaurant';

    const handlePress = () => {
      if (!vendorId) {
        Alert.alert('Error', 'Vendor information missing for this item.');
        return;
      }
      navigation.navigate('ItemDetail', {
        item: {
          ...food,
          vendorId: vendorId,
          vendor: vendor,
        },
        vendorId: vendorId,
      });
    };

    return (
      <Pressable style={styles.popularFoodCard} onPress={handlePress}>
        {imageUrl ? (
          <Image source={{ uri: imageUrl }} style={styles.popularFoodImage} />
        ) : (
          <View
            style={[styles.popularFoodImage, styles.popularFoodPlaceholder]}
          >
            <Text style={styles.placeholderText}>
              {food?.name?.charAt(0) || 'F'}
            </Text>
          </View>
        )}
        <View style={styles.popularFoodInfo}>
          <Text style={styles.popularFoodName} numberOfLines={1}>
            {food?.name || 'Item'}
          </Text>
          <Text style={styles.popularFoodRestaurant} numberOfLines={1}>
            {vendorName}
          </Text>
          <View style={styles.popularFoodMeta}>
            <Text style={styles.popularFoodPrice}>₹{food?.price || 0}</Text>
            {item.distance && (
              <View style={styles.popularFoodRating}>
                <Ionicons name="location" size={10} color={COLORS.muted} />
                <Text style={styles.popularFoodDistanceText}>
                  {item.distance.toFixed(1)} km
                </Text>
              </View>
            )}
          </View>
        </View>
      </Pressable>
    );
  };

  const renderFastDelivery = ({ item }) => (
    <Pressable
      style={styles.fastDeliveryCard}
      onPress={() => {
        if (item.id) {
          navigation.navigate('VendorDetail', { vendorId: item.id });
        }
      }}
    >
      <Image source={{ uri: item.image }} style={styles.fastDeliveryImage} />
      <View style={styles.fastDeliveryInfo}>
        <Text style={styles.fastDeliveryName} numberOfLines={1}>
          {item.name}
        </Text>
        <View style={styles.fastDeliveryMeta}>
          <Ionicons name="time-outline" size={12} color={COLORS.muted} />
          <Text style={styles.fastDeliveryTime}>{item.time}</Text>
          <View style={styles.fastDeliveryRating}>
            <Ionicons name="star" size={10} color="#FFB800" />
            <Text style={styles.fastDeliveryRatingText}>{item.rating}</Text>
          </View>
        </View>
      </View>
    </Pressable>
  );

  const SectionHeader = ({ title, subtitle, rightComponent }) => (
    <View style={styles.sectionHeader}>
      <View>
        <Text style={styles.sectionTitle}>{title}</Text>
        {subtitle && <Text style={styles.sectionSubtitle}>{subtitle}</Text>}
      </View>
      {rightComponent || (
        <Pressable style={styles.seeAllButton}>
          <Text style={styles.seeAllText}>See all</Text>
          <Ionicons name="chevron-forward" size={13} color={COLORS.primary} />
        </Pressable>
      )}
    </View>
  );

  // ─── MAIN RENDER ───────────────────────────────────────
  const renderContent = () => {
    if (loading) {
      return renderSkeleton();
    }

    if (isSearchActive) {
      return renderSearchResults();
    }

    const vendorsToShow = appliedFilter ? filteredVendors : nearbyVendors;
    const hasVendors = vendorsToShow.length > 0;

    return (
      <Animated.View style={{ opacity: contentOpacity }}>
        {/* Quick Filters */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterList}
        >
          {quickFilters.map(filter => {
            const active = selectedFilter === filter.id;
            return (
              <Pressable
                key={filter.id}
                onPress={() => {
                  const newFilter = active ? null : filter.id;
                  setSelectedFilter(newFilter);
                  applyFilter(newFilter);
                }}
                style={[styles.filterChip, active && styles.filterChipActive]}
              >
                <Ionicons
                  name={filter.icon}
                  size={13}
                  color={active ? COLORS.white : COLORS.text}
                />
                <Text
                  style={[styles.filterText, active && styles.filterTextActive]}
                >
                  {filter.name}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>

        {/* 4. Offers Carousel */}
        {banners.length > 0 ? (
          <FlatList
            ref={offersRef}
            data={banners}
            keyExtractor={(item, index) => item._id || index.toString()}
            renderItem={renderBanner}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onScrollBeginDrag={() => setIsAutoScrolling(false)}
            onMomentumScrollEnd={e => {
              const index = Math.round(e.nativeEvent.contentOffset.x / width);
              setCurrentOfferIndex(index);
              setIsAutoScrolling(true);
            }}
          />
        ) : (
          <View
            style={{
              paddingHorizontal: 16,
              paddingTop: 18,
              paddingBottom: 4,
            }}
          >
            <View
              style={{
                height: 180,
                borderRadius: 24,
                backgroundColor: '#f5f0eb',
                justifyContent: 'center',
                alignItems: 'center',
                borderWidth: 1,
                borderColor: '#eee5df',
              }}
            >
              <Text
                style={{
                  color: COLORS.muted,
                  fontSize: 13,
                  fontWeight: '600',
                }}
              >
                No offers available
              </Text>
            </View>
          </View>
        )}

        {/* 5. Food Categories */}
        <SectionHeader
          title="What's on your mind?"
          subtitle="Explore food by category"
          rightComponent={
            <Pressable
              style={styles.seeAllButton}
              onPress={() => navigation.navigate('SeeAll')}
            >
              <Text style={styles.seeAllText}>See all</Text>
              <Ionicons
                name="chevron-forward"
                size={13}
                color={COLORS.primary}
              />
            </Pressable>
          }
        />
        <FlatList
          data={foodCategories}
          keyExtractor={item => item._id}
          renderItem={renderCategory}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryList}
        />

        {/* 6. Popular Foods Near You */}
        <SectionHeader
          title="Popular Foods Near You"
          subtitle="Most loved dishes"
          rightComponent={
            <Pressable
              style={styles.seeAllButton}
              onPress={() =>
                navigation.navigate('PopularFoodsNear', {
                  coords: locationCoords,
                })
              }
            >
              <Text style={styles.seeAllText}>See all</Text>
              <Ionicons
                name="chevron-forward"
                size={13}
                color={COLORS.primary}
              />
            </Pressable>
          }
        />
        {nearbyPopularFoods.length > 0 ? (
          <FlatList
            data={nearbyPopularFoods}
            keyExtractor={item => item._id}
            renderItem={renderPopularFood}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.popularFoodsList}
          />
        ) : (
          <View style={styles.popularFoodsEmpty}>
            <Ionicons
              name="restaurant-outline"
              size={28}
              color={COLORS.muted}
            />
            <Text style={styles.popularFoodsEmptyText}>
              No popular dishes nearby
            </Text>
          </View>
        )}

        {/* 7. Explore Near You */}
        <SectionHeader
          title="Explore Near You"
          subtitle="Discover new experiences"
          rightComponent={
            <Pressable
              style={styles.seeAllButton}
              onPress={() => navigation.navigate('ExploreScreen')}
            >
              <Text style={styles.seeAllText}>See all</Text>
              <Ionicons
                name="chevron-forward"
                size={13}
                color={COLORS.primary}
              />
            </Pressable>
          }
        />
        {exploreCategories.length > 0 ? (
          <FlatList
            data={exploreCategories}
            keyExtractor={item => item._id}
            renderItem={({ item }) => (
              <Pressable
                style={styles.exploreCard}
                onPress={() =>
                  navigation.navigate('ExploreScreen', {
                    selectedCategoryId: item._id,
                  })
                }
              >
                <View
                  style={[
                    styles.exploreIconWrapper,
                    { backgroundColor: '#fef3c7' },
                  ]}
                >
                  <Text style={styles.exploreIcon}>{item.icon}</Text>
                </View>
                <Text style={styles.exploreLabel}>{item.title}</Text>
              </Pressable>
            )}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.exploreList}
          />
        ) : (
          <View style={styles.emptyExplore}>
            <Text style={styles.emptyExploreText}>No explore categories</Text>
          </View>
        )}
        {/* ─── NEW: Tiffin Houses Section ────────────────────── */}
        <SectionHeader
          title="Tiffin Houses Near You"
          subtitle="Homely meals nearby"
          rightComponent={
            locationCoords ? (
              <Pressable
                style={styles.seeAllButton}
                onPress={() =>
                  navigation.navigate('TiffinHousesListScreen', {
                    lat: locationCoords.lat,
                    lng: locationCoords.lng,
                  })
                }
              >
                <Text style={styles.seeAllText}>See all</Text>
                <Ionicons
                  name="chevron-forward"
                  size={13}
                  color={COLORS.primary}
                />
              </Pressable>
            ) : (
              <View style={styles.seeAllButtonDisabled}>
                <Text style={[styles.seeAllText, { opacity: 0.4 }]}>
                  See all
                </Text>
              </View>
            )
          }
        />
        {tiffinLoading ? (
          <View style={styles.tiffinLoadingContainer}>
            <ActivityIndicator size="small" color={COLORS.primary} />
          </View>
        ) : tiffinHouses.length > 0 ? (
          <FlatList
            data={tiffinHouses}
            keyExtractor={item => item.id}
            renderItem={({ item }) => (
              <Pressable
                style={styles.tiffinCard}
                onPress={() =>
                  navigation.navigate('VendorDetail', { vendorId: item.id })
                }
              >
                <Image
                  source={{ uri: item.image }}
                  style={styles.tiffinImage}
                />
                <View style={styles.tiffinInfo}>
                  <Text style={styles.tiffinName} numberOfLines={1}>
                    {item.name}
                  </Text>
                  <Text style={styles.tiffinCuisine} numberOfLines={1}>
                    {item.cuisine}
                  </Text>
                  <View style={styles.tiffinMeta}>
                    <View style={styles.tiffinRating}>
                      <Ionicons name="star" size={10} color="#FFB800" />
                      <Text style={styles.tiffinRatingText}>
                        {item.rating.toFixed(1)}
                      </Text>
                    </View>
                    <Text style={styles.tiffinDistance}>{item.distance}</Text>
                  </View>
                </View>
              </Pressable>
            )}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.tiffinList}
          />
        ) : (
          <View style={styles.tiffinEmpty}>
            <Ionicons
              name="restaurant-outline"
              size={24}
              color={COLORS.muted}
            />
            <Text style={styles.tiffinEmptyText}>No tiffin houses nearby</Text>
          </View>
        )}

        {/* 8. Top Food Spots Near You */}
        <SectionHeader
          title="Top Food Spots Near You"
          subtitle="Highly rated vendors near your location"
          rightComponent={
            locationCoords ? (
              <Pressable
                style={styles.seeAllButton}
                onPress={() =>
                  navigation.navigate('NearbyVendors', {
                    lat: locationCoords.lat,
                    lng: locationCoords.lng,
                  })
                }
              >
                <Text style={styles.seeAllText}>See all</Text>
                <Ionicons
                  name="chevron-forward"
                  size={13}
                  color={COLORS.primary}
                />
              </Pressable>
            ) : (
              <View style={styles.seeAllButtonDisabled}>
                <Text style={[styles.seeAllText, { opacity: 0.4 }]}>
                  See all
                </Text>
              </View>
            )
          }
        />
        <View style={styles.restaurantList}>
          {!hasVendors ? (
            <View style={{ paddingVertical: 16, alignItems: 'center' }}>
              <Text style={{ color: COLORS.muted }}>
                {appliedFilter
                  ? 'No vendors match this filter'
                  : 'No vendors found nearby'}
              </Text>
            </View>
          ) : (
            vendorsToShow.map(renderRestaurant)
          )}
        </View>

        {/* 9. Fast Delivery */}
        <SectionHeader
          title="Fast Delivery"
          subtitle="Get your food in a flash"
          rightComponent={
            <Pressable
              style={styles.seeAllButton}
              onPress={() => navigation.navigate('FastDeliveryList')}
            >
              <Text style={styles.seeAllText}>See all</Text>
              <Ionicons
                name="chevron-forward"
                size={13}
                color={COLORS.primary}
              />
            </Pressable>
          }
        />
        <FlatList
          data={fastDeliveryVendors}
          keyExtractor={item => item.id}
          renderItem={renderFastDelivery}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.fastDeliveryList}
        />

        {/* 10. AI Recommendation */}
        <View style={styles.aiCard}>
          <ImageBackground
            source={{ uri: aiRecommendation.image }}
            style={styles.aiImage}
            imageStyle={styles.aiImageStyle}
          >
            <View style={styles.aiOverlay} />
            <View style={styles.aiContent}>
              <View style={styles.aiBadge}>
                <Ionicons name="sparkles" size={11} color="#7c3aed" />
                <Text style={styles.aiBadgeText}>{aiRecommendation.title}</Text>
              </View>
              <Text style={styles.aiTitle}>{aiRecommendation.subtitle}</Text>
              <Text style={styles.aiDescription}>
                {aiRecommendation.description}
              </Text>
              <Pressable style={styles.aiButton}>
                <Text style={styles.aiButtonText}>{aiRecommendation.cta}</Text>
                <Ionicons name="arrow-forward" size={13} color={COLORS.white} />
              </Pressable>
            </View>
          </ImageBackground>
        </View>
      </Animated.View>
    );
  };

  // ─── FINAL RENDER ───────────────────────────────────────
  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
      <Animated.View
        style={[
          styles.container,
          {
            opacity: screenOpacity,
            transform: [{ translateY: screenTranslateY }],
          },
        ]}
      >
        <ScrollView
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              colors={[COLORS.primary]}
              tintColor={COLORS.primary}
            />
          }
        >
          {/* ─── HEADER ────────────────────────────────── */}
          <View style={styles.header}>
            <Pressable style={styles.locationSection}>
              <View style={styles.locationIcon}>
                <Ionicons name="location" size={18} color={COLORS.primary} />
              </View>
              <View style={styles.locationContent}>
                <View style={styles.locationTopRow}>
                  <Text style={styles.deliverToText}>DELIVER TO</Text>
                  <Ionicons
                    name="chevron-down"
                    size={12}
                    color={COLORS.primary}
                  />
                </View>
                <Text numberOfLines={1} style={styles.locationAddress}>
                  {isFetchingLocation
                    ? 'Getting location...'
                    : deliveryLocation}
                </Text>
              </View>
            </Pressable>
            <View style={styles.headerActions}>
              <Pressable
                style={styles.headerButton}
                onPress={() => navigation.navigate('Notifications')}
              >
                <Ionicons
                  name="notifications-outline"
                  size={20}
                  color={COLORS.title}
                />
                <View style={styles.notificationDot} />
              </Pressable>
              <Pressable
                style={styles.avatarWrapper}
                onPress={() => navigation.navigate('PersonalInformation')}
              >
                <Image
                  source={{ uri: profile.avatar }}
                  style={styles.avatar}
                  defaultSource={require('../assets/logo/foodmitra.png')}
                  onError={() =>
                    setProfile(prev => ({ ...prev, avatar: DEFAULT_AVATAR }))
                  }
                />
              </Pressable>
            </View>
          </View>

          {/* ─── GREETING ───────────────────────────────── */}
          <View style={styles.greetingSection}>
            <View style={styles.greetingTextWrapper}>
              <Text style={styles.greetingTitle}>
                Craving something{'\n'}
                <Text style={styles.greetingHighlight}>delicious?</Text>
              </Text>
            </View>
            <View style={styles.miniFoodImageWrapper}>
              <Image
                source={{
                  uri: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=300&q=80',
                }}
                style={styles.miniFoodImage}
              />
            </View>
          </View>

          {/* ─── SEARCH BAR ────────────────────────────── */}
          <View style={styles.searchContainer}>
            <View style={styles.searchIconWrapper}>
              <Ionicons name="search" size={18} color={COLORS.primary} />
            </View>
            <TextInput
              value={searchValue}
              onChangeText={setSearchValue}
              placeholder="Search dishes, restaurants or cuisines"
              placeholderTextColor="#9ca3af"
              returnKeyType="search"
              style={styles.searchInput}
            />
            {searchValue ? (
              <Pressable onPress={clearSearch} style={styles.clearSearchButton}>
                <Text style={styles.clearSearchText}>Cancel</Text>
              </Pressable>
            ) : (
              <Pressable
                style={styles.searchFilterButton}
                onPress={() => setFilterVisible(true)}
              >
                <Ionicons name="options-outline" size={18} color="#fff" />
              </Pressable>
            )}
          </View>

          {/* ─── CONTENT ────────────────────────────────── */}
          {renderContent()}
        </ScrollView>
      </Animated.View>

      {/* Filter Modal – unchanged */}
      <Modal
        visible={filterVisible}
        transparent
        statusBarTranslucent
        animationType="none"
        onRequestClose={handleCloseModal}
      >
        <View style={styles.modalRoot}>
          <Pressable style={styles.backdrop} onPress={handleCloseModal} />
          <Animated.View
            style={[
              styles.modalCard,
              {
                transform: [{ translateY }],
                opacity: backdropOpacity,
              },
            ]}
          >
            <View style={styles.modalHandle} />
            <Pressable
              style={styles.modalCloseButton}
              onPress={handleCloseModal}
            >
              <Ionicons name="close" size={22} color={COLORS.title} />
            </Pressable>
            <Text style={styles.modalTitle}>Filter by</Text>
            <Text style={styles.modalSubtitle}>Select food preference</Text>
            <View style={styles.modalOptions}>
              <Pressable
                style={[
                  styles.optionCard,
                  foodType === 'all' && styles.optionCardActive,
                ]}
                onPress={() => setFoodType('all')}
              >
                <View style={styles.optionIcon}>
                  <Ionicons
                    name="restaurant-outline"
                    size={22}
                    color="#374151"
                  />
                </View>
                <View style={styles.optionTextContainer}>
                  <Text
                    style={[
                      styles.optionTitle,
                      foodType === 'all' && styles.optionTitleActive,
                    ]}
                  >
                    All
                  </Text>
                  <Text style={styles.optionSub}>Veg & Non-veg both</Text>
                </View>
                {foodType === 'all' && (
                  <View style={styles.optionCheck}>
                    <Ionicons
                      name="checkmark-circle"
                      size={22}
                      color="#16a34a"
                    />
                  </View>
                )}
              </Pressable>

              <Pressable
                style={[
                  styles.optionCard,
                  foodType === 'veg' && styles.optionCardActive,
                ]}
                onPress={() => setFoodType('veg')}
              >
                <View
                  style={[styles.optionIcon, { backgroundColor: '#ecfdf3' }]}
                >
                  <Ionicons name="leaf-outline" size={22} color="#16a34a" />
                </View>
                <View style={styles.optionTextContainer}>
                  <Text
                    style={[
                      styles.optionTitle,
                      foodType === 'veg' && styles.optionTitleActive,
                    ]}
                  >
                    Veg
                  </Text>
                  <Text style={styles.optionSub}>Only vegetarian</Text>
                </View>
                {foodType === 'veg' && (
                  <View style={styles.optionCheck}>
                    <Ionicons
                      name="checkmark-circle"
                      size={22}
                      color="#16a34a"
                    />
                  </View>
                )}
              </Pressable>

              <Pressable
                style={[
                  styles.optionCard,
                  foodType === 'nonveg' && styles.optionCardActiveNonVeg,
                ]}
                onPress={() => setFoodType('nonveg')}
              >
                <View
                  style={[styles.optionIcon, { backgroundColor: '#fef2f2' }]}
                >
                  <Ionicons
                    name="fast-food-outline"
                    size={22}
                    color="#ef4444"
                  />
                </View>
                <View style={styles.optionTextContainer}>
                  <Text
                    style={[
                      styles.optionTitle,
                      foodType === 'nonveg' && styles.optionTitleActiveNonVeg,
                    ]}
                  >
                    Non-Veg
                  </Text>
                  <Text style={styles.optionSub}>Only non-vegetarian</Text>
                </View>
                {foodType === 'nonveg' && (
                  <View style={styles.optionCheck}>
                    <Ionicons
                      name="checkmark-circle"
                      size={22}
                      color="#ef4444"
                    />
                  </View>
                )}
              </Pressable>
            </View>
            <Pressable style={styles.doneButton} onPress={handleCloseModal}>
              <Text style={styles.doneButtonText}>Apply Filter</Text>
            </Pressable>
          </Animated.View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

// ─── STYLES ──────────────────────────────────────────────────
const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.background },
  container: { flex: 1 },
  scrollContent: { paddingBottom: 100 },
  // ── Header ──────────────────────────────────────────────
  header: {
    paddingHorizontal: 16,
    paddingTop: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  locationSection: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  locationIcon: {
    width: 40,
    height: 40,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.soft,
  },
  locationContent: { marginLeft: 8, flex: 1 },
  locationTopRow: { flexDirection: 'row', alignItems: 'center' },
  deliverToText: {
    marginRight: 3,
    color: COLORS.muted,
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 0.8,
  },
  locationAddress: {
    maxWidth: 180,
    marginTop: 3,
    color: COLORS.title,
    fontSize: 13,
    fontWeight: '900',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerButton: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.white,
  },
  notificationDot: {
    position: 'absolute',
    top: 7,
    right: 7,
    width: 7,
    height: 7,
    borderRadius: 3.5,
    borderWidth: 2,
    borderColor: COLORS.white,
    backgroundColor: '#ef4444',
  },
  avatarWrapper: {
    width: 38,
    height: 38,
    padding: 2,
    borderRadius: 14,
    backgroundColor: COLORS.primary,
  },
  avatar: {
    width: '100%',
    height: '100%',
    borderRadius: 12,
  },
  // ── Greeting ─────────────────────────────────────────────
  greetingSection: {
    marginTop: 16,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  greetingTextWrapper: { flex: 1 },
  greetingTitle: {
    color: COLORS.title,
    fontSize: 24,
    lineHeight: 30,
    fontWeight: '900',
    letterSpacing: -0.7,
  },
  greetingHighlight: { color: COLORS.primary },
  miniFoodImageWrapper: {
    width: 68,
    height: 68,
    padding: 4,
    borderRadius: 34,
    backgroundColor: '#ffe5d8',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 5,
  },
  miniFoodImage: {
    width: '100%',
    height: '100%',
    borderRadius: 30,
  },
  // ── Search Bar ──────────────────────────────────────────
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
  searchIconWrapper: {
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
  searchFilterButton: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  clearSearchButton: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: COLORS.soft,
  },
  clearSearchText: {
    color: COLORS.primary,
    fontSize: 11,
    fontWeight: '700',
  },
  // ── Quick Filters ──────────────────────────────────────
  filterList: { paddingTop: 12, paddingHorizontal: 16, paddingBottom: 4 },
  filterChip: {
    height: 34,
    marginRight: 8,
    paddingHorizontal: 11,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.white,
  },
  filterChipActive: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primary,
  },
  filterText: {
    marginLeft: 5,
    color: COLORS.text,
    fontSize: 10,
    fontWeight: '700',
  },
  filterTextActive: { color: COLORS.white },
  // ── Offers ──────────────────────────────────────────────
  offerCardWrapper: {
    width,
    paddingHorizontal: 16,
    paddingTop: 18,
    paddingBottom: 2,
  },
  offerPressed: { opacity: 0.95, transform: [{ scale: 0.99 }] },
  offerImage: { flex: 1, borderRadius: 24 },
  offerImageStyle: { borderRadius: 24 },
  offerOverlay: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 24,
    backgroundColor: 'rgba(17,24,39,0.55)',
  },
  offerContent: { flex: 1, padding: 18, justifyContent: 'center' },
  offerEyebrowWrapper: {
    alignSelf: 'flex-start',
    paddingHorizontal: 9,
    paddingVertical: 5,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 18,
    backgroundColor: COLORS.white,
  },
  offerEyebrow: {
    marginLeft: 3,
    color: COLORS.primary,
    fontSize: 7,
    fontWeight: '900',
    letterSpacing: 0.6,
  },
  offerTitle: {
    marginTop: 12,
    color: COLORS.white,
    fontSize: 24,
    fontWeight: '900',
    letterSpacing: -0.6,
  },
  offerSubtitle: {
    marginTop: 4,
    color: 'rgba(255,255,255,0.82)',
    fontSize: 10,
    fontWeight: '600',
  },
  offerBottomRow: {
    marginTop: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  couponCode: {
    paddingHorizontal: 9,
    paddingVertical: 6,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 8,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: 'rgba(255,255,255,0.7)',
    backgroundColor: 'rgba(255,255,255,0.13)',
  },
  couponCodeLabel: {
    marginRight: 4,
    color: 'rgba(255,255,255,0.7)',
    fontSize: 7,
    fontWeight: '700',
  },
  couponCodeText: {
    color: COLORS.white,
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  offerArrow: {
    width: 34,
    height: 34,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
  },
  // ── Section Headers ──────────────────────────────────────
  sectionHeader: {
    marginTop: 26,
    marginBottom: 14,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionTitle: {
    color: COLORS.title,
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: -0.3,
  },
  sectionSubtitle: {
    marginTop: 3,
    color: COLORS.muted,
    fontSize: 9,
    fontWeight: '500',
  },
  seeAllButton: { flexDirection: 'row', alignItems: 'center' },
  seeAllText: { color: COLORS.primary, fontSize: 10, fontWeight: '900' },
  seeAllButtonDisabled: { opacity: 0.4 },
  // ── Categories ──────────────────────────────────────────
  categoryList: { paddingHorizontal: 16 },
  categoryItem: { width: 72, marginRight: 10, alignItems: 'center' },
  categoryImageWrapper: {
    width: 64,
    height: 64,
    overflow: 'hidden',
    borderRadius: 22,
    backgroundColor: COLORS.white,
    shadowColor: '#7c2d12',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 4,
  },
  categoryImage: { width: '100%', height: '100%' },
  categoryImageBorder: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 22,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.75)',
  },
  categoryName: {
    marginTop: 7,
    color: COLORS.text,
    fontSize: 9.5,
    fontWeight: '800',
  },
  pressed: { opacity: 0.75, transform: [{ scale: 0.96 }] },
  // ── Popular Foods ──────────────────────────────────────
  popularFoodsEmpty: { paddingVertical: 16, alignItems: 'center' },
  popularFoodsEmptyText: { marginTop: 6, color: COLORS.muted, fontSize: 12 },
  popularFoodsList: { paddingHorizontal: 16, paddingBottom: 6 },
  popularFoodCard: {
    width: 120,
    marginRight: 10,
    backgroundColor: COLORS.white,
    borderRadius: 14,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 5,
    elevation: 2,
  },
  popularFoodImage: { width: '100%', height: 80, resizeMode: 'cover' },
  popularFoodPlaceholder: {
    backgroundColor: '#f0e6e0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderText: { fontSize: 36, fontWeight: '900', color: '#d4c4b8' },
  popularFoodInfo: { padding: 8 },
  popularFoodName: { fontSize: 11, fontWeight: '700', color: COLORS.title },
  popularFoodRestaurant: { fontSize: 9, color: COLORS.muted, marginTop: 1 },
  popularFoodMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 3,
  },
  popularFoodPrice: { fontSize: 11, fontWeight: '700', color: COLORS.primary },
  popularFoodRating: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  popularFoodDistanceText: { fontSize: 8, color: COLORS.muted, marginLeft: 2 },
  // ── Explore ────────────────────────────────────────────
  exploreList: { paddingHorizontal: 16, paddingBottom: 6 },
  exploreCard: { width: 90, marginRight: 10, alignItems: 'center' },
  exploreIconWrapper: {
    width: 56,
    height: 56,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  exploreIcon: { fontSize: 22 },
  exploreLabel: {
    marginTop: 5,
    fontSize: 10,
    fontWeight: '600',
    color: COLORS.text,
    textAlign: 'center',
  },
  emptyExplore: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    alignItems: 'center',
  },
  emptyExploreText: { color: COLORS.muted, fontSize: 12 },
  // ── Restaurants ────────────────────────────────────────
  restaurantList: {
    paddingHorizontal: 16,
    gap: 16,
  },
  restaurantCard: {
    overflow: 'hidden',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.white,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 6,
  },
  restaurantPressed: {
    opacity: 0.95,
    transform: [{ scale: 0.995 }],
  },
  restaurantImage: {
    height: 180,
  },
  restaurantImageStyle: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  imageGradient: {
    ...StyleSheet.absoluteFillObject,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  restaurantImageOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.05)',
  },
  promotedBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 20,
    backgroundColor: 'rgba(17,24,39,0.85)',
  },
  promotedText: {
    marginLeft: 4,
    color: COLORS.white,
    fontSize: 7,
    fontWeight: '900',
    letterSpacing: 0.8,
  },
  favoriteButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.3)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  favoritePressed: {
    transform: [{ scale: 0.88 }],
  },
  offerTag: {
    position: 'absolute',
    left: 12,
    bottom: 14,
    maxWidth: '60%',
    paddingHorizontal: 10,
    paddingVertical: 5,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 20,
    backgroundColor: '#2563eb',
    shadowColor: '#2563eb',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  offerTagText: {
    flexShrink: 1,
    marginLeft: 5,
    color: COLORS.white,
    fontSize: 8,
    fontWeight: '800',
  },
  timeBadge: {
    position: 'absolute',
    right: 12,
    bottom: 14,
    paddingHorizontal: 10,
    paddingVertical: 5,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.95)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  timeBadgeText: {
    marginLeft: 4,
    color: COLORS.title,
    fontSize: 8.5,
    fontWeight: '800',
  },
  restaurantBody: {
    padding: 14,
  },
  restaurantHeadingRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  restaurantTitleWrapper: {
    flex: 1,
    marginRight: 10,
  },
  restaurantName: {
    color: COLORS.title,
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: -0.3,
  },
  restaurantCuisine: {
    marginTop: 4,
    color: COLORS.muted,
    fontSize: 11,
    fontWeight: '500',
  },
  ratingBadge: {
    paddingHorizontal: 8,
    paddingVertical: 5,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 20,
    backgroundColor: COLORS.success,
    shadowColor: COLORS.success,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  ratingText: {
    marginRight: 3,
    color: COLORS.white,
    fontSize: 10,
    fontWeight: '900',
  },
  restaurantMetaRow: {
    marginTop: 12,
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaText: {
    marginLeft: 3,
    color: COLORS.muted,
    fontSize: 9.5,
    fontWeight: '600',
  },
  metaDot: {
    width: 3,
    height: 3,
    marginHorizontal: 6,
    borderRadius: 2,
    backgroundColor: '#d1d5db',
  },
  restaurantDivider: {
    height: 1,
    marginTop: 12,
    backgroundColor: '#f1f3f5',
  },
  restaurantFooter: {
    marginTop: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  deliveryInformation: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  deliveryIcon: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.soft,
  },
  deliveryLabel: {
    marginLeft: 8,
    color: COLORS.muted,
    fontSize: 7.5,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  deliveryValue: {
    marginTop: 1,
    marginLeft: 8,
    color: COLORS.text,
    fontSize: 9,
    fontWeight: '800',
  },
  menuButton: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    backgroundColor: COLORS.soft,
  },
  menuButtonText: {
    color: COLORS.primary,
    fontSize: 9,
    fontWeight: '800',
  },
  badgeContainer: {
    position: 'absolute',
    top: 12,
    left: 12,
    flexDirection: 'column',
    alignItems: 'flex-start',
  },
  badgeSpacing: {
    marginBottom: 4,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 3,
  },
  badgeText: {
    color: COLORS.white,
    fontSize: 7.5,
    fontWeight: '800',
    letterSpacing: 0.4,
  },
  // ── Fast Delivery ──────────────────────────────────────
  fastDeliveryList: { paddingHorizontal: 16, paddingBottom: 6 },
  fastDeliveryCard: {
    width: 140,
    marginRight: 10,
    backgroundColor: COLORS.white,
    borderRadius: 14,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 5,
    elevation: 2,
  },
  fastDeliveryImage: { width: '100%', height: 70, resizeMode: 'cover' },
  fastDeliveryInfo: { padding: 8 },
  fastDeliveryName: { fontSize: 11, fontWeight: '700', color: COLORS.title },
  fastDeliveryMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 3,
    gap: 5,
  },
  fastDeliveryTime: { fontSize: 9, color: COLORS.muted },
  fastDeliveryRating: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  fastDeliveryRatingText: {
    fontSize: 9,
    fontWeight: '600',
    color: COLORS.text,
  },
  // ── AI Recommendation ──────────────────────────────────
  aiCard: {
    marginHorizontal: 16,
    marginTop: 20,
    marginBottom: 4,
    height: 150,
    borderRadius: 22,
    overflow: 'hidden',
    shadowColor: '#4c1d95',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 14,
    elevation: 5,
  },
  aiImage: { flex: 1 },
  aiImageStyle: { borderRadius: 22 },
  aiOverlay: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 22,
    backgroundColor: 'rgba(30,15,55,0.66)',
  },
  aiContent: { flex: 1, padding: 16, justifyContent: 'center' },
  aiBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 9,
    paddingVertical: 5,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 18,
    backgroundColor: COLORS.white,
  },
  aiBadgeText: {
    marginLeft: 4,
    color: '#7c3aed',
    fontSize: 7,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  aiTitle: {
    marginTop: 11,
    color: COLORS.white,
    fontSize: 18,
    fontWeight: '900',
  },
  aiDescription: {
    maxWidth: 210,
    marginTop: 5,
    color: 'rgba(255,255,255,0.78)',
    fontSize: 9.5,
    lineHeight: 14,
    fontWeight: '500',
  },
  aiButton: {
    alignSelf: 'flex-start',
    marginTop: 10,
    paddingHorizontal: 11,
    paddingVertical: 7,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 10,
    backgroundColor: '#7c3aed',
  },
  aiButtonText: {
    marginRight: 5,
    color: COLORS.white,
    fontSize: 9,
    fontWeight: '900',
  },
  // ── Badge Container ──────────────────────────────────
  badgeContainer: {
    position: 'absolute',
    top: 11,
    left: 11,
    flexDirection: 'column',
    alignItems: 'flex-start',
  },
  badgeSpacing: { marginBottom: 3 },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 2,
  },
  badgeText: {
    color: COLORS.white,
    fontSize: 7,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  // ── Search Results ────────────────────────────────────
  searchLoadingContainer: { paddingTop: 60, alignItems: 'center' },
  searchLoadingText: { marginTop: 10, fontSize: 13, color: COLORS.muted },
  searchEmptyContainer: { paddingTop: 60, alignItems: 'center' },
  searchEmptyTitle: {
    marginTop: 14,
    fontSize: 17,
    fontWeight: '700',
    color: COLORS.title,
  },
  searchEmptyText: {
    marginTop: 6,
    fontSize: 13,
    color: COLORS.muted,
    textAlign: 'center',
  },
  searchResultsContainer: { paddingHorizontal: 16, paddingTop: 10 },
  searchSectionTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.title,
    marginTop: 14,
    marginBottom: 8,
  },
  searchCategorySection: { marginBottom: 10 },
  searchCategoryChip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 18,
    backgroundColor: '#f0ece8',
    marginRight: 8,
  },
  searchCategoryChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.text,
  },
  searchResultCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 14,
    padding: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: '#7c2d12',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  searchResultImage: {
    width: 50,
    height: 50,
    borderRadius: 10,
    backgroundColor: '#e5e7eb',
  },
  searchResultContent: { flex: 1, marginLeft: 10, marginRight: 6 },
  searchResultTitle: { fontSize: 13, fontWeight: '700', color: COLORS.title },
  searchResultSubtitle: { fontSize: 11, color: COLORS.muted, marginTop: 1 },
  searchResultMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 3,
    gap: 6,
  },
  searchResultMeta: { fontSize: 10, color: COLORS.muted },
  searchResultPrice: { fontSize: 12, fontWeight: '700', color: COLORS.primary },
  vegBadge: { paddingHorizontal: 5, paddingVertical: 2, borderRadius: 5 },
  vegBadgeText: { color: COLORS.white, fontSize: 7, fontWeight: '800' },
  // ── Filter Modal ──────────────────────────────────────
  modalRoot: { flex: 1 },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(23,23,23,0.55)',
  },
  modalCard: {
    maxHeight: '92%',
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderBottomLeftRadius: 26,
    borderBottomRightRadius: 26,
    backgroundColor: COLORS.background,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 16,
  },
  modalHandle: {
    width: 40,
    height: 4,
    marginTop: 8,
    alignSelf: 'center',
    borderRadius: 2,
    backgroundColor: '#ded6d1',
  },
  modalCloseButton: {
    position: 'absolute',
    top: 10,
    right: 14,
    zIndex: 10,
    padding: 4,
  },
  modalTitle: {
    marginTop: 10,
    fontSize: 18,
    fontWeight: '900',
    color: COLORS.title,
    marginBottom: 3,
  },
  modalSubtitle: { fontSize: 12, color: COLORS.muted, marginBottom: 18 },
  modalOptions: { gap: 10 },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#e5e7eb',
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  optionCardActive: {
    borderColor: '#16a34a',
    backgroundColor: '#f0fdf4',
    shadowColor: '#16a34a',
    shadowOpacity: 0.08,
    shadowRadius: 6,
  },
  optionCardActiveNonVeg: {
    borderColor: '#ef4444',
    backgroundColor: '#fef2f2',
    shadowColor: '#ef4444',
    shadowOpacity: 0.08,
    shadowRadius: 6,
  },
  optionIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  optionTextContainer: { flex: 1 },
  optionTitle: { fontSize: 14, fontWeight: '700', color: '#374151' },
  optionTitleActive: { color: '#16a34a' },
  optionTitleActiveNonVeg: { color: '#ef4444' },
  optionSub: { fontSize: 11, color: COLORS.muted, marginTop: 1 },
  optionCheck: { marginLeft: 'auto' },
  doneButton: {
    marginTop: 20,
    height: 48,
    backgroundColor: COLORS.primary,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 5,
  },
  doneButtonText: { color: '#fff', fontSize: 14, fontWeight: '800' },
  // ── Misc ──────────────────────────────────────────────
  searchChipList: { paddingHorizontal: 16, paddingTop: 10, paddingBottom: 2 },
  searchChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 18,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  searchChipActive: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.soft,
  },
  searchChipPressed: { transform: [{ scale: 0.96 }] },
  searchChipIcon: { fontSize: 12, marginRight: 5 },
  searchChipLabel: { fontSize: 12, fontWeight: '600', color: COLORS.text },
  searchChipLabelActive: { color: COLORS.primary },
  imagePlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f0e6e0',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 16,
    marginTop: 20,
    marginBottom: 6,
  },
  statCard: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 8,
    alignItems: 'center',
    marginHorizontal: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 5,
    elevation: 2,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  statIcon: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  statValue: { fontSize: 16, fontWeight: '800', color: COLORS.title },
  statLabel: {
    fontSize: 10,
    fontWeight: '500',
    color: COLORS.muted,
    marginTop: 1,
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 10,
    gap: 5,
  },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#d1d5db' },
  dotActive: { backgroundColor: COLORS.primary, width: 16 },
  endSection: {
    marginTop: 30,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  endDivider: { width: 45, height: 1, backgroundColor: '#e5e7eb' },
  endIcon: {
    width: 32,
    height: 32,
    marginHorizontal: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
    backgroundColor: '#fff0e9',
  },
  endTitle: {
    marginTop: 8,
    color: COLORS.text,
    fontSize: 12,
    fontWeight: '900',
    textAlign: 'center',
  },
  endSubtitle: {
    marginTop: 3,
    color: COLORS.muted,
    fontSize: 8.5,
    textAlign: 'center',
  },
  searchCategoryChipImage: {
    width: 28,
    height: 28,
    borderRadius: 14,
    marginRight: 6,
  },
  searchCategoryChipImagePlaceholder: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#f0ece8',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 6,
  },
  searchCategoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 18,
    backgroundColor: '#f0ece8',
    marginRight: 8,
  },
  // ─── NEW: Tiffin Houses Styles ────────────────────────────
  tiffinList: {
    paddingHorizontal: 16,
    paddingBottom: 6,
  },
  tiffinCard: {
    width: 140,
    marginRight: 10,
    backgroundColor: COLORS.white,
    borderRadius: 14,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 5,
    elevation: 2,
  },
  tiffinImage: {
    width: '100%',
    height: 80,
    resizeMode: 'cover',
  },
  tiffinInfo: {
    padding: 8,
  },
  tiffinName: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.title,
  },
  tiffinCuisine: {
    fontSize: 9,
    color: COLORS.muted,
    marginTop: 1,
  },
  tiffinMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 3,
    justifyContent: 'space-between',
  },
  tiffinRating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  tiffinRatingText: {
    fontSize: 9,
    fontWeight: '600',
    color: COLORS.text,
  },
  tiffinDistance: {
    fontSize: 9,
    color: COLORS.muted,
  },
  tiffinEmpty: {
    paddingVertical: 16,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  tiffinEmptyText: {
    marginLeft: 6,
    color: COLORS.muted,
    fontSize: 12,
  },
  tiffinLoadingContainer: {
    paddingVertical: 16,
    alignItems: 'center',
  },
});
