// screens/CategoryItemsScreen.js
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  Pressable,
  StyleSheet,
  StatusBar,
  Dimensions,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import Ionicons from '@react-native-vector-icons/ionicons';
import LinearGradient from 'react-native-linear-gradient';
import { useAppUI } from '../../context/AppUIContext';
import { getDishesByCategory } from '../../api/customerApi';
import { buildImageUrl } from '../../utils/imageUtils';

const { width } = Dimensions.get('window');
// 2-column grid with better spacing
const CARD_WIDTH = (width - 16 * 2 - 12 * 2) / 2; // 16px side padding, 12px gap between cards

const COLORS = {
  primary: '#FF5A1F',
  primaryLight: '#FF8A5C',
  primaryDark: '#E04A1A',
  white: '#FFFFFF',
  background: '#F8F9FC',
  title: '#1A1A2E',
  text: '#2D2D3F',
  muted: '#8E8EA0',
  border: '#EAEAEF',
  soft: '#FFF0EA',
  success: '#22C55E',
  shadow: 'rgba(0,0,0,0.08)',
  cardBg: '#FFFFFF',
};

export default function CategoryItemsScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { categoryId, categoryName } = route.params || {};
  const { addToCart, cartItems } = useAppUI();

  const [dishes, setDishes] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (categoryId) {
      fetchDishes();
    }
  }, [categoryId]);

  const fetchDishes = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await getDishesByCategory(categoryId);
      if (res.success) {
        setDishes(res.data);
      } else {
        setError('Failed to load dishes');
      }
    } catch (err) {
      console.error(err);
      setError('Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const toggleFavorite = itemId => {
    setFavorites(prev =>
      prev.includes(itemId)
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId],
    );
  };

  const handleAddToCart = item => {
    addToCart(item);
  };

  const renderItem = ({ item }) => {
    const isFavorite = favorites.includes(item._id);
    const inCart = cartItems.some(c => c.id === item._id);
    const imageUrl = item.image ? buildImageUrl(item.image) : null;

    return (
      <Pressable
        style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
        onPress={() => navigation.navigate('ItemDetail', { item })}
      >
        <View style={styles.imageWrapper}>
          {imageUrl ? (
            <Image source={{ uri: imageUrl }} style={styles.image} />
          ) : (
            <View style={[styles.image, styles.imagePlaceholder]}>
              <Text style={styles.placeholderIcon}>🍽️</Text>
            </View>
          )}
          {/* Gradient overlay for better text contrast */}
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.3)']}
            style={styles.imageOverlay}
          />
          <TouchableOpacity
            style={styles.favoriteBtn}
            onPress={() => toggleFavorite(item._id)}
            activeOpacity={0.7}
          >
            <Ionicons
              name={isFavorite ? 'heart' : 'heart-outline'}
              size={16}
              color={isFavorite ? '#EF4444' : '#FFFFFF'}
            />
          </TouchableOpacity>
          {item.offer && (
            <View style={styles.offerBadge}>
              <Text style={styles.offerText}>{item.offer}</Text>
            </View>
          )}
          {/* Rating pill */}
          {item.rating > 0 && (
            <View style={styles.ratingPill}>
              <Ionicons name="star" size={10} color="#F59E0B" />
              <Text style={styles.ratingPillText}>
                {item.rating.toFixed(1)}
              </Text>
            </View>
          )}
        </View>

        <View style={styles.info}>
          <Text style={styles.name} numberOfLines={1}>
            {item.name}
          </Text>
          <Text style={styles.description} numberOfLines={1}>
            {item.description || 'Delicious dish'}
          </Text>
          <View style={styles.bottomRow}>
            <Text style={styles.price}>₹{item.price}</Text>
            {inCart ? (
              <View style={styles.inCart}>
                <Ionicons name="checkmark" size={14} color={COLORS.success} />
              </View>
            ) : (
              <TouchableOpacity
                style={styles.addBtn}
                onPress={() => handleAddToCart(item)}
                activeOpacity={0.7}
              >
                <Ionicons name="add" size={18} color={COLORS.white} />
              </TouchableOpacity>
            )}
          </View>
        </View>
      </Pressable>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <Pressable onPress={() => navigation.goBack()} hitSlop={12}>
            <Ionicons name="arrow-back" size={24} color={COLORS.title} />
          </Pressable>
          <Text style={styles.headerTitle}>{categoryName}</Text>
          <View style={{ width: 24 }} />
        </View>
        <ActivityIndicator
          size="large"
          color={COLORS.primary}
          style={styles.loader}
        />
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <Pressable onPress={() => navigation.goBack()} hitSlop={12}>
            <Ionicons name="arrow-back" size={24} color={COLORS.title} />
          </Pressable>
          <Text style={styles.headerTitle}>{categoryName}</Text>
          <View style={{ width: 24 }} />
        </View>
        <View style={styles.emptyContainer}>
          <Ionicons
            name="alert-circle-outline"
            size={48}
            color={COLORS.muted}
          />
          <Text style={styles.emptyText}>{error}</Text>
          <TouchableOpacity onPress={fetchDishes} style={styles.retryBtn}>
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />

      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} hitSlop={12}>
          <Ionicons name="arrow-back" size={24} color={COLORS.title} />
        </Pressable>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {categoryName}
        </Text>
        <View style={{ width: 24 }} />
      </View>

      <FlatList
        data={dishes}
        keyExtractor={item => item._id}
        renderItem={renderItem}
        numColumns={2}
        columnWrapperStyle={styles.columnWrapper}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons
              name="restaurant-outline"
              size={48}
              color={COLORS.muted}
            />
            <Text style={styles.emptyText}>No dishes in this category</Text>
          </View>
        }
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.title,
    flex: 1,
    textAlign: 'center',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingBottom: 30,
  },
  columnWrapper: {
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  card: {
    width: CARD_WIDTH,
    backgroundColor: COLORS.cardBg,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 3,
  },
  cardPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.97 }],
  },
  imageWrapper: {
    width: '100%',
    height: 130,
    position: 'relative',
    backgroundColor: '#F3F4F6',
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  imagePlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0ece8',
  },
  placeholderIcon: {
    fontSize: 32,
  },
  imageOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '40%',
  },
  favoriteBtn: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: 20,
    padding: 6,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  offerBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: '#EF4444',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  offerText: {
    color: COLORS.white,
    fontSize: 8,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  ratingPill: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  ratingPillText: {
    color: COLORS.white,
    fontSize: 10,
    fontWeight: '600',
    marginLeft: 3,
  },
  info: {
    padding: 10,
    paddingBottom: 12,
  },
  name: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.title,
    marginBottom: 2,
  },
  description: {
    fontSize: 11,
    color: COLORS.muted,
    marginBottom: 6,
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  price: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.primary,
  },
  addBtn: {
    backgroundColor: COLORS.primary,
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  inCart: {
    backgroundColor: '#ECFDF5',
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#D1FAE5',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 80,
  },
  emptyText: {
    marginTop: 12,
    fontSize: 15,
    color: COLORS.muted,
    fontWeight: '500',
  },
  retryBtn: {
    marginTop: 16,
    paddingHorizontal: 24,
    paddingVertical: 10,
    backgroundColor: COLORS.primary,
    borderRadius: 10,
  },
  retryText: {
    color: COLORS.white,
    fontWeight: '700',
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
