import React from 'react';

import { StyleSheet, View } from 'react-native';

import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import CustomerHomeScreen from '../screens/CustomerHomeScreen';
import SearchScreen from '../screens/SearchScreen';
import OrdersScreen from '../screens/OrdersScreen';
import ProfileScreen from '../screens/profile/ProfileScreen';
import FloatingCartBar from '../screens/FloatingCartBar';

import BottomTabBar from '../components/BottomTabBar';

const Tab = createBottomTabNavigator();
const TAB_ICONS = {
  Home: ['home', 'home-outline'],
  Search: ['search', 'search-outline'],
  Orders: ['receipt', 'receipt-outline'],
  Profile: ['person', 'person-outline'],
};

export default function MainTabs() {
  return (
    <View style={styles.container}>
      <Tab.Navigator
        initialRouteName="Home"
        screenOptions={{
          headerShown: false,
          lazy: true,
        }}
        tabBar={props => <BottomTabBar {...props} />}
      >
        <Tab.Screen name="Home" component={CustomerHomeScreen} />
        <Tab.Screen name="Search" component={SearchScreen} />
        <Tab.Screen name="Orders" component={OrdersScreen} />
        <Tab.Screen name="Profile" component={ProfileScreen} />
      </Tab.Navigator>
      <FloatingCartBar />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  tabBar: {
    height: 70,
    paddingTop: 7,
    paddingBottom: 8,
    borderTopWidth: 1,
    borderTopColor: '#eee5df',
    backgroundColor: '#ffffff',
  },
  tabLabel: {
    fontSize: 9,
    fontWeight: '800',
  },
});
