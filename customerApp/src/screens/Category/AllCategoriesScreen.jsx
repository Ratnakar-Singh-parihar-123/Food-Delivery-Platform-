// screens/AllCategoriesScreen.js
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  Pressable,
  StyleSheet,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from '@react-native-vector-icons/ionicons';
import { getFoodCategories } from '../../api/customerApi';
import { buildImageUrl } from '../../utils/imageUtils';

export default function AllCategoriesScreen({ navigation }) {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await getFoodCategories();
      if (res.success) setCategories(res.data);
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
        <Text style={styles.headerTitle}>All Categories</Text>
        <View style={{ width: 24 }} />
      </View>
      <FlatList
        data={categories}
        keyExtractor={item => item._id}
        numColumns={3}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <Pressable
            style={styles.categoryCard}
            onPress={() =>
              navigation.navigate('CategoryItems', {
                categoryId: item._id,
                categoryName: item.name,
              })
            }
          >
            <View style={styles.iconContainer}>
              {item.image ? (
                <Image
                  source={{ uri: buildImageUrl(item.image) }}
                  style={styles.image}
                />
              ) : (
                <Text style={styles.icon}>{item.icon || '🍽️'}</Text>
              )}
            </View>
            <Text style={styles.name} numberOfLines={2}>
              {item.name}
            </Text>
          </Pressable>
        )}
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
  list: { paddingHorizontal: 8, paddingBottom: 20 },
  categoryCard: {
    flex: 1,
    alignItems: 'center',
    margin: 8,
    padding: 12,
    backgroundColor: 'white',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#f5f0eb',
    justifyContent: 'center',
    alignItems: 'center',
  },
  icon: { fontSize: 30 },
  image: { width: 60, height: 60, borderRadius: 30 },
  name: {
    marginTop: 8,
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
    color: '#171717',
  },
});
