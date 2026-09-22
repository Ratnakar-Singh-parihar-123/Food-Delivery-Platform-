// screens/SeeAllScreen.js
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  Pressable,
  StyleSheet,
  StatusBar,
  TextInput,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import Ionicons from '@react-native-vector-icons/ionicons';
import { useAppUI } from '../../context/AppUIContext';
import { getFoodCategories, getDishesByCategory } from '../../api/customerApi';
import { buildImageUrl } from '../../utils/imageUtils'; // reuse your helper

const { width } = Dimensions.get('window');

const COLORS = {
  primary: '#FF5A1F',
  primaryLight: '#FF8A5C',
  primaryDark: '#E04A1A',
  white: '#FFFFFF',
  black: '#000000',
  title: '#1A1A2E',
  text: '#2D2D3F',
  muted: '#8E8EA0',
  lightGray: '#F5F6FA',
  border: '#EAEAEF',
  shadow: 'rgba(0,0,0,0.06)',
};

export default function SeeAllScreen() {
  const navigation = useNavigation();
  const { addToCart, decreaseCartItem, removeFromCart, cartItems } = useAppUI();

  const [categories, setCategories] = useState([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState(null);
  const [dishes, setDishes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // ─── Fetch categories ──────────────────────────────────
  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await getFoodCategories();
      if (res.success && res.data.length > 0) {
        setCategories(res.data);
        setSelectedCategoryId(res.data[0]._id);
      }
    } catch (error) {
      console.warn('Failed to fetch categories:', error);
    } finally {
      setLoading(false);
    }
  };

  // ─── Fetch dishes when category changes ───────────────
  useEffect(() => {
    if (selectedCategoryId) {
      fetchDishes(selectedCategoryId);
    }
  }, [selectedCategoryId]);

  const fetchDishes = async categoryId => {
    try {
      const res = await getDishesByCategory(categoryId);
      if (res.success) {
        setDishes(res.data);
      }
    } catch (error) {
      console.warn('Failed to fetch dishes:', error);
    }
  };

  // ─── Filter by search ──────────────────────────────────
  const filteredDishes = dishes.filter(d =>
    d.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  // ─── Cart helpers ──────────────────────────────────────
  const getQuantity = itemId => {
    const cartItem = cartItems.find(item => item.id === itemId);
    return cartItem?.quantity || 0;
  };

  // ─── Render category (left panel) ─────────────────────
  const renderCategoryItem = ({ item }) => {
    const isActive = item._id === selectedCategoryId;
    return (
      <Pressable
        style={({ pressed }) => [
          styles.categoryItem,
          pressed && styles.categoryItemPressed,
        ]}
        onPress={() => setSelectedCategoryId(item._id)}
      >
        <View
          style={[styles.circleWrapper, isActive && styles.circleWrapperActive]}
        >
          {item.image ? (
            <Image
              source={{ uri: buildImageUrl(item.image) }}
              style={styles.circleImage}
            />
          ) : (
            <View
              style={[
                styles.circleImage,
                {
                  backgroundColor: '#f0ece8',
                  justifyContent: 'center',
                  alignItems: 'center',
                },
              ]}
            >
              <Text style={{ fontSize: 24 }}>{item.icon || '🍽️'}</Text>
            </View>
          )}
          {isActive && <View style={styles.activeDot} />}
        </View>
        <Text
          style={[styles.categoryLabel, isActive && styles.categoryLabelActive]}
          numberOfLines={1}
        >
          {item.name}
        </Text>
      </Pressable>
    );
  };

  // ─── Render dish (right panel) ────────────────────────
  const renderDishItem = ({ item }) => {
    const quantity = getQuantity(item._id);

    const handleAdd = () => addToCart(item);
    const handleDecrease = () => {
      if (quantity <= 1) removeFromCart(item._id);
      else decreaseCartItem(item._id);
    };

    return (
      <Pressable
        style={({ pressed }) => [
          styles.dishCard,
          pressed && styles.dishCardPressed,
        ]}
        onPress={() => navigation.navigate('ItemDetail', { item })}
      >
        <View style={styles.dishImageWrapper}>
          {item.image ? (
            <Image
              source={{ uri: buildImageUrl(item.image) }}
              style={styles.dishImage}
            />
          ) : (
            <View
              style={[
                styles.dishImage,
                {
                  backgroundColor: '#f0ece8',
                  justifyContent: 'center',
                  alignItems: 'center',
                },
              ]}
            >
              <Text style={{ fontSize: 20 }}>🍽️</Text>
            </View>
          )}
          <View style={styles.dishBadge}>
            <Text style={styles.dishBadgeText}>⭐</Text>
          </View>
        </View>
        <View style={styles.dishInfo}>
          <Text style={styles.dishName} numberOfLines={1}>
            {item.name}
          </Text>
          <View style={styles.dishMeta}>
            <Text style={styles.dishPrice}>₹{item.price}</Text>
            <View style={styles.rating}>
              <Ionicons name="star" size={12} color="#FFB800" />
              <Text style={styles.ratingText}>4.5</Text>
            </View>
          </View>
          {quantity === 0 ? (
            <Pressable onPress={handleAdd} style={styles.addBtn}>
              <Ionicons name="add" size={16} color={COLORS.white} />
            </Pressable>
          ) : (
            <View style={styles.quantityContainer}>
              <Pressable onPress={handleDecrease} style={styles.quantityBtn}>
                <Ionicons name="remove" size={14} color={COLORS.primary} />
              </Pressable>
              <Text style={styles.quantityText}>{quantity}</Text>
              <Pressable onPress={handleAdd} style={styles.quantityBtn}>
                <Ionicons name="add" size={14} color={COLORS.primary} />
              </Pressable>
            </View>
          )}
        </View>
      </Pressable>
    );
  };

  // ─── Loading state ─────────────────────────────────────
  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <ActivityIndicator
          size="large"
          color={COLORS.primary}
          style={{ flex: 1 }}
        />
      </SafeAreaView>
    );
  }

  // ─── Main render ──────────────────────────────────────
  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />

      {/* Header with Search */}
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color={COLORS.title} />
        </Pressable>
        <View style={styles.searchWrapper}>
          <Ionicons name="search-outline" size={18} color={COLORS.muted} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search dishes..."
            placeholderTextColor={COLORS.muted}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <Pressable onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={18} color={COLORS.muted} />
            </Pressable>
          )}
        </View>
      </View>

      {/* Main Split View */}
      <View style={styles.mainContainer}>
        {/* Left: Categories */}
        <View style={styles.leftPanel}>
          <FlatList
            data={categories}
            keyExtractor={item => item._id}
            renderItem={renderCategoryItem}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.categoryList}
          />
        </View>

        {/* Right: Dishes Grid */}
        <View style={styles.rightPanel}>
          <FlatList
            data={filteredDishes}
            keyExtractor={item => item._id}
            renderItem={renderDishItem}
            numColumns={2}
            columnWrapperStyle={styles.columnWrapper}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Ionicons
                  name="search-outline"
                  size={48}
                  color={COLORS.muted}
                />
                <Text style={styles.emptyText}>No matching dishes</Text>
              </View>
            }
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

