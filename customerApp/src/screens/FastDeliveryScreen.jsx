import React, { useState } from 'react';
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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import Ionicons from '@react-native-vector-icons/ionicons';
import { useAppUI } from '../context/AppUIContext';

const { width } = Dimensions.get('window');

const COLORS = {
  primary: '#FF5A1F',
  primaryLight: '#FF8A5C',
  white: '#FFFFFF',
  title: '#1A1A2E',
  text: '#2D2D3F',
  muted: '#8E8EA0',
  lightGray: '#F5F6FA',
  border: '#EAEAEF',
  shadow: 'rgba(0,0,0,0.06)',
};

// ─── Dummy Data: Fast Delivery Categories & Restaurants ────
const fastCategories = [
  {
    id: 'fc1',
    name: 'Burgers',
    image:
      'https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=200&q=80',
  },
  {
    id: 'fc2',
    name: 'Pizza',
    image:
      'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=200&q=80',
  },
  {
    id: 'fc3',
    name: 'Chinese',
    image:
      'https://images.unsplash.com/photo-1553621042-f6e147ad7544?auto=format&fit=crop&w=200&q=80',
  },
  {
    id: 'fc4',
    name: 'Biryani',
    image:
      'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=200&q=80',
  },
  {
    id: 'fc5',
    name: 'Shakes',
    image:
      'https://images.unsplash.com/photo-1551024506-0bccd828d307?auto=format&fit=crop&w=200&q=80',
  },
];

const fastRestaurants = [
  // Burgers
  {
    id: 'r1',
    name: 'Burger King',
    time: '10 min',
    rating: 4.5,
    image:
      'https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=200&q=80',
    categoryId: 'fc1',
  },
  {
    id: 'r2',
    name: "McDonald's",
    time: '12 min',
    rating: 4.3,
    image:
      'https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=200&q=80',
    categoryId: 'fc1',
  },
  // Pizza
  {
    id: 'r3',
    name: 'Pizza Hut',
    time: '20 min',
    rating: 4.2,
    image:
      'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=200&q=80',
    categoryId: 'fc2',
  },
  {
    id: 'r4',
    name: "Domino's",
    time: '18 min',
    rating: 4.4,
    image:
      'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=200&q=80',
    categoryId: 'fc2',
  },
  // Chinese
  {
    id: 'r5',
    name: 'Chinese Wok',
    time: '15 min',
    rating: 4.1,
    image:
      'https://images.unsplash.com/photo-1553621042-f6e147ad7544?auto=format&fit=crop&w=200&q=80',
    categoryId: 'fc3',
  },
  {
    id: 'r6',
    name: 'Noodle House',
    time: '14 min',
    rating: 4.2,
    image:
      'https://images.unsplash.com/photo-1553621042-f6e147ad7544?auto=format&fit=crop&w=200&q=80',
    categoryId: 'fc3',
  },
  // Biryani
  {
    id: 'r7',
    name: 'Biryani House',
    time: '15 min',
    rating: 4.5,
    image:
      'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=200&q=80',
    categoryId: 'fc4',
  },
  {
    id: 'r8',
    name: 'Hyderabadi Biryani',
    time: '18 min',
    rating: 4.3,
    image:
      'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=200&q=80',
    categoryId: 'fc4',
  },
  // Shakes
  {
    id: 'r9',
    name: 'Shake Point',
    time: '5 min',
    rating: 4.8,
    image:
      'https://images.unsplash.com/photo-1551024506-0bccd828d307?auto=format&fit=crop&w=200&q=80',
    categoryId: 'fc5',
  },
  {
    id: 'r10',
    name: 'Chocolate Shake',
    time: '8 min',
    rating: 4.6,
    image:
      'https://images.unsplash.com/photo-1551024506-0bccd828d307?auto=format&fit=crop&w=200&q=80',
    categoryId: 'fc5',
  },
];

