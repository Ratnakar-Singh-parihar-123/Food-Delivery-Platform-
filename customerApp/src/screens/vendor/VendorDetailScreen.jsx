// import React, { useState, useEffect } from 'react';
// import {
//   View,
//   Text,
//   FlatList,
//   Image,
//   TouchableOpacity,
//   StyleSheet,
//   StatusBar,
//   ActivityIndicator,
//   Pressable,
//   Dimensions,
//   Alert,
// } from 'react-native';
// import { SafeAreaView } from 'react-native-safe-area-context';
// import Ionicons from '@react-native-vector-icons/ionicons';
// import { useAppUI } from '../../context/AppUIContext';
// import { getVendorById } from '../../api/vendorApi';

// const { width } = Dimensions.get('window');

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
// };

// const FALLBACK_IMAGE =
//   'https://via.placeholder.com/80x80/ff5a1f/ffffff?text=Cat';

// // ─── Helper: Build full image URL ──────────────────────────
// const buildImageUrl = imagePath => {
//   if (!imagePath) return FALLBACK_IMAGE;
//   if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
//     return imagePath;
//   }
//   const baseUrl = 'https://myfoodmitra-ecosystem.onrender.com'; // change to your server
//   const path = imagePath.startsWith('/') ? imagePath : `/${imagePath}`;
//   return `${baseUrl}${path}`;
// };

// export default function VendorDetailScreen({ navigation, route }) {
//   const { vendorId } = route.params || {};
//   const { addToCart, decreaseCartItem, removeFromCart, cartItems } = useAppUI();

//   const [vendor, setVendor] = useState(null);
//   const [categories, setCategories] = useState([]);
//   const [selectedCategoryId, setSelectedCategoryId] = useState(null);
//   const [items, setItems] = useState([]);
//   const [loading, setLoading] = useState(true);

//   // ─── Fetch vendor data ──────────────────────────────────────
//   const fetchVendor = async () => {
//     if (!vendorId) {
//       setLoading(false);
//       return;
//     }
//     try {
//       setLoading(true);
//       const response = await getVendorById(vendorId);
//       const vendorData = response?.data?.vendor || response?.vendor || {};
//       setVendor(vendorData);

//       const cats = vendorData.categories || [];
//       setCategories(cats);

//       if (cats.length > 0) {
//         const firstCategory = cats[0];
//         const firstId = firstCategory.id || firstCategory._id;
//         setSelectedCategoryId(firstId);
//         setItems(firstCategory.items || []);
//       } else {
//         setSelectedCategoryId(null);
//         setItems([]);
//       }
//     } catch (error) {
//       console.log('Status:', error.response?.status);
//       console.log('Data:', error.response?.data);
//       console.log('URL:', error.config?.url);
//       console.error('Failed to fetch vendor:', error);
//       Alert.alert('Error', 'Unable to load vendor details.');
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchVendor();
//   }, [vendorId]);

//   // ─── Get quantity from cart ────────────────────────────────
//   const getQuantity = itemId => {
//     const cartItem = cartItems.find(item => item.id === itemId);
//     return cartItem?.quantity || 0;
//   };

//   // ─── Handle category selection ─────────────────────────────
//   const handleCategorySelect = categoryId => {
//     setSelectedCategoryId(categoryId);
//     const category = categories.find(c => (c.id || c._id) === categoryId);
//     setItems(category?.items || []);
//   };

//   // ─── Handle item press ─────────────────────────────────────
//   const handleItemPress = item => {
//     navigation.navigate('ItemDetail', { item });
//   };

//   // ─── Helper: Get category icon URL ──────────────────────────
//   const getCategoryIconUrl = category => {
//     if (!category) return null;
//     // If category has an 'icon' field that is a string
//     if (category.icon && typeof category.icon === 'string') {
//       return buildImageUrl(category.icon);
//     }
//     // If category has an 'icon' object with an 'image' field
//     if (category.icon?.image) {
//       return buildImageUrl(category.icon.image);
//     }
//     // If category has an 'image' field (legacy)
//     if (category.image) {
//       return buildImageUrl(category.image);
//     }
//     return null;
//   };

