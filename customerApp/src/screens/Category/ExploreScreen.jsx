// screens/ExploreScreen.js
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  Pressable,
  ActivityIndicator,
  Animated,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from '@react-native-vector-icons/ionicons';
import { getExploreCategories } from '../../api/customerApi';
// import { BASE_URL } from '../../config'; // Adjust path to your config
// config.js
export const BASE_URL = 'https://myfoodmitra-ecosystem.onrender.com'; // Replace with your actual API base URL

const { width } = Dimensions.get('window');

const COLORS = {
  primary: '#ff5a1f',
  primaryLight: '#fff0e8',
  title: '#171717',
  text: '#374151',
  muted: '#8b929f',
  border: '#eee5df',
  white: '#ffffff',
  cardBg: '#faf8f7',
  shadow: 'rgba(0,0,0,0.05)',
  placeholder: '#e5e5e5',
};

// ─── Helper: Build full image URL ──────────────────────────
const getFullImageUrl = path => {
  if (!path) return null;
  if (path.startsWith('http')) return path;
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;
  return `${BASE_URL}/${cleanPath}`;
};

// ─── Placeholder image component ───────────────────────────
const PlaceholderImage = () => (
  <View style={[styles.contentImage, styles.placeholderImage]}>
    <Ionicons name="restaurant-outline" size={28} color={COLORS.muted} />
  </View>
);

// ─── Main Component ──────────────────────────────────────────
export default function ExploreScreen({ navigation }) {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState(null);
  const [selectedItems, setSelectedItems] = useState([]);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    fetchExploreData();
  }, []);

  // ─── Fetch data ────────────────────────────────────────────
  const fetchExploreData = async () => {
    try {
      setLoading(true);
      const response = await getExploreCategories();
      if (response.success) {
        const data = response.data || [];
        setCategories(data);
        if (data.length > 0) {
          selectCategory(data[0]);
        }
      } else {
        setError('Failed to load explore data');
      }
    } catch (err) {
      console.error('Explore fetch error:', err);
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // ─── Select category ───────────────────────────────────────
  const selectCategory = category => {
    setSelectedCategoryId(category._id);
    const vendors = category.vendors || [];
    const items = category.items || [];
    const combined = [...vendors, ...items];
    setSelectedItems(combined);

    fadeAnim.setValue(0);
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 250,
      useNativeDriver: true,
    }).start();
  };

  // ─── Render category item (left side – circular) ─────────
  const renderCategoryItem = ({ item }) => {
    const isSelected = item._id === selectedCategoryId;
    return (
      <Pressable
        style={({ pressed }) => [
          styles.categoryItem,
          pressed && styles.categoryItemPressed,
        ]}
        onPress={() => selectCategory(item)}
      >
        <View
          style={[
            styles.categoryIconCircle,
            isSelected && styles.categoryIconCircleSelected,
          ]}
        >
          <Text style={styles.categoryItemIcon}>{item.icon}</Text>
        </View>
        <Text
          style={[
            styles.categoryItemName,
            isSelected && styles.categoryItemNameSelected,
          ]}
          numberOfLines={2}
        >
          {item.title}
        </Text>
      </Pressable>
    );
  };

  // ─── Render content card (right side) ─────────────────────
  const renderContentCard = ({ item }) => {
    const isVendor = !!item.businessName;
    const imageUrl = getFullImageUrl(isVendor ? item.profileImage : item.image);
    const name = isVendor ? item.businessName : item.name;
    const subtitle = isVendor
      ? item.businessType || 'Restaurant'
      : item.vendorId?.businessName || '';

    const onPress = () => {
      if (isVendor) {
        navigation.navigate('VendorDetail', { vendorId: item._id });
      } else {
        const vendorId = item.vendorId?._id || item.vendorId;
        navigation.navigate('ItemDetail', { item, vendorId });
      }
    };

    return (
      <Pressable
        style={({ pressed }) => [
          styles.contentCard,
          pressed && styles.contentCardPressed,
        ]}
        onPress={onPress}
      >
        {imageUrl ? (
          <Image
            source={{ uri: imageUrl }}
            style={styles.contentImage}
            onError={() => {}}
          />
        ) : (
          <PlaceholderImage />
        )}
        <View style={styles.contentTextContainer}>
          <Text style={styles.contentName} numberOfLines={1}>
            {name || 'Unnamed'}
          </Text>
          <Text style={styles.contentSubtitle} numberOfLines={1}>
            {subtitle || ' '}
          </Text>
        </View>
        <Ionicons name="chevron-forward" size={16} color={COLORS.muted} />
      </Pressable>
    );
  };

  // ─── Loading / Error / Empty states ──────────────────────
  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator
          size="large"
          color={COLORS.primary}
          style={{ flex: 1 }}
        />
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Ionicons
            name="alert-circle-outline"
            size={48}
            color={COLORS.muted}
          />
          <Text style={styles.errorText}>{error}</Text>
          <Pressable onPress={fetchExploreData} style={styles.retryButton}>
            <Text style={styles.retryText}>Retry</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  if (categories.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>📭</Text>
          <Text style={styles.emptyTitle}>No categories found</Text>
          <Text style={styles.emptySubtext}>
            Check back later for new explore categories.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  // ─── Main Render ──────────────────────────────────────────
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Explore</Text>
        <Pressable
          onPress={() => navigation.goBack()}
          style={styles.closeButton}
        >
          <Ionicons name="close" size={24} color={COLORS.title} />
        </Pressable>
      </View>

      <View style={styles.splitContainer}>
        {/* Left: Categories as circular icons */}
        <View style={styles.categoriesList}>
          <FlatList
            data={categories}
            keyExtractor={item => item._id}
            renderItem={renderCategoryItem}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.categoriesListContent}
          />
        </View>

        {/* Right: Content for selected category */}
        <View style={styles.contentList}>
          {selectedItems.length === 0 ? (
            <View style={styles.emptyContent}>
              <Text style={styles.emptyContentText}>
                No items in this category
              </Text>
            </View>
          ) : (
            <Animated.View style={{ flex: 1, opacity: fadeAnim }}>
              <FlatList
                data={selectedItems}
                keyExtractor={(item, index) => item._id || index.toString()}
                renderItem={renderContentCard}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.contentListContent}
              />
            </Animated.View>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
}