export default function FastDeliveryScreen() {
  const navigation = useNavigation();
  const { addToCart, decreaseCartItem, removeFromCart, cartItems } = useAppUI();
  const [selectedCategoryId, setSelectedCategoryId] = useState(
    fastCategories[0]?.id || null,
  );
  const [searchQuery, setSearchQuery] = useState('');

  const getQuantity = itemId => {
    const cartItem = cartItems.find(item => item.id === itemId);
    return cartItem?.quantity || 0;
  };

  const filteredItems = fastRestaurants.filter(
    item =>
      item.categoryId === selectedCategoryId &&
      item.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const renderCategory = ({ item }) => {
    const isActive = item.id === selectedCategoryId;
    return (
      <Pressable
        style={({ pressed }) => [
          styles.categoryItem,
          pressed && styles.categoryItemPressed,
        ]}
        onPress={() => setSelectedCategoryId(item.id)}
      >
        <View
          style={[styles.circleWrapper, isActive && styles.circleWrapperActive]}
        >
          <Image source={{ uri: item.image }} style={styles.circleImage} />
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

  const renderItem = ({ item }) => {
    const quantity = getQuantity(item.id);
    const handleAdd = () => addToCart(item);
    const handleDecrease = () => {
      if (quantity <= 1) removeFromCart(item.id);
      else decreaseCartItem(item.id);
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
          <Image source={{ uri: item.image }} style={styles.dishImage} />
          <View style={styles.dishBadge}>
            <Text style={styles.dishBadgeText}>⭐</Text>
          </View>
        </View>
        <View style={styles.dishInfo}>
          <Text style={styles.dishName} numberOfLines={1}>
            {item.name}
          </Text>
          <View style={styles.dishMeta}>
            <Text style={styles.dishPrice}>₹{item.price || '—'}</Text>
            <View style={styles.rating}>
              <Ionicons name="star" size={12} color="#FFB800" />
              <Text style={styles.ratingText}>{item.rating}</Text>
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

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color={COLORS.title} />
        </Pressable>

        <View style={styles.searchWrapper}>
          <Ionicons name="search-outline" size={18} color={COLORS.muted} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search..."
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

      <View style={styles.mainContainer}>
        <View style={styles.leftPanel}>
          <FlatList
            data={fastCategories}
            keyExtractor={item => item.id}
            renderItem={renderCategory}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.categoryList}
          />
        </View>
        <View style={styles.rightPanel}>
          <View style={styles.dishesHeader}>
            <Text style={styles.dishesTitle}>
              {fastCategories.find(c => c.id === selectedCategoryId)?.name ||
                'All'}
            </Text>
            <Text style={styles.dishesCount}>{filteredItems.length} items</Text>
          </View>
          <FlatList
            data={filteredItems}
            keyExtractor={item => item.id}
            renderItem={renderItem}
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
                <Text style={styles.emptyText}>No items found</Text>
              </View>
            }
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  // Reuse same styles as PopularFoodsScreen (copy all styles from that file)
  // To avoid duplication, you can import or just copy the same StyleSheet object.
  // For brevity, we'll assume they are identical – paste the same styles here.
  // (I'll include them for completeness, but you can reuse.)
  safeArea: { flex: 1, backgroundColor: COLORS.white },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    gap: 8,
  },
  backBtn: { padding: 6 },
  headerTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: COLORS.title,
    flex: 0.3,
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
  categoryList: { alignItems: 'center', paddingHorizontal: 8, gap: 8 },
  categoryItem: { alignItems: 'center', width: '100%', paddingVertical: 4 },
  categoryItemPressed: { opacity: 0.7 },
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
  circleImage: { width: 48, height: 48, borderRadius: 24 },
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
  categoryLabelActive: { color: COLORS.primary, fontWeight: '700' },
  rightPanel: { flex: 1, padding: 12 },
  dishesHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  dishesTitle: { fontSize: 16, fontWeight: '700', color: COLORS.title },
  dishesCount: { fontSize: 12, fontWeight: '500', color: COLORS.muted },
  columnWrapper: { justifyContent: 'space-between', marginBottom: 12 },
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
  dishCardPressed: { opacity: 0.8, transform: [{ scale: 0.97 }] },
  dishImageWrapper: {
    width: '100%',
    height: 90,
    backgroundColor: COLORS.lightGray,
    position: 'relative',
  },
  dishImage: { width: '100%', height: '100%', resizeMode: 'cover' },
  dishBadge: {
    position: 'absolute',
    top: 6,
    left: 6,
    backgroundColor: 'rgba(255,90,31,0.85)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  dishBadgeText: { fontSize: 10, fontWeight: '700', color: COLORS.white },
  dishInfo: { padding: 10, position: 'relative' },
  dishName: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.title,
    marginBottom: 4,
  },
  dishPrice: { fontSize: 13, fontWeight: '700', color: COLORS.primary },
  dishMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  rating: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  ratingText: { fontSize: 10, fontWeight: '600', color: COLORS.text },
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