//   // ─── Render circular category (left) ──────────────────────
//   const renderCategory = ({ item }) => {
//     const catId = item.id || item._id;
//     const isActive = catId === selectedCategoryId;
//     const categoryName = item.name || 'Category';
//     const categoryImage = getCategoryIconUrl(item) || FALLBACK_IMAGE;

//     return (
//       <Pressable
//         style={({ pressed }) => [
//           styles.categoryItem,
//           pressed && styles.categoryItemPressed,
//         ]}
//         onPress={() => handleCategorySelect(catId)}
//       >
//         <View
//           style={[styles.circleWrapper, isActive && styles.circleWrapperActive]}
//         >
//           <Image source={{ uri: categoryImage }} style={styles.circleImage} />
//           {isActive && <View style={styles.activeDot} />}
//         </View>
//         <Text
//           style={[styles.categoryLabel, isActive && styles.categoryLabelActive]}
//           numberOfLines={1}
//         >
//           {categoryName}
//         </Text>
//       </Pressable>
//     );
//   };

//   // ─── Render menu item (right) ──────────────────────────────
//   const renderMenuItem = ({ item }) => {
//     const quantity = getQuantity(item.id || item._id);
//     const imageUrl = buildImageUrl(item.image);

//     const handleAdd = () => {
//       addToCart({ ...item, id: item.id || item._id });
//     };

//     const handleDecrease = () => {
//       const id = item.id || item._id;
//       if (quantity <= 1) {
//         removeFromCart(id);
//       } else {
//         decreaseCartItem(id);
//       }
//     };

//     return (
//       <Pressable
//         style={({ pressed }) => [
//           styles.dishCard,
//           pressed && styles.dishCardPressed,
//         ]}
//         onPress={() => handleItemPress(item)}
//       >
//         <View style={styles.dishImageWrapper}>
//           <Image source={{ uri: imageUrl }} style={styles.dishImage} />
//           <View style={styles.dishBadge}>
//             <Text style={styles.dishBadgeText}>⭐</Text>
//           </View>
//         </View>
//         <View style={styles.dishInfo}>
//           <Text style={styles.dishName} numberOfLines={1}>
//             {item.name}
//           </Text>
//           <View style={styles.dishMeta}>
//             <Text style={styles.dishPrice}>₹{item.price}</Text>
//             <View style={styles.rating}>
//               <Ionicons name="star" size={12} color="#FFB800" />
//               <Text style={styles.ratingText}>4.5</Text>
//             </View>
//           </View>
//           {quantity === 0 ? (
//             <Pressable onPress={handleAdd} style={styles.addBtn}>
//               <Ionicons name="add" size={16} color={COLORS.white} />
//             </Pressable>
//           ) : (
//             <View style={styles.quantityContainer}>
//               <Pressable onPress={handleDecrease} style={styles.quantityBtn}>
//                 <Ionicons name="remove" size={14} color={COLORS.primary} />
//               </Pressable>
//               <Text style={styles.quantityText}>{quantity}</Text>
//               <Pressable onPress={handleAdd} style={styles.quantityBtn}>
//                 <Ionicons name="add" size={14} color={COLORS.primary} />
//               </Pressable>
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
//           <Text style={styles.headerTitle}>Vendor Details</Text>
//           <View style={{ width: 24 }} />
//         </View>
//         <View style={styles.loaderContainer}>
//           <ActivityIndicator size="large" color={COLORS.primary} />
//         </View>
//       </SafeAreaView>
//     );
//   }

