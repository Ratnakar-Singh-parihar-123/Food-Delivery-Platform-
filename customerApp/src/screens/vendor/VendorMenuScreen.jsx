// // screens/VendorMenuScreen.js
// import React, { useState, useEffect, useCallback } from 'react';
// import {
//   View,
//   Text,
//   FlatList,
//   Image,
//   StyleSheet,
//   StatusBar,
//   ActivityIndicator,
//   Pressable,
//   Dimensions,
//   RefreshControl,
//   Alert,
// } from 'react-native';
// import { SafeAreaView } from 'react-native-safe-area-context';
// import Ionicons from '@react-native-vector-icons/ionicons';
// import { useAppUI } from '../../context/AppUIContext';
// import { getVendorItems } from '../../api/vendorApi';

// const { width } = Dimensions.get('window');
// const ITEMS_PER_ROW = 2;
// const CARD_WIDTH = (width - 16 * 2 - 10 * (ITEMS_PER_ROW - 1)) / ITEMS_PER_ROW;

// const COLORS = {
//   primary: '#FF5A1F',
//   primaryLight: '#FF8A5C',
//   primaryDark: '#E04A1A',
//   white: '#FFFFFF',
//   background: '#F8F9FC',
//   title: '#1A1A2E',
//   text: '#2D2D3F',
//   muted: '#8E8EA0',
//   lightGray: '#F5F6FA',
//   border: '#EAEAEF',
//   shadow: 'rgba(0,0,0,0.06)',
//   success: '#22C55E',
// };

// const FALLBACK_IMAGE =
//   'https://via.placeholder.com/120x120/ff5a1f/ffffff?text=Item';

// // ─── Helper: Build full image URL ──────────────────────────
// const buildImageUrl = imagePath => {
//   if (!imagePath) return FALLBACK_IMAGE;
//   if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
//     return imagePath;
//   }
//   const baseUrl = 'https://myfoodmitra-ecosystem.onrender.com'; // move to config
//   const path = imagePath.startsWith('/') ? imagePath : `/${imagePath}`;
//   return `${baseUrl}${path}`;
// };

// export default function VendorMenuScreen({ navigation, route }) {
//   const { vendorId, vendorName } = route.params || {};
//   const { addToCart, decreaseCartItem, removeFromCart, cartItems } = useAppUI();

//   const [items, setItems] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [refreshing, setRefreshing] = useState(false);
//   const [error, setError] = useState('');

//   // ─── Fetch items ──────────────────────────────────────────
//   const fetchItems = async (showLoading = true) => {
//     if (!vendorId) {
//       setLoading(false);
//       setError('Vendor ID is missing');
//       return;
//     }
//     try {
//       if (showLoading) setLoading(true);
//       else setRefreshing(true);
//       const response = await getVendorItems(vendorId);
//       const itemsData = response?.data?.items || [];
//       setItems(itemsData);
//       setError('');
//     } catch (err) {
//       console.error('Failed to fetch vendor items:', err);
//       setError('Unable to load menu. Please try again.');
//     } finally {
//       setLoading(false);
//       setRefreshing(false);
//     }
//   };

//   useEffect(() => {
//     fetchItems(true);
//   }, [vendorId]);

//   // ─── Cart helpers ─────────────────────────────────────────
//   const getQuantity = itemId => {
//     const cartItem = cartItems.find(item => item.id === itemId);
//     return cartItem?.quantity || 0;
//   };

//   // ─── Handle add / decrease / remove ──────────────────────
//   const handleAdd = item => {
//     const id = item._id || item.id;
//     addToCart({ ...item, id });
//   };

//   const handleDecrease = item => {
//     const id = item._id || item.id;
//     const quantity = getQuantity(id);
//     if (quantity <= 1) {
//       removeFromCart(id);
//     } else {
//       decreaseCartItem(id);
//     }
//   };

//   const handleItemPress = item => {
//     navigation.navigate('ItemDetail', { item });
//   };

//   // ─── Refresh ──────────────────────────────────────────────
//   const onRefresh = useCallback(() => {
//     fetchItems(false);
//   }, [vendorId]);

