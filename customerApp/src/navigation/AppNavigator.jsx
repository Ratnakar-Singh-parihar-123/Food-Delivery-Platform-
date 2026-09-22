import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import SplashScreen from '../screens/SplashScreen';
import PhoneLoginScreen from '../screens/PhoneLoginScreen';
import OtpVerificationScreen from '../screens/OtpVerificationScreen';
import CustomerHomeScreen from '../screens/CustomerHomeScreen';
import MainTabs from '../navigation/MainTabs';
import TrackOrderScreen from '../screens/TrackOrderScreen';
import { PROFILE_STACK_SCREENS } from './ProfileStackScreens';
import PaymentMethodScreen from '../screens/PaymentMethodScreen';
import PaymentSuccessScreen from '../screens/PaymentSuccessScreen';
import CategoryItemsScreen from '../screens/Category/CategoryItemsScreen';
import SeeAllScreen from '../screens/Category/SeeAllScreen';
import ItemDetailScreen from '../screens/Category/ItemDetailScreen';
import CustomerProfile from '../screens/profile/CustomerProfile';
import CheckoutScreen from '../screens/profile/CheckoutScreen';
import NearbyVendorsScreen from '../screens/vendor/NearbyVendorsScreen';
import VendorDetailScreen from '../screens/vendor/VendorDetailScreen';
import PopularFoodsScreen from '../screens/PopularFoodsScreen';
import FastDeliveryScreen from '../screens/FastDeliveryScreen';
import ExploreScreen from '../screens/Category/ExploreScreen';
import SelectAddressScreen from '../screens/SelectAddressScreen';
import OrderSummaryScreen from '../screens/OrderSummaryScreen';
import PopularFoodsNearScreen from '../screens/PopularFoods/PopularFoodsNearScreen';
import AllCategoriesScreen from '../screens/Category/AllCategoriesScreen';
import FastDeliveryListScreen from '../screens/FastDelivery/FastDeliveryListScreen';
import VendorMenuScreen from '../screens/vendor/VendorMenuScreen';
import TiffinHousesListScreen from '../screens/HouseTiffin/TiffinHousesListScreen';
const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  return (
    <Stack.Navigator
      initialRouteName="Splash"
      screenOptions={{ headerShown: false }}
    >
      <Stack.Screen name="Splash" component={SplashScreen} />
      <Stack.Screen name="PhoneLogin" component={PhoneLoginScreen} />
      <Stack.Screen name="OtpVerification" component={OtpVerificationScreen} />
      <Stack.Screen name="AllCategories" component={AllCategoriesScreen} />
      <Stack.Screen
        name="FastDeliveryList"
        component={FastDeliveryListScreen}
      />
      {/* This name must exactly match the reset route */}
      <Stack.Screen name="CustomerHome" component={CustomerHomeScreen} />
      <Stack.Screen name="MainTabs" component={MainTabs} />
      <Stack.Screen name="TrackOrder" component={TrackOrderScreen} />
      <Stack.Screen
        name="PaymentMethod"
        component={PaymentMethodScreen}
        options={{ headerShown: false }}
      />

      <Stack.Screen
        name="PaymentSuccess"
        component={PaymentSuccessScreen}
        options={{
          headerShown: false,
          gestureEnabled: false,
        }}
      />
      <Stack.Screen name="CategoryItems" component={CategoryItemsScreen} />
      <Stack.Screen name="SeeAll" component={SeeAllScreen} />
      <Stack.Screen name="ItemDetail" component={ItemDetailScreen} />
      <Stack.Screen name="CustomerProfile" component={CustomerProfile} />
      <Stack.Screen name="Checkout" component={CheckoutScreen} />
      <Stack.Screen name="NearbyVendors" component={NearbyVendorsScreen} />
      <Stack.Screen name="VendorDetail" component={VendorDetailScreen} />
      <Stack.Screen name="PopularFoods" component={PopularFoodsScreen} />
      <Stack.Screen name="FastDelivery" component={FastDeliveryScreen} />
      {/* <Stack.Screen name="Explore" component={ExploreScreen} /> */}
      <Stack.Screen name="SelectAddress" component={SelectAddressScreen} />
      <Stack.Screen name="OrderSummary" component={OrderSummaryScreen} />
      <Stack.Screen name="ExploreScreen" component={ExploreScreen} />
      <Stack.Screen name="VendorMenuScreen" component={VendorMenuScreen} />
      <Stack.Screen
        name="TiffinHousesListScreen"
        component={TiffinHousesListScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="PopularFoodsNear"
        component={PopularFoodsNearScreen}
      />
      {PROFILE_STACK_SCREENS.map(screen => (
        <Stack.Screen
          key={screen.name}
          name={screen.name}
          component={screen.component}
          options={{
            animation: 'slide_from_right',
          }}
        />
      ))}
    </Stack.Navigator>
  );
}