//   if (!vendor) {
//     return (
//       <SafeAreaView style={styles.safeArea}>
//         <View style={styles.header}>
//           <Pressable onPress={() => navigation.goBack()} hitSlop={12}>
//             <Ionicons name="arrow-back" size={24} color={COLORS.title} />
//           </Pressable>
//           <Text style={styles.headerTitle}>Vendor Details</Text>
//           <View style={{ width: 24 }} />
//         </View>
//         <View style={styles.emptyContainer}>
//           <Ionicons name="restaurant-outline" size={48} color={COLORS.muted} />
//           <Text style={styles.emptyText}>Vendor not found</Text>
//         </View>
//       </SafeAreaView>
//     );
//   }

//   // ─── Main render ──────────────────────────────────────────
//   return (
//     <SafeAreaView style={styles.safeArea}>
//       <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />

//       {/* Header */}
//       <View style={styles.header}>
//         <Pressable onPress={() => navigation.goBack()} style={styles.backBtn}>
//           <Ionicons name="arrow-back" size={22} color={COLORS.title} />
//         </Pressable>
//         <Text style={styles.headerTitle} numberOfLines={1}>
//           {vendor.businessName || 'Vendor'}
//         </Text>
//         <TouchableOpacity onPress={() => {}} style={{ padding: 4 }}>
//           <Ionicons name="search-outline" size={22} color={COLORS.title} />
//         </TouchableOpacity>
//       </View>

//       {/* Main Split View */}
//       <View style={styles.mainContainer}>
//         {/* Left: Categories (circular) */}
//         <View style={styles.leftPanel}>
//           <FlatList
//             data={categories}
//             keyExtractor={item => (item.id || item._id).toString()}
//             renderItem={renderCategory}
//             showsVerticalScrollIndicator={false}
//             contentContainerStyle={styles.categoryList}
//           />
//         </View>

//         {/* Right: Items Grid */}
//         <View style={styles.rightPanel}>
//           <View style={styles.dishesHeader}>
//             <Text style={styles.dishesTitle}>
//               {categories.find(c => (c.id || c._id) === selectedCategoryId)
//                 ?.name || 'All'}
//             </Text>
//             <Text style={styles.dishesCount}>{items.length} items</Text>
//           </View>
//           <FlatList
//             data={items}
//             keyExtractor={item => (item.id || item._id).toString()}
//             renderItem={renderMenuItem}
//             numColumns={2}
//             columnWrapperStyle={styles.columnWrapper}
//             showsVerticalScrollIndicator={false}
//             ListEmptyComponent={
//               <View style={styles.emptyItems}>
//                 <Ionicons
//                   name="fast-food-outline"
//                   size={48}
//                   color={COLORS.muted}
//                 />
//                 <Text style={styles.emptyText}>No items in this category</Text>
//               </View>
//             }
//           />
//         </View>
//       </View>
//     </SafeAreaView>
//   );
// }

// // ─── Styles ───────────────────────────────────────────────────
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
//   backBtn: { padding: 4 },
//   headerTitle: {
//     flex: 1,
//     fontSize: 18,
//     fontWeight: '800',
//     color: COLORS.title,
//     textAlign: 'center',
//     marginHorizontal: 8,
//   },
//   loaderContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
//   emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
//   emptyText: {
//     marginTop: 12,
//     fontSize: 16,
//     fontWeight: '600',
//     color: COLORS.muted,
//   },

//   mainContainer: {
//     flex: 1,
//     flexDirection: 'row',
//     backgroundColor: COLORS.lightGray,
//   },