//   // ─── Render item card ──────────────────────────────────────
//   const renderItem = ({ item }) => {
//     const id = item._id || item.id;
//     const quantity = getQuantity(id);
//     const imageUrl = buildImageUrl(item.image);
//     const isAvailable = item.isAvailable !== false;

//     return (
//       <Pressable
//         style={({ pressed }) => [
//           styles.card,
//           pressed && styles.cardPressed,
//           !isAvailable && styles.cardDisabled,
//         ]}
//         onPress={() => handleItemPress(item)}
//         disabled={!isAvailable}
//       >
//         <View style={styles.imageWrapper}>
//           <Image
//             source={{ uri: imageUrl }}
//             style={styles.image}
//             onError={e => {
//               e.target.source = { uri: FALLBACK_IMAGE };
//             }}
//           />
//           {!isAvailable && (
//             <View style={styles.unavailableOverlay}>
//               <Text style={styles.unavailableText}>Unavailable</Text>
//             </View>
//           )}
//         </View>
//         <View style={styles.info}>
//           <Text style={styles.name} numberOfLines={1}>
//             {item.name}
//           </Text>
//           <Text style={styles.price}>₹{item.price}</Text>

//           {/* Quantity controls */}
//           {isAvailable && (
//             <View style={styles.controls}>
//               {quantity === 0 ? (
//                 <Pressable
//                   onPress={() => handleAdd(item)}
//                   style={styles.addBtn}
//                 >
//                   <Ionicons name="add" size={18} color={COLORS.white} />
//                 </Pressable>
//               ) : (
//                 <View style={styles.quantityContainer}>
//                   <Pressable
//                     onPress={() => handleDecrease(item)}
//                     style={styles.quantityBtn}
//                   >
//                     <Ionicons name="remove" size={14} color={COLORS.primary} />
//                   </Pressable>
//                   <Text style={styles.quantityText}>{quantity}</Text>
//                   <Pressable
//                     onPress={() => handleAdd(item)}
//                     style={styles.quantityBtn}
//                   >
//                     <Ionicons name="add" size={14} color={COLORS.primary} />
//                   </Pressable>
//                 </View>
//               )}
//             </View>
//           )}
//         </View>
//       </Pressable>
//     );
//   };

//   // ─── Loading ──────────────────────────────────────────────
//   if (loading) {
//     return (
//       <SafeAreaView style={styles.safeArea}>
//         <View style={styles.header}>
//           <Pressable onPress={() => navigation.goBack()} hitSlop={12}>
//             <Ionicons name="arrow-back" size={24} color={COLORS.title} />
//           </Pressable>
//           <Text style={styles.headerTitle} numberOfLines={1}>
//             {vendorName || 'Menu'}
//           </Text>
//           <View style={{ width: 24 }} />
//         </View>
//         <View style={styles.loaderContainer}>
//           <ActivityIndicator size="large" color={COLORS.primary} />
//         </View>
//       </SafeAreaView>
//     );
//   }

//   if (error) {
//     return (
//       <SafeAreaView style={styles.safeArea}>
//         <View style={styles.header}>
//           <Pressable onPress={() => navigation.goBack()} hitSlop={12}>
//             <Ionicons name="arrow-back" size={24} color={COLORS.title} />
//           </Pressable>
//           <Text style={styles.headerTitle} numberOfLines={1}>
//             {vendorName || 'Menu'}
//           </Text>
//           <View style={{ width: 24 }} />
//         </View>
//         <View style={styles.errorContainer}>
//           <Ionicons
//             name="alert-circle-outline"
//             size={48}
//             color={COLORS.muted}
//           />
//           <Text style={styles.errorText}>{error}</Text>
//           <Pressable style={styles.retryBtn} onPress={() => fetchItems(true)}>
//             <Text style={styles.retryText}>Retry</Text>
//           </Pressable>
//         </View>
//       </SafeAreaView>
//     );
//   }

//   // ─── Main render ──────────────────────────────────────────
//   return (
//     <SafeAreaView style={styles.safeArea}>
//       <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />

//       <View style={styles.header}>
//         <Pressable onPress={() => navigation.goBack()} hitSlop={12}>
//           <Ionicons name="arrow-back" size={24} color={COLORS.title} />
//         </Pressable>
//         <Text style={styles.headerTitle} numberOfLines={1}>
//           {vendorName || 'Menu'}
//         </Text>
//         <View style={{ width: 24 }} />
//       </View>

