import React from 'react';

import {
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from '@react-native-vector-icons/ionicons';

import ScreenHeader from '../../components/ScreenHeader';

export default function BasicListScreen({
  navigation,
  title,
  subtitle,
  items,
  emptyTitle,
  emptyText,
  actionLabel,
  onAction,
}) {
  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#fffaf7" />

      <ScreenHeader
        navigation={navigation}
        title={title}
        subtitle={subtitle}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        {items?.length ? (
          items.map((item, index) => (
            <View key={item.id || `${item.title}-${index}`} style={styles.card}>
              <View style={styles.icon}>
                <Ionicons
                  name={item.icon || 'ellipse-outline'}
                  size={21}
                  color="#ff5a1f"
                />
              </View>

              <View style={styles.cardContent}>
                <Text style={styles.cardTitle}>{item.title}</Text>
                {item.subtitle ? (
                  <Text style={styles.cardSubtitle}>{item.subtitle}</Text>
                ) : null}
                {item.badge ? (
                  <Text style={styles.badge}>{item.badge}</Text>
                ) : null}
              </View>

              <Ionicons name="chevron-forward" size={18} color="#c7c1bd" />
            </View>
          ))
        ) : (
          <View style={styles.empty}>
            <View style={styles.emptyIcon}>
              <Ionicons name="restaurant-outline" size={34} color="#ff5a1f" />
            </View>
            <Text style={styles.emptyTitle}>{emptyTitle}</Text>
            <Text style={styles.emptyText}>{emptyText}</Text>
          </View>
        )}

        {actionLabel ? (
          <Pressable onPress={onAction} style={styles.actionButton}>
            <Ionicons name="add" size={20} color="#ffffff" />
            <Text style={styles.actionText}>{actionLabel}</Text>
          </Pressable>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fffaf7',
  },
  content: {
    padding: 18,
    paddingBottom: 120,
  },
  card: {
    minHeight: 82,
    marginBottom: 12,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 21,
    borderWidth: 1,
    borderColor: '#eee5df',
    backgroundColor: '#ffffff',
  },
  icon: {
    width: 46,
    height: 46,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff0e9',
  },
  cardContent: {
    flex: 1,
    marginLeft: 12,
  },
  cardTitle: {
    color: '#171717',
    fontSize: 12.5,
    fontWeight: '900',
  },
  cardSubtitle: {
    marginTop: 5,
    color: '#8f8f98',
    fontSize: 9.5,
    lineHeight: 14,
  },
  badge: {
    alignSelf: 'flex-start',
    marginTop: 7,
    paddingHorizontal: 8,
    paddingVertical: 4,
    overflow: 'hidden',
    borderRadius: 8,
    color: '#15803d',
    fontSize: 8,
    fontWeight: '900',
    backgroundColor: '#ecfdf3',
  },
  empty: {
    paddingTop: 90,
    alignItems: 'center',
  },
  emptyIcon: {
    width: 78,
    height: 78,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff0e9',
  },
  emptyTitle: {
    marginTop: 18,
    color: '#171717',
    fontSize: 18,
    fontWeight: '900',
  },
  emptyText: {
    maxWidth: 270,
    marginTop: 8,
    color: '#8f8f98',
    fontSize: 11,
    lineHeight: 17,
    textAlign: 'center',
  },
  actionButton: {
    height: 56,
    marginTop: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 18,
    backgroundColor: '#ff5a1f',
  },
  actionText: {
    marginLeft: 7,
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '900',
  },
});
