// screens/partner/MenuScreen.js
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
  StatusBar,
  TextInput,
  Modal,
  Alert,
  RefreshControl,
  Switch,
  Image,
  ScrollView,
  Animated,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from '@react-native-vector-icons/ionicons';
import LinearGradient from 'react-native-linear-gradient';
import { COLORS } from '../../constants/colors';

const { width } = Dimensions.get('window');

// ─── DUMMY DATA WITH SUB-ITEMS ──────────────────────────
const DUMMY_MENU = [
  {
    id: '1',
    name: 'Special Thali',
    price: 180,
    category: 'Lunch',
    available: true,
    image:
      'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=200&q=80',
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
  },
  {
    id: '2',
    name: 'Normal Thali',
    price: 120,
    category: 'Lunch',
    available: true,
    image:
      'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=200&q=80',
    description:
      'Simple yet satisfying meal with mixed veg, dal, rice, chapati.',
    subItems: [
      { name: 'Mixed Veg', qty: '1 bowl' },
      { name: 'Dal', qty: '1 bowl' },
      { name: 'Steam Rice', qty: '1 plate' },
      { name: 'Chapati', qty: '3 pcs' },
      { name: 'Pickle', qty: '1 pkt' },
    ],
  },
  {
    id: '3',
    name: 'Dal Rice Combo',
    price: 80,
    category: 'Lunch',
    available: true,
    image:
      'https://images.unsplash.com/photo-1589302168068-964664d93dc0?auto=format&fit=crop&w=200&q=80',
    description: 'Classic comfort food with dal, rice, and papad.',
    subItems: [
      { name: 'Dal', qty: '1 bowl' },
      { name: 'Steam Rice', qty: '1 plate' },
      { name: 'Papad', qty: '1 pcs' },
    ],
  },
  {
    id: '4',
    name: 'Paneer Sabzi',
    price: 100,
    category: 'Dinner',
    available: false,
    image:
      'https://images.unsplash.com/photo-1589302168068-964664d93dc0?auto=format&fit=crop&w=200&q=80',
    description: 'Rich paneer curry with butter naan.',
    subItems: [
      { name: 'Paneer Butter Masala', qty: '1 bowl' },
      { name: 'Butter Naan', qty: '2 pcs' },
    ],
  },
  {
    id: '5',
    name: 'Veg Biryani',
    price: 150,
    category: 'Dinner',
    available: true,
    image:
      'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=200&q=80',
    description: 'Fragrant basmati rice layered with vegetables and spices.',
    subItems: [
      { name: 'Biryani Rice', qty: '1 plate' },
      { name: 'Raita', qty: '1 bowl' },
      { name: 'Salad', qty: '1 plate' },
    ],
  },
  {
    id: '6',
    name: 'Samosa',
    price: 30,
    category: 'Snacks',
    available: true,
    image:
      'https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=200&q=80',
    description: 'Crispy fried pastry filled with spiced potatoes.',
    subItems: [
      { name: 'Samosa', qty: '2 pcs' },
      { name: 'Chutney', qty: '1 pkt' },
    ],
  },
];

const CATEGORIES = [
  { id: 'All', label: 'All', icon: 'grid-outline' },
  { id: 'Lunch', label: 'Lunch', icon: 'sunny-outline' },
  { id: 'Dinner', label: 'Dinner', icon: 'moon-outline' },
  { id: 'Snacks', label: 'Snacks', icon: 'cafe-outline' },
];