//   // ─── Left Panel ──────────────────────────────────────────────
//   leftPanel: {
//     width: '30%',
//     backgroundColor: COLORS.white,
//     borderRightWidth: 1,
//     borderRightColor: COLORS.border,
//     paddingVertical: 8,
//   },
//   categoryList: {
//     alignItems: 'center',
//     paddingHorizontal: 8,
//     gap: 8,
//   },
//   categoryItem: {
//     alignItems: 'center',
//     width: '100%',
//     paddingVertical: 4,
//   },
//   categoryItemPressed: { opacity: 0.7 },
//   circleWrapper: {
//     width: 60,
//     height: 60,
//     borderRadius: 30,
//     backgroundColor: COLORS.lightGray,
//     alignItems: 'center',
//     justifyContent: 'center',
//     borderWidth: 2,
//     borderColor: 'transparent',
//     marginBottom: 4,
//     position: 'relative',
//   },
//   circleWrapperActive: {
//     borderColor: COLORS.primary,
//     backgroundColor: '#FFF0EA',
//   },
//   circleImage: {
//     width: 48,
//     height: 48,
//     borderRadius: 24,
//   },
//   activeDot: {
//     position: 'absolute',
//     bottom: -2,
//     right: -2,
//     width: 14,
//     height: 14,
//     borderRadius: 7,
//     backgroundColor: COLORS.primary,
//     borderWidth: 2,
//     borderColor: COLORS.white,
//   },
//   categoryLabel: {
//     fontSize: 11,
//     fontWeight: '500',
//     color: COLORS.text,
//     textAlign: 'center',
//     width: '100%',
//   },
//   categoryLabelActive: {
//     color: COLORS.primary,
//     fontWeight: '700',
//   },

//   // ─── Right Panel ──────────────────────────────────────────────
//   rightPanel: {
//     flex: 1,
//     padding: 12,
//   },
//   dishesHeader: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     marginBottom: 12,
//   },
//   dishesTitle: {
//     fontSize: 16,
//     fontWeight: '700',
//     color: COLORS.title,
//   },
//   dishesCount: {
//     fontSize: 12,
//     fontWeight: '500',
//     color: COLORS.muted,
//   },
//   columnWrapper: {
//     justifyContent: 'space-between',
//     marginBottom: 12,
//   },
//   dishCard: {
//     width: (width * 0.7 - 36) / 2,
//     backgroundColor: COLORS.white,
//     borderRadius: 14,
//     overflow: 'hidden',
//     borderWidth: 1,
//     borderColor: COLORS.border,
//     shadowColor: COLORS.shadow,
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.08,
//     shadowRadius: 6,
//     elevation: 2,
//   },
//   dishCardPressed: {
//     opacity: 0.8,
//     transform: [{ scale: 0.97 }],
//   },
//   dishImageWrapper: {
//     width: '100%',
//     height: 90,
//     backgroundColor: COLORS.lightGray,
//     position: 'relative',
//   },
//   dishImage: {
//     width: '100%',
//     height: '100%',
//     resizeMode: 'cover',
//   },
//   dishBadge: {
//     position: 'absolute',
//     top: 6,
//     left: 6,
//     backgroundColor: 'rgba(255,90,31,0.85)',
//     paddingHorizontal: 6,
//     paddingVertical: 2,
//     borderRadius: 6,
//   },
//   dishBadgeText: {
//     fontSize: 10,
//     fontWeight: '700',
//     color: COLORS.white,
//   },
//   dishInfo: {
//     padding: 10,
//     position: 'relative',
//   },
//   dishName: {
//     fontSize: 12,
//     fontWeight: '600',
//     color: COLORS.title,
//     marginBottom: 4,
//   },
//   dishMeta: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//   },
//   dishPrice: {
//     fontSize: 13,
//     fontWeight: '700',
//     color: COLORS.primary,
//   },
//   rating: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     gap: 2,
//   },
//   ratingText: {
//     fontSize: 10,
//     fontWeight: '600',
//     color: COLORS.text,
//   },
//   addBtn: {
//     position: 'absolute',
//     bottom: 10,
//     right: 10,
//     width: 26,
//     height: 26,
//     borderRadius: 13,
//     backgroundColor: COLORS.primary,
//     alignItems: 'center',
//     justifyContent: 'center',
//     shadowColor: COLORS.primary,
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.25,
//     shadowRadius: 4,
//     elevation: 3,
//   },
//   quantityContainer: {
//     position: 'absolute',
//     bottom: 10,
//     right: 10,
//     flexDirection: 'row',
//     alignItems: 'center',
//     backgroundColor: '#FFF7F2',
//     borderRadius: 13,
//     borderWidth: 1,
//     borderColor: '#FFD3BF',
//     height: 26,
//   },
//   quantityBtn: {
//     width: 26,
//     height: 26,
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
//   emptyItems: {
//     flex: 1,
//     alignItems: 'center',
//     justifyContent: 'center',
//     paddingVertical: 60,
//   },
// });

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  ActivityIndicator,
  ScrollView,
  Alert,
  Linking,
  Dimensions,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from '@react-native-vector-icons/ionicons';
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
  success: '#22C55E',
  warning: '#F59E0B',
};