//       {items.length === 0 ? (
//         <View style={styles.emptyContainer}>
//           <Ionicons name="restaurant-outline" size={48} color={COLORS.muted} />
//           <Text style={styles.emptyText}>No items available</Text>
//         </View>
//       ) : (
//         <FlatList
//           data={items}
//           keyExtractor={item => item._id || item.id}
//           renderItem={renderItem}
//           numColumns={ITEMS_PER_ROW}
//           columnWrapperStyle={styles.columnWrapper}
//           contentContainerStyle={styles.listContent}
//           showsVerticalScrollIndicator={false}
//           refreshControl={
//             <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
//           }
//         />
//       )}
//     </SafeAreaView>
//   );
// }

// const styles = StyleSheet.create({
//   safeArea: {
//     flex: 1,
//     backgroundColor: COLORS.white,
//   },
//   header: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'space-between',
//     paddingHorizontal: 16,
//     paddingVertical: 14,
//     backgroundColor: COLORS.white,
//     borderBottomWidth: 1,
//     borderBottomColor: COLORS.border,
//   },
//   headerTitle: {
//     flex: 1,
//     fontSize: 18,
//     fontWeight: '700',
//     color: COLORS.title,
//     textAlign: 'center',
//     marginHorizontal: 8,
//   },
//   loaderContainer: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   errorContainer: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     paddingHorizontal: 30,
//   },
//   errorText: {
//     marginTop: 12,
//     fontSize: 16,
//     color: COLORS.muted,
//     textAlign: 'center',
//   },
//   retryBtn: {
//     marginTop: 16,
//     paddingHorizontal: 24,
//     paddingVertical: 10,
//     backgroundColor: COLORS.primary,
//     borderRadius: 10,
//   },
//   retryText: {
//     color: COLORS.white,
//     fontWeight: '700',
//   },
//   emptyContainer: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     paddingTop: 60,
//   },
//   emptyText: {
//     marginTop: 12,
//     fontSize: 16,
//     color: COLORS.muted,
//     fontWeight: '500',
//   },
//   listContent: {
//     paddingHorizontal: 16,
//     paddingVertical: 12,
//     paddingBottom: 30,
//   },
//   columnWrapper: {
//     justifyContent: 'space-between',
//     marginBottom: 14,
//   },
//   card: {
//     width: CARD_WIDTH,
//     backgroundColor: COLORS.white,
//     borderRadius: 14,
//     borderWidth: 1,
//     borderColor: COLORS.border,
//     overflow: 'hidden',
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.04,
//     shadowRadius: 4,
//     elevation: 2,
//   },
//   cardPressed: {
//     opacity: 0.9,
//     transform: [{ scale: 0.97 }],
//   },
//   cardDisabled: {
//     opacity: 0.6,
//   },
//   imageWrapper: {
//     width: '100%',
//     height: 120,
//     position: 'relative',
//     backgroundColor: '#F3F4F6',
//   },
//   image: {
//     width: '100%',
//     height: '100%',
//     resizeMode: 'cover',
//   },
//   unavailableOverlay: {
//     position: 'absolute',
//     top: 0,
//     left: 0,
//     right: 0,
//     bottom: 0,
//     backgroundColor: 'rgba(0,0,0,0.4)',
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   unavailableText: {
//     color: COLORS.white,
//     fontSize: 12,
//     fontWeight: '800',
//     letterSpacing: 0.5,
//   },
//   info: {
//     padding: 10,
//     paddingBottom: 12,
//   },
//   name: {
//     fontSize: 14,
//     fontWeight: '700',
//     color: COLORS.title,
//     marginBottom: 2,
//   },
//   price: {
//     fontSize: 15,
//     fontWeight: '800',
//     color: COLORS.primary,
//     marginBottom: 4,
//   },
//   controls: {
//     flexDirection: 'row',
//     justifyContent: 'flex-end',
//     marginTop: 2,
//   },
//   addBtn: {
//     backgroundColor: COLORS.primary,
//     width: 28,
//     height: 28,
//     borderRadius: 14,
//     alignItems: 'center',
//     justifyContent: 'center',
//     shadowColor: COLORS.primary,
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.2,
//     shadowRadius: 4,
//     elevation: 3,
//   },
//   quantityContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     backgroundColor: '#FFF7F2',
//     borderRadius: 14,
//     borderWidth: 1,
//     borderColor: '#FFD3BF',
//     height: 28,
//   },
//   quantityBtn: {
//     width: 28,
//     height: 28,
//     alignItems: 'center',
//     justifyContent: 'center',
//   },
//   quantityText: {
//     minWidth: 20,
//     textAlign: 'center',
//     fontSize: 12,
//     fontWeight: '700',
//     color: COLORS.primary,
//   },
// });

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  ActivityIndicator,
  Pressable,
  Dimensions,
  RefreshControl,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from '@react-native-vector-icons/ionicons';
import { useAppUI } from '../../context/AppUIContext';
import { getVendorById } from '../../api/vendorApi';

const { width } = Dimensions.get('window');

const COLORS = {
  primary: '#FF5A1F',
  primaryLight: '#FF8A5C',
  primaryDark: '#E04A1A',
  white: '#FFFFFF',
  background: '#F8F9FC',
  title: '#1A1A2E',
  text: '#2D2D3F',
  muted: '#8E8EA0',
  lightGray: '#F5F6FA',
  border: '#EAEAEF',
  shadow: 'rgba(0,0,0,0.06)',
};

const FALLBACK_IMAGE =
  'https://via.placeholder.com/80x80/ff5a1f/ffffff?text=Cat';

const buildImageUrl = imagePath => {
  if (!imagePath) return FALLBACK_IMAGE;
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }
  const baseUrl = 'https://myfoodmitra-ecosystem.onrender.com';
  const path = imagePath.startsWith('/') ? imagePath : `/${imagePath}`;
  return `${baseUrl}${path}`;
};