// ─── MENU CARD ────────────────────────────────────────────
const MenuCard = ({ item, onToggle, onEdit, onDelete, onPress }) => {
  const [isAvailable, setIsAvailable] = useState(item.available);
  const [expanded, setExpanded] = useState(false);
  const rotateAnim = useRef(new Animated.Value(0)).current;

  const handleToggle = () => {
    setIsAvailable(!isAvailable);
    onToggle(item.id);
  };

  const toggleExpand = () => {
    setExpanded(!expanded);
    Animated.timing(rotateAnim, {
      toValue: expanded ? 0 : 1,
      duration: 250,
      useNativeDriver: true,
    }).start();
  };

  const rotate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '180deg'],
  });

  return (
    <Pressable style={styles.menuCardWrapper} onPress={onPress}>
      <View style={styles.menuCard}>
        {/* Colored strip */}
        <View
          style={[
            styles.colorStrip,
            { backgroundColor: isAvailable ? COLORS.success : '#ef4444' },
          ]}
        />

        {/* Main content */}
        <View style={styles.cardMain}>
          <View style={styles.cardRow}>
            <Image source={{ uri: item.image }} style={styles.dishImage} />
            <View style={styles.cardInfo}>
              <View style={styles.cardHeader}>
                <Text style={styles.dishName}>{item.name}</Text>
                <Text style={styles.dishPrice}>₹{item.price}</Text>
              </View>
              <Text style={styles.dishCategory}>{item.category}</Text>
              <View style={styles.cardFooter}>
                <View style={styles.toggleContainer}>
                  <Text style={styles.toggleLabel}>
                    {isAvailable ? 'Available' : 'Unavailable'}
                  </Text>
                  <Switch
                    trackColor={{ false: '#e5e7eb', true: COLORS.primary }}
                    thumbColor={isAvailable ? COLORS.white : '#f4f3f4'}
                    onValueChange={handleToggle}
                    value={isAvailable}
                  />
                </View>
                <View style={styles.actionButtons}>
                  <Pressable
                    style={[styles.actionBtn, { backgroundColor: '#dbeafe' }]}
                    onPress={() => onEdit(item)}
                  >
                    <Ionicons
                      name="pencil-outline"
                      size={16}
                      color={COLORS.primary}
                    />
                  </Pressable>
                  <Pressable
                    style={[styles.actionBtn, { backgroundColor: '#fecaca' }]}
                    onPress={() => onDelete(item.id)}
                  >
                    <Ionicons name="trash-outline" size={16} color="#ef4444" />
                  </Pressable>
                </View>
              </View>
            </View>
          </View>

          {/* Expand/Collapse Button */}
          {item.subItems && item.subItems.length > 0 && (
            <Pressable style={styles.expandBtn} onPress={toggleExpand}>
              <Text style={styles.expandBtnText}>
                {expanded ? 'Hide Items' : `View ${item.subItems.length} Items`}
              </Text>
              <Animated.View style={{ transform: [{ rotate }] }}>
                <Ionicons
                  name="chevron-down"
                  size={18}
                  color={COLORS.primary}
                />
              </Animated.View>
            </Pressable>
          )}

          {/* Sub-items list */}
          {expanded && item.subItems && (
            <View style={styles.subItemsContainer}>
              {item.subItems.map((sub, idx) => (
                <View key={idx} style={styles.subItemRow}>
                  <Ionicons name="ellipse" size={6} color={COLORS.primary} />
                  <Text style={styles.subItemName}>{sub.name}</Text>
                  <Text style={styles.subItemQty}>{sub.qty}</Text>
                </View>
              ))}
            </View>
          )}
        </View>
      </View>
    </Pressable>
  );
};

