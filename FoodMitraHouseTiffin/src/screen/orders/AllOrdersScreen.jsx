// screens/partner/AllOrdersScreen.js
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
  StatusBar,
  Image,
  TextInput,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from '@react-native-vector-icons/ionicons';
import { COLORS } from '../../constants/colors';

// Dummy orders (copy from HomeScreen)
const ALL_ORDERS = [
  {
    id: '1',
    customer: 'Rajesh Kumar',
    items: '2 x Thali + 1 x Dal Rice',
    time: '5 min ago',
    image:
      'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=200&q=80',
    status: 'preparing',
    total: '₹240',
    address: '123, MG Road, Indore',
    phone: '+91 98765 43210',
  },
  {
    id: '2',
    customer: 'Priya Sharma',
    items: '1 x Paneer Sabzi + 3 Chapati',
    time: '12 min ago',
    image:
      'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=200&q=80',
    status: 'preparing',
    total: '₹180',
    address: '45, New Colony, Indore',
    phone: '+91 98765 43211',
  },
  {
    id: '3',
    customer: 'Amit Singh',
    items: '2 x Veg Biryani',
    time: '25 min ago',
    image:
      'https://images.unsplash.com/photo-1589302168068-964664d93dc0?auto=format&fit=crop&w=200&q=80',
    status: 'ready',
    total: '₹450',
    address: '78, Saket Nagar, Indore',
    phone: '+91 98765 43212',
  },
  // more...
];

const AllOrdersScreen = ({ navigation }) => {
  const [orders, setOrders] = useState(ALL_ORDERS);
  const [filteredOrders, setFilteredOrders] = useState(ALL_ORDERS);
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (searchQuery.trim()) {
      const filtered = ALL_ORDERS.filter(
        order =>
          order.customer.toLowerCase().includes(searchQuery.toLowerCase()) ||
          order.items.toLowerCase().includes(searchQuery.toLowerCase()) ||
          order.id.includes(searchQuery),
      );
      setFilteredOrders(filtered);
    } else {
      setFilteredOrders(ALL_ORDERS);
    }
  }, [searchQuery]);

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => {
      setOrders(ALL_ORDERS);
      setRefreshing(false);
    }, 1200);
  };

  const renderOrder = ({ item }) => (
    <Pressable
      style={styles.orderCard}
      onPress={() => navigation.navigate('OrderDetail', { order: item })}
    >
      <Image source={{ uri: item.image }} style={styles.orderImage} />
      <View style={styles.orderContent}>
        <View style={styles.orderHeader}>
          <Text style={styles.orderCustomer}>{item.customer}</Text>
          <Text style={styles.orderTime}>{item.time}</Text>
        </View>
        <Text style={styles.orderItems}>{item.items}</Text>
        <View style={styles.orderFooter}>
          <Text style={styles.orderTotal}>{item.total}</Text>
          <View
            style={[
              styles.statusBadge,
              {
                backgroundColor:
                  item.status === 'preparing' ? '#f59e0b' : '#3b82f6',
              },
            ]}
          >
            <Text style={styles.statusText}>{item.status}</Text>
          </View>
        </View>
      </View>
    </Pressable>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
      <View style={styles.container}>
        <View style={styles.header}>
          <Pressable onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color={COLORS.title} />
          </Pressable>
          <Text style={styles.headerTitle}>All Orders</Text>
          <View style={{ width: 40 }} />
        </View>

        <View style={styles.searchContainer}>
          <Ionicons name="search" size={18} color={COLORS.muted} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search orders..."
            placeholderTextColor="#9ca3af"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <Pressable onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={18} color={COLORS.muted} />
            </Pressable>
          )}
        </View>

        <FlatList
          data={filteredOrders}
          keyExtractor={item => item.id}
          renderItem={renderOrder}
          contentContainerStyle={{ paddingBottom: 80 }}
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
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.background },
  container: { flex: 1, paddingHorizontal: 16, paddingTop: 8 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  backBtn: { padding: 4 },
  headerTitle: { fontSize: 20, fontWeight: '900', color: COLORS.title },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 14,
  },
  searchInput: { flex: 1, marginLeft: 8, fontSize: 14, color: COLORS.title },
  orderCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  orderImage: {
    width: 60,
    height: 60,
    borderRadius: 12,
    marginRight: 12,
    backgroundColor: '#f0ece8',
  },
  orderContent: { flex: 1, justifyContent: 'space-between' },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  orderCustomer: { fontSize: 15, fontWeight: '700', color: COLORS.title },
  orderTime: { fontSize: 11, color: COLORS.muted },
  orderItems: { fontSize: 13, color: COLORS.text, marginVertical: 2 },
  orderFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  orderTotal: { fontSize: 14, fontWeight: '700', color: COLORS.primary },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },
  statusText: {
    color: COLORS.white,
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
});

export default AllOrdersScreen;