// ─── Fallback images ──────────────────────────────────────────
const FALLBACK_COVER =
  'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&h=400&fit=crop';
const FALLBACK_AVATAR =
  'https://images.unsplash.com/photo-1552566626-52f8b828add9?w=200&h=200&fit=crop';

// ─── Build image URL ──────────────────────────────────────────
const buildImageUrl = imagePath => {
  if (!imagePath) return null;
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }
  const baseUrl = 'https://myfoodmitra-ecosystem.onrender.com';
  const path = imagePath.startsWith('/') ? imagePath : `/${imagePath}`;
  return `${baseUrl}${path}`;
};

// ─── Format address ───────────────────────────────────────────
const formatAddress = address => {
  if (!address) return '📍 Address not provided';
  if (typeof address === 'string') return address;
  if (typeof address === 'object') {
    const parts = [
      address.addressLine || address.line1 || address.street,
      address.landmark,
      address.city || address.locality,
      address.state || address.region,
      address.pincode || address.postalCode || address.zip,
    ].filter(Boolean);
    return parts.length ? parts.join(', ') : '📍 Address not provided';
  }
  return '📍 Address not provided';
};

// ─── Extract phone ────────────────────────────────────────────
const getPhoneNumber = phone => {
  if (!phone) return null;
  if (typeof phone === 'string') return phone;
  if (typeof phone === 'object') {
    return phone.number || phone.phone || phone.mobile || null;
  }
  return null;
};

// ─── Render star rating ──────────────────────────────────────
const renderStars = rating => {
  const fullStars = Math.floor(rating);
  const halfStar = rating % 1 >= 0.5 ? 1 : 0;
  const emptyStars = 5 - fullStars - halfStar;
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
      {[...Array(fullStars)].map((_, i) => (
        <Ionicons key={`full-${i}`} name="star" size={16} color="#FFB800" />
      ))}
      {halfStar === 1 && (
        <Ionicons name="star-half" size={16} color="#FFB800" />
      )}
      {[...Array(emptyStars)].map((_, i) => (
        <Ionicons
          key={`empty-${i}`}
          name="star-outline"
          size={16}
          color="#FFB800"
        />
      ))}
    </View>
  );
};