// ─── MAIN SCREEN ──────────────────────────────────────────
const MenuScreen = ({ navigation }) => {
  const [menu, setMenu] = useState(DUMMY_MENU);
  const [filteredMenu, setFilteredMenu] = useState(DUMMY_MENU);
  const [activeCategory, setActiveCategory] = useState('All');
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    category: 'Lunch',
    image: '',
    subItems: [],
    description: '',
  });

  // Filter menu
  useEffect(() => {
    if (activeCategory === 'All') {
      setFilteredMenu(menu);
    } else {
      setFilteredMenu(menu.filter(item => item.category === activeCategory));
    }
  }, [activeCategory, menu]);

  // ─── CRUD ────────────────────────────────────────────────
  const addItem = () => {
    if (!formData.name || !formData.price) {
      Alert.alert('Error', 'Please fill name and price');
      return;
    }
    const newItem = {
      id: Date.now().toString(),
      name: formData.name,
      price: parseInt(formData.price),
      category: formData.category || 'Lunch',
      available: true,
      image: formData.image || 'https://via.placeholder.com/200',
      description: formData.description || '',
      subItems: formData.subItems || [],
    };
    setMenu([...menu, newItem]);
    resetForm();
    setModalVisible(false);
  };

  const editItem = () => {
    if (!formData.name || !formData.price) {
      Alert.alert('Error', 'Please fill name and price');
      return;
    }
    const updated = menu.map(item =>
      item.id === editingItem.id
        ? {
            ...item,
            name: formData.name,
            price: parseInt(formData.price),
            category: formData.category || item.category,
            image: formData.image || item.image,
            description: formData.description || '',
            subItems: formData.subItems || [],
          }
        : item,
    );
    setMenu(updated);
    resetForm();
    setEditingItem(null);
    setModalVisible(false);
  };

  const deleteItem = id => {
    Alert.alert('Delete Dish', 'Are you sure you want to delete this item?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => setMenu(menu.filter(item => item.id !== id)),
      },
    ]);
  };

  const toggleAvailability = id => {
    setMenu(
      menu.map(item =>
        item.id === id ? { ...item, available: !item.available } : item,
      ),
    );
  };

  const resetForm = () => {
    setFormData({
      name: '',
      price: '',
      category: 'Lunch',
      image: '',
      subItems: [],
      description: '',
    });
  };

  const openAddModal = () => {
    resetForm();
    setEditingItem(null);
    setModalVisible(true);
  };

  const openEditModal = item => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      price: item.price.toString(),
      category: item.category,
      image: item.image || '',
      subItems: item.subItems || [],
      description: item.description || '',
    });
    setModalVisible(true);
  };

  // ─── PULL-TO-REFRESH ─────────────────────────────────────
  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => {
      setMenu(DUMMY_MENU);
      setRefreshing(false);
    }, 1200);
  };

  // ─── RENDER TABS (SLIM & SLEEK) ────────────────────────
  const renderTabs = () => (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.tabContainer}
    >
      {CATEGORIES.map(cat => {
        const isActive = activeCategory === cat.id;
        const count = menu.filter(
          item => cat.id === 'All' || item.category === cat.id,
        ).length;
        return (
          <Pressable
            key={cat.id}
            style={[styles.tab, isActive && styles.activeTab]}
            onPress={() => setActiveCategory(cat.id)}
          >
            <Ionicons
              name={cat.icon}
              size={18}
              color={isActive ? COLORS.white : COLORS.muted}
            />
            <Text style={[styles.tabText, isActive && styles.activeTabText]}>
              {cat.label}
            </Text>
            <View style={[styles.tabBadge, isActive && styles.activeTabBadge]}>
              <Text
                style={[
                  styles.tabBadgeText,
                  isActive && styles.activeTabBadgeText,
                ]}
              >
                {count}
              </Text>
            </View>
          </Pressable>
        );
      })}
    </ScrollView>
  );

  // ─── EMPTY STATE ─────────────────────────────────────────
  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="restaurant-outline" size={64} color={COLORS.muted} />
      <Text style={styles.emptyTitle}>No dishes found</Text>
      <Text style={styles.emptySubtitle}>
        {activeCategory === 'All'
          ? 'Start adding your delicious dishes!'
          : `No dishes in "${activeCategory}" category`}
      </Text>
      <Pressable style={styles.emptyAddBtn} onPress={openAddModal}>
        <Ionicons name="add" size={18} color={COLORS.white} />
        <Text style={styles.emptyAddText}>Add New Dish</Text>
      </Pressable>
    </View>
  );

  // ─── MODAL ────────────────────────────────────────────────
  const renderModal = () => (
    <Modal visible={modalVisible} transparent animationType="slide">
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>
              {editingItem ? 'Edit Dish' : 'Add New Dish'}
            </Text>
            <Pressable
              onPress={() => {
                setModalVisible(false);
                resetForm();
              }}
            >
              <Ionicons name="close" size={24} color={COLORS.title} />
            </Pressable>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            <Pressable
              style={styles.imageUpload}
              onPress={() =>
                Alert.alert('Upload Image', 'Pick an image from gallery')
              }
            >
              {formData.image ? (
                <Image
                  source={{ uri: formData.image }}
                  style={styles.uploadedImage}
                />
              ) : (
                <>
                  <Ionicons
                    name="camera-outline"
                    size={32}
                    color={COLORS.muted}
                  />
                  <Text style={styles.uploadText}>Add Image</Text>
                </>
              )}
            </Pressable>

            <TextInput
              style={styles.input}
              placeholder="Dish Name *"
              placeholderTextColor="#9ca3af"
              value={formData.name}
              onChangeText={text => setFormData({ ...formData, name: text })}
            />
            <TextInput
              style={styles.input}
              placeholder="Price *"
              placeholderTextColor="#9ca3af"
              keyboardType="numeric"
              value={formData.price}
              onChangeText={text => setFormData({ ...formData, price: text })}
            />
            <TextInput
              style={styles.input}
              placeholder="Description (optional)"
              placeholderTextColor="#9ca3af"
              value={formData.description}
              onChangeText={text =>
                setFormData({ ...formData, description: text })
              }
            />

            <View style={styles.categorySelector}>
              <Text style={styles.categoryLabel}>Category</Text>
              <View style={styles.categoryOptions}>
                {['Lunch', 'Dinner', 'Snacks'].map(cat => (
                  <Pressable
                    key={cat}
                    style={[
                      styles.categoryChip,
                      formData.category === cat && styles.categoryChipActive,
                    ]}
                    onPress={() => setFormData({ ...formData, category: cat })}
                  >
                    <Text
                      style={[
                        styles.categoryChipText,
                        formData.category === cat &&
                          styles.categoryChipTextActive,
                      ]}
                    >
                      {cat}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>

            <View style={styles.subItemsSection}>
              <Text style={styles.subItemsLabel}>
                Items included (comma separated)
              </Text>
              <TextInput
                style={[styles.input, { marginBottom: 0 }]}
                placeholder="e.g. Paneer-1 bowl, Rice-1 plate"
                placeholderTextColor="#9ca3af"
                value={formData.subItems
                  .map(s => `${s.name}-${s.qty}`)
                  .join(', ')}
                onChangeText={text => {
                  const pairs = text.split(',').map(s => s.trim());
                  const subItems = pairs
                    .filter(p => p.length > 0)
                    .map(p => {
                      const parts = p.split('-');
                      return {
                        name: parts[0]?.trim() || 'Item',
                        qty: parts[1]?.trim() || '1',
                      };
                    });
                  setFormData({ ...formData, subItems });
                }}
              />
            </View>

            <View style={styles.modalActions}>
              <Pressable
                style={[styles.modalBtn, { backgroundColor: '#e5e7eb' }]}
                onPress={() => {
                  setModalVisible(false);
                  resetForm();
                }}
              >
                <Text style={{ color: COLORS.text, fontWeight: '600' }}>
                  Cancel
                </Text>
              </Pressable>
              <Pressable
                style={[styles.modalBtn, { backgroundColor: COLORS.primary }]}
                onPress={editingItem ? editItem : addItem}
              >
                <Text style={{ color: COLORS.white, fontWeight: '700' }}>
                  {editingItem ? 'Update' : 'Add'}
                </Text>
              </Pressable>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>My Menu</Text>
          <Pressable style={styles.addBtn} onPress={openAddModal}>
            <LinearGradient
              colors={[COLORS.primary, COLORS.primaryDark]}
              style={styles.addBtnGradient}
            >
              <Ionicons name="add" size={28} color={COLORS.white} />
            </LinearGradient>
          </Pressable>
        </View>

        {/* Category Tabs - SLIM & SLEEK */}
        {renderTabs()}

        {/* Menu List */}
        <FlatList
          data={filteredMenu}
          keyExtractor={item => item.id}
          renderItem={({ item }) => (
            <MenuCard
              item={item}
              onToggle={toggleAvailability}
              onEdit={openEditModal}
              onDelete={deleteItem}
              onPress={() => navigation.navigate('MenuItemDetail', { item })}
            />
          )}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={renderEmpty}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[COLORS.primary]}
              tintColor={COLORS.primary}
            />
          }
        />
      </View>

      {/* Modal */}
      {renderModal()}
    </SafeAreaView>
  );
};

