// screens/FastDeliveryListScreen.js
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  Pressable,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from '@react-native-vector-icons/ionicons';
import { getFastDeliveryVendors } from '../../api/customerApi';
import { buildImageUrl } from '../../utils/imageUtils';

export default function FastDeliveryListScreen({ navigation }) {
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const res = await getFastDeliveryVendors(50);
      if (res.success) {
        const formatted = res.data.map(v => ({
          id: v._id,
          name: v.businessName,
          time: `${v.averagePreparationTime || 15} min`,
          rating: v.rating || 4.0,
          image: buildImageUrl(v.profileImage),
        }));
        setVendors(formatted);
      }
    } catch (error) {
      console.warn(error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator size="large" color="#ff5a1f" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#171717" />
        </Pressable>
        <Text style={styles.headerTitle}>Fast Delivery</Text>
        <View style={{ width: 24 }} />
      </View>
      <FlatList
        data={vendors}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <Pressable
            style={styles.card}
            onPress={() =>
              navigation.navigate('VendorDetail', { vendorId: item.id })
            }
          >
            <Image source={{ uri: item.image }} style={styles.image} />
            <View style={styles.info}>
              <Text style={styles.name}>{item.name}</Text>
              <View style={styles.meta}>
                <Ionicons name="time-outline" size={14} color="#8b929f" />
                <Text style={styles.time}>{item.time}</Text>
                <Ionicons name="star" size={14} color="#FFB800" />
                <Text style={styles.rating}>{item.rating}</Text>
              </View>
            </View>
          </Pressable>
        )}
        contentContainerStyle={styles.list}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fffaf7' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#171717' },
  list: { padding: 16 },
  card: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: 12,
    marginBottom: 12,
    padding: 12,
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  image: { width: 60, height: 60, borderRadius: 12, marginRight: 12 },
  info: { flex: 1, justifyContent: 'center' },
  name: { fontSize: 16, fontWeight: '600' },
  meta: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  time: { marginLeft: 2, marginRight: 10, color: '#8b929f' },
  rating: { marginLeft: 2, color: '#8b929f' },
});
