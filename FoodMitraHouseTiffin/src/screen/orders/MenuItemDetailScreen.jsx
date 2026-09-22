// screens/partner/MenuItemDetailScreen.js
import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  Pressable,
  ScrollView,
  StatusBar,
  Animated,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from '@react-native-vector-icons/ionicons';
import LinearGradient from 'react-native-linear-gradient';
import { COLORS } from '../../constants/colors';

const { width, height } = Dimensions.get('window');

const MenuItemDetailScreen = ({ navigation, route }) => {
  const { item } = route.params || {};

  // Fallback if no item passed
  const fallbackItem = {
    id: '1',
    name: 'Special Thali',
    price: 180,
    category: 'Lunch',
    available: true,
    image:
      'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80',
    description:
      'A complete meal with paneer, dal, rice, naan, raita, salad, and papad.',
    subItems: [
      { name: 'Paneer Butter Masala', qty: '1 bowl' },
      { name: 'Dal Tadka', qty: '1 bowl' },
      { name: 'Jeera Rice', qty: '1 plate' },
      { name: 'Butter Naan', qty: '2 pcs' },
      { name: 'Raita', qty: '1 bowl' },
      { name: 'Salad', qty: '1 plate' },
      { name: 'Papad', qty: '2 pcs' },
    ],
  };

  const menuItem = item || fallbackItem;

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar
        barStyle="light-content"
        backgroundColor="transparent"
        translucent
      />
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Cover Image */}
        <View style={styles.coverContainer}>
          <Image source={{ uri: menuItem.image }} style={styles.coverImage} />
          <LinearGradient
            colors={['rgba(0,0,0,0.1)', 'rgba(0,0,0,0.7)']}
            style={styles.coverGradient}
          />
          <Pressable onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color={COLORS.white} />
          </Pressable>
          <View style={styles.coverFooter}>
            <Text style={styles.coverTitle}>{menuItem.name}</Text>
            <View style={styles.coverStatus}>
              <Ionicons
                name={menuItem.available ? 'checkmark-circle' : 'close-circle'}
                size={20}
                color={menuItem.available ? COLORS.success : '#ef4444'}
              />
              <Text style={styles.coverStatusText}>
                {menuItem.available ? 'Available' : 'Unavailable'}
              </Text>
            </View>
          </View>
        </View>

        {/* Animated Content */}
        <Animated.View
          style={{
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
            paddingHorizontal: 16,
            paddingTop: 16,
          }}
        >
          {/* Price & Category */}
          <View style={styles.priceRow}>
            <Text style={styles.price}>₹{menuItem.price}</Text>
            <View style={styles.categoryBadge}>
              <Text style={styles.categoryBadgeText}>{menuItem.category}</Text>
            </View>
          </View>

          {/* Description */}
          {menuItem.description && (
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Description</Text>
              <Text style={styles.description}>{menuItem.description}</Text>
            </View>
          )}

          {/* Sub-items */}
          {menuItem.subItems && menuItem.subItems.length > 0 && (
            <View style={styles.card}>
              <Text style={styles.cardTitle}>What's Included</Text>
              {menuItem.subItems.map((sub, idx) => (
                <View key={idx} style={styles.subItemRow}>
                  <Ionicons name="ellipse" size={6} color={COLORS.primary} />
                  <Text style={styles.subItemName}>{sub.name}</Text>
                  <Text style={styles.subItemQty}>{sub.qty}</Text>
                </View>
              ))}
            </View>
          )}

          {/* Actions */}
          <View style={styles.actionContainer}>
            <Pressable
              style={[styles.actionBtn, { backgroundColor: COLORS.primary }]}
              onPress={() => alert('Edit this item')}
            >
              <Ionicons name="pencil" size={20} color={COLORS.white} />
              <Text style={styles.actionText}>Edit</Text>
            </Pressable>
            <Pressable
              style={[styles.actionBtn, { backgroundColor: '#ef4444' }]}
              onPress={() => alert('Delete this item')}
            >
              <Ionicons name="trash" size={20} color={COLORS.white} />
              <Text style={styles.actionText}>Delete</Text>
            </Pressable>
          </View>
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.background },
  container: { flex: 1 },

  // ─── COVER ──────────────────────────────────────────────
  coverContainer: {
    height: height * 0.35,
    position: 'relative',
  },
  coverImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  coverGradient: {
    ...StyleSheet.absoluteFillObject,
  },
  backBtn: {
    position: 'absolute',
    top: 12,
    left: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  coverFooter: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    right: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  coverTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: COLORS.white,
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
    flex: 1,
  },
  coverStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.4)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
  },
  coverStatusText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: '700',
  },

  // ─── CONTENT ────────────────────────────────────────────
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  price: {
    fontSize: 26,
    fontWeight: '900',
    color: COLORS.primary,
  },
  categoryBadge: {
    backgroundColor: COLORS.soft,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  categoryBadgeText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.primary,
  },

  card: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.title,
    marginBottom: 10,
  },
  description: {
    fontSize: 14,
    color: COLORS.text,
    lineHeight: 22,
  },
  subItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
  },
  subItemName: {
    flex: 1,
    fontSize: 14,
    color: COLORS.text,
    marginLeft: 8,
  },
  subItemQty: {
    fontSize: 13,
    color: COLORS.muted,
    fontWeight: '500',
  },

  actionContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: 16,
    gap: 12,
    paddingBottom: 20,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    flex: 1,
    justifyContent: 'center',
    gap: 8,
  },
  actionText: {
    color: COLORS.white,
    fontWeight: '700',
    fontSize: 15,
  },
});

export default MenuItemDetailScreen;