// ─── STYLES ──────────────────────────────────────────────
const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.background },
  container: { flex: 1, paddingHorizontal: 16, paddingTop: 8 },

  // ─── HEADER ──────────────────────────────────────────────
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: COLORS.title,
  },
  addBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  addBtnGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // ─── TABS (SLIM & SLEEK) ─────────────────────────────
  tabContainer: {
    paddingVertical: 6,
    marginBottom: 12,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 7,
    paddingHorizontal: 14,
    borderRadius: 24,
    backgroundColor: '#f0ece8',
    marginRight: 8,
    gap: 5,
    height: 40,
    alignSelf: 'center',
  },
  activeTab: {
    backgroundColor: COLORS.primary,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
  },
  tabText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.text,
  },
  activeTabText: {
    color: COLORS.white,
  },
  tabBadge: {
    backgroundColor: 'rgba(0,0,0,0.06)',
    borderRadius: 12,
    paddingHorizontal: 6,
    minWidth: 20,
    alignItems: 'center',
    paddingVertical: 1,
  },
  activeTabBadge: {
    backgroundColor: 'rgba(255,255,255,0.25)',
  },
  tabBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.text,
  },
  activeTabBadgeText: {
    color: COLORS.white,
  },

  // ─── MENU CARD ──────────────────────────────────────────
  listContent: {
    paddingBottom: 80,
  },
  menuCardWrapper: {
    marginBottom: 12,
  },
  menuCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  colorStrip: {
    width: 6,
    height: '100%',
  },
  cardMain: {
    flex: 1,
    padding: 10,
  },
  cardRow: {
    flexDirection: 'row',
  },
  dishImage: {
    width: 70,
    height: 70,
    borderRadius: 12,
    marginRight: 10,
    backgroundColor: '#f0ece8',
  },
  cardInfo: {
    flex: 1,
    justifyContent: 'space-between',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dishName: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.title,
  },
  dishPrice: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.primary,
  },
  dishCategory: {
    fontSize: 12,
    color: COLORS.muted,
    marginTop: 2,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 6,
  },
  toggleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  toggleLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.text,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 6,
  },
  actionBtn: {
    padding: 6,
    borderRadius: 8,
  },

  // ─── EXPAND / SUB-ITEMS ──────────────────────────────────
  expandBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
    marginTop: 6,
    backgroundColor: COLORS.soft,
    borderRadius: 10,
    gap: 6,
  },
  expandBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.primary,
  },
  subItemsContainer: {
    marginTop: 8,
    paddingHorizontal: 4,
    backgroundColor: '#faf8f7',
    borderRadius: 10,
    paddingVertical: 8,
  },
  subItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 3,
    paddingHorizontal: 8,
  },
  subItemName: {
    flex: 1,
    fontSize: 13,
    color: COLORS.text,
    marginLeft: 6,
  },
  subItemQty: {
    fontSize: 12,
    color: COLORS.muted,
    fontWeight: '500',
  },

  // ─── EMPTY STATE ─────────────────────────────────────────
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.title,
    marginTop: 12,
  },
  emptySubtitle: {
    fontSize: 13,
    color: COLORS.muted,
    marginTop: 4,
    textAlign: 'center',
  },
  emptyAddBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 30,
    marginTop: 16,
    gap: 6,
  },
  emptyAddText: {
    color: COLORS.white,
    fontWeight: '700',
    fontSize: 14,
  },

  // ─── MODAL ───────────────────────────────────────────────
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  modalContent: {
    backgroundColor: COLORS.white,
    borderRadius: 20,
    padding: 20,
    width: '100%',
    maxHeight: '85%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.title,
  },
  imageUpload: {
    height: 100,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: COLORS.border,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    backgroundColor: '#faf8f7',
    overflow: 'hidden',
  },
  uploadedImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  uploadText: {
    fontSize: 12,
    color: COLORS.muted,
    marginTop: 4,
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    paddingHorizontal: 14,
    fontSize: 14,
    marginBottom: 12,
    backgroundColor: COLORS.white,
  },
  categorySelector: {
    marginBottom: 16,
  },
  categoryLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 6,
  },
  categoryOptions: {
    flexDirection: 'row',
    gap: 8,
  },
  categoryChip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#f0ece8',
  },
  categoryChipActive: {
    backgroundColor: COLORS.primary,
  },
  categoryChipText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.text,
  },
  categoryChipTextActive: {
    color: COLORS.white,
  },
  subItemsSection: {
    marginBottom: 16,
  },
  subItemsLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 6,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
    marginTop: 8,
  },
  modalBtn: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
  },
});

export default MenuScreen;
