import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  Image,
  Pressable,
  StyleSheet,
  StatusBar,
  ScrollView,
  Dimensions,
  Animated,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from '@react-native-vector-icons/ionicons';
import LinearGradient from 'react-native-linear-gradient';
import { useAppUI } from '../../context/AppUIContext';

const { width, height } = Dimensions.get('window');
const HEADER_HEIGHT = height * 0.42;

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
};

const FALLBACK_IMAGE =
  'https://via.placeholder.com/400x300/ff5a1f/ffffff?text=Item';

// ─── Helper: Build full image URL ──────────────────────────
const buildImageUrl = imagePath => {
  if (!imagePath) return FALLBACK_IMAGE;
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }
  const baseUrl = 'https://myfoodmitra-ecosystem.onrender.com'; // change to your server
  const path = imagePath.startsWith('/') ? imagePath : `/${imagePath}`;
  return `${baseUrl}${path}`;
};

export default function ItemDetailScreen({ route, navigation }) {
  const { item } = route.params || {};
  const { addToCart, cartItems } = useAppUI();

  const [quantity, setQuantity] = useState(1);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isAdded, setIsAdded] = useState(false);

  const scaleAnim = useRef(new Animated.Value(1)).current;

  // ─── Fallbacks ──────────────────────────────────────────────
  const itemId = item?.id || item?._id;
  const itemName = item?.name || 'Item';
  const itemPrice = item?.price || 0;
  const itemImage = buildImageUrl(item?.image);
  const itemRating = item?.rating || 0;
  const itemDescription =
    item?.description || 'A delicious dish prepared with fresh ingredients.';
  const vendorId = item?.vendorId || item?.vendor?._id;

  const increaseQuantity = () => setQuantity(prev => prev + 1);
  const decreaseQuantity = () => {
    if (quantity > 1) setQuantity(prev => prev - 1);
  };

  const totalPrice = itemPrice * quantity;

  // ─── Add to Cart ──────────────────────────────────────────
  const handleAddToCart = () => {
    if (!itemId) {
      Alert.alert('Error', 'Invalid item.');
      return;
    }
    for (let i = 0; i < quantity; i++) {
      addToCart({ ...item, id: itemId });
    }
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.92,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();

    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 1500);
  };

  const handleBookNow = () => {
    if (!vendorId) {
      Alert.alert('Error', 'Vendor information missing. Cannot proceed.');
      return;
    }
    navigation.navigate('SelectAddress', {
      item: {
        ...item,
        id: itemId,
        quantity,
        totalPrice,
        vendorId,
      },
      directOrder: true,
    });
  };
  // ... rest unchanged

  const renderStars = rating => {
    const fullStars = Math.floor(rating);
    const halfStar = rating % 1 >= 0.5;
    const stars = [];
    for (let i = 0; i < fullStars; i++) {
      stars.push(<Ionicons key={i} name="star" size={14} color="#F59E0B" />);
    }
    if (halfStar) {
      stars.push(
        <Ionicons key="half" name="star-half" size={14} color="#F59E0B" />,
      );
    }
    return stars;
  };

  if (!item) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color={COLORS.title} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Item Details</Text>
          <View style={{ width: 24 }} />
        </View>
        <View style={styles.emptyContainer}>
          <Ionicons name="fast-food-outline" size={48} color={COLORS.muted} />
          <Text style={styles.emptyText}>Item not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar
        barStyle="light-content"
        backgroundColor="transparent"
        translucent
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContainer}
      >
        {/* Image Section */}
        <View style={styles.imageWrapper}>
          <Image source={{ uri: itemImage }} style={styles.image} />
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.6)']}
            style={styles.gradientOverlay}
          />
          {/* Header Buttons */}
          <View style={styles.headerButtons}>
            <TouchableOpacity
              style={styles.iconButton}
              onPress={() => navigation.goBack()}
              activeOpacity={0.7}
            >
              <Ionicons name="arrow-back" size={24} color={COLORS.white} />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.iconButton}
              onPress={() => setIsFavorite(!isFavorite)}
              activeOpacity={0.7}
            >
              <Ionicons
                name={isFavorite ? 'heart' : 'heart-outline'}
                size={24}
                color={isFavorite ? '#EF4444' : COLORS.white}
              />
            </TouchableOpacity>
          </View>
          {/* Badges */}
          <View style={styles.badgeContainer}>
            {itemRating > 0 && (
              <View style={styles.ratingBadge}>
                {renderStars(itemRating)}
                <Text style={styles.ratingText}>{itemRating.toFixed(1)}</Text>
              </View>
            )}
            {item.offer && (
              <View style={styles.offerBadge}>
                <Text style={styles.offerText}>{item.offer}</Text>
              </View>
            )}
          </View>
        </View>

        {/* Content Card */}
        <View style={styles.contentCard}>
          <View style={styles.titleRow}>
            <View style={styles.nameContainer}>
              <Text style={styles.restaurantName}>
                {item.restaurant || 'Popular Dish'}
              </Text>
              <Text style={styles.dishName}>{itemName}</Text>
            </View>
            <Text style={styles.price}>₹{itemPrice}</Text>
          </View>

          <View style={styles.divider} />

          <Text style={styles.sectionLabel}>Description</Text>
          <Text style={styles.description}>{itemDescription}</Text>

          <View style={styles.divider} />

          {/* Quantity Selector */}
          <View style={styles.quantitySection}>
            <Text style={styles.sectionLabel}>Quantity</Text>
            <View style={styles.quantitySelector}>
              <TouchableOpacity
                style={[
                  styles.quantityBtn,
                  quantity <= 1 && styles.quantityBtnDisabled,
                ]}
                onPress={decreaseQuantity}
                disabled={quantity <= 1}
                activeOpacity={0.6}
              >
                <Ionicons
                  name="remove"
                  size={20}
                  color={quantity > 1 ? COLORS.primary : '#D1D5DB'}
                />
              </TouchableOpacity>
              <Text style={styles.quantityValue}>{quantity}</Text>
              <TouchableOpacity
                style={styles.quantityBtn}
                onPress={increaseQuantity}
                activeOpacity={0.6}
              >
                <Ionicons name="add" size={20} color={COLORS.primary} />
              </TouchableOpacity>
            </View>
          </View>

          {/* ─── Action Buttons ─────────────────────────────── */}
          <View style={styles.actionButtonsContainer}>
            {/* Add to Cart */}
            <Animated.View
              style={{ flex: 1, transform: [{ scale: scaleAnim }] }}
            >
              <TouchableOpacity
                style={[
                  styles.actionButton,
                  styles.addToCartBtn,
                  isAdded && styles.addButtonSuccess,
                ]}
                onPress={handleAddToCart}
                activeOpacity={0.8}
              >
                <Ionicons
                  name={isAdded ? 'checkmark' : 'cart-outline'}
                  size={20}
                  color={COLORS.white}
                  style={styles.buttonIcon}
                />
                <Text style={styles.actionButtonText}>
                  {isAdded ? 'Added!' : 'Add to Cart'}
                </Text>
              </TouchableOpacity>
            </Animated.View>

            {/* Book Now */}
            <TouchableOpacity
              style={[styles.actionButton, styles.bookNowBtn]}
              onPress={handleBookNow}
              activeOpacity={0.8}
            >
              <Ionicons
                name="bag-check-outline"
                size={20}
                color={COLORS.white}
                style={styles.buttonIcon}
              />
              <Text style={styles.actionButtonText}>
                Book Now • ₹{totalPrice}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Extra Info */}
          <View style={styles.infoRow}>
            <View style={styles.infoItem}>
              <Ionicons name="time-outline" size={16} color={COLORS.muted} />
              <Text style={styles.infoText}>25–30 min</Text>
            </View>
            <View style={styles.infoDivider} />
            <View style={styles.infoItem}>
              <Ionicons name="bicycle-outline" size={16} color={COLORS.muted} />
              <Text style={styles.infoText}>Free delivery</Text>
            </View>
            <View style={styles.infoDivider} />
            <View style={styles.infoItem}>
              <Ionicons
                name="shield-checkmark-outline"
                size={16}
                color={COLORS.muted}
              />
              <Text style={styles.infoText}>Fresh</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.background },
  scrollContainer: { flexGrow: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingVertical: 14,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.title,
    textAlign: 'center',
  },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyText: {
    marginTop: 12,
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.muted,
  },

  // ─── Image ──────────────────────────────────────────────────
  imageWrapper: {
    height: HEADER_HEIGHT,
    width: width,
    position: 'relative',
    backgroundColor: '#E5E7EB',
  },
  image: { width: '100%', height: '100%', resizeMode: 'cover' },
  gradientOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '50%',
  },
  headerButtons: {
    position: 'absolute',
    top: 48,
    left: 16,
    right: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    zIndex: 1,
  },
  iconButton: {
    backgroundColor: 'rgba(0,0,0,0.35)',
    borderRadius: 30,
    padding: 10,
  },
  badgeContainer: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.65)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  ratingText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: '700',
    marginLeft: 4,
  },
  offerBadge: {
    backgroundColor: '#EF4444',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
  },
  offerText: { color: COLORS.white, fontSize: 10, fontWeight: '800' },

  // ─── Content ──────────────────────────────────────────────
  contentCard: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    marginTop: -20,
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 40,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -6 },
    shadowOpacity: 0.06,
    shadowRadius: 16,
    elevation: 8,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  nameContainer: { flex: 1, marginRight: 12 },
  restaurantName: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.muted,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  dishName: {
    fontSize: 24,
    fontWeight: '800',
    color: COLORS.title,
    marginTop: 4,
    lineHeight: 30,
  },
  price: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.primary,
    marginTop: 4,
  },
  divider: { height: 1, backgroundColor: COLORS.border, marginVertical: 20 },
  sectionLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.title,
    marginBottom: 8,
  },
  description: { fontSize: 15, lineHeight: 24, color: COLORS.text },

  quantitySection: { marginTop: 4 },
  quantitySelector: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    gap: 12,
  },
  quantityBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.white,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  quantityBtnDisabled: { borderColor: '#E5E7EB', opacity: 0.5 },
  quantityValue: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.title,
    minWidth: 40,
    textAlign: 'center',
  },

  // ─── Action Buttons ──────────────────────────────────────
  actionButtonsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 28,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 30,
    paddingVertical: 16,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  addToCartBtn: {
    backgroundColor: COLORS.primary,
    shadowColor: COLORS.primary,
  },
  bookNowBtn: {
    backgroundColor: '#1A1A2E',
    shadowColor: '#1A1A2E',
  },
  addButtonSuccess: { backgroundColor: COLORS.success },
  buttonIcon: { marginRight: 8 },
  actionButtonText: {
    color: COLORS.white,
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 0.2,
  },

  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    marginTop: 24,
    paddingVertical: 12,
    paddingHorizontal: 8,
    backgroundColor: COLORS.background,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  infoItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  infoText: { fontSize: 12, fontWeight: '500', color: COLORS.muted },
  infoDivider: { width: 1, height: 20, backgroundColor: COLORS.border },
});