// ─── Styles ─────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.white },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerTitle: { fontSize: 20, fontWeight: '900', color: COLORS.title },
  closeButton: { padding: 4 },
  splitContainer: { flex: 1, flexDirection: 'row' },

  // ─── Left side (circular categories) ─────────────────────
  categoriesList: {
    width: width * 0.35,
    backgroundColor: COLORS.cardBg,
    borderRightWidth: 1,
    borderRightColor: COLORS.border,
  },
  categoriesListContent: {
    paddingVertical: 8,
    alignItems: 'center', // Center items horizontally
  },
  categoryItem: {
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 4,
    width: '100%',
  },
  categoryItemPressed: { opacity: 0.7 },
  categoryIconCircle: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  categoryIconCircleSelected: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primaryLight,
  },
  categoryItemIcon: {
    fontSize: 28,
  },
  categoryItemName: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.text,
    textAlign: 'center',
    paddingHorizontal: 4,
  },
  categoryItemNameSelected: {
    color: COLORS.primary,
    fontWeight: '700',
  },

  // ─── Right side ─────────────────────────────────────────
  contentList: { flex: 1, backgroundColor: COLORS.white },
  contentListContent: {
    paddingHorizontal: 14,
    paddingTop: 10,
    paddingBottom: 20,
  },
  contentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  contentCardPressed: { opacity: 0.9, transform: [{ scale: 0.98 }] },
  contentImage: {
    width: 56,
    height: 56,
    borderRadius: 28,
    marginRight: 12,
    backgroundColor: '#f0ece8',
  },
  placeholderImage: {
    backgroundColor: '#f0ece8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  contentTextContainer: { flex: 1, marginRight: 8 },
  contentName: { fontSize: 15, fontWeight: '700', color: COLORS.title },
  contentSubtitle: { fontSize: 12, color: COLORS.muted, marginTop: 2 },

  // ─── Empty / Error states ──────────────────────────────
  emptyContent: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  emptyContentText: { color: COLORS.muted, fontSize: 14 },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 30,
  },
  errorText: {
    fontSize: 16,
    color: COLORS.text,
    marginTop: 12,
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 16,
    paddingHorizontal: 24,
    paddingVertical: 10,
    backgroundColor: COLORS.primary,
    borderRadius: 12,
  },
  retryText: { color: COLORS.white, fontWeight: '700' },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 30,
  },
  emptyIcon: { fontSize: 48, marginBottom: 12 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: COLORS.title },
  emptySubtext: {
    fontSize: 14,
    color: COLORS.muted,
    textAlign: 'center',
    marginTop: 6,
  },
});