export default function VendorMenuScreen({ navigation, route }) {
  const { vendorId, vendorName } = route.params || {};
  const { addToCart, decreaseCartItem, removeFromCart, cartItems } = useAppUI();

  const [vendor, setVendor] = useState(null);
  const [categories, setCategories] = useState([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState(null);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // ─── Fetch vendor data ────────────────────────────────────
  const fetchVendor = async (showLoading = true) => {
    if (!vendorId) {
      setLoading(false);
      return;
    }
    try {
      if (showLoading) setLoading(true);
      else setRefreshing(true);

      const response = await getVendorById(vendorId);
      const vendorData = response?.data?.vendor || response?.vendor || {};
      setVendor(vendorData);

      const cats = vendorData.categories || [];
      setCategories(cats);

      if (cats.length > 0) {
        const firstCategory = cats[0];
        const firstId = firstCategory.id || firstCategory._id;
        setSelectedCategoryId(firstId);
        setItems(firstCategory.items || []);
      } else {
        setSelectedCategoryId(null);
        setItems([]);
      }
    } catch (error) {
      console.error('Failed to fetch vendor:', error);
      Alert.alert('Error', 'Unable to load menu.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchVendor(true);
  }, [vendorId]);

  // ─── Cart helpers ──────────────────────────────────────────
  const getQuantity = itemId => {
    const cartItem = cartItems.find(item => item.id === itemId);
    return cartItem?.quantity || 0;
  };

  // ─── Category selection ──────────────────────────────────
  const handleCategorySelect = categoryId => {
    setSelectedCategoryId(categoryId);
    const category = categories.find(c => (c.id || c._id) === categoryId);
    setItems(category?.items || []);
  };

  // ─── Item press ──────────────────────────────────────────
  const handleItemPress = item => {
    navigation.navigate('ItemDetail', { item });
  };

  // ─── Category icon helper ──────────────────────────────
  const getCategoryIconUrl = category => {
    if (!category) return null;
    if (category.icon && typeof category.icon === 'string') {
      return buildImageUrl(category.icon);
    }
    if (category.icon?.image) {
      return buildImageUrl(category.icon.image);
    }
    if (category.image) {
      return buildImageUrl(category.image);
    }
    return null;
  };

  // ─── Render category (circular) ─────────────────────────
  const renderCategory = ({ item }) => {
    const catId = item.id || item._id;
    const isActive = catId === selectedCategoryId;
    const categoryName = item.name || 'Category';
    const categoryImage = getCategoryIconUrl(item) || FALLBACK_IMAGE;

    return (
      <Pressable
        style={({ pressed }) => [
          styles.categoryItem,
          pressed && styles.categoryItemPressed,
        ]}
        onPress={() => handleCategorySelect(catId)}
      >
        <View
          style={[styles.circleWrapper, isActive && styles.circleWrapperActive]}
        >
          <Image source={{ uri: categoryImage }} style={styles.circleImage} />
          {isActive && <View style={styles.activeDot} />}
        </View>
        <Text
          style={[styles.categoryLabel, isActive && styles.categoryLabelActive]}
          numberOfLines={1}
        >
          {categoryName}
        </Text>
      </Pressable>
    );
  };

  // ─── Render menu item ────────────────────────────────────
  const renderMenuItem = ({ item }) => {
    const id = item.id || item._id;
    const quantity = getQuantity(id);
    const imageUrl = buildImageUrl(item.image);

    const handleAdd = () => {
      addToCart({ ...item, id });
    };

    const handleDecrease = () => {
      if (quantity <= 1) {
        removeFromCart(id);
      } else {
        decreaseCartItem(id);
      }
    };

    return (
      <Pressable
        style={({ pressed }) => [
          styles.dishCard,
          pressed && styles.dishCardPressed,
        ]}
        onPress={() => handleItemPress(item)}
      >
        <View style={styles.dishImageWrapper}>
          <Image source={{ uri: imageUrl }} style={styles.dishImage} />
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

  // ─── Loading / Error states ─────────────────────────────
  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <Pressable onPress={() => navigation.goBack()} hitSlop={12}>
            <Ionicons name="arrow-back" size={24} color={COLORS.title} />
          </Pressable>
          <Text style={styles.headerTitle} numberOfLines={1}>
            {vendorName || 'Menu'}
          </Text>
          <View style={{ width: 24 }} />
        </View>
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      </SafeAreaView>
    );
  }

  if (!vendor) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <Pressable onPress={() => navigation.goBack()} hitSlop={12}>
            <Ionicons name="arrow-back" size={24} color={COLORS.title} />
          </Pressable>
          <Text style={styles.headerTitle}>Menu</Text>
          <View style={{ width: 24 }} />
        </View>
        <View style={styles.emptyContainer}>
          <Ionicons name="restaurant-outline" size={48} color={COLORS.muted} />
          <Text style={styles.emptyText}>Vendor not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  // ─── Main render ──────────────────────────────────────────
  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />

      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} hitSlop={12}>
          <Ionicons name="arrow-back" size={22} color={COLORS.title} />
        </Pressable>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {vendor.businessName || 'Menu'}
        </Text>
        <TouchableOpacity style={{ padding: 4 }}>
          <Ionicons name="search-outline" size={22} color={COLORS.title} />
        </TouchableOpacity>
      </View>

      <View style={styles.mainContainer}>
        {/* Left: Categories */}
        <View style={styles.leftPanel}>
          <FlatList
            data={categories}
            keyExtractor={item => (item.id || item._id).toString()}
            renderItem={renderCategory}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.categoryList}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={() => fetchVendor(false)}
              />
            }
          />
        </View>

        {/* Right: Items Grid */}
        <View style={styles.rightPanel}>
          <View style={styles.dishesHeader}>
            <Text style={styles.dishesTitle}>
              {categories.find(c => (c.id || c._id) === selectedCategoryId)
                ?.name || 'All'}
            </Text>
            <Text style={styles.dishesCount}>{items.length} items</Text>
          </View>
          <FlatList
            data={items}
            keyExtractor={item => (item.id || item._id).toString()}
            renderItem={renderMenuItem}
            numColumns={2}
            columnWrapperStyle={styles.columnWrapper}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <View style={styles.emptyItems}>
                <Ionicons
                  name="fast-food-outline"
                  size={48}
                  color={COLORS.muted}
                />
                <Text style={styles.emptyText}>No items in this category</Text>
              </View>
            }
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

// ─── Styles (exactly the same as your original) ────────────
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.white,
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
    flex: 1,
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.title,
    textAlign: 'center',
    marginHorizontal: 8,
  },
  loaderContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyText: {
    marginTop: 12,
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.muted,
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
  emptyItems: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
});