export default function VendorDetailScreen({ navigation, route }) {
  const { vendorId } = route.params || {};
  const [vendor, setVendor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchVendor = async (showLoading = true) => {
    if (!vendorId) {
      if (showLoading) setLoading(false);
      return;
    }
    try {
      if (showLoading) setLoading(true);
      else setRefreshing(true);
      const response = await getVendorById(vendorId);
      const vendorData = response?.data?.vendor || response?.vendor || {};
      setVendor(vendorData);
    } catch (error) {
      console.error('Failed to fetch vendor:', error);
      Alert.alert('Error', 'Unable to load vendor details.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchVendor(true);
  }, [vendorId]);

  const handleVisitMenu = () => {
    navigation.navigate('VendorMenuScreen', {
      vendorId,
      vendorName: vendor?.businessName || 'Vendor',
    });
  };

  const onRefresh = useCallback(() => {
    fetchVendor(false);
  }, [vendorId]);

  // ─── Data extraction ─────────────────────────────────────────
  const coverImage =
    buildImageUrl(vendor?.coverImage || vendor?.image) || FALLBACK_COVER;
  const avatarImage =
    buildImageUrl(vendor?.logo || vendor?.avatar) || FALLBACK_AVATAR;
  const businessName = vendor?.businessName || 'The Grand Restaurant';
  const description =
    vendor?.description ||
    'Authentic cuisine made with love. Enjoy our delicious dishes in a cozy ambiance.';
  const addressString = formatAddress(vendor?.address);
  const rating = parseFloat(vendor?.rating) || 4.5;
  const phone = getPhoneNumber(vendor?.phone || vendor?.contactNumber);

  const categories = vendor?.categories || [];
  const cuisineNames =
    categories
      .map(c => c.name)
      .filter(Boolean)
      .slice(0, 3)
      .join(' • ') || 'Indian • Chinese • Continental';

  const openingHours = vendor?.openingHours || '10:00 AM – 10:00 PM';
  const deliveryInfo = vendor?.deliveryInfo || 'Free delivery • 30-40 min';
  const reviewsCount = vendor?.reviewsCount || 200;

  // ─── Loading state ──────────────────────────────────────────
  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backBtn}
          >
            <Ionicons name="arrow-back" size={24} color={COLORS.title} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Restaurant</Text>
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
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backBtn}
          >
            <Ionicons name="arrow-back" size={24} color={COLORS.title} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Restaurant</Text>
          <View style={{ width: 24 }} />
        </View>
        <View style={styles.emptyContainer}>
          <Ionicons name="restaurant-outline" size={48} color={COLORS.muted} />
          <Text style={styles.emptyText}>Vendor not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  // ─── Main render ────────────────────────────────────────────
  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />

      {/* Standard Header (below status bar) */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backBtn}
        >
          <Ionicons name="arrow-back" size={24} color={COLORS.title} />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {businessName}
        </Text>
        <TouchableOpacity style={styles.shareBtn}>
          <Ionicons
            name="share-social-outline"
            size={22}
            color={COLORS.title}
          />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[COLORS.primary]}
          />
        }
      >
        {/* Cover Image with overlay and status badge */}
        <View style={styles.coverWrapper}>
          <Image source={{ uri: coverImage }} style={styles.coverImage} />
          <View style={styles.coverOverlay} />
          <View style={styles.statusBadge}>
            <View style={styles.statusDot} />
            <Text style={styles.statusText}>Open Now</Text>
          </View>
          {/* Floating avatar */}
          <View style={styles.avatarWrapper}>
            <Image source={{ uri: avatarImage }} style={styles.avatar} />
          </View>
        </View>

        {/* Info Card */}
        <View style={styles.infoCard}>
          <View style={styles.nameRatingRow}>
            <Text style={styles.businessName}>{businessName}</Text>
            <View style={styles.ratingContainer}>
              <View style={styles.starsRow}>{renderStars(rating)}</View>
              <Text style={styles.ratingNumber}>{rating.toFixed(1)}</Text>
            </View>
          </View>

          {/* Cuisine tags */}
          <View style={styles.tagsContainer}>
            {cuisineNames.split(' • ').map((tag, index) => (
              <View key={index} style={styles.tag}>
                <Text style={styles.tagText}>{tag}</Text>
              </View>
            ))}
            <Text style={styles.reviewCount}>{reviewsCount}+ reviews</Text>
          </View>

          <View style={styles.divider} />

          {/* Address */}
          <View style={styles.infoRow}>
            <Ionicons
              name="location-outline"
              size={20}
              color={COLORS.primary}
            />
            <Text style={styles.infoText}>{addressString}</Text>
          </View>

          {/* Phone */}
          {phone && (
            <TouchableOpacity
              style={styles.infoRow}
              onPress={() => Linking.openURL(`tel:${phone}`)}
              activeOpacity={0.7}
            >
              <Ionicons name="call-outline" size={20} color={COLORS.primary} />
              <Text style={[styles.infoText, styles.phoneText]}>{phone}</Text>
            </TouchableOpacity>
          )}

          <Text style={styles.description}>{description}</Text>

          {/* Extra info: hours & delivery */}
          <View style={styles.extraRow}>
            <View style={styles.extraItem}>
              <Ionicons name="time-outline" size={18} color={COLORS.muted} />
              <Text style={styles.extraText}>{openingHours}</Text>
            </View>
            <View style={styles.extraItem}>
              <Ionicons name="bicycle-outline" size={18} color={COLORS.muted} />
              <Text style={styles.extraText}>{deliveryInfo}</Text>
            </View>
          </View>
        </View>

        {/* View Menu Button */}
        <TouchableOpacity
          style={styles.menuButton}
          onPress={handleVisitMenu}
          activeOpacity={0.8}
        >
          <Text style={styles.menuButtonText}>View Full Menu</Text>
          <Ionicons
            name="arrow-forward-circle"
            size={24}
            color={COLORS.white}
          />
        </TouchableOpacity>

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  // Standard header (fixed below status bar)
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backBtn: { padding: 4 },
  shareBtn: { padding: 4 },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.title,
    textAlign: 'center',
    marginHorizontal: 8,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    marginTop: 12,
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.muted,
  },
  scrollView: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    paddingBottom: 30,
  },
  // ─── Cover ────────────────────────────────────────────────
  coverWrapper: {
    position: 'relative',
    width: '100%',
    height: 240,
    backgroundColor: COLORS.lightGray,
  },
  coverImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  coverOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  statusBadge: {
    position: 'absolute',
    top: 16,
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(34, 197, 94, 0.9)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 30,
    gap: 6,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.white,
  },
  statusText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  avatarWrapper: {
    position: 'absolute',
    bottom: -40,
    left: 20,
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    borderColor: COLORS.white,
    backgroundColor: COLORS.white,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
    overflow: 'hidden',
  },
  avatar: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  // ─── Info Card ────────────────────────────────────────────
  infoCard: {
    backgroundColor: COLORS.white,
    marginHorizontal: 16,
    marginTop: 50,
    borderRadius: 20,
    padding: 20,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  nameRatingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 6,
  },
  businessName: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.title,
    flex: 1,
    marginRight: 12,
  },
  ratingContainer: {
    alignItems: 'flex-end',
  },
  starsRow: {
    flexDirection: 'row',
    marginBottom: 2,
  },
  ratingNumber: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.text,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    marginBottom: 14,
  },
  tag: {
    backgroundColor: COLORS.lightGray,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
    marginRight: 8,
    marginBottom: 4,
  },
  tagText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.muted,
  },
  reviewCount: {
    fontSize: 12,
    fontWeight: '500',
    color: COLORS.muted,
    marginLeft: 4,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: 14,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 10,
  },
  infoText: {
    fontSize: 15,
    color: COLORS.text,
    flex: 1,
    lineHeight: 22,
  },
  phoneText: {
    color: COLORS.primary,
    fontWeight: '600',
  },
  description: {
    fontSize: 15,
    lineHeight: 24,
    color: COLORS.text,
    marginTop: 4,
    marginBottom: 16,
  },
  extraRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 4,
  },
  extraItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  extraText: {
    fontSize: 13,
    color: COLORS.muted,
    fontWeight: '500',
  },
  // ─── Menu Button ──────────────────────────────────────────
  menuButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    marginHorizontal: 24,
    marginTop: 28,
    paddingVertical: 16,
    borderRadius: 30,
    gap: 12,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 6,
  },
  menuButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.white,
    letterSpacing: 0.3,
  },
  bottomSpacer: {
    height: 20,
  },
});