// ─── Styles (exactly as your original) ──────────────────
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    gap: 12,
  },
  backBtn: {
    padding: 6,
  },
  searchWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.lightGray,
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 40,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: COLORS.title,
    paddingVertical: 6,
    marginLeft: 6,
    fontWeight: '500',
  },
  mainContainer: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: COLORS.lightGray,
  },
  leftPanel: {
    width: '30%',
    backgroundColor: COLORS.white,
    borderRightWidth: 1,
    borderRightColor: COLORS.border,
    paddingVertical: 8,
  },
  categoryList: {
    alignItems: 'center',
    paddingHorizontal: 8,
    gap: 8,
  },
  categoryItem: {
    alignItems: 'center',
    width: '100%',
    paddingVertical: 4,
  },
  categoryItemPressed: {
    opacity: 0.7,
  },
  circleWrapper: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: COLORS.lightGray,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
    marginBottom: 4,
    position: 'relative',
  },
  circleWrapperActive: {
    borderColor: COLORS.primary,
    backgroundColor: '#FFF0EA',
  },
  circleImage: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  activeDot: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: COLORS.primary,
    borderWidth: 2,
    borderColor: COLORS.white,
  },
  categoryLabel: {
    fontSize: 11,
    fontWeight: '500',
    color: COLORS.text,
    textAlign: 'center',
    width: '100%',
  },
  categoryLabelActive: {
    color: COLORS.primary,
    fontWeight: '700',
  },
  rightPanel: {
    flex: 1,
    padding: 12,
  },
  dishesHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  dishesTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.title,
  },
  dishesCount: {
    fontSize: 12,
    fontWeight: '500',
    color: COLORS.muted,
  },
  columnWrapper: {
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  dishCard: {
    width: (width * 0.7 - 36) / 2,
    backgroundColor: COLORS.white,
    borderRadius: 14,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  dishCardPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.97 }],
  },
  dishImageWrapper: {
    width: '100%',
    height: 90,
    backgroundColor: COLORS.lightGray,
    position: 'relative',
  },
  dishImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  dishBadge: {
    position: 'absolute',
    top: 6,
    left: 6,
    backgroundColor: 'rgba(255,90,31,0.85)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  dishBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.white,
  },
  dishInfo: {
    padding: 10,
    position: 'relative',
  },
  dishName: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.title,
    marginBottom: 4,
  },
  dishMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dishPrice: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.primary,
  },
  rating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  ratingText: {
    fontSize: 10,
    fontWeight: '600',
    color: COLORS.text,
  },
  addBtn: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 3,
  },
  quantityContainer: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF7F2',
    borderRadius: 13,
    borderWidth: 1,
    borderColor: '#FFD3BF',
    height: 26,
  },
  quantityBtn: {
    width: 26,
    height: 26,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quantityText: {
    minWidth: 20,
    textAlign: 'center',
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.primary,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginTop: 10,
  },
});
